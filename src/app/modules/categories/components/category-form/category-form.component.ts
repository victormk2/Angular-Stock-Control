import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, take, takeUntil } from 'rxjs';
import { EditCategoryAction } from 'src/app/models/interfaces/categories/event/EditCategoryAction';
import { CategoryEvent } from 'src/app/models/interfaces/enums/categories/CategoryEvent';
import { CategoriesService } from 'src/app/services/categories/categories.service';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: []
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public addCategoryAction = CategoryEvent.ADD_CATEGORY_ACTION;
  public editCategoryAction = CategoryEvent.EDIT_CATEGORY_ACTION;

  public categoryAction!: { event: EditCategoryAction };
  public categoryForm = this.formBuilder.group({
    name: ['', Validators.required]
  });

  constructor(
    private ref: DynamicDialogConfig,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private categoriesService: CategoriesService
  ) { }

  ngOnInit(): void {
    this.categoryAction = this.ref.data;

    if (this.categoryAction?.event?.action === this.editCategoryAction && this.categoryAction?.event?.categoryName !== null || undefined) {
      this.setCategoryName(this.categoryAction?.event?.categoryName as string)
    }
  }

  handleSubmitCategoryAction(): void {
    var action = this.categoryAction?.event?.action

    if (action) {
      action == this.addCategoryAction ? this.handleSubmitAddCategory() : this.handleSubmitEditCategory()
    }

    return;
  }

  handleSubmitAddCategory(): void {
    if (this.categoryForm.value && this.categoryForm.valid) {
      const requestCreateCategory: { name: string } = {
        name: this.categoryForm.value.name as string
      }

      this.categoriesService.createNewCategory(requestCreateCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (r) => {
            if (r) {
              this.categoryForm.reset();
              this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Categoria criada com sucesso',
                life: 2500
              })
            }
          },
          error: (e) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao criar categoria',
              life: 2500
            })
          }
        })
    }
  }

  handleSubmitEditCategory(): void {
    if (this.categoryForm?.value && this.categoryForm?.valid && this.categoryAction?.event?.id) {
      const requestEditCategory: { name: string, category_id: string } = {
        name: this.categoryForm?.value?.name as string,
        category_id: this.categoryAction?.event?.id
      }

      this.categoriesService.editCategory(requestEditCategory)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.categoryForm.reset();
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria edidata com sucesso',
              life: 2500
            });
          },
          error: (e) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro na criação da categoria',
              life: 2500
            });
          }
        })
    }
  }

  setCategoryName(categoryName: string): void {
    if (categoryName) {
      this.categoryForm.setValue({
        name: categoryName
      })
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
