import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "../../environments/environment";
import {ErrorHandleService} from "./error-handle.service";
import {Injectable} from "@angular/core";

export interface CategoryModel {
  id: string;
  name: string;
  children?: CategoryModel[];
  parentId?: string;
}
@Injectable({providedIn: "root"})
export class CategoryService {

  constructor(private http: HttpClient, private errorService: ErrorHandleService) {}

  fetchMaster(): Observable<CategoryModel> {
    return this.http.get<CategoryModel>(
      environment.apiUrl + 'category/master'
    ).pipe(
      catchError(this.handleError.bind(this))
    )
  }

  fetchAll(): Observable<any> {
    return this.http.get<Map<string, CategoryModel[]>>(
      environment.apiUrl + 'category/all'
    ).pipe(
      catchError(this.handleError.bind(this))
    )
  }

  fetchById(id: string): Observable<CategoryModel> {
    return this.http.get<CategoryModel>(
      environment.apiUrl + 'category/' + id
    ).pipe(
      catchError(this.handleError.bind(this))
    )
  }

  createNewCategory(parentId: string, name: string): Observable<CategoryModel> {
    const newCategory = {name, parentId};
    return this.http.post<CategoryModel>(
      environment.apiUrl + 'category',
      newCategory
    ).pipe(
      catchError(this.handleError.bind(this))
    )
  }

  searchByNamePhrase(phrase: string): Observable<CategoryModel[]> {
    return this.http.get<CategoryModel[]>(
      environment.apiUrl + 'category/search/' + phrase.trim()
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
}
