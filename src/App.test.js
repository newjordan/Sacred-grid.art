
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

test('audio panel can be hidden and restored', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Audio Mode/i));

  fireEvent.click(screen.getByRole('button', { name: /hide/i }));
  expect(screen.queryByText(/Audio Visualization/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /audio/i }));
  expect(screen.getByText(/Audio Visualization/i)).toBeInTheDocument();
});