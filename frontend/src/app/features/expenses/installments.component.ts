import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-installments',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  template: `
    <div class="max-w-4xl mx-auto p-4 md:p-6">
      <a routerLink="/expenses" class="text-slate-600 hover:text-slate-900 mb-6 inline-flex items-center font-medium transition-colors">
        <span class="mr-2">←</span> Volver a gastos
      </a>

      @if (loading()) {
        <app-loader text="Cargando cuotas..."></app-loader>
      } @else {
        @if (data(); as d) {
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 border-l-4 border-l-slate-800">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ d.expense.description }}</h1>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-600">Monto Total</p>
              <p class="text-2xl font-bold text-gray-900">\${{ parseFloat(d.expense.amount) | number:'1.0-0' }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Cuota Mensual</p>
              <p class="text-2xl font-bold text-slate-900">
                \${{ (parseFloat(d.expense.amount) / d.totalInstallments) | number:'1.0-0' }}
              </p>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-gray-600">
            <div>
              <span class="font-medium">Paga las cuotas:</span> {{ d.expense.installmentPayer }}
            </div>
            <div>
              <span class="font-medium">División:</span> 
              {{ d.expense.splitType === 'default' ? 'Por defecto' : d.expense.splitType === 'custom' ? 'Custom' : 'Solo quien pagó' }}
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex items-center justify-between text-sm mb-2">
              <span class="font-medium text-gray-700">Progreso</span>
              <span class="text-gray-600">{{ d.paidCount }} / {{ d.totalInstallments }} cuotas pagadas</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div 
                class="bg-slate-900 h-3 rounded-full transition-all duration-500"
                [style.width.%]="(d.paidCount / d.totalInstallments) * 100"
              ></div>
            </div>
          </div>
        </div>

        <!-- Installments List -->
        <div class="bg-white rounded-xl shadow-md border-t-4 border-t-purple-600">
          <div class="p-4 md:p-6 border-b">
            <h2 class="text-xl font-semibold text-gray-900">Detalle de Cuotas</h2>
          </div>

          <div class="divide-y">
            @for (num of getInstallmentNumbers(d.totalInstallments); track num) {
              @let isPaid = isInstallmentPaid(num);
              <div class="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4 w-full sm:w-auto">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border shrink-0"
                       [class]="isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'">
                    {{ num }}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900">Cuota #{{ num }}</p>
                    <p class="text-sm text-gray-600">
                      \${{ (parseFloat(d.expense.amount) / d.totalInstallments) | number:'1.0-0' }}
                    </p>
                    @if (isPaid) {
                      @let payment = getPaidInstallment(num);
                      @if (payment) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 mt-1">
                          Pagada el {{ formatDate(payment.paidAt) }}
                        </span>
                      }
                    }
                  </div>
                </div>

                <div class="w-full sm:w-auto flex justify-end">
                  @if (isPaid) {
                    <button
                      (click)="unpayInstallment(num)"
                      class="text-xs font-medium text-red-600 hover:text-red-900 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Desmarcar
                    </button>
                  } @else {
                    <button
                      (click)="payInstallment(num)"
                      class="text-xs font-medium text-blue-600 hover:text-blue-900 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      Marcar pagada
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
        }
      }
    </div>
  `,
})
export class InstallmentsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  loading = signal(true);
  data = signal<any>(null);
  expenseId = '';

  ngOnInit() {
    this.expenseId = this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.api.getInstallments(this.expenseId).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading installments:', err);
        this.loading.set(false);
      },
    });
  }

  getInstallmentNumbers(total: number): number[] {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  isInstallmentPaid(num: number): boolean {
    const d = this.data();
    if (!d) return false;
    return d.paidInstallments.some((p: any) => p.installmentNumber === num);
  }

  getPaidInstallment(num: number): any {
    const d = this.data();
    if (!d) return null;
    return d.paidInstallments.find((p: any) => p.installmentNumber === num);
  }

  payInstallment(num: number) {
    this.api.payInstallment(this.expenseId, num).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error paying installment:', err),
    });
  }

  unpayInstallment(num: number) {
    if (!confirm('¿Desmarcar esta cuota como pagada?')) return;

    this.api.unpayInstallment(this.expenseId, num).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Error unpaying installment:', err),
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }
}
