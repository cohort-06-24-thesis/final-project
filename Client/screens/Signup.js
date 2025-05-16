import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import axios from 'axios';
import { API_BASE } from '../config.js';
import { Svg, Path, Circle, G } from 'react-native-svg';
import * as Animatable from 'react-native-animatable';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Color palette from the image
const COLORS = {
  white: '#FFFFFF',
  teaGreen: '#C7F9CC',
  lightGreen: '#80ED99',
  darkGreen: '#00C44F',
  jasmine: '#FFE97F',
  black: '#333333',
  gray: '#888888',
  lightGray: '#DDDDDD'
};

export default function EnhancedSignupScreen({ navigation }) {
  // State variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const [activeInput, setActiveInput] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Heart animation values - create 12 hearts with different positions and sizes
  const hearts = useRef(Array.from({ length: 24 }, (_, i) => ({
    position: new Animated.ValueXY({ 
      x: width / 2 + (Math.random() * 200 - 100),
      y: height / 2 + (Math.random() * 200 - 100)
    }),
    scale: new Animated.Value(0.3 + Math.random() * 0.7),
    rotation: new Animated.Value(Math.random() * 30 - 15),
    angle: new Animated.Value(Math.random() * 360),
    radius: new Animated.Value(150 + Math.random() * 100),
    color: [
      COLORS.teaGreen, 
      COLORS.lightGreen, 
      COLORS.darkGreen, 
      COLORS.jasmine,
      COLORS.teaGreen + '80',
      COLORS.lightGreen + '80',
      COLORS.darkGreen + '80',
      COLORS.jasmine + '80'
    ][i % 8],
    size: 15 + Math.floor(Math.random() * 35),
    speed: 4000 + Math.random() * 6000,
  }))).current;
  
  // References for animation
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
    
    // Start heart animations immediately
    animateHearts();
    
    // Animate form elements with delay
    setTimeout(() => {
      nameRef.current?.fadeInUp(400);
    }, 300);
    setTimeout(() => {
      emailRef.current?.fadeInUp(400);
    }, 400);
    setTimeout(() => {
      passwordRef.current?.fadeInUp(400);
    }, 500);
    setTimeout(() => {
      confirmPasswordRef.current?.fadeInUp(400);
    }, 600);
  }, []);
  
  const animateHearts = () => {
    // Get the center point of the screen
    const centerX = width / 2;
    const centerY = height / 2;

    // Animate each heart
    hearts.forEach((heart, index) => {
      const createHeartAnimation = () => {
        // Get current values safely
        const currentAngle = heart.angle ? heart.angle.__getValue() : 0;
        const currentRadius = heart.radius ? heart.radius.__getValue() : 150;
        
        // Calculate new angle for orbital movement
        const newAngle = (currentAngle + 45 + Math.random() * 30) % 360;
        
        // Keep radius within a range around the card
        const minRadius = 150;
        const maxRadius = 300;
        let newRadius = currentRadius;
        
        // Occasionally adjust radius within bounds
        if (Math.random() < 0.3) {
          newRadius = minRadius + Math.random() * (maxRadius - minRadius);
        }
        
        // Calculate new position based on angle and radius
        const verticalOffset = Math.sin(newAngle * Math.PI / 180) * 50;
        const newX = centerX + newRadius * Math.cos(newAngle * Math.PI / 180);
        const newY = centerY + newRadius * Math.sin(newAngle * Math.PI / 180) + verticalOffset;
        
        // Create animation for this heart
        Animated.parallel([
          // Move to new position
          Animated.timing(heart.position, {
            toValue: { x: newX, y: newY },
            duration: heart.speed,
            useNativeDriver: true,
          }),
          // Update radius
          Animated.timing(heart.radius, {
            toValue: newRadius,
            duration: heart.speed,
            useNativeDriver: false,
          }),
          // Update angle
          Animated.timing(heart.angle, {
            toValue: newAngle,
            duration: heart.speed,
            useNativeDriver: false,
          }),
          // Rotate slightly
          Animated.timing(heart.rotation, {
            toValue: Math.random() * 60 - 30,
            duration: heart.speed,
            useNativeDriver: true,
          }),
          // Pulse size slightly
          Animated.sequence([
            Animated.timing(heart.scale, {
              toValue: 0.5 + Math.random() * 0.8,
              duration: heart.speed / 2,
              useNativeDriver: true,
            }),
            Animated.timing(heart.scale, {
              toValue: 0.3 + Math.random() * 0.7,
              duration: heart.speed / 2,
              useNativeDriver: true,
            })
          ])
        ]).start(() => {
          // Ensure we have valid values before starting next animation
          if (heart.angle && heart.radius) {
            createHeartAnimation();
          }
        });
      };
      
      // Start with a shorter delay based on index
      setTimeout(() => {
        if (heart.angle && heart.radius) {
          createHeartAnimation();
        }
      }, index * 50);
    });
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleSignUp = async () => {
    handleButtonPress();
    
    // Reset error
    setError('');
    
    // Validate inputs
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up successfully:', userCredential);
      
      // Add user to backend
      await axios.post(`${API_BASE}/user/add`, {
        id: userCredential.user.uid,
        name: name,
        email: userCredential.user.email,
        password: password,
        role: 'user',
        rating: 0
      });
      
      setLoading(false);
      navigation.navigate('Login');
    } catch (error) {
      setLoading(false);
      console.error('Signup error:', error);
      
      if (error.response) {
        setError(error.response.data.message);
      } else if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('Email is already registered');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          case 'auth/weak-password':
            setError('Password should be at least 6 characters');
            break;
          default:
            setError(error.message);
        }
      } else {
        setError('Network error. Please try again.');
      }
    }
  };

  // Custom input component
  const CustomInput = ({ 
    icon, 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry, 
    toggleSecureEntry,
    keyboardType,
    autoCapitalize,
    animRef,
    inputKey
  }) => (
    <Animatable.View 
      ref={animRef}
      style={[
        styles.inputWrapper,
        activeInput === inputKey && styles.inputWrapperActive
      ]}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        placeholderTextColor={COLORS.gray}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'sentences'}
        onFocus={() => setActiveInput(inputKey)}
        onBlur={() => setActiveInput(null)}
      />
      {toggleSecureEntry && (
        <TouchableOpacity 
          style={styles.eyeIcon}
          onPress={toggleSecureEntry}
        >
          <EyeIcon visible={!secureTextEntry} />
        </TouchableOpacity>
      )}
    </Animatable.View>
  );

  // Heart SVG component
  const HeartSvg = ({ color, size }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
      />
    </Svg>
  );

  // Animated heart component
  const AnimatedHeart = ({ heart, index }) => {
    return (
      <Animated.View
        key={index}
        style={[
          styles.heartContainer,
          {
            opacity: 0.8, // Increased opacity for better visibility
            transform: [
              { translateX: heart.position.x },
              { translateY: heart.position.y },
              { scale: heart.scale },
              { rotate: heart.rotation.interpolate({
                inputRange: [-30, 30],
                outputRange: ['-30deg', '30deg']
              })}
            ]
          }
        ]}
      >
        <HeartSvg color={heart.color} size={heart.size} />
      </Animated.View>
    );
  };

  // Custom SVG icons
  const PersonIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  const EmailIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M22 6L12 13L2 6" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  const LockIcon = () => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  const EyeIcon = ({ visible }) => (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path 
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" 
            stroke={COLORS.gray} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="12" r="3" stroke={COLORS.gray} strokeWidth="2" />
        </>
      ) : (
        <>
          <Path 
            d="M9.9 4.24002C10.5883 4.0789 11.2931 3.99836 12 4.00002C19 4.00002 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19" 
            stroke={COLORS.gray} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.572 9.14351 13.1984C8.99262 12.8249 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2219 9.18488 10.8539C9.34884 10.4859 9.58525 10.1547 9.88 9.88002" 
            stroke={COLORS.gray} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M1 1L23 23" 
            stroke={COLORS.gray} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M1 12C1 12 5 4 12 4" 
            stroke={COLORS.gray} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <Path 
            d="M12 20C5 20 1 12 1 12" 
            stroke={COLORS.gray} 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );

  const FacebookIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  const GoogleIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M17.5 12H12" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M12 6.5V12" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M12 12L8.5 15.5" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  const AppleIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M12 18.5C11.0807 19.4193 10.0193 20.1867 8.85 20.77C8.13572 21.1294 7.34868 21.3336 6.55 21.37C5.7 21.43 4.82 21.24 4.18 20.95C3.54 20.66 3.01 20.26 2.6 19.77C1.26 17.89 1.19 14.46 2.5 12.5C3.56 10.94 5.41 10.33 7 10.71C7.74 10.87 8.46 11.15 9.12 11.58C9.5 11.83 9.92 12.08 10.38 12.08C10.76 12.08 11.13 11.86 11.47 11.67C12.97 10.83 14.77 10.88 16.37 11.57C16.7 11.73 17.08 11.92 17.35 12.19C17.62 12.46 17.75 12.81 17.75 13.17C17.75 13.37 17.7 13.57 17.62 13.76" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M12 18.5C11.0807 19.4193 10.0193 20.1867 8.85 20.77C8.13572 21.1294 7.34868 21.3336 6.55 21.37C5.7 21.43 4.82 21.24 4.18 20.95C3.54 20.66 3.01 20.26 2.6 19.77C1.26 17.89 1.19 14.46 2.5 12.5C3.56 10.94 5.41 10.33 7 10.71C7.74 10.87 8.46 11.15 9.12 11.58C9.5 11.83 9.92 12.08 10.38 12.08C10.76 12.08 11.13 11.86 11.47 11.67C12.97 10.83 14.77 10.88 16.37 11.57" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M9 6.5C9 4.84315 10.3431 3.5 12 3.5C13.6569 3.5 15 4.84315 15 6.5C15 8.15685 13.6569 9.5 12 9.5" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  const TwitterIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.9572 14.8821 3.28445C14.0247 3.61171 13.2884 4.1944 12.773 4.95372C12.2575 5.71303 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3Z" 
        stroke={COLORS.darkGreen} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Animated Hearts Background */}
      <View style={[styles.backgroundContainer, { zIndex: 0 }]}>
        {hearts.map((heart, index) => (
          <AnimatedHeart key={index} heart={heart} index={index} />
        ))}
      </View>
      
      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, { zIndex: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              zIndex: 2
            }
          ]}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Join Us</Text>
            <Text style={styles.subtitle}>Create your account to get started</Text>
          </View>

          <View style={styles.inputContainer}>
            <CustomInput
              icon={<PersonIcon />}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              animRef={nameRef}
              inputKey="name"
            />

            <CustomInput
              icon={<EmailIcon />}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              animRef={emailRef}
              inputKey="email"
            />

            <CustomInput
              icon={<LockIcon />}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              toggleSecureEntry={() => setSecureTextEntry(!secureTextEntry)}
              animRef={passwordRef}
              inputKey="password"
            />

            <CustomInput
              icon={<LockIcon />}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureConfirmTextEntry}
              toggleSecureEntry={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
              animRef={confirmPasswordRef}
              inputKey="confirmPassword"
            />
          </View>

          <View style={styles.rememberContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxActive
              ]}>
                {rememberMe && (
                  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <Path 
                      d="M20 6L9 17L4 12" 
                      stroke={COLORS.white} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <Animatable.View 
              style={styles.errorContainer}
              animation="shake"
              duration={500}
            >
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path 
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                  stroke="#FF3B30" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <Path 
                  d="M12 8V12" 
                  stroke="#FF3B30" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <Circle cx="12" cy="16" r="1" fill="#FF3B30" />
              </Svg>
              <Text style={styles.errorText}>{error}</Text>
            </Animatable.View>
          ) : null}

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <FacebookIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <GoogleIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <AppleIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
              <TwitterIcon />
            </TouchableOpacity>
          </View>

          <Animatable.View 
            style={styles.bottomContainer}
            animation="fadeIn"
            delay={800}
            duration={600}
          >
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  heartContainer: {
    position: 'absolute',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    zIndex: 1,
  },
  formContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
    zIndex: 2,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    height: 54,
  },
  inputWrapperActive: {
    borderColor: COLORS.darkGreen,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 46,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.teaGreen,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: COLORS.black,
  },
  eyeIcon: {
    padding: 10,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.darkGreen,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.darkGreen,
  },
  rememberText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 13,
  },
  signupButton: {
    backgroundColor: COLORS.darkGreen,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1.5,
    backgroundColor: COLORS.teaGreen,
  },
  dividerText: {
    paddingHorizontal: 12,
    color: COLORS.gray,
    fontSize: 13,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderWidth: 1.5,
    borderColor: COLORS.teaGreen,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  bottomText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  signInLink: {
    color: COLORS.darkGreen,
    fontWeight: 'bold',
    fontSize: 14,
  },
});