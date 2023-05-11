import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subscription} from "rxjs";
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
  currentMode = 'edit';
  editedProduct: ProductModel | undefined;
  errorMessage = '';
  successMessage = '';
  selectedFiles?: FileList;
  previews: string[] = [];
  mainPictureForm: FormGroup
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
      this.currentMode = 'new';
      this.successMessage = '';
      this.errorMessage = '';
      this.errorMessage = '';
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
    this.isLoadingForm = true;
    this.errorMessage = '';
    this.successMessage = '';
    const uploads: Observable<any>[] = []
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        uploads.push(this.upload(i, this.selectedFiles[i]));
      }
    }
    forkJoin(uploads).subscribe(res => {
      this.isLoadingForm = false;
      res.forEach(r => {
        if(r.type === 0) {
          return;
        }
        if(this.editedProduct?.allPictures) {
          this.editedProduct?.allPictures?.push(r);
        } else {
          this.editedProduct!.allPictures = [r];
        }
        this.currentMode = 'edit';
        this.successMessage = 'Zdjęcia dodano';
        this.previews = [];
        delete this.selectedFiles;
      });
    });
  }

  upload(idx: number, file: File): Observable<any> {
    return this.productService.pictureUpload(file, this.isFileMain(idx), this.editedProduct!.id);

  }

  removePreview(ind: number) {
    this.previews.splice(ind, 1);
    this.arrayMain.controls.splice(ind, 1);
  }
}
