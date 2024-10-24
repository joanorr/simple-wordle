import {render, screen} from '@testing-library/react';
import Row from './Row';
import {CellData, CellState} from './Cell';

test('renders', () => {
  const data: CellData[] = [
    {value: 'I', state: CellState.FILLED},
    {value: 'R', state: CellState.FILLED},
    {value: 'A', state: CellState.FILLED},
    {value: 'T', state: CellState.FILLED},
    {value: 'E', state: CellState.FILLED},
  ];
  const {container} = render(<Row currentCell={3} data={data} />);
  expect(container.firstChild).toHaveClass('Row');
});

test('renders the right number of cells', () => {
  const data: CellData[] = [
    {value: 'I', state: CellState.FILLED},
    {value: 'R', state: CellState.FILLED},
    {value: 'A', state: CellState.FILLED},
    {value: 'T', state: CellState.FILLED},
    {value: 'E', state: CellState.FILLED},
  ];
  const {container} = render(<Row currentCell={3} data={data} />);
  expect(container.querySelectorAll('.Cell').length).toBe(5);
});

test('renders the cells with text', () => {
  const data: CellData[] = [
    {value: 'I', state: CellState.INCORRECT},
    {value: 'R', state: CellState.CORRECT_LETTER},
    {value: 'A', state: CellState.INCORRECT},
    {value: 'T', state: CellState.CORRECT_POSITION},
    {value: 'E', state: CellState.INCORRECT},
  ];
  render(<Row currentCell={3} data={data} />);
  expect(screen.getByText('I')).toBeInTheDocument();
  expect(screen.getByText('R')).toBeInTheDocument();
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.getByText('T')).toBeInTheDocument();
  expect(screen.getByText('E')).toBeInTheDocument();
});

test('renders the cells with correct classes', () => {
  const data: CellData[] = [
    {value: 'I', state: CellState.INCORRECT},
    {value: 'R', state: CellState.CORRECT_LETTER},
    {value: 'A', state: CellState.INCORRECT},
    {value: 'T', state: CellState.CORRECT_POSITION},
    {value: 'E', state: CellState.INCORRECT},
  ];
  render(<Row currentCell={3} data={data} />);
  expect(screen.getByText('I')).toHaveClass('incorrect');
  expect(screen.getByText('R')).toHaveClass('correct-letter');
});
