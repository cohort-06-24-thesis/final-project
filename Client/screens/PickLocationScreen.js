import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function PickLocationScreen({ route, navigation }) {
  const { initialLatitude, initialLongitude } = route.params;
  const [selectedCoords, setSelectedCoords] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });
  const [region, setRegion] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleMapPress = (e) => {
    const coords = e.nativeEvent.coordinate;
    setSelectedCoords(coords);
    setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoading(false);
        return;
      }
      const locationObj = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = {
        latitude: locationObj.coords.latitude,
        longitude: locationObj.coords.longitude,
      };
      setSelectedCoords(coords);
      setRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    navigation.goBack();
    navigation.navigate(route.params.returnScreen || 'AddDonation', {
      pickedLatitude: selectedCoords.latitude,
      pickedLongitude: selectedCoords.longitude,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRightIconContainer}>
        <Ionicons
          name={isLoading ? 'locate' : 'locate-outline'}
          size={30}
          color={isLoading ? '#aaa' : '#00C44F'}
          onPress={isLoading ? undefined : handleCurrentLocation}
          style={styles.locateIcon}
        />
      </View>
      <Text style={styles.header}>Pick Location</Text>
      <MapView
        style={styles.map}
        region={region}
        onPress={handleMapPress}
      >
        <Marker coordinate={selectedCoords} />
      </MapView>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm Location</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color="#00C44F" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRightIconContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  locateIcon: {
    alignSelf: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 10,
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    backgroundColor: '#00C44F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
}); 