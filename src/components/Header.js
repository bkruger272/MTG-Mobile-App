import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../Styles/theme';

export default function Header() {
  return (
    <View style={headerStyles.container}>
      {/* Left Image */}
      <Image 
        source={require('../../assets/black_lotus.png')} 
        style={headerStyles.sideImage}
        resizeMode="contain"
        accessibilityRole="image"
      />

      <View style={headerStyles.textContainer}>
        <Text style={headerStyles.title}>MTG KEYWORD</Text>
        <Text style={headerStyles.subtitle}>LOOKUP</Text>
      </View>

      {/* Right Image */}
      <Image 
        source={require('../../assets/grimoire-icon.jpg')} 
        style={headerStyles.sideImage}
        resizeMode="contain"
        accessibilityRole="image"
      />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  paddingHorizontal: 20,
  // Increase this to push it below the camera notch
  paddingTop: Platform.OS === 'android' ? 45 : 15, 
  paddingBottom: 15,
  backgroundColor: COLORS.artifactFrame,
  borderBottomWidth: 2,
  borderBottomColor: COLORS.gold,
  elevation: 4,
  zIndex: 10,
  },
  sideImage: {
  width: 50, 
  height: 50,
  backgroundColor: COLORS.background, 
  borderWidth: 2,
  borderColor: 'white'
  },
  textContainer: {
    flex: 1, // Let text take up middle space
    alignItems: 'center',
  },
  title: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    color: COLORS.gold,
    fontSize: 12,
    opacity: 0.8,
  },
});