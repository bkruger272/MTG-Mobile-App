import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Text, StatusBar, Platform } from 'react-native';
import { styles, COLORS } from './Styles/theme'; 
import { apiService } from './services/api';     
import ResultCard from './components/ResultCard';
import HistoryChips from './components/HistoryChips';
import SuggestionBox from './components/SuggestionBox';
import Header from './components/Header';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [pinned, setPinned] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [masterList, setMasterList] = useState([]); 
  
// 1. Effects stay at the top
useEffect(() => {
  const loadSuggestions = async () => {
    try {
      const data = await apiService.getSuggestionKeys();
      setMasterList(data);
    } catch (error) {
      console.error("Master list failed to load");
    }
  };
  loadSuggestions();
}, []);

// 2. Logic functions follow
async function handleSearch(term) {
  const wordToSearch = (term || searchQuery).trim();
  if (!wordToSearch) return;

  setLoading(true);
  try {
    
    const data = await apiService.searchKeyword(wordToSearch);

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      const formattedResult = {
        name: result.name,
        description: result.definition 
      };
      setResults([formattedResult]);
      
      // Update history
      if (!history.includes(formattedResult.name)) {
        setHistory([formattedResult.name, ...history].slice(0, 5));
      }
    } else {
      alert("No definition found for " + wordToSearch);
    }
  } catch (error) {
    alert("Connection to server failed.");
  } finally {
    setLoading(false);
  }
}

const handleInputchange = (text) => {
  setSearchQuery(text);

  if (text.length > 1) {
    // Filter the masterList we got from the server instead of mockKeywords
    const filteredSuggestions = masterList.filter(keyword => 
      keyword.toLowerCase().startsWith(text.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  } else {
    setSuggestions([]);
  }
};


  return (
<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
  <Header /> 
      <View style={styles.container}>
        <TextInput 
          style={styles.TextInputContainer} 
          placeholder="Enter a keyword..." 
          placeholderTextColor={COLORS.textLight} // Uses the variable from your theme
          value={searchQuery} 
          onChangeText={handleInputchange} 
        />

        <SuggestionBox 
          suggestions={suggestions} 
          onSelect={(item) => {
            setSearchQuery(item);
            setSuggestions([]);
            handleSearch(item);
          }} 
        />
        {/* A View to lay out the buttons horizontally */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginTop: 10 }}>
          {/* This is the button to perform search */}
          <TouchableOpacity style={{backgroundColor: COLORS.border, padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} onPress={() => handleSearch()}>
            <Text style={{color: COLORS.textLight, fontWeight: 'bold'}}>Search</Text>
          </TouchableOpacity>
        {/* This is the button to clear search history */}
        <TouchableOpacity style={{backgroundColor: COLORS.border, padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} onPress={() => setHistory([])}>
          <Text style={{color: COLORS.textLight, fontWeight: 'bold'}}>Clear History</Text>
        </TouchableOpacity>
        {/* This is the button to clear pinned items */}
        <TouchableOpacity style={{backgroundColor: COLORS.border, padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} onPress={() => setPinned([])}>
          <Text style={{color: COLORS.textLight, fontWeight: 'bold'}}>Clear Pinned</Text>
        </TouchableOpacity>
        </View>
        {/* This is the view for search history */}
        <HistoryChips 
          history={history} 
          onChipPress={(item) => {
            setSearchQuery(item);
            handleSearch(item);
          }} 
        />
        {loading && <Text style={{ color: 'gold', marginTop: 10 }}>Searching Grimoire...</Text>}
        <ScrollView style={styles.ScrollViewContainer}>
          {pinned.map((item, index) => (
            <ResultCard 
              key={`pinned-${index}`} 
              item={item} 
              isPinned={true} 
              onUnpin={(item) => setPinned(pinned.filter(p => p !== item))} 
            />
          ))}

          {results.map((item, index) => (
            <ResultCard 
              key={`result-${index}`} 
              item={item} 
              isPinned={false} 
              onPin={(item) => setPinned([...pinned, item])} 
            />
          ))}
        </ScrollView>
      </View>
      
      {/* Footer */}
      <View style={{ padding: 20, backgroundColor: COLORS.background }}>
        <Text style={{ color: COLORS.textLight, fontSize: 10, textAlign: 'center', opacity: 0.6 }}>
          Version 1.0.0 | © 2024 Brandon Kruger{"\n"}
          This app is unofficial Fan Content permitted under the Fan Content Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

