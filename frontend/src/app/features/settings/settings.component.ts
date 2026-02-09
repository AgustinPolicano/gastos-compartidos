import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Settings } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Configuración</h1>

      @if (loading()) {
        <p class="text-gray-500 text-center py-12">Cargando...</p>
      } @else {
        <div class="space-y-6">
          <!-- Nombres -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Personas</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Persona 1</label>
                <input
                  type="text"
                  [(ngModel)]="form.person1Name"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Persona 2</label>
                <input
                  type="text"
                  [(ngModel)]="form.person2Name"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <!-- Slider de Porcentajes -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">División de Gastos</h2>
            
            <div class="mb-6">
              <p class="text-sm text-gray-600 mb-4">
                Arrastrá el slider para ajustar cómo se dividen los gastos por defecto
              </p>

              <!-- Slider -->
              <div class="relative pt-1">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-lg font-semibold text-slate-900">{{ form.person1Name }}</span>
                  <span class="text-lg font-semibold text-slate-900">{{ form.person2Name }}</span>
                </div>

                <input
                  type="range"
                  [(ngModel)]="form.person1Percentage"
                  (ngModelChange)="onSliderChange()"
                  min="0"
                  max="100"
                  class="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style="
                    background: linear-gradient(to right, 
                      #0f172a 0%, 
                      #0f172a {{ form.person1Percentage }}%, 
                      #e2e8f0 {{ form.person1Percentage }}%, 
                      #e2e8f0 100%);
                  "
                />

                <div class="flex items-center justify-between mt-4">
                  <div class="text-center">
                    <div class="text-4xl font-bold text-slate-900">{{ form.person1Percentage }}%</div>
                    <div class="text-sm text-gray-600 mt-1">{{ form.person1Name }} paga</div>
                  </div>
                  <div class="text-2xl text-gray-300">|</div>
                  <div class="text-center">
                    <div class="text-4xl font-bold text-slate-900">{{ person2Percentage() }}%</div>
                    <div class="text-sm text-gray-600 mt-1">{{ form.person2Name }} paga</div>
                  </div>
                </div>
              </div>

              <!-- Ejemplo -->
              <div class="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p class="text-sm font-medium text-gray-700 mb-2">Ejemplo:</p>
                <p class="text-sm text-gray-600">
                  Si un gasto es de <span class="font-semibold">$10.000</span>:
                </p>
                <ul class="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• {{ form.person1Name }} paga: <span class="font-semibold">\${{ (10000 * form.person1Percentage / 100).toFixed(2) }}</span></li>
                  <li>• {{ form.person2Name }} paga: <span class="font-semibold">\${{ (10000 * person2Percentage() / 100).toFixed(2) }}</span></li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Cambiar PIN -->
          <div class="bg-white rounded-xl shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Seguridad</h2>
            
            <div class="space-y-4">
              <div>
                <label class="flex items-center mb-2">
                  <input
                    type="checkbox"
                    [(ngModel)]="changingPin"
                    class="mr-2 h-5 w-5"
                  />
                  <span class="text-sm font-medium text-gray-700">Cambiar PIN</span>
                </label>
              </div>

              @if (changingPin) {
                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <input
                    type="password"
                    [(ngModel)]="form.newPin"
                    placeholder="Nuevo PIN (4-6 dígitos)"
                    minlength="4"
                    maxlength="6"
                    pattern="[0-9]*"
                    class="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                  <p class="text-xs text-yellow-700 mt-2">
                    Asegurate de recordar el nuevo PIN
                  </p>
                </div>
              }

              <button
                (click)="authService.logout()"
                class="w-full bg-white border border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <!-- Save Button -->
          @if (success()) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Configuración guardada correctamente
            </div>
          }

          @if (error()) {
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {{ error() }}
            </div>
          }

          <button
            (click)="save()"
            [disabled]="saving()"
            class="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-medium text-lg transition-all shadow-sm hover:shadow"
          >
            {{ saving() ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      }
    </div>

    <style>
      /* Custom slider styling */
      input[type="range"].slider::-webkit-slider-thumb {
        appearance: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        border: 3px solid #0f172a;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      input[type="range"].slider::-moz-range-thumb {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        border: 3px solid #0f172a;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    </style>
  `,
})
export class SettingsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly authService = inject(AuthService);

  loading = signal(true);
  saving = signal(false);
  success = signal(false);
  error = signal('');
  changingPin = false;

  form = {
    person1Name: '',
    person2Name: '',
    person1Percentage: 50,
    newPin: '',
  };

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading.set(true);
    this.api.getSettings().subscribe({
      next: (settings) => {
        this.form.person1Name = settings.person1Name;
        this.form.person2Name = settings.person2Name;
        this.form.person1Percentage = settings.person1Percentage;
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading settings:', err);
        this.loading.set(false);
      },
    });
  }

  person2Percentage(): number {
    return 100 - this.form.person1Percentage;
  }

  onSliderChange() {
    // Ensure it stays between 0-100
    if (this.form.person1Percentage < 0) this.form.person1Percentage = 0;
    if (this.form.person1Percentage > 100) this.form.person1Percentage = 100;
  }

  save() {
    this.saving.set(true);
    this.success.set(false);
    this.error.set('');

    const data: any = {
      person1Name: this.form.person1Name,
      person2Name: this.form.person2Name,
      person1Percentage: this.form.person1Percentage,
    };

    if (this.changingPin && this.form.newPin) {
      if (this.form.newPin.length < 4 || this.form.newPin.length > 6) {
        this.error.set('El PIN debe tener entre 4 y 6 dígitos');
        this.saving.set(false);
        return;
      }
      data.newPin = this.form.newPin;
    }

    this.api.updateSettings(data).subscribe({
      next: () => {
        this.success.set(true);
        this.saving.set(false);
        this.changingPin = false;
        this.form.newPin = '';

        // Si cambió el PIN, actualizar en localStorage
        if (data.newPin) {
          this.authService.storePin(data.newPin);
        }

        // Hide success message after 3 seconds
        setTimeout(() => this.success.set(false), 3000);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Error al guardar');
        this.saving.set(false);
      },
    });
  }
}
