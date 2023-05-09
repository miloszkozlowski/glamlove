import {Injectable} from "@angular/core";
import {ToastNotificationService} from "./toast-notification.service";
import {HttpErrorResponse} from "@angular/common/http";
import {Subject} from "rxjs";

@Injectable({providedIn: "root"})
export class ErrorHandleService {

  errorMessageSubject = new Subject<string>();
  stopLoadingSubject = new Subject();

  constructor(private toastService: ToastNotificationService) {}

  handleErrorMessage(httpError: HttpErrorResponse): string {
    let message = 'Nieznany błąd. Spróbuj jeszcze raz.';
    if(httpError.error?.errorCode === 'BAD_REQUEST' && httpError.error.errorMsg === 'VALID_ERROR') {
      message = 'Niepoprawne dane.'
      if(httpError.error.errorDesc?.length > 0) {
        httpError.error.errorDesc.forEach((e: string) => message += ' ' + e + '.');
      }
      this.errorMessageSubject.next(message);
    } else {
      this.toastService.showToast({message, sticky: true, variant: 'danger'});
    }
    this.stopLoadingSubject.next({});
    return message;
  }
}
