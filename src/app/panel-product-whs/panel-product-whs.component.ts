import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ProductItemModel, ProductModel, ProductService} from "../service/product.service";
import {ColorModel, ColorService} from "../service/color.service";
import {SizeModel, SizeService} from "../service/size.service";
import {ErrorHandleService} from "../service/error-handle.service";
import {ToastNotificationService} from "../service/toast-notification.service";

@Component({
  selector: 'app-panel-product-whs',
  templateUrl: './panel-product-whs.component.html'
})
export class PanelProductWhsComponent implements OnInit, OnDestroy {
  editedProductSub: Subscription;
  isLoadingForm = false;
  currentMode = 'summary';
  currentNewFormMode = '';
  newSkuForm: FormGroup
  errorMessage: string = '';
  successMessage: string = '';
  foundColors: ColorModel[] = [];
  selectedColor: ColorModel | undefined;
  editedColorSub: any;
  foundSizes: SizeModel[] = [];
  sizeSearchSub: any;
  selectedSize: SizeModel | undefined;
  editedSizeSub: any;
  newColorForm: FormGroup;
  newSizeForm: FormGroup;
  searchTimer: any;
  errorSub: Subscription;
  loadedItems: ProductItemModel[] = [];
  selectedItem: ProductItemModel | undefined;
  editedProduct: ProductModel | undefined;
  newQty: number | undefined;
  newQtyModeStorno = false;
  newPrice: number | undefined;
  stopLoadingSub: Subscription;
  newDiscount = 0;
  skuRemovalMode = false;
  @Output('edited') editedEmitter: EventEmitter<ProductModel> = new EventEmitter<ProductModel>();
  @ViewChild('closeModal') closeModalButton: ElementRef;

  constructor(
    private productService: ProductService,
    private colorService: ColorService,
    private sizeService: SizeService,
    private errorService: ErrorHandleService,
    private toasts: ToastNotificationService
  ) {}

  ngOnInit() {
    this.isLoadingForm = true;
    this.errorSub = this.errorService.errorMessageSubject.subscribe(e => {
      this.errorMessage = e;
      this.isLoadingForm = false;
    });
    this.stopLoadingSub = this.errorService.stopLoadingSubject.subscribe(() => {
      this.isLoadingForm = false;
    });
    this.newSkuForm = new FormGroup({
      'sku': new FormControl('', [Validators.pattern('^\\d{13}$')]),
      'color': new FormControl(''),
      'size': new FormControl(''),
      'qty':  new FormControl('', [Validators.min(1), Validators.required]),
      'price':  new FormControl('', [Validators.min(0.01), Validators.required]),
      'discount':  new FormControl('', [Validators.min(0), Validators.max(99)]),
      'promoted': new FormControl(false)
    });
    this.editedProductSub = this.productService.editedProductSubject.subscribe(edited => {
      this.editedProduct = edited;
      this.productService.getProductItems(this.editedProduct!.id).subscribe(items => {
        this.loadedItems = items;
        this.isLoadingForm = false;
      });
    });
    this.editedColorSub = this.newSkuForm.controls['color'].valueChanges.subscribe(val => {
      if(!!this.selectedColor && this.selectedColor.colorName !== val) {
        this.selectedColor = undefined;
        this.newSkuForm.controls['color'].setValue('', {emitEvent: false});
        if(val.length > 1) {
          this.handleSearchColor(val)
        }
      } else {
        this.foundColors = [];
      }
    });
    this.editedSizeSub = this.newSkuForm.controls['size'].valueChanges.subscribe(val => {
      if(!!this.selectedSize && this.selectedSize.sizeValue !== val) {
        this.selectedSize = undefined;
        this.newSkuForm.controls['size'].setValue('', {emitEvent: false});
      } else {
        this.foundSizes = [];
      }
    });
    this.sizeSearchSub = this.newSkuForm.controls['size'].valueChanges
      .subscribe(val => this.handleSearchSize(val));
  }

  ngOnDestroy() {
    this.editedProductSub.unsubscribe();
    this.editedColorSub.unsubscribe();
    this.sizeSearchSub.unsubscribe();
    this.errorSub.unsubscribe();
    this.closeModalButton.nativeElement.click();
  }

  handleCloseModal() {
    this.closeModalButton.nativeElement.click();
  }

  handleChooseColor() {
    this.foundColors = [];
    this.newColorForm = new FormGroup({
      'value': new FormControl('#000000', [Validators.required]),
      'name': new FormControl('', [Validators.required])
    });
    this.newSkuForm.disable();
    this.currentNewFormMode = 'color';
  }

  handleChooseSize() {
    this.foundSizes = [];
    this.newSizeForm = new FormGroup({
      'name': new FormControl('', [Validators.required])
    });
    this.newSkuForm.disable();
    this.currentNewFormMode = 'size';
  }

  handleNewColorSelected() {
    this.errorMessage = '';
    const selectedColor = this.newColorForm.controls['value'].value;
    const selectedColorName = this.newColorForm.controls['name'].value;
    if(selectedColor.includes('rgba')) {
      this.errorMessage = 'Współczynnik alpha dla kolorów nie jest obecnie wspierany. Wybierz kolor ze współczynnikiem alpha na poziomie 1.';
      return;
    }
    this.isLoadingForm = true;
    this.colorService.postNewColor({value: selectedColor, name: selectedColorName}).subscribe(color => {
      this.returnToProductSummary();
      this.newSkuForm.controls['color'].setValue(color.colorName, {emitEvent: false});
      this.selectedColor = color;
      this.isLoadingForm = false;
    });
  }

  handleNewSizeSelected() {
    this.errorMessage = '';
    const selectedSizeName = this.newSizeForm.controls['name'].value;
    this.isLoadingForm = true;
    this.sizeService.postNewSize({name: selectedSizeName}).subscribe(size => {
      this.returnToProductSummary();
      this.newSkuForm.controls['size'].setValue(size.sizeValue, {emitEvent: false});
      this.selectedSize = size;
      this.isLoadingForm = false;
    });
  }

  returnToProductSummary() {
    this.newSkuForm.enable();
    this.currentNewFormMode = '';
  }

  handleSaveNewSku() {
    this.isLoadingForm = true;
    this.errorMessage = '';
    this.productService.postNewItem({
      serialNumber: this.newSkuForm.controls['sku'].value,
      productId: this.editedProduct!.id,
      colorId: this.selectedColor!.id,
      sizeId: this.selectedSize!.id,
      discountRate: this.newSkuForm.controls['discount'].value,
      isPromoted: this.newSkuForm.controls['promoted'].value,
      price: this.newSkuForm.controls['price'].value,
      quantity: this.newSkuForm.controls['price'].value
    }).subscribe(newItem => {
      this.loadedItems.push(newItem);
      this.isLoadingForm = false;
      this.currentMode = 'summary';
    });
  }

  handleGenerateEan13() {
    this.newSkuForm.controls['sku'].setValue(this.generateRandomEan13());
  }

  private generateRandomEan13() {
    const base = this.generateRandomNumber();
    const baseTxt = base.toString();
    return baseTxt + this.checkDigitEAN13(baseTxt);
  }

  private checkDigitEAN13(barcode: string): string {
    const sum = barcode.split('')
      .map(n => Number.parseInt(n))
      .map((n, i) => n * (i % 2 ? 3 : 1))
      .reduce((sum, n) => sum + n, 0)
    const roundedUp = Math.ceil(sum / 10) * 10;
    const results = roundedUp - sum;
    return results.toString()
  }


  private generateRandomNumber(): number {
    return Math.floor(100000000000 + Math.random() * 900000000000)
  }

  handleColorChoice(color: ColorModel, event: Event) {
    event.preventDefault();
    this.selectedColor = color;
    this.newSkuForm.controls['color'].setValue(color.colorName, {emitEvent: false});
    this.foundColors = [];
  }

  handleSizeChoice(size: SizeModel, event: Event) {
    event.preventDefault();
    this.selectedSize = size;
    this.newSkuForm.controls['size'].setValue(size.sizeValue, {emitEvent: false});
    this.foundSizes = [];
  }

  handleSearchColor(phrase: string) {
    if (!!this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    if (!phrase || this.selectedColor?.colorName === phrase) {
      return;
    }
    delete this.selectedColor;
    this.searchTimer = setTimeout(() => {
      this.colorService.searchByNamePhrase(phrase).subscribe((searchResults: ColorModel[]) => {
        this.foundColors = searchResults;
      });
    }, 400);
  }

  handleSearchSize(phrase: string) {
    if (!!this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    if (!phrase || this.selectedSize?.sizeValue === phrase) {
      return;
    }
    delete this.selectedSize;
    this.searchTimer = setTimeout(() => {
      this.sizeService.searchByNamePhrase(phrase).subscribe((searchResults: SizeModel[]) => {
        this.foundSizes = searchResults;
      });
    }, 400);
  }

  handleSelectItemSelection(item: ProductItemModel) {
    this.selectedItem = item;
    this.newDiscount = 0;
    this.newPrice = undefined;
    this.newQty = undefined;
  }

  handleDeleteItem(item: ProductItemModel, event: Event) {
    event.preventDefault();
    if(item.orderedQuantity! > 0) {
      this.errorMessage = 'Nie można usunąć SKU, gdy istnieje niezrealizowane zamówienie zawierające to SKU. Zrealizuj zamówienie, a następnie usuń SKU.';
    }
    this.skuRemovalMode = true;
  }

  handleActivateItem(item: ProductItemModel, event: Event) {
    event.preventDefault();
    this.productService.activateItem(item.id).subscribe(i => {
      const itemIndex = this.loadedItems.findIndex(anItem => anItem.id === i.id);
      this.loadedItems[itemIndex] = i;
      this.selectedItem = i;
      this.toasts.showToast({message: 'SKU zostało opublikowane.'});
    });
  }

  handleHideItem(item: ProductItemModel, event: Event) {
    event.preventDefault();
    this.productService.hideItem(item.id).subscribe(i => {
      const itemIndex = this.loadedItems.findIndex(anItem => anItem.id === i.id);
      this.loadedItems[itemIndex] = i;
      this.selectedItem = i;
      this.toasts.showToast({message: 'SKU zostało ukryte.'});
    });
  }

  showNewQtyForm(storno: boolean, event: Event) {
    event.preventDefault();
    this.newQty = 0;
    this.newQtyModeStorno = storno;
  }

  showNewPriceForm(event: Event) {
    event.preventDefault();
    this.newPrice = this.selectedItem!.price!.grossBasePrice;
    this.newDiscount = this.selectedItem!.price!.currentDiscount;
  }

  handleAddRemoveStock() {
    this.isLoadingForm = true;
    this.productService.addStock(this.selectedItem!.id, this.newQtyModeStorno ? -this.newQty! : this.newQty!).subscribe(i => {
      const itemIndex = this.loadedItems.findIndex(anItem => anItem.id === i.id);
      this.loadedItems[itemIndex] = i;
      this.selectedItem = i;
      this.toasts.showToast({message: (this.newQtyModeStorno ? 'Ujęto ' : 'Dodano ') + this.newQty + ' sztuk.'});
      this.newQty = undefined;
      this.isLoadingForm = false;
    });
  }

  handleAddPrice() {
    this.isLoadingForm = true;
    this.productService.addNewPrice(this.selectedItem!.id, this.newPrice!, this.selectedItem?.price?.vatRate!, this.newDiscount).subscribe(i => {
      const itemIndex = this.loadedItems.findIndex(anItem => anItem.id === i.id);
      this.loadedItems[itemIndex] = i;
      this.selectedItem = i;
      this.toasts.showToast({message: 'Nowa cena została ustalona na ' + this.newPrice + 'zł. Obowiązujący rabat to ' + this.newDiscount + '%'});
      this.newPrice = undefined;
      this.newDiscount = 0;
      this.isLoadingForm = false;
    });
  }

  handlePromote(isPromoted: boolean, event: Event) {
    event.preventDefault();
    if(isPromoted === this.selectedItem?.isPromoted) {
      return;
    }
    const promoToggleSub = isPromoted ? this.productService.promoteItem(this.selectedItem?.id!) : this.productService.stopPromoItem(this.selectedItem?.id!);
    promoToggleSub.subscribe(i => {
      const itemIndex = this.loadedItems.findIndex(anItem => anItem.id === i.id);
      this.loadedItems[itemIndex] = i;
      this.selectedItem = i;
      this.toasts.showToast({message: isPromoted ? 'To SKU będzie promowane na stronie głównej oraz w&nbsp;innych miejscach witryny.' : 'Promowanie w&nbsp;witrynie tego SKU zostało zakończone.'});
      this.isLoadingForm = false;
    });
  }

  performSkuRemoval(item: ProductItemModel) {
    this.isLoadingForm = true;
    this.productService.removeItem(item.id).subscribe(() => {
      this.loadedItems = this.loadedItems.filter(i => i.id !== item.id);
      this.toasts.showToast({message: 'SKU zostało usunięte!'});
      this.isLoadingForm = false;
    })
  }
}
