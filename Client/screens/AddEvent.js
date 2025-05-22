import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config'; // Import the API base URL from config
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AddEvent({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [participators, setParticipators] = useState('');
  const [images, setImages] = useState('');
  const [date, setDate] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [Uid, setUid] = useState('');

  useEffect(() => {
    const loadUid = async () => {
      const storedUid = await AsyncStorage.getItem('userUID');
      if (storedUid) {
        setUid(storedUid);
      } else {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        navigation.goBack();
      }
    };
    loadUid();
  }, []);

  useEffect(() => {
    (async () => {
      // Request both media library and camera permissions
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      
      if (galleryStatus.status !== 'granted' || cameraStatus.status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera and gallery permissions to make this work!');
      }
    })();
  }, []);

  const pickImage = async () => {
    // Show action sheet to choose between camera and gallery
    Alert.alert(
      "Choose Image Source",
      "Would you like to take a photo or choose from gallery?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Take Photo",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
              setImages(result.assets[0].uri);
            }
          }
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled) {
              setImageUri(result.assets[0].uri);
              setImages(result.assets[0].uri);
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !participators || !date) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const eventData = {
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        participators: parseInt(participators),
        images: images ? [images] : [],
        status: 'upcoming',
        UserId: Uid,
      };

      console.log('Sending event data:', eventData);

      // Use API_BASE instead of hardcoded URL
      const response = await axios.post(`${API_BASE}/event/addEvent`, eventData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // Increased timeout
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept all responses for better error handling
        }
      });

      console.log('Server response:', response.data);

      if (response.data.success) {
        Alert.alert('Success', 'Event created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      
      let errorMessage = 'Failed to create event';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout - Please check your internet connection and try again';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - Please check your internet connection';
      } else if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response from server - Please check your connection and server status';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Logo placeholder */}
          </View>
          <Text style={styles.headerTitle}>Create New Event</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
          />

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter event description"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="Enter date (e.g., 2024-05-01)"
          />

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter event location"
          />

          <Text style={styles.label}>Participators *</Text>
          <TextInput
            style={styles.input}
            value={participators}
            onChangeText={setParticipators}
            placeholder="Enter number of participators"
          />

          <Text style={styles.label}>Event Image</Text>
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Ionicons name="image" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
              <Ionicons name="camera" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {imageUri && (
            <View style={styles.imagePreview}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.imageThumb} />
                <TouchableOpacity style={styles.imageRemoveButton}>
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Create Event</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          {/* Footer text placeholder */}
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