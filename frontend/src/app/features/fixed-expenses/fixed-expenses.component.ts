import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, FixedExpense } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoaderComponent],
  template: `
    <div class="max-w-5xl mx-auto p-6">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gastos Fijos</h1>
          <p class="text-gray-600 mt-2">Estimaciones mensuales de gastos recurrentes</p>
        </div>
        <button
          (click)="showForm.set(true)"
          class="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow"
        >
          Nuevo Gasto Fijo
        </button>
      </div>

      <!-- Info Card -->
      <!-- Info Card -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p class="text-sm text-blue-800">
          <strong>¿Cómo funciona?</strong> Los gastos fijos son <strong>estimaciones</strong> de tus gastos mensuales recurrentes (alquiler, expensas, servicios). Se suman al total estimado del mes en el Dashboard.
        </p>
      </div>

      <!-- Form Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div class="p-6">
              <h2 class="text-2xl font-bold mb-6">{{ editingId() ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo' }}</h2>

              <form (ngSubmit)="saveFixed()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                  <input
                    type="text"
                    [(ngModel)]="form.description"
                    name="description"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="Ej: Alquiler, Expensas, Luz, Gas, Internet"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Monto estimado *</label>
                  <input
                    type="number"
                    [(ngModel)]="form.amount"
                    name="amount"
                    required
                    step="0.01"
                    min="0"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Este monto es solo una estimación para calcular tu presupuesto mensual
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Categoría (opcional)</label>
                  <input
                    type="text"
                    [(ngModel)]="form.category"
                    name="category"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                    placeholder="Ej: Vivienda, Servicios, Transporte"
                  />
                </div>

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
                    class="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow"
                  >
                    {{ editingId() ? 'Actualizar' : 'Guardar' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Total Card -->
      <!-- Total Card -->
      @if (fixedExpenses().length > 0) {
        <div class="bg-white rounded-xl shadow-sm border border-orange-200 p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">Total Estimado Mensual</p>
              <p class="text-3xl font-bold mt-1 text-gray-900">\${{ totalFixed() | number:'1.0-0' }}</p>
            </div>
          </div>
        </div>
      }

      <!-- List -->
      <div class="bg-white rounded-xl shadow-md border-t-4 border-t-orange-600">
        @if (loading()) {
          <app-loader text="Cargando gastos fijos..."></app-loader>
        } @else if (fixedExpenses().length === 0) {
          <div class="text-center py-12">
            <p class="text-gray-500 mb-2">No hay gastos fijos configurados</p>
            <p class="text-sm text-gray-400 mb-4">Agregá gastos recurrentes como alquiler, expensas o servicios</p>
            <button
              (click)="showForm.set(true)"
              class="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Agregar Primer Gasto Fijo
            </button>
          </div>
        } @else {
          <div class="divide-y">
            @for (fixed of fixedExpenses(); track fixed.id) {
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-lg font-semibold text-gray-900">{{ fixed.description }}</h3>
                      @if (fixed.category) {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-800">
                          {{ fixed.category }}
                        </span>
                      }
                    </div>
                    <p class="text-sm text-gray-500">Estimación mensual</p>
                  </div>

                  <div class="text-right ml-4">
                    <p class="text-2xl font-bold text-gray-900 mb-3">\${{ parseFloat(fixed.amount) | number:'1.0-0' }}</p>
                    <div class="flex gap-2">
                      <button
                        (click)="editFixed(fixed)"
                        class="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        (click)="deleteFixed(fixed.id)"
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

      <a
        routerLink="/dashboard"
        class="block text-center mt-6 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Volver al Dashboard
      </a>
    </div>
  `,
})
export class FixedExpensesComponent implements OnInit {
  private readonly api = inject(ApiService);

  fixedExpenses = signal<FixedExpense[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  form = {
    description: '',
    amount: 0,
    category: '',
  };

  ngOnInit() {
    this.loadData();
  }

  totalFixed(): number {
    return this.fixedExpenses().reduce((sum, f) => sum + parseFloat(f.amount), 0);
  }

  loadData() {
    this.loading.set(true);

    this.api.getFixedExpenses().subscribe({
      next: (fixed) => {
        this.fixedExpenses.set(fixed);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading fixed expenses:', err);
        this.loading.set(false);
      },
    });
  }

  editFixed(fixed: FixedExpense) {
    this.editingId.set(fixed.id);
    this.form = {
      description: fixed.description,
      amount: parseFloat(fixed.amount),
      category: fixed.category || '',
    };
    this.showForm.set(true);
  }

  saveFixed() {
    const data = {
      ...this.form,
      amount: this.form.amount.toString(),
    };

    if (this.editingId()) {
      this.api.updateFixedExpense(this.editingId()!, data).subscribe({
        next: () => {
          this.loadData();
          this.closeForm();
        },
        error: (err) => console.error('Error updating fixed expense:', err),
      });
    } else {
      this.api.createFixedExpense(data).subscribe({
        next: () => {
          this.loadData();
          this.closeForm();
        },
        error: (err) => console.error('Error creating fixed expense:', err),
      });
    }
  }

  deleteFixed(id: string) {
    if (!confirm('¿Eliminar este gasto fijo?')) return;

    this.api.deleteFixedExpense(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error deleting fixed expense:', err),
    });
  }

  closeForm() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.form = {
      description: '',
      amount: 0,
      category: '',
    };
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }
}
