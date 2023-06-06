import {Component} from '@angular/core';
import {of, switchMap} from "rxjs";
import {ProductModel} from "../model/product.model";
import {ActivatedRoute, Router} from "@angular/router";
import {OfferService} from "../service/offer.service";
import {PictureMetadata} from "../service/picture-service";
import {environment} from "../../environments/environment";
import {SizeModel} from "../service/size.service";
import {ProductItemModel} from "../service/product.service";
import {ColorModel} from "../service/color.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {
  routeParamsSub: any;
  isPageLoading = true;
  currentProduct: ProductModel;
  currentPic: PictureMetadata;
  currentProductItem: ProductItemModel;
  zoomIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService,
    private titleService: Title
  ) {
  }

  ngOnInit() {
    this.isPageLoading = true;
    let paramRouteName: any;
    this.routeParamsSub = this.route.paramMap.pipe(switchMap(p => {
      if (!p.has('prodRouteName')) {
        this.router.navigate(['/404']).then(() => this.isPageLoading = false);
        return of(undefined);
      }
      const cachedProduct = this.offerService.getProductByRoute(p.get('prodRouteName')!);
      if (!cachedProduct) {
        paramRouteName = p.get('prodRouteName');
        const routeNameId = paramRouteName.slice(-36);
        const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
        if (uuidRegex.test(routeNameId)) {
          return this.offerService.fetchProductById(routeNameId);
        }
        return of(undefined);
      } else {
        return of(cachedProduct);
      }
    })).subscribe(p => {
      if (!p) {
        this.router.navigate(['/404']).then(() => this.isPageLoading = false);
      } else {
        if (!!paramRouteName && paramRouteName !== p.routeName) {
          this.router.navigate(['/produkt', p.routeName]).then(() => this.isPageLoading = false);
          return;
        }
        this.currentProduct = p;
        this.currentPic = p.mainPicture!;
        this.currentProductItem = p.items![0];
        this.titleService.setTitle('Glamlove - ' + this.currentProduct.name);
        this.isPageLoading = false;
      }
    });
  }

  get sizes(): SizeModel[] {
    const sizes = this.currentProduct.items!
      .filter(i => !!i.size)
      .map(i => i.size!)
      .sort((a, b) => {
        if(!a.order) {
          return 1;
        }
        if(!b.order) {
          return -1
        }
        if(a.order === b.order) {
          return 0;
        }
        return (a.order > b.order) ? 1 : -1;
      });
    if(!sizes) {
      return [];
    }
    const ids: string[] = sizes.map(s => s.id);
    const setOfIds: string[] = [...new Set(ids)];
    return setOfIds.map(sId => sizes.find(s => s.id === sId)!);
  }

  get colors(): ColorModel[] {
    const colors = this.currentProduct.items!
      .filter(i => !!i.color)
      .map(i => i.color!)
      .sort((a, b) => (a.colorName > b.colorName) ? 1 : -1);
    if(!colors) {
      return [];
    }
    const ids: string[] = colors.map(c => c.id);
    const setOfIds: string[] = [...new Set(ids)];
    return setOfIds.map(cId => colors.find(c => c.id === cId)!);
  }


  getThumbUrl(p: PictureMetadata) {
    return environment.apiUrl + 'img/' + p.pictureThumbnailId;
  }

  getPicUrl(p: PictureMetadata) {
    return environment.apiUrl + 'img/' + p.pictureId;
  }

  ngOnDestroy() {
    this.routeParamsSub.unsubscribe();
    this.titleService.setTitle('Glamlove');
  }

  handleNewColor(color: ColorModel) {
    console.log('new color will', color);
    if(this.currentProductItem.color === color || !this.currentProduct.items!.some(i => i.color!.id === color.id)) {
      console.log('ten kolor juiz jest albo go w ogole nie ma');
      return;
    }
    this.currentProductItem = this.currentProduct.items?.find(i => i.color!.id === color.id)!;
    console.log(this.currentProductItem.size!.sizeValue);
  }
}
