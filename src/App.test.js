import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

describe('YourFormComponent', () => {
  it('renders label and input for "First Name"', () => {
    render(<App />); 

    const firstNameLabel = screen.getByText(/First Name/i);
    const firstNameInput = screen.getByRole('textbox', { name: /First Name/i });

    expect(firstNameLabel).toBeInTheDocument();
    expect(firstNameInput).toBeInTheDocument();
  });
});
