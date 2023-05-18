import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ProductModel, ProductService} from "../service/product.service";
import {ColorModel, ColorService} from "../service/color.service";
import {SizeModel, SizeService} from "../service/size.service";

@Component({
  selector: 'app-panel-product-whs',
  templateUrl: './panel-product-whs.component.html'
})
export class PanelProductWhsComponent implements OnInit, OnDestroy {
  editedProductSub: Subscription;
  isLoadingForm = false;
  currentMode = 'new';
  currentNewFormMode = '';
  newSkuForm: FormGroup
  errorMessage: string = '';
  successMessage: string = '';
  newColor = "#FFFFFF";
  newColorName = '';
  foundColors: ColorModel[] = [];
  colorSearchSub: any;
  selectedColor: ColorModel | undefined;
  editedColorSub: any;
  foundSizes: SizeModel[] = [];
  sizeSearchSub: any;
  selectedSize: SizeModel | undefined;
  editedSizeSub: any;
  newColorForm: FormGroup;
  newSizeForm: FormGroup;
  searchTimer: any;
  // foundCategories: CategoryModel[] = [];
  // searchSub: Subscription | any;
  // selectedCategory: CategoryModel | undefined;
  editedProduct: ProductModel | undefined;
  @Output('edited') editedEmitter: EventEmitter<ProductModel> = new EventEmitter<ProductModel>();
  @ViewChild('closeModal') closeModalButton: ElementRef;

  constructor(
    private productService: ProductService,
    private colorService: ColorService,
    private sizeService: SizeService
  ) {}

  ngOnInit() {
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
    this.editedColorSub = this.newSkuForm.controls['color'].valueChanges.subscribe(() => {
      if(!!this.selectedColor) {
        this.selectedColor = undefined;
        this.newSkuForm.controls['color'].setValue('', {emitEvent: false});
      }
    });
    this.editedSizeSub = this.newSkuForm.controls['size'].valueChanges.subscribe(() => {
      if(!!this.selectedSize) {
        this.selectedSize = undefined;
        this.newSkuForm.controls['size'].setValue('', {emitEvent: false});
      }
    });
    this.colorSearchSub = this.newSkuForm.controls['color'].valueChanges
      .subscribe(val => {
        this.handleSearchColor(val)
      });
    this.sizeSearchSub = this.newSkuForm.controls['size'].valueChanges
      .subscribe(val => this.handleSearchSize(val));
  }

  ngOnDestroy() {
    this.editedProductSub.unsubscribe();
    this.editedColorSub.unsubscribe();
    this.colorSearchSub.unsubscribe();
    this.sizeSearchSub.unsubscribe();
  }

  handleCloseModal() {
    this.closeModalButton.nativeElement.click();
  }

  handleChooseColor() {
    this.newColorForm = new FormGroup({
      'value': new FormControl('', [Validators.required]),
      'name': new FormControl('', [Validators.required])
    });
    this.newSkuForm.disable();
    this.currentNewFormMode = 'color';
  }

  handleChooseSize() {
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
      this.newColor = '#FFFFFF';
      this.errorMessage = 'Współczynnik alpha dla kolorów nie jest obecnie wspierany. Wybierz kolor ze współczynnikiem alpha na poziomie 1.';
      return;
    }
    this.isLoadingForm = true;
    this.colorService.postNewColor({value: selectedColor, name: selectedColorName}).subscribe(color => {
      this.returnToProductSummary();
      this.newSkuForm.controls['color'].setValue(color.colorName);
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
      this.newSkuForm.controls['size'].setValue(size.sizeValue);
      this.selectedSize = size;
      this.isLoadingForm = false;
    });
  }

  returnToProductSummary() {
    this.newSkuForm.enable();
    this.currentNewFormMode = '';
  }

  handleSaveNewSku() {

  }

  handleColorChoice(color: ColorModel, event: Event) {
    event.preventDefault();
    this.selectedColor = color;
    this.newSkuForm.controls['color'].setValue(color.colorName);
    this.foundColors = [];
  }

  handleSizeChoice(size: SizeModel, event: Event) {
    event.preventDefault();
    this.selectedSize = size;
    this.newSkuForm.controls['size'].setValue(size.sizeValue);
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
