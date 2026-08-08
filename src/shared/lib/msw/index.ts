// Node-safe exports only (handlers + reset). Import the worker from './browser'
// (browser-only) or the server from './server' (Node-only) directly where needed.
export { handlers, resetZones, type ZoneRecord } from './handlers';
