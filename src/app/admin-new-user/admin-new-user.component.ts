import {
  AfterContentInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {UserRoleModel} from "../model/userRole.model";
import {environment} from "../../environments/environment";
import {catchError, Subscription, throwError} from "rxjs";
import {ToastNotificationService} from "../service/toast-notification.service";
import {UserModelAdminMode} from "../model/user.model";
import {UserService, UserWriteData} from "../service/user.service";
import {ErrorHandleService} from "../service/error-handle.service";

@Component({
  selector: 'app-admin-new-user',
  templateUrl: './admin-new-user.component.html',
  styleUrls: ['./admin-new-user.component.scss']
})
export class AdminNewUserComponent implements OnInit, AfterContentInit, OnDestroy {
  newUser: FormGroup;
  mobileCode: FormGroup;
  _isFormLoading = false;
  roles: UserRoleModel[];
  errorMessageSub: Subscription;
  errorMessage: string;
  currentMode = 'new-user-form';
  registeredUser: UserModelAdminMode | undefined;
  @ViewChildren('code') inputs: QueryList<ElementRef<HTMLInputElement>>;

  constructor(
    private toastService: ToastNotificationService,
    private http: HttpClient,
    private userService: UserService,
    private errorService: ErrorHandleService
  ) {}

  ngOnInit() {
    this.newUser = new FormGroup({
      'firstName': new FormControl('', [Validators.required]),
      'lastName': new FormControl('', [Validators.required]),
      'email': new FormControl('', [Validators.required, Validators.email]),
      'phone-no': new FormControl('', [Validators.required, Validators.pattern('[5-8]{1}[0-9]{8}')]),
      'password': new FormControl('', [Validators.required]),
      'password-confirmation': new FormControl('', [Validators.required, this.checkPasswords]),
      'roles': new FormArray([])
    });
    this.mobileCode = new FormGroup({
      0: new FormControl('', [Validators.required]),
      1: new FormControl('', [Validators.required]),
      2: new FormControl('', [Validators.required]),
      3: new FormControl('', [Validators.required]),
      4: new FormControl('', [Validators.required]),
      5: new FormControl('', [Validators.required]),
    });
    this.mobileCode.valueChanges.subscribe((e) => {
      const ff = Number(Object.keys(e).find(k => !e[k]));
      if(isNaN(ff)) {
        this.handleSmsCodeInput();
      }
      this.inputs.get(ff)?.nativeElement?.focus();
    });
    this.errorMessageSub = this.errorService.errorMessageSubject.subscribe(m => {
      this._isFormLoading = false;
      this.errorMessage = m;
    });
  }

  ngOnDestroy() {
    this.errorMessageSub.unsubscribe();
  }

  ngAfterContentInit() {
    this.loadRoles();
  }

  checkPasswords: ValidatorFn = (group: AbstractControl):  ValidationErrors | null => {
    if(!this.newUser) {
      return null;
    }
    const pass = this.newUser.controls['password'].value;
    const confirmPass = this.newUser.controls['password-confirmation'].value;
    return pass === confirmPass ? null : { notSame: true }
  }

  handleNewUser() {
    this._isFormLoading = true;
    this.errorMessage = '';
    const roles = this.arrayRoles.controls.filter(c => c.value).map(c => this.roles[this.arrayRoles.controls.indexOf(c)].id);
    const request: UserWriteData = {
      email: this.newUser.controls['email'].value,
      password: this.newUser.controls['password'].value,
      firstName: this.newUser.controls['firstName'].value,
      lastName: this.newUser.controls['lastName'].value,
      mobileNo: this.newUser.controls['phone-no'].value,
      roleIds: roles
    };
    this.userService.registerUser({userdata: request})
      .subscribe((user: UserModelAdminMode) => {
        this._isFormLoading = false;
        this.registeredUser = user;
        if(user.status === 'NOT_ACTIVATED') {
          this.currentMode = 'mobile-activation-code';
        } else {
          this.currentMode = 'success';
        }
      });
  }

  get isLoadingForm(): boolean {
    return this._isFormLoading || !this.roles;
  }

  get arrayRoles() {
    return this.newUser.controls['roles'] as FormArray;
  }

  loadRoles() {
    this.http.get<UserRoleModel[]>(
      environment.apiUrl + 'user/role'
    ).
      pipe(catchError(err => this.handleHttpError(err))
    ).subscribe(roles => {
      this.roles = roles;
      roles.forEach(r => {
        const formCtl = new FormControl(r.developerName === 'STAFF');
        this.arrayRoles.push(formCtl);
        if(r.developerName === 'GUEST') {
          formCtl.disable();
        }
      })
    });
  }

  private handleHttpError(err: HttpErrorResponse) {
    let message: string = 'Wystąpił błąd: ';
    if(err.error?.errorCode == 'FORBIDDEN') {
      message = 'Brak autoryzacji';
    } else {
      message += err.error?.errorMsg;
    }
    this.toastService.showToast({message, sticky: true, variant: 'danger'});
    return throwError(() => new Error(message));
  }

  handleSmsCodeInput() {
    if(Object.values(this.mobileCode.controls).some(c => !c.value) || !this.registeredUser) {
      return;
    }
    const code = Object.values(this.mobileCode.controls).map(c => c.value).join("");
    this.userService.validateSmsCode(this.registeredUser.id, code).subscribe(result => {
      if(!result) {
        this.errorMessage = 'Podano nieprawidłowy kod weryfikujący';
        this.clearSmsCode();
      } else {
        this.currentMode = 'success';
        this.errorMessage = '';
      }
      this._isFormLoading = false;
    });
  }

  private clearSmsCode() {
    Object.values(this.mobileCode.controls).forEach(c => c.setValue(''));
  }

  handleClearAll() {
    this.errorMessage = '';
    this.clearSmsCode();
    this.currentMode = 'new-user-form';
    this.registeredUser = undefined;
    this.newUser.reset();
  }
}
