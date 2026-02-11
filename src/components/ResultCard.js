import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../Styles/theme'; // Adjust path if needed

const ResultCard = ({ item, isPinned, onPin }) => {
  // 1. Safety check: If item is undefined, don't render anything
  if (!item) return null;

  // 2. Logic for labels
  const sourceLabel = item.source === 'scryfall' ? 'SCRYFALL DATA' : 'REFERENCE GUIDE';
  const badgeColor = item.source === 'scryfall' ? '#2196F3' : '#673AB7';

  return (
    <View style={[styles.card, { borderLeftWidth: 5, borderLeftColor: badgeColor, marginBottom: 15, padding: 15, backgroundColor: '#1e1e1e', borderRadius: 8 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          {/* Use item.name, not just item */}
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
          
          <View style={{ 
            backgroundColor: badgeColor, 
            alignSelf: 'flex-start', 
            paddingHorizontal: 6, 
            paddingVertical: 2, 
            borderRadius: 4,
            marginVertical: 5 
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{sourceLabel}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => onPin(item)} style={{ padding: 5 }}>
          <Text style={{ fontSize: 20 }}>{isPinned ? "📌" : "📍"}</Text>
        </TouchableOpacity>
      </View>

      {/* Use item.description, not just item */}
      <Text style={{ color: '#ccc', marginTop: 5, lineHeight: 20 }}>{item.description}</Text>
    </View>
  );
};

export default ResultCard;