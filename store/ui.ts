import { atom } from 'jotai';

export const todayAtom = atom(new Date());
export const formDataAtom = atom<any>(undefined);
