import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorHandleService} from "./error-handle.service";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "../../environments/environment";

export interface ColorModel {
  colorName: string;
  colorValue: string;
  id: string;
}

@Injectable({providedIn: "root"})
export class ColorService {

  constructor(private http: HttpClient, private errorService: ErrorHandleService) {}

  postNewColor(newColor: {name: string, value: string}): Observable<ColorModel>  {
    return this.http.post<ColorModel>(
      environment.apiUrl + 'color',
      newColor
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

  searchByNamePhrase(phrase: string): Observable<ColorModel[]> {
    return this.http.get<ColorModel[]>(
      environment.apiUrl + 'color/search/' + phrase.trim()
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
