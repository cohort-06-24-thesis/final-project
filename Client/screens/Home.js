import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Animated,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE } from '../config';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 220;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 120 : 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function Home({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [inNeeds, setInNeeds] = useState([]);
  const [donationItems, setDonationItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = new Animated.Value(0);

  const fetchData = async () => {
    try {
      const [campaignRes, inNeedRes, donationRes, eventsRes] =
        await Promise.all([
          axios.get(`${API_BASE}/campaignDonation`),
          axios.get(`${API_BASE}/inNeed/all`),
          axios.get(`${API_BASE}/donationItems/getAllItems`),
          axios.get(`${API_BASE}/event/getAllEvents`),
        ]);
      setCampaigns(campaignRes.data || []);
      setInNeeds(inNeedRes.data || []);
      setDonationItems(donationRes.data || []);
      setEvents(eventsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setCampaigns([]);
      setInNeeds([]);
      setDonationItems([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const featuredItems = [
    {
      id: 1,
      title: "Campaigns",
      data: campaigns,
      icon: "hand-holding-heart",
      screen: "Campaign",
      color: "#FF6B6B",
      gradient: ['#FF6B6B', '#FF8E8E'],
    },
    {
      id: 2,
      title: "In Need",
      data: inNeeds,
      icon: "users",
      screen: "InNeed",
      color: "#4ECDC4",
      gradient: ['#4ECDC4', '#26A69A'],
    },
    {
      id: 3,
      title: "Donations",
      data: donationItems,
      icon: "heart",
      screen: "Donations",
      color: "#FFD166",
      gradient: ['#FFD166', '#FFC107'],
    },
    { 
      id: 4, 
      title: "Events", 
      data: events, 
      icon: "calendar-alt", 
      screen: "Events",
      color: "#9C27B0",
      gradient: ['#9C27B0', '#6A0572'],
    },
  ];

  // Animated header calculations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const headerContentOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderCampaignCard = (item, index) => {
    // Calculate progress percentage (mock data for demonstration)
    const progress = Math.random() * 100;
    const progressWidth = `${progress}%`;
    
    return (
      <TouchableOpacity
        key={item.id || index}
        style={styles.campaignCard}
        onPress={() => navigation.navigate("CampaignDetails", { campaign: item })}
      >
        <View style={styles.campaignImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.campaignImagePlaceholder}>
              <FontAwesome5 name="hand-holding-heart" size={24} color="#fff" />
            </View>
          )}
          {Math.random() > 0.7 && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
        </View>
        <View style={styles.campaignContent}>
          <Text style={styles.campaignTitle}>{item.title || "Untitled Campaign"}</Text>
          <Text style={styles.campaignDescription} numberOfLines={2}>
            {item.description || "No description available"}
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressText}>${Math.floor(Math.random() * 10000)} raised</Text>
              <Text style={styles.progressGoal}>of ${Math.floor(Math.random() * 20000) + 10000}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderInNeedCard = (item, index) => {
    return (
      <TouchableOpacity
        key={item.id || index}
        style={styles.inNeedCard}
        onPress={() => navigation.navigate("InNeedDetails", { item })}
      >
        <View style={styles.inNeedIconContainer}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={{ width: 45, height: 45, borderRadius: 22.5 }}
              resizeMode="cover"
            />
          ) : (
            <FontAwesome5 name="users" size={20} color="#4ECDC4" />
          )}
        </View>
        <View style={styles.inNeedContent}>
          <Text style={styles.inNeedTitle}>{item.title || "Untitled In-Need"}</Text>
          <Text style={styles.inNeedDescription} numberOfLines={2}>
            {item.description || "No description available"}
          </Text>
          <View style={styles.inNeedMeta}>
            <View style={styles.inNeedLocation}>
              <FontAwesome5 name="map-marker-alt" size={12} color="#666" style={{ marginRight: 4 }} />
              <Text style={styles.inNeedLocationText}>{item.location || "Unknown location"}</Text>
            </View>
            <TouchableOpacity style={styles.helpButton}>
              <Text style={styles.helpButtonText}>Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDonationItemCard = (item, index) => {
    return (
      <TouchableOpacity
        key={item.id || index}
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 16,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          minHeight: 240,
        }}
        onPress={() => navigation.navigate('DonationDetails', { item })}
      >
        <View style={{ width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
          {item.image && item.image.length > 0 ? (
            <Image
              source={{ uri: item.image[0] }}
              style={{ width: '100%', height: '100%', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.campaignImagePlaceholder, { borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '100%' }] }>
              <FontAwesome5 name="gift" size={24} color="#fff" />
            </View>
          )}
        </View>
        <View style={{ padding: 16, flex: 1, justifyContent: 'space-between' }}>
          <View>
            <Text style={[styles.campaignTitle, { marginBottom: 2 }]} numberOfLines={1}>{item.title || 'Untitled Item'}</Text>
            <Text style={[styles.campaignDescription, { marginBottom: 8 }]} numberOfLines={1}>{item.location || 'Unknown location'}</Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: item.status === 'available' ? '#4CAF50' : item.status === 'reserved' ? '#FF6B6B' : '#999',
              backgroundColor: item.status === 'available' ? 'rgba(76, 175, 80, 0.12)' : item.status === 'reserved' ? 'rgba(255, 107, 107, 0.12)' : 'rgba(153,153,153,0.10)',
              alignSelf: 'flex-start',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 10,
              overflow: 'hidden',
              marginTop: 4,
            }}
          >
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.View 
          style={[styles.headerContent, { opacity: headerContentOpacity, backgroundColor: '#00C44F', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }]}
        >
          <LottieView
            source={require('../assets/lottie.json')}
            autoPlay
            loop
            style={{ width: 300, height: 300, backgroundColor: 'transparent', alignSelf: 'center' }}
          />
        </Animated.View>
        {/* Compact header title (visible on scroll) */}
        <Animated.View 
          style={[styles.headerTitleContainer, { opacity: headerTitleOpacity }]}
        >
          <Text style={styles.headerTitle}>Sadaꓘa</Text>
        </Animated.View>
      </Animated.View>

      {/* Search Bar (visible only at top) */}
      <Animated.View
        style={[
          styles.searchContainer,
          { opacity: headerContentOpacity }
        ]}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campaigns, donations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#4CAF50"]}
            tintColor="#4CAF50"
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4CAF50"
            style={styles.loader}
          />
        ) : (
          <>
            {/* Stats Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 20, marginBottom: 20, marginTop: 10 }} contentContainerStyle={{ paddingRight: 20 }}>
              {featuredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.statCard}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statGradient}
                  >
                    <View style={styles.statIconContainer}>
                      <FontAwesome5 name={item.icon} size={12} color="#fff" />
                    </View>
                    <Text style={styles.statCount}>
                      {Array.isArray(item.data) ? item.data.length : 0}
                    </Text>
                    <Text style={styles.statTitle}>{item.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Featured Campaigns */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <FontAwesome5 name="star" size={16} color="#4CAF50" style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Featured Campaigns</Text>
                </View>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate("Campaign")}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <FontAwesome5 name="chevron-right" size={12} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.campaignsScrollContent}
              >
                {Array.isArray(campaigns) && campaigns.length > 0 ? (
                  campaigns.slice(0, 5).map((campaign, index) => renderCampaignCard(campaign, index))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <FontAwesome5 name="hand-holding-heart" size={40} color="#ddd" />
                    <Text style={styles.emptyStateText}>No campaigns available</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Donation Items */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <FontAwesome5 name="gift" size={16} color="#FFD166" style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Donation Items</Text>
                </View>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate("Donations")}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <FontAwesome5 name="chevron-right" size={12} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {Array.isArray(donationItems) && donationItems.length > 0 ? (
                  donationItems.slice(0, 4).map((item, index) => (
                    <View key={item.id || index} style={{ width: '48%', marginBottom: 20 }}>
                      {renderDonationItemCard(item, index)}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <FontAwesome5 name="gift" size={40} color="#ddd" />
                    <Text style={styles.emptyStateText}>No donation items available</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Recent In-Needs */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <FontAwesome5 name="users" size={16} color="#4ECDC4" style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>People In Need</Text>
                </View>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate("InNeed")}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <FontAwesome5 name="chevron-right" size={12} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              
              {Array.isArray(inNeeds) && inNeeds.length > 0 ? (
                inNeeds.slice(0, 3).map((inNeed, index) => renderInNeedCard(inNeed, index))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <FontAwesome5 name="users" size={40} color="#ddd" />
                  <Text style={styles.emptyStateText}>No in-needs available</Text>
                </View>
              )}
            </View>

            {/* Events Section (like Featured Campaigns) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <FontAwesome5 name="calendar-alt" size={16} color="#9C27B0" style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Events</Text>
                </View>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate("Events")}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <FontAwesome5 name="chevron-right" size={12} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.campaignsScrollContent}
              >
                {Array.isArray(events) && events.length > 0 ? (
                  events.slice(0, 5).map((event, index) => (
                    <TouchableOpacity
                      key={event.id || index}
                      style={styles.campaignCard}
                      onPress={() => navigation.navigate("Events")}
                    >
                      <View style={styles.campaignImageContainer}>
                        {event.images && event.images.length > 0 ? (
                          <Image
                            source={{ uri: event.images[0] }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.campaignImagePlaceholder}>
                            <FontAwesome5 name="calendar-alt" size={24} color="#fff" />
                          </View>
                        )}
                      </View>
                      <View style={styles.campaignContent}>
                        <Text style={styles.campaignTitle} numberOfLines={1}>{event.title || "Untitled Event"}</Text>
                        <Text style={styles.campaignDescription} numberOfLines={1}>{event.location || "Unknown location"}</Text>
                        <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                          {event.date ? new Date(event.date).toLocaleDateString() : "No date"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <FontAwesome5 name="calendar-alt" size={40} color="#ddd" />
                    <Text style={styles.emptyStateText}>No events available</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Impact Stats */}
            <View style={styles.impactSection}>
              <Text style={styles.impactTitle}>Your Impact</Text>
              <Text style={styles.impactSubtitle}>Together we're making a difference</Text>
              
              <View style={styles.impactStats}>
                <View style={styles.impactStatCard}>
                  <View style={[styles.impactIconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                    <FontAwesome5 name="hand-holding-usd" size={20} color="#FF6B6B" />
                  </View>
                  <Text style={styles.impactStatValue}>$120K+</Text>
                  <Text style={styles.impactStatLabel}>Funds Raised</Text>
                </View>
                
                <View style={styles.impactStatCard}>
                  <View style={[styles.impactIconContainer, { backgroundColor: 'rgba(78, 205, 196, 0.1)' }]}>
                    <FontAwesome5 name="users" size={20} color="#4ECDC4" />
                  </View>
                  <Text style={styles.impactStatValue}>5,000+</Text>
                  <Text style={styles.impactStatLabel}>People Helped</Text>
                </View>
                
                <View style={styles.impactStatCard}>
                  <View style={[styles.impactIconContainer, { backgroundColor: 'rgba(255, 209, 102, 0.1)' }]}>
                    <FontAwesome5 name="globe-americas" size={20} color="#FFD166" />
                  </View>
                  <Text style={styles.impactStatValue}>12+</Text>
                  <Text style={styles.impactStatLabel}>Countries</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  headerTitleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    backgroundColor: '#00C44F',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  welcomeText: {
    fontSize: 20,
    color: "rgba(255,255,255,0.95)",
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 1,
  },
  appName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.92)",
    textAlign: 'center',
    marginBottom: 0,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  searchContainer: {
    position: 'absolute',
    top: HEADER_MAX_HEIGHT - 25,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
    marginTop: HEADER_MAX_HEIGHT - 25,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loader: {
    marginTop: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: 120,
    height: 70,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    marginRight: 12,
  },
  statGradient: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 1,
  },
  statTitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginTop: 0,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 5,
  },
  campaignsScrollContent: {
    paddingRight: 20,
    paddingBottom: 10,
  },
  campaignCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  campaignImageContainer: {
    height: 140,
    position: 'relative',
  },
  campaignImagePlaceholder: {
    backgroundColor: '#4CAF50',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgentBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  urgentText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  campaignContent: {
    padding: 15,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  campaignDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  progressGoal: {
    fontSize: 13,
    color: '#666',
  },
  inNeedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inNeedIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  inNeedContent: {
    flex: 1,
  },
  inNeedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  inNeedDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  inNeedMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inNeedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inNeedLocationText: {
    fontSize: 12,
    color: '#666',
  },
  helpButton: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  helpButtonText: {
    color: '#4ECDC4',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
  },
  impactSection: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  impactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  impactSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  impactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactStatCard: {
    alignItems: 'center',
  },
  impactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  impactStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  impactStatLabel: {
    fontSize: 12,
    color: '#666',
  },
});