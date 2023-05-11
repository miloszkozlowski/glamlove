import {Injectable} from "@angular/core";

export interface PictureMetadata {
  id: string;
  contentType: string;
  pictureId: string;
  pictureThumbnailId: string
}

@Injectable({providedIn: "root"})
export class PictureService {
}
