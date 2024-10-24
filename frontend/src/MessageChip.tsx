import classNames from 'classnames';
import './MessageChip.css';

type MessageChipArgs = {
  text: string,
  visible: boolean,
};

export default function MessageChip({text, visible}: MessageChipArgs) {
  const className = classNames({
    MessageChip: true,
    visible: visible,
  });
  return (
    <div className={className}>{text}</div>
  );
}