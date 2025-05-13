import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { initStripe, usePaymentSheet } from '@stripe/stripe-react-native';
import axios from 'axios';

// Configure axios defaults
axios.defaults.timeout = 10000;

export default function Payment({ route, navigation }) {
  const { campaign } = route.params;
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
    //       // Create payment intent on backend
    //   const response = await axios.post(`${API_URL}/stripe/create-payment-intent`, {
      // Create payment intent on the server
      const response = await axios.post('http://192.168.1.159:3000/api/payment/create-intent', {
        amount: parseFloat(amount),
        campaignId: campaign.id
      });

      if (!response.data?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: response.data.clientSecret,
        merchantDisplayName: 'Your App Name',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present the Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Payment successful
      Alert.alert('Success', 'Payment completed successfully!');
      navigation.goBack();

    } catch (error) {
      console.error('Payment error:', error);
      let errorMessage = 'Failed to process payment.';
      
      if (!error.response) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid payment details. Please check your input.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      Alert.alert('Payment Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Support {campaign.title}</Text>
      
      <View style={styles.amountContainer}>
        <Text style={styles.label}>Enter Amount (USD)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Enter amount to donate"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          • Minimum donation amount: $1{'\n'}
          • Secure payment powered by Stripe{'\n'}
          • Supports all major credit cards
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Proceed to Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  amountContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  infoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: '#00c44f',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonDisabled: {
    backgroundColor: '#aaa',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});