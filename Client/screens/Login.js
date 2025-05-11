// // 
// import { useState } from 'react';
// import { 
//   View, 
//   TextInput, 
//   StyleSheet, 
//   TouchableOpacity, 
//   Text,
//   Alert
// } from 'react-native';
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from '../firebase';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from "axios"
// import { API_BASE } from '../config';

// export default function Login({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState('');

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setError('Please enter both email and password');
//       return;
//     }

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const uid = userCredential.user.uid;

//       // Fetch user data from backend
//       const response = await axios.get(`${API_BASE}/user/get/${uid}`);
//       const userData = response.data

//       if (userData.status === 'banned') {
//         Alert.alert(
//           'Account Banned',
//           'Your account has been banned due to breaching our terms of use and policies.',
//           [{ text: 'OK' }]
//         );
//         return;
//       }

//       // Store UID and navigate
//       await AsyncStorage.setItem('userUID', uid);
//       setError('');
//       navigation.replace('MainApp');

//     } catch (error) {
//       console.error('Login error:', error);
//       switch (error.code) {
//         case 'auth/user-not-found':
//           setError('No account found with this email');
//           break;
//         case 'auth/wrong-password':
//           setError('Incorrect password');
//           break;
//         case 'auth/invalid-email':
//           setError('Invalid email address');
//           break;
//         default:
//           setError(error.message || 'Login failed');
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Login to your Account</Text>
      
//       <View style={styles.inputContainer}>
//         <TextInput 
//           placeholder="abc@yourdomain.com" 
//           value={email} 
//           onChangeText={setEmail}
//           style={styles.input}
//           keyboardType="email-address"
//           autoCapitalize="none"
//         />
//         <TextInput 
//           placeholder="Password" 
//           value={password} 
//           onChangeText={setPassword}
//           secureTextEntry
//           style={styles.input}
//         />
//       </View>

//       <View style={styles.rememberContainer}>
//         <TouchableOpacity 
//           style={styles.checkbox} 
//           onPress={() => setRememberMe(!rememberMe)}
//         >
//           {rememberMe && <Text style={styles.checkmark}>✓</Text>}
//         </TouchableOpacity>
//         <Text style={styles.rememberText}>Remember me</Text>
//       </View>

//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <Text style={styles.buttonText}>Sign in</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
//         <Text style={styles.forgotPassword}>Forgot the password?</Text>
//       </TouchableOpacity>

//       <View style={styles.signupContainer}>
//         <Text style={styles.signupText}>Don't have an account? </Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
//           <Text style={styles.signupLink}>Sign up</Text>
//         </TouchableOpacity>
//       </View>

//       {error && <Text style={styles.errorText}>{error}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginBottom: 30,
//     marginTop: 50,
//   },
//   inputContainer: {
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//     fontSize: 16,
//   },
//   rememberContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   checkbox: {
//     width: 24,
//     height: 24,
//     borderWidth: 1,
//     borderColor: '#4CAF50',
//     borderRadius: 4,
//     marginRight: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkmark: {
//     color: '#4CAF50',
//     fontSize: 16,
//   },
//   rememberText: {
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: '#4CAF50',
//     padding: 15,
//     borderRadius: 25,
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   forgotPassword: {
//     color: '#4CAF50',
//     textAlign: 'center',
//     fontSize: 16,
//   },
//   signupContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 20,
//   },
//   signupText: {
//     color: '#666',
//     fontSize: 16,
//   },
//   signupLink: {
//     color: '#4CAF50',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   errorText: {
//     color: 'red',
//     textAlign: 'center',
//     marginTop: 10,
//     marginBottom: 10,
//   }
// });
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios"
import { API_BASE } from '../config';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Fetch user data from backend
      const response = await axios.get(`${API_BASE}/user/get/${uid}`);
      const userData = response.data

      if (userData.status === 'banned') {
        setShowModal(true); // Trigger the modal when account is banned
        return;
      }

      // Store UID and navigate
      await AsyncStorage.setItem('userUID', uid);
      setError('');
      navigation.replace('MainApp');

    } catch (error) {
      console.error('Login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        default:
          setError(error.message || 'Login failed');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to your Account</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="abc@yourdomain.com"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
      </View>

      <View style={styles.rememberContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setRememberMe(!rememberMe)}
        >
          {rememberMe && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.rememberText}>Remember me</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Forgot the password?</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Custom Modal for Account Banned */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Account Banned</Text>
            <Text style={styles.modalMessage}>
              Your account has been banned due to breaching our terms of use and policies.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 50,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 16,
  },
  rememberText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#4CAF50',
    textAlign: 'center',
    fontSize: 16,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#666',
    fontSize: 16,
  },
  signupLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50', // Charitable green color
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4CAF50', // Charitable green color
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
