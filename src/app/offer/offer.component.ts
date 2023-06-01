import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {filter, mergeMap, Subscription, tap} from "rxjs";
import {CategoryModel, CategoryService} from "../service/category.service";
import {OfferService} from "../service/offer.service";
import {ProductModel} from "../model/product.model";

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit, OnDestroy {

  routeParamsSub: Subscription;
  currentPage = 0;
  currentCategoryRouteName: string | undefined;
  isPageLoading = true;
  categories: CategoryModel[] = [];
  currentCategory: CategoryModel | undefined;
  loadedProducts: ProductModel[] = [];
  canLoadMore = false;

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.routeParamsSub = this.categoryService.categoryCacheSubj.pipe(
      filter(categories => categories.length > 0 && categories.length != this.categories.length),
      tap(cats => {
        this.categories = cats;
      }),
      mergeMap(() => this.route.params),
      filter(params => params.hasOwnProperty('catRouteName')),
      mergeMap(params => {
        this.currentCategory = this.categoryService.getCategoryByRouteName(params['catRouteName']);
        return this.offerService.getOfferPageByCategory(this.categoryService.getCategoryByRouteName(params['catRouteName']!)!.id, this.currentPage++);
      })
    ).subscribe(productsPage => {
      console.log('prodcts', productsPage);
      this.loadedProducts = productsPage.content.map(p => Object.assign(new ProductModel(), p));
      this.offerService.pushLoadedProducts(this.loadedProducts);
      this.canLoadMore = !productsPage.last;
      this.isPageLoading = false;
    });
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }
}
