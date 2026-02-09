import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (authService.isAuthenticated() && !isAuthRoute()) {
      <!-- Navbar -->
      <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-8">
              <h1 class="text-xl font-bold text-gray-900">Gastos Compartidos</h1>
              
              <div class="hidden md:flex gap-4">
                <a
                  routerLink="/dashboard"
                  routerLinkActive="bg-blue-100 text-blue-700"
                  class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                </a>
                <a
                  routerLink="/expenses"
                  routerLinkActive="bg-blue-100 text-blue-700"
                  class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Gastos
                </a>
                   <a
                  routerLink="/expenses"
                  routerLinkActive="bg-blue-100 text-blue-700"
                  class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Gastos
                </a>
                <a
                  routerLink="/payments"
                  routerLinkActive="bg-blue-100 text-blue-700"
                  class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Pagos
                </a>
                <a
                  routerLink="/settings"
                  routerLinkActive="bg-blue-100 text-blue-700"
                  class="px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Configuración
                </a>
              </div>
            </div>

            <button
              (click)="authService.logout()"
              class="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
    }

    <!-- Main Content -->
    <main class="min-h-screen bg-gray-50">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isAuthRoute(): boolean {
    return this.router.url.includes('/auth');
  }
}
