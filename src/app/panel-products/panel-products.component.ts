import {AfterContentInit, Component, OnDestroy, OnInit} from '@angular/core';
import {ProductService} from "../service/product.service";
import {CategoryModel, CategoryService} from "../service/category.service";
import {forkJoin, Observable, Subscription} from "rxjs";
import {GenericPageModel} from "../model/generic-page.model";
import {FormControl, FormGroup} from "@angular/forms";
import {ProductModel} from "../model/product.model";

@Component({
  selector: 'app-panel-products',
  templateUrl: './panel-products.component.html'
})
export class PanelProductsComponent implements AfterContentInit, OnInit, OnDestroy {
  isLoading = true;
  currentPage: number = 0;
  canLoadMore: boolean = false;
  productsLoaded: ProductModel[] = [];
  editedProduct: ProductModel | undefined;
  editedImagesFor: ProductModel | undefined;
  categories: CategoryModel[] | undefined;
  searchPhrase = '';
  filterForm: FormGroup;
  categoryFilterSub: Subscription | any;
  selectedCategory: string | undefined;
  constructor(private productService: ProductService, private categoryService: CategoryService) {
  }

  ngOnInit() {
    this.filterForm = new FormGroup({
      'category': new FormControl('Wszystkie')
    });
    this.categoryFilterSub = this.filterForm.controls['category'].valueChanges
      .subscribe(selected => {
        if(selected === 'Wszystkie') {
          this.selectedCategory = undefined;
          this.currentPage = -1;
          this.loadMoreProducts();
        } else {
          this.handleCategoryFilter(selected);
        }
      });
  }

  ngOnDestroy() {
    this.categoryFilterSub.unsubscribe();
  }

  ngAfterContentInit() {
    forkJoin([
        this.productService.getProductPage(0),
        this.categoryService.fetchAll()
      ])
      .subscribe(results => {
      results.forEach((r, i) => {
        if(i === 0) {
          this.productsLoaded = (r as GenericPageModel<ProductModel>).content
          this.canLoadMore = (r as GenericPageModel<ProductModel>).last;
        } else if(i === 1) {
          this.categories = Object.keys(r).flatMap(id => r[id]).sort(function (a, b) {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          });
        }
        this.isLoading = false;
      })
    });
    this.productService.getProductPage(0).subscribe(page => {
      this.productsLoaded = page.content;
      this.canLoadMore = !page.last;
    });
  }

  handleEditProduct(id: string) {
    this.editedProduct = this.productsLoaded.find(p => p.id === id);
    this.productService.editedProductSubject.next(this.editedProduct);
  }

  performSearch() {
    this.isLoading = true;
    if(!this.searchPhrase) {
      this.productService.getProductPage(0).subscribe(page => {
        this.productsLoaded = page.content
        this.canLoadMore = page.last;
      });
    } else {
      this.productService.getProductSearchResults(0, this.searchPhrase).subscribe(page => {
        this.productsLoaded = page.content;
        this.canLoadMore = false;
        this.isLoading = false;
      });
    }
  }

  handleCategoryFilter(categoryId: string) {
    this.isLoading = true;
    this.selectedCategory = categoryId;
    this.productService.getProductsByCategory(0, categoryId).subscribe(page => {
      this.productsLoaded = page.content
      this.canLoadMore = page.last;
      this.isLoading = false;
    });
  }

  loadMoreProducts() {
    if(!this.canLoadMore) {
      return;
    }
    this.isLoading = true;
    let obs: Observable<GenericPageModel<ProductModel>>;
    if(!!this.selectedCategory) {
      obs = this.productService.getProductsByCategory(++this.currentPage, this.selectedCategory);
    } else {
      obs = this.productService.getProductPage(++this.currentPage);
    }
    obs.subscribe(page => {
      this.productsLoaded = [...this.productsLoaded, ...page.content];
      this.isLoading = false;
    });
  }

  updateEditedProduct(product: ProductModel) {
    const editedProduct = this.productsLoaded.find(p => p.id === product.id);
    if(!editedProduct) {
      this.productsLoaded = [product, ...this.productsLoaded];
      if(this.canLoadMore) {
        this.productsLoaded.pop();
      }
    } else {
      editedProduct.name = product.name;
      editedProduct.description = product.description;
      editedProduct.category = product.category;
      editedProduct.isPublished = product.isPublished;
    }
  }

  handleImages(id: string, event: Event) {
    event.stopPropagation();
    this.editedImagesFor = this.productsLoaded.find(p => p.id === id);
    this.productService.editedProductSubject.next(this.editedImagesFor);
  }

  handleShowWhs(id: string, event: Event) {
    event.stopPropagation();
    const productWhs = this.productsLoaded.find(p => p.id === id);
    this.productService.editedProductSubject.next(productWhs);
  }

  setPublished(published: boolean, prod: ProductModel) {
    this.productService.updateProduct(
      prod.id,
      {isPublished: published, name: prod.name, description: prod.description, categoryId: prod.category.id}
    ).subscribe((modified) => {
      this.updateEditedProduct(modified);
    });
  }
}
