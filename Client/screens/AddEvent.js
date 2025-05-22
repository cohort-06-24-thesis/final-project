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
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Create New Event</Text>

      <View style={styles.inputContainer}>
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
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
          <Text style={styles.imagePickerButtonText}>Pick an image</Text>
        </TouchableOpacity>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  inputContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePickerButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  }
});