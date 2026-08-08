import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** MSW worker for development (started conditionally in main.tsx when DEV). */
export const worker = setupWorker(...handlers);
