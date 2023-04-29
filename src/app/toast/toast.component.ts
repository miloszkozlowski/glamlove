import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {ToastNotificationService} from "../service/toast-notification.service";

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html'
})
export class ToastComponent implements OnInit, OnDestroy {

  @ViewChild('toast', {read: ElementRef}) toastElement: ElementRef<HTMLElement>;

  toastsArray: {message: string, sticky: boolean, show: boolean, variant: string, countedAs: number}[] = [];
  toastSubject: Subscription;
  toastCounter: number = 0;

  constructor(private service: ToastNotificationService) {}


  ngOnInit() {
    this.toastSubject = this.service.toastSubject.subscribe((msg: {message: string, sticky?: boolean, variant?: string}) => {
      this.openToast(msg.message, !!msg.sticky, msg.variant ?? msg.variant ?? 'primary');
    });
  }

  ngOnDestroy() {
    this.toastSubject.unsubscribe();
  }

  openToast(message: string, sticky: boolean, variant: string) {
    this.toastsArray.unshift({message, sticky, show: true, countedAs: this.toastCounter, variant});
    const countedAs = this.toastCounter++;
    this.toastElement.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
    if(!sticky) {
      setTimeout(() => {
        const toast = this.toastsArray.find(t => t.countedAs === countedAs);
        if(!!toast) {
          toast.show = false;
        }
        if(this.toastsArray.length === 1) {
          this.toastsArray = [];
        }
      }, 5000);
    }
  }
}
