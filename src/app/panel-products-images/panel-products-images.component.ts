import {Component, OnDestroy, OnInit} from '@angular/core';
import { Subscription} from "rxjs";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {ProductModel, ProductService} from "../service/product.service";
import {ErrorHandleService} from "../service/error-handle.service";

@Component({
  selector: 'app-panel-products-images',
  templateUrl: './panel-products-images.component.html'
})
export class PanelProductsImagesComponent implements OnInit, OnDestroy {
  editedProductSub: Subscription;
  isLoadingForm = false;
  currentMode = 'new';
  editedProduct: ProductModel | undefined;
  errorMessage = '';
  successMessage = '';
  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];
  previews: string[] = [];
  mainPictureForm: FormGroup
  mainChangeSub: Subscription | any;
  errorMessageSub: Subscription;

  constructor(private productService: ProductService, private errorService: ErrorHandleService) {
  }

  ngOnInit() {
    this.mainPictureForm = new FormGroup({'main': new FormArray([])});
    this.editedProductSub = this.productService.editedProductSubject.subscribe(edited => {
      this.editedProduct = edited;
    });
    this.errorMessageSub = this.errorService.errorMessageSubject.subscribe(e => {
      this.errorMessage = e;
    })
  }

  ngOnDestroy() {
    this.editedProductSub.unsubscribe();
    this.errorMessageSub.unsubscribe();
  }

  get arrayMain() {
    return this.mainPictureForm.controls['main'] as FormArray;
  }

  onFileSelected(event: any) {
    try {
      this.errorMessage = '';
      this.message = [];
      this.progressInfos = [];
      this.selectedFiles = event.target.files;
      if (this.selectedFiles && this.selectedFiles[0]) {
        const numberOfFiles = this.selectedFiles.length;
        for (let i = 0; i < numberOfFiles; i++) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const ctl = this.mainPictureForm.controls['main'] as FormArray;
            ctl.push(new FormControl(false));
            this.previews.push(e.target.result)
          };
          reader.readAsDataURL(this.selectedFiles[i]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  handleMarkAsMain(i: number) {
    for (let j = 0; j < this.arrayMain.controls.length; j++) {
      this.arrayMain.controls[j].setValue(j === i, {emitEvent: false});
    }
  }

  isFileMain(index: number): boolean {
    return this.arrayMain.controls[index].value;
  }

  uploadFiles(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    }
  }

  upload(idx: number, file: File): void {
    this.productService.pictureUpload(file, this.isFileMain(idx), this.editedProduct!.id)
      .subscribe(res => {
        if(this.editedProduct?.allPictures) {
          this.editedProduct?.allPictures?.push(res);
        } else {
          this.editedProduct!.allPictures = [res];
        }
      });
  }

  removePreview(ind: number) {
    this.previews.splice(ind, 1);
    this.arrayMain.controls.splice(ind, 1);
  }
}
