import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';


export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [pinned, setPinned] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [masterList, setMasterList] = useState([]); 

async function handleSearch(term) {
  const wordToSearch = (term || searchQuery).trim();
  if (!wordToSearch) return;

  setLoading(true);

  try {
    const response = await fetch(`http://192.168.1.25:3000/search?q=${wordToSearch}`);
    const data = await response.json();

    // Check if data is an array and has at least one result
    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      
      const formattedResult = {
        name: result.name,
        description: result.definition 
      };

      setResults([formattedResult]);

      if (!history.includes(formattedResult.name)) {
        setHistory([formattedResult.name, ...history].slice(0, 5));
      }
    } else {
      alert("No definition found for " + wordToSearch);
    }
  } catch (error) {
    console.error(error);
    alert("Connection to server failed. Check if port 3000 is open!");
  } finally {
    setLoading(false);
  }
}
    
useEffect(() => {
  const fetchKeys = async () => {
    try {
      const response = await fetch('http://192.168.1.25:3000/api/keys');
      const data = await response.json();
      setMasterList(data);
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };
  fetchKeys();
}, []);

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
    <SafeAreaView style={{flex: 1, backgroundColor: '#1a1a1a'}}>  
      <View style={styles.container}>
        <Text style={styles.TextContainer}>MTG Keyword Lookup</Text>
        <TextInput style={styles.TextInputContainer} placeholder="Enter a keyword..." value={searchQuery} onChangeText={handleInputchange} />
        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            {suggestions.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(item);
                  setSuggestions([]);
                  handleSearch(item); // Trigger search immediately on click!
                }}
              >
                <Text style={{color: 'gold'}}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* A View to lay out the buttons horizontally */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginTop: 10 }}>
          {/* This is the button to perform search */}
          <TouchableOpacity style={{backgroundColor: '#444', padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} onPress={() => handleSearch()}>
            <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Search</Text>
          </TouchableOpacity>
        {/* This is the button to clear search history */}
        <TouchableOpacity style={{backgroundColor: '#444', padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} onPress={() => setHistory([])}>
          <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Clear History</Text>
        </TouchableOpacity>
        {/* This is the button to clear pinned items */}
        <TouchableOpacity style={{backgroundColor: '#444', padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} onPress={() => setPinned([])}>
          <Text style={{color: '#ffffff', fontWeight: 'bold'}}>Clear Pinned</Text>
        </TouchableOpacity>
        </View>
        {/* This is the view for search history */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 10, justifyContent: 'center' }}>
          {history.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => {
                setSearchQuery(item);
                handleSearch(item);
              }}
              style={{ marginTop: 10, padding: 8, backgroundColor: '#444', borderRadius: 15, marginRight: 5 }}>
              <Text style={{ color: 'gold', fontSize: 12 }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {loading && <Text style={{ color: 'gold', marginTop: 10 }}>Searching Grimoire...</Text>}
        <ScrollView style={styles.ScrollViewContainer}>
          {pinned.map((item, index) => (
            <View key={index} style={[styles.cardContainer, { borderLeftColor: 'gold' }]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name} (Pinned)</Text>
              </View>
              <Text style={styles.cardDescription}>{item.definition}</Text>
            </View>
          ))}
         {/* This is the view for search results */}
          {results.map((item, index) => (
            <View key={index} style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                
                {/* Pin Button */}
                <TouchableOpacity 
                  onPress={() => setPinned([...pinned, item])}
                  style={styles.pinButton}
                >
                  <Text style={{color: 'black', fontWeight: 'bold', fontSize: 10}}>PIN</Text>
                </TouchableOpacity>
                {/* Unpin Button */}
                <TouchableOpacity 
                  onPress={() => setPinned(pinned.filter(p => p !== item))}
                  style={[styles.pinButton, {backgroundColor: '#444', marginLeft: 5}]}
                >
                  <Text style={{color: 'white', fontWeight: 'bold', fontSize: 10}}>UNPIN</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          ))}
        </ScrollView>
        <StatusBar style="auto" />
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'android' ? 40 : 0, // Adjust for Android status bar
  },
  TextContainer:{
    fontSize: 30,
    fontWeight: 'bold',
    color: '#e0e0e0'
  },
  TextInputContainer:{
    height: 50,
    width: '80%',
    borderColor: 'gold',
    color: '#ffffff',
    placeholderTextColor: '#e0e0e0',
    borderWidth: 2,
    paddingLeft: 10,
    marginBottom: 20
  },
  ScrollViewContainer:{
    flex: 1,
    backgroundColor: '#1a1a1a',
    height: '80%',
    width: '100%',
    fontSize: 20,
    color: '#e0e0e0'
  },
  cardContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#2a2a2a', // Slightly lighter than background
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: 'gold', // Gives it that "Legendary" feel
    width: '90%',
    alignSelf: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: 'gold',
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  cardDescription: {
    color: '#e0e0e0',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 5,
  },
  pinButton: {
    backgroundColor: 'gold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  suggestionBox: {
    position: 'absolute', // This makes it float
    top: 110,             // Adjust this based on your TextInput position
    width: '80%',
    backgroundColor: '#333',
    borderRadius: 5,
    zIndex: 1000,         // Ensures it stays on top of everything
    borderWidth: 1,
    borderColor: 'gold',
    elevation: 5,         // Adds a shadow for Android
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
});

