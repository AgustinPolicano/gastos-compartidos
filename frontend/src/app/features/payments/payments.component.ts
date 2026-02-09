import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Payment, Settings } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Pagos entre Personas</h1>
        <button
          (click)="showForm.set(true)"
          class="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow"
        >
          Registrar Pago
        </button>
      </div>

      <!-- Form Modal -->
      @if (showForm()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" (click)="closeForm()">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full" (click)="$event.stopPropagation()">
            <div class="p-6">
              <h2 class="text-2xl font-bold mb-6">Registrar Pago/Transferencia</h2>

              <form (ngSubmit)="savePayment()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Quién pagó</label>
                  <select
                    [(ngModel)]="form.fromPerson"
                    name="fromPerson"
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

                <div class="text-center text-2xl text-gray-400">
                  ↓
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">A quién le pagó</label>
                  <select
                    [(ngModel)]="form.toPerson"
                    name="toPerson"
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
                  <label class="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
                  <input
                    type="text"
                    [(ngModel)]="form.description"
                    name="description"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                    placeholder="Ej: Transferencia Mercado Pago"
                  />
                </div>

                @if (error()) {
                  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {{ error() }}
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
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- Payments List -->
      <div class="bg-white rounded-xl shadow-md border-t-4 border-t-green-600">
        @if (loading()) {
          <app-loader text="Cargando pagos..."></app-loader>
        } @else if (payments().length === 0) {
          <div class="text-center py-16 bg-gray-50 rounded-b-xl">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-400 mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <p class="text-gray-500 text-lg font-medium mb-1">No hay pagos registrados</p>
            <p class="text-sm text-gray-400">Los pagos entre personas se usan para saldar deudas</p>
          </div>
        } @else {
          <div class="divide-y">
            @for (payment of payments(); track payment.id) {
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <div>
                        <p class="text-lg font-semibold text-gray-900">
                          {{ payment.fromPerson }} → {{ payment.toPerson }}
                        </p>
                        @if (payment.description) {
                          <p class="text-sm text-gray-600">{{ payment.description }}</p>
                        }
                        <p class="text-xs text-gray-500 mt-1">{{ formatDate(payment.createdAt) }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="text-right ml-4">
                    <p class="text-2xl font-bold text-gray-900 mb-2">\${{ parseFloat(payment.amount) | number:'1.0-0' }}</p>
                    <button
                      (click)="deletePayment(payment.id)"
                      class="text-xs font-medium text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
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
export class PaymentsComponent implements OnInit {
  private readonly api = inject(ApiService);

  payments = signal<Payment[]>([]);
  settings = signal<Settings | null>(null);
  loading = signal(true);
  showForm = signal(false);
  error = signal('');

  form = {
    fromPerson: '',
    toPerson: '',
    amount: 0,
    description: '',
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

    this.api.getPayments().subscribe({
      next: (payments) => {
        this.payments.set(payments);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading payments:', err);
        this.loading.set(false);
      },
    });
  }

  savePayment() {
    this.error.set('');

    if (this.form.fromPerson === this.form.toPerson) {
      this.error.set('No puede registrar un pago a la misma persona');
      return;
    }

    const data = {
      ...this.form,
      amount: this.form.amount.toString(),
    };

    this.api.createPayment(data).subscribe({
      next: () => {
        this.loadData();
        this.closeForm();
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error al guardar el pago');
      },
    });
  }

  deletePayment(id: string) {
    if (!confirm('¿Eliminar este pago?')) return;

    this.api.deletePayment(id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error deleting payment:', err),
    });
  }

  closeForm() {
    this.showForm.set(false);
    this.error.set('');
    this.form = {
      fromPerson: '',
      toPerson: '',
      amount: 0,
      description: '',
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
