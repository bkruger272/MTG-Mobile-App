import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../Styles/theme';

export default function SuggestionBox({ suggestions, onSelect }) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.suggestionBox}>
      {suggestions.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.suggestionItem}
          onPress={() => onSelect(item)}
        >
          <Text style={{ color: 'gold' }}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}