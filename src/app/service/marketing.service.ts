import {Injectable} from "@angular/core";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ErrorHandleService} from "./error-handle.service";
import {catchError, Observable, throwError} from "rxjs";
import {environment} from "../../environments/environment";

export interface MarketingContentModel {
  id: string,
  body: string,
  type: string,
  activeFrom: Date,
  activeTo: Date | undefined
  isActive: boolean
}

@Injectable({providedIn: "root"})
export class MarketingService {

  constructor(private http: HttpClient, private errorService: ErrorHandleService) {}

  getTopBarMsg(): Observable<MarketingContentModel[]> {
    const urlParams = 'marketing/active-by-type/TOP_BAR';
    return this.http.get<MarketingContentModel[]>(
      environment.apiUrl + urlParams
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  deactivateTopBarMsg(id: string): Observable<MarketingContentModel> {
    const urlParams = 'marketing/' + id + '/deactivate';
    return this.http.get<MarketingContentModel>(
      environment.apiUrl + urlParams
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  postTopBarMsg(body: string): Observable<MarketingContentModel> {
    const urlParams = 'marketing';
    return this.http.post<MarketingContentModel>(
      environment.apiUrl + urlParams,
      {
        body,
        type: 'TOP_BAR'
      }
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
