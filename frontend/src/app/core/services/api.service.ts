import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Settings {
  id: number;
  person1Name: string;
  person2Name: string;
  person1Percentage: number;
  person2Percentage: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: string;
  paidBy: string;
  category?: string;
  splitType: 'default' | 'custom' | 'payer_only';
  customPercentage?: number;
  isInstallment: boolean;
  totalInstallments?: number;
  installmentPayer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FixedExpense {
  id: string;
  description: string;
  amount: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentPayment {
  id: string;
  expenseId: string;
  installmentNumber: number;
  paidAt: string;
}

export interface Payment {
  id: string;
  fromPerson: string;
  toPerson: string;
  amount: string;
  description?: string;
  createdAt: string;
}

export interface Balance {
  person1Name: string;
  person2Name: string;
  person1Owes: number;
  person2Owes: number;
  person1Paid: number;
  person2Paid: number;
  netBalance: number;
  whoOwes: 'person1' | 'person2' | 'even';
  amount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Auth
  checkAuthStatus(): Observable<{ configured: boolean }> {
    return this.http.get<{ configured: boolean }>(`${this.baseUrl}/auth/status`);
  }

  setupPin(pin: string, person1Name?: string, person2Name?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/setup`, { pin, person1Name, person2Name });
  }

  verifyPin(pin: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/verify`, { pin });
  }

  // Settings
  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(`${this.baseUrl}/settings`);
  }

  updateSettings(data: Partial<Settings> & { newPin?: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/settings`, data);
  }

  // Expenses
  getExpenses(filters?: { month?: number; year?: number; category?: string }): Observable<Expense[]> {
    let params = new HttpParams();
    if (filters?.month) params = params.set('month', filters.month.toString());
    if (filters?.year) params = params.set('year', filters.year.toString());
    if (filters?.category) params = params.set('category', filters.category);

    return this.http.get<Expense[]>(`${this.baseUrl}/expenses`, { params });
  }

  getExpense(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.baseUrl}/expenses/${id}`);
  }

  createExpense(data: Partial<Expense>): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/expenses`, data);
  }

  updateExpense(id: string, data: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/expenses/${id}`, data);
  }

  deleteExpense(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/expenses/${id}`);
  }

  // Installments
  getInstallments(expenseId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/expenses/${expenseId}/installments`);
  }

  payInstallment(expenseId: string, installmentNumber: number): Observable<InstallmentPayment> {
    return this.http.post<InstallmentPayment>(`${this.baseUrl}/expenses/${expenseId}/installments`, {
      installmentNumber,
    });
  }

  unpayInstallment(expenseId: string, installmentNumber: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/expenses/${expenseId}/installments/${installmentNumber}`);
  }

  // Payments
  getPayments(filters?: { month?: number; year?: number }): Observable<Payment[]> {
    let params = new HttpParams();
    if (filters?.month) params = params.set('month', filters.month.toString());
    if (filters?.year) params = params.set('year', filters.year.toString());

    return this.http.get<Payment[]>(`${this.baseUrl}/payments`, { params });
  }

  createPayment(data: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/payments`, data);
  }

  deletePayment(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/payments/${id}`);
  }

  // Balance
  getBalance(filters?: { month?: number; year?: number }): Observable<Balance> {
    let params = new HttpParams();
    if (filters?.month) params = params.set('month', filters.month.toString());
    if (filters?.year) params = params.set('year', filters.year.toString());

    return this.http.get<Balance>(`${this.baseUrl}/balance`, { params });
  }

  getTotalBalance(): Observable<Balance> {
    return this.http.get<Balance>(`${this.baseUrl}/balance/total`);
  }

  // Fixed Expenses (estimaciones)
  getFixedExpenses(): Observable<FixedExpense[]> {
    return this.http.get<FixedExpense[]>(`${this.baseUrl}/fixed-expenses`);
  }

  getFixedExpense(id: string): Observable<FixedExpense> {
    return this.http.get<FixedExpense>(`${this.baseUrl}/fixed-expenses/${id}`);
  }

  createFixedExpense(data: Partial<FixedExpense>): Observable<FixedExpense> {
    return this.http.post<FixedExpense>(`${this.baseUrl}/fixed-expenses`, data);
  }

  updateFixedExpense(id: string, data: Partial<FixedExpense>): Observable<FixedExpense> {
    return this.http.put<FixedExpense>(`${this.baseUrl}/fixed-expenses/${id}`, data);
  }

  deleteFixedExpense(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/fixed-expenses/${id}`);
  }

  getFixedExpensesTotal(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.baseUrl}/fixed-expenses/total/sum`);
  }
}
