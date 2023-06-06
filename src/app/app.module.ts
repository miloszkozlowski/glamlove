import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { TopSectionComponent } from './top-section/top-section.component';
import { MainSectionComponent } from './main-section/main-section.component';
import { BottomSectionComponent } from './bottom-section/bottom-section.component';
import { LoginComponent } from './login/login.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HomePageComponent } from './home-page/home-page.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import { ToastComponent } from './toast/toast.component';
import {AutoFocusDirective} from "./service/auto-focus.directive";
import { AdminComponent } from './admin/admin.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminNewUserComponent } from './admin-new-user/admin-new-user.component';
import {TokenInterceptor} from "./service/token.interceptor";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import { AdminUserDetailComponent } from './admin-user-detail/admin-user-detail.component';
import { PanelComponent } from './panel/panel.component';
import { PanelCategoriesComponent } from './panel-categories/panel-categories.component';
import { PanelProductsComponent } from './panel-products/panel-products.component';
import { PanelProductEditComponent } from './panel-product-edit/panel-product-edit.component';
import {TextTruncatePipe} from "./service/text-truncate.pipe";
import { PanelProductsImagesComponent } from './panel-products-images/panel-products-images.component';
import { GlamImageComponent } from './glam-image/glam-image.component';
import { PanelProductWhsComponent } from './panel-product-whs/panel-product-whs.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatDividerModule} from "@angular/material/divider";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatButtonModule} from "@angular/material/button";
import { PanelHomeComponent } from './panel-home/panel-home.component';
import { OfferComponent } from './offer/offer.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import { ProductComponent } from './product/product.component';
import { OffcanvasMenuComponent } from './offcanvas-menu/offcanvas-menu.component';
import {IvyCarouselModule} from "angular-responsive-carousel";
import { PanelSizesColorsComponent } from './panel-sizes-colors/panel-sizes-colors.component';
import {CdkDrag, CdkDropList} from "@angular/cdk/drag-drop";


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    TopSectionComponent,
    MainSectionComponent,
    BottomSectionComponent,
    LoginComponent,
    LoginFormComponent,
    NotFoundComponent,
    HomePageComponent,
    ToastComponent,
    AutoFocusDirective,
    AdminComponent,
    AdminUsersComponent,
    AdminNewUserComponent,
    AdminUserDetailComponent,
    PanelComponent,
    PanelCategoriesComponent,
    PanelProductsComponent,
    PanelProductEditComponent,
    TextTruncatePipe,
    PanelProductsImagesComponent,
    GlamImageComponent,
    PanelProductWhsComponent,
    PanelHomeComponent,
    OfferComponent,
    ProductComponent,
    OffcanvasMenuComponent,
    PanelSizesColorsComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    InfiniteScrollModule,
    FormsModule,
    BrowserAnimationsModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatTooltipModule,
    IvyCarouselModule,
    CdkDropList,
    CdkDrag,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, multi: true, useClass: TokenInterceptor}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
