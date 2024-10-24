import React, {KeyboardEvent, useState} from 'react';
import './SimpleWordle.css';
import Grid from './Grid';
import {CellData, CellState} from './Cell';
import MessageChip from './MessageChip';
import dictionary from './dictionary';

const BACKSPACE_KEY_CODE = 'Backspace';
const ENTER_KEY_CODE = 'Enter';

const NUM_ROWS = 6;
const ROW_LENGTH = 5;
const INITIAL_GRID_DATA = buildInitialGridData(NUM_ROWS, ROW_LENGTH);
const DICTIONARY_SET = new Set(dictionary);


function SimpleWordle() {

  const CORRECT_WORD = chooseRandomWordFromDictionary();

  const [currentCell, setCurrentCell] = useState(0);
  const [currentRow, setCurrentRow] = useState(0);
  const [gridData, setGridData] = useState(INITIAL_GRID_DATA);
  const [locked, setLocked] = useState(false);
  const [displayMessageText, setDisplayMessageText] = useState('');
  const [displayMessageVisible, setDisplayMessageVisible] = useState(false);


  function  handleKeyDown(event: KeyboardEvent) {
    if (locked) {
      return;
    } else if (currentCell > 0 && event.code === BACKSPACE_KEY_CODE) {
      doBackspace();
    } else if (currentCell === ROW_LENGTH && event.code === ENTER_KEY_CODE) {
      doGrading();
    } else if (currentCell < ROW_LENGTH && isAlpha(event.key)) {
      doEnterChar(event.key);
    }
  }

  function doBackspace() {
    const gridDataForUpdate = cloneGridData(gridData);
    setCurrentCell(currentCell - 1);
    gridDataForUpdate[currentRow][currentCell - 1] = {
      value: '', state: CellState.EMPTY};
    setGridData(gridDataForUpdate);
  }

  function doGrading() {
    const gridDataForUpdate = cloneGridData(gridData);
    const row = gridData[currentRow];

    const userWord = row.reduce((acc, cell) => acc.concat(cell.value), '');
    if (! isInDictionary(userWord)) {
      displayMessage('Not in word list', 2000);
      return;
    }

    const correctWordLetterList = CORRECT_WORD.split('');
    for (let i = 0; i < row.length; i++) {
      const currentChar = row[i].value;
      if (currentChar === CORRECT_WORD.charAt(i)) {
        gridDataForUpdate[currentRow][i].state = CellState.CORRECT_POSITION;
        continue;
      }

      // If we know that the current character isn't cotrrect in its current
      // position, it may still be found elsewhere in the word. So search for it
      // in the list of letters of the correct word. However if we find it,
      // remove it from the list so that a subsequent occurrence of the same
      // letter isn't double graded.
      const index = correctWordLetterList.indexOf(currentChar);
      if (index >= 0) {
        gridDataForUpdate[currentRow][i].state = CellState.CORRECT_LETTER;
        correctWordLetterList.splice(index, 1);
      } else {
        gridDataForUpdate[currentRow][i].state = CellState.INCORRECT;
      }
    }
    const isSolved = gridDataForUpdate[currentRow].every(
      (cellData) => cellData.state === CellState.CORRECT_POSITION);
    if (isSolved) {
      setLocked(true);
      displayMessage('Well done!');
    }

    setCurrentCell(0);
    setGridData(gridDataForUpdate);

    if (currentRow < NUM_ROWS -1) {
      setCurrentRow(currentRow + 1);
    } else {
      setLocked(true);
      displayMessage(CORRECT_WORD);
    }
  }

  function doEnterChar(key: string) {
    const gridDataForUpdate = cloneGridData(gridData);
    gridDataForUpdate[currentRow][currentCell] = {
      value: key.toUpperCase(), state: CellState.FILLED};
    setGridData(gridDataForUpdate);
    setCurrentCell(currentCell + 1);
  }

  function displayMessage(messageText: string, timeoutMs: number = 0) {
    setDisplayMessageText(messageText);
    setDisplayMessageVisible(true);
    if (timeoutMs > 0) {
      setTimeout(() => {setDisplayMessageVisible(false)}, 2000);
    }
  }

  return (
    <div className="SimpleWordle" onKeyDown={handleKeyDown} tabIndex={-1}>
      <input type="text" autoFocus={true} className='HiddenInputToGrabFocus'></input>
      <MessageChip
          text={displayMessageText}
          visible={displayMessageVisible}></MessageChip>
      <Grid
          currentCell={currentCell}
          currentRow={currentRow}
          data={gridData}/>
      <div className="Info">
        <p>Very simple Wordle-style app (and plenty remains to be done!)</p>
        <ul>
          <li>Type your word and hit ENTER to grade it.</li>
        </ul>
      </div>
    </div>
  );
}

function chooseRandomWordFromDictionary(): string {
  return dictionary[
    Math.floor(Math.random() * dictionary.length)].toUpperCase();
}

function isInDictionary(word: string): boolean {
  return DICTIONARY_SET.has(word.toLowerCase());
}

function isAlpha(char: string): boolean {
  return char.length === 1 && !!char.match(/[a-zA-Z]/i);
}

function buildInitialGridData(numRows: number, rowLength: number) {
  const initialGridData = [];

  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < rowLength; j++) {
      row.push({value: '', state: CellState.EMPTY});
    }
    initialGridData.push(row);
  }

  return initialGridData;
}

function cloneGridData(origGridData: CellData[][]): CellData[][] {
  return origGridData.map(row => row.map((cell) => {return {...cell}}));
}

export default SimpleWordle;
