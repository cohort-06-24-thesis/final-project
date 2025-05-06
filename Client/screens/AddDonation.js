import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Camera } from 'expo-camera';
import { API_BASE } from '../config'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddDonation({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
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
  console.log(Uid)


  const handleImagePick = async () => {
    const options = [
      { text: 'Open Camera', onPress: openCamera },
      { text: 'Open Photos', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert('Upload Image', 'Choose an option:', options);
  };

  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Media library access is required to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location || !image) {
      Alert.alert('Error', 'Please fill in all fields and upload an image.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/donationItems/addItem`, {
        title,
        description,
        location,
        image: [image],
        UserId: Uid
      });
      Alert.alert('Success', 'Donation item added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding donation item:', error);
      Alert.alert('Error', 'Failed to add donation item. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Donation Item</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
        />
        <TextInput
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={40} color="#666" />
            <Text style={styles.imagePlaceholderText}>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    width: 200,
    height: 200,
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholderText: {
    marginTop: 10,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});