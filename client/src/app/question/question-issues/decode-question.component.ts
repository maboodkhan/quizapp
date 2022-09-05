import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MathContent } from 'src/app/math/math-content';

@Component({
  selector: 'app-decode-question',
  template:` <div [appMath]="mathMl"></div> `,
  styles: []
})
export class DecodeQuestionComponent implements OnInit {

  @Input() input;
  private imgUrl = environment.imgUrl;

  quesVal: string;
  // quesLevel: string;

  constructor() { }

  mathMl: MathContent = {
    mathml: ''
  };

  ngOnInit() {
    // console.log(this.input);
    this.quesVal = this.input.questions.question;
    let str1 = this.quesVal.indexOf('annotation');
    do{
      if(this.quesVal.indexOf('/annotation') > -1) {
        const str3 = '/annotation';
        const str2 = this.quesVal.indexOf('/annotation') + str3.length + 2;
        const res = this.quesVal.substring(str1, str2);
        this.quesVal = this.quesVal.replace(res,"");
      }
      str1 = this.quesVal.indexOf('annotation');
    } while (str1 !== -1);
    this.quesVal = this.quesVal.replace(/msub1=/g, 'msub');
    this.quesVal = this.quesVal.replace(/style=/g, 'style1=');
    this.quesVal = this.quesVal.replace(/&lt;b&gt;/g, '&lt;b1&gt;');
    this.quesVal = this.quesVal.replace(/&lt;\/b&gt;/g, '&lt;\/b1&gt;');
    this.quesVal = this.quesVal.replace(/&nbsp;&nbsp;/g, '');
    this.quesVal = this.quesVal.replace(/&lt;t;/g, '');
    this.quesVal = this.toHTML(this.quesVal);    
    this.quesVal = this.quesVal.replace(/src="/g, `src="${this.imgUrl}/`);
    // this.quesLevel = this.question.syllabus_questions.question_level.level_name;
    this.mathMl.mathml = this.quesVal;
  }

  toHTML(input) : any {
    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
  }
}
