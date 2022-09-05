import { Component, OnInit, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormControlName, FormBuilder, FormArray } from '@angular/forms';
import { QuestionService } from './question.service';
import { MatOption, MatSnackBar, MatTableDataSource, MatPaginator, MatDialog, MatDialogConfig } from '@angular/material';
import { environment } from 'src/environments/environment';
import { GenericValidator } from '../shared';
import { Subscription, Observable, from } from 'rxjs';
import { Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
// import { QuizSetService } from '../quiz-set/quiz-set.service';
import { QuizQuestionComponent } from '../quiz-set/quiz-set-edit/quiz-question.component';
import { isArray } from 'util';
import { isEmpty } from 'rxjs/operators';
import { QuestionImportComponent } from './question-import/question-import.component';
import { QuestionAssignComponent } from './question-assign/question-assign.component';
import { QuetionPreviewComponent } from './quetion-preview/quetion-preview.component';
import { BothPreviewComponent } from './both-preview/both-preview.component';
import { QuestionRemarksComponent } from './question-remarks/question-remarks.component';
import { QueAddRemarksComponent } from './que-add-remarks/que-add-remarks.component';
import { QuestionLogsComponent } from './question-logs/question-logs.component';
import { MoveQuestionComponent } from './move-question/move-question.component';
import { QuestionExportComponent } from './question-export/question-export.component';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.css']
})

export class QuestionComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('ref') ref;
  @ViewChild('allSelectedLessons') private allSelectedLessons: MatOption;
  @ViewChild('allSelectedTopics') private allSelectedTopics: MatOption;
  private apiUrl = environment.apiUrl;
  displayMessage: { [key: string]: string } = {};
  displayedColumns = ['S_No', 'question_id', 'setName', 'assignedTo', 'assignedBy', 'status', 'id', 'assign'];
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  private sub: Subscription;
  quizForm: FormGroup;
  quizData: any;
  pageTitle = 'Add Quiz Set';
  currentUser: any;
  userId: number;
  token: string;
  errorMessage: any = {};
  boards: any;
  classes: any;
  subjects: any;
  lessons: any;
  topics: any;
  questionData = [];
  duration: any;
  classIdArr = [];
  subjectIdArr = [];
  lessonIdArr = [];
  topicIdArr = [];
  quesIdArr = [];
  sections: any;
  sectionIdArr = [];
  quesArray: any;
  userType: string;
  type_order: number;
  dataSource: any;
  selectData = {
    board_id: 0,
    class_id: [],
    section_id: [],
    subject_id: [],
    lesson_id: [],
    topic_id: [],
    qc_done: 0
  };
  num_ques: number = 0;

  topicId: any;
  qc_done: any;
  topicArr: any;
  selectedAll:any;
  isSelected:any;
  quesSelection: any;
  selBoard: number;
  addQueCond: any;

  constructor(
    private http: Http,
    private quizSetService: QuestionService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog) {
    // Defines all of the validation messages for the form.
    // These could instead be retrieved from a file or database.
    this.validationMessages = {
      board_id: {
        required: 'Board is required.'
      },
      class_id: {
        required: 'Class is required.'
      },
      section_id: {
        required: 'Section is required.'
      },
      subject_id: {
        required: 'Subject is required.'
      },
      lesson_id: {
        required: 'Lesson is required.'
      },
      topic_id: {
        required: 'Topic is required.'
      },
      question_id: {
        required: 'Question is required.'
      },
      QC_Done: {
        require: 'QC Done is required'

      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
      this.userId = this.currentUser.id;
      this.token = this.currentUser.token;
      this.userType = this.currentUser.userType;
      this.type_order = this.currentUser.user_Type.type_order;
    }

    this.quizForm = this.fb.group({
      board_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      section_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      lesson_id: ['', [Validators.required]],
      topic_id: ['', [Validators.required]],
      QC_Done: ['', ''],
      questions: this.fb.array([])
    });

    this.quesArray = this.quizForm.controls.questions as FormArray;

    this.route.queryParams.subscribe((paramsData: any) => {

      if (Object.keys(paramsData).length != 0) {

        // console.log(paramsData);
        // this.selectData.board_id = parseInt(paramsData.board_id);
        // this.selectData.class_id = parseInt(paramsData.class_id);
        // this.selectData.subject_id = parseInt(paramsData.subject_id);
        // this.selectData.lesson_id = parseInt(paramsData.lesson_id);
        // this.selectData.topic_id = parseInt(paramsData.topic_id);
        if (isArray(paramsData.board_id)) {
          this.selectData.board_id = paramsData.board_id.map(Number);
        } else {
          this.selectData.board_id = parseInt(paramsData.board_id);
        }

        if (isArray(paramsData.class_id)) {
          this.selectData.class_id = paramsData.class_id.map(Number);
        } else {
          this.selectData.class_id[0] = parseInt(paramsData.class_id);
        }

        if (isArray(paramsData.subject_id)) {
          this.selectData.subject_id = paramsData.subject_id.map(Number);
        } else {
          this.selectData.subject_id[0] = parseInt(paramsData.subject_id);
        }

        if (isArray(paramsData.lesson_id)) {
          this.selectData.lesson_id = paramsData.lesson_id.map(Number);
        } else {
          this.selectData.lesson_id[0] = parseInt(paramsData.lesson_id);
        }

        if (isArray(paramsData.topic_id)) {
          this.selectData.topic_id = paramsData.topic_id.map(Number);
        } else {
          this.selectData.topic_id[0] = parseInt(paramsData.topic_id);
        }

        // console.log(this.selectData);

        this.changeBoard(this.selectData.board_id);
        this.changeClass(this.selectData.class_id);
        this.changeSubject(this.selectData.subject_id);
        this.changeLesson(this.selectData.lesson_id);
        this.getTopicQuestions(this.selectData.topic_id);
        this.getQcDone(paramsData.QC_Done);

        this.quizForm.patchValue({
          board_id: this.selectData.board_id,
          class_id: this.selectData.class_id,
          subject_id: this.selectData.subject_id,
          lesson_id: this.selectData.lesson_id,
          topic_id: this.selectData.topic_id
        });
        this.topicId = this.selectData.topic_id;
        this.qc_done = paramsData.QC_Done;
      } else {
        this.selBoard = this.selectData.board_id ? this.selectData.board_id : 1;

        this.quizForm.patchValue({
          board_id: this.selBoard
        });
        this.changeBoard(1);
      }
    });

    this.getBoards();
    this.getClassSections();
  }


  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.quizForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.quizForm);
    });
  }


  getBoards(nonAcademicVal = 0) {
    const paramsVal = { non_academic: nonAcademicVal };
    this.quizSetService.getBoards(paramsVal).subscribe((result: any) => {
      this.boards = result.data;
    });
  }

  getClassSections() {
    const paramsVal = {};
    this.quizSetService.getClassSections(paramsVal).subscribe((result: any) => {
      this.sections = result.data;
    });
  }

  changeBoard(strVal, defaultVal = 0) {
    const paramsVal = { board_id: strVal };
    if (defaultVal === 0) {
      this.classes = [];
      this.subjectIdArr = [];
      this.lessonIdArr = [];
      this.topicIdArr = [];
    }
    let sectionId = '';
    if (this.quizData) {
      sectionId = this.quizData.quiz_syllabus[0].section_id;
    }
    // Update the data on the form
    this.quizForm.patchValue({
      class_id: this.classIdArr,
      section_id: sectionId,
      subject_id: this.subjectIdArr,
      lesson_id: this.lessonIdArr,
      topic_id: this.topicIdArr,
      QC_Done: ""
    });
    this.quizSetService.getClasses(paramsVal).subscribe((result: any) => {
      this.classes = result.data;
    });
  }

  changeClass(strVal, defaultVal = 0) {
    const paramsVal = { class_id: [strVal] };
    if (defaultVal === 0) {
      this.subjectIdArr = [];
      this.lessonIdArr = [];
      this.topicIdArr = [];
      // Update the data on the form
      this.quizForm.patchValue({
        subject_id: this.subjectIdArr,
        lesson_id: this.lessonIdArr,
        topic_id: this.topicIdArr,
        QC_Done: ""
      });
    }

    this.quizSetService.getSubjects(paramsVal).subscribe((result: any) => {
      this.subjects = result.data;
    });
  }

  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    // if (defaultVal === 0) {
      this.lessonIdArr = [];
      this.topicIdArr = [];
      // Update the data on the form
      this.quizForm.patchValue({
        lesson_id: this.lessonIdArr,
        topic_id: this.topicIdArr,
        QC_Done: ""
      });
    // }
    this.quizSetService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessons = result.data;
      // if(this.lessons){
      //   if (this.lessonIdArr.length === this.lessons.length) {
      //     this.lessonIdArr.push(0);
      //   } 
      // }
    });
  }

  changeLesson(strVal, defaultVal = 0) {
    const paramsVal = { lesson_id: [strVal] };
    // if (defaultVal === 0) {
      this.topicIdArr = [];

      this.quizForm.patchValue({
        topic_id: this.topicIdArr,
        QC_Done: ""
      });
    // }
    this.quizSetService.getTopics(paramsVal).subscribe((result: any) => {
      this.topics = result.data;
      // if(this.topics) {
      //   if (this.topicIdArr.length === this.topics.length) {
      //     this.topicIdArr.push(0);
      //   }
      // }
    });
  }

  getTopicQuestions(strVal) {
    this.quizForm.patchValue({
      QC_Done: ""
    });
    this.topicArr = strVal;
    const paramsVal = { 
      syllabus_id: this.topicArr, 
      syllabus_type: 'Topic'
    };
    this.quesSelection = paramsVal;
    this.getPermission();
    this.getAllQuestions(paramsVal);
  }

  getQcDone(QcValue) {
    const paramsVal = {
      syllabus_id: this.topicArr, 
      syllabus_type: 'Topic', 
      qc_done: [QcValue] 
    };    
    this.quesSelection = paramsVal;
    this.getAllQuestions(paramsVal);
    this.getPermission();
  }

  getAllQuestions(paramsVal){
    this.quizSetService.getAllTopicQuestions(paramsVal).subscribe((result: any) => {
      if (result.data) {
        // console.log(result.data);
        this.questionData = [];
        let response = result.data;
        response.forEach(sq => {
          if(sq.syllabus_questions){
            this.questionData.push(sq);
          }
        });
        this.dataSource = new MatTableDataSource(this.questionData);
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  getPermission(){
    let obj = {
      user_id: this.userId,
      topic_id: this.topicArr
    }
    this.quizSetService.findPermission(obj).subscribe((data:any) => {
      this.addQueCond = data.status;
    })
  }


  selectAllTopics() {
    let topicVal = [0];
    if (this.allSelectedTopics.selected) {
      this.quizForm.controls.topic_id
        .patchValue([...this.topics.map(item => item.id), 0]);
      topicVal = this.quizForm.controls.topic_id.value;
    } else {
      this.quizForm.controls.topic_id.patchValue([]);
    }
    this.getTopicQuestions(topicVal);
  }

  selectAllLessons() {
    let lessonVal = [0];
    if (this.allSelectedLessons.selected) {
      this.quizForm.controls.lesson_id
        .patchValue([...this.lessons.map(item => item.id), 0]);
      lessonVal = this.quizForm.controls.lesson_id.value;
    } else {
      this.quizForm.controls.lesson_id.patchValue([]);
    }
    this.changeLesson(lessonVal);
  }

  tosslePerLesson() {
    if (this.allSelectedLessons.selected) {
      this.allSelectedLessons.deselect();
      return false;
    }
    if (this.quizForm.controls.lesson_id.value.length === this.lessons.length) {
      this.allSelectedLessons.select();
    }
  }

  tosslePerTopic() {
    if (this.allSelectedTopics.selected) {
      this.allSelectedTopics.deselect();
      return false;
    }
    if (this.quizForm.controls.topic_id.value.length === this.topics.length) {
      this.allSelectedTopics.select();
    }
  }

  // [routerLink]="['/questionEdit/', question.id]" [queryParams]="{questionFilters:customFilters | json }"

  editQue(queId) {
    // console
    this.router.navigate(['questionEdit/', `${queId}`], {
      queryParams: {
        board_id: this.quizForm.value.board_id,
        class_id: this.quizForm.value.class_id,
        section_id: this.quizForm.value.section_id,
        subject_id: this.quizForm.value.subject_id,
        lesson_id: this.quizForm.value.lesson_id,
        topic_id: this.quizForm.value.topic_id,
        QC_Done: this.quizForm.value.QC_Done
      }
    });
  }

  addQue() {
    this.router.navigate(['questionAdd'], {
      queryParams: {
        board_id: this.quizForm.value.board_id,
        class_id: this.quizForm.value.class_id,
        section_id: this.quizForm.value.section_id,
        subject_id: this.quizForm.value.subject_id,
        lesson_id: this.quizForm.value.lesson_id,
        topic_id: this.quizForm.value.topic_id,
        QC_Done: this.quizForm.value.QC_Done
      }
    });
  }

  importDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(QuestionImportComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => this.getTopicQuestions(this.topicId)
    );
  }

  exportDialog() {
  //   const dialogConfig = new MatDialogConfig();

  //   dialogConfig.disableClose = true;
  //   dialogConfig.autoFocus = true;
  //   dialogConfig.data = {
  //   syllabus_id: this.topicArr, 
  //     syllabus_type: 'Topic', 
  //     qc_done: this.quizForm.value.QC_Done
  // };

  //   const dialogRef = this.dialog.open(QuestionExportComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe(
  //     data => this.getTopicQuestions(this.topicId)
  //   );
    let obj = {
      syllabus_id: this.topicArr, 
      syllabus_type: 'Topic', 
      qc_done: this.quizForm.value.QC_Done
    }

    this.router.navigate(['questionExport'], {
      queryParams: {
        syllabus_id: this.topicArr, 
      syllabus_type: 'Topic', 
      qc_done: this.quizForm.value.QC_Done
      }
    });
  }

  assignQues() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = '600px';
    dialogConfig.height = '600px';
    // console.log(this.quesIdArr);
    for (var i = 0; i < this.questionData.length; i++) {
      if(this.questionData[i].isSelected===true){
          this.quesIdArr.push(this.questionData[i].id);
      }
    }
    if (this.quesIdArr.length < 1) {
      // console.log(this.quesIdArr.length);
      this.openSnackBar("Please select a question. ", "Close");
      return false;
    }

    dialogConfig.data = {
      question_id: this.quesIdArr
    };
    const dialogRef = this.dialog.open(QuestionAssignComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getTopicQuestions(this.topicId);
        let paramsVal = this.quesSelection;
        this.selectedAll = '';
        this.getAllQuestions(paramsVal);
        this.getPermission();
        // this.openSnackBar("Questions for QC have been assigned successfully. ", "Close");
      }
    );
  }

  previewQues(question_id){
    const dialogConfig = new MatDialogConfig();
    let questionIds = [question_id];
    dialogConfig.data = {
        question_id: questionIds
    };
    dialogConfig.autoFocus = true; 
    dialogConfig.height = '700px';
    const dialogRef = this.dialog.open(BothPreviewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getTopicQuestions(this.topicId);
        let paramsVal = this.quesSelection;
        this.selectedAll = '';
        this.getAllQuestions(paramsVal);
        this.getPermission();
        // this.openSnackBar("Questions for QC have been assigned successfully. ", "Close");
      }
    );
  }

  previewRemark(question_id){
    const dialogConfig = new MatDialogConfig();
    let questionIds = [question_id];
    dialogConfig.data = {
        question_id: questionIds
    };
    const dialogRef = this.dialog.open(QuestionRemarksComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getTopicQuestions(this.topicId);
        let paramsVal = this.quesSelection;
        this.selectedAll = '';
        this.getAllQuestions(paramsVal);
        this.getPermission();
        // this.openSnackBar("Questions for QC have been assigned successfully. ", "Close");
      }
    );
  }

  addRemarks(question_id){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
        question_id: question_id
    };
    dialogConfig.autoFocus = true; 
    dialogConfig.height = '700px';
    const dialogRef = this.dialog.open(QueAddRemarksComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getTopicQuestions(this.topicId);
        let paramsVal = this.quesSelection;
        this.selectedAll = '';
        this.getAllQuestions(paramsVal);
        this.getPermission();
      }
    );
  }


  onQuesChange(question: number, isChecked: any) {
    if (isChecked) {
      this.quesIdArr.push(question);
    } else {
      this.quesIdArr = this.quesIdArr.filter(function (item) {
        return item !== question
      });
    }
    this.checkIfAllSelected();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  selectAll() {    
    for (var i = 0; i < this.questionData.length; i++) {
      this.questionData[i].isSelected = this.selectedAll;
    }
    // console.log(this.questionData);
  }

  checkIfAllSelected() {
      this.selectedAll = this.questionData.every(function(item:any) {
          return item.isSelected == true;
      })
  }

  viewIssue(question_id){
    this.router.navigate(['viewIssue/', question_id], {
      queryParams: {
        board_id: this.quizForm.value.board_id,
        class_id: this.quizForm.value.class_id,
        section_id: this.quizForm.value.section_id,
        subject_id: this.quizForm.value.subject_id,
        lesson_id: this.quizForm.value.lesson_id,
        topic_id: this.quizForm.value.topic_id,
        QC_Done: this.quizForm.value.QC_Done,
        backTo: 0
      }
    });
  }

  infoLog(question_id){
    const dialogConfig = new MatDialogConfig();
    // let questionIds = [question_id];
    dialogConfig.data = {
        question_id: question_id
    };
    dialogConfig.autoFocus = true; 
    dialogConfig.height = '700px';
    dialogConfig.width = '800px';
    const dialogRef = this.dialog.open(QuestionLogsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        let paramsVal = this.quesSelection;
        this.selectedAll = '';
        this.getAllQuestions(paramsVal);
        this.getPermission();
      }
    );
  }

  moveQuestion(question_id){
    const dialogConfig = new MatDialogConfig();
    // let questionIds = [question_id];
    dialogConfig.data = {
        question_id: question_id
    };
    dialogConfig.autoFocus = true; 
    // dialogConfig.height = '700px';
    dialogConfig.width = '600px';
    const dialogRef = this.dialog.open(MoveQuestionComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        let paramsVal = this.quesSelection;
        this.selectedAll = '';
        this.getAllQuestions(paramsVal);
        this.getPermission();
      }
    );
  }
}
