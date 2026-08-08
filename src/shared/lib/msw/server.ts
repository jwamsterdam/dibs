import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** MSW server for tests (Node). Lifecycle is wired in jest.setup.ts. */
export const server = setupServer(...handlers);
