import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {catchError, Observable, throwError} from "rxjs";

@Injectable({providedIn: "root"})
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.barerToken;
    if(token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
      });
    }
    return next.handle(req).pipe(
      catchError((err) => {
        if (err.status === 401) {
          this.authService.logout();
          return throwError(() => new Error('Nastąpiło wylogowanie. Zaloguj się ponownie.'));
        } else if((err.status === 403 || err.status === 400) && !!err.error) {
          return throwError(() => err);
        }
        return throwError(() => new Error('Niespodziewany błąd: ' + err.status));
      })
    );
  }
}
