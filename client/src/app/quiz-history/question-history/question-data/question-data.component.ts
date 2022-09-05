import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-question-data',
  templateUrl: './question-data.component.html',
  styleUrls: ['./question-data.component.css']
})
export class QuestionDataComponent implements OnInit {

  @Input() question;

  private imgUrl = environment.imgUrl;
  quesVal: string;
  quesLevel: string;
  attemptAns: string;
  rightAns: string;
  private apiUrl = environment.apiUrl;

  constructor() { }

  ngOnInit() {
    this.quesVal = this.question.attempted_quiz_question.question;

    let str1 = this.quesVal.indexOf('annotation');
    do{
      if(this.quesVal.indexOf('/annotation') > -1) {
        const str3 = '/annotation';
        const str2 = this.quesVal.indexOf('/annotation') + str3.length + 2;
        const res = this.quesVal.substring(str1, str2);
        this.quesVal = this.quesVal.replace(res, '');
      }
      str1 = this.quesVal.indexOf('annotation');
    }while (str1 !== -1);

    this.quesVal = this.toHTML(this.quesVal);
    this.quesVal = this.quesVal.replace('src="', `src="${this.imgUrl}/`);

    this.attemptAns = this.question.attempted_quiz_answer.answer;
    let str4 = this.attemptAns.indexOf('annotation');
    do {
      const str5 = '/annotation';
      if(this.attemptAns.indexOf('/annotation') > -1) {
        const str6 = this.attemptAns.indexOf('/annotation') + str5.length + 2;
        const res1 = this.attemptAns.substring(str4, str6);
        this.attemptAns = this.attemptAns.replace(res1, '');
      }
      str4 = this.attemptAns.indexOf('annotation');
    } while (str4 !== -1);

    

    this.attemptAns = this.toHTML(this.attemptAns);
    this.attemptAns = this.attemptAns.replace('src="', 'src="'+this.apiUrl+'/');

  }

  toHTML(input) : any {
    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
  }

}
