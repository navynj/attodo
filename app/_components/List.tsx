import { ClassNameProps } from '@/types/className';
import React, { ReactNode, useState } from 'react';
import { IconType } from 'react-icons';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa6';
import ListItem from './ListItem';
import { EventType } from '@/store/event';
import { TaskType } from '@/store/task';
import { NoteType } from '@/store/note';
import { GoalType } from '@/store/goals';

interface ListProps extends ClassNameProps {
  title?: string;
  items: (GoalType | NoteType | TaskType | EventType)[];
  gap?: number;
  isFolded?: boolean;
}

const List = ({ title, items, isFolded, gap, className }: ListProps) => {
  const [hide, setHide] = useState(isFolded);

  return (
    <ul className={className}>
      {!!title && !!items?.length && (
        <div
          className={`flex gap-2 items-center  ${hide ? '' : gap ? 'mb-' + gap : 'mb-4'} cursor-pointer`}
          onClick={() => {
            setHide((prev) => !prev);
          }}
        >
          {isFolded !== undefined &&
            (hide ? (
              <FaChevronRight className="text-[0.675rem]" />
            ) : (
              <FaChevronDown className="text-[0.675rem]" />
            ))}
          <h5 className="font-extrabold text-sm">{title}</h5>
        </div>
      )}
      <li className={`space-y-6 text-lg font-light ${isFolded !== undefined ? 'ml-4' : ''}`}>
        {!hide && items?.map((item) => <ListItem key={item.id} {...item} />)}
      </li>
    </ul>
  );
};

export default List;
