import {CategoryModel} from "../service/category.service";
import {PictureMetadata} from "../service/picture-service";
import {ColorModel} from "../service/color.service";
import {ProductItemModel} from "../service/product.service";

export class ProductModel {
  id: string;
  name: string;
  routeName: string;
  description: string;
  isPublished: boolean;
  status: string;
  category: CategoryModel;
  mainPicture?: PictureMetadata;
  allPictures?: PictureMetadata[];
  items?: ProductItemModel[];

  get isOnSale(): boolean {
    if(!this.items) {
      return false;
    }
    return this.items.some(i => !!i.price && i.price?.currentDiscount > 0)
  }

  get lowestPrice(): number {
    if(!this.items) {
      return 0;
    }
    const grossDiscPrices: number[] = this.items.filter(i => !!i.price).map(i => i.price!.grossDiscountPrice);
    return Math.min(...grossDiscPrices);
  }

  get highestPrice(): number {
    if(!this.items) {
      return 0;
    }
    const grossDiscPrices: number[] = this.items.filter(i => !!i.price).map(i => i.price!.grossDiscountPrice);
    return Math.max(...grossDiscPrices);
  }

  get highestDiscount(): number {
    if(!this.items) {
      return 0;
    }
    return Math.max(...this.items.filter(i => !!i.price).map(i => i.price!.currentDiscount));
  }

  get allColors(): ColorModel[] {
    if(!this.items) {
      return [];
    }
    let colors = this.items.filter(i => !!i.color && i.availableQuantity > 0).map(i => i.color!);
    return [...new Map(colors.map(item =>
      [item.colorValue, item])).values()];
  }

  get isAvailable() {
    return !!this.items && this.items.some(i => i.availableQuantity > 0);
  }
}
