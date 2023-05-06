import {UserAuthDataModel} from "./user-auth-data.model";

const GUEST_EMAIL: string = 'guest@glamlove.pl';
export interface UserModelAdminMode {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNo: string;
  status: string;
}
export class UserModel {

  public static getGuest(): UserModel {
    return new UserModel();
  }

  private readonly _jwtToken: string;
  private readonly expirationOn: Date;
  private readonly email: string;
  private roles: string[];
  refreshToken: string
  constructor(auth?: UserAuthDataModel) {
     if(!auth) {
       this.email = GUEST_EMAIL;
     } else {
       this._jwtToken = auth.jwt;
       this.email = auth.email;
       this.expirationOn = new Date(auth.expiresOn);
     }
  }

  get jwtToken(): string {
    if(this.expirationOn > new Date()) {
      return this._jwtToken;
    }
    return '';
  }

  get isAuthenticated() {
    return !!this.jwtToken;
  }

  get isGuest() {
    return this.email === GUEST_EMAIL;
  }
}
