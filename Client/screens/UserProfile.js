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
  Dimensions,
  Platform,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE } from '../config';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue 
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

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
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const sidebarAnimation = useSharedValue(-width); // Change from -500 to -width

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

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(scale.value) }]
    };
  });

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarAnimation.value }]
  }));

  const toggleSidebar = () => {
    if (isSidebarVisible) {
      sidebarAnimation.value = withSpring(-width);
    } else {
      sidebarAnimation.value = withSpring(0);
    }
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Update the StatCard component
const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCard}>
    <LinearGradient
      colors={['#ffffff', '#f8f9fa']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statGradient}
    >
      <View style={styles.statContent}>
        <View style={styles.statIconContainer}>
          <MaterialCommunityIcons name={icon} size={20} color="#4CAF50" />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </LinearGradient>
  </View>
);

  // Update the ActionButton component
const ActionButton = ({ icon, label, onPress, color = "#666", description }) => (
  <TouchableOpacity 
    style={styles.actionButton}
    onPress={onPress}
  >
    <View style={styles.actionInner}>
      <View style={[styles.actionIconWrapper, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.actionTexts}>
        <Text style={styles.actionLabel}>{label}</Text>
        {description && <Text style={styles.actionDescription}>{description}</Text>}
      </View>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
    const imageUrl = item.type === 'event' ? 
        (item.image || item.images?.[0] || 'https://via.placeholder.com/100') :
        (Array.isArray(item.image) ? item.image[0] : item.image || 'https://via.placeholder.com/100');

    return (
        <View style={styles.wishlistItem}>
            <Image 
                source={{ uri: imageUrl }}
                style={styles.wishlistImage}
            />
            <View style={styles.wishlistItemContent}>
                <Text style={styles.wishlistItemTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                {item.location && (
                    <Text style={styles.wishlistItemLocation} numberOfLines={1}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        {" "}{item.location}
                    </Text>
                )}
                {item.type === 'event' && item.date && (
                    <Text style={styles.wishlistItemDetail}>
                        <Ionicons name="calendar-outline" size={14} color="#666" />
                        {" "}{new Date(item.date).toLocaleDateString()}
                    </Text>
                )}
            </View>
            <TouchableOpacity 
                style={styles.removeWishlistButton}
                onPress={() => handleRemoveFromWishlist(item.favoriteId)}
            >
                <Ionicons name="heart" size={20} color="#FF6B6B" />
            </TouchableOpacity>
        </View>
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
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.headerGradient}
        >
          {/* Add the settings button here */}
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={toggleSidebar}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>

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
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((activity, index) => (
                    <ActivityItem key={index} activity={activity} />
                  ))}
              </View>

              {user.recentActivity.length > ITEMS_PER_PAGE && (
                <View style={styles.paginationControls}>
                  <TouchableOpacity 
                    style={[
                      styles.paginationButton,
                      currentPage === 1 && styles.paginationButtonDisabled
                    ]}
                    onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <Ionicons 
                      name="chevron-back" 
                      size={20} 
                      color={currentPage === 1 ? '#ccc' : '#4CAF50'} 
                    />
                  </TouchableOpacity>

                  <Text style={styles.paginationText}>
                    {currentPage} of {Math.ceil(user.recentActivity.length / ITEMS_PER_PAGE)}
                  </Text>

                  <TouchableOpacity 
                    style={[
                      styles.paginationButton,
                      currentPage >= Math.ceil(user.recentActivity.length / ITEMS_PER_PAGE) && 
                      styles.paginationButtonDisabled
                    ]}
                    onPress={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(user.recentActivity.length / ITEMS_PER_PAGE)}
                  >
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={currentPage >= Math.ceil(user.recentActivity.length / ITEMS_PER_PAGE) ? '#ccc' : '#4CAF50'} 
                    />
                  </TouchableOpacity>
                </View>
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
      </ScrollView>

      {/* Move the sidebar OUTSIDE of the main ScrollView */}
      <Animated.View style={[styles.sidebar, sidebarStyle]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Settings</Text>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.sidebarContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={styles.settingsGroup}>
            <Text style={styles.groupLabel}>Profile</Text>
            <ActionButton
              icon="person-outline"
              label="Edit Profile"
              description="Update your personal information"
              onPress={() => {
                toggleSidebar();
                navigation.navigate('EditProfile');
              }}
              color="#4CAF50"
            />
          </View>

          <View style={styles.settingsGroup}>
            <Text style={styles.groupLabel}>Support</Text>
            <ActionButton
              icon="help-circle-outline"
              label="Help Center"
              description="Get help and support"
              onPress={() => {
                toggleSidebar();
                navigation.navigate('HelpCenter'); // Add this navigation
              }}
              color="#7E57C2"
            />
          </View>

          <View style={styles.settingsGroup}>
            <Text style={styles.groupLabel}>Account</Text>
            <ActionButton
              icon="log-out-outline"
              label="Logout"
              description="Sign out from your account"
              onPress={() => {
                toggleSidebar();
                handleLogout();
              }}
              color="#FF5252"
            />
          </View>
        </ScrollView>
      </Animated.View>

      {isSidebarVisible && (
        <TouchableWithoutFeedback onPress={toggleSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: {
    alignItems: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 15,
  },
  imageGradientBorder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 3,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 20,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCard: {
    flex: 1,
    height: 90,
    marginHorizontal: 4,
  },
  statGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 8,
  },
  statContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
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
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTexts: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentActivity: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
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
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 3,
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
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  paginationButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  paginationText: {
    color: '#444',
    fontSize: 15,
    fontWeight: '600',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 20,
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
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    elevation: 4,
  },
  wishlistContainer: {
    paddingVertical: 16,
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    padding: 12,
    width: 300,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wishlistImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 14,
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
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishlistItemDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
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
  paginationSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 4,
  },
  pageNumber: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activePageNumber: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  pageNumberText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  activePageNumberText: {
    color: '#fff',
  },
  settingsWrapper: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  settingsContainer: {
    padding: 20,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsGroup: {
    marginTop: 24,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.85,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sidebarContent: {
    flex: 1,
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    zIndex: 100,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
});