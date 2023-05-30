import {Component, OnInit} from '@angular/core';
import {MarketingContentModel, MarketingService} from "../service/marketing.service";

@Component({
  selector: 'app-top-section',
  templateUrl: './top-section.component.html',
  styleUrls: ['./top-section.component.scss']
})
export class TopSectionComponent implements OnInit {

  currentMessage: MarketingContentModel | undefined;

  constructor(private marketingService: MarketingService) {}

  ngOnInit() {
    this.marketingService.getTopBarMsg().subscribe(msg => {
      if(msg.length === 0) {
        return;
      }
      this.currentMessage = msg[0];
    });
  }
}
