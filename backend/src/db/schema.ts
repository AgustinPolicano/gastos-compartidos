import { pgTable, serial, varchar, integer, decimal, boolean, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const splitTypeEnum = pgEnum('split_type', ['default', 'custom', 'payer_only']);

// Settings table
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  person1Name: varchar('person1_name', { length: 50 }).notNull().default('Persona 1'),
  person2Name: varchar('person2_name', { length: 50 }).notNull().default('Persona 2'),
  person1Percentage: integer('person1_percentage').notNull().default(50),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(),
});

// Expenses table
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: varchar('description', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paidBy: varchar('paid_by', { length: 50 }).notNull(),
  category: varchar('category', { length: 50 }),
  splitType: splitTypeEnum('split_type').notNull().default('default'),
  customPercentage: integer('custom_percentage'),
  isInstallment: boolean('is_installment').notNull().default(false),
  totalInstallments: integer('total_installments'),
  installmentPayer: varchar('installment_payer', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Fixed Expenses table (estimaciones, no gastos reales)
export const fixedExpenses = pgTable('fixed_expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  description: varchar('description', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Installment Payments table
export const installmentPayments = pgTable('installment_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  expenseId: uuid('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  installmentNumber: integer('installment_number').notNull(),
  paidAt: timestamp('paid_at').notNull().defaultNow(),
});

// Payments table (transferencias entre personas)
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromPerson: varchar('from_person', { length: 50 }).notNull(),
  toPerson: varchar('to_person', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Types
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type FixedExpense = typeof fixedExpenses.$inferSelect;
export type NewFixedExpense = typeof fixedExpenses.$inferInsert;

export type InstallmentPayment = typeof installmentPayments.$inferSelect;
export type NewInstallmentPayment = typeof installmentPayments.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
