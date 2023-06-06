import {Component, OnDestroy, OnInit} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {SizeModel, SizeService} from "../service/size.service";



@Component({
  selector: 'app-panel-sizes-colors',
  templateUrl: './panel-sizes-colors.component.html',
  styleUrls: ['./panel-sizes-colors.component.scss']
})
export class PanelSizesColorsComponent implements OnInit, OnDestroy {
  sizes: string[] = [];

  loadedSizes: SizeModel[] = [];
  timer: any;

  constructor(private sizeService: SizeService) {}

  ngOnInit() {
    this.sizeService.getAllActive().subscribe(sizes => {
      this.loadedSizes = sizes;
      this.sizes = sizes.map(s => s.sizeValue);
    });
  }

  ngOnDestroy() {
    if(!!this.timer) {
      clearTimeout(this.timer);
      this.saveSizeOrder();
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.loadedSizes, event.previousIndex, event.currentIndex);
    this.saveSizeOrder();
  }

  private saveSizeOrder() {
    for(let x = 0; x < this.loadedSizes.length; x++) {
      const size = this.loadedSizes[x];
      size.order = x + 1;
    }
    if(!!this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.sizeService.updateSizeOrder(this.loadedSizes).subscribe(_ => {});
    }, 3000);
  }
}
