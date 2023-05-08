import {AfterContentChecked, Component} from '@angular/core';
import {UserModelAdminMode} from "../model/user.model";
import {UserService} from "../service/user.service";

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements AfterContentChecked {
  loadedUsers: UserModelAdminMode[];
  loading = true;
  canLoadMore = false;
  currentPage = 0;
  currentTab = 'active';

  constructor(private userService: UserService) {}

  ngAfterContentChecked() {
    if(!this.loadedUsers) {
      this.userService.loadUsersPage(0, true).subscribe(page => {
        this.canLoadMore = !page.last;
        this.loadedUsers = page.content;
        this.loading = false;
      });
    }
  }

  loadMoreUsers() {
    if(!this.canLoadMore) {
      return;
    }
    this.loading = true;
    this.userService.loadUsersPage(++this.currentPage, this.currentTab === 'active').subscribe(page => {
      this.canLoadMore = !page.last;
      this.loadedUsers = [...this.loadedUsers, ...page.content];
      this.loading = false;
    })
  }

  changeTabTo(event: Event, dest: string) {
    event.preventDefault();
    this.currentTab = dest;
    this.loading = true;
    this.userService.loadUsersPage(0, this.currentTab === 'active').subscribe(page => {
      this.loadedUsers = page.content;
      this.canLoadMore = !page.last;
      this.loading = false;
    })
  }

  isNotCurrentTab(dest: string) {
    return this.currentTab !== dest;
  }

}
