import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { from, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ServiceService } from '../services/service.service';


export const guardsGuard: CanActivateFn = (route, state) => {
  const webService = inject(ServiceService);
  const router = inject(Router);

  return from(webService.getConfiguracion()).pipe(
    switchMap(async (resconfig: any) => {
      try {
        const reslogin = await webService.isAuthenticatedClient(resconfig[0].loginStorage);
        
        if (reslogin.rta === true) {
          return true;
        } else {
          router.navigate(['']);
          return false;
        }
      } catch (error) {
        console.error('Error in authentication check:', error);
        router.navigate(['']);
        return false;
      }
    }),
    catchError(() => {
      console.error('Error getting configuration');
      router.navigate(['']);
      return of(false);
    })
  );
};