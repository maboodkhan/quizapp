import { Component, OnInit, Input } from '@angular/core';
import {QuizQuesAnsComponent} from './quiz-ques-ans.component';
import { environment } from 'src/environments/environment';
import {MathContent} from '../../math/math-content';

@Component({
  selector: 'app-quiz-question',
  template: `
  ( {{quesLevel}} ) &nbsp;&nbsp; ( <b>Lesson</b> - {{lesson_name}} &nbsp;>> &nbsp; {{topic_name}} )
  <!-- <p [innerHTML]="quesVal"> </p> -->
  <div [appMath]="mathMl"></div>
  <p *ngFor="let ansoption of question.syllabus_questions.ansoptions">  
    <app-quiz-ques-ans [answerOption]="ansoption"></app-quiz-ques-ans>
  </p>
    `,
  styles: []
})
export class QuizQuestionComponent implements OnInit {

  @Input() question;
  private imgUrl = environment.imgUrl;

  quesVal: string;
  quesLevel: string;
  lesson_name: String;
  topic_name: String;

  constructor() { }

  mathMl: MathContent = {
    mathml: ''
  };

  ngOnInit() {
    this.quesVal = this.question.syllabus_questions.question;
    this.topic_name = this.question.question_topic.topic_name;
    this.lesson_name = this.question.question_topic.lesson_topics.lesson_name;
    let str1 = this.quesVal.indexOf('annotation');
    do{
      if(this.quesVal.indexOf('/annotation') > -1) {
        const str3 = '/annotation';
        const str2 = this.quesVal.indexOf('/annotation') + str3.length + 2;
        const res = this.quesVal.substring(str1, str2);
        this.quesVal = this.quesVal.replace(res, '');
      }
      str1 = this.quesVal.indexOf('annotation');
    } while (str1 !== -1);
    this.quesVal = this.quesVal.replace(/msub1=/g, 'msub');
    this.quesVal = this.quesVal.replace(/style=/g, 'style1=');
    this.quesVal = this.quesVal.replace(/&lt;b&gt;/g, '&lt;b1&gt;');
    this.quesVal = this.quesVal.replace(/&lt;\/b&gt;/g, '&lt;\/b1&gt;');
    this.quesVal = this.quesVal.replace(/&nbsp;&nbsp;/g, '');
    this.quesVal = this.quesVal.replace(/&lt;t;/g, '');
    this.quesVal = this.quesVal.replace(/&lt;strong&gt;/g, '');
    this.quesVal = this.quesVal.replace(/&lt;\/strong&gt;/g, '');
    this.quesVal = this.toHTML(this.quesVal);
    this.quesVal = this.quesVal.replace(/src="/g, `src="${this.imgUrl}/`);
    this.quesLevel = this.question.syllabus_questions.question_level.level_name;
    this.mathMl.mathml = this.quesVal;
  }

  toHTML(input) : any {
    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
  }
}
