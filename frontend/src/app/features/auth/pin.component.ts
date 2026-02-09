import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-pin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 class="text-3xl font-bold text-gray-800 mb-2 text-center">
          Gastos Compartidos
        </h1>
        <p class="text-gray-600 text-center mb-8">
          {{ isSetup() ? 'Configuración inicial' : 'Ingresá tu PIN' }}
        </p>

        @if (error()) {
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error() }}
          </div>
        }

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          @if (isSetup()) {
            <!-- Setup Mode -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Persona 1
              </label>
              <input
                type="text"
                [(ngModel)]="person1Name"
                name="person1Name"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Persona 2
              </label>
              <input
                type="text"
                [(ngModel)]="person2Name"
                name="person2Name"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre de tu pareja"
              />
            </div>
          }

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ isSetup() ? 'Creá tu PIN (4-6 dígitos)' : 'PIN de acceso' }}
            </label>
            <input
              type="password"
              [(ngModel)]="pin"
              name="pin"
              required
              minlength="4"
              maxlength="6"
              pattern="[0-9]*"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl tracking-widest text-center"
              placeholder="••••"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {{ loading() ? 'Cargando...' : (isSetup() ? 'Configurar' : 'Ingresar') }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class PinComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSetup = signal(false);
  loading = signal(false);
  error = signal('');

  pin = '';
  person1Name = '';
  person2Name = '';

  ngOnInit() {
    // Check if app is configured
    this.authService.checkAuthStatus().subscribe({
      next: (status) => {
        this.isSetup.set(!status.configured);
      },
      error: () => {
        this.error.set('Error al conectar con el servidor');
      },
    });
  }

  onSubmit() {
    this.error.set('');
    this.loading.set(true);

    if (this.isSetup()) {
      // Setup mode
      if (!this.person1Name || !this.person2Name) {
        this.error.set('Completá ambos nombres');
        this.loading.set(false);
        return;
      }

      this.authService.setupPin(this.pin, this.person1Name, this.person2Name).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error.set(err.error?.error || 'Error al configurar');
          this.loading.set(false);
        },
      });
    } else {
      // Verify mode
      this.authService.verifyPin(this.pin).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error.set(err.error?.error || 'PIN incorrecto');
          this.loading.set(false);
          this.pin = '';
        },
      });
    }
  }
}
