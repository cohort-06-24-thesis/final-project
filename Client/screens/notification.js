import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import { NotificationContext } from '../src/context/NotificationContext'; // ✅ Correct relative path
import { API_BASE } from '../config';

const Notification = () => {
  const {
    notifications,
    setNotifications,
    fetchNotifications,
    unreadCount,
    setUnreadCount,
    loading,
    error,
  } = useContext(NotificationContext);

  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('userUID').then((uid) => {
      if (uid) {
        setUserId(uid);
        // Fetch in background, but don't block UI
        fetchNotifications(uid);
      }
    });
  }, [fetchNotifications]);

  const onRefresh = useCallback(() => {
    if (!userId) return;
    setRefreshing(true);
    fetchNotifications(userId).finally(() => setRefreshing(false));
  }, [userId, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE}/notification/Updatenotification/${id}`, {
        isRead: true,
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );

      const updatedUnread = notifications.filter((n) => n.id !== id && !n.isRead).length;
      setUnreadCount(updatedUnread);
    } catch (error) {
      console.error('Error marking as read:', error.message);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.notificationCard, !item.isRead && styles.unreadNotification]}>
      <View style={styles.cardHeader}>
        <Text style={styles.message}>{item.message}</Text>
        {!item.isRead && (
          <TouchableOpacity onPress={() => markAsRead(item.id)}>
            <Icon name="check-circle" size={20} color="#4A90E2" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {notifications.length === 0 && loading ? (
        <ActivityIndicator size="large" color="#4A90E2" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.text}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4A90E2"]}
              tintColor="#4A90E2"
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFD',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 48,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'System',
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  unreadNotification: {
    backgroundColor: '#E8F0FE',
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    shadowOpacity: 0.15,
    transform: [{ scale: 1.02 }],
  },
  message: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    lineHeight: 24,
    fontFamily: 'System',
    flex: 1,
    paddingRight: 10,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontWeight: '400',
    fontFamily: 'System',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginVertical: 16,
  },
});

export default Notification;
