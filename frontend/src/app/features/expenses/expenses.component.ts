import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, Expense, Settings } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gastos</h1>
        <button
          (click)="showForm.set(true)"
          class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow"
        >
          Nuevo Gasto
        </button>
      </div>

      <!-- Form Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <h2 class="text-2xl font-bold mb-6">{{ editingId() ? 'Editar Gasto' : 'Nuevo Gasto' }}</h2>

              <form (ngSubmit)="saveExpense()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <input
                    type="text"
                    [(ngModel)]="form.description"
                    name="description"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                    placeholder="Ej: Supermercado"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Monto</label>
                  <input
                    type="number"
                    [(ngModel)]="form.amount"
                    name="amount"
                    required
                    step="0.01"
                    min="0"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pagó</label>
                  <select
                    [(ngModel)]="form.paidBy"
                    name="paidBy"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                  >
                    <option value="">Seleccionar...</option>
                    @if (settings(); as s) {
                      <option [value]="s.person1Name">{{ s.person1Name }}</option>
                      <option [value]="s.person2Name">{{ s.person2Name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Categoría (opcional)</label>
                  <input
                    type="text"
                    [(ngModel)]="form.category"
                    name="category"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                    placeholder="Ej: Comida, Servicios, etc"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">División del gasto</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input
                        type="radio"
                        [(ngModel)]="form.splitType"
                        name="splitType"
                        value="default"
                        class="mr-2"
                      />
                      <span>Por defecto (@if (settings(); as s) { {{ s.person1Percentage }}% / {{ s.person2Percentage }}% })</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        type="radio"
                        [(ngModel)]="form.splitType"
                        name="splitType"
                        value="custom"
                        class="mr-2"
                      />
                      <span>Personalizado</span>
                    </label>
                    <label class="flex items-center">
                      <input
                        type="radio"
                        [(ngModel)]="form.splitType"
                        name="splitType"
                        value="payer_only"
                        class="mr-2"
                      />
                      <span>Solo quien pagó (no se divide)</span>
                    </label>
                  </div>
                </div>

                @if (form.splitType === 'custom') {
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Porcentaje persona 1 (@if (settings(); as s) { {{ s.person1Name }} })
                    </label>
                    <input
                      type="number"
                      [(ngModel)]="form.customPercentage"
                      name="customPercentage"
                      min="0"
                      max="100"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                    />
                    <p class="text-sm text-gray-500 mt-1">
                      Persona 2 pagará el {{ 100 - (form.customPercentage || 0) }}%
                    </p>
                  </div>
                }

                <div class="border-t pt-4">
                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      [(ngModel)]="form.isInstallment"
                      name="isInstallment"
                      class="mr-2 h-5 w-5"
                    />
                    <span class="text-sm font-medium text-gray-700">Es en cuotas</span>
                  </label>
                </div>

                @if (form.isInstallment) {
                  <div class="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad de cuotas</label>
                      <input
                        type="number"
                        [(ngModel)]="form.totalInstallments"
                        name="totalInstallments"
                        min="1"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Quién paga las cuotas</label>
                      <select
                        [(ngModel)]="form.installmentPayer"
                        name="installmentPayer"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                      >
                        <option value="">Seleccionar...</option>
                        @if (settings(); as s) {
                          <option [value]="s.person1Name">{{ s.person1Name }}</option>
                          <option [value]="s.person2Name">{{ s.person2Name }}</option>
                        }
                      </select>
                    </div>

                    @if (form.totalInstallments && form.totalInstallments > 0 && form.amount) {
                      <div class="text-sm text-purple-700">
                        Cuota mensual: \${{ (form.amount / form.totalInstallments) | number:'1.0-0' }}
                      </div>
                    }
                  </div>
                }

                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    (click)="closeForm()"
                    class="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    class="flex-1 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow"
                  >
                    {{ editingId() ? 'Actualizar' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Expenses List -->
      <div class="bg-white rounded-xl shadow-md border-t-4 border-t-slate-800">
        @if (loading()) {
          <app-loader text="Cargando gastos..."></app-loader>
        } @else if (expenses().length === 0) {
          <div class="text-center py-16 bg-gray-50 rounded-b-xl">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <p class="text-gray-500 text-lg font-medium">No hay gastos todavía</p>
            <p class="text-gray-400 text-sm mt-1">Registra un nuevo gasto para empezar</p>
          </div>
        } @else {
          <div class="divide-y">
            @for (expense of expenses(); track expense.id) {
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">{{ expense.description }}</h3>
                      @if (expense.isInstallment) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800">
                          {{ expense.totalInstallments }} cuotas
                        </span>
                      }
                      @if (expense.category) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {{ expense.category }}
                        </span>
                      }
                    </div>
                    <div class="text-sm text-gray-600 space-y-1">
                      <p>Pagó: <span class="font-medium">{{ expense.paidBy }}</span></p>
                      <p>División: 
                        @if (expense.splitType === 'default') {
                          <span>Por defecto</span>
                        } @else if (expense.splitType === 'custom') {
                          <span>Custom ({{ expense.customPercentage }}%)</span>
                        } @else {
                          <span>Solo quien pagó</span>
                        }
                      </p>
                      @if (expense.isInstallment) {
                        <p>Paga las cuotas: <span class="font-medium">{{ expense.installmentPayer }}</span></p>
                      }
                      <p class="text-xs text-gray-500">{{ formatDate(expense.createdAt) }}</p>
                    </div>
                  </div>

                  <div class="text-right ml-4">
                    <p class="text-2xl font-bold text-gray-900 mb-3">\${{ parseFloat(expense.amount) | number:'1.0-0' }}</p>
                    <div class="flex gap-2">
                      @if (expense.isInstallment) {
                        <a
                          [routerLink]="['/expenses', expense.id, 'installments']"
                          class="text-xs font-medium text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Ver cuotas
                        </a>
                      }
                      <button
                        (click)="editExpense(expense)"
                        class="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        (click)="deleteExpense(expense.id)"
                        class="text-xs font-medium text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ExpensesComponent implements OnInit {
  private readonly api = inject(ApiService);

  expenses = signal<Expense[]>([]);
  settings = signal<Settings | null>(null);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  form = {
    description: '',
    amount: 0,
    paidBy: '',
    category: '',
    splitType: 'default' as 'default' | 'custom' | 'payer_only',
    customPercentage: 50,
    isInstallment: false,
    totalInstallments: 1,
    installmentPayer: '',
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.api.getSettings().subscribe({
      next: (s) => this.settings.set(s),
      error: (err) => console.error('Error loading settings:', err),
    });

    this.api.getExpenses().subscribe({
      next: (expenses) => {
        this.expenses.set(expenses);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading expenses:', err);
        this.loading.set(false);
      },
    });
  }

  editExpense(expense: Expense) {
    this.editingId.set(expense.id);
    this.form = {
      description: expense.description,
      amount: parseFloat(expense.amount),
      paidBy: expense.paidBy,
      category: expense.category || '',
      splitType: expense.splitType,
      customPercentage: expense.customPercentage || 50,
      isInstallment: expense.isInstallment,
      totalInstallments: expense.totalInstallments || 1,
      installmentPayer: expense.installmentPayer || '',
    };
    this.showForm.set(true);
  }

  saveExpense() {
    const data = {
      ...this.form,
      amount: this.form.amount.toString(),
    };

    if (this.editingId()) {
      this.api.updateExpense(this.editingId()!, data).subscribe({
        next: () => {
          this.loadData();
          this.closeForm();
        },
        error: (err) => console.error('Error updating expense:', err),
      });
    } else {
      this.api.createExpense(data).subscribe({
        next: () => {
          this.loadData();
          this.closeForm();
        },
        error: (err) => console.error('Error creating expense:', err),
      });
    }
  }

  deleteExpense(id: string) {
    if (!confirm('¿Eliminar este gasto?')) return;

    this.api.deleteExpense(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error deleting expense:', err),
    });
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form = {
      description: '',
      amount: 0,
      paidBy: '',
      category: '',
      splitType: 'default',
      customPercentage: 50,
      isInstallment: false,
      totalInstallments: 1,
      installmentPayer: '',
    };
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }
}
