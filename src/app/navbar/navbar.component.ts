import {Component, OnInit} from '@angular/core';
import {AuthService} from "../service/auth.service";
import {CategoryModel, CategoryService} from "../service/category.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {

  mainCategories: CategoryModel[] = [];

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.authService.autologin();
    this.categoryService.fetchMaster().subscribe(master => {
      this.mainCategories = master.children!;
      this.categoryService.addToCache([master]);
    });
  }
}
