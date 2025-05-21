import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initStripe, useStripe } from '@stripe/stripe-react-native';
import { useNavigation } from '@react-navigation/native';

const SupportScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userUID, setUserUID] = useState(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize Stripe
        await initStripe({
          publishableKey: 'pk_test_51RMTosPOIMZHYlJT7cZ0Vk2xPiP0XLE7x1lRX3iN8IY3AWmLu8aNiGcLsZT0bPN9jgE6PLbO9KxCDPWmNu6tlrdD00T7wLIMpB',
          merchantIdentifier: 'merchant.com.yourapp',
        });

        // Get user UID
        const uid = await AsyncStorage.getItem('userUID');
        console.log('User UID:', uid); // Debug log
        setUserUID(uid);
      } catch (error) {
        console.error('Initialization error:', error);
        Alert.alert('Error', 'Failed to initialize payment system');
      }
    };

    initialize();
  }, []);

  const handleDonation = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!userUID) {
      Alert.alert('Error', 'Please log in to make a donation');
      return;
    }

    setLoading(true);

    try {
      console.log('Starting donation process...'); // Debug log

      // Step 1: Create payment intent first
      console.log('Creating payment intent...'); // Debug log
      const paymentResponse = await axios.post(`${API_BASE}/payment/create-intent`, {
        amount: parseFloat(amount),
        type: 'team_support',
        userUID
      });

      console.log('Payment intent response:', paymentResponse.data); // Debug log

      if (!paymentResponse.data?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Step 2: Initialize payment sheet
      console.log('Initializing payment sheet...'); // Debug log
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentResponse.data.clientSecret,
        merchantDisplayName: 'Sadaꓘa',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Step 3: Present payment sheet
      console.log('Presenting payment sheet...'); // Debug log
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Step 4: Create team support record
      console.log('Creating team support record...'); // Debug log
      const paymentIntentId = paymentResponse.data.clientSecret.split('_secret_')[0];
      const teamSupportResponse = await axios.post(`${API_BASE}/teamSupport`, {
        amount: parseFloat(amount),
        message,
        userUID,
        transaction_id: paymentIntentId
      });

      console.log('Team support response:', teamSupportResponse.data); // Debug log

      Alert.alert('Success', 'Thank you for your donation!');
      setAmount('');
      setMessage('');
    } catch (error) {
      console.error('Donation error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });

      if (error.response?.status === 500) {
        Alert.alert(
          'Server Error',
          'There was a problem processing your donation. Please try again later.'
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to process donation');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Support Sadaꓘa</Text>
        <View style={{ width: 24 }} />{/* Spacer */}
      </View>
      <ScrollView contentContainerStyle={styles.formContentContainer} style={styles.form}>
        <Text style={styles.label}>Donation Amount (TND)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="Enter amount"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Message (Optional)</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Leave a message..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.donateButton, loading && styles.donateButtonDisabled]}
          onPress={handleDonation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.donateButtonText}>Donate Now</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00C44F',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  formContentContainer: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  donateButton: {
    backgroundColor: '#00C44F',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  donateButtonDisabled: {
    backgroundColor: '#80ED99',
    opacity: 0.7,
  },
  donateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SupportScreen; 