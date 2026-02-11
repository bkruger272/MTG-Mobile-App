import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Text, StatusBar, Platform,Keyboard } from 'react-native';
import { styles, COLORS } from './Styles/theme';    
import ResultCard from './components/ResultCard';
import HistoryChips from './components/HistoryChips';
import SuggestionBox from './components/SuggestionBox';
import Header from './components/Header';
import { searchKeywords, getSuggestionKeys } from './services/api';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [masterList, setMasterList] = useState([]); 
  const [currentResult, setCurrentResult] = useState(null); 
  const [pinnedWords, setPinnedWords] = useState([]);    

// 0. Load helper to wake up server for free hosting, pervents lag time
  useEffect(() => {
    // This is our "Pre-warm" call
    const wakeUpServer = async () => {
      try {
        await fetch('https://mtg-keyword-backend.onrender.com/health');
        console.log("Backend wake-up signal sent.");
      } catch (error) {
        console.log("Server is still sleeping or warming up...");
      }
    };
    wakeUpServer();
  }, []);
// 1. Load suggestion keys on mount
useEffect(() => {
  const loadSuggestions = async () => {
    try {
      // REMOVE 'apiService.'
      const data = await getSuggestionKeys(); 
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
    
    const data = await searchKeywords(wordToSearch);

    if (data === null) return;

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      
        const formattedResult = {
        name: result.name,
        description: result.definition,
        source: result.source 
        };  


      setResults([formattedResult]);
      
      // Update history (only if it's a new word)
      if (!history.includes(formattedResult.name)) {
        setHistory([formattedResult.name, ...history].slice(0, 5));
      }
    } else {
      alert("No definition found for " + wordToSearch);
    }
  } catch (error) {
  // Only alert if it's a REAL error, not an Abort
  if (error.name !== 'AbortError') {
    alert("Connection to server failed.");
    }
  } finally {
    setLoading(false);
  }
}
//handle input change so that it will filter on text change
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
  } ;

const handlePin = (item) => {
  if (!item || !item.name) {
    alert("Search a valid keyword first!");
    return;
  }

  const isAlreadyPinned = pinnedWords.some(p => p.name === item.name);

  if (isAlreadyPinned) {
    // Remove it
    setPinnedWords(prev => prev.filter(p => p.name !== item.name));
  } else {
    // Add it
    setPinnedWords(prev => [item, ...prev]);
  }
};

  return (
<SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
  <Header /> 
      <View style={styles.container}>
        <TextInput 
          style={styles.TextInputContainer} 
          placeholder="Enter a keyword..." 
          placeholderTextColor={COLORS.textLight} 
          value={searchQuery} 
          onChangeText={handleInputchange} 

          returnKeyType="search"
          onSubmitEditing={() => {
            handleSearch();
            Keyboard.dismiss();
          }}
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
          <TouchableOpacity style={{backgroundColor: COLORS.border, padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} 
                            onPress={() => {
                                      handleSearch(); 
                                      Keyboard.dismiss();
                                    }}
                                    >
            <Text style={{color: COLORS.textLight, fontWeight: 'bold'}}>Search</Text>
          </TouchableOpacity>
        {/* This is the button to clear search history */}
        <TouchableOpacity style={{backgroundColor: COLORS.border, padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} onPress={() => setHistory([])}>
          <Text style={{color: COLORS.textLight, fontWeight: 'bold'}}>Clear History</Text>
        </TouchableOpacity>
        {/* This is the button to clear pinned items */}
        <TouchableOpacity style={{backgroundColor: COLORS.border, padding: 10, borderRadius: 5, flex: 1, marginRight: 10}} onPress={() => setPinnedWords([])}>
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
        <ScrollView style={styles.ScrollViewContainer}
                    keyboardDismissMode="on-drag">
          {pinnedWords.map((item, index) => (
            <ResultCard 
                  key={`pinned-${index}`} 
                  item={item} 
                  isPinned={true} 
                  onPin={() => handlePin(item)} 
                />
          ))}
          {results.map((item, index) => (
              <ResultCard 
                key={`result-${index}`} 
                item={item} 
                isPinned={pinnedWords.some(p => p.name === item.name)} 
                onPin={() => handlePin(item)} 
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

