import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { nanoid } from "nanoid";

// Helper function to check admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin" && ctx.user?.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Helper function to calculate billing
function calculateBilling(salary: number, type: "standard" | "japa" | "trial", gstRate: number, trialFee: number) {
  let commission = 0;
  if (type === "standard") commission = salary;
  if (type === "japa") commission = salary / 2;
  if (type === "trial") commission = (salary / 30) + trialFee;
  
  const gstAmount = Math.round(commission * (gstRate / 100) * 100) / 100;
  const totalAmount = commission + gstAmount;
  
  return { commission, gstAmount, totalAmount };
}

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ===== CLIENT MANAGEMENT =====
  clients: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getClients(input?.status);
      }),
    
    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getClientById(input);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        mobile1: z.string().min(10),
        mobile2: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createClient({
          ...input,
          createdBy: ctx.user!.id,
          status: "active",
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        mobile1: z.string().optional(),
        mobile2: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["active", "inactive", "archived"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateClient(id, data);
      }),
    
    delete: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return db.deleteClient(input);
      }),
  }),

  // ===== BOOKING MANAGEMENT =====
  bookings: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getBookings(input?.status);
      }),
    
    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getBookingById(input);
      }),
    
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        serviceId: z.number(),
        salaryMin: z.number(),
        salaryMax: z.number(),
        workProfile: z.string().optional(),
        responsibilities: z.array(z.string()).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const bookingId = "24HMS-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
        return db.createBooking({
          bookingId,
          clientId: input.clientId,
          serviceId: input.serviceId,
          salaryMin: String(input.salaryMin),
          salaryMax: String(input.salaryMax),
          workProfile: input.workProfile,
          responsibilities: input.responsibilities,
          notes: input.notes,
          status: "pending",
          createdBy: ctx.user!.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]).optional(),
        assignedTo: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateBooking(id, data);
      }),
  }),

  // ===== SERVICES =====
  services: router({
    list: protectedProcedure.query(async () => {
      return db.getServices();
    }),
    
    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getServiceById(input);
      }),
  }),

  // ===== BILLING & PAYMENTS =====
  billing: router({
    calculate: protectedProcedure
      .input(z.object({
        salary: z.number(),
        type: z.enum(["standard", "japa", "trial"]),
      }))
      .query(async ({ input }) => {
        const config = await db.getSystemConfig();
        const gstRate = config?.gstRate ? Number(config.gstRate) : 18;
        const trialFee = config?.trialFee ? Number(config.trialFee) : 199;
        
        return calculateBilling(input.salary, input.type, gstRate, trialFee);
      }),
    
    createPayment: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        paymentType: z.enum(["standard", "japa", "trial"]),
        baseSalary: z.number(),
      }))
      .mutation(async ({ input }) => {
        const config = await db.getSystemConfig();
        const gstRate = config?.gstRate ? Number(config.gstRate) : 18;
        const trialFee = config?.trialFee ? Number(config.trialFee) : 199;
        
        const { commission, gstAmount, totalAmount } = calculateBilling(input.baseSalary, input.paymentType, gstRate, trialFee);
        
        return db.createPayment({
          bookingId: input.bookingId,
          paymentType: input.paymentType,
          baseSalary: String(input.baseSalary),
          commission: String(commission),
          gstRate: String(gstRate),
          gstAmount: String(gstAmount),
          totalAmount: String(totalAmount),
          trialFee: input.paymentType === "trial" ? String(trialFee) : undefined,
          status: "pending",
        });
      }),
    
    getByBookingId: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getPaymentsByBookingId(input);
      }),
  }),

  // ===== ADMIN SETTINGS =====
  payments: router({
    list: protectedProcedure.query(async () => {
      // Return mock payment data for now
      return [
        { id: 1, bookingId: 1, amount: "5000", status: "paid", dueDate: new Date(), createdAt: new Date() },
        { id: 2, bookingId: 2, amount: "7500", status: "pending", dueDate: new Date(), createdAt: new Date() },
        { id: 3, bookingId: 3, amount: "6000", status: "overdue", dueDate: new Date(), createdAt: new Date() },
      ];
    }),
  }),

  admin: router({
    getConfig: adminProcedure.query(async () => {
      return db.getSystemConfig();
    }),
    
    updateConfig: adminProcedure
      .input(z.object({
        gstRate: z.number().optional(),
        trialFee: z.number().optional(),
        officeAddress: z.string().optional(),
        officePhone1: z.string().optional(),
        officePhone2: z.string().optional(),
        officeEmail: z.string().optional(),
        website: z.string().optional(),
        companyName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const updateData: any = {};
        if (input.gstRate !== undefined) updateData.gstRate = String(input.gstRate);
        if (input.trialFee !== undefined) updateData.trialFee = String(input.trialFee);
        if (input.officeAddress !== undefined) updateData.officeAddress = input.officeAddress;
        if (input.officePhone1 !== undefined) updateData.officePhone1 = input.officePhone1;
        if (input.officePhone2 !== undefined) updateData.officePhone2 = input.officePhone2;
        if (input.officeEmail !== undefined) updateData.officeEmail = input.officeEmail;
        if (input.website !== undefined) updateData.website = input.website;
        if (input.companyName !== undefined) updateData.companyName = input.companyName;
        return db.updateSystemConfig(updateData);
      }),
  }),
});

export type AppRouter = typeof appRouter;
