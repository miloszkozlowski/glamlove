import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../service/auth.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-bottom-section',
  templateUrl: './bottom-section.component.html'
})
export class BottomSectionComponent implements OnInit, OnDestroy {

  userSub: Subscription;
  isAuth: boolean;

  constructor(private authService: AuthService) {}

  ngOnDestroy() {
    if(!this.userSub) {
      return;
    }
    this.userSub.unsubscribe();
  }

  ngOnInit() {
    this.userSub = this.authService.authenticatedUserSubject.subscribe(user => {
      this.isAuth = user.isAuthenticated;
    });
    this.isAuth = this.authService.authenticatedUserSubject.getValue().isAuthenticated;
  }

  handleLogout() {
    this.authService.logout();
  }
}
