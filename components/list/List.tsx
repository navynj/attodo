import { EventType } from '@/store/event';
import { GoalType } from '@/store/goals';
import { NoteType } from '@/store/note';
import { TaskType } from '@/store/task';
import { ClassNameProps } from '@/types/className';
import { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaChevronUp } from 'react-icons/fa6';
import ListItem from '../../app/_components/ListItem';

interface ListProps extends ClassNameProps {
  title?: string;
  items: (GoalType | NoteType | TaskType | EventType)[];
  gap?: number;
  isFolded?: boolean;
  isRightSideArrow?: boolean;
}

const List = ({ title, items, isFolded, gap, isRightSideArrow, className }: ListProps) => {
  const [hide, setHide] = useState(isFolded);

  return (
    <ul className={className}>
      {!!title && !!items?.length && (
        <div
          className={`flex gap-2 items-center  ${
            hide ? '' : gap ? 'mb-' + gap : 'mb-4'
          } ${isRightSideArrow ? 'justify-between' : ''} cursor-pointer`}
          onClick={() => {
            setHide((prev) => !prev);
          }}
        >
          {isFolded !== undefined &&
            !isRightSideArrow &&
            (hide ? (
              <FaChevronRight className="text-[0.675rem]" />
            ) : (
              <FaChevronDown className="text-[0.675rem]" />
            ))}
          <h5 className="font-extrabold text-sm">{title}</h5>
          {isFolded !== undefined &&
            isRightSideArrow &&
            (hide ? (
              <FaChevronUp className="text-[0.675rem]" />
            ) : (
              <FaChevronDown className="text-[0.675rem]" />
            ))}
        </div>
      )}
      <li
        className={`space-y-6 text-lg font-light ${
          isFolded !== undefined && !isRightSideArrow ? 'ml-4' : ''
        }`}
      >
        {!hide && items?.map((item) => <ListItem key={item.id} {...item} />)}
      </li>
    </ul>
  );
};

export default List;
