import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subscription} from "rxjs";
import {FormArray, FormControl, FormGroup} from "@angular/forms";
import {ProductModel, ProductService} from "../service/product.service";
import {ErrorHandleService} from "../service/error-handle.service";
import {PictureMetadata} from "../service/picture-service";

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
      this.errorMessage = '';
      this.successMessage = ''
    });
    this.errorMessageSub = this.errorService.errorMessageSubject.subscribe(e => {
      this.errorMessage = e;
    });
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

  isMainPicture(meta: PictureMetadata) {
    return this.editedProduct?.mainPicture?.id === meta.id;
  }

  uploadFiles(): void {
    this.isLoadingForm = true;
    this.errorMessage = '';
    this.successMessage = '';
    const uploads: Observable<any>[] = [];
    let mainOneIndex: number;
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        uploads.push(this.upload(i, this.selectedFiles[i]));
        if(this.isFileMain(i)) {
          mainOneIndex = i;
        }
      }
    }
    forkJoin(uploads).subscribe(res => {
      this.isLoadingForm = false;
      res.forEach((r, i) => {
        if(this.editedProduct?.allPictures) {
          this.editedProduct?.allPictures?.push(r.body);
        } else {
          this.editedProduct!.allPictures = [r.body];
        }
        if(mainOneIndex === i) {
          this.editedProduct!.mainPicture = r.body;
        }
        this.currentMode = 'edit';
        this.successMessage = 'Dodano nowe fotki';
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

  get allPictures(): PictureMetadata[] {
    return this.editedProduct?.allPictures ?? [];
  }

  markAsMain(pic: PictureMetadata) {
    this.isLoadingForm = true;
    this.productService.pictureMarkAsMain(pic.id).subscribe(() => {
      this.editedProduct!.mainPicture = pic;
    });
    this.isLoadingForm = false;
  }

  handleRemove(pic: PictureMetadata) {
    this.isLoadingForm = true;
    this.productService.pictureRemoval(pic.id).subscribe(() => {
      if(this.editedProduct!.mainPicture?.id === pic.id) {
        this.editedProduct!.mainPicture = undefined;
      }
      this.editedProduct!.allPictures = this.editedProduct!.allPictures?.filter(p => p.id !== pic.id);
      this.isLoadingForm = false;
    });
  }

  handleRotate(pic: PictureMetadata) {
    this.isLoadingForm = true;
    this.productService.pictureRotation(pic.id).subscribe(newMeta => {
      if(this.editedProduct!.mainPicture?.id === newMeta.id) {
        this.editedProduct!.mainPicture = newMeta;
      }
      const oldMeta = this.editedProduct!.allPictures?.find(p => p.id === newMeta.id);
      if(oldMeta) {
        oldMeta.pictureId = newMeta.pictureId;
        oldMeta.pictureThumbnailId = newMeta.pictureThumbnailId;
        oldMeta.contentType = newMeta.contentType;
      }
      this.isLoadingForm = false;
    });
  }
}
