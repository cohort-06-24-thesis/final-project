import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, SafeAreaView, Dimensions, Animated } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function DonationDetails({ route, navigation }) {
  const { item: initialItem } = route.params;
  const [item, setItem] = useState(initialItem);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const scrollY = new Animated.Value(0);
  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.5, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

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
      console.error('Error updating item status:', error);
      Alert.alert('Error', 'Failed to update item status');
    }
  };

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'available':
        return 'reserved';
      case 'reserved':
        return 'claimed';
      case 'claimed':
        return 'available';
      default:
        return 'available';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'available':
        return '#4CAF50';
      case 'reserved':
        return '#FFC107';
      case 'claimed':
        return '#666';
      default:
        return '#4CAF50';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available':
        return 'Mark as Reserved';
      case 'reserved':
        return 'Mark as Claimed';
      case 'claimed':
        return 'Mark as Available';
      default:
        return 'Update Status';
    }
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
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image Section */}
        <View style={styles.imageContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={e => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {(Array.isArray(item.image) ? item.image : [item.image]).map((uri, index) => (
              <Image
                key={index}
                source={{ uri: uri || 'https://via.placeholder.com/300' }}
                style={{ width: width, height: 300 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          {/* Overlayed image indicator dots */}
          <View style={styles.dotsContainer}>
            {(Array.isArray(item.image) ? item.image : [item.image]).map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, currentImageIndex === idx && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.status === 'available' ? '#4CAF50' : item.status === 'reserved' ? '#FFC107' : '#FF5722' }
            ]}>
              <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="info-circle" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>About this item</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            <TouchableOpacity 
              style={[styles.wishlistButton, isFavorited && styles.wishlistButtonActive]} 
              onPress={handleFavorite}
            >
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorited ? "#fff" : "#FF6B6B"} 
              />
              <Text style={[
                styles.wishlistButtonText,
                isFavorited && { color: "#fff" }
              ]}>
                {isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <FontAwesome5 name="map-marker-alt" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
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
          <TouchableOpacity 
            style={[
              styles.contactButton, 
              { backgroundColor: getStatusColor(item.status) }
            ]}
            onPress={() => handleStatusChange(getNextStatus(item.status))}
          >
            <View style={styles.buttonContent}>
              <Ionicons 
                name={
                  item.status === 'available' ? "time-outline" :
                  item.status === 'reserved' ? "checkmark-circle-outline" :
                  "refresh-outline"
                } 
                size={18} 
                color="#fff" 
                style={styles.buttonIcon}
              />
              <Text style={styles.contactButtonText}>
                {getStatusText(item.status)}
              </Text>
            </View>
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
            <View style={styles.buttonContent}>
              <Ionicons 
                name={item.status === 'claimed' ? "checkmark-circle" : "chatbubble-outline"} 
                size={18} 
                color="#fff" 
                style={styles.buttonIcon}
              />
              <Text style={styles.contactButtonText}>
                {item.status === 'claimed' ? 'Item Claimed' : 'Contact'}
              </Text>
            </View>
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
    height: 300,
    width: width,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 32,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#444',
    flex: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    letterSpacing: 0.2,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  actionButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
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
  contactButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 120,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
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
  wishlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    marginTop: 16,
    alignSelf: 'center',
  },
  wishlistButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  wishlistButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginHorizontal: 4,
    transitionProperty: 'width,background-color',
    transitionDuration: '200ms',
  },
  activeDot: {
    backgroundColor: '#FFE97F',
    borderColor: '#FFE97F',
    borderWidth: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 4,
  },
});