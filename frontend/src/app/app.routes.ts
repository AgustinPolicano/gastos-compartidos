import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/pin.component').then((m) => m.PinComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'expenses',
    loadComponent: () => import('./features/expenses/expenses.component').then((m) => m.ExpensesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'expenses/:id/installments',
    loadComponent: () => import('./features/expenses/installments.component').then((m) => m.InstallmentsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'payments',
    loadComponent: () => import('./features/payments/payments.component').then((m) => m.PaymentsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'fixed-expenses',
    loadComponent: () => import('./features/fixed-expenses/fixed-expenses.component').then((m) => m.FixedExpensesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
