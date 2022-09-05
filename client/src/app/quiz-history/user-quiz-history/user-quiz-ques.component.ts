import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MathContent } from 'src/app/math/math-content';

@Component({
  selector: 'app-user-quiz-ques',
  template: `
  <!-- <p [innerHTML]='quesVal'> </p> -->
  <span style="padding-left:15px">
    <button mat-mini-fab [ngClass]="{'correct':attemptedAnsStatusCorrect,'incorrect':attemptedAnsStatusInCorrect}">
      <mat-icon>{{attemptedAnsStatusCorrect ? 'done' : 'clear'}}</mat-icon>
    </button>
  </span>
  <div [appMath]="mathMl"></div>
  <p *ngFor='let ansoption of question.attempted_quiz_question.ansoptions'>
    <app-user-quiz-ques-ans [answerOption]='ansoption'></app-user-quiz-ques-ans>
  </p>
  <app-user-quiz-ans-attempted [answerOption]='attemptAns'></app-user-quiz-ans-attempted>
   <!-- <p [innerHTML]='attemptAns'> </p> -->

  <b>Right Answer:</b> <p *ngFor='let ansoption of question.attempted_quiz_question.rightansoption'>
  <app-user-quiz-ques-ans [answerOption]='ansoption.right_ans'></app-user-quiz-ques-ans>
</p>
<hr />
  `,
  styles: [`
    .correct {
      background-color: green;
    }
  .incorrect {
    background-color: red;
  }
`]
})
export class UserQuizQuesComponent implements OnInit {

  @Input() question;
  private imgUrl = environment.imgUrl;

  quesVal: string;
  quesLevel: string;
  attemptAns: any;
  rightAns: string;
  mathMl: MathContent = {
    mathml: ''
  };
  attemptedAnsStatusCorrect: boolean;
  attemptedAnsStatusInCorrect: boolean;
  
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
    this.quesVal = this.quesVal.replace(/style=/g, 'style1=');
    this.quesVal = this.quesVal.replace(/&lt;b&gt;/g, '&lt;b1&gt;');
    this.quesVal = this.quesVal.replace(/&lt;\/b&gt;/g, '&lt;\/b1&gt;');
    this.quesVal = this.quesVal.replace(/&nbsp;&nbsp;/g, '');
    this.quesVal = this.quesVal.replace(/ &lt;t;/g, '');
    this.quesVal = this.quesVal.replace(/&lt;strong&gt;/g, '');
    this.quesVal = this.quesVal.replace(/&lt;\/strong&gt;/g, '');
    this.quesVal = this.toHTML(this.quesVal);    
    this.quesVal = this.quesVal.replace(/src="/g, `src="${this.imgUrl}/`);
    this.mathMl.mathml = this.quesVal;

    this.attemptAns = this.question.attempted_quiz_answer;
    if (this.attemptAns === undefined) {
      this.attemptAns = {answer: 'Skipped'};
    }

    if (this.question.attempted_quiz_answer.id === this.question.attempted_quiz_question.rightansoption[0].right_ans.id) {
      this.attemptedAnsStatusCorrect = true;
      this.attemptedAnsStatusInCorrect = false;
    } else {
      this.attemptedAnsStatusCorrect = false;
      this.attemptedAnsStatusInCorrect = true;
    }
  }

  toHTML(input): any {
    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
  }


}
