import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ServiceService } from '../services/service.service';


export const redirectGuard: CanActivateFn = (route, state) => {
  const webService = inject(ServiceService);
  const router = inject(Router);

  return webService.getRedirectRoute().pipe(
    map(route => {
      const ruta = route[0].ruta_inicio_defecto;
      console.log('route ====>', route);
      console.log('ruta ====>', ruta);

      if (route && ruta) {
        router.navigate([ruta]);
        return false;
      }
      return true;
    }),
    catchError((error) => {
      console.error('Error getting redirect route:', error);
      // Manejar error si es necesario
      return of(true);
    })
  );
};