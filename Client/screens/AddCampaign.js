import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { API_BASE } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddCampaign() {
  const navigation = useNavigation();
  const [Uid, setUid] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    images: [],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  useEffect(() => {
    const loadUid = async () => {
      const storedUid = await AsyncStorage.getItem('userUID');
      if (storedUid) {
        setUid(storedUid);
        setFormData(prev => ({ ...prev, UserId: storedUid }));
      } else {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        navigation.goBack();
      }
    };
    loadUid();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri]
      }));
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission denied', 'Camera access is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri]
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.goal) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/campaignDonation`, formData);
      Alert.alert('Success', 'Campaign created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating campaign:', error);
      Alert.alert('Error', 'Failed to create campaign');
    }
  };

  return (
    <ScrollView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Add your logo component here */}
          </View>
          <Text style={styles.headerTitle}>Add Campaign</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Campaign Title*</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Enter campaign title"
          />

          <Text style={styles.sectionTitle}>Description*</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Enter campaign description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.sectionTitle}>Goal Amount*</Text>
          <TextInput
            style={styles.input}
            value={formData.goal}
            onChangeText={(text) => setFormData(prev => ({ ...prev, goal: text }))}
            placeholder="Enter goal amount"
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>Campaign Images</Text>
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Ionicons name="image" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={styles.imagePreview}>
            {formData.images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image
                  source={{ uri }}
                  style={styles.imageThumb}
                />
                <TouchableOpacity style={styles.imageRemoveButton}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Create Campaign</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          {/* Add your footer text here */}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00C44F',
  },
  formCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#444',
  },
  required: {
    color: 'red',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageHelper: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginRight: 10,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  imageRemoveButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#00C44F',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 13,
  },
});