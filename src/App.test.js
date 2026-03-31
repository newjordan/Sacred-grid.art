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

test('audio mode shows all visualization modes', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Audio Mode/i));

  const select = screen.getByRole('combobox');
  const options = Array.from(select.options).map(o => o.value);
  expect(options).toEqual(expect.arrayContaining(['none', 'react', 'drive', 'pulse', 'breathe', 'contour']));
});

test('audio mode shows intensity slider', () => {
  render(<App />);
  fireEvent.click(screen.getByText(/Audio Mode/i));
  expect(screen.getByText(/Intensity/i)).toBeInTheDocument();
});

test('H button toggles all GUI on and off', () => {
  render(<App />);

  const guiToggle = screen.getByRole('button', { name: /toggle gui/i });
  expect(screen.getByText(/Sacred Grid Controls/i)).toBeInTheDocument();

  fireEvent.click(guiToggle);
  expect(screen.queryByText(/Sacred Grid Controls/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Audio Mode/i)).not.toBeInTheDocument();

  fireEvent.click(guiToggle);
  expect(screen.getByText(/Sacred Grid Controls/i)).toBeInTheDocument();
});
