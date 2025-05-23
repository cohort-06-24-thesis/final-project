import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, 
  TouchableOpacity, Alert, Dimensions, Animated,
  TouchableWithoutFeedback
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Settings({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = useState(new Animated.Value(0))[0];

  const SettingItem = ({ icon, label, value, onValueChange, type = 'toggle', onPress }) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={type === 'link' ? onPress : null}
    >
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={24} color="#4CAF50" />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: '#4CAF50' }}
          thumbColor={value ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={24} color="#666" />
      )}
    </TouchableOpacity>
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const userId = await AsyncStorage.getItem('userUID');
              // Add your delete account API call here
              await AsyncStorage.clear();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const hide = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setIsVisible(false);
      navigation.goBack();
    });
  };

  const show = () => {
    setIsVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={hide}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <TouchableOpacity onPress={hide}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <SettingItem
                icon="person-outline"
                label="Edit Profile"
                type="link"
                onPress={() => {
                  hide();
                  navigation.navigate('EditProfile');
                }}
              />
              <SettingItem
                icon="notifications-outline"
                label="Push Notifications"
                value={notifications}
                onValueChange={(value) => {
                  setNotifications(value);
                  // Add your notification toggle logic here
                }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
            <View style={styles.card}>
              <SettingItem
                icon="lock-closed-outline"
                label="Change Password" 
                type="link"
                onPress={() => {
                  hide();
                  navigation.navigate('ChangePassword');
                }}
              />
              <SettingItem
                icon="shield-checkmark-outline"
                label="Privacy Settings"
                type="link"
                onPress={() => {
                  hide();
                  navigation.navigate('PrivacySettings');
                }}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Help & Support</Text>
            <View style={styles.card}>
              <SettingItem
                icon="help-circle-outline"
                label="FAQ"
                type="link"
                onPress={() => {
                  hide();
                  navigation.navigate('FAQ');
                }}
              />
              <SettingItem
                icon="mail-outline"
                label="Contact Us"
                type="link"
                onPress={() => {
                  hide();
                  navigation.navigate('ContactUs');
                }}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.85,
    height: height,
    backgroundColor: '#f5f5f5',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#4CAF50',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 15,
    marginTop: 24,
    marginBottom: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});