import {UserAuthDataModel} from "./user-auth-data.model";

const GUEST_EMAIL: string = 'guest@glamlove.pl';
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

  get jwtToken() {
    if(this.expirationOn > new Date()) {
      return this._jwtToken;
    }
    return undefined;
  }

  get isAuthenticated() {
    return !!this.jwtToken;
  }

  get isGuest() {
    return this.email === GUEST_EMAIL;
  }
}
