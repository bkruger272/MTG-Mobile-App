import { StyleSheet, Platform } from 'react-native';

export const COLORS = {
  background: '#1a1a1a',
  artifactFrame: '#303030',
  parchment: '#f1e9d2',
  gold: '#fefcaf',
  border: '#4a4a4a',
  textDark: '#000000',
  textLight: '#e0e0e0',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, 
    alignItems: 'center',
    // Removed paddingTop here because SafeAreaView in App.js handles it
  },
  TextInputContainer: {
    height: 50,
    width: '80%',
    backgroundColor: COLORS.artifactFrame, // Darker input box
    borderColor: COLORS.gold,
    color: COLORS.textLight, // Typing text color
    borderWidth: 2,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 5,
  },
  ScrollViewContainer: {
    flex: 1,
    width: '100%',
  },
  cardContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.parchment, 
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.border,
    width: '90%',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: COLORS.textDark, // Dark text on light parchment looks like a real card
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  cardDescription: {
    color: COLORS.textDark, // Dark text for readability on parchment
    fontSize: 16,
    lineHeight: 22,
  },
  pinButton: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  suggestionBox: {
    position: 'absolute',
    top: 70, // Adjusted to sit right under search bar
    width: '80%',
    backgroundColor: COLORS.artifactFrame,
    borderRadius: 5,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: COLORS.gold,
    elevation: 5,
    maxHeight: 200, // Limit height for scrollability
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
});