"use client"

import React, { useState } from "react"
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
} from "react-native"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase"
import { Feather, MaterialIcons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

// Color palette
const COLORS = {
  white: "#FFFFFF",
  teaGreen: "#C7F9CC",
  lightGreen: "#80ED99",
  darkGreen: "#00C44F",
  jasmine: "#FFE97F",
  textDark: "#333333",
  textMedium: "#666666",
  textLight: "#999999",
}

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState("")
  const [method, setMethod] = useState("")
  const [loading, setLoading] = useState(false)

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0]
  const slideAnim = useState(new Animated.Value(50))[0]

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    setLoading(true)
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setLoading(false)
        Alert.alert("Success", "Password reset email sent. Please check your inbox.", [
          { text: "OK", onPress: () => navigation.navigate("SignupLogin") },
        ])
      })
      .catch((error) => {
        setLoading(false)
        Alert.alert("Error", error.message)
      })
  }

  const handleBack = () => {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock-reset" size={60} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Select a method to receive the password reset instructions</Text>
          </View>

          <View style={styles.methodsContainer}>
            <TouchableOpacity
              style={[styles.methodCard, method === "sms" && styles.selectedCard]}
              onPress={() => setMethod("sms")}
              activeOpacity={0.7}
            >
              <View style={[styles.methodIconContainer, method === "sms" && styles.selectedMethodIconContainer]}>
                <MaterialIcons name="sms" size={24} color={COLORS.white} />
              </View>
              <View style={styles.methodContent}>
                <Text style={[styles.methodTitle, method === "sms" && styles.selectedText]}>via SMS</Text>
                <Text style={[styles.methodValue, method === "sms" && styles.selectedText]}>+1888•••••111</Text>
              </View>
              {method === "sms" && (
                <View style={styles.checkmark}>
                  <Feather name="check-circle" size={20} color={COLORS.darkGreen} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodCard, method === "email" && styles.selectedCard]}
              onPress={() => setMethod("email")}
              activeOpacity={0.7}
            >
              <View style={[styles.methodIconContainer, method === "email" && styles.selectedMethodIconContainer]}>
                <MaterialIcons name="email" size={24} color={COLORS.white} />
              </View>
              <View style={styles.methodContent}>
                <Text style={[styles.methodTitle, method === "email" && styles.selectedText]}>via Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>
              </View>
              {method === "email" && (
                <View style={styles.checkmark}>
                  <Feather name="check-circle" size={20} color={COLORS.darkGreen} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, (!email || !method || loading) && styles.buttonDisabled]}
            onPress={handleResetPassword}
            disabled={!email || !method || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpLink} onPress={() => navigation.navigate("SignupLogin")}>
            <Text style={styles.helpText}>
              Remember your password? <Text style={styles.linkText}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoid: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.darkGreen,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 8,
    borderColor: COLORS.teaGreen,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "80%",
  },
  methodsContainer: {
    marginBottom: 30,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    borderColor: COLORS.lightGreen,
    backgroundColor: "rgba(199, 249, 204, 0.2)",
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.jasmine,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  selectedMethodIconContainer: {
    backgroundColor: COLORS.darkGreen,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    color: COLORS.textMedium,
    marginBottom: 4,
    fontWeight: "500",
  },
  methodValue: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: "600",
  },
  selectedText: {
    color: COLORS.darkGreen,
  },
  checkmark: {
    marginLeft: 8,
  },
  inputContainer: {
    marginTop: 4,
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.lightGreen,
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontSize: 16,
    color: COLORS.textDark,
    width: width * 0.5,
  },
  button: {
    backgroundColor: COLORS.darkGreen,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.darkGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "rgba(0, 196, 79, 0.5)",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  helpLink: {
    marginTop: 24,
    alignItems: "center",
    padding: 12,
    borderRadius: 30,
    width: "60%",
    alignSelf: "center",
    borderWidth: 1,
    borderColor: COLORS.jasmine,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  linkText: {
    color: COLORS.darkGreen,
    fontWeight: "bold",
  },
})
