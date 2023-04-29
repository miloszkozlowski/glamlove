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

  storeUserData(userData: UserAuthDataModel) {
    this.authenticatedUserSubject.next(new UserModel(userData));
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
    this.storeUserData(userAuth);
    console.warn('Auto logged in');

  }

  get isAuthenticated() {
    return this._isAuthenticated;
  }
}
