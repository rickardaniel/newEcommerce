// services/route-handler.service.ts
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { map, Observable } from 'rxjs';
import { RouteParams } from '../interface/products';

@Injectable({
  providedIn: 'root'
})
export class RouteHandlerService {
  constructor(private activatedRoute: ActivatedRoute) {}

  getRouteParams(): Observable<RouteParams | null> {
    return this.activatedRoute.params.pipe(
      map((params: Params) => {
        if (!params['value']) return null;
        
        return {
          type: params['type'] as RouteParams['type'],
          value: params['value'],
          value2: params['value2']
        };
      })
    );
  }

  getCurrentParams(): RouteParams | null {
    const params = this.activatedRoute.snapshot.params;
    if (!params['value']) return null;

    return {
      type: params['type'],
      value: params['value'],
      value2: params['value2']
    };
  }
}