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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { API_BASE } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      setLocationCoords({ latitude, longitude });
      setLocationStr(`${latitude}, ${longitude}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload single image to Cloudinary
  const uploadImageToCloudinary = async (uri) => {
    const data = new FormData();
    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    });
    data.append('upload_preset', 'firsttry'); // <-- Replace here

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dmp2fq2sb/image/upload', { // <-- Replace here
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (json.secure_url) {
        return json.secure_url;
      } else {
        throw new Error('Cloudinary upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !locationStr) {
      return Alert.alert('Missing Information', 'Please fill all required fields.');
    }

    if (images.length === 0) {
      return Alert.alert('No Images', 'Please add at least one image.');
    }

    setIsLoading(true);
    try {
      // Upload images to Cloudinary and collect URLs
      const uploadedImageUrls = [];
      for (const uri of images) {
        const url = await uploadImageToCloudinary(uri);
        uploadedImageUrls.push(url);
      }

      const payload = {
        title,
        description,
        location: locationStr,
        images: uploadedImageUrls,
        UserId: Uid,
      };

      await axios.post(`${API_BASE}/inNeed/create`, payload);

      Alert.alert(
        'Thank You!',
        'Your request has been submitted successfully and waiting approval from SADAKA. Your kindness will make a difference!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create request. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            const filtered = images.filter((_, i) => i !== index);
            setImages(filtered);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="hand-holding-heart" size={32} color="#00C44F" />
          </View>
          <Text style={styles.headerTitle}>Create Help Request</Text>
        </View>
        
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input} 
            value={title} 
            onChangeText={setTitle} 
            placeholder="What do you need help with?"
            placeholderTextColor="#a3a3a3"
          />

          <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Please describe your situation and what kind of help you need..."
            placeholderTextColor="#a3a3a3"
            multiline
          />

          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.label}>Pick Location <Text style={styles.required}>*</Text></Text>
          <View style={styles.mapContainer}>
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
              <Marker coordinate={locationCoords} pinColor="#00C44F" />
            </MapView>
          </View>

          {locationStr ? (
            <View style={styles.locationInfoContainer}>
              <Ionicons name="location" size={16} color="#00C44F" />
              <Text style={styles.locationInfo}>
                Selected: {locationStr}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={getCurrentLocation}
            disabled={isLoading}
          >
            <Ionicons name="locate" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Images</Text>
          <Text style={styles.imageHelper}>Add photos to help people understand your needs better</Text>
          
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity onPress={() => pickImage(false)} style={styles.iconButton}>
              <Ionicons name="images" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => pickImage(true)} style={styles.iconButton}>
              <Ionicons name="camera" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <View style={styles.imagePreview}>
              {images.map((uri, index) => (
                <TouchableOpacity 
                  key={index} 
                  onLongPress={() => removeImage(index)}
                  style={styles.imageContainer}
                >
                  <Image source={{ uri }} style={styles.imageThumb} />
                  <View style={styles.imageRemoveButton}>
                    <Ionicons name="close-circle" size={20} color="#f44336" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.submitText}>Submitting...</Text>
          ) : (
            <>
              <Ionicons name="heart" size={20} color="white" />
              <Text style={styles.submitText}>Submit Request</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Thank you for reaching out. Our community is here to help.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
//   container: {
//     padding: 20,
//     backgroundColor: 'white',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 24,
//     paddingVertical: 12,
//   },
//   logoContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#FFE97F',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginLeft: 12,
//     color: '#333333',
//   },
//   formCard: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#00C44F',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#F0F0F0',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#00C44F',
//     marginBottom: 12,
//     marginTop: 8,
//   },
//   label: {
//     fontWeight: '600',
//     marginBottom: 8,
//     fontSize: 16,
//     color: '#444444',
//   },
//   required: {
//     color: '#f44336',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#eeeeee',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     backgroundColor: '#F9F9F9',
//     marginBottom: 16,
//     color: '#333333',
//   },
//   textArea: {
//     height: 120,
//     textAlignVertical: 'top',
//   },
//   mapContainer: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: '#80ED99',
//   },
//   map: {
//     height: 200,
//   },
//   locationInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     paddingHorizontal: 4,
//   },
//   locationInfo: {
//     fontSize: 14,
//     color: '#444444',
//     marginLeft: 6,
//     flex: 1,
//   },
//   iconButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#00C44F',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   imageButtonsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     marginBottom: 16,
//     gap: 16,
//   },
//   imageHelper: {
//     fontSize: 14,
//     color: '#666666',
//     marginBottom: 12,
//   },
//   imagePreview: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 8,
//   },
//   imageContainer: {
//     position: 'relative',
//     marginRight: 12,
//     marginBottom: 12,
//   },
//   imageThumb: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   imageRemoveButton: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     backgroundColor: 'white',
//     borderRadius: 10,
//   },
//   submitButton: {
//     backgroundColor: '#00C44F',
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginTop: 16,
//     marginBottom: 16,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     shadowColor: '#00C44F',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   submitText: {
//     color: 'white',
//     fontWeight: '700',
//     fontSize: 18,
//     marginLeft: 8,
//   },
//   footerText: {
//     textAlign: 'center',
//     color: '#666666',
//     fontSize: 14,
//     marginBottom: 40,
//   }
// });
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
    elevation: 2, // for android shadow
    shadowColor: '#000', // for ios shadow
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
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  locationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationInfo: {
    marginLeft: 6,
    fontSize: 14,
    color: '#00C44F',
  },
  iconButton: {
    backgroundColor: '#00C44F',
    borderRadius: 40,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginRight: 10,
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