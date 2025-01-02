import { atom } from 'jotai';
import { mainFormSchemaType } from '../app/_overlay/MainFormOverlay';

export const todayAtom = atom(new Date());
export const mainFormDataAtom = atom<mainFormSchemaType | undefined>(undefined);
