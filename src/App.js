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
    
    setShowScanner(false);
    setLoading(true);
    setSearchQuery(detectedName);

    try {
      // 1. Get exact card data from Scryfall
      const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(detectedName)}`);
      
      if (!response.ok) {
      alert(`The Grimoire couldn't find a match for "${detectedName}". Try a different angle!`);
      return;
    }
      
      const cardData = await response.json();
      
      setSearchQuery(cardData.name);

      const keywords = cardData.keywords || [];
      
      if (keywords.length === 0) {
        alert(`Found "${cardData.name}", but it has no keyword abilities!`);
        return;
      }

      // 3. Automatically fetch definitions and "Pin" them
      const newPinnedItems = [];
        for (const word of keywordsFound) {
            try {
                const definitionData = await searchKeywords(word);
                if (definitionData && definitionData[0]) {
                newPinnedItems.push({
                    name: definitionData[0].name,
                    description: definitionData[0].definition,
                    source: definitionData[0].source,
                });
                }
            } catch (e) {
                console.log(`Definition for ${word} not found in backend.`);
            }
        }

      // 4. Update the UI with the pinned results
        setPinnedWords((prev) => {
            const existingNames = new Set(prev.map((p) => p.name));
            const filteredNew = newPinnedItems.filter((item) => !existingNames.has(item.name));
            return [...filteredNew, ...prev];
            });

        } catch (error) {
            console.error("Scan processing failed:", error);
            alert("The Grimoire is flickering. Check your internet connection!");
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
                onPress={() => setHistory([])}
            >
                <Text style={{ color: COLORS.textLight, fontWeight: 'bold', textAlign: 'center' }}>Clear</Text>
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
            Version 1.1.0 | © 2026 Brandon Kruger{"\n"}
            Camera used for card identification only. No data is stored.
            </Text>
        </View>
        </SafeAreaView>
    );
}

