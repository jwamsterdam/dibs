import { atom } from 'jotai';
import type { ChangeDisplayMode, PortfolioPeriod } from '../types/portfolio';

export const selectedPeriodAtom = atom<PortfolioPeriod>('1D');
export const changeDisplayModeAtom = atom<ChangeDisplayMode>('absolute');
export const selectedAssetByPersonAtom = atom<Record<string, string>>({});
export const isSettingsOpenAtom = atom(false);
export const selectedPersonIdAtom = atom<string | null>(null);
export const isAccountsOpenAtom = atom(false);
