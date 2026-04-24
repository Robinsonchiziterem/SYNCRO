import { SimulationService } from '../src/services/simulation-service';
import type { Subscription } from '../src/types/subscription';

describe('SimulationService', () => {
  let service: SimulationService;

  beforeEach(() => {
    service = new SimulationService();
  });

  describe('calculateNextRenewal', () => {
    it('should add 1 month for monthly billing cycle', () => {
      const currentDate = new Date('2024-01-01');
      const nextDate = service.calculateNextRenewal(currentDate, 'monthly');
      
      const expectedDate = new Date('2024-02-01');
      expect(nextDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('should add 3 months for quarterly billing cycle', () => {
      const currentDate = new Date('2024-01-01');
      const nextDate = service.calculateNextRenewal(currentDate, 'quarterly');
      
      const expectedDate = new Date('2024-04-01');
      expect(nextDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('should add 365 days for yearly billing cycle', () => {
      const currentDate = new Date('2023-01-01');
      const nextDate = service.calculateNextRenewal(currentDate, 'yearly');
      
      const expectedDate = new Date('2024-01-01');
      expect(nextDate.toISOString()).toBe(expectedDate.toISOString());
    });
    it('should add 1 year correctly for leap years (Feb 29th)', () => {
      const currentDate = new Date('2024-02-29');
      const nextDate = service.calculateNextRenewal(currentDate, 'yearly');
      
      const expectedDate = new Date('2025-02-28');
      expect(nextDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('should handle month-end transitions correctly (Jan 31st)', () => {
      const currentDate = new Date('2024-01-31');
      const nextDate = service.calculateNextRenewal(currentDate, 'monthly');
      
      const expectedDate = new Date('2024-02-29'); // 2024 is a leap year
      expect(nextDate.toISOString()).toBe(expectedDate.toISOString());
    });

    it('should handle annual and weekly aliases', () => {
      const currentDate = new Date('2024-01-01');
      expect(service.calculateNextRenewal(currentDate, 'annual').getFullYear()).toBe(2025);
      expect(service.calculateNextRenewal(currentDate, 'weekly').getDate()).toBe(8);
    });
  });

  describe('projectSubscriptionRenewals', () => {
    it('should return empty array for subscription without next_billing_date', () => {
      const subscription: Subscription = {
        id: '1',
        user_id: 'user1',
        email_account_id: null,
        merchant_id: null,
        name: 'Netflix',
        provider: 'Netflix',
        price: 15.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        status: 'active',
        next_billing_date: null,
        category: 'Entertainment',
        logo_url: null,
        website_url: null,
        renewal_url: null,
        notes: null,
        visibility: 'private',
        tags: [],
        expired_at: null,
        paused_at: null,
        resume_at: null,
        pause_reason: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const endDate = new Date('2024-02-01');
      const projections = service.projectSubscriptionRenewals(subscription, endDate);

      expect(projections).toEqual([]);
    });

    it('should generate single renewal for monthly subscription within 30 days', () => {
      const subscription: Subscription = {
        id: '1',
        user_id: 'user1',
        email_account_id: null,
        merchant_id: null,
        name: 'Netflix',
        provider: 'Netflix',
        price: 15.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        status: 'active',
        next_billing_date: '2024-01-15',
        category: 'Entertainment',
        logo_url: null,
        website_url: null,
        renewal_url: null,
        notes: null,
        visibility: 'private',
        tags: [],
        expired_at: null,
        paused_at: null,
        resume_at: null,
        pause_reason: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const endDate = new Date('2024-02-01');
      const projections = service.projectSubscriptionRenewals(subscription, endDate);

      expect(projections).toHaveLength(1);
      expect(projections[0].subscriptionId).toBe('1');
      expect(projections[0].subscriptionName).toBe('Netflix');
      expect(projections[0].amount).toBe(15.99);
      expect(projections[0].billingCycle).toBe('monthly');
    });

    it('should generate multiple renewals for monthly subscription within 60 days', () => {
      const subscription: Subscription = {
        id: '1',
        user_id: 'user1',
        email_account_id: null,
        merchant_id: null,
        name: 'Netflix',
        provider: 'Netflix',
        price: 15.99,
        currency: 'USD',
        billing_cycle: 'monthly',
        status: 'active',
        next_billing_date: '2024-01-01',
        category: 'Entertainment',
        logo_url: null,
        website_url: null,
        renewal_url: null,
        notes: null,
        visibility: 'private',
        tags: [],
        expired_at: null,
        paused_at: null,
        resume_at: null,
        pause_reason: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const endDate = new Date('2024-02-28');
      const projections = service.projectSubscriptionRenewals(subscription, endDate);

      expect(projections).toHaveLength(2);
      expect(projections[0].projectedDate).toBe(new Date('2024-01-01').toISOString());
      expect(projections[1].projectedDate).toBe(new Date('2024-02-01').toISOString());
    });

    it('should not generate renewals beyond end date', () => {
      const subscription: Subscription = {
        id: '1',
        user_id: 'user1',
        email_account_id: null,
        merchant_id: null,
        name: 'Netflix',
        provider: 'Netflix',
        price: 15.99,
        currency: 'USD',
        billing_cycle: 'yearly',
        status: 'active',
        next_billing_date: '2024-01-01',
        category: 'Entertainment',
        logo_url: null,
        website_url: null,
        renewal_url: null,
        notes: null,
        visibility: 'private',
        tags: [],
        expired_at: null,
        paused_at: null,
        resume_at: null,
        pause_reason: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      const endDate = new Date('2024-02-01'); // Only 31 days
      const projections = service.projectSubscriptionRenewals(subscription, endDate);

      expect(projections).toHaveLength(1); // Only the first renewal, not the yearly one
    });
  });

  describe('validation', () => {
    it('should reject days parameter less than 1', async () => {
      await expect(
        service.generateSimulation('user1', 0)
      ).rejects.toThrow('Days parameter must be between 1 and 365');
    });

    it('should reject days parameter greater than 365', async () => {
      await expect(
        service.generateSimulation('user1', 366)
      ).rejects.toThrow('Days parameter must be between 1 and 365');
    });
  });
});

