import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../Styles/theme';

export default function SuggestionBox({ suggestions, onSelect }) {
  if (suggestions.length === 0) return null;

    return (
            <View style={styles.outerWrapper}>
                {/* We use a ScrollView with a set Max Height */}
                <ScrollView 
                    style={styles.container} 
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true} // Crucial for Android
                >
                    {suggestions.map((item, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.item} 
                            onPress={() => onSelect(item)}
                        >
                            <Text style={styles.text}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
}