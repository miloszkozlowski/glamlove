import {AfterContentInit, Component} from '@angular/core';
import {ProductModel, ProductService} from "../service/product.service";

@Component({
  selector: 'app-panel-products',
  templateUrl: './panel-products.component.html'
})
export class PanelProductsComponent implements AfterContentInit {
  isLoading = true;
  currentPage: number = 0;
  canLoadMore: boolean = false;
  productsLoaded: ProductModel[] = [];
  editedProduct: ProductModel | undefined;
  editedImagesFor: ProductModel | undefined;
  constructor(private productService: ProductService) {
  }

  ngAfterContentInit() {
    this.productService.getProductPage(0).subscribe(page => {
      this.productsLoaded = page.content;
      this.isLoading = false;
      this.canLoadMore = !page.last;
    });
  }

  handleAddItems(id: string, event: Event) {

  }

  handleEditProduct(id: string) {
    this.editedProduct = this.productsLoaded.find(p => p.id === id);
    this.productService.editedProductSubject.next(this.editedProduct);
  }

  loadMoreProducts() {
    if(!this.canLoadMore) {
      return;
    }
    this.isLoading = true;
    this.productService.getProductPage(++this.currentPage).subscribe(page => {
      this.productsLoaded = [...this.productsLoaded, ...page.content];
      this.isLoading = false;
    });
  }

  updateEditedProduct(product: ProductModel) {
    const editedProduct = this.productsLoaded.find(p => p.id === product.id);
    if(!editedProduct) {
      return;
    }
    editedProduct.name = product.name;
    editedProduct.description = product.description;
    editedProduct.category = product.category;
  }

  handleImages(id: string, event: Event) {
    event.stopPropagation();
    this.editedImagesFor = this.productsLoaded.find(p => p.id === id);
    this.productService.editedProductSubject.next(this.editedImagesFor);

  }
}
