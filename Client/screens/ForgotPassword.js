import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState(''); // 'email' or 'sms'

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert(
          'Success',
          'Password reset email sent. Please check your inbox.',
          [{ text: 'OK', onPress: () => navigation.navigate('SignupLogin') }] // Changed from 'Login' to 'SignupLogin'
        );
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Select a method to receive the confirmation code.
      </Text>

      <TouchableOpacity 
        style={[styles.methodCard, method === 'sms' && styles.selectedCard]}
        onPress={() => setMethod('sms')}
      >
        <View style={styles.methodContent}>
          <Text style={styles.methodTitle}>via SMS</Text>
          <Text style={styles.methodValue}>+1888-------111</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.methodCard, method === 'email' && styles.selectedCard]}
        onPress={() => setMethod('email')}
      >
        <View style={styles.methodContent}>
          <Text style={styles.methodTitle}>via Email</Text>
          <TextInput 
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, (!email || !method) && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={!email || !method}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  methodCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
  },
  selectedCard: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  methodContent: {
    flexDirection: 'column',
  },
  methodTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  methodValue: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#4CAF50', // green color
    padding: 12,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7', // lighter green for disabled state
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  }
});