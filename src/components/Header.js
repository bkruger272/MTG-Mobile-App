import React from 'react';
import { View, Image, StyleSheet, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const Header = () => {
  return (
    <View style={styles.headerContainer}>
      {/* The background image */}
      <Image 
        source={require('../../assets/black_lotus.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* The Gradient Overlay to make text/search readable */}
      <LinearGradient
        colors={['transparent', '#121212']} // Fades from transparent to your app's background color
        style={styles.gradient}
      />

      <View style={styles.textContainer}>
        <Text style={styles.title}>MTG Scanner</Text>
        <Text style={styles.subtitle}>Master the Rules</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: width,
    height: 220, // Taller, more cinematic header
    backgroundColor: '#000',
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: 220,
    opacity: 0.6, // Dims the image slightly for a "premium" feel
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100, // Fades the bottom of the image into the app content
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  subtitle: {
    color: '#4db6ac', // A nice "Teal" or "Mana" color
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default Header;