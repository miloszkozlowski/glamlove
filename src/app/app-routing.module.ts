import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {NotFoundComponent} from "./not-found/not-found.component";
import {HomePageComponent} from "./home-page/home-page.component";
import {adminGuard, authGuard, staffGuard} from "./service/auth-guard.service";
import {AdminComponent} from "./admin/admin.component";
import {AdminUsersComponent} from "./admin-users/admin-users.component";
import {PanelComponent} from "./panel/panel.component";
import {PanelCategoriesComponent} from "./panel-categories/panel-categories.component";
import {PanelProductsComponent} from "./panel-products/panel-products.component";
import {PanelHomeComponent} from "./panel-home/panel-home.component";
import {OfferComponent} from "./offer/offer.component";
import {ProductComponent} from "./product/product.component";

const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'login', component: LoginComponent},
  {path: 'account', component: HomePageComponent, canActivate: [authGuard], children: [
      {path: 'orders', component: HomePageComponent}
  ]},
  {path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard], children: [
      {path: 'users', component: AdminUsersComponent},
    ]},
  {path: 'panel', component: PanelComponent, canActivate: [authGuard, staffGuard], children: [
      {path: '', component: PanelHomeComponent},
      {path: 'categories', component: PanelCategoriesComponent},
      {path: 'products', component: PanelProductsComponent},
    ]},
  {path: 'oferta/:catRouteName', component: OfferComponent},
  {path: 'produkt/:prodRouteName', component: ProductComponent},
  {path: '404', component: NotFoundComponent},
  {path: '**', redirectTo: '/404'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
