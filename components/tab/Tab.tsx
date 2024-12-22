import { ClassNameProps } from '@/types/className';
import { cn } from '@/util/cn';
import React, { ReactElement } from 'react';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';

interface TabItemType {
  icon?: ReactElement;
  label: string;
  value: string;
  isDefault?: boolean;
}

interface TabProps<T extends FieldValues> extends ClassNameProps {
  id: Path<T>;
  value?: string;
  setValue?: any;
  tabs: (TabItemType | React.ReactNode)[];
  form?: UseFormReturn<T, any, undefined>;
  enableToggle?: boolean;
}
const Tab = <T extends FieldValues>({
  id,
  value,
  setValue,
  tabs,
  form,
  enableToggle,
  className,
}: TabProps<T>) => {
  return (
    <ul className={cn('flex justify-center flex-wrap gap-x-4', className)}>
      {tabs.map((tab) => {
        if (!tab) {
          return;
        }

        if (React.isValidElement(tab)) {
          return tab;
        }

        const tabData = tab as TabItemType;

        const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
          setValue && setValue(event.target.value);
        };

        const toggleHandler = (event: React.MouseEvent<HTMLInputElement>) => {
          const target = event.target as HTMLInputElement;
          if (target.value === value || target.value === form?.watch(id)) {
            setValue && setValue(undefined);
            form?.setValue(id, undefined as PathValue<T, Path<T>>);
          }
        };

        return (
          <li
            key={tabData.value}
            className="font-extrabold [&_label]:opacity-20 [&>input:checked+label]:opacity-100"
          >
            <input
              id={`${id}-${tabData.value}`}
              type="radio"
              value={tabData.value}
              name={id}
              checked={value ? value === tabData.value : undefined}
              defaultChecked={tabData.isDefault}
              onChange={changeHandler}
              onClick={enableToggle ? toggleHandler : undefined}
              hidden
              {...form?.register(id)}
            />
            <label
              htmlFor={`${id}-${tabData.value}`}
              className="flex h-full gap-1 items-center cursor-pointer"
            >
              {tabData.icon}
              {tabData.label}
            </label>
          </li>
        );
      })}
    </ul>
  );
};

export default Tab;
