import {render, screen} from '@testing-library/react';
import MessageChip from './MessageChip';

test('renders', () => {
  render(<MessageChip text="the text" visible />);
  const chip = screen.getByText('the text');
  expect(chip).toBeInTheDocument();
  expect(chip).toHaveClass('MessageChip');
});

test('is visible', () => {
  render(<MessageChip text="the text" visible />);
  const chip = screen.getByText('the text');
  expect(chip).toHaveClass('visible');
});

test('is not visible', () => {
  render(<MessageChip text="the text" visible={false} />);
  const chip = screen.getByText('the text');
  expect(chip).not.toHaveClass('visible');
});