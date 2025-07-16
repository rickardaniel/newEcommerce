import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../interface/product'

@Injectable({
  providedIn: 'root'
})
export class CarServiceService {

  private product = new BehaviorSubject<Product[] >([])

  get products$() {
    return this.product.asObservable();
  }

  productBehaviorSubject(order: any) {
    this.product.next(order)
  }
}
