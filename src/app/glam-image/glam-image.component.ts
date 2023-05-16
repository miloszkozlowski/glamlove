import {Component, Input} from '@angular/core';
import {PictureMetadata} from "../service/picture-service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-glam-image',
  templateUrl: './glam-image.component.html'
})
export class GlamImageComponent {

  isLoaded: boolean = false;
  @Input('picture') picture: PictureMetadata;
  @Input('thumbnail') thumbnail: boolean = false;
  @Input('card-image') cardImage: boolean = false;

  constructor() {
  }

  get imgUrl() {
    if(!!this.picture) {
      return environment.apiUrl + 'img/' + (this.thumbnail ? this.picture.pictureThumbnailId : this.picture.pictureId);
    } else {
      return null;
    }
  }

  get isPlaceHolder(): boolean {
    return this.picture && !this.isLoaded;
  }
}
