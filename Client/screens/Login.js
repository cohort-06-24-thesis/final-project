import { useState, useEffect, useRef } from "react"
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Animated,
  Easing,
} from "react-native"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_BASE } from "../config"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window")

const AnimatedBackground = () => {
  const heart1Position = useRef(new Animated.Value(0)).current;
  const heart2Position = useRef(new Animated.Value(0)).current;
  const heart3Position = useRef(new Animated.Value(0)).current;
  const heart4Position = useRef(new Animated.Value(0)).current;
  const heart5Position = useRef(new Animated.Value(0)).current;
  const heart6Position = useRef(new Animated.Value(0)).current;
  const heart7Position = useRef(new Animated.Value(0)).current;
  const heart8Position = useRef(new Animated.Value(0)).current;
  const heart9Position = useRef(new Animated.Value(0)).current;
  const heart10Position = useRef(new Animated.Value(0)).current;
  const heart11Position = useRef(new Animated.Value(0)).current;
  const heart12Position = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateHeart = (value, duration, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateHeart(heart1Position, 6000);
    animateHeart(heart2Position, 8000, 1000);
    animateHeart(heart3Position, 7000, 2000);
    animateHeart(heart4Position, 9000, 1500);
    animateHeart(heart5Position, 7500, 500);
    animateHeart(heart6Position, 8500, 1200);
    animateHeart(heart7Position, 9500, 1800);
    animateHeart(heart8Position, 7200, 800);
    animateHeart(heart9Position, 8800, 1600);
    animateHeart(heart10Position, 9900, 2100);
    animateHeart(heart11Position, 8100, 300);
    animateHeart(heart12Position, 9300, 1100);
  }, []);

  return (
    <View style={styles.backgroundContainer}>
      <LinearGradient
        colors={['#00C44F', '#FFE97F']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <Animated.View
        style={[
          styles.heart,
          styles.heart1,
          {
            transform: [
              {
                translateY: heart1Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -50],
                }),
              },
              {
                translateX: heart1Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={60} color="rgba(255, 255, 255, 0.18)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart2,
          {
            transform: [
              {
                translateY: heart2Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -70],
                }),
              },
              {
                translateX: heart2Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={80} color="rgba(255, 255, 255, 0.13)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart3,
          {
            transform: [
              {
                translateY: heart3Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 60],
                }),
              },
              {
                translateX: heart3Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 40],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={70} color="rgba(255, 255, 255, 0.15)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart4,
          {
            transform: [
              {
                translateY: heart4Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -40],
                }),
              },
              {
                translateX: heart4Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -50],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={50} color="rgba(255, 255, 255, 0.20)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart5,
          {
            transform: [
              {
                translateY: heart5Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 35],
                }),
              },
              {
                translateX: heart5Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -25],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={40} color="rgba(255, 255, 255, 0.22)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart6,
          {
            transform: [
              {
                translateY: heart6Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                translateX: heart6Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={55} color="rgba(255, 255, 255, 0.16)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart7,
          {
            transform: [
              {
                translateY: heart7Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 45],
                }),
              },
              {
                translateX: heart7Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -35],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={65} color="rgba(255, 255, 255, 0.12)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart8,
          {
            transform: [
              {
                translateY: heart8Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 55],
                }),
              },
              {
                translateX: heart8Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 25],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={45} color="rgba(255, 255, 255, 0.19)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart9,
          {
            transform: [
              {
                translateY: heart9Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -60],
                }),
              },
              {
                translateX: heart9Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 35],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={35} color="rgba(255, 255, 255, 0.14)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart10,
          {
            transform: [
              {
                translateY: heart10Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 38],
                }),
              },
              {
                translateX: heart10Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -18],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={60} color="rgba(255, 255, 255, 0.11)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart11,
          {
            transform: [
              {
                translateY: heart11Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -25],
                }),
              },
              {
                translateX: heart11Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={50} color="rgba(255, 255, 255, 0.17)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.heart,
          styles.heart12,
          {
            transform: [
              {
                translateY: heart12Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 28],
                }),
              },
              {
                translateX: heart12Position.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -22],
                }),
              },
            ],
          },
        ]}
      >
        <FontAwesome name="heart" size={38} color="rgba(255, 255, 255, 0.21)" />
      </Animated.View>
    </View>
  );
}

export default function AnimatedLogin({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Animation for form appearance
  const formOpacity = useRef(new Animated.Value(0)).current
  const formTranslateY = useRef(new Animated.Value(50)).current

  useEffect(() => {
    // Animate form appearance
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start()
  }, [])

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsLoading(true)
    Keyboard.dismiss()

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      // Fetch user data from backend
      const response = await axios.get(`${API_BASE}/user/get/${uid}`)
      const userData = response.data

      if (userData.status === "banned") {
        setShowModal(true)
        setIsLoading(false)
        return
      }

      // // Store UID and navigate
      // if (rememberMe) {
      //   await AsyncStorage.setItem("userUID", uid)
      // }
        await AsyncStorage.setItem("userUID", uid)

      setError("")
      navigation.replace("MainApp")
    } catch (error) {
      console.error("Login error:", error)
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email")
          break
        case "auth/wrong-password":
          setError("Incorrect password")
          break
        case "auth/invalid-email":
          setError("Invalid email address")
          break
        default:
          setError(error.message || "Login failed")
      }
      setIsLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
  }

  // Button press animation
  const buttonScale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background */}
      <AnimatedBackground />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Feather name="user" size={32} color="#FFFFFF" />
                </View>
                <Text style={styles.title}>Login to your Account</Text>
                <Text style={styles.subtitle}>Welcome back!</Text>
              </View>

              <View style={styles.card}>
                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Feather name="mail" size={20} color="#4CAF50" />
                  </View>
                  <TextInput
                    placeholder="abc@yourdomain.com"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <View style={styles.iconContainer}>
                    <Feather name="lock" size={20} color="#4CAF50" />
                  </View>
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#4CAF50" />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.rememberContainer} onPress={() => setRememberMe(!rememberMe)}>
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Feather name="check" size={14} color="white" />}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonLoading]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                  >
                    {isLoading ? (
                      <Text style={styles.buttonText}>Signing in...</Text>
                    ) : (
                      <Text style={styles.buttonText}>Sign in</Text>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                    <Text style={styles.signupLink}>Sign up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Custom Modal for Account Banned */}
      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Feather name="alert-circle" size={40} color="#FF3B30" />
              <Text style={styles.modalTitle}>Account Banned</Text>
            </View>
            <Text style={styles.modalMessage}>
              Your account has been banned due to breaching our terms of use and policies.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  heart: {
    position: "absolute",
  },
  heart1: {
    top: height * 0.05,
    left: width * 0.08,
  },
  heart2: {
    top: height * 0.10,
    left: width * 0.35,
  },
  heart3: {
    top: height * 0.07,
    right: width * 0.08,
  },
  heart4: {
    top: height * 0.18,
    left: width * 0.18,
  },
  heart5: {
    top: height * 0.22,
    right: width * 0.18,
  },
  heart6: {
    top: height * 0.13,
    left: width * 0.60,
  },
  heart7: {
    top: height * 0.25,
    left: width * 0.48,
  },
  heart8: {
    top: height * 0.30,
    right: width * 0.30,
  },
  heart9: {
    top: height * 0.16,
    right: width * 0.45,
  },
  heart10: {
    top: height * 0.33,
    left: width * 0.25,
  },
  heart11: {
    top: height * 0.04,
    right: width * 0.22,
  },
  heart12: {
    top: height * 0.20,
    left: width * 0.70,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 36,
    width: '100%',
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 28,
    height: 56,
    backgroundColor: "#F9F9F9",
  },
  iconContainer: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333333",
  },
  eyeIcon: {
    padding: 16,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 6,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#4CAF50",
  },
  rememberText: {
    fontSize: 14,
    color: "#666666",
  },
  forgotPassword: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#4CAF50",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#666666",
    fontSize: 16,
  },
  signupLink: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#FF3B30",
    marginBottom: 16,
    fontSize: 14,
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})
