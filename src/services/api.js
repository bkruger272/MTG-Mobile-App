// /services/api.js


const BASE_URL = 'https://mtg-keyword-backend.onrender.com/api'; 

export const searchKeywords = async (query) => {
  try {

    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
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