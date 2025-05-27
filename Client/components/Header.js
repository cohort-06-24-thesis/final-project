import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Modal, TouchableWithoutFeedback, Alert, TextInput } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { NotificationContext } from '../src/context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE } from '../config';

export default function Header({
  navigation,
  title = '',
  showProfile = true,
  showNotifications = true,
  leftIcon = null,
  onLeftIconPress = null,
}) {
  const { notifications } = useContext(NotificationContext) || {};
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [customReason, setCustomReason] = useState('');

  // Fetch user profile picture on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = await AsyncStorage.getItem('userUID');
        if (userId) {
          const response = await axios.get(`${API_BASE}/user/getById/${userId}`);
          setUserProfilePic(response.data.profilePic || null);
        }
      } catch (error) {
        setUserProfilePic(null);
      }
    };
    fetchUserProfile();
  }, []);

  // Compute unseen chat and notification counts
  const unseenChatCount = notifications ? notifications.filter(n => n.itemType === 'chat' && !n.isRead).length : 0;
  const unseenNotifCount = notifications ? notifications.filter(n => n.itemType !== 'chat' && !n.isRead).length : 0;

  const handleReportSubmit = async () => {
    if (!customReason.trim()) {
      Alert.alert('Error', 'Please describe your problem.');
      return;
    }
    try {
      const userId = await AsyncStorage.getItem('userUID');
      if (!userId) {
        Alert.alert('Error', 'Please login to submit a report');
        return;
      }
      await axios.post(`${API_BASE}/report/createReport`, {
        reason: customReason.trim(),
        userId: userId,
        itemType: 'general',
        itemId: null,
      });
      Alert.alert('Thank you', 'Your report has been submitted.');
      setReportModalVisible(false);
      setCustomReason('');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    }
  };

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {leftIcon && (
          <TouchableOpacity onPress={onLeftIconPress} style={{ marginRight: 8 }}>
            {leftIcon}
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.headerButtons}>
        {showNotifications && (
          <>
            <TouchableOpacity
              style={[styles.headerButton, { marginRight: 8 }]}
              onPress={() => navigation.navigate('Conversation')}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              {unseenChatCount > 0 && (
                <View style={styles.chatBadge}>
                  <Text style={styles.chatBadgeText}>{unseenChatCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, { marginRight: 8 }]}
              onPress={() => navigation.navigate('Notifications')}
            >
              <MaterialIcons name="notifications-none" size={28} color="#fff" />
              {unseenNotifCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unseenNotifCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
        {showProfile && (
          <TouchableOpacity
            style={[styles.headerButton, styles.profileButton]}
            onPress={() => setProfileMenuVisible(true)}
          >
            {userProfilePic ? (
              <Image source={{ uri: userProfilePic }} style={styles.profilePic} />
            ) : (
              <Ionicons name="person-circle-outline" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {/* Profile Dropdown Modal */}
      <Modal
        visible={profileMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setProfileMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setProfileMenuVisible(false);
                  navigation.navigate('UserProfile');
                }}
              >
                <Ionicons name="person-outline" size={22} color="#333" style={{ marginRight: 10 }} />
                <Text style={styles.dropdownText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setProfileMenuVisible(false);
                  setReportModalVisible(true);
                }}
              >
                <Ionicons name="alert-circle-outline" size={22} color="#FF6B6B" style={{ marginRight: 10 }} />
                <Text style={styles.dropdownText}>Report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setProfileMenuVisible(false);
                  navigation.replace('Login');
                }}
              >
                <Ionicons name="log-out-outline" size={22} color="#FF6B6B" style={{ marginRight: 10 }} />
                <Text style={styles.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Report Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setReportModalVisible(false)}>
          <View style={styles.modalOverlayCentered}>
            <TouchableWithoutFeedback>
              <View style={{
                backgroundColor: '#fff',
                width: '85%',
                maxWidth: 400,
                borderRadius: 20,
                padding: 24,
                elevation: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.25,
                shadowRadius: 16.0,
              }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Report a Problem</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 12,
                    padding: 16,
                    marginTop: 12,
                    fontSize: 16,
                    backgroundColor: '#FAFAFA',
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Describe the problem..."
                  value={customReason}
                  onChangeText={setCustomReason}
                  multiline
                  placeholderTextColor="#999"
                />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#f5f5f5',
                      borderWidth: 1,
                      borderColor: '#ddd',
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      minWidth: 100,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setReportModalVisible(false);
                      setCustomReason('');
                    }}
                  >
                    <Text style={{ color: '#666', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#4CAF50',
                      paddingVertical: 12,
                      paddingHorizontal: 24,
                      borderRadius: 12,
                      minWidth: 100,
                      alignItems: 'center',
                    }}
                    onPress={handleReportSubmit}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#00C44F',
    height: Platform.OS === 'ios' ? 90 : 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  profileButton: {
    padding: 0,
    height: 35,
    width: 35,
    borderRadius: 17.5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profilePic: {
    height: '100%',
    width: '100%',
    borderRadius: 17.5,
  },
  chatBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    backgroundColor: '#FF6B6B',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    backgroundColor: '#FF6B6B',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  modalOverlayCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    marginTop: Platform.OS === 'ios' ? 80 : 60,
    marginRight: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    width: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
}); 