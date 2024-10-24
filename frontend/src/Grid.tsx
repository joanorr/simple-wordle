import {CellData} from './Cell';
import Row from './Row'

type GridArgs = {
  currentCell: number,
  currentRow: number,
  data: CellData[][],
};

export default function Grid(
    {currentCell, currentRow, data}: GridArgs) {
  const rows = data.map((rowData, index) => (
    <Row
          key={index}
          currentCell={currentCell}
          data={rowData} />
  ));
  return (
    <div>
      {rows}
    </div>
  );
}