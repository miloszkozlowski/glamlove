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
    PanelCategoriesComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    InfiniteScrollModule,
    FormsModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, multi: true, useClass: TokenInterceptor}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
