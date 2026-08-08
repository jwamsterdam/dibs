import { http, HttpResponse } from 'msw';

// Illustrative in-memory backend for dev + tests. Handlers use `*/path` so they match
// regardless of origin (browser worker and Node test server alike). Replace with
// contract-driven handlers once the OpenAPI spec lands.
export type ZoneRecord = { id: string; name: string; description?: string };

function seed(): ZoneRecord[] {
  return [
    { id: 'zone-1', name: 'Main Hall', description: 'Ground-floor public address' },
    { id: 'zone-2', name: 'Car Park' },
  ];
}

let zones: ZoneRecord[] = seed();

/** Reset the in-memory data between tests (call from jest afterEach). */
export function resetZones(): void {
  zones = seed();
}

export const handlers = [
  http.get('*/api/health', () => HttpResponse.json({ status: 'ok' })),

  http.get('*/api/zones', () => HttpResponse.json(zones)),

  http.post('*/api/zones', async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string };
    const zone: ZoneRecord = {
      id: `zone-${zones.length + 1}`,
      name: body.name,
      ...(body.description ? { description: body.description } : {}),
    };
    zones = [...zones, zone];
    return HttpResponse.json(zone, { status: 201 });
  }),
];
