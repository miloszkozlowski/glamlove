import {
  Component, ElementRef, EventEmitter,
  OnDestroy,
  OnInit, Output, ViewChild
} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {CategoryModel, CategoryService} from "../service/category.service";
import {ProductModel, ProductService} from "../service/product.service";

@Component({
  selector: 'app-panel-product-edit',
  templateUrl: './panel-product-edit.component.html'
})
export class PanelProductEditComponent implements OnInit, OnDestroy {
  editedProductSub: Subscription;
  isLoadingForm = false;
  currentMode = 'new';
  productForm: FormGroup
  errorMessage: string = '';
  successMessage: string = '';
  searchTimer: any;
  foundCategories: CategoryModel[] = [];
  searchSub: Subscription | any;
  selectedCategory: CategoryModel | undefined;
  editedProduct: ProductModel | undefined;
  @Output('edited') editedEmitter: EventEmitter<ProductModel> = new EventEmitter<ProductModel>();
  @ViewChild('closeModal') closeModalButton: ElementRef;

  constructor(private categoryService: CategoryService, private productService: ProductService) {
  }

  ngOnInit() {
    this.productForm = new FormGroup({
      'productName': new FormControl('', [Validators.required]),
      'productCategory': new FormControl('', [Validators.required]),
      'productDescription': new FormControl('', [Validators.required])
    });
    this.searchSub = this.productForm.controls['productCategory'].valueChanges
      .subscribe(val => this.handleSearch(val));
    this.productForm.reset({});
    this.editedProductSub = this.productService.editedProductSubject.subscribe(edited => {
      this.editedProduct = edited;
      this.selectedCategory = edited?.category;
      this.productForm.controls['productName'].setValue(edited?.name);
      this.productForm.controls['productCategory'].setValue(edited?.category.name);
      this.productForm.controls['productDescription'].setValue(edited?.description);
    });
  }

  ngOnDestroy() {
    this.searchSub.unsubscribe;
    this.editedProductSub.unsubscribe();
    this.closeModalButton.nativeElement.click();
  }

  handleSearch(phrase: string) {
    if (!!this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    if (!phrase || this.selectedCategory?.name === phrase) {
      return;
    }
    delete this.selectedCategory;
    this.searchTimer = setTimeout(() => {
      this.categoryService.searchByNamePhrase(phrase).subscribe((searchResults: CategoryModel[]) => {
        this.foundCategories = searchResults;
      });
    }, 400);
  }

  handleCategoryChoice(id: string, event: Event) {
    event.preventDefault();
    const cat: CategoryModel | undefined = this.foundCategories.find(c => c.id === id);
    this.selectedCategory = cat;
    this.productForm.controls['productCategory'].setValue(cat?.name);
    this.foundCategories = [];
  }

  handleClearAll() {
    if(!!this.editedProduct) {
      this.selectedCategory = undefined;
      this.editedProduct = undefined;
      this.productForm.reset();
    }
  }

  handleSave() {
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoadingForm = true;
    if(!this.editedProduct) {
      this.productService.postNewProduct({
        name: this.productForm.controls['productName'].value,
        description: this.productForm.controls['productDescription'].value,
        categoryId: !this.selectedCategory ? '' : this.selectedCategory.id
      })
        .subscribe(saved => {
          this.editedEmitter.emit(saved);
          this.isLoadingForm = false;
          this.closeModalButton.nativeElement.click();
          this.productForm.reset({'productCategory': this.selectedCategory?.name});
        });
    } else {
      this.productService.updateProduct(this.editedProduct.id, {
        name: this.productForm.controls['productName'].value,
        description: this.productForm.controls['productDescription'].value,
        categoryId: !this.selectedCategory ? '' : this.selectedCategory.id
      })
        .subscribe(saved => {
          this.editedEmitter.emit(saved);
          this.isLoadingForm = false;
          this.closeModalButton.nativeElement.click();
          this.productForm.reset({'productCategory': this.selectedCategory?.name});
        });
    }
  }
}
