import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

export default function AboutUs({ navigation }) {
  const nav = navigation || useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  // Parallax and opacity effects for header
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 1.5, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [0, -20, -40],
    extrapolate: 'clamp',
  });

  // Rotating animation for the background circles
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Start Lottie animation
    if (lottieRef.current) {
      console.log('Lottie animation source:', require('../assets/heart-animation.json'));
      lottieRef.current.play();
    }
  }, [fadeAnim, scaleAnim, translateYAnim, rotateAnim]);

  // Animation for staggered feature items
  const animateFeatureItems = (index) => {
    return {
      opacity: fadeAnim,
      transform: [
        {
          translateY: Animated.multiply(
            translateYAnim,
            new Animated.Value(1 + index * 0.2)
          )
        },
        { scale: Animated.add(0.9, Animated.multiply(scaleAnim, new Animated.Value(0.1))) }
      ],
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Animated Background Circles */}
      <Animated.View style={[styles.backgroundCircles, { transform: [{ rotate: spin }] }]}>
        <View style={[styles.circle, { backgroundColor: 'rgba(199, 249, 204, 0.3)', top: -100, left: -100 }]} />
        <View style={[styles.circle, { backgroundColor: 'rgba(128, 237, 153, 0.2)', top: height * 0.3, right: -150 }]} />
        <View style={[styles.circle, { backgroundColor: 'rgba(0, 196, 79, 0.15)', bottom: -100, left: width * 0.3 }]} />
        <View style={[styles.circle, { backgroundColor: 'rgba(255, 233, 127, 0.2)', top: height * 0.6, left: -50 }]} />
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Parallax Header */}
        <Animated.View 
          style={[
            styles.headerContainer, 
            { 
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity 
            }
          ]}
        >
          <Svg height={HEADER_HEIGHT} width={width} style={styles.headerSvg}>
            <Defs>
              <LinearGradient id="headerGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#00C44F" stopOpacity="1" />
                <Stop offset="1" stopColor="#80ED99" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Path
              d={`M0 0 L${width} 0 L${width} ${HEADER_HEIGHT * 0.8} Q${width * 0.8} ${HEADER_HEIGHT * 1.1} ${width * 0.5} ${HEADER_HEIGHT * 0.85} Q${width * 0.2} ${HEADER_HEIGHT * 0.6} 0 ${HEADER_HEIGHT * 0.7} Z`}
              fill="url(#headerGradient)"
            />
            <Circle cx={width * 0.8} cy={HEADER_HEIGHT * 0.3} r="20" fill="rgba(255, 255, 255, 0.2)" />
            <Circle cx={width * 0.2} cy={HEADER_HEIGHT * 0.5} r="15" fill="rgba(255, 255, 255, 0.15)" />
            <Circle cx={width * 0.7} cy={HEADER_HEIGHT * 0.6} r="10" fill="rgba(255, 255, 255, 0.1)" />
          </Svg>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={80} tint="light" style={styles.blurView}>
              <Ionicons name="arrow-back" size={24} color="#00C44F" />
            </BlurView>
          </TouchableOpacity>

          <Animated.View 
            style={[
              styles.headerTitleContainer, 
              { 
                transform: [
                  { scale: titleScale },
                  { translateY: titleTranslateY }
                ] 
              }
            ]}
          >
            <MaskedView
              maskElement={
                <Text style={styles.headerTitle}>About Us</Text>
              }
            >
              <LinearGradient
                colors={['#FFFFFF', '#FFE97F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1 }}
              >
                <Text style={[styles.headerTitle, { opacity: 0 }]}>About Us</Text>
              </LinearGradient>
            </MaskedView>
          </Animated.View>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo Section with Animation */}
          <Animated.View 
            style={[
              styles.logoSection,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: translateYAnim }
                ]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoInnerGlow} />
              <View style={styles.logoOuterGlow} />
              <LottieView
                ref={lottieRef}
                source={require('../assets/heart-animation.json')}
                style={styles.logoLottie}
                autoPlay={true}
                loop={true}
                speed={0.8}
              />
            </View>
            <Text style={styles.appName}>Sadaꓘa</Text>
            <Text style={styles.tagline}>Making Charity Accessible to Everyone</Text>
          </Animated.View>

          {/* Mission Section with Animation */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: Animated.multiply(translateYAnim, new Animated.Value(1.2)) }
                ]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons name="target" size={24} color="#00C44F" />
              </View>
              <Text style={styles.sectionTitle}>Our Mission</Text>
            </View>
            <View style={styles.glassCard}>
              <BlurView intensity={80} tint="light" style={styles.blurViewCard}>
                <Text style={styles.sectionText}>
                  Sadaꓘa is dedicated to making acts of kindness and charity accessible to everyone in Tunisia. We believe in the power of our Tunisian community and the impact of collective giving to support local causes and families in need.
                </Text>
              </BlurView>
            </View>
          </Animated.View>

          {/* Vision Section with Animation */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: Animated.multiply(translateYAnim, new Animated.Value(1.4)) }
                ]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons name="eye-outline" size={24} color="#00C44F" />
              </View>
              <Text style={styles.sectionTitle}>Our Vision</Text>
            </View>
            <View style={styles.glassCard}>
              <BlurView intensity={80} tint="light" style={styles.blurViewCard}>
                <Text style={styles.sectionText}>
                  To become Tunisia's most trusted and efficient platform for charitable giving, connecting donors with those in need across the country, and making a positive impact in every region.
                </Text>
              </BlurView>
            </View>
          </Animated.View>

          {/* Features Section with Staggered Animation */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons name="star-four-points-outline" size={24} color="#00C44F" />
              </View>
              <Text style={styles.sectionTitle}>What We Offer</Text>
            </View>
            <View style={styles.featuresGrid}>
              {[
                { icon: "hand-holding-heart", title: "Easy Donations", text: "Donate easily and securely to Tunisian causes" },
                { icon: "users", title: "Community", text: "Connect with Tunisians who care" },
                { icon: "chart-line", title: "Transparency", text: "Track your impact in Tunisia in real-time" },
                { icon: "shield-alt", title: "Security", text: "Safe and secure transactions for all Tunisians" }
              ].map((feature, index) => (
                <Animated.View 
                  key={index} 
                  style={[styles.featureItem, animateFeatureItems(index)]}
                >
                  <View style={styles.featureIconContainer}>
                    <LinearGradient
                      colors={['#00C44F', '#80ED99']}
                      style={styles.featureIconGradient}
                    >
                      <FontAwesome5 name={feature.icon} size={24} color="#fff" />
                    </LinearGradient>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <FontAwesome5 name={feature.icon} size={18} color="#00C44F" style={{ marginRight: 8 }} />
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Impact Stats Section */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: Animated.multiply(translateYAnim, new Animated.Value(1.6)) }
                ]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons name="chart-bar" size={24} color="#00C44F" />
              </View>
              <Text style={styles.sectionTitle}>Our Impact</Text>
            </View>
            <View style={styles.statsContainer}>
              {[
                { value: "10K+", label: "Tunisian Donors" },
                { value: "1.5M TND", label: "Raised Locally" },
                { value: "100+", label: "Projects in Tunisia" },
              ].map((stat, index) => (
                <View key={index} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <View style={[styles.statBar, { width: `${70 + index * 10}%` }]} />
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Contact Section with Animation */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: Animated.multiply(translateYAnim, new Animated.Value(1.8)) }
                ]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <MaterialCommunityIcons name="card-account-phone-outline" size={24} color="#00C44F" />
              </View>
              <Text style={styles.sectionTitle}>Contact Us</Text>
            </View>
            <View style={styles.glassCard}>
              <BlurView intensity={80} tint="light" style={styles.blurViewCard}>
                <View style={styles.contactInfo}>
                  {[
                    { icon: "mail-outline", text: "support@sadaka.tn" },
                    { icon: "call-outline", text: "+216 XX XXX XXX" },
                    { icon: "location-outline", text: "Tunis, Tunisia" }
                  ].map((contact, index) => (
                    <View key={index} style={styles.contactItem}>
                      <LinearGradient
                        colors={['#00C44F', '#80ED99']}
                        style={styles.contactIconGradient}
                      >
                        <Ionicons name={contact.icon} size={20} color="#fff" />
                      </LinearGradient>
                      <Text style={styles.contactText}>{contact.text}</Text>
                    </View>
                  ))}
                </View>
              </BlurView>
            </View>
          </Animated.View>

          {/* Social Media Links */}
          <View style={styles.socialContainer}>
            {["logo-facebook", "logo-twitter", "logo-instagram", "logo-linkedin"].map((icon, index) => (
              <TouchableOpacity key={index} style={styles.socialButton}>
                <LinearGradient
                  colors={['#00C44F', '#80ED99']}
                  style={styles.socialIconGradient}
                >
                  <Ionicons name={icon} size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Simple Support Sadaꓘa Button (Above Footer) */}
          <View style={{ alignItems: 'center', marginBottom: 8, marginTop: -8 }}>
            <TouchableOpacity
              style={styles.simpleSupportButton}
              onPress={() => nav.navigate('SupportScreen')}
            >
              <Text style={styles.simpleSupportButtonText}>Support Sadaꓘa</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 Sadaꓘa. All rights reserved.</Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <LinearGradient
          colors={['#FFE97F', '#00C44F']}
          style={styles.fabGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundCircles: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    top: -height / 2,
    left: -width / 2,
  },
  circle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  blurView: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    position: 'absolute',
    bottom: 60,
    width: width * 0.8,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
  },
  content: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 0,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoContainer: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoInnerGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 196, 79, 0.2)',
  },
  logoOuterGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 196, 79, 0.1)',
  },
  logoLottie: {
    width: 240,
    height: 240,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00C44F',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 196, 79, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 196, 79, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00C44F',
  },
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  blurViewCard: {
    padding: 20,
  },
  sectionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  featureIconContainer: {
    marginBottom: 15,
    shadowColor: '#00C44F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  featureIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00C44F',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  statItem: {
    marginBottom: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C44F',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statBar: {
    height: 6,
    backgroundColor: '#00C44F',
    borderRadius: 3,
  },
  contactInfo: {
    paddingVertical: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#555',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  socialButton: {
    marginHorizontal: 10,
    shadowColor: '#00C44F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  socialIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleSupportButton: {
    backgroundColor: '#00C44F',
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    elevation: 2,
    shadowColor: '#00C44F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  simpleSupportButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'none',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    shadowColor: '#00C44F',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});