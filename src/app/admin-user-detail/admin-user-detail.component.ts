import {Component, Input, Output} from '@angular/core';
import {UserModelAdminMode} from "../model/user.model";

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.scss']
})
export class AdminUserDetailComponent {

  @Input('user') user: UserModelAdminMode | undefined;
  errorMessage = '';
  isLoading = false;
}
