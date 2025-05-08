import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';
import axios from "axios"


export default function InNeedDetails({ route, navigation }) {
  const { item } = route.params;
  const [Uid, setUid] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [fulfilledMessage, setFulfilledMessage] = useState('');

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
 

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>InNeed item not found</Text>
      </View>
    );
  }

  const handleFavorite = () => {
    console.log('Added to favorites');
  };

  const handleReport = () => {
    console.log('Report item');
  };

  const handleContact = () => {
    if (item?.User) {
      navigation.navigate('Chat', {
        recipientId: item.User.id,
        recipientName: item.User.name,
        recipientProfilePic: item.User.profilePic,
        itemTitle: item.title,
      });
    } else {
      console.log('User information not available');
    }
  };

  const handleFulfilledSubmit = () => {
    Alert.alert(
      'Confirm Fulfillment',
      'Are you sure you want to mark this request as fulfilled?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
              ;
            setModalVisible(false);
  
            // Make the PUT request to update the item
            axios
              .put(`${API_BASE}/inNeed/${item.id}`, {
                isDone: true,
                doneReason: fulfilledMessage, // Include fulfilled message here
              })
              .then((response) => {
                console.log('Item updated:', response.data);
                // Handle success (e.g., update UI)
              })
              .catch((error) => {
                console.error('Error updating item:', error);
                // Handle error (e.g., show error message)
              });
          },
        },
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
            style={styles.image}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
              <Ionicons name="heart-outline" size={24} color="#666" />
              <Text style={styles.actionButtonText}>Favorite</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
              <Ionicons name="flag-outline" size={24} color="#666" />
              <Text style={styles.actionButtonText}>Report</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() =>
              navigation.navigate('FullScreenMap', {
                latitude: item.latitude,
                longitude: item.longitude,
                title: item.title,
                location: item.location,
              })
            }
          >
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: item.latitude || 0,
                longitude: item.longitude || 0,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: item.latitude || 0,
                  longitude: item.longitude || 0,
                }}
                title={item.title}
                description={item.location}
              />
            </MapView>
          </TouchableOpacity>
        </View>
      </ScrollView>

     
      <View style={styles.userContainer}>
        <Image
          source={{ uri: item?.User?.profilePic || 'https://via.placeholder.com/100' }}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item?.User?.name || 'Anonymous'}</Text>
          <Text style={styles.userRating}>⭐ {item?.User?.rating || '0.0'}</Text>
        </View>

        {/* Owner vs Non-owner button */}
        {String(item?.User?.id) !== String(Uid) ? (
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.fulfilledButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.fulfilledButtonText}>Fulfilled</Text>
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Fulfilled Modal */}
      {isModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.sectionTitle}>Write how it was fulfilled</Text>
            <TextInput
              style={styles.input}
              placeholder="Describe how your need was met..."
              value={fulfilledMessage}
              onChangeText={setFulfilledMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.modalSubmitButton} 
              onPress={handleFulfilledSubmit}
            >
              <Text style={styles.modalSubmitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 12 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 120 },
  imageContainer: { width: '100%', height: 300 },
  image: { width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 12 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoText: { marginLeft: 8, fontSize: 16, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 16,
  },
  actionButton: { alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { color: '#666', fontSize: 12, marginTop: 4 },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  map: { flex: 1 },
  userContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  userImage: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  userRating: { fontSize: 14, color: '#666' },
  contactButton: {
    backgroundColor: '#EFD13D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  contactButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'red',
    marginTop: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fulfilledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fulfilledButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  modalSubmitButton: {
    backgroundColor: '#4CAF50',  
    paddingVertical: 14,  
    paddingHorizontal: 40,  
    borderRadius: 30,  
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalSubmitButtonText: {
    color: '#fff',  
    fontSize: 16,  
    fontWeight: 'bold',
  },
});
