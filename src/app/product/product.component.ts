import { Component } from '@angular/core';
import {of, switchMap} from "rxjs";
import {ProductModel} from "../model/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {OfferService} from "../service/offer.service";
import {ErrorHandleService} from "../service/error-handle.service";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  routeParamsSub: any;
  isPageLoading = true;
  currentProduct: ProductModel;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService
  ) {}

  ngOnInit() {
      this.isPageLoading = true;
      let paramRouteName: any;
      this.routeParamsSub = this.route.paramMap.pipe(switchMap(p => {
        if(!p.has('prodRouteName')) {
          // this.router.navigate(['/404']).then(() => this.isPageLoading = false);
          return of(undefined);
        }
        const cachedProduct = this.offerService.getProductByRoute(p.get('prodRouteName')!);
        if(!cachedProduct) {
          paramRouteName = p.get('prodRouteName');
          const routeNameId = paramRouteName.slice(-36);
          const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
          if(uuidRegex.test(routeNameId)) {
            return this.offerService.fetchProductById(routeNameId);
          }
          return of(undefined);
        } else {
          return of(cachedProduct);
        }
      })).subscribe(p => {
        if(!p) {
          this.router.navigate(['/404']).then(() => this.isPageLoading = false);
        } else {
          if(!!paramRouteName && paramRouteName !== p.routeName) {
            this.router.navigate(['/produkt', p.routeName]).then(() => this.isPageLoading = false);
            return;
          }
          this.currentProduct = p;
          this.isPageLoading = false;
        }
      });

  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
  }
}
