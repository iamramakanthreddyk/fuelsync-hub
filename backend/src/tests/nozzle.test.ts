import { describe, it, expect, jest } from '@jest/globals';
import { recordNozzleReading } from '../services/nozzle.service';
import * as db from '../services/db.service';

describe('recordNozzleReading', () => {
  it('rejects readings lower than the last one', async () => {
    const queryMock: any = jest.fn();
    queryMock.mockResolvedValueOnce({ rows: [{ current_reading: 200 }] });

    const client = { query: queryMock } as any;
    jest
      .spyOn(db, 'withTransaction')
      .mockImplementation(async (_s: any, cb: any) => cb(client));

    await expect(
      recordNozzleReading('schema', 'nz1', 150, 'user1')
    ).rejects.toThrow('New reading cannot be less than the last recorded reading');
  });
});
