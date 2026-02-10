// /services/api.js

const BASE_URL = 'http://192.168.1.25:3000';

export const apiService = {
  // Fetches the search results for a specific keyword
  searchKeyword: async (query) => {
    try {
      const response = await fetch(`${BASE_URL}/search?q=${query}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Search error:", error);
      throw error;
    }
  },

  // Fetches the master list of keys for the autocomplete suggestions
  getSuggestionKeys: async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/keys`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Keys fetch error:", error);
      throw error;
    }
  }
};