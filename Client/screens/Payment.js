import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { initStripe, usePaymentSheet } from "@stripe/stripe-react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE } from "../config";

// Configure axios defaults
axios.defaults.timeout = 10000;

export default function Payment({ route, navigation }) {
  const { campaign } = route.params;
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [Uid, setUid] = useState('');
  
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();
  useEffect(() => {
    const loadUid = async () => {
      const storedUid = await AsyncStorage.getItem('userUID');
      if (storedUid) {
        setUid(storedUid);
      } else {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        navigation.goBack();
      }
    };
    loadUid();
  }, []);
  useEffect(() => {
    initStripe({
      publishableKey:
        "pk_test_51RMTosPOIMZHYlJT7cZ0Vk2xPiP0XLE7x1lRX3iN8IY3AWmLu8aNiGcLsZT0bPN9jgE6PLbO9KxCDPWmNu6tlrdD00T7wLIMpB",
    });
  }, []);

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (!Uid) {
      Alert.alert("Error", "Please login to make a donation");
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      // Create payment intent with proper data structure
      const paymentData = {
        amount: parseFloat(amount),
        campaignId: campaign.id,
        userId: Uid,
        type: 'campaign_donation' // Add type to differentiate payment
      };

      console.log('Sending payment request:', paymentData); // Debug log

      const response = await axios.post(`${API_BASE}/payment/create-intent`, paymentData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Payment response:', response.data); // Debug log

      if (!response.data?.clientSecret) {
        throw new Error("Failed to create payment intent");
      }

      // Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: response.data.clientSecret,
        merchantDisplayName: "Sadaꓘa",
        style: 'automatic',
        appearance: {
          colors: {
            primary: '#00c44f',
          },
        }
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present the Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          throw new Error("Payment was canceled");
        }
        throw new Error(paymentError.message);
      }

      // Verify payment with better error handling
      const verifyResponse = await axios.get(
        `${API_BASE}/payment/verify/${response.data.paymentIntentId}`
      );

      if (verifyResponse.data.status === 'success') {
        Alert.alert(
          "Thank You! 🙏",
          "Your donation was successful. You've made a difference!",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate('MainApp', { screen: 'Campaign' })
            }
          ]
        );
      } else {
        throw new Error("Payment verification failed");
      }

    } catch (error) {
      console.error("Payment Process Error:", {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = "Payment failed. ";

      if (error.response?.status === 500) {
        errorMessage += "Server error. Please try again later.";
      } else if (error.message.includes('Canceled')) {
        errorMessage = "Payment was canceled.";
      } else if (!error.response && error.message.includes('Network')) {
        errorMessage += "Please check your internet connection.";
      } else if (error.response?.status === 400) {
        errorMessage += error.response.data.message || "Invalid payment details.";
      } else {
        errorMessage += error.message;
      }

      Alert.alert("Payment Error", errorMessage);
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
          • Minimum donation amount: $1{"\n"}• Secure payment powered by Stripe
          {"\n"}• Supports all major credit cards
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  amountContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  infoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: "#00c44f",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  payButtonDisabled: {
    backgroundColor: "#aaa",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
