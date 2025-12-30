import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for the maid service system.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["super_admin", "admin", "team_member", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clients table for storing customer information
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  mobile1: varchar("mobile1", { length: 20 }).notNull(),
  mobile2: varchar("mobile2", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  zipCode: varchar("zipCode", { length: 10 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Services table for different maid service types
 */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  hours: int("hours"),
  baseSalaryMin: decimal("baseSalaryMin", { precision: 10, scale: 2 }).notNull(),
  baseSalaryMax: decimal("baseSalaryMax", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

/**
 * Bookings table for managing service requests
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: varchar("bookingId", { length: 50 }).notNull().unique(),
  clientId: int("clientId").notNull(),
  serviceId: int("serviceId").notNull(),
  assignedTo: int("assignedTo"),
  status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  salaryMin: decimal("salaryMin", { precision: 10, scale: 2 }).notNull(),
  salaryMax: decimal("salaryMax", { precision: 10, scale: 2 }).notNull(),
  workProfile: text("workProfile"),
  responsibilities: json("responsibilities"),
  bookingDate: timestamp("bookingDate"),
  completionDate: timestamp("completionDate"),
  notes: text("notes"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Payments table for tracking billing and commissions
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  paymentType: mysqlEnum("paymentType", ["standard", "japa", "trial"]).notNull(),
  baseSalary: decimal("baseSalary", { precision: 10, scale: 2 }).notNull(),
  commission: decimal("commission", { precision: 10, scale: 2 }).notNull(),
  gstRate: decimal("gstRate", { precision: 5, scale: 2 }).notNull(),
  gstAmount: decimal("gstAmount", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  trialFee: decimal("trialFee", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  paymentDate: timestamp("paymentDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * System configuration table for admin settings
 */
export const systemConfig = mysqlTable("systemConfig", {
  id: int("id").autoincrement().primaryKey(),
  gstRate: decimal("gstRate", { precision: 5, scale: 2 }).default("18.00").notNull(),
  trialFee: decimal("trialFee", { precision: 10, scale: 2 }).default("199.00").notNull(),
  officeAddress: text("officeAddress"),
  officePhone1: varchar("officePhone1", { length: 20 }),
  officePhone2: varchar("officePhone2", { length: 20 }),
  officeEmail: varchar("officeEmail", { length: 320 }),
  website: varchar("website", { length: 255 }),
  companyName: varchar("companyName", { length: 255 }).default("JOB FARMS"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertSystemConfig = typeof systemConfig.$inferInsert;