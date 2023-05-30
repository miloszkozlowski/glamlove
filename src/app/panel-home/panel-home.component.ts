import {Component, OnDestroy, OnInit} from '@angular/core';
import {MarketingContentModel, MarketingService} from "../service/marketing.service";
import {ToastNotificationService} from "../service/toast-notification.service";
import {Subscription} from "rxjs";
import {ErrorHandleService} from "../service/error-handle.service";

@Component({
  selector: 'app-panel-home',
  templateUrl: './panel-home.component.html'
})
export class PanelHomeComponent implements OnInit, OnDestroy {

  currentTopBarMessage: MarketingContentModel | undefined;
  isLoading = true;
  isLoadingComponent = false;
  isEditingTopBarMsg = false;
  newTopBarMessage = '';
  stopLoadingSub: Subscription;

  constructor(private marketingService: MarketingService, private toasts: ToastNotificationService, private errorService: ErrorHandleService) {}

  ngOnInit() {
    this.stopLoadingSub = this.errorService.stopLoadingSubject.subscribe(() => this.isLoadingComponent = false);
    this.marketingService.getTopBarMsg().subscribe(msg => {
      if(msg.length > 0) {
        this.currentTopBarMessage = msg[0];
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    this.stopLoadingSub.unsubscribe();
  }

  saveNewTopBarMsg() {
    this.isLoadingComponent = true;
    this.marketingService.postTopBarMsg(this.newTopBarMessage)
      .subscribe(newMsg => {
        this.currentTopBarMessage = newMsg;
        this.toasts.showToast({message: 'Ustalono nowy komunikat na belce głównej. Aby zobaczyć efekt może być konieczne odświeżenie strony.'});
        this.isLoadingComponent = false;
        this.newTopBarMessage = '';
        this.isEditingTopBarMsg = false;
      });
  }

  handleDeactivateTopBarMessage() {
    this.isLoadingComponent = true;
    this.marketingService.deactivateTopBarMsg(this.currentTopBarMessage!.id)
      .subscribe(() => {
        this.currentTopBarMessage = undefined;
        this.isLoadingComponent = false;
        this.toasts.showToast({message: 'Komunikat został usunięty z belki głównej.'});
      })
  }
}
