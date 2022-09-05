import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-content-youtube',
  template: `
  <div class="responsiveRapper">
    <iframe [src]="transform()" frameborder="0" width="560" height="315"></iframe>
    <!--<object width="425" height="349">
      <param name="movie" [value]="url" />
      <param name="allowFullScreen" value="true" />
      <embed [src]="url" type="application/x-shockwave-flash" allowfullscreen="true" width="425" height="349" />
      </object>-->
  </div>
  `,
  styles: [
    `iframe {
      display: block;
      border: none;
      scrolling:no;
    }
    .responsiveRapper {
      overflow:hidden;
      padding-bottom:56.25%;
      padding-top:30px;
      height:0;
      position:relative;
    }
    .responsiveRapper iframe,
    .responsiveRapper object,
    .responsiveRapper embed {
      top:0;
      left:0px;
      width:100%;
      height:500px;
      position:absolute;
      z-index:1000;
    }`
  ]
})
export class ContentYoutubeComponent implements OnInit {

  @Input() url;
  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

  transform() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

}
