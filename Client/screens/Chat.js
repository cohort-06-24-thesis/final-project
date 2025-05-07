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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API_BASE } from '../config';

// Extract base URL without /api
const SOCKET_BASE = API_BASE.replace('/api', '');

export default function Chat({ route, navigation }) {
  const { recipientId, recipientName, recipientProfilePic, itemTitle } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);
  const roomIdRef = useRef(null);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
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
        <Text style={styles.messageText}>{item.text}</Text>
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id ? item.id.toString() : `${item.senderId}-${item.timestamp}`}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
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
});