import type { Active, UniqueIdentifier } from '@dnd-kit/core';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import type { ReactNode } from 'react';
import React, { useMemo, useState } from 'react';

import { ClassNameProps } from '@/types/className';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { LexoRank } from 'lexorank';
import { updateData } from '@/util/convert';
import { useAtomValue } from 'jotai';
import { taskMutation, TaskType } from '@/store/task';
import { eventMutation, EventType } from '@/store/event';
import { noteMutation, NoteType } from '@/store/note';
import { goalMutation, GoalType } from '@/store/goals';

interface BaseItem {
  id: UniqueIdentifier;
  type: string;
}

interface Props<T extends BaseItem> extends ClassNameProps {
  items: T[];
  rankKey: keyof T;
  renderItem(item: T): ReactNode;
}

const DraggableList = <T extends BaseItem>({
  className,
  items,
  rankKey,
  renderItem,
}: Props<T>) => {
  const [active, setActive] = useState<Active | null>(null);

  const { mutate: taskMutate } = useAtomValue(taskMutation);
  const { mutate: eventMutate } = useAtomValue(eventMutation);
  const { mutate: noteMutate } = useAtomValue(noteMutation);
  const { mutate: goalMutate } = useAtomValue(goalMutation);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          const newItem = {
            ...items[activeIndex],
            [rankKey]: getRank(overIndex, items, rankKey, activeIndex < overIndex),
          };

          updateData(newItem, items[activeIndex].type);

          switch (items[activeIndex].type) {
            case 'task':
              taskMutate(newItem as unknown as TaskType);
              break;
            case 'event':
              eventMutate(newItem as unknown as EventType);
              break;
            case 'note':
              noteMutate(newItem as unknown as NoteType);
              break;
            case 'goal':
              goalMutate(newItem as unknown as GoalType);
              break;
            default:
              break;
          }
        }

        setActive(null);
      }}
      onDragCancel={() => {
        setActive(null);
      }}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={items}>
        <ul className={className}>
          {items.map((item) => (
            <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
};

const getRank = (
  to: number,
  items: any[],
  key: string | number | symbol,
  isNext: boolean
) => {
  if (to === 0) {
    if (items.length !== 1) {
      return (items[to][key] as LexoRank)?.genPrev() || LexoRank.middle();
    }
  } else if (to === items.length - 1) {
    return (items[to][key] as LexoRank)?.genNext() || LexoRank.middle();
  } else {
    return (items[to][key] as LexoRank)?.between(
      items[to + (isNext ? 1 : -1)][key] as LexoRank
    ) || LexoRank.middle();;
  }
};

export default DraggableList;
