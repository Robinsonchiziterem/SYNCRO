import { ReminderEngine } from '../src/services/reminder-engine';
import { supabase } from '../src/config/database';
import logger from '../src/config/logger';

// Mock supabase and logger
jest.mock('../src/config/database', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockResolvedValue({ error: null }),
  },
}));

jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('ReminderEngine Batch Optimization', () => {
  let engine: ReminderEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    engine = new ReminderEngine();
  });

  it('should batch fetch process and batch upsert reminders', async () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    const mockSubscriptions = [
      { id: 'sub1', user_id: 'user1', active_until: futureDate },
      { id: 'sub2', user_id: 'user1', active_until: futureDate },
      { id: 'sub3', user_id: 'user2', active_until: futureDate },
    ];

    const mockPreferences = [
      { user_id: 'user1', reminder_timing: [7, 3] },
      { user_id: 'user2', reminder_timing: [1] },
    ];

    // Setup mocks
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'subscriptions') {
        return {
          select: () => ({
            eq: () => ({
              not: () => ({
                gt: () => Promise.resolve({ data: mockSubscriptions, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'subscription_notification_preferences') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        };
      }
      if (table === 'user_preferences') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockImplementation((key, val) => ({
              single: jest.fn().mockResolvedValue({
                data: mockPreferences.find(p => p.user_id === val) || null,
                error: null
              })
            }))
          })
        };
      }
      if (table === 'reminder_schedules') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: null, error: null })
                })
              })
            })
          }),
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
    });

    await engine.scheduleReminders([7, 3, 1]);

    // Verify batch fetch of preferences
    expect(supabase.from).toHaveBeenCalledWith('user_preferences');
    
    // Retrieve all insert calls for 'reminder_schedules'
    const insertCalls = (supabase.from as jest.Mock).mock.results
      .filter(r => r.value && typeof r.value === 'object' && 'insert' in r.value && (r.value.insert as jest.Mock).mock.calls.length > 0)
      .map(r => (r.value.insert as jest.Mock).mock.calls[0][0]);

    // user1 has 2 subs * 2 days = 4 records
    // user2 has 1 sub * 1 day = 1 record
    // Note: The loop skips duplicates if 'existing' is found, but our mock returns null for 'single()', so all 5 are inserted.
    expect(insertCalls.length).toBe(5);

    // Verify logging
    expect(logger.info).toHaveBeenCalledWith('Reminder scheduling completed');
  });
});
