import {
  AfterContentInit,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {CategoryModel, CategoryService} from "../service/category.service";
import {Subscription} from "rxjs";
import {ErrorHandleService} from "../service/error-handle.service";

@Component({
  selector: 'app-panel-categories',
  templateUrl: './panel-categories.component.html'
})
export class PanelCategoriesComponent implements OnInit, AfterContentInit, OnDestroy {
  newMode = false;
  newCategoryName = '';
  isLoading = true;
  masterCategory: CategoryModel
  currentCategory: CategoryModel;
  stopLoadingSub: Subscription;
  categoriesPath: CategoryModel[] = [];

  constructor(private categoryService: CategoryService, private errorService: ErrorHandleService) {}

  ngAfterContentInit() {
    this.categoryService.fetchMaster().subscribe(master => {
      this.masterCategory = master;
      this.currentCategory = master;
      this.categoriesPath = [master];
      this.isLoading = false;
    });
  }

  ngOnInit() {
    this.stopLoadingSub = this.errorService.stopLoadingSubject.subscribe(() => this.isLoading = false);
  }

  ngOnDestroy() {
    this.stopLoadingSub.unsubscribe();
  }

  toggleNewMode() {
    this.newMode = !this.newMode;
  }

  handleNewCategory() {
    this.isLoading = true;
    this.categoryService.createNewCategory(this.currentCategory.id, this.newCategoryName)
      .subscribe(newCat => {
        if (!this.currentCategory.children)
          this.currentCategory.children = [newCat];
        else
          this.currentCategory.children?.push(newCat);
      })
    this.toggleNewMode();
    this.newCategoryName = '';
    this.isLoading = false;
  }

  openCategory(id: string, event: Event) {
    event.preventDefault();
    this.newMode = false;
    if(this.categoriesPath.some(c => c.id === id)) {
      this.categoriesPath.length = this.categoriesPath.map(c => c.id).indexOf(id) + 1;
      this.currentCategory = this.categoriesPath[this.categoriesPath.length - 1];
    } else if (!!this.currentCategory.children) {
      this.isLoading = true;
      this.categoryService.fetchById(id).subscribe(cat => {
        this.categoriesPath.push(cat);
        let catMaster = this.currentCategory.children?.find(cat => cat.id === id);
        const index: number | undefined = this.currentCategory.children?.map(c => c.id).indexOf(id);
        if (!!catMaster && index! >= 0) {
          this.currentCategory = cat;
        }
        this.isLoading = false;
      });
    }
  }

  handleRemoveCategory(id: string, event: Event) {
    event.stopPropagation();
    console.warn('Category removal not implemented yet');
  }

  handleAddProduct(id: string, event: Event) {
    event.stopPropagation();
    console.warn('Quick product add not implemented yet');
  }
}
