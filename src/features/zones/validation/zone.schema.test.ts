import { createZoneInputSchema } from './zone.schema';

describe('createZoneInputSchema', () => {
  it('accepts a valid input', () => {
    const result = createZoneInputSchema.safeParse({ name: 'Lobby' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty name', () => {
    const result = createZoneInputSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Name is required');
    }
  });

  it('rejects a name that is too long', () => {
    const result = createZoneInputSchema.safeParse({ name: 'x'.repeat(61) });
    expect(result.success).toBe(false);
  });
});
