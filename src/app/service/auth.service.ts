import {Injectable} from "@angular/core";
import {JwtHelperService} from "@auth0/angular-jwt";
import {UserAuthDataModel} from "../model/user-auth-data.model";
import {UserModel} from "../model/user.model";
import {BehaviorSubject} from "rxjs";

@Injectable({providedIn: "root"})
export class AuthService {
  authenticatedUserSubject: BehaviorSubject<UserModel> = new BehaviorSubject<UserModel>(UserModel.getGuest());
  private _isAuthenticated: boolean;
  private jwtService: JwtHelperService;
  constructor() {
    this.jwtService = new JwtHelperService(this.authenticatedUserSubject.getValue().jwtToken);
  }

  storeUserData(user: UserModel) {
    this.authenticatedUserSubject.next(user);
    this._isAuthenticated = true;
  }

  logout() {
    localStorage.removeItem('userData');
    this._isAuthenticated = false;
    this.authenticatedUserSubject.next(UserModel.getGuest());
    console.warn('Logged out');
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
    const decodedToken = this.jwtService.decodeToken(this.authenticatedUserSubject.getValue().jwtToken);
    if(!decodedToken.roles) {
      return false;
    }
    return decodedToken.roles.includes('ADMIN') || decodedToken.roles.includes('STAFF');
  }
}
