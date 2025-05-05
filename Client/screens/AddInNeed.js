import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { API_BASE } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'

export default function AddInNeed({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationCoords, setLocationCoords] = useState({
    latitude: 36.8065, // Tunis default
    longitude: 10.1815,
  });
  const [locationStr, setLocationStr] = useState('');
  const [images, setImages] = useState([]);
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

  

  const pickImage = async (fromCamera = false) => {
    let result;

    if (fromCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission denied', 'Camera access is needed.');
      }
      result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission denied', 'Media access is needed.');
      }
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    }

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImages(prev => [...prev, uri]);
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permission denied', 'Location permission is required.');
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude } = location.coords;
    setLocationCoords({ latitude, longitude });
    setLocationStr(`${latitude}, ${longitude}`);
  };

  const handleSubmit = async () => {
    if (!title || !description || !locationStr) {
      return Alert.alert('Error', 'Please fill all required fields.');
    }
    // console.log(userId)

    const payload = {
      title,
      description,
      location: locationStr,
      images,
      UserId: Uid,
    };

    console.log("payload",payload);
    
    try {
      const res = await axios.post(`${API_BASE}/inNeed/create`,payload
      //    {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // }
    );

      // if (!res.ok) throw new Error('Error creating InNeed');

      Alert.alert('Success', 'In-Need created!');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create In-Need');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter title" />

      <Text style={styles.label}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
      />

      <Text style={styles.label}>Pick Location *</Text>
      <MapView
        style={styles.map}
        region={{
          ...locationCoords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setLocationCoords({ latitude, longitude });
          setLocationStr(`${latitude}, ${longitude}`);
        }}
      >
        <Marker coordinate={locationCoords} />
      </MapView>

      {locationStr ? (
        <Text style={{ fontSize: 14, color: '#555', marginBottom: 8 }}>
          Selected Location: {locationStr}
        </Text>
      ) : null}

      <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
        <Text style={styles.locationButtonText}>Use My Current Location</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Images</Text>
      <View style={styles.iconButtons}>
        <TouchableOpacity onPress={() => pickImage(false)} style={styles.iconBtn}>
          <Ionicons name="image" size={28} color="#007bff" />
          <Text style={styles.iconText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickImage(true)} style={styles.iconBtn}>
          <Ionicons name="camera" size={28} color="#007bff" />
          <Text style={styles.iconText}>Camera</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imagePreview}>
        {images.map((uri, index) => (
          <TouchableOpacity key={index} onLongPress={() => {
            const filtered = images.filter((_, i) => i !== index);
            setImages(filtered);
          }}>
            <Image source={{ uri }} style={styles.imageThumb} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  map: {
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
  },
  iconButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  iconBtn: {
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 4,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
