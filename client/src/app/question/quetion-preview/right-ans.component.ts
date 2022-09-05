import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MathContent } from 'src/app/math/math-content';

@Component({
  selector: 'app-right-ans',
  template:  `
  <!-- <p [innerHTML]="optionVal"> </p> -->
  <div [appMath]="mathMl"></div>
  `,
  styles: []
})
export class RightAnsComponent implements OnInit {

  @Input() answerOption;
  private imgUrl = environment.imgUrl;

  optionVal: string;
  mathMl: MathContent = {
    mathml: ''
  };
  
  constructor() { }

  ngOnInit() {
    let str4 = this.answerOption.answer.indexOf('annotation');
    do {
      const str5 = '/annotation';
      if(this.answerOption.answer.indexOf('/annotation') > -1) {
        const str6 = this.answerOption.answer.indexOf('/annotation') + str5.length + 2;
        const res1 = this.answerOption.answer.substring(str4, str6);
        this.answerOption.answer = this.answerOption.answer.replace(res1, '');
      }
      str4 = this.answerOption.answer.indexOf('annotation');
    } while (str4 !== -1);
    this.answerOption.answer = this.answerOption.answer.replace(/style=/g, 'style1=');
    this.answerOption.answer = this.answerOption.answer.replace(/&lt;b&gt;/g, '&lt;b1&gt;');
    this.answerOption.answer = this.answerOption.answer.replace(/&lt;\/b&gt;/g, '&lt;\/b1&gt;');
    this.answerOption.answer = this.answerOption.answer.replace(/&nbsp;&nbsp;/g, '');
    this.answerOption.answer = this.answerOption.answer.replace(/&lt;t;/g, '');
    this.answerOption.answer = this.answerOption.answer.replace(/&lt;strong&gt;/g, '');
    this.answerOption.answer = this.answerOption.answer.replace(/&lt;\/strong&gt;/g, '');

    this.optionVal = this.toHTML(this.answerOption.answer);
    //this.optionVal = this.toHTML( this.optionVal);
    this.optionVal = this.optionVal.replace(/src="/g, `src="${this.imgUrl}/`);
    this.mathMl.mathml = this.optionVal;
  }

  toHTML(input): any {
    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
  }

}
