import React, { useState, useEffect } from 'react';
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
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { API_BASE } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

export default function AddDonation({ navigation, route }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationCoords, setLocationCoords] = useState({
    latitude: 36.8065, // Tunis default
    longitude: 10.1815,
  });
  const [locationStr, setLocationStr] = useState('');
  const [cityName, setCityName] = useState('');
  const [images, setImages] = useState([]);
  const [Uid, setUid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);

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

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const city = address.city || address.region || 'Unknown Location';
        setCityName(city);
        setLocationStr(city);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setLocationStr(`${latitude}, ${longitude}`);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (route?.params?.pickedLatitude && route?.params?.pickedLongitude) {
        const latitude = route.params.pickedLatitude;
        const longitude = route.params.pickedLongitude;
        setLocationCoords({
          latitude,
          longitude,
        });
        getAddressFromCoordinates(latitude, longitude);
        // Clear the params so it doesn't trigger again
        navigation.setParams({ pickedLatitude: undefined, pickedLongitude: undefined });
      }
    }, [route?.params?.pickedLatitude, route?.params?.pickedLongitude])
  );

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
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000,
        timeout: 5000
      });
      
      const { latitude, longitude } = location.coords;
      setLocationCoords({ latitude, longitude });
      getAddressFromCoordinates(latitude, longitude);
    } catch (error) {
      console.error('Location error:', error);
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
    data.append('upload_preset', 'firsttry');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dmp2fq2sb/image/upload', {
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
        image: uploadedImageUrls,
        UserId: Uid,
      };

      await axios.post(`${API_BASE}/donationItems/addItem`, payload);

      Alert.alert(
        'Thank You!',
        'Your donation has been submitted successfully and waiting approval from SADAKA. Your kindness will make a difference!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create donation. Please try again later.');
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="#00C44F" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <FontAwesome5 name="hand-holding-heart" size={32} color="#00C44F" />
          </View>
          <Text style={styles.headerTitle}>Create Donation</Text>
        </View>
        
        <View style={styles.formCard}>
          <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
          <TextInput 
            style={styles.input} 
            value={title} 
            onChangeText={setTitle} 
            placeholder="What are you donating?"
            placeholderTextColor="#a3a3a3"
          />

          <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Please describe your donation item..."
            placeholderTextColor="#a3a3a3"
            multiline
          />

          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.label}>Pick Location <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={styles.mapContainer}
            onPress={() => navigation.navigate('PickLocationScreen', {
              initialLatitude: locationCoords.latitude,
              initialLongitude: locationCoords.longitude,
              returnScreen: 'AddDonation',
            })}
          >
            <MapView
              style={styles.map}
              region={{
                ...locationCoords,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker coordinate={locationCoords} pinColor="#00C44F" />
            </MapView>
          </TouchableOpacity>

          {locationStr ? (
            <View style={styles.locationInfoContainer}>
              <Ionicons name="location" size={16} color="#00C44F" />
              <Text style={styles.locationInfo}>
                Selected: {locationStr}
              </Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Images</Text>
          <Text style={styles.imageHelper}>Add photos of your donation item</Text>
          
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity onPress={() => pickImage(false)} style={styles.iconButton}>
              <Ionicons name="images" size={24} color="black" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => pickImage(true)} style={styles.iconButton}>
              <Ionicons name="camera" size={24} color="black" />
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
              <Text style={styles.submitText}>Submit Donation</Text>
            </>
          )}
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Thank you for your generosity. Your donation will make a difference.
        </Text>
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    backgroundColor: '#FFFFFF',
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
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
    width: '70%',
    elevation: 2,
    shadowColor: '#00C44F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
    marginLeft: 8,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  locateButton: {
    padding: 8,
  },
  fullScreenMap: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 80,
  },
});