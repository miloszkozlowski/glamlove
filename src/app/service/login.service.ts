import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {UserAuthDataModel} from "../model/user-auth-data.model";
import {environment} from "../../environments/environment";
import {catchError, Observable, Subject, throwError} from "rxjs";
import {ToastNotificationService} from "./toast-notification.service";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {UserModel} from "../model/user.model";

@Injectable({providedIn: "root"})
export class LoginService {
  loginStatusSubject: Subject<boolean> = new Subject();
  urlToRedirect: string;

  constructor(
    private http: HttpClient,
    private toastService: ToastNotificationService,
    private router: Router,
    private authService: AuthService
  ) {
  }

  public postLoginRequest(loginData: { email: string, password: string }) {
    this.http.post<UserAuthDataModel>(
      environment.apiUrl + 'auth/login',
      loginData
    )
      .pipe(catchError(err => this.handleHttpError(err)))
      .subscribe((response: UserAuthDataModel) => this.handleSuccessfulLogin(response));
  }

  handleHttpError(error: any): Observable<UserAuthDataModel> {
    console.warn(error);
    if (error.statusText === 'OK' && error.status === 401) {
      this.handleLoginFailed();
      this.toastService.showToast({message: 'Podane dane logowania niestety nie są poprawne. Spróbuj jeszcze raz.', variant: 'danger'});
    }
    return throwError(error);
  }

  handleLoginFailed() {
    this.loginStatusSubject.next(false);
  }

  handleSuccessfulLogin(userAuth: UserAuthDataModel) {
    this.loginStatusSubject.next(true);
    this.authService.storeUserData(new UserModel(userAuth));
    localStorage.setItem('userData', JSON.stringify(userAuth));
    this.router.navigate(['/admin']);
  }
}
