import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@/styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

// Start the MSW request mocks in development only, so the app runs without a backend.
// The worker code is dynamically imported so it never enters the production bundle.
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) {
    return;
  }
  const { worker } = await import('@/shared/lib/msw/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}

void enableMocking().then(() => {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
