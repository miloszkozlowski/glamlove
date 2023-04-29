import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable({providedIn: "root"})
export class ToastNotificationService {
  toastSubject: Subject<{message: string, sticky?: boolean, variant?: string}> = new Subject();

  public showToast(msg: {message: string, sticky?: boolean, variant?: string}) {
    this.toastSubject.next(msg);
  }
}
