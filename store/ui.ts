import { atom } from 'jotai';
import { mainFormSchemaType } from '../app/_components/MainFormOverlay';

export const todayAtom = atom(new Date());
export const mainFormDataAtom = atom<mainFormSchemaType | undefined>(undefined);
