import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Sacred Grid controls', () => {
  render(<App />);
  const controlsHeading = screen.getByText(/Sacred Grid Controls/i);
  expect(controlsHeading).toBeInTheDocument();
});
