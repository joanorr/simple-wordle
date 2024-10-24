import {render, screen} from '@testing-library/react';
import Grid from './Grid';
import {CellData, CellState} from './Cell';

test('renders rows', () => {
  const data: CellData[][] = [
    [
      {value: 'I', state: CellState.FILLED},
      {value: 'R', state: CellState.FILLED},
      {value: 'A', state: CellState.FILLED},
      {value: 'T', state: CellState.FILLED},
      {value: 'E', state: CellState.FILLED},
    ],
    [
      {value: 'Q', state: CellState.FILLED},
      {value: 'U', state: CellState.FILLED},
      {value: 'O', state: CellState.FILLED},
      {value: 'I', state: CellState.FILLED},
      {value: '', state: CellState.EMPTY},
    ],
  ];
  const {container} = render(<Grid currentCell={3} currentRow={2} data={data} />);
  expect(container.querySelectorAll('.Row').length).toBe(2);
});
