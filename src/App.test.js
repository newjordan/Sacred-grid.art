import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('grid mode renders canvas and hides audio UI', () => {
  render(<App />);
  expect(screen.queryByText(/Audio Visualization/i)).not.toBeInTheDocument();
});

test('audio mode toggle switches to audio UI', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Audio Mode/i));
  expect(screen.getByText(/Audio Visualization/i)).toBeInTheDocument();
});
