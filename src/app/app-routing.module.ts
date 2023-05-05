import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {HomePageComponent} from "./home-page/home-page.component";
import {adminGuard, authGuard} from "./service/auth-guard.service";
import {AdminComponent} from "./admin/admin.component";
import {AdminUsersComponent} from "./admin-users/admin-users.component";

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'login', component: LoginComponent},
  {path: 'account', component: HomePageComponent, canActivate: [authGuard], children: [
      {path: 'orders', component: HomePageComponent}
  ]},
  {path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard], children: [
      {path: 'users', component: AdminUsersComponent},
    ]},
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
