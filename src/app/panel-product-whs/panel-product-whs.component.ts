import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ProductModel, ProductService} from "../service/product.service";
import {ColorModel, ColorService} from "../service/color.service";
import {SizeModel, SizeService} from "../service/size.service";
import {ErrorHandleService} from "../service/error-handle.service";

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
  editedProduct: ProductModel | undefined;
  @Output('edited') editedEmitter: EventEmitter<ProductModel> = new EventEmitter<ProductModel>();
  @ViewChild('closeModal') closeModalButton: ElementRef;

  constructor(
    private productService: ProductService,
    private colorService: ColorService,
    private sizeService: SizeService,
    private errorService: ErrorHandleService
  ) {}

  ngOnInit() {
    this.errorSub = this.errorService.errorMessageSubject.subscribe(e => {
      this.errorMessage = e;
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
      //todo: dodać logikę dodawania nowego do istniejącej listy
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
}
