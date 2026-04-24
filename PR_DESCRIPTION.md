## Description

This PR standardizes the billing cycle calculations across the SYNCRO backend and client library. Previously, the system used fixed-day arithmetic (30/90/365 days) which caused date drift over time (e.g., January 31st projecting to March 2nd/3rd instead of February 28th/29th). 

The new implementation uses `date-fns` calendar-aware functions (`addMonths`, `addQuarters`, `addYears`) to ensure accurate renewal dates that respect varying month lengths and leap years.

### Key Changes:
- **Simulation Service**: Refactored `calculateNextRenewal` to use `date-fns`.
- **Renewal Executor**: Standardized next billing date calculation during the renewal process.
- **Client Utils**: Updated `subscription-utils.ts` to use `addDays` consistency.
- **Dependencies**: Added `date-fns` to the backend.

---

## Related Issue

Closes #142

---

## Test Plan

- [x] Tested locally (verified with unit tests for Jan 31st and Feb 29th transitions)
- [x] Verified expected behavior (projections correctly align with calendar months)
- [x] No regressions introduced (all existing logic and mathematical averages in analytics remain consistent)

---

## Screenshots (if applicable)

---

## Checklist

- [x] Code builds successfully
- [x] Tests pass
- [x] Follows project conventions
- [x] No sensitive data exposed

#142
