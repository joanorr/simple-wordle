import Cell, {CellData} from './Cell';
import './Row.css';

type RowArgs = {
  currentCell: number,
  data: CellData[],
};

export default function Row({currentCell, data}: RowArgs) {
  const cells = data.map((cellData, index) => (
    <Cell
        key={index}
        data={cellData} />
  ));
  return (
    <div className="Row">
      {cells}
    </div>
  );
}