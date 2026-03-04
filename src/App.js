import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Text, StatusBar, Platform,Keyboard,StyleSheet } from 'react-native';
import { styles, COLORS } from './Styles/theme';    
import ResultCard from './components/ResultCard';
import HistoryChips from './components/HistoryChips';
import SuggestionBox from './components/SuggestionBox';
import Header from './components/Header';
import { searchKeywords, getSuggestionKeys } from './services/api';
import ScannerView from './components/ScannerView';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [masterList, setMasterList] = useState([]); 
  const [currentResult, setCurrentResult] = useState(null); 
  const [pinnedWords, setPinnedWords] = useState([]);    
  const [showScanner, setShowScanner] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

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

const handleSelectSuggestion = (word) => {
    Keyboard.dismiss();      
    setSearchQuery(word);    
    setSuggestions([]);      
    handleSearch(word);      
};

async function handleSearch(term) {
    const wordToSearch = (term || searchQuery).trim();
    if (!wordToSearch) return;

    setLoading(true);
    try {
        const data = await searchKeywords(wordToSearch);
        const result = data && data[0];

        if (!result || result.source === 'not_found' || !result.definition) {
            alert(
                `Keyword Not Found: "${wordToSearch}"\n\n` +
                `The Grimoire doesn't recognize this term. Please check your spelling!`
            );
            setResults([]); 
        } 
        else if (result.source === 'error') {
            alert("The Grimoire is having trouble connecting.");
        } 
        else {
            const formattedResult = {
                name: result.name || wordToSearch,
                description: result.definition,
                source: result.source
            };
            
            setResults([formattedResult]);
            setCurrentResult(formattedResult);
            
            if (!history.includes(formattedResult.name)) {
                setHistory([formattedResult.name, ...history].slice(0, 5));
            }
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            alert("Network error. Please try again.");
        }
    } finally {
        setLoading(false);
    }
}
//handle input change so that it will filter on text change
const handleInputchange = (text) => {
  setSearchQuery(text);

  if (text.length > 1) {
    const filteredSuggestions = masterList
      .filter(keyword => {
        const lowerKeyword = keyword.toLowerCase();
        const lowerSearch = text.toLowerCase();
        
        // 1. MUST start with or contain the search term
        const matches = lowerKeyword.includes(lowerSearch);
        
        // 2. BLACKLIST: Remove junk words that aren't real keywords
        const isJunk = ["rally", "chroma", "landfall", "constellation"].includes(lowerKeyword);
        
        return matches && !isJunk;
      })
      // 3. SORT: Put words that START with the search term at the top
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(text.toLowerCase());
        const bStarts = b.toLowerCase().startsWith(text.toLowerCase());
        return aStarts === bStarts ? 0 : aStarts ? -1 : 1;
      });

    setSuggestions(filteredSuggestions);
  } else {
    setSuggestions([]);
  }
};

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


const handleScanResult = async (detectedName) => {
      if (!detectedName) return;
      
      // 1. Aggressive Clean: Remove EVERYTHING except letters, numbers, and spaces
      const cleanName = detectedName.replace(/[^a-zA-Z0-9\s]/g, "").trim();
      
      const scryfallUrl = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cleanName)}`;
      console.log("DEBUG: Fetching from URL ->", scryfallUrl); 
      
      setShowScanner(false);
      setLoading(true);

          try {
          const scryfallRes = await fetch(scryfallUrl, {
              method: 'GET',
              headers: {
                  // Scryfall specifically asks for these two
                  'User-Agent': 'GrimoireMTG/1.1.0', 
                  'Accept': 'application/json',
              }
          });
          
          if (!scryfallRes.ok) {
              const errorData = await scryfallRes.json();
              console.log("Scryfall Error Details:", errorData.details);
              alert(`Grimoire Error: ${errorData.details}`);
              setLoading(false);
              return;
          }
          
          const cardData = await scryfallRes.json();
          console.log("Card Data Found:", cardData.name, "Keywords:", cardData.keywords);
          const keywordsToLookup = cardData.keywords || [];

          // Update the UI to show which card we found
          setSearchQuery(`Card: ${cardData.name}`);

          if (keywordsToLookup.length === 0) {
              alert(`"${cardData.name}" is a vanilla card (no keywords).`);
              setLoading(false);
              return;
          }

          // 2. KEYWORD TRACK: Feed those keywords into your existing backend lookup
          const foundDefinitions = [];
          for (const word of keywordsToLookup) {
                // Try searching for the word as-is
                const data = await searchKeywords(word.toLowerCase(), true); 
                if (data && data[0]) {
                    foundDefinitions.push({
                        name: data[0].name,
                        description: data[0].definition,
                        source: data[0].source
                  });
              }
          }

          // 3. DISPLAY: Pin the results to the top
          setPinnedWords((prev) => {
              const existingNames = new Set(prev.map(p => p.name));
              const freshOnes = foundDefinitions.filter(d => !existingNames.has(d.name));
              return [...freshOnes, ...prev];
          });

      } catch (error) {
          console.error("Dual-track process failed:", error);
      } finally {
          setLoading(false);
      }
  };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <StatusBar barStyle="light-content" />
        

        {/* 2. HEADER */}
        <Header /> 

        <View style={styles.container}>
            {/* 3. SEARCH INPUT */}
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
            onSelect={handleSelectSuggestion} 
            />

            {/* 4. BUTTON ROW (Now includes the Scan Button) */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 10 }}>
            <TouchableOpacity 
                style={{ backgroundColor: COLORS.gold, padding: 10, borderRadius: 5, flex: 1, marginRight: 5 }} 
                onPress={() => setShowScanner(true)}
            >
                <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'center' }}>📸 Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={{ backgroundColor: COLORS.border, padding: 10, borderRadius: 5, flex: 1, marginRight: 5 }} 
                onPress={() => {
                handleSearch(); 
                Keyboard.dismiss();
                }}
            >
                <Text style={{ color: COLORS.textLight, fontWeight: 'bold', textAlign: 'center' }}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={{ backgroundColor: COLORS.border, padding: 10, borderRadius: 5, flex: 1 }} 
                onPress={() => {
                    setHistory([]);      // Clears chips
                    setPinnedWords([]);   // Clears the Trample/Haste banners
                    setResults([]);       // Clears the main result
                    setSearchQuery('');   // Clears the text input
                }}
            >
                <Text style={{ color: COLORS.textLight, fontWeight: 'bold', textAlign: 'center' }}>Clear All</Text>
            </TouchableOpacity>
            
            </View>

            {/* 5. HISTORY CHIPS */}
            <HistoryChips 
            history={history} 
            onChipPress={(item) => {
                setSearchQuery(item);
                handleSearch(item);
            }} 
            />

            {loading && <Text style={{ color: 'gold', marginTop: 10 }}>Consulting the Grimoire...</Text>}

            {/* 6. RESULTS AREA */}
            <ScrollView 
            style={styles.ScrollViewContainer}
            keyboardDismissMode="on-drag"
            >
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
        {/* 1. FULL SCREEN SCANNER OVERLAY */}
        {showScanner && (
            <View style={StyleSheet.absoluteFillObject}> 
                <ScannerView 
                    onClose={() => setShowScanner(false)} 
                    onCardDetected={(name) => {
                        handleScanResult(name);
                        setShowScanner(false); // Close it once we find the card!
                    }} 
                    torch={torchOn} 
                />
            </View>
        )}
        {/* 7. FOOTER */}
        <View style={{ padding: 15, backgroundColor: COLORS.background }}>
            <Text style={{ color: COLORS.textLight, fontSize: 10, textAlign: 'center', opacity: 0.6 }}>
            Version 1.1.1 | © 2026 Brandon Kruger{"\n"}
            Camera used for card identification only. No data is stored.
            </Text>
        </View>
        </SafeAreaView>
    );
}

