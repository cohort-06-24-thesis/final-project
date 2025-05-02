
import React, { useState } from 'react';
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

export default function AddCampaign() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    images: [],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  });

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

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.goal) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.186:3000/api/campaignDonation', formData);
      Alert.alert('Success', 'Campaign created successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating campaign:', error);
      Alert.alert('Error', 'Failed to create campaign');
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
  

  return (
    <ScrollView style={styles.container}>
      {/* <Text style={styles.header}>Create New Campaign</Text> */}

      <View style={styles.formContainer}>
        <Text style={styles.label}>Campaign Title*</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          placeholder="Enter campaign title"
        />

        <Text style={styles.label}>Description*</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Enter campaign description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Goal Amount*</Text>
        <TextInput
          style={styles.input}
          value={formData.goal}
          onChangeText={(text) => setFormData(prev => ({ ...prev, goal: text }))}
          placeholder="Enter goal amount"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Campaign Images</Text>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
  <View style={styles.imageButtonContent}>
    <Ionicons name="image" size={24} color="white" />
    <Text style={styles.imageButtonText}>Add Image</Text>
  </View>
</TouchableOpacity>

        <View style={styles.imagePreviewContainer}>
          {formData.images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.imagePreview}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
  <View style={styles.imageButtonContent}>
    <Ionicons name="camera" size={24} color="white" />
    <Text style={styles.imageButtonText}>Take Photo</Text>
  </View>
</TouchableOpacity>


        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Campaign</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
// ... keep all the existing imports and component code ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 50,
    color: '#333',
  },
  formContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  // imageButton: {
  //   backgroundColor: '#4CAF50',
  //   padding: 12,
  //   borderRadius: 25,
  //   marginBottom: 20,
  // },
  // imageButtonContent: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   gap: 8,
  // },
  // imageButtonText: {
  //   color: 'white',
  //   fontSize: 16,
  //   fontWeight: 'bold',
  // },
  imageButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 30,
    width: '60%', 
  },
  imageButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
    width: '60%', 
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  }
});