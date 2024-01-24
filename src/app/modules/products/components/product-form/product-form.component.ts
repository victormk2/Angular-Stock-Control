import { SaleProductRequest } from './../../../../models/interfaces/products/request/SaleProductRequest';
import { ProductsDataTransferService } from './../../../../shared/services/products/products-data-transfer.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { CategoriesService } from './../../../../services/categories/categories.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/GetCategoriesResponse';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { ProductEvent } from 'src/app/models/interfaces/enums/products/ProductEvent';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: []
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public categoriesData: Array<GetCategoriesResponse> = [];
  public selectedCategory: Array<{ name: string, code: string }> = [];
  public productAction!: {
    event: EventAction;
    productsData: Array<GetAllProductsResponse>;
  };
  public productSelectedData!: GetAllProductsResponse;
  public productsData: Array<GetAllProductsResponse> = [];

  public addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  })

  public editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
  })

  public saleProductForm = this.formBuilder.group({
    amount: [0, Validators.required],
    product_id: ['', Validators.required]
  })

  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT;
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;

  public saleProductSelected!: GetAllProductsResponse;

  constructor(
    private categoriesService: CategoriesService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private productService: ProductsService,
    private ref: DynamicDialogConfig,
    private productsDtService: ProductsDataTransferService
  ) { }

  ngOnInit(): void {
    this.productAction = this.ref.data;
    if (this.productAction?.event?.action === this.editProductAction && this.productAction?.productsData) {
      this.getProductSelectedData(this.productAction?.event?.id as string)
    }

    if (this.productAction?.event?.action === this.saleProductAction) {
      this.getProductData()
    }

    this.getAllCategories();
  }

  getAllCategories() {
    this.categoriesService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.categoriesData = response;
          }
        }
      })
  }

  handleSubmitAddProduct(): void {
    if (this.addProductForm?.value && this.addProductForm?.valid) {
      var form = this.addProductForm.value;

      const requestCreateProduct: CreateProductRequest = {
        name: form.name as string,
        price: form.price as string,
        description: form.description as string,
        category_id: form.category_id as string,
        amount: form.amount as number,
      }

      this.productService.createProduct(requestCreateProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Produto criado com sucesso',
                life: 2500
              })
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro na criação do produto',
              life: 2500
            })
          }
        })
    }

    this.addProductForm.reset();
  }

  handleSubmitEditProduct(): void {
    if (this.editProductForm.value && this.editProductForm.valid && this.productAction.event.id) {
      var formValue = this.editProductForm.value;

      const requestEditProduct: EditProductRequest = {
        name: formValue.name as string,
        price: formValue.price as string,
        description: formValue.description as string,
        product_id: this.productAction?.event.id,
        amount: formValue.amount as number
      }

      this.productService.editProduct(requestEditProduct)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto editado com sucesso',
              life: 2500
            });
            this.editProductForm.reset();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao editar produto',
              life: 2500
            });
            this.editProductForm.reset();
          }
        })
    }
  }

  getProductSelectedData(productId: string): void {
    const allProducts = this.productAction?.productsData
    if (allProducts.length > 0) {
      const productFiltered = allProducts.filter((e) => e?.id === productId);
      if (productFiltered) {
        this.productSelectedData = productFiltered[0];

        this.editProductForm.setValue({
          name: this.productSelectedData?.name,
          price: this.productSelectedData?.price,
          description: this.productSelectedData?.description,
          amount: this.productSelectedData?.amount
        });
      }
    }
  }

  getProductData(): void {
    this.productService.getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productsData = response;
            this.productsData && this.productsDtService.setProductsData(this.productsData);
          }
        }
      })
  }

  handleSubmitSaleProduct(): void {
    if (this.saleProductForm.value && this.saleProductForm.valid) {
      const data: SaleProductRequest = {
        amount: this.saleProductForm.value?.amount as number,
        product_id: this.saleProductForm.value?.product_id as string
      }

      this.productService.saleProduct(data).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (r) => {
            if (r) {
              this.saleProductForm.reset();
              this.getProductData();
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Venda efetuada com sucesso',
                life: 2500
              });
              this.router.navigate(['/dashboard'])
            }
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro na ação de venda',
              life: 2500
            });
          }
        })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
