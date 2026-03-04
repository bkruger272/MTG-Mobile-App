// /services/api.js


const BASE_URL = 'https://mtg-keyword-backend.onrender.com/api'; 
//const BASE_URL = 'http://192.168.1.25:3000/api';

let searchController = null; // Holds the current request

export const searchKeywords = async (word, isAuto = false) => {
  // Only abort if it's a manual user-typed search
  if (searchController && !isAuto) {
    searchController.abort();
  }

  searchController = new AbortController();

  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(word)}`, {
      signal: isAuto ? null : searchController.signal // Don't use signal for auto-scans
    });
    
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') return null; 
    throw error;
  }
};

export const getSuggestionKeys = async () => {
  try {
    const response = await fetch(`${BASE_URL}/keys`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Keys fetch error:", error);
    throw error;
  }
};