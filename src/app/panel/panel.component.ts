import {Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html'
})
export class PanelComponent implements OnDestroy {

  @ViewChild('.modal-backdrop') backdrop?: ElementRef;

  ngOnDestroy() {
    console.log('NISZCZENIE BACK DROP', this.backdrop);
    this.backdrop?.nativeElement.remove();
  }
}
