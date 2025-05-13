import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function UserProfile({ navigation }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    profilePic: '',
    joinDate: '',
    totalHelped: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    donations: 0,
    events: 0,
    campaigns: 0,
    inNeeds: 0
  });
  const [visibleActivities, setVisibleActivities] = useState(3);
  const [showingAllActivities, setShowingAllActivities] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchWishlistItems();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userUID');
      
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        navigation.replace('Login');
        return;
      }

      // First get basic user data
      const userResponse = await axios.get(`${API_BASE}/user/getById/${userId}`);
      
      if (userResponse.data) {
        setUser({
          ...userResponse.data,
          joinDate: new Date(userResponse.data.createdAt).toLocaleDateString(),
          totalHelped: 0,
          recentActivity: []
        });

        // Fetch stats in parallel
        const [donations, events, campaigns, inNeeds] = await Promise.all([
          axios.get(`${API_BASE}/donationItems/getAllItems`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/event/getAllEvents`).catch(() => ({ data: { data: [] } })),
          axios.get(`${API_BASE}/campaignDonation`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/inNeed/all`).catch(() => ({ data: [] }))
        ]);

        // Calculate activity counts
        const userDonations = donations.data?.filter(item => item.UserId === userId) || [];
        const userEvents = events.data?.data?.filter(event => event.UserId === userId) || [];
        const userCampaigns = campaigns.data?.filter(campaign => campaign.UserId === userId) || [];
        const userInNeeds = inNeeds.data?.filter(need => need.UserId === userId) || [];

        // Set stats
        setStats({
          donations: userDonations.length,
          events: userEvents.length,
          campaigns: userCampaigns.length,
          inNeeds: userInNeeds.length
        });

        // Create recent activity from existing data
        const recentActivity = [
          ...userDonations.map(d => ({
            type: 'donation',
            description: `Donated ${d.title}`,
            date: d.createdAt
          })),
          ...userEvents.map(e => ({
            type: 'event',
            description: `Created event: ${e.title}`,
            date: e.createdAt
          }))
        ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))

        // Update user with calculated data
        setUser(prev => ({
          ...prev,
          totalHelped: userDonations.length + userEvents.length + userCampaigns.length,
          recentActivity
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert(
        'Error',
        'Could not load some profile data. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistItems = async () => {
    try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) return;

        const favoritesResponse = await axios.get(`${API_BASE}/favourite/findAllFavourites/${userId}`);
        console.log('Raw favorites:', favoritesResponse.data);

        const wishlistDetails = await Promise.all(
            favoritesResponse.data.map(async (favorite) => {
                try {
                    // Use the nested data from the favorite response
                    if (favorite.donationItemId && favorite.DonationItem) {
                        return {
                            ...favorite.DonationItem,
                            id: favorite.id,
                            favoriteId: favorite.id,
                            donationItemId: favorite.donationItemId,
                            type: 'donation'
                        };
                    } 
                    else if (favorite.eventId && favorite.Event) {
                        return {
                            ...favorite.Event,
                            id: favorite.id,
                            favoriteId: favorite.id,
                            eventId: favorite.eventId,
                            type: 'event'
                        };
                    }
                    else if (favorite.inNeedId && favorite.InNeed) {
                        return {
                            ...favorite.InNeed,
                            id: favorite.id,
                            favoriteId: favorite.id,
                            inNeedId: favorite.inNeedId,
                            type: 'inNeed'
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Error processing favorite item:', error);
                    return null;
                }
            })
        );

        const validItems = wishlistDetails.filter(item => item !== null);
        console.log('Processed wishlist items:', validItems);
        setWishlistItems(validItems);
    } catch (error) {
        console.error('Error fetching wishlist:', error?.response?.data || error.message);
        setWishlistItems([]);
    }
};

  const handleRemoveFromWishlist = async (itemId) => {
    try {
        await axios.delete(`${API_BASE}/favourite/deleteFavourite/${itemId}`);
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        Alert.alert('Success', 'Item removed from wishlist');
    } catch (error) {
        console.error('Error removing from wishlist:', error?.response?.data || error.message);
        Alert.alert('Error', 'Failed to remove item from wishlist');
    }
};

  const addToWishlist = async (itemId, itemType) => {
    try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        const response = await axios.post(`${API_BASE}/favourite/createFavourite`, {
            userId,
            itemId,
            itemType
        });

        if (response.data) {
            await fetchWishlistItems();
            Alert.alert('Success', 'Item added to wishlist');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error?.response?.data || error.message);
        Alert.alert('Error', 'Failed to add item to wishlist');
    }
};

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userUID');
              navigation.replace('Login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to log out');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const StatCard = ({ icon, label, value }) => (
    <TouchableOpacity style={styles.statCard}>
      <LinearGradient
        colors={['rgba(76, 175, 80, 0.1)', 'rgba(76, 175, 80, 0.05)']}
        style={styles.statGradient}
      >
        <View style={styles.statIconContainer}>
          <MaterialCommunityIcons name={icon} size={22} color="#4CAF50" />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const ActionButton = ({ icon, label, onPress, color = "#666" }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.actionText, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={24} color={color} />
    </TouchableOpacity>
  );

  const ActivityItem = ({ activity }) => (
    <TouchableOpacity style={styles.activityItem}>
      <View style={styles.activityLeft}>
        <View style={styles.activityIconContainer}>
          <MaterialCommunityIcons 
            name={activity.type === 'donation' ? 'gift' : 'calendar'} 
            size={20} 
            color="#fff"
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>{activity.description}</Text>
          <Text style={styles.activityDate}>
            {new Date(activity.date).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const WishlistItem = ({ item }) => {
    // Get the correct image URL based on item type
    const imageUrl = item.type === 'event' ? 
        (item.image || item.images?.[0] || 'https://via.placeholder.com/100') :
        (Array.isArray(item.image) ? item.image[0] : item.image || 'https://via.placeholder.com/100');

    const getNavigationScreen = (type) => {
        switch(type) {
            case 'donation':
                return 'DonationDetails';
            case 'inNeed':
                return 'InNeedDetails';
            case 'event':
                return 'EventDetails';
            default:
                return 'DonationDetails';
        }
    };

    const handleNavigation = () => {
        const screen = getNavigationScreen(item.type);
        let navigationParams = {};

        switch(item.type) {
            case 'event':
                navigationParams = {
                    event: {
                        id: item.eventId,
                        title: item.title,
                        description: item.description,
                        images: item.images || [item.image],
                        location: item.location,
                        date: item.date,
                        participators: item.participators,
                        ...item // Include any other event-specific fields
                    }
                };
                break;
            case 'donation':
                navigationParams = {
                    item: {
                        id: item.donationItemId,
                        title: item.title,
                        image: item.image,
                        location: item.location,
                        ...item // Include any other donation-specific fields
                    }
                };
                break;
            case 'inNeed':
                navigationParams = {
                    item: {
                        id: item.inNeedId,
                        title: item.title,
                        images: Array.isArray(item.image) ? item.image : [item.image],
                        location: item.location,
                        ...item // Include any other inNeed-specific fields
                    }
                };
                break;
        }

        navigation.navigate(screen, navigationParams);
    };

    return (
        <TouchableOpacity 
            style={styles.wishlistItem}
            onPress={handleNavigation}
        >
            <Image 
                source={{ uri: imageUrl }}
                style={styles.wishlistImage}
            />
            <View style={styles.wishlistItemContent}>
                <Text style={styles.wishlistItemTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                {item.location && (
                    <Text style={styles.wishlistItemLocation} numberOfLines={1}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        {item.location}
                    </Text>
                )}
            </View>
            <TouchableOpacity 
                style={styles.removeWishlistButton}
                onPress={() => handleRemoveFromWishlist(item.favoriteId)}
            >
                <Ionicons name="heart" size={20} color="#FF6B6B" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={['#4CAF50', '#45a049', '#388E3C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.imageGradientBorder}
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: user?.profilePic || 'https://via.placeholder.com/150' }}
                  style={styles.profileImage}
                />
              </View>
            </LinearGradient>
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <LinearGradient
                colors={['#4CAF50', '#388E3C']}
                style={styles.editButtonGradient}
              >
                <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
            {user?.verified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-decagram" size={24} color="#4CAF50" />
              </View>
            )}
          </View>
          <Text style={styles.name}>{user?.name || 'Anonymous'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.rating}>{user?.rating?.toFixed(1) || '0.0'}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.bioSection}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>Profile Information</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar" size={18} color="#4CAF50" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoText}>{user?.joinDate}</Text>
              </View>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="people" size={18} color="#4CAF50" />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Impact</Text>
                <Text style={styles.infoText}>
                  Helped <Text style={styles.infoHighlight}>{user?.totalHelped}</Text> people
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <StatCard 
          icon="gift-outline" 
          label="Donations" 
          value={stats.donations} 
        />
        <StatCard 
          icon="calendar-outline" 
          label="Events" 
          value={stats.events} 
        />
        <StatCard 
          icon="bullhorn-outline" 
          label="Campaigns" 
          value={stats.campaigns} 
        />
        <StatCard 
          icon="hand-heart-outline" 
          label="In Needs" 
          value={stats.inNeeds} 
        />
      </View>

      <View style={styles.wishlistSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <MaterialCommunityIcons name="heart" size={24} color="#FF6B6B" />
            <Text style={styles.sectionTitle}>Your Wishlist</Text>
          </View>
        </View>
        
        {wishlistItems.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.wishlistContainer}
          >
            {wishlistItems.map((item) => (
              <WishlistItem key={item.id} item={item} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyWishlist}>
            <MaterialCommunityIcons name="heart-outline" size={40} color="#ddd" />
            <Text style={styles.emptyWishlistText}>Your wishlist is empty</Text>
          </View>
        )}
      </View>

      <View style={styles.recentActivity}>
        <View style={styles.activityHeader}>
          <View style={styles.activityHeaderLeft}>
            <MaterialCommunityIcons name="history" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Your Activity</Text>
          </View>
        </View>
        
        {user?.recentActivity?.length > 0 ? (
          <>
            <View style={styles.activityList}>
              {user.recentActivity
                .slice(0, showingAllActivities ? currentPage * ITEMS_PER_PAGE : visibleActivities)
                .map((activity, index) => (
                  <ActivityItem 
                    key={index} 
                    activity={activity}
                  />
                ))}
            </View>
            {!showingAllActivities && user.recentActivity.length > visibleActivities ? (
              <TouchableOpacity 
                style={styles.showMoreButton}
                onPress={() => {
                  setShowingAllActivities(true);
                  setCurrentPage(2); // Start with page 2 since we already show 3 items
                }}
              >
                <Text style={styles.showMoreButtonText}>
                  Show More ({user.recentActivity.length - visibleActivities} more)
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color="#4CAF50" />
              </TouchableOpacity>
            ) : showingAllActivities && (
              <>
                <View style={styles.paginationContainer}>
                  {currentPage > 1 && (
                    <TouchableOpacity 
                      style={styles.paginationButton}
                      onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      <MaterialCommunityIcons name="chevron-left" size={20} color="#4CAF50" />
                      <Text style={styles.paginationButtonText}>Previous</Text>
                    </TouchableOpacity>
                  )}
                  
                  {user.recentActivity.length > currentPage * ITEMS_PER_PAGE && (
                    <TouchableOpacity 
                      style={styles.paginationButton}
                      onPress={() => setCurrentPage(prev => prev + 1)}
                    >
                      <Text style={styles.paginationButtonText}>Next</Text>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={styles.showLessButton}
                  onPress={() => {
                    setShowingAllActivities(false);
                    setCurrentPage(1);
                  }}
                >
                  <Text style={styles.showMoreButtonText}>Show Less</Text>
                  <MaterialCommunityIcons name="chevron-up" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </>
            )}
          </>
        ) : (
          <View style={styles.noActivityContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={50} color="#ccc" />
            <Text style={styles.noActivityText}>No recent activity</Text>
            <Text style={styles.noActivitySubtext}>Your activities will appear here</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <ActionButton
          icon="person-outline"
          label="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
          color="#4CAF50"
        />
        <ActionButton
          icon="settings-outline"
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
          color="#5C6BC0"
        />
        <ActionButton
          icon="log-out-outline"
          label="Logout"
          onPress={handleLogout}
          color="#FF6B6B"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    alignItems: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  imageGradientBorder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    padding: 4,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imageWrapper: {
    backgroundColor: '#fff',
    borderRadius: 76,
    padding: 3,
    width: '100%',
    height: '100%',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 73,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  editButtonGradient: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: -20,
  },
  bioSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoContainer: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  infoHighlight: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 64) / 4,
    height: 90,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: '#fff',
  },
  statGradient: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  actionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentActivity: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activityList: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconContainer: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 13,
    color: '#666',
  },
  noActivityContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 12,
  },
  noActivityText: {
    color: '#495057',
    fontSize: 17,
    fontWeight: '600',
    marginTop: 16,
  },
  noActivitySubtext: {
    color: '#6c757d',
    fontSize: 15,
    marginTop: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  showMoreButtonText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  paginationButtonText: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 6,
  },
  showLessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  wishlistSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  wishlistContainer: {
    paddingVertical: 16,
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    padding: 8,
    width: 280,
    borderWidth: 1,
    borderColor: '#eee',
  },
  wishlistImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  wishlistItemContent: {
    flex: 1,
  },
  wishlistItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  wishlistItemLocation: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeWishlistButton: {
    padding: 8,
  },
  emptyWishlist: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 12,
  },
  emptyWishlistText: {
    color: '#495057',
    fontSize: 15,
    marginTop: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});