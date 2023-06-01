import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpRequest} from "@angular/common/http";
import {catchError, Observable, Subject, throwError} from "rxjs";
import {ErrorHandleService} from "./error-handle.service";
import {environment} from "../../environments/environment";
import {GenericPageModel} from "../model/generic-page.model";
import {PictureMetadata} from "./picture-service";
import {ColorModel} from "./color.service";
import {SizeModel} from "./size.service";
import {ProductModel} from "../model/product.model";

export interface ProductItemModel {
  product: ProductModel;
  id: string;
  serialNumber: string;
  color?: ColorModel;
  isPromoted: boolean;
  status: string;
  size?: SizeModel;
  availableQuantity: number,
  price?: ProductPriceModel,
  lowestPriceLast30days?: ProductPriceModel,
  prices?: ProductPriceModel[],
  orderedQuantity?: number,
  soldQuantity?: number,
  inBasketQuantity?: number
}

export interface ProductPriceModel {
  id: string,
  basePrice: number,
  vatRate: number,
  currentDiscount: number
  grossBasePrice: number
  discountPrice: number
  grossDiscountPrice: number
}

@Injectable({providedIn: "root"})
export class ProductService {
  editedProductSubject: Subject<ProductModel | undefined> = new Subject();

  constructor(private http: HttpClient, private errorService: ErrorHandleService) {}

  postNewProduct(productNew: {id? : string, name: string, description: string, categoryId: string}): Observable<ProductModel> {
    return this.http.post<ProductModel>(
      environment.apiUrl + 'product',
      productNew
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  postNewItem(itemNew: {
    productId: string,
    serialNumber: string,
    colorId: string,
    sizeId: string,
    isPromoted: boolean,
    price: number,
    discountRate: number,
    quantity: number
  }): Observable<ProductItemModel> {
    return this.http.post<ProductItemModel>(
      environment.apiUrl + 'product/item',
      itemNew
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateProduct(id: string, editedProduct: {isPublished? : boolean, name: string, description: string, categoryId: string}): Observable<ProductModel> {
    return this.http.put<ProductModel>(
      environment.apiUrl + 'product/' + id,
      editedProduct
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addStock(id: string, addedAmount: number): Observable<ProductItemModel> {
    return this.http.patch<ProductItemModel>(
      environment.apiUrl + 'product/item/' + id + '/' + addedAmount,
      {}
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  hideItem(id: string): Observable<ProductItemModel> {
    return this.http.patch<ProductItemModel>(
      environment.apiUrl + 'product/item/' + id + '/deactivate',
      {}
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addNewPrice(productItemId: string, baseGrossPrice: number, vatRate: number, discountPercentage: number): Observable<ProductItemModel> {
    return this.http.post<ProductItemModel>(
      environment.apiUrl + 'product/item/price',
      {
        netPrice: baseGrossPrice/(100 + vatRate)*100,
        discountPercentage,
        productItemId
      }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  activateItem(id: string): Observable<ProductItemModel> {
    return this.http.patch<ProductItemModel>(
      environment.apiUrl + 'product/item/' + id + '/activate',
      {}
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  promoteItem(id: string): Observable<ProductItemModel> {
    return this.http.patch<ProductItemModel>(
      environment.apiUrl + 'product/item/' + id + '/promote',
      {}
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  stopPromoItem(id: string): Observable<ProductItemModel> {
    return this.http.patch<ProductItemModel>(
      environment.apiUrl + 'product/item/' + id + '/stop-promo',
      {}
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  removeItem(id: string): Observable<any> {
    return this.http.delete<ProductItemModel>(
      environment.apiUrl + 'product/item/' + id
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getProductPage(pageNo: number): Observable<GenericPageModel<ProductModel>> {
    const urlParams = 'product/page/all/' + pageNo;
      return this.http.get<GenericPageModel<ProductModel>>(
        environment.apiUrl + urlParams
      ).pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getProductsByCategory(pageNo: number, categoryId: string): Observable<GenericPageModel<ProductModel>> {
    const urlParams = 'product/page/category/' + categoryId + '/' + pageNo;
      return this.http.get<GenericPageModel<ProductModel>>(
        environment.apiUrl + urlParams
      ).pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getProductSearchResults(pageNo: number, searchPhrase: string): Observable<GenericPageModel<ProductModel>> {
    const urlParams = 'product/page/all/' + pageNo + '/' + searchPhrase;
      return this.http.get<GenericPageModel<ProductModel>>(
        environment.apiUrl + urlParams
      ).pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getProductItems(productId: string): Observable<ProductItemModel[]> {
    const urlParams = 'product/' + productId + '/all-items';
      return this.http.get<ProductItemModel[]>(
        environment.apiUrl + urlParams
      ).pipe(
        catchError(this.handleError.bind(this))
      );
  }

  handleError(error: HttpErrorResponse) {
    if(!!error) {
      return throwError(() => new Error(this.errorService.handleErrorMessage(error)));
    }
    return throwError(() => new Error('Dziwne, tego błędu się nie spodziewaliśmy. Spróbuj jeszcze raz'));
  }

  pictureUpload(file: File, isMain: boolean, productId: string): Observable<any> {
    const data: FormData = new FormData();
    data.append('pictureData', file);
    data.append('productId', productId);
    data.append('isMain', isMain.toString());
    const request = new HttpRequest('POST', environment.apiUrl + 'product/picture-upload', data, {responseType: 'json'});
    return this.http.request(request).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  pictureMarkAsMain(picId: string): Observable<any> {
    return this.http.patch(
      environment.apiUrl + 'img/' + picId + '/main',
      {}
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  pictureRemoval(picId: string): Observable<any> {
    return this.http.delete(
      environment.apiUrl + "img/" + picId
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  pictureRotation(picId: string): Observable<PictureMetadata> {
    return this.http.patch<PictureMetadata>(
      environment.apiUrl + 'img/' + picId + '/rotate',
      {}
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
