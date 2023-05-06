import {Injectable} from "@angular/core";
import {BehaviorSubject, catchError, Observable, tap, throwError} from "rxjs";
import {UserModel, UserModelAdminMode} from "../model/user.model";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ErrorHandleService} from "./error-handle.service";

export interface UserWriteData {
  email: string,
  mobileNo: string,
  firstName: string,
  lastName: string,
  password: string,
  roleIds?: string[]
}

@Injectable({providedIn: "root"})
export class UserService {

  usersLoaded: UserModel[];
  usersLoadedSubject: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>([]);
  constructor(private http: HttpClient, private errorService: ErrorHandleService) {}
  registerUser({userdata}: { userdata: UserWriteData }): Observable<UserModelAdminMode> {
    return this.http.post<UserModelAdminMode>(
      environment.apiUrl + 'user',
      userdata
    )
      .pipe(catchError(this.handleError.bind(this)));
  }

  handleError(error: HttpErrorResponse) {
    if(!!error) {
      return throwError(() => new Error(this.errorService.handleErrorMessage(error)));
    }
    return throwError(() => new Error('Dziwne, tego błędu się nie spodziewaliśmy. Spróbuj jeszcze raz'));
  }

  addUsers(users: UserModel[]) {
    this.usersLoaded.push(...users);
    this.usersLoadedSubject.next(this.usersLoaded);
  }

  validateSmsCode(userId: string, smsCode: string) {
    return this.http.post<Boolean>(
      environment.apiUrl + 'user/verify',
      {userId, smsCode}
    )
      .pipe(catchError(this.handleError.bind(this)));
  }

}
