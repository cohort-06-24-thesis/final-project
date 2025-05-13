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
  Modal,
  TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE } from '../config';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function OtherUser({ route, navigation }) {
  const { userId } = route.params; // Get the userId from navigation params
  const [user, setUser] = useState(null);
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
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Get user data
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

        // Calculate activity counts for this user
        const userDonations = donations.data?.filter(item => item.UserId === userId) || [];
        const userEvents = events.data?.data?.filter(event => event.UserId === userId) || [];
        const userCampaigns = campaigns.data?.filter(campaign => campaign.UserId === userId) || [];
        const userInNeeds = inNeeds.data?.filter(need => need.UserId === userId) || [];

        setStats({
          donations: userDonations.length,
          events: userEvents.length,
          campaigns: userCampaigns.length,
          inNeeds: userInNeeds.length
        });

        // Create recent activity
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
        .sort((a, b) => new Date(b.date) - new Date(a.date));

        setUser(prev => ({
          ...prev,
          totalHelped: userDonations.length + userEvents.length + userCampaigns.length,
          recentActivity
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Could not load user profile data');
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    try {
      const finalReason = reportReason === 'other' ? customReason : reportReason;
      
      if (!finalReason) {
        Alert.alert('Error', 'Please select or enter a reason for reporting');
        return;
      }

      const currentUserId = await AsyncStorage.getItem('userUID');
      if (!currentUserId) {
        Alert.alert('Error', 'You must be logged in to report a user');
        return;
      }

      await axios.post(`${API_BASE}/report/createReport`, {
        reason: finalReason,
        userId: currentUserId,
        reportedUserId: userId,
        itemType: 'user'
      });

      Alert.alert('Success', 'Thank you for your report. We will review it shortly.');
      setReportModalVisible(false);
      setReportReason('');
      setCustomReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  const StatCard = ({ icon, label, value }) => (
    <View style={styles.statCard}>
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
    </View>
  );

  const ActivityItem = ({ activity }) => (
    <View style={styles.activityItem}>
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
    </View>
  );

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
          </View>
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
      </LinearGradient>

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

      <View style={styles.recentActivity}>
        <View style={styles.activityHeader}>
          <View style={styles.activityHeaderLeft}>
            <MaterialCommunityIcons name="history" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
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
          </>
        ) : (
          <View style={styles.noActivityContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={50} color="#ccc" />
            <Text style={styles.noActivityText}>No recent activity</Text>
            <Text style={styles.noActivitySubtext}>This user hasn't made any activities yet</Text>
          </View>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => navigation.navigate('Chat', {
            recipientId: userId,
            recipientName: user?.name,
            recipientProfilePic: user?.profilePic
          })}
        >
          <MaterialCommunityIcons name="chat" size={24} color="#fff" />
          <Text style={styles.chatButtonText}>Send Message</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={() => setReportModalVisible(true)}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#FF6B6B" />
          <Text style={styles.reportButtonText}>Report User</Text>
        </TouchableOpacity>
      </View>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report User</Text>
            <Text style={styles.modalSubtitle}>Why are you reporting this user?</Text>

            <TouchableOpacity 
              style={[styles.reportOption, reportReason === 'inappropriate' && styles.reportOptionSelected]}
              onPress={() => setReportReason('inappropriate')}
            >
              <Text style={styles.reportOptionText}>Inappropriate Behavior</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.reportOption, reportReason === 'spam' && styles.reportOptionSelected]}
              onPress={() => setReportReason('spam')}
            >
              <Text style={styles.reportOptionText}>Spam or Scam</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.reportOption, reportReason === 'harassment' && styles.reportOptionSelected]}
              onPress={() => setReportReason('harassment')}
            >
              <Text style={styles.reportOptionText}>Harassment</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.reportOption, reportReason === 'other' && styles.reportOptionSelected]}
              onPress={() => setReportReason('other')}
            >
              <Text style={styles.reportOptionText}>Other</Text>
            </TouchableOpacity>

            {reportReason === 'other' && (
              <TextInput
                style={styles.customInput}
                placeholder="Please specify the reason"
                value={customReason}
                onChangeText={setCustomReason}
                multiline
              />
            )}

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={submitReport}
            >
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setReportModalVisible(false);
                setReportReason('');
                setCustomReason('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Keep all existing styles from UserProfile.js and add/modify these:
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
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
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  reportButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  reportOption: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  reportOptionSelected: {
    backgroundColor: '#FF6B6B15',
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  reportOptionText: {
    fontSize: 16,
    color: '#333',
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  }
});