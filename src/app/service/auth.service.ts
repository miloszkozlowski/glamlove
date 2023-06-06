import {Injectable} from "@angular/core";
import {JwtHelperService} from "@auth0/angular-jwt";
import {UserAuthDataModel} from "../model/user-auth-data.model";
import {UserModel} from "../model/user.model";
import {BehaviorSubject} from "rxjs";
import {Router} from "@angular/router";
import {ToastNotificationService} from "./toast-notification.service";

@Injectable({providedIn: "root"})
export class AuthService {
  authenticatedUserSubject: BehaviorSubject<UserModel> = new BehaviorSubject<UserModel>(UserModel.getGuest());
  private _isAuthenticated: boolean;
  private jwtService: JwtHelperService;
  private logoutTimer: any;
  constructor(private router: Router, private toast: ToastNotificationService) {
    this.jwtService = new JwtHelperService(this.authenticatedUserSubject.getValue().jwtToken)
  }

  storeUserData(user: UserModel) {
    this.authenticatedUserSubject.next(user);
    this._isAuthenticated = true;
    if(this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, user.msLeftBeforeExpiration);
  }

  logout() {
    localStorage.removeItem('userData');
    this._isAuthenticated = false;
    this.authenticatedUserSubject.next(UserModel.getGuest());
    this.router.navigate(['/login']).then(() => {
      console.warn('Logged out');
      this.toast.showToast({message: 'Zostałeś wylogowany dla Twojego bezpieczeństwa.', sticky: true, variant: 'secondary'})
    });
  }

  autologin() {
    const userString = localStorage.getItem('userData');
    if(!userString) {
      return;
    }
    const userAuth: UserAuthDataModel = JSON.parse(userString);
    const user: UserModel = new UserModel(userAuth);
    if(!user.jwtToken) {
      console.warn('Expired token');
      this.logout();
      return;
    }
    this.storeUserData(user);
    console.warn('Auto logged in');

  }

  get barerToken() {
    return this.authenticatedUserSubject.getValue().jwtToken;
  }

  get isAuthenticated() {
    return this._isAuthenticated;
  }

  get isAdminRole() {
    const decodedToken = this.jwtService.decodeToken(this.authenticatedUserSubject.getValue().jwtToken);
    if(!decodedToken.roles) {
      return false;
    }
    return decodedToken.roles.includes('ADMIN');
  }

  get isStaffRole() {
    if(!this.authenticatedUserSubject.getValue().jwtToken) {
      return false;
    }
    const decodedToken = this.jwtService.decodeToken(this.authenticatedUserSubject.getValue().jwtToken);
    if(!decodedToken.roles) {
      return false;
    }
    return decodedToken.roles.includes('ADMIN') || decodedToken.roles.includes('STAFF');
  }
}
