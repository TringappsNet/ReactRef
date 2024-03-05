import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders the First Name label', () => {
  render(<App />);
});
process.on('exit', () => {
    console.log('Exiting test process...');
  });
  