import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles, COLORS } from '../Styles/theme';

export default function ResultCard({ item, isPinned, onPin, onUnpin }) {
  return (
    <View style={[styles.cardContainer, isPinned && { borderLeftColor: 'gold' }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name} {isPinned ? '(Pinned)' : ''}</Text>
        
        <View style={{ flexDirection: 'row' }}>
          {!isPinned ? (
            <TouchableOpacity onPress={() => onPin(item)} style={styles.pinButton}>
              <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 10 }}>PIN</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => onUnpin(item)} 
              style={[styles.pinButton, { backgroundColor: COLORS.artifactFrame }]}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>UNPIN</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.cardDescription}>{item.description || item.definition}</Text>
    </View>
  );
}