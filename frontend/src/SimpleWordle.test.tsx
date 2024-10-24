import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import SimpleWordle from './SimpleWordle';
import {act} from 'react-dom/test-utils';

const CELL_CLASSES = {
  empty: 'empty',
  filled: 'filled',
  incorrect: 'incorrect',
  correctLetter: 'correct-letter',
  correctPosition: 'correct-position',
};

// With the given random number, the correct word is BRUSH
const RANDOM_VALUE = 0.123456789;
const CORRECT_WORD = 'BRUSH';


let container: HTMLElement;

beforeEach(() => {
  container = render(<SimpleWordle />).container;
  jest.spyOn(global.Math, 'random').mockReturnValue(RANDOM_VALUE);
  jest.useFakeTimers();
  jest.spyOn(global, 'setTimeout');
});

afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore();
  jest.spyOn(global, 'setTimeout').mockRestore();
});


/**
 * Get the string values entered into the app. Each row is a separate
 * string in the array, and empty cells are represented as a '.'.
 *
 * @param container The container of the app
 * @returns A list of the strings displayed to the user
 */
function getStringsByRow(): String[] {
  return [... container.querySelectorAll('.Row')].map((row) =>
    [... row.querySelectorAll('.Cell')].map((cell) =>
      cell.innerHTML || '.'
    ).join(''))
}

function getCellsByRow(): Element[][] {
  return [... container.querySelectorAll('.Row')].map((row) =>
    [... row.querySelectorAll('.Cell')].map((cell) =>
      cell
    ))
}

function expectRowToHaveClasses(row: Element[], classes: string[]) {
  row.forEach((cell, index) => {
    expect(cell).toHaveClass(classes[index]);
  });
}

function getMessageChip() {
  return container.querySelector('.MessageChip')!;
}

function sendKeyDownEvent(
  event: {code: string, key: string}) {
    fireEvent.keyDown(container.firstChild!, event);
}

function sendBackspace() {
  sendKeyDownEvent({code: 'Backspace', key: 'Unknown'});
}

function sendEnter() {
  sendKeyDownEvent({code: 'Enter', key: 'Unknown'});
}

function sendString(text: string) {
  [... text].forEach((char) => {
    const key = char.toLowerCase();
    const code = `Key${char.toUpperCase()}`;
    sendKeyDownEvent({code, key});
  });
}

function sendWords(wordList: string[])  {
  wordList.forEach((word) => {
    sendString(word);
    sendEnter();
  });
}

describe('text entry', () =>{
  test('has 6 rows', () => {
    expect(container.querySelectorAll('.Row').length).toBe(6);
  });

  test('has 5 cells in each rows', () => {
    container.querySelectorAll('.Row').forEach((row) => {
      expect(row.querySelectorAll('.Cell').length).toBe(5);
    });
  });

  test('accepts text input', () => {
    sendString('qu');

    const rowStrings = getStringsByRow();
    expect(rowStrings).toStrictEqual(
      ['QU...', '.....', '.....', '.....', '.....', '.....']);
  });

  test('does not accept more than 5 characters in a row', () => {
    // Send 6 characters
    sendString('queens');

    const rowStrings = getStringsByRow();
    expect(rowStrings).toStrictEqual(
      ['QUEEN', '.....', '.....', '.....', '.....', '.....']);
  });

  test('starts a new row on ENTER', () => {
    sendString('queen');
    sendEnter();
    sendString('enter');

    const rowStrings = getStringsByRow();
    expect(rowStrings).toStrictEqual(
      ['QUEEN', 'ENTER', '.....', '.....', '.....', '.....']);
  });

  test('deletes last character on BACKSPACE', () => {
    sendString('queen');
    sendBackspace();
    const rowStrings = getStringsByRow();
    expect(rowStrings).toStrictEqual(
      ['QUEE.', '.....', '.....', '.....', '.....', '.....']);
  });

  test('does not accept more than 6 rows', () => {
    // Send seven words. Expect only 6 will be displayed.
    sendWords([
      'hello', 'world', 'avoid', 'beads', 'begun', 'after', 'night'
    ]);
    const rowStrings = getStringsByRow();
    expect(rowStrings).toStrictEqual(
      ['HELLO', 'WORLD', 'AVOID', 'BEADS', 'BEGUN', 'AFTER']);
  });
});

describe('grading', () => {

  test('grades a correct answer', () => {
    sendString(CORRECT_WORD);
    sendEnter();
    expectRowToHaveClasses(getCellsByRow()[0], [
      CELL_CLASSES.correctPosition,
      CELL_CLASSES.correctPosition,
      CELL_CLASSES.correctPosition,
      CELL_CLASSES.correctPosition,
      CELL_CLASSES.correctPosition,
    ]);
  });

  test('grades a partially correct answer', () => {
    sendString('BROWN');
    sendEnter();
    expectRowToHaveClasses(getCellsByRow()[0], [
      CELL_CLASSES.correctPosition,
      CELL_CLASSES.correctPosition,
      CELL_CLASSES.incorrect,
      CELL_CLASSES.incorrect,
      CELL_CLASSES.incorrect,
    ]);
  });

  test('grades a correct letter/wrong position', () => {
    sendString('HERBS');
    sendEnter();
    expectRowToHaveClasses(getCellsByRow()[0], [
      CELL_CLASSES.correctLetter,
      CELL_CLASSES.incorrect,
      CELL_CLASSES.correctLetter,
      CELL_CLASSES.correctLetter,
      CELL_CLASSES.correctLetter,
    ]);
  });

  test('does not double-grade a repeated letter', () => {
    // The letter R appears once in BRUSH but twice in BERRY. The grading should
    // not say both R's are correct-letter.
    sendString('BERRY');
    sendEnter();
    expectRowToHaveClasses(getCellsByRow()[0], [
      CELL_CLASSES.correctPosition,
      CELL_CLASSES.incorrect,
      CELL_CLASSES.correctLetter,
      CELL_CLASSES.incorrect,
      CELL_CLASSES.incorrect,
    ]);
  });
});

describe('messages', () => {
  let messageChip: Element;

  beforeEach(() => {
    messageChip = getMessageChip();
  });

  test('not showing', () => {
    expect(messageChip).not.toHaveClass('visible');
  });

  test('shows message on correct answer', () => {
    sendWords([CORRECT_WORD,]);
    expect(messageChip).toHaveClass('visible');
    expect(messageChip.innerHTML).toBe('Well done!');
    expect(setTimeout).not.toHaveBeenCalled();
  });

  test('shows correct word when all turns used up', () => {
    sendWords(['irate', 'queen', 'sends', 'sweet', 'silly', 'books']);
    expect(messageChip).toHaveClass('visible');
    expect(messageChip.innerHTML).toBe(CORRECT_WORD);
    expect(setTimeout).not.toHaveBeenCalled();
  });

  test('shows a transient message when non-dictionary word entered', () => {
    sendWords(['whoosh']);
    expect(messageChip).toHaveClass('visible');
    expect(messageChip.innerHTML).toBe('Not in word list');
    expect(setTimeout).toHaveBeenCalledTimes(1);
    const [[callback, timeout],] =
        (setTimeout as jest.MockedFunction<typeof setTimeout>).mock.calls;
    expect(timeout).toBe(2000);
  });

  test('transient message vanishes after timeout', () => {
    sendWords(['whoosh']);
    expect(messageChip).toHaveClass('visible');
    const [[callback, timeout],] =
        (setTimeout as jest.MockedFunction<typeof setTimeout>).mock.calls;
    expect(timeout).toBe(2000);

    act(() => {
      callback();
    });

    expect(messageChip).not.toHaveClass('visible');
  });
});

