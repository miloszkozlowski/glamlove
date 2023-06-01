import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorHandleService} from "./error-handle.service";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "../../environments/environment";
import {GenericPageModel} from "../model/generic-page.model";
import {ProductModel} from "../model/product.model";


@Injectable({providedIn: "root"})
export class OfferService {

  private loadedProducts: Map<string, ProductModel> = new Map();

  constructor(private http: HttpClient, private errorService: ErrorHandleService) {}

  handleError(error: HttpErrorResponse) {
    if(!!error) {
      return throwError(() => new Error(this.errorService.handleErrorMessage(error)));
    }
    return throwError(() => new Error('Dziwne, tego błędu się nie spodziewaliśmy. Spróbuj jeszcze raz'));
  }

  getOfferPageByCategory(categoryId: string, pageNo: number): Observable<GenericPageModel<ProductModel>> {
    console.log('will fecz', pageNo);
    const urlParams = 'offer/category/' + categoryId + '/' + pageNo;
    console.log('req', environment.apiUrl + urlParams);
    return this.http.get<GenericPageModel<ProductModel>>(
      environment.apiUrl + urlParams
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  pushLoadedProducts(products: ProductModel[]) {
    products.forEach(p => this.loadedProducts.set(p.id, p));
  }

  getProductByRoute(routeName: string): ProductModel | undefined {
    console.log(this.loadedProducts);
    console.log(Array.from(this.loadedProducts.values()));
    console.log(Array.from(this.loadedProducts));
    return Array.from(this.loadedProducts.values()).find(p => p.routeName === routeName);
  }

  fetchProductById(id: string): Observable<ProductModel> {
    const urlParams = 'offer/' + id;
    return this.http.get<ProductModel>(
      environment.apiUrl + urlParams
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
