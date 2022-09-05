import { Component, OnInit, ElementRef, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../question.service';
import { FormGroup, Validators, FormControlName, FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { MathContent } from 'src/app/math/math-content';
import { Observable } from 'rxjs';
import { GenericValidator } from 'src/app/shared';
// import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MatSnackBar } from '@angular/material';
import * as ClassicEditor from '../../../assets/js/ck-editor-mathtype/ckeditor.js';
import stripHtml from './../../../../node_modules/string-strip-html';
import { isArray } from 'lodash';
import { ChangeEvent } from "@ckeditor/ckeditor5-angular/ckeditor.component";

@Component({
  selector: 'app-ques-add-edit',
  templateUrl: './ques-add-edit.component.html',
  styleUrls: ['./ques-add-edit.component.css']
})
export class QuesAddEditComponent implements OnInit {

  private imgUrl = environment.imgUrl;
  public Editor = ClassicEditor;
  // showQuestion;
  currentUser: any;
  userId: number;
  sub: any;
  quesVal: any;
  questionForm: FormGroup;
  optionArr: any;
  queData: any;
  ansOption = [];
  levels = [];
  syllabus_question: any;
  topic_name: string;
  lesson_name: string;
  subject_name: string;
  class_name: string;
  board_name: string;
  heading: string;
  board_id: number;
  class_id: number;
  section_id: number;
  subject_id: number;
  lesson_id: number;
  topic_id: number;
  rightansoption: any;
  qc_done: any = 1;
  issueVal = 0;
  showStatus: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder) { 
     }


  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.userId = this.currentUser.id;
    }
    this.sub = this.route.params.subscribe(params => {
      const question_id = +params['id'];
      if (question_id) {
        this.heading = 'Update'
        this.showStatus = true;
        this.getQuestion(question_id);
      }else {
        this.heading = 'Add'
        this.showStatus = false;
        this.addQuestion();
      }
      this.questionService.getLevels().subscribe((result: any) => {
        this.levels = result.data;
      });
    });

    this.route.queryParams.subscribe(
      params => {     
          if(params.ques_issue){         
            this.issueVal = +params.ques_issue;  
          }
      }
    );

    this.questionForm = this.fb.group({
      question: ['', [Validators.required]],
      marks: ['', [Validators.required]],
      level_id: ['', [Validators.required]],
      solution: ['', ''],
      queStatus: ['', ''],
      question_type: ['', [Validators.required]],
      remarks: ['', '']
    });
  }

  toHTML(input): any {
    return new DOMParser().parseFromString(input, 'text/html').documentElement.textContent;
  }

  decodeEntities(str) {
    // this prevents any overhead from creating the object each time
    const element = document.createElement('div');
    if (str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^''>]|'[^']*'|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }
    str = str.replace(/src="/g, `src="`);
    return str;
  }


  getQuestion(question_id: any): void {
    this.questionService.getQuestion(question_id).subscribe((result: any) => {
      this.queData = result.data;
      this.syllabus_question = this.queData.syllabus_question[0];
      this.rightansoption = this.queData.rightansoption;
      this.board_name = this.syllabus_question.question_topic.lesson_topics.subject_lessons.class_subjects.board_classes.board_name;
      this.class_name = this.syllabus_question.question_topic.lesson_topics.subject_lessons.class_subjects.class_name;
      this.subject_name = this.syllabus_question.question_topic.lesson_topics.subject_lessons.subject_name;
      this.lesson_name = this.syllabus_question.question_topic.lesson_topics.lesson_name;
      this.topic_name = this.syllabus_question.question_topic.topic_name;
      this.qc_done = this.queData.qc_done;
      // if(this.qc_done == 0){}
      let imgValUrl = `src="${this.imgUrl}/`;
      const stripOption = {
        ignoreTags: ['xml'],
        onlyStripTags: ['span'],
        stripTogetherWithTheirContents: ['script'],
        skipHtmlDecoding: false,
        returnRangesOnly: false,
        trimOnlySpaces: false,
        dumpLinkHrefsNearby: {
          enabled: false,
          putOnNewLine: false,
          wrapHeads: '',
          wrapTails: ''
        }
      };
      let question = this.decodeEntities(this.queData.question);
      question = question.replace(/\r?\n|\r/g, '');
      question = question.replace(/>\s+</g, '><');
      let qstr1 = question.indexOf('annotation');
      do {
        if (question.indexOf('/annotation') > -1) {
          const qstr3 = '/annotation';
          const qstr2 = question.indexOf('/annotation') + qstr3.length + 2;
          const qres = question.substring(qstr1, qstr2);
          question = question.replace(qres, '');
        }
        qstr1 = question.indexOf('annotation');
      }while (qstr1 !== -1);
      question = stripHtml(question, stripOption);
      let solution = "";
      if(this.queData.solution){
        solution = this.decodeEntities(this.queData.solution);
        solution = solution.replace(/\r?\n|\r/g, '');
        solution = solution.replace(/>\s+</g, '><');
        let slstr1 = solution.indexOf('annotation');
        do {
          if (solution.indexOf('/annotation') > -1) {
            const slstr3 = '/annotation';
            const slstr2 = solution.indexOf('/annotation') + slstr3.length + 2;
            const slres = solution.substring(slstr1, slstr2);
            solution = solution.replace(slres, '');
          }
          slstr1 = solution.indexOf('annotation');
        }while (slstr1 !== -1);
        solution = stripHtml(solution, stripOption);
        solution = solution.replace(/src="/g, imgValUrl);
      }
      
      this.questionForm.patchValue({
        question: question.replace(/src="/g, imgValUrl),
        marks: this.queData.marks,
        level_id: this.queData.level_id,
        solution: solution,
        queStatus: this.queData.status,
        question_type: this.queData.question_type,
      });
      let anstr1;
      this.queData.ansoptions.map((ansVal, index) => {
        let answer = this.decodeEntities(ansVal.answer);
        answer = answer.replace(/\r?\n|\r/g, '');
        answer = answer.replace(/>\s+</g, '><');
        anstr1 = answer.indexOf('annotation');
        do {
          if (answer.indexOf('/annotation') > -1) {
            const anstr3 = '/annotation';
            const anstr2 = answer.indexOf('/annotation') + anstr3.length + 2;
            const anres = answer.substring(anstr1, anstr2);
            answer = answer.replace(anres, '');
          }
          anstr1 = answer.indexOf('annotation', stripOption);
        }while (anstr1 !== -1);
        answer = stripHtml(answer, stripOption);
        this.queData.ansoptions[index].answer = answer.replace(/src="/g, imgValUrl);
      });
      this.ansOption = this.queData.ansoptions;
      // console.log(this.ansOption);
      this.checkCorrectAns();
    });
  }

  getStatus(status, indexVal){
    this.ansOption[indexVal].status = status
    // this.ansOption.map((arrObj, index) => {
    //   if (arrObj.id == answer_id) {
    //     this.ansOption[index].status = status;
    //   }
    // });
  }

  onBlurAnswer(answer, indexVal){
    this.ansOption[indexVal].answer = answer
    // this.ansOption.map((arrObj, index) => {
    //   if(arrObj.id == answer_id){
    //     this.ansOption[index].answer = answer;
    //   }
    // });
  }

  public onBlurAnswerEditor({ editor }: ChangeEvent, indexVal) {
    const ansdata = editor.getData();
    this.ansOption[indexVal].answer=ansdata;
   }

  onBlurAnswer_Order(answer_Order, indexVal){
    this.ansOption[indexVal].answer_order = answer_Order
    // this.ansOption.map((arrObj, index) => {
    //   if(arrObj.id == answer_id){
    //     this.ansOption[index].answer_order = parseInt(answer_Order);
    //   }
    // });
  }


  editQuestion() {

    let expression = new RegExp(`src="${this.imgUrl}/`, "g");

    this.ansOption.map((ansVal, index) => {
      this.ansOption[index].answer = ansVal.answer.replace(expression,`src="`);
    });
    // if(this.qc_done == 1){
    //   this.qc_done = 2;
    // }else{
    //   this.qc_done = 0;
    // }

    if(this.queData){
      let obj = {
        question_id: this.queData.id,
        level_id: this.questionForm.value.level_id,
        question: this.questionForm.value.question.replace(expression,`src="`),
        marks: this.questionForm.value.marks,
        solution: this.questionForm.value.solution.replace(expression,`src="`),
        status: this.questionForm.value.queStatus,
        // status: 0,
        question_type: this.questionForm.value.question_type,
        qc_done: this.qc_done,
        ansoptions: this.ansOption,
        remarks: this.questionForm.value.remarks,
        created_by: this.userId
      };
  
      // console.log(obj);
      this.questionService.updateQuestion(obj).subscribe((result: any) => {
        if(result.status){
          this.openSnackBar('Question update successfully. ', 'Close');
          if(this.issueVal === 1) {
            this.router.navigate(['/questionIssues'], {queryParamsHandling: 'preserve'})
          } else {
            this.router.navigate(['/question'], {queryParamsHandling: 'preserve'});
          }
        }
      });
    } else{
      let obj = {
        syllabus_id: this.topic_id,
        level_id: this.questionForm.value.level_id,
        question: this.questionForm.value.question.replace(expression,`src="`),
        marks: this.questionForm.value.marks,
        solution: this.questionForm.value.solution.replace(expression,`src="`),
        // status: this.questionForm.value.queStatus,
        status: 2,
        question_type: this.questionForm.value.question_type,
        qc_done: 0,
        ansoptions: this.ansOption,
        remarks: this.questionForm.value.remarks,
        created_by: this.userId
      };
  
      // console.log(obj);
      this.questionService.addQuestion(obj).subscribe((result: any) => {
        if(result.status){
          this.openSnackBar('Question added successfully. ', 'Close');
          this.router.navigate(['/question'], {queryParamsHandling: 'preserve'})
        }
      });
    }
    
  }


  addQuestion(){
    this.route.queryParams.subscribe((paramsData: any) => {
      let topicArrays;
      if (Object.keys(paramsData).length != 0) {
        this.board_id = parseInt(paramsData.board_id);
        this.class_id = parseInt(paramsData.class_id);
        this.subject_id = parseInt(paramsData.subject_id);
        this.lesson_id = parseInt(paramsData.lesson_id);
        if (isArray(paramsData.topic_id)) {
          topicArrays = paramsData.topic_id.map(Number);
          if(topicArrays[0] == 0){ this.topic_id = topicArrays[1]}
        } else {
          this.topic_id = parseInt(paramsData.topic_id);
        }
      }
      // console.log(topicArrays);
      this.questionService.getBoardById(this.board_id)
      .subscribe((boardDetail: any) => {
        this.board_name = boardDetail.data.board_name;
      })

      this.questionService.getClassById(this.class_id)
      .subscribe((classDetail: any) => {
        this.class_name = classDetail.data.class_name;
      })

      this.questionService.getSubjectById(this.subject_id)
      .subscribe((subjectDetail: any) => {
        this.subject_name = subjectDetail.data.subject_name;
      })

      this.questionService.getLessonById(this.lesson_id)
      .subscribe((lessonDetail: any) => {
        this.lesson_name = lessonDetail.data.lesson_name;
      })

      this.questionService.getTopicById(this.topic_id)
      .subscribe((topicDetail: any) => {
        this.topic_name = topicDetail.data.topic_name;
      })
    });
  }


  addOption(){
    let ansObj = {
      answer: '',
      question_id: 0,
      status: 1,
      answer_order: 0,
      id: 0,
      correctAns: false
    }
    this.ansOption.push(ansObj);
  }

  delOptn(index){
    var result = confirm("Are you sure, you want to delete the option?");
    if (result) {
      // console.log(this.ansOption[index]);
      if(this.ansOption[index].id != 0){
        let obj = {id: this.ansOption[index].id}
        this.questionService.deleteOption(obj).subscribe(deleteResult => {
        })
      }
      this.ansOption.splice(index,1);
    }
  }

  checkCorrectAns(){
    this.ansOption.forEach((ansObj, index) => {
      let flag = 0;
      this.rightansoption.forEach((rightAnsObj) => {
        if(ansObj.id == rightAnsObj.answer_id && rightAnsObj.status == 1){
          flag = 1;
          this.ansOption[index].correctAns = true;
        }
      });
      if(flag == 0){
        this.ansOption[index].correctAns = false;
      }
    })
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
        duration: 1500,
    });
  }

  onAnsChange(index){
    // console.log(index);
    this.ansOption[index].correctAns = !this.ansOption[index].correctAns;
    // console.log("under development");
  }

  onQcDoneChange(qc_Value){
    if(qc_Value.checked){
      this.qc_done = 2;
    }else{
      this.qc_done = 0;
    }
  }

  cancelBtn(){
    if(this.issueVal === 1) {
      this.router.navigate(['/questionIssues'], {queryParamsHandling: 'preserve'})
    } else {
      this.router.navigate(['/question'], {queryParamsHandling: 'preserve'});
    }
  }
}
