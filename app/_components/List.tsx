import { ClassNameProps } from '@/types/className';
import React, { ReactNode, useState } from 'react';
import { IconType } from 'react-icons';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa6';

interface ListProps extends ClassNameProps {
  title?: string;
  icon: ReactNode;
  items?: any[];
  isFolded?: boolean;
}

const List = ({ title, items, icon, isFolded, className }: ListProps) => {
  const [hide, setHide] = useState(isFolded);

  return (
    <ul className={className}>
      {!!title && !!items?.length && (
        <div
          className="flex gap-2 items-center mb-3"
          onClick={() => {
            setHide((prev) => !prev);
          }}
        >
          {isFolded &&
            (hide ? (
              <FaChevronRight className="text-[0.675rem]" />
            ) : (
              <FaChevronDown className="text-[0.675rem]" />
            ))}
          <h5 className="font-extrabold text-sm">{title}</h5>
        </div>
      )}
      <div className={`space-y-6 text-lg font-light ${isFolded ? 'ml-4' : ''}`}>
        {!hide &&
          items?.map(({ id, title }) => (
            <li key={id} className="flex items-center gap-4">
              {icon} <span>{title}</span>
            </li>
          ))}
      </div>
    </ul>
  );
};

export default List;
