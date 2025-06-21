import { generateUUID } from '../../backend/src/utils/uuid';

describe('generateUUID', () => {
  it('returns a valid uuid', () => {
    const id = generateUUID();
    expect(id).toMatch(/[0-9a-fA-F-]{36}/);
  });

  it('generates unique ids', () => {
    const first = generateUUID();
    const second = generateUUID();
    expect(first).not.toBe(second);
  });
});
