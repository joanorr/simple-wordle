import {render, screen} from '@testing-library/react';
import Cell, {CellState} from './Cell';

test('renders', () => {
  render(<Cell data={{value: 'W', state: CellState.CORRECT_LETTER}} />);
  const cell = screen.getByText('W');
  expect(cell).toBeInTheDocument();
  expect(cell).toHaveClass('Cell');
});

test('renders with correct class for EMPTY state', () => {
  render(<Cell data={{value: 'W', state: CellState.EMPTY}} />);
  const cell = screen.getByText('W');
  expect(cell).toHaveClass('empty');
  expect(cell).not.toHaveClass('filled');
  expect(cell).not.toHaveClass('incorrect');
  expect(cell).not.toHaveClass('correct-letter');
  expect(cell).not.toHaveClass('correct-position');
});

test('renders with correct class for FILLED state', () => {
  render(<Cell data={{value: 'W', state: CellState.FILLED}} />);
  const cell = screen.getByText('W');
  expect(cell).not.toHaveClass('empty');
  expect(cell).toHaveClass('filled');
  expect(cell).not.toHaveClass('incorrect');
  expect(cell).not.toHaveClass('correct-letter');
  expect(cell).not.toHaveClass('correct-position');
});

test('renders with correct class for INCORRECT state', () => {
  render(<Cell data={{value: 'W', state: CellState.INCORRECT}} />);
  const cell = screen.getByText('W');
  expect(cell).not.toHaveClass('empty');
  expect(cell).not.toHaveClass('filled');
  expect(cell).toHaveClass('incorrect');
  expect(cell).not.toHaveClass('correct-letter');
  expect(cell).not.toHaveClass('correct-position');
});

test('renders with correct class for CORRECT_LETTER state', () => {
  render(<Cell data={{value: 'W', state: CellState.CORRECT_LETTER}} />);
  const cell = screen.getByText('W');
  expect(cell).not.toHaveClass('empty');
  expect(cell).not.toHaveClass('filled');
  expect(cell).not.toHaveClass('incorrect');
  expect(cell).toHaveClass('correct-letter');
  expect(cell).not.toHaveClass('correct-position');
});

test('renders with correct class for CORRECT_POSITION state', () => {
  render(<Cell data={{value: 'W', state: CellState.CORRECT_POSITION}} />);
  const cell = screen.getByText('W');
  expect(cell).not.toHaveClass('empty');
  expect(cell).not.toHaveClass('filled');
  expect(cell).not.toHaveClass('incorrect');
  expect(cell).not.toHaveClass('correct-letter');
  expect(cell).toHaveClass('correct-position');
});