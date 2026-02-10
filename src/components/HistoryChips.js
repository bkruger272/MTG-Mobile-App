import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../Styles/theme';

export default function HistoryChips({ history, onChipPress }) {
  if (history.length === 0) return null;

  return (
    <View style={{ 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      padding: 10, 
      justifyContent: 'center' 
    }}>
      {history.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => onChipPress(item)}
          style={{ 
            marginTop: 10, 
            padding: 8, 
            backgroundColor: COLORS.artifactFrame, 
            borderRadius: 15, 
            marginRight: 5,
            borderWidth: 1,
            borderColor: COLORS.gold
          }}>
          <Text style={{ color: COLORS.gold, fontSize: 12 }}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}