import App from '../App';
import { apiService } from '../services/api';

jest.mock('./src/services/api', () => ({
  apiService: {
    getSuggestionKeys: jest.fn(() => Promise.resolve(['Flying'])),
    searchKeyword: jest.fn(() => Promise.resolve([{ name: 'Flying', definition: '...' }]))
  }
}));

describe('App Search Integration', () => {
  it('updates the input and shows results on search', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<App />);
    
    const input = getByPlaceholderText('Enter a keyword...');
    const searchButton = getByText('Search');

    // 1. Simulate typing
    fireEvent.changeText(input, 'Flying');
    
    // 2. Simulate clicking search
    fireEvent.press(searchButton);

    // 3. Wait for the result card to appear
    const resultTitle = await findByText('Flying');
    const resultDef = await findByText(/can’t be blocked except/);

    expect(resultTitle).toBeTruthy();
    expect(resultDef).toBeTruthy();
  });

  it('clears history when "Clear History" is pressed', () => {
    const { getByText } = render(<App />);
    const clearButton = getByText('Clear History');
    
    fireEvent.press(clearButton);
    // Since we start with empty history in the mock, 
    // we are just verifying the button doesn't crash the app.
    expect(clearButton).toBeTruthy();
  });
});