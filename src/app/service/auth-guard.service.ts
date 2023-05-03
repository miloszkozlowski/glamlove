import {inject} from "@angular/core";
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from "@angular/router";
import {AuthService} from "./auth.service";
import {LoginService} from "./login.service";

export const authGuard = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const loginService = inject(LoginService);
  if(!authService.isAuthenticated) {
    loginService.urlToRedirect = state.url;
    return router.navigate(['/login']);
  }
  return true;
}
