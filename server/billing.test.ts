import { describe, it, expect } from "vitest";

// Billing calculation function (same as in routers.ts)
function calculateBilling(salary: number, type: "standard" | "japa" | "trial", gstRate: number, trialFee: number) {
  let commission = 0;
  if (type === "standard") commission = salary;
  if (type === "japa") commission = salary / 2;
  if (type === "trial") commission = (salary / 30) + trialFee;
  
  const gstAmount = Math.round(commission * (gstRate / 100) * 100) / 100;
  const totalAmount = commission + gstAmount;
  
  return { commission, gstAmount, totalAmount };
}

describe("Billing Calculator", () => {
  const gstRate = 18;
  const trialFee = 199;

  describe("Standard Billing", () => {
    it("should calculate full commission on salary", () => {
      const result = calculateBilling(10000, "standard", gstRate, trialFee);
      expect(result.commission).toBe(10000);
    });

    it("should apply GST correctly on standard commission", () => {
      const result = calculateBilling(10000, "standard", gstRate, trialFee);
      const expectedGST = Math.round(10000 * (18 / 100) * 100) / 100;
      expect(result.gstAmount).toBe(expectedGST);
    });

    it("should calculate total amount correctly", () => {
      const result = calculateBilling(10000, "standard", gstRate, trialFee);
      expect(result.totalAmount).toBe(result.commission + result.gstAmount);
    });

    it("should handle different salary amounts", () => {
      const result1 = calculateBilling(5000, "standard", gstRate, trialFee);
      const result2 = calculateBilling(20000, "standard", gstRate, trialFee);
      
      expect(result1.commission).toBe(5000);
      expect(result2.commission).toBe(20000);
    });
  });

  describe("JAPA Billing", () => {
    it("should calculate 50% commission on salary", () => {
      const result = calculateBilling(10000, "japa", gstRate, trialFee);
      expect(result.commission).toBe(5000);
    });

    it("should apply GST correctly on JAPA commission", () => {
      const result = calculateBilling(10000, "japa", gstRate, trialFee);
      const expectedGST = Math.round(5000 * (18 / 100) * 100) / 100;
      expect(result.gstAmount).toBe(expectedGST);
    });

    it("should be exactly half of standard billing commission", () => {
      const standard = calculateBilling(10000, "standard", gstRate, trialFee);
      const japa = calculateBilling(10000, "japa", gstRate, trialFee);
      
      expect(japa.commission).toBe(standard.commission / 2);
    });
  });

  describe("Trial Billing", () => {
    it("should calculate 1/30th of salary plus trial fee", () => {
      const result = calculateBilling(3000, "trial", gstRate, trialFee);
      const expectedCommission = (3000 / 30) + trialFee;
      expect(result.commission).toBeCloseTo(expectedCommission, 2);
    });

    it("should include trial fee in commission", () => {
      const result = calculateBilling(3000, "trial", gstRate, trialFee);
      const salaryPortion = 3000 / 30;
      expect(result.commission).toBeCloseTo(salaryPortion + trialFee, 2);
    });

    it("should apply GST on total commission including trial fee", () => {
      const result = calculateBilling(3000, "trial", gstRate, trialFee);
      const expectedGST = Math.round(result.commission * (18 / 100) * 100) / 100;
      expect(result.gstAmount).toBe(expectedGST);
    });
  });

  describe("GST Calculations", () => {
    it("should correctly apply 18% GST", () => {
      const result = calculateBilling(10000, "standard", 18, trialFee);
      expect(result.gstAmount).toBe(1800);
    });

    it("should correctly apply custom GST rates", () => {
      const result5 = calculateBilling(10000, "standard", 5, trialFee);
      const result12 = calculateBilling(10000, "standard", 12, trialFee);
      
      expect(result5.gstAmount).toBe(500);
      expect(result12.gstAmount).toBe(1200);
    });

    it("should round GST to 2 decimal places", () => {
      const result = calculateBilling(10001, "standard", 18, trialFee);
      const gstString = result.gstAmount.toString();
      const decimalPlaces = gstString.includes('.') ? gstString.split('.')[1].length : 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero salary", () => {
      const result = calculateBilling(0, "standard", gstRate, trialFee);
      expect(result.commission).toBe(0);
      expect(result.gstAmount).toBe(0);
      expect(result.totalAmount).toBe(0);
    });

    it("should handle very large salaries", () => {
      const result = calculateBilling(1000000, "standard", gstRate, trialFee);
      expect(result.commission).toBe(1000000);
      expect(result.gstAmount).toBe(180000);
      expect(result.totalAmount).toBe(1180000);
    });

    it("should handle decimal salaries", () => {
      const result = calculateBilling(10000.50, "standard", gstRate, trialFee);
      expect(result.commission).toBe(10000.50);
    });

    it("should handle zero GST rate", () => {
      const result = calculateBilling(10000, "standard", 0, trialFee);
      expect(result.gstAmount).toBe(0);
      expect(result.totalAmount).toBe(10000);
    });
  });

  describe("Consistency Checks", () => {
    it("should maintain total = commission + gst", () => {
      const testCases = [
        { salary: 5000, type: "standard" as const },
        { salary: 10000, type: "japa" as const },
        { salary: 3000, type: "trial" as const },
      ];

      testCases.forEach(({ salary, type }) => {
        const result = calculateBilling(salary, type, gstRate, trialFee);
        expect(result.totalAmount).toBeCloseTo(result.commission + result.gstAmount, 2);
      });
    });

    it("should always have positive amounts", () => {
      const result = calculateBilling(10000, "standard", gstRate, trialFee);
      expect(result.commission).toBeGreaterThanOrEqual(0);
      expect(result.gstAmount).toBeGreaterThanOrEqual(0);
      expect(result.totalAmount).toBeGreaterThanOrEqual(0);
    });
  });
});
