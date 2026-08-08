import { atom } from 'jotai';

/** Feature-local UI state: the currently selected zone (null = none). */
export const selectedZoneIdAtom = atom<string | null>(null);
