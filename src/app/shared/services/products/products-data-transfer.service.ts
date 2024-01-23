import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, take } from 'rxjs';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';

@Injectable({
  providedIn: 'root'
})
export class ProductsDataTransferService {
  public productsDataEmitter$ = new BehaviorSubject<Array<GetAllProductsResponse> | null>(null)
  public productsData: Array<GetAllProductsResponse> = [];

  setProductsData(products: Array<GetAllProductsResponse>): void {
    if (products) {
      this.productsDataEmitter$.next(products);
      this.getProductsData();
    }
  }

  getProductsData() {
    this.productsDataEmitter$.pipe(take(1), map((data) => data?.filter((product) => product.amount > 0)))
      .subscribe({
        next: (response) => {
          if (response) {
            this.productsData = response;
          }
        }
      });

    return this.productsData;
  }
}
