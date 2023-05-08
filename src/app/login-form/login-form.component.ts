import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {LoginService} from "../service/login.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {

  loginForm: FormGroup;
  isLoadingLogin: boolean;
  loginStatusSub: Subscription;

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    this.loginStatusSub = this.loginService.loginStatusSubject.subscribe((succeeded: boolean) => {
      if(!succeeded) {
        this.loginForm.controls['email'].clearValidators();
        this.loginForm.controls['password'].reset();
        this.loginForm.controls['password'].markAsTouched();
        this.isLoadingLogin = false;
      }
    });
    this.loginForm = new FormGroup({
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', Validators.required )
    });
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    const email = this.loginForm.controls['email'].value;
    const password = this.loginForm.controls['password'].value;
    this.isLoadingLogin = true;
    this.loginService.postLoginRequest({email, password});
  }
}
