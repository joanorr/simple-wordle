import classNames from 'classnames';
import './Cell.css';

export enum CellState {
  EMPTY,
  FILLED,
  INCORRECT,
  CORRECT_LETTER,
  CORRECT_POSITION,
}

export type CellData = {
  value: string,
  state: CellState,
};

type CellArgs = {
  data: CellData,
};

export default function Cell({data}: CellArgs) {
  const className = classNames({
    'Cell': true,
    'empty': data.state === CellState.EMPTY,
    'filled': data.state === CellState.FILLED,
    'incorrect': data.state === CellState.INCORRECT,
    'correct-letter': data.state === CellState.CORRECT_LETTER,
    'correct-position': data.state === CellState.CORRECT_POSITION,
  });
  return (
    <div className={className}>{data.value}</div>
  );
}