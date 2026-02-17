import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
    <aside
      class="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0"
      aria-label="Sidebar"
      [class.translate-x-0]="isOpen"
      [class.-translate-x-full]="!isOpen"
    >
      <div class="h-full px-3 py-4 overflow-y-auto bg-white flex flex-col justify-between">
        <div>
            <div class="flex items-center justify-between mb-5 px-2">
                 <a href="/" class="flex items-center">
                    <span class="self-center text-xl font-semibold whitespace-nowrap text-gray-900">Gastos Compartidos</span>
                </a>
                 <button 
                  type="button" 
                  class="md:hidden text-gray-500 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg text-sm p-1.5" 
                  (click)="closeSidebar()"
                 >
                    <span class="sr-only">Close sidebar</span>
                    <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                 </button>
            </div>
         
          <ul class="space-y-2 font-medium">
            <li>
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-gray-100 text-gray-900"
                class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                (click)="closeSidebar()"
              >
               <svg class="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z"/>
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z"/>
               </svg>
                <span class="ms-3">Dashboard</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/expenses"
                routerLinkActive="bg-gray-100 text-gray-900"
                class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                (click)="closeSidebar()"
              >
                  <svg class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                     <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z"/>
                  </svg>
                <span class="ms-3">Gastos</span>
              </a>
            </li>
             <li>
              <a
                routerLink="/fixed-expenses"
                routerLinkActive="bg-gray-100 text-gray-900"
                class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                (click)="closeSidebar()"
              >
                  <svg class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z"/>
                     <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.4Z"/>
                     <path d="M8.999 16.83 7.413 15.25l-.966.483a1.4 1.4 0 0 0 .708 2.502h3.192l-1.348-1.405Z"/>
                  </svg>
                <span class="ms-3">Gastos fijos</span>
              </a>
            </li>
             <li>
              <a
                routerLink="/payments"
                routerLinkActive="bg-gray-100 text-gray-900"
                class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                (click)="closeSidebar()"
              >
                  <svg class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M11.074 4 8.442.408A.95.95 0 0 0 7.014.254L2.926 4h8.148ZM9 13v-1a4 4 0 0 1 4-4h6V6a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h17a1 1 0 0 0 1-1v-2h-6a4 4 0 0 1-4-4Z"/>
                     <path d="M19 10h-6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Zm-4.5 3.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
                  </svg>
                <span class="ms-3">Pagos</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/settings"
                routerLinkActive="bg-gray-100 text-gray-900"
                class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                (click)="closeSidebar()"
              >
                 <svg class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 11.424V1a1 1 0 1 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 0-6.152ZM19.25 14.5A3.228 3.228 0 0 0 17 11.424V1a1 1 0 0 0-2 0v10.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-1.424a3.228 3.228 0 0 0 .25-3.076ZM11 5.424V1a1 1 0 1 0-2 0v4.424a3.228 3.228 0 0 0 0 6.152V19a1 1 0 1 0 2 0v-7.424a3.228 3.228 0 0 0 0-6.152Z"/>
                 </svg>
                <span class="ms-3">Configuración</span>
              </a>
            </li>
          </ul>
        </div>
        
        <div class="border-t pt-2">
             <button
              (click)="authService.logout()"
              class="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group w-full"
            >
              <svg class="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16">
                 <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"/>
              </svg>
              <span class="ms-3 whitespace-nowrap">Salir</span>
            </button>
        </div>
      </div>
    </aside>

    <!-- Overlay -->
    @if (isOpen) {
      <div 
        class="fixed inset-0 z-30 bg-gray-900/50 md:hidden"
        (click)="closeSidebar()"
      ></div>
    }
  `,
    styles: ``
})
export class SidebarComponent {
    authService = inject(AuthService);

    // Input to control state from parent if needed, but managing internally for now mostly
    // actually, let's accept an input or just toggle internal logic based on parent

    @Output() close = new EventEmitter<void>();

    isOpen = false;

    toggle() {
        this.isOpen = !this.isOpen;
    }

    closeSidebar() {
        this.isOpen = false;
        this.close.emit();
    }
}
