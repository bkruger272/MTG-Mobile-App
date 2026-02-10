import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';

// We aren't even importing your component yet—just testing the environment
describe('Environment Check', () => {
  it('can render a basic component', () => {
    const { getByText } = render(
      <View>
        <Text>Hello World</Text>
      </View>
    );
    expect(getByText('Hello World')).toBeTruthy();
  });
});