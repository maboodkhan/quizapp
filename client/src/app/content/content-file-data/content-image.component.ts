import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-content-image',
  template: ` <iframe [src]="transform()"></iframe> `,
  styles: [
    `iframe {
      display: block;
      border: none;
      height: 100vh;
      width: 100%;
      scrolling:no;
  }`
  ]
})
export class ContentImageComponent implements OnInit {

  @Input() url;
  constructor(
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }
  transform() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
     }

}
