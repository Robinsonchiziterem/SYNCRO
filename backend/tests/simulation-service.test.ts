import { SimulationService } from "../src/services/simulation-service";
import type { Subscription } from "../src/types/subscription";

describe("SimulationService", () => {
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

    it("should add 365 days for yearly billing cycle", () => {
      const currentDate = new Date("2024-01-01");
      const nextDate = service.calculateNextRenewal(currentDate, "yearly");

      expect(nextDate.toISOString()).toBe(
        new Date("2025-01-01").toISOString()
      );
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

  describe("projectSubscriptionRenewals", () => {
    const baseSubscription = {
      id: "1",
      user_id: "user1",
      email_account_id: null,
      merchant_id: null,
      name: "Netflix",
      provider: "Netflix",
      price: 15.99,
      currency: "USD",
      billing_cycle: "monthly",
      status: "active",
      category: "Entertainment",
      logo_url: null,
      website_url: null,
      renewal_url: null,
      notes: null,
      visibility: "private",
      tags: [],
      expired_at: null,
      paused_at: null,
      resume_at: null,
      pause_reason: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    it("should return empty array when no next_billing_date", () => {
      const subscription = {
        ...baseSubscription,
        next_billing_date: null,
      };

      const projections = service.projectSubscriptionRenewals(
        subscription as Subscription,
        new Date("2024-02-01")
      );

      expect(projections).toEqual([]);
    });

    it("should generate single renewal within range", () => {
      const subscription = {
        ...baseSubscription,
        next_billing_date: "2024-01-15",
      };

      const projections = service.projectSubscriptionRenewals(
        subscription as Subscription,
        new Date("2024-02-01")
      );

      expect(projections).toHaveLength(1);
      expect(projections[0].subscriptionId).toBe("1");
    });

    it("should generate multiple renewals", () => {
      const subscription = {
        ...baseSubscription,
        next_billing_date: "2024-01-01",
      };

      const projections = service.projectSubscriptionRenewals(
        subscription as Subscription,
        new Date("2024-03-01")
      );

      expect(projections).toHaveLength(2);
      expect(projections[0].projectedDate).toBe(new Date('2024-01-01').toISOString());
      expect(projections[1].projectedDate).toBe(new Date('2024-02-01').toISOString());
    });

    it("should not exceed end date", () => {
      const subscription = {
        ...baseSubscription,
        billing_cycle: "yearly",
        next_billing_date: "2024-01-01",
      };

      const projections = service.projectSubscriptionRenewals(
        subscription as Subscription,
        new Date("2024-02-01")
      );

      expect(projections).toHaveLength(1);
    });
  });

  describe("validation", () => {
    it("should reject invalid days", async () => {
      await expect(service.generateSimulation("user1", 0)).rejects.toThrow();
      await expect(service.generateSimulation("user1", 366)).rejects.toThrow();
    });
  });
});