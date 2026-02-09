import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Balance, Expense, FixedExpense } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  template: `
    <div class="max-w-7xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

         <div class="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 p-8 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span class="text-orange-500">📅</span> Estimado {{ currentMonth() }}
        </h2>
        
        <div class="text-center py-4">
          <div class="text-4xl font-bold text-gray-900 mb-2">\${{ monthlyEstimate() | number:'1.0-0' }}</div>
          <p class="text-gray-500">Total estimado del mes</p>
        </div>

        <div class="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100 text-sm">
          <div>
            <p class="text-gray-500 mb-1">Gastos reales</p>
            <p class="text-lg font-bold text-gray-900">\${{ monthlyExpensesTotal() | number:'1.0-0' }}</p>
          </div>
          <div>
            <p class="text-gray-500 mb-1">Gastos fijos</p>
            <p class="text-lg font-bold text-gray-900">\${{ fixedExpensesTotal() | number:'1.0-0' }}</p>
          </div>
          <div>
            <p class="text-gray-500 mb-1">Cuotas del mes</p>
            <p class="text-lg font-bold text-gray-900">\${{ monthlyInstallmentsTotal() | number:'1.0-0' }}</p>
          </div>
        </div>
      </div>

      <!-- Balance Card -->
      @if (balance(); as bal) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 p-8 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span class="text-blue-500">📊</span> Balance Total
          </h2>
          
          @if (bal.whoOwes === 'even') {
            <div class="text-center py-6">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-4">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div class="text-3xl font-bold text-gray-900 mb-2">Al día</div>
              <p class="text-gray-500">No hay deudas pendientes</p>
            </div>
          } @else {
            <div class="text-center py-6">
              <div class="text-4xl font-bold text-gray-900 mb-2">\${{ bal.amount | number:'1.0-0' }}</div>
              <p class="text-lg text-gray-600">
                <span class="font-medium text-gray-900">{{ bal.whoOwes === 'person1' ? bal.person1Name : bal.person2Name }}</span>
                le debe a
                <span class="font-medium text-gray-900">{{ bal.whoOwes === 'person1' ? bal.person2Name : bal.person1Name }}</span>
              </p>
            </div>
          }

          <div class="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-100">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">{{ bal.person1Name }} debe</p>
              <p class="text-xl font-bold text-gray-900">\${{ bal.person1Owes | number:'1.0-0' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">{{ bal.person2Name }} debe</p>
              <p class="text-xl font-bold text-gray-900">\${{ bal.person2Owes | number:'1.0-0' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">{{ bal.person1Name }} pagó</p>
              <p class="text-xl font-bold text-gray-900">\${{ bal.person1Paid | number:'1.0-0' }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">{{ bal.person2Name }} pagó</p>
              <p class="text-xl font-bold text-gray-900">\${{ bal.person2Paid | number:'1.0-0' }}</p>
            </div>
          </div>
        </div>
      }

      <!-- Estimación del Mes -->
      <!-- Estimación del Mes -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 p-8 mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span class="text-orange-500">📅</span> Estimado {{ currentMonth() }}
        </h2>
        
        <div class="text-center py-4">
          <div class="text-4xl font-bold text-gray-900 mb-2">\${{ monthlyEstimate() | number:'1.0-0' }}</div>
          <p class="text-gray-500">Total estimado del mes</p>
        </div>

        <div class="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100 text-sm">
          <div>
            <p class="text-gray-500 mb-1">Gastos reales</p>
            <p class="text-lg font-bold text-gray-900">\${{ monthlyExpensesTotal() | number:'1.0-0' }}</p>
          </div>
          <div>
            <p class="text-gray-500 mb-1">Gastos fijos</p>
            <p class="text-lg font-bold text-gray-900">\${{ fixedExpensesTotal() | number:'1.0-0' }}</p>
          </div>
          <div>
            <p class="text-gray-500 mb-1">Cuotas del mes</p>
            <p class="text-lg font-bold text-gray-900">\${{ monthlyInstallmentsTotal() | number:'1.0-0' }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <a
          routerLink="/expenses"
          class="bg-white rounded-xl p-6 border border-gray-200 border-b-4 border-b-blue-500 hover:shadow-md transition-all group"
        >
          <h3 class="text-base font-semibold text-gray-900 group-hover:text-slate-700">Gastos</h3>
          <p class="text-gray-500 text-sm mt-1">Ver y agregar gastos</p>
        </a>

        <a
          routerLink="/payments"
          class="bg-white rounded-xl p-6 border border-gray-200 border-b-4 border-b-green-500 hover:shadow-md transition-all group"
        >
          <h3 class="text-base font-semibold text-gray-900 group-hover:text-slate-700">Pagos</h3>
          <p class="text-gray-500 text-sm mt-1">Registrar transferencias</p>
        </a>

        <a
          routerLink="/fixed-expenses"
          class="bg-white rounded-xl p-6 border border-gray-200 border-b-4 border-b-orange-500 hover:shadow-md transition-all group"
        >
          <h3 class="text-base font-semibold text-gray-900 group-hover:text-slate-700">Gastos Fijos</h3>
          <p class="text-gray-500 text-sm mt-1">Estimaciones mensuales</p>
        </a>

        <a
          routerLink="/settings"
          class="bg-white rounded-xl p-6 border border-gray-200 border-b-4 border-b-purple-500 hover:shadow-md transition-all group"
        >
          <h3 class="text-base font-semibold text-gray-900 group-hover:text-slate-700">Configuración</h3>
          <p class="text-gray-500 text-sm mt-1">Ajustar porcentajes</p>
        </a>
      </div>

      <!-- Gastos Fijos (Estimaciones) -->
      @if (fixedExpenses().length > 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-indigo-500 p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span class="text-indigo-500">📌</span> Gastos Fijos (Estimaciones)
            </h2>
            <a routerLink="/fixed-expenses" class="text-sm text-blue-600 hover:text-blue-700">
              Configurar →
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (fixed of fixedExpenses(); track fixed.id) {
              <div class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">{{ fixed.description }}</h3>
                    @if (fixed.category) {
                      <span class="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mt-1">
                        {{ fixed.category }}
                      </span>
                    }
                  </div>
                  <p class="text-xl font-bold text-gray-900">\${{ parseFloat(fixed.amount) | number:'1.0-0' }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Cuotas Activas -->
      @if (activeInstallments().length > 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span class="text-purple-500">💳</span> Cuotas Activas
          </h2>

          <div class="space-y-4">
            @for (expense of activeInstallments(); track expense.id) {
              <div class="border border-gray-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">{{ expense.description }}</h3>
                    <p class="text-sm text-gray-600 mt-1">
                      Paga las cuotas: {{ expense.installmentPayer }}
                    </p>
                    
                    <!-- Progress Bar -->
                    <div class="mt-3">
                      <div class="flex items-center justify-between text-xs mb-1">
                        <span class="text-gray-600">Progreso</span>
                        <span class="text-gray-600">{{ getPaidCount(expense.id) }} / {{ expense.totalInstallments }} cuotas</span>
                      </div>
                      <div class="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          class="bg-slate-700 h-2 rounded-full transition-all"
                          [style.width.%]="(getPaidCount(expense.id) / (expense.totalInstallments || 1)) * 100"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div class="text-right ml-4">
                    <p class="text-sm text-gray-600">Total</p>
                    <p class="text-2xl font-bold text-gray-900">\${{ parseFloat(expense.amount) | number:'1.0-0' }}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      \${{ (parseFloat(expense.amount) / (expense.totalInstallments || 1)) | number:'1.0-0' }}/mes
                    </p>
                    <a
                      [routerLink]="['/expenses', expense.id, 'installments']"
                      class="inline-block mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Ver detalle →
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Recent Expenses -->
      <div class="bg-white rounded-xl shadow-md p-6 border-t-4 border-t-slate-500">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Gastos Recientes</h2>
        
        @if (loading()) {
          <app-loader text="Cargando gastos..."></app-loader>
        } @else if (recentExpenses().length === 0) {
          <p class="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No hay gastos todavía</p>
        } @else {
          <div class="space-y-3">
            @for (expense of recentExpenses(); track expense.id) {
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ expense.description }}</p>
                  <p class="text-sm text-gray-600">
                    Pagó: {{ expense.paidBy }} • 
                    @if (expense.isInstallment) {
                      <span class="font-medium text-gray-900">{{ expense.totalInstallments }} cuotas</span>
                    } @else {
                      <span>{{ expense.splitType === 'default' ? 'Compartido' : expense.splitType === 'custom' ? 'Custom' : 'Solo quien pagó' }}</span>
                    }
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-xl font-bold text-gray-900">\${{ parseFloat(expense.amount) | number:'1.0-0' }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(expense.createdAt) }}</p>
                </div>
              </div>
            }
          </div>

          <a
            routerLink="/expenses"
            class="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos los gastos →
          </a>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);

  balance = signal<Balance | null>(null);
  recentExpenses = signal<Expense[]>([]);
  monthExpenses = signal<Expense[]>([]);
  fixedExpenses = signal<FixedExpense[]>([]);
  activeInstallments = signal<Expense[]>([]);
  installmentData = signal<Map<string, number>>(new Map());

  loading = signal(true);

  // Computed: Total de gastos fijos
  fixedExpensesTotal = computed(() => {
    return this.fixedExpenses().reduce((sum, f) => sum + parseFloat(f.amount), 0);
  });

  // Computed: Total de gastos reales del mes
  monthlyExpensesTotal = computed(() => {
    return this.monthExpenses().reduce((sum, e) => {
      if (e.isInstallment) return sum; // Las cuotas se cuentan aparte
      return sum + parseFloat(e.amount);
    }, 0);
  });

  // Computed: Total de cuotas del mes (cuota mensual de cada producto en cuotas)
  monthlyInstallmentsTotal = computed(() => {
    return this.activeInstallments().reduce((sum, e) => {
      const monthlyPayment = parseFloat(e.amount) / (e.totalInstallments || 1);
      return sum + monthlyPayment;
    }, 0);
  });

  // Computed: Estimado total del mes
  monthlyEstimate = computed(() => {
    return this.monthlyExpensesTotal() + this.fixedExpensesTotal() + this.monthlyInstallmentsTotal();
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    // Load balance
    this.api.getTotalBalance().subscribe({
      next: (bal) => this.balance.set(bal),
      error: (err) => console.error('Error loading balance:', err),
    });

    // Load fixed expenses (estimaciones)
    this.api.getFixedExpenses().subscribe({
      next: (fixed) => this.fixedExpenses.set(fixed),
      error: (err) => console.error('Error loading fixed expenses:', err),
    });

    // Load expenses
    this.api.getExpenses().subscribe({
      next: (expenses) => {
        // Gastos recientes (últimos 10)
        this.recentExpenses.set(expenses.slice(0, 10));

        // Gastos del mes actual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthExpenses = expenses.filter((e) => {
          const expDate = new Date(e.createdAt);
          return expDate >= startOfMonth && !e.isInstallment;
        });
        this.monthExpenses.set(monthExpenses);

        // Gastos en cuotas activos (que aún tienen cuotas pendientes)
        const withInstallments = expenses.filter((e) => e.isInstallment);
        this.activeInstallments.set(withInstallments);

        // Cargar info de cuotas para cada gasto en cuotas
        withInstallments.forEach((exp) => {
          this.api.getInstallments(exp.id).subscribe({
            next: (data) => {
              const map = new Map(this.installmentData());
              map.set(exp.id, data.paidCount);
              this.installmentData.set(map);
            },
          });
        });

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading expenses:', err);
        this.loading.set(false);
      },
    });
  }

  getPaidCount(expenseId: string): number {
    return this.installmentData().get(expenseId) || 0;
  }

  currentMonth(): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[new Date().getMonth()];
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }
}
