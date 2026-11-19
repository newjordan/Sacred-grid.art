import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// The app starts with the GUI hidden behind a single "Show Controls" button.
const showControls = () => {
  fireEvent.click(screen.getByRole('button', { name: /show controls/i }));
};

test('grid mode renders canvas and hides audio UI', () => {
  render(<App />);
  expect(screen.queryByText(/Audio Visualization/i)).not.toBeInTheDocument();
});

test('audio mode toggle switches to audio UI', () => {
  render(<App />);
  showControls();
  fireEvent.click(screen.getByText(/Audio Mode/i));
  expect(screen.getByText(/Audio Visualization/i)).toBeInTheDocument();
});

test('audio panel can be hidden and restored', () => {
  render(<App />);
  showControls();
  fireEvent.click(screen.getByText(/Audio Mode/i));

  fireEvent.click(screen.getByRole('button', { name: /^hide$/i }));
  expect(screen.queryByText(/Audio Visualization/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /audio/i }));
  expect(screen.getByText(/Audio Visualization/i)).toBeInTheDocument();
});

test('audio mode shows all visualization modes', () => {
  render(<App />);
  showControls();
  fireEvent.click(screen.getByText(/Audio Mode/i));

  const select = screen.getByRole('combobox');
  const options = Array.from(select.options).map(o => o.value);
  expect(options).toEqual(
    expect.arrayContaining(['none', 'react', 'drive', 'pulse', 'breathe', 'contour', 'harmonic'])
  );
});

test('audio mode shows intensity slider', () => {
  render(<App />);
  showControls();
  fireEvent.click(screen.getByText(/Audio Mode/i));
  expect(screen.getByText(/Intensity/i)).toBeInTheDocument();
});

test('H button toggles all GUI on and off', () => {
  render(<App />);

  // GUI starts hidden: no controls panel, no audio toggle.
  expect(screen.queryByText(/Sacred Grid Controls/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Audio Mode/i)).not.toBeInTheDocument();

  showControls();
  expect(screen.getByText(/Sacred Grid Controls/i)).toBeInTheDocument();
  expect(screen.getByText(/Audio Mode/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /hide gui/i }));
  expect(screen.queryByText(/Sacred Grid Controls/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Audio Mode/i)).not.toBeInTheDocument();
});
