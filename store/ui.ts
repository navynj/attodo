import { atom } from 'jotai';
import { mainFormSchemaType } from '../app/_components/MainInputOverlay';

export const todayAtom = atom(new Date());
export const mainFormDataAtom = atom<mainFormSchemaType | undefined>(undefined);
