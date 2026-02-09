import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { catchError, tap, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly PIN_KEY = 'app_pin';
  
  isAuthenticated = signal(false);

  constructor() {
    // Check if PIN exists in localStorage
    const pin = this.getStoredPin();
    if (pin) {
      this.isAuthenticated.set(true);
    }
  }

  getStoredPin(): string | null {
    return localStorage.getItem(this.PIN_KEY);
  }

  storePin(pin: string): void {
    localStorage.setItem(this.PIN_KEY, pin);
    this.isAuthenticated.set(true);
  }

  clearPin(): void {
    localStorage.removeItem(this.PIN_KEY);
    this.isAuthenticated.set(false);
  }

  logout(): void {
    this.clearPin();
    this.router.navigate(['/auth']);
  }

  verifyPin(pin: string) {
    return this.api.verifyPin(pin).pipe(
      tap(() => {
        this.storePin(pin);
      })
    );
  }

  setupPin(pin: string, person1Name?: string, person2Name?: string) {
    return this.api.setupPin(pin, person1Name, person2Name).pipe(
      tap(() => {
        this.storePin(pin);
      })
    );
  }

  checkAuthStatus() {
    return this.api.checkAuthStatus();
  }
}
