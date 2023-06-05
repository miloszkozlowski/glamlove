import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  items: {originUrl: string, thumbnailUrl: string}[];
  currentSlideIndex = 0;

  ngOnInit() {
    this.items = [
      {originUrl: 'http://192.168.0.68:8080/img/d789005c-43b6-40c8-8487-903df983be95', thumbnailUrl: 'http://192.168.0.68:8080/img/d789005c-43b6-40c8-8487-903df983be95'},
      {originUrl: 'http://192.168.0.68:8080/img/d789005c-43b6-40c8-8487-903df983be95', thumbnailUrl: 'http://192.168.0.68:8080/img/d789005c-43b6-40c8-8487-903df983be95'}
    ];
  }
}
