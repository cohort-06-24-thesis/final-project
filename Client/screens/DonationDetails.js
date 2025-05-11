import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { API_BASE } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DonationDetails({ route, navigation }) {
  const { item: initialItem } = route.params;
  const [item, setItem] = useState(initialItem);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/donationItems/${initialItem.id}`);
        console.log('Fetched item details:', response.data); // Debug log
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [initialItem.id]);

  useEffect(() => {
    const loadUserId = async () => {
      const storedUid = await AsyncStorage.getItem('userUID');
      setCurrentUserId(storedUid);
    };
    loadUserId();
  }, []);

  const handleFavorite = () => {
    console.log('Added to favorites');
  };

  const handleReport = () => {
    setReportModalVisible(true);
  };

  const submitReport = async () => {
    try {
      const finalReason = reportReason === 'other' ? customReason : reportReason;
      
      if (!finalReason) {
        Alert.alert('Error', 'Please select or enter a reason for reporting');
        return;
      }
      
      if (!currentUserId) {
        Alert.alert('Error', 'You must be logged in to report an item');
        return;
      }

      // Send report to backend with proper data structure
      await axios.post(`${API_BASE}/report/createReport`, {
        reason: finalReason,
        userId: currentUserId,  // Send as is since the model expects STRING
        itemId: item.id,        // Send as is since it will be coerced to INTEGER
        itemType: 'donation'
      });
      
      Alert.alert('Success', 'Thank you for your report. We will review it shortly.');
      setReportModalVisible(false);
      setReportReason('');
      setCustomReason('');
    } catch (error) {
      console.error('Error submitting report:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const handleContact = () => {
    if (item?.User) {
      navigation.navigate('Chat', {
        recipientId: item.User.id,
        recipientName: item.User.name,
        recipientProfilePic: item.User.profilePic,
        itemTitle: item.title
      });
    } else {
      console.log('User information not available');
    }
  };

  const handleClaim = async () => {
    try {
      await axios.put(`${API_BASE}/donationItems/claim/${item.id}`);
      // Refresh the item details to get the updated status
      const response = await axios.get(`${API_BASE}/donationItems/${item.id}`);
      setItem(response.data);
      // Add some feedback for the user
      Alert.alert('Success', 'Item has been marked as claimed');
    } catch (error) {
      console.error('Error claiming item:', error);
      Alert.alert('Error', 'Failed to claim item');
    }
  };

  return (
    <View style={styles.container}>
      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredView}
          keyboardVerticalOffset={80}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Report Item</Text>
              <Text style={styles.modalSubtitle}>Why are you reporting this item?</Text>
              
              <TouchableOpacity 
                style={[styles.reasonButton, reportReason === 'inappropriate' && styles.selectedReason]}
                onPress={() => setReportReason('inappropriate')}
              >
                <Text style={styles.reasonText}>Inappropriate content</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.reasonButton, reportReason === 'spam' && styles.selectedReason]}
                onPress={() => setReportReason('spam')}
              >
                <Text style={styles.reasonText}>Spam or misleading</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.reasonButton, reportReason === 'duplicate' && styles.selectedReason]}
                onPress={() => setReportReason('duplicate')}
              >
                <Text style={styles.reasonText}>Duplicate listing</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.reasonButton, reportReason === 'other' && styles.selectedReason]}
                onPress={() => setReportReason('other')}
              >
                <Text style={styles.reasonText}>Other reason</Text>
              </TouchableOpacity>
              
              {reportReason === 'other' && (
                <TextInput
                  style={styles.customReasonInput}
                  placeholder="Please specify your reason"
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  numberOfLines={3}
                />
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setReportModalVisible(false);
                    setReportReason('');
                    setCustomReason('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={submitReport}
                >
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      
      <ScrollView style={styles.scrollContainer}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image?.[0] || 'https://via.placeholder.com/150' }}
            style={styles.image}
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          {/* Add this status badge */}
          <View style={styles.statusBadgeContainer}>
            <Text 
              style={[
                styles.statusBadge,
                { backgroundColor: item.status === 'claimed' ? '#666' : '#4CAF50' }
              ]}
            >
              {item.status === 'claimed' ? 'Claimed' : 'Available'}
            </Text>
          </View>
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
          {/* Map Section */}
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() => navigation.navigate('FullScreenMap', {
              latitude: item.latitude,
              longitude: item.longitude,
              title: item.title,
              location: item.location,
            })}
          >
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: item.latitude || 48.8566,
                longitude: item.longitude|| 2.3522,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01 ,
              }}
            >
              <Marker
                coordinate={{
                  latitude: item.latitude || 48.8566,
                  longitude: item.longitude || 2.3522,
                }}
                title={item.title}
                description={item.location}
              />
            </MapView>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Fixed User Details Section */}
      <View style={styles.userContainer}>
        <Image 
          source={{ uri: item?.User?.profilePic || 'https://via.placeholder.com/100' }}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item?.User?.name || 'Anonymous'}</Text>
          <Text style={styles.userRating}>⭐ {item?.User?.rating || '0.0'}</Text>
        </View>
        {String(item?.User?.id) === String(currentUserId) ? (
          <TouchableOpacity 
            style={[
              styles.contactButton, 
              { backgroundColor: item.status === 'claimed' ? '#666' : '#4CAF50' }
            ]}
            onPress={handleClaim}
            disabled={item.status === 'claimed'}
          >
            <Text style={styles.contactButtonText}>
              {item.status === 'claimed' ? 'Claimed' : 'Mark as Claimed'}
            </Text>
            <Ionicons 
              name={item.status === 'claimed' ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={18} 
              color="#fff" 
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.contactButton,
              { backgroundColor: item.status === 'claimed' ? '#666' : '#EFD13D' }
            ]} 
            onPress={handleContact}
            disabled={item.status === 'claimed'}
          >
            <Text style={styles.contactButtonText}>
              {item.status === 'claimed' ? 'Item Claimed' : 'Contact'}
            </Text>
            {item.status === 'claimed' && (
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 15,
    color: '#666',
    textAlign: 'center',
  },
  reasonButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedReason: {
    backgroundColor: '#e6f7ff',
    borderColor: '#1890ff',
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  customReasonInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 10,
    minWidth: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#EFD13D',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 80, // Leave space for the fixed user bar
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusBadge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
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
  map: { 
    flex: 1 
  },
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
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRating: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    flexDirection: 'row', // Add this to align text and icon
    alignItems: 'center', // Add this to center vertically
    backgroundColor: '#EFD13D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6, // Add this to create space between text and icon
  },
});