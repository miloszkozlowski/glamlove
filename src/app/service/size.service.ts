import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorHandleService} from "./error-handle.service";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "../../environments/environment";

export interface SizeModel {
  sizeValue: string;
  id: string;
}

@Injectable({providedIn: "root"})
export class SizeService {

  constructor(private http: HttpClient, private errorService: ErrorHandleService) {}

  postNewSize(newSize: {name: string}): Observable<SizeModel>  {
    return this.http.post<SizeModel>(
      environment.apiUrl + 'size',
      newSize
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

  searchByNamePhrase(phrase: string): Observable<SizeModel[]> {
    return this.http.get<SizeModel[]>(
      environment.apiUrl + 'size/search/' + phrase.trim()
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
