import { atom } from 'jotai';
import type { PortfolioPeriod } from '../types/portfolio';

export const selectedPeriodAtom = atom<PortfolioPeriod>('1D');
export const changeDisplayModeAtom = atom<'absolute' | 'percentage'>('absolute');
export const selectedAssetByPersonAtom = atom<Record<string, string>>({});
