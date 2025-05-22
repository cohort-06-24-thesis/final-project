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

// Extract base URL without /api
const SOCKET_BASE = API_BASE.replace('/api', '');

// Helper to get the base URL without /api
const BASE_URL = API_BASE.replace('/api', '');

export default function Chat({ route, navigation }) {
  const { recipientId, recipientName, recipientProfilePic, itemTitle } = route.params;
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);
  const roomIdRef = useRef(null);
  const[customReason, setCustomReason] = useState('');
  const { notifications, markChatNotificationsAsRead } = React.useContext(NotificationContext);

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
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setIsDropdownVisible(true)}
        >
          <Ionicons name="information-circle" size={28} color="#EFD13D" />
        </TouchableOpacity>
      ),
    });

    let isMounted = true;

    const initializeChat = async () => {
      try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) {
          console.error('No user ID found');
          setLoading(false);
          return;
        }
        setCurrentUserId(userId);

        // Create roomId before socket connection
        const roomId = [userId, recipientId].sort().join('-');
        roomIdRef.current = roomId;
        console.log('Initializing chat with roomId:', roomId);

        // Initialize socket connection with improved configuration
        const socketInstance = io(SOCKET_BASE, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          path: '/socket.io',
          forceNew: true,
          autoConnect: true
        });

        // Handle connection events
        socketInstance.on('connect', () => {
          console.log('Socket connected, joining room:', roomId);
          // Join room after successful connection
          socketInstance.emit('join_room', roomId, (response) => {
            if (!response?.success) {
              console.error('Failed to join room:', response?.error);
              // Retry joining room if failed
              setTimeout(() => {
                socketInstance.emit('join_room', roomId);
              }, 1000);
            } else {
              console.log('Successfully joined room:', roomId);
            }
          });
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          // Attempt to reconnect with exponential backoff
          setTimeout(() => {
            socketInstance.connect();
          }, 2000);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'transport error' || reason === 'transport close') {
            // Attempt to reconnect immediately for transport errors
            socketInstance.connect();
          }
        });

        // Remove existing listeners
        socketInstance.off('receive_message');
        socketInstance.off('messages_read');

        // Listen for new messages
        socketInstance.on('receive_message', (data, callback) => {
          console.log('Received new message:', data);
          setMessages(prevMessages => {
            // Only add the message if it's not from the current user
            // or if it's not already in the messages list
            const isDuplicate = prevMessages.some(msg => 
              msg.id === data.id || 
              (msg._isLocal && msg.senderId === data.senderId && msg.text === data.text)
            );
            
            if (!isDuplicate) {
              const newMessages = [...prevMessages, data];
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

        setSocket(socketInstance);

        // Fetch initial messages
        console.log('Fetching messages for room:', roomId);
        const response = await axios.get(`${API_BASE}/message/room/${roomId}`);
        console.log('Received messages:', response.data);
        setMessages(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        setLoading(false);
        // Show error to user
        Toast.show({
          type: 'error',
          text1: 'Error loading chat',
          text2: 'Please try again later'
        });
      }
    };

    // Initialize chat when component mounts
    initializeChat();

    // Set up focus listener to reinitialize chat when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      initializeChat();
    });

    return () => {
      isMounted = false;
      unsubscribe();
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
        isDelivered: true,
        _isLocal: true // Mark as local message
      };
      
      // Add message to state
      setMessages(prev => [...prev, messageWithStatus]);
      setMessage('');

      // Emit message with acknowledgment
      socket.emit('send_message', messageWithStatus, (response) => {
        if (response && response.success) {
          // Instead of removing the local flag, update the message with the server response
          setMessages(prev => prev.map(msg => 
            msg._isLocal && msg.text === messageWithStatus.text 
              ? { ...response.data, isDelivered: true }
              : msg
          ));
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
    let displayTime = 'Invalid Date';
    const dateValue = item.timestamp || item.createdAt;
    if (dateValue && !isNaN(new Date(dateValue).getTime())) {
      displayTime = new Date(dateValue).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{displayTime}</Text>
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
        console.log('Marking messages as read:', unreadMessages.map(m => m.id));
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EFD13D" />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages.filter(msg => msg.text && (msg.timestamp || msg.createdAt))}
            renderItem={renderMessage}
            keyExtractor={item => `${item.id}-${item.senderId}-${item.timestamp || item.createdAt}`}
            contentContainerStyle={styles.messagesList}
            inverted={false}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            ListHeaderComponent={renderUserHeader}
            showsVerticalScrollIndicator={false}
            extraData={messages}
          />
          <View style={styles.inputContainer}>
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
        </>
      )}

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
                navigation.navigate('OtherUser', { userId: recipientId });
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});