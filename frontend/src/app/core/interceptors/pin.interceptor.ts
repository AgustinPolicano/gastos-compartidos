import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const pinInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip adding PIN for auth endpoints
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const pin = authService.getStoredPin();

  if (pin) {
    req = req.clone({
      setHeaders: {
        'X-PIN': pin,
      },
    });
  }

  return next(req).pipe(
    catchError((error) => {
      // Si el PIN es inválido, redirigir a auth
      if (error.status === 401) {
        authService.clearPin();
        router.navigate(['/auth']);
      }
      return throwError(() => error);
    })
  );
};
