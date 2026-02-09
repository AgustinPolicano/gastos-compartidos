import { and, gte, lte, eq } from 'drizzle-orm';
import { db } from '../db';
import { expenses, installmentPayments, payments, settings } from '../db/schema';

export interface BalanceResult {
  person1Name: string;
  person2Name: string;
  person1Owes: number; // Lo que persona 1 adeuda (gastos que pagó persona 2)
  person2Owes: number; // Lo que persona 2 adeuda (gastos que pagó persona 1)
  person1Paid: number; // Total de transferencias que persona 1 hizo a persona 2
  person2Paid: number; // Total de transferencias que persona 2 hizo a persona 1
  netBalance: number; // Positivo = persona 1 adeuda, Negativo = persona 2 adeuda
  whoOwes: string; // 'person1' | 'person2' | 'even'
  amount: number; // Monto absoluto de la deuda
}

export const calculateBalance = async (month?: number, year?: number): Promise<BalanceResult> => {
  // Obtener settings
  const settingsData = await db.select().from(settings).limit(1);

  if (settingsData.length === 0) {
    throw new Error('Configuración no encontrada');
  }

  const { person1Name, person2Name, person1Percentage } = settingsData[0];
  const person2Percentage = 100 - person1Percentage;

  // Fechas para filtros
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (month && year) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59);
  }

  // 1. Obtener gastos normales (no en cuotas)
  const normalExpensesConditions = [eq(expenses.isInstallment, false)];
  if (startDate && endDate) {
    normalExpensesConditions.push(gte(expenses.createdAt, startDate));
    normalExpensesConditions.push(lte(expenses.createdAt, endDate));
  }

  const normalExpenses = await db
    .select()
    .from(expenses)
    .where(and(...normalExpensesConditions));

  // 2. Obtener cuotas pagadas en el período
  const installmentExpenses = await db.select().from(expenses).where(eq(expenses.isInstallment, true));

  let installmentsPaid: any[] = [];

  for (const expense of installmentExpenses) {
    const installmentsConditions = [eq(installmentPayments.expenseId, expense.id)];
    
    if (startDate && endDate) {
      installmentsConditions.push(gte(installmentPayments.paidAt, startDate));
      installmentsConditions.push(lte(installmentPayments.paidAt, endDate));
    }

    const paid = await db
      .select()
      .from(installmentPayments)
      .where(and(...installmentsConditions));

    installmentsPaid = installmentsPaid.concat(
      paid.map((p) => ({
        ...p,
        expense,
        installmentAmount: parseFloat(expense.amount) / (expense.totalInstallments || 1),
      }))
    );
  }

  // 3. Calcular deudas por gastos normales
  let person1OwesFromExpenses = 0;
  let person2OwesFromExpenses = 0;

  for (const expense of normalExpenses) {
    const amount = parseFloat(expense.amount);
    const paidBy = expense.paidBy;

    if (expense.splitType === 'payer_only') {
      // No se divide
      continue;
    }

    let person1Share: number;
    let person2Share: number;

    if (expense.splitType === 'custom' && expense.customPercentage !== null) {
      person1Share = (amount * expense.customPercentage) / 100;
      person2Share = amount - person1Share;
    } else {
      // default
      person1Share = (amount * person1Percentage) / 100;
      person2Share = (amount * person2Percentage) / 100;
    }

    // Si persona 2 pagó, persona 1 le adeuda su parte
    if (paidBy.toLowerCase() === person2Name.toLowerCase()) {
      person1OwesFromExpenses += person1Share;
    }

    // Si persona 1 pagó, persona 2 le adeuda su parte
    if (paidBy.toLowerCase() === person1Name.toLowerCase()) {
      person2OwesFromExpenses += person2Share;
    }
  }

  // 4. Calcular deudas por cuotas pagadas
  for (const installment of installmentsPaid) {
    const amount = installment.installmentAmount;
    const expense = installment.expense;
    const paidBy = expense.installmentPayer;

    if (expense.splitType === 'payer_only') {
      continue;
    }

    let person1Share: number;
    let person2Share: number;

    if (expense.splitType === 'custom' && expense.customPercentage !== null) {
      person1Share = (amount * expense.customPercentage) / 100;
      person2Share = amount - person1Share;
    } else {
      person1Share = (amount * person1Percentage) / 100;
      person2Share = (amount * person2Percentage) / 100;
    }

    if (paidBy.toLowerCase() === person2Name.toLowerCase()) {
      person1OwesFromExpenses += person1Share;
    }

    if (paidBy.toLowerCase() === person1Name.toLowerCase()) {
      person2OwesFromExpenses += person2Share;
    }
  }

  // 5. Obtener pagos/transferencias entre personas
  const paymentsConditions = [];
  if (startDate && endDate) {
    paymentsConditions.push(gte(payments.createdAt, startDate));
    paymentsConditions.push(lte(payments.createdAt, endDate));
  }

  const allPayments = paymentsConditions.length > 0
    ? await db.select().from(payments).where(and(...paymentsConditions))
    : await db.select().from(payments);

  let person1PaidToPerson2 = 0;
  let person2PaidToPerson1 = 0;

  for (const payment of allPayments) {
    const amount = parseFloat(payment.amount);

    // Persona 1 le pagó a Persona 2
    if (
      payment.fromPerson.toLowerCase() === person1Name.toLowerCase() &&
      payment.toPerson.toLowerCase() === person2Name.toLowerCase()
    ) {
      person1PaidToPerson2 += amount;
    }

    // Persona 2 le pagó a Persona 1
    if (
      payment.fromPerson.toLowerCase() === person2Name.toLowerCase() &&
      payment.toPerson.toLowerCase() === person1Name.toLowerCase()
    ) {
      person2PaidToPerson1 += amount;
    }
  }

  // 6. Calcular balance neto
  // person1Owes - person1Paid = lo que persona 1 adeuda neto
  // person2Owes - person2Paid = lo que persona 2 adeuda neto
  const person1NetDebt = person1OwesFromExpenses - person1PaidToPerson2;
  const person2NetDebt = person2OwesFromExpenses - person2PaidToPerson1;

  const netBalance = person1NetDebt - person2NetDebt;

  let whoOwes: string;
  let amount: number;

  if (Math.abs(netBalance) < 0.01) {
    whoOwes = 'even';
    amount = 0;
  } else if (netBalance > 0) {
    whoOwes = 'person1';
    amount = netBalance;
  } else {
    whoOwes = 'person2';
    amount = Math.abs(netBalance);
  }

  return {
    person1Name,
    person2Name,
    person1Owes: parseFloat(person1OwesFromExpenses.toFixed(2)),
    person2Owes: parseFloat(person2OwesFromExpenses.toFixed(2)),
    person1Paid: parseFloat(person1PaidToPerson2.toFixed(2)),
    person2Paid: parseFloat(person2PaidToPerson1.toFixed(2)),
    netBalance: parseFloat(netBalance.toFixed(2)),
    whoOwes,
    amount: parseFloat(amount.toFixed(2)),
  };
};
