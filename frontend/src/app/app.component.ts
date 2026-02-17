import { Component, inject, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    @if (authService.isAuthenticated() && !isAuthRoute()) {
      <app-sidebar #sidebar></app-sidebar>
      
      <!-- Mobile Header -->
       <div class="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <span class="text-xl font-bold text-gray-900">Gastos Compartidos</span>
        <button 
          (click)="sidebar.toggle()"
          class="p-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <span class="sr-only">Open sidebar</span>
          <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 5A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75zm0 5A.75.75 0 012.75 14h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"></path>
          </svg>
        </button>
      </div>

      <!-- Main Content -->
      <main class="min-h-screen bg-gray-50 md:ml-64 p-4">
        <router-outlet />
      </main>
    } @else {
      <!-- Main Content for non-auth or auth routes (login) -->
      <main class="min-h-screen bg-gray-50">
        <router-outlet />
      </main>
    }
  `,
})
export class AppComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('sidebar') sidebar!: SidebarComponent;

  constructor() {
    // Close sidebar on navigation on mobile
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.sidebar && window.innerWidth < 768) {
        this.sidebar.isOpen = false;
      }
    });
  }

  isAuthRoute(): boolean {
    return this.router.url.includes('/auth');
  }
}
