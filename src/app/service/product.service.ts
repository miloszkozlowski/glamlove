import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse, HttpRequest} from "@angular/common/http";
import {catchError, Observable, Subject, throwError} from "rxjs";
import {ErrorHandleService} from "./error-handle.service";
import {environment} from "../../environments/environment";
import {GenericPageModel} from "../model/generic-page.model";
import {CategoryModel} from "./category.service";
import {PictureMetadata} from "./picture-service";

export interface ProductModel {
  id: string;
  name: string;
  description: string;
  isPublished: boolean;
  status: string;
  category: CategoryModel;
  mainPicture?: PictureMetadata;
  allPictures?: PictureMetadata[];

}

@Injectable({providedIn: "root"})
export class ProductService {
  editedProductSubject: Subject<ProductModel | undefined> = new Subject();

  constructor(private http: HttpClient, private errorService: ErrorHandleService) {}

  postNewProduct(productNew: {id? : string, name: string, description: string, categoryId: string}): Observable<{name: string, description: string, categoryId: string}>  {
    return this.http.post<{name: string, description: string, categoryId: string}>(
      environment.apiUrl + 'product',
      productNew
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateProduct(id: string, editedProduct: {isPublished? : boolean, name: string, description: string, categoryId: string}): Observable<ProductModel>  {
    return this.http.put<ProductModel>(
      environment.apiUrl + 'product/' + id,
      editedProduct
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getProductPage(pageNo: number, searchPhrase?: string): Observable<GenericPageModel<ProductModel>> {
    const urlParams = 'product/page/all/' + pageNo + (searchPhrase ? ('/' + searchPhrase) : '');
      return this.http.get<GenericPageModel<ProductModel>>(
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
}
