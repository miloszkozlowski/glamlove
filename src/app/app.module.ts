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
import {ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { ToastComponent } from './toast/toast.component';
import {AutoFocusDirective} from "./service/auto-focus.directive";

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
    AutoFocusDirective
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
