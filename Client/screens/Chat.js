import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API_BASE } from '../config';
import { NotificationContext } from '../src/context/NotificationContext';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';

// Extract base URL without /api
const SOCKET_BASE = API_BASE.replace('/api', '');

// Helper to get the base URL without /api
const BASE_URL = API_BASE.replace('/api', '');

export default function Chat({ route, navigation }) {
  const { recipientId, recipientName, recipientProfilePic, itemTitle } = route.params;
  // Add these new state variables
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);
  const flatListRef = useRef(null);
  const roomIdRef = useRef(null);
  const[customReason, setCustomReason] = useState('');
  const { notifications, markChatNotificationsAsRead } = React.useContext(NotificationContext);
  const [uploading, setUploading] = useState(false);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }, 100);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitle}>
          <Image
            source={{ uri: recipientProfilePic || 'https://via.placeholder.com/40' }}
            style={styles.headerImage}
          />
          <Text style={styles.headerName}>{recipientName}</Text>
        </View>
      ),
      // Add this headerRight configuration
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setIsDropdownVisible(true)}
        >
          <Ionicons name="information-circle" size={28} color="#EFD13D" />
        </TouchableOpacity>
      ),
    });

    initializeChat();

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('messages_read');
        if (roomIdRef.current) {
          socket.emit('leave_room', roomIdRef.current);
        }
        socket.disconnect();
      }
    };
  }, []);

  const initializeChat = async () => {
    try {
      const userId = await AsyncStorage.getItem('userUID');
      setCurrentUserId(userId);

      // Initialize socket connection with correct base URL
      const socketInstance = io(SOCKET_BASE, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 60000,
        path: '/socket.io',
        forceNew: true,
        autoConnect: true
      });

      // Handle connection events
      socketInstance.on('connect', () => {
        console.log('Socket connected successfully');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      setSocket(socketInstance);

      // Set up room
      const roomId = [userId, recipientId].sort().join('-');
      roomIdRef.current = roomId;
      
      // Join room with acknowledgment
      socketInstance.emit('join_room', roomId, (response) => {
        if (response && response.success) {
          console.log('Successfully joined room:', roomId);
        } else {
          console.error('Failed to join room:', response?.error || 'Unknown error');
        }
      });

      // Remove existing listeners
      socketInstance.off('receive_message');
      socketInstance.off('messages_read');

      // Listen for new messages with acknowledgment
      socketInstance.on('receive_message', (data, callback) => {
        console.log('Received message:', data);
        
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => 
            msg.id === data.id || 
            (msg.senderId === data.senderId && msg.timestamp === data.timestamp)
          );
          
          if (!messageExists) {
            const newMessages = [...prevMessages, data];
            // Acknowledge receipt
            if (callback) callback({ success: true });
            return newMessages;
          }
          return prevMessages;
        });
      });

      // Listen for message read status
      socketInstance.on('messages_read', (data) => {
        console.log('Messages marked as read:', data);
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            data.messageIds.includes(msg.id) 
              ? { ...msg, isRead: true }
              : msg
          )
        );
      });

      // Fetch initial messages
      const response = await axios.get(`${API_BASE}/message/room/${roomId}`);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !socket || !currentUserId) return;

    try {
      const roomId = roomIdRef.current;
      console.log('Sending message to room:', roomId);

      // Save message to database
      const savedMessage = await axios.post(`${API_BASE}/message`, {
        text: message,
        isRead: false,
        roomId,
        senderId: currentUserId,
        receiverId: recipientId
      });

      // Update local state immediately with delivered status
      const messageWithStatus = {
        ...savedMessage.data,
        isDelivered: true
      };
      setMessages(prev => [...prev, messageWithStatus]);
      setMessage('');

      // Emit message with acknowledgment
      socket.emit('send_message', messageWithStatus, (response) => {
        if (response && response.success) {
          console.log('Message sent successfully');
        } else {
          console.error('Failed to send message:', response?.error || 'Unknown error');
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUserId;

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {item.imageUrl ? (
          <>
            {console.log('Image URL:', `${BASE_URL}${item.imageUrl}`)}
            <Image 
              source={{ uri: `${BASE_URL}${item.imageUrl}` }} 
              style={styles.messageImage}
              resizeMode="cover"
            />
          </>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {isCurrentUser && (
          <Text style={styles.messageStatus}>
            {item.isRead ? 'Seen' : 'Delivered'}
          </Text>
        )}
      </View>
    );
  };

  // Update message read status when messages are viewed
  useEffect(() => {
    if (socket && roomIdRef.current && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        !msg.isRead && 
        msg.senderId !== currentUserId
      );

      if (unreadMessages.length > 0) {
        console.log('Marking messages as read:', unreadMessages);
        socket.emit('mark_as_read', {
          roomId: roomIdRef.current,
          messageIds: unreadMessages.map(msg => msg.id)
        });
      }
    }
  }, [messages, socket, currentUserId]);

  // User info header for the chat
  const renderUserHeader = () => (
    <View style={styles.userHeader}>
      <Image
        source={{ uri: recipientProfilePic || 'https://via.placeholder.com/100' }}
        style={styles.userAvatar}
      />
      <Text style={styles.userName}>{recipientName}</Text>
    </View>
  );

  const submitReport = async () => {
    try {
      const finalReason = reportReason === 'other' ? customReason : reportReason;
      
      if (!finalReason) {
        Alert.alert('Error', 'Please select or enter a reason for reporting');
        return;
      }

      if (!currentUserId) {
        Alert.alert('Error', 'You must be logged in to report a user');
        return;
      }

      await axios.post(`${API_BASE}/report/createReport`, {
        reason: finalReason,
        userId: currentUserId,
        reportedUserId: recipientId,
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

  // Mark chat notifications as read when messages load or change, but only if there are unread ones
  useEffect(() => {
    if (messages.length > 0 && markChatNotificationsAsRead && notifications) {
      const messageIds = messages.map(m => m.id).filter(Boolean);
      const unreadChatNotifs = notifications.filter(
        n => n.itemType === 'chat' && !n.isRead && messageIds.includes(n.itemId)
      );
      if (unreadChatNotifs.length > 0) {
        markChatNotificationsAsRead(messageIds);
      }
    }
    // eslint-disable-next-line
  }, [messages, notifications]);

  const handleAttachment = async () => {
    try {
      setUploading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const formData = new FormData();
        result.assets.forEach((asset, index) => {
          formData.append('images', {
            uri: asset.uri,
            type: 'image/jpeg',
            name: `image-${index}.jpg`,
          });
        });
        formData.append('roomId', roomIdRef.current);
        formData.append('senderId', currentUserId);
        formData.append('receiverId', recipientId);

        console.log('Uploading images...', formData);
        const response = await axios.post(
          `${API_BASE}/message/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        console.log('Upload response:', response.data);
        if (response.data) {
          // Add all messages to the messages array
          setMessages(prevMessages => [...prevMessages, ...response.data]);
          // Emit socket event for each message
          response.data.forEach(message => {
            socket.emit('send_message', message, (response) => {
              if (response && response.success) {
                console.log('Image message sent successfully');
              } else {
                console.error('Failed to send image message:', response?.error || 'Unknown error');
              }
            });
          });
        }
      }
    } catch (err) {
      console.error('Error picking images:', err);
      Alert.alert('Error', 'Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setAttachmentModalVisible(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#EFD13D" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id ? item.id.toString() : `${item.senderId}-${item.timestamp}`}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        ListHeaderComponent={renderUserHeader}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.attachButton}
          onPress={() => setAttachmentModalVisible(true)}
        >
          <Ionicons name="add-circle" size={28} color="#EFD13D" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Attachment Modal */}
      <Modal
        visible={attachmentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setAttachmentModalVisible(false)}
        >
          <View style={styles.attachmentModalContent}>
            <View style={styles.attachmentHeader}>
              <Text style={styles.attachmentTitle}>Add Attachment</Text>
              <TouchableOpacity 
                onPress={() => setAttachmentModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.attachmentOptions}>
              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => handleAttachment()}
              >
                <View style={[styles.attachmentIconContainer, { backgroundColor: '#E3F2FD' }]}>
                  <Ionicons name="image" size={28} color="#2196F3" />
                </View>
                <Text style={styles.attachmentOptionText}>Image</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => handleAttachment('document')}
              >
                <View style={[styles.attachmentIconContainer, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="document" size={28} color="#4CAF50" />
                </View>
                <Text style={styles.attachmentOptionText}>Document</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.attachmentOption}
                onPress={() => handleAttachment('location')}
              >
                <View style={[styles.attachmentIconContainer, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="location" size={28} color="#FF9800" />
                </View>
                <Text style={styles.attachmentOptionText}>Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setIsDropdownVisible(false);
                navigation.navigate('OtherUser', { userId: recipientId });  // Changed from 'UserProfile' to 'OtherUser'
              }}
            >
              <Ionicons name="person-outline" size={20} color="#333" />
              <Text style={styles.dropdownText}>View Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setIsDropdownVisible(false);
                setReportModalVisible(true);
              }}
            >
              <Ionicons name="warning-outline" size={20} color="#FF6B6B" />
              <Text style={styles.dropdownText}>Report User</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setReportModalVisible(false)}
        >
          <View style={styles.reportModalContent}>
            <Text style={styles.reportModalTitle}>Report User</Text>
            <Text style={styles.reportModalSubtitle}>Why are you reporting this user?</Text>

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
                style={styles.reportCustomInput}
                placeholder="Please specify the reason"
                value={customReason}
                onChangeText={setCustomReason}
                multiline
              />
            )}

            <TouchableOpacity 
              style={styles.reportSubmitButton} 
              onPress={submitReport}
            >
              <Text style={styles.reportSubmitButtonText}>Submit Report</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.reportCancelButton}
              onPress={() => {
                setReportModalVisible(false);
                setReportReason('');
                setCustomReason('');
              }}
            >
              <Text style={styles.reportCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#EFD13D',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFD13D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userHeader: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  userAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 12,
    backgroundColor: '#e0e0e0',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  reportModalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    maxWidth: 400,
    marginTop: 'auto',
    marginBottom: 'auto',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  reportModalSubtitle: {
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
    backgroundColor: '#EFD13D20',
    borderColor: '#EFD13D',
    borderWidth: 1,
  },
  reportOptionText: {
    fontSize: 16,
    color: '#333',
  },
  reportCustomInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reportSubmitButton: {
    backgroundColor: '#EFD13D',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  reportSubmitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportCancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  reportCancelButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  attachmentModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  attachmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attachmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  attachmentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  attachmentOption: {
    alignItems: 'center',
    width: '30%',
  },
  attachmentIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentOptionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});