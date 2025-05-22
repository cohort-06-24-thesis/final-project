import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';

export default function DonationDetails({ route, navigation }) {
  const { item: initialItem } = route.params;
  const [item, setItem] = useState(initialItem);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

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
    const checkIfFavorited = async () => {
      try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) return;

        const response = await axios.get(`${API_BASE}/favourite/findAllFavourites/${userId}`);
        console.log('Favorites response:', response.data); // Debug log
        
        const favorites = response.data;
        const isFav = favorites.some(fav => 
          fav.itemId === item.id || fav.donationItemId === item.id
        );
        setIsFavorited(isFav);
      } catch (error) {
        console.error('Error checking favorite status:', error?.response?.data || error.message);
      }
    };

    if (item.id) {
      checkIfFavorited();
    }
  }, [item.id]);

  const handleFavorite = async () => {
    try {
      const userId = await AsyncStorage.getItem('userUID');
      if (!userId) {
        Alert.alert('Error', 'Please login to manage favorites');
        return;
      }

      if (isFavorited) {
        // Find the favorite first before deleting
        const favoritesResponse = await axios.get(`${API_BASE}/favourite/findAllFavourites/${userId}`);
        const favorite = favoritesResponse.data.find(fav => 
          fav.donationItemId === item.id
        );
        
        if (favorite) {
          await axios.delete(`${API_BASE}/favourite/deleteFavourite/${favorite.id}`);
          setIsFavorited(false);
          Alert.alert('Success', 'Item removed from wishlist');
        }
      } else {
        // Add to favorites
        const response = await axios.post(`${API_BASE}/favourite/createFavourite`, {
          userId,
          donationItemId: item.id,
          type: 'donation'
        });

        if (response.data) {
          setIsFavorited(true);
          Alert.alert('Success', 'Item added to wishlist');
        }
      }
    } catch (error) {
      console.error('Error managing favorites:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to update wishlist');
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

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await axios.put(`${API_BASE}/donationItems/${item.id}`, {
        ...item,
        status: newStatus
      });
      if (response.data) {
        setItem(prev => ({ ...prev, status: newStatus }));
        Alert.alert('Success', `Item marked as ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderStatusButton = () => {
    if (String(item?.User?.id) !== String(currentUserId)) {
      return null;
    }

    let buttonConfig = {
      text: '',
      onPress: () => {},
      style: {},
      icon: '',
      textColor: ''
    };

    switch (item.status) {
      case 'available':
        buttonConfig = {
          text: 'Mark as Reserved',
          onPress: () => handleStatusChange('reserved'),
          style: { 
            backgroundColor: '#FFC107',
            borderColor: '#FFC107',
            borderWidth: 2
          },
          icon: 'time-outline',
          textColor: '#fff'
        };
        break;
      case 'reserved':
        buttonConfig = {
          text: 'Mark as Claimed',
          onPress: () => handleStatusChange('claimed'),
          style: { 
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            borderWidth: 2
          },
          icon: 'checkmark-circle-outline',
          textColor: '#fff'
        };
        break;
      case 'claimed':
        buttonConfig = {
          text: 'Mark as Available',
          onPress: () => handleStatusChange('available'),
          style: { 
            backgroundColor: '#2196F3',
            borderColor: '#2196F3',
            borderWidth: 2
          },
          icon: 'refresh-outline',
          textColor: '#fff'
        };
        break;
      default:
        buttonConfig = {
          text: 'Mark as Available',
          onPress: () => handleStatusChange('available'),
          style: { 
            backgroundColor: '#2196F3',
            borderColor: '#2196F3',
            borderWidth: 2
          },
          icon: 'refresh-outline',
          textColor: '#fff'
        };
    }

    return (
      <TouchableOpacity 
        style={[styles.statusButton, buttonConfig.style]}
        onPress={buttonConfig.onPress}
      >
        <Text style={[styles.statusButtonText, { color: buttonConfig.textColor }]}>
          {buttonConfig.text}
        </Text>
        <Ionicons name={buttonConfig.icon} size={18} color={buttonConfig.textColor} />
      </TouchableOpacity>
    );
  };

  // Add useEffect to get current user ID when component mounts
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('userUID');
        setCurrentUserId(userId);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    getCurrentUser();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image?.[0] || 'https://via.placeholder.com/150' }}
            style={styles.image}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>

          {/* Status Badge */}
          {item.status && (
            <View style={styles.statusBadgeContainer}>
              <Text style={[
                styles.statusBadge,
                { backgroundColor: item.status === 'available' ? '#4CAF50' : item.status === 'reserved' ? '#FFC107' : '#FF5722' }
              ]}>
                {item.status?.toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorited ? "#FF6B6B" : "#666"} 
              />
              <Text style={[
                styles.actionButtonText,
                isFavorited && { color: "#FF6B6B" }
              ]}>
                Favorite
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map Section */}
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() => navigation.navigate('FullScreenMap', {
              latitude: item.latitude || 48.8566,
              longitude: item.longitude || 2.3522,
              title: item.title,
              location: item.location,
            })}
          >
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: item.latitude || 48.8566,
                longitude: item.longitude || 2.3522,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
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
        <TouchableOpacity
          onPress={() => {
            if (item?.User?.id && item.User.id.toString() === currentUserId.toString()) {
              navigation.navigate('UserProfile');
            } else if (item?.User?.id) {
              navigation.navigate('OtherUser', { userId: item.User.id });
            } else {
              Alert.alert("Error", "User ID is missing, cannot navigate to profile.");
            }
          }}
        >
          <Image 
            source={{ uri: item?.User?.profilePic || 'https://via.placeholder.com/100' }}
            style={styles.userImage}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => {
            if (String(item?.User?.id) === String(currentUserId)) {
              navigation.navigate('UserProfile');
            } else {
              navigation.navigate('OtherUser', { userId: item?.User?.id });
            }
          }}
        >
          <Text style={styles.userName}>{item?.User?.name || 'Anonymous'}</Text>
          {/* <Text style={styles.userRating}>⭐ {item?.User?.rating || '0.0'}</Text> */}
        </TouchableOpacity>
        
        {String(item?.User?.id) === String(currentUserId) ? (
          renderStatusButton()
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
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },
  map: {
    flex: 1,
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
    paddingVertical: 8, // Add padding for better touch area
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Darker color for better contrast
  },
  userRating: {
    fontSize: 14,
    color: '#666',
    marginTop: 2, // Add some space between name and rating
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#EFD13D',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactButtonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '600',
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
  fullScreenMap: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 80,
  },
});