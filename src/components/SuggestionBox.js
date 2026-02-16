import React from 'react';
// Added ScrollView to the imports below!
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'; 
import { styles } from '../Styles/theme';

export default function SuggestionBox({ suggestions, onSelect }) {
    if (suggestions.length === 0) return null;

    return (
        /* Use the 'suggestionBox' style name from your theme.js */
        <View style={styles.suggestionBox}> 
            <ScrollView 
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true} 
            >
                {suggestions.map((item, index) => (
                    /* Note: Ensure your theme.js has 'suggestionItem' 
                       and 'suggestionText' styles, or use inline styles 
                    */
                    <TouchableOpacity 
                        key={index} 
                        style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' }} 
                        onPress={() => onSelect(item)}
                    >
                        <Text style={{ color: '#E0E0E0', fontSize: 16 }}>{item}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}