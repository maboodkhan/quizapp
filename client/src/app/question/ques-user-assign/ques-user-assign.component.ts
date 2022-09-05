import { Component, OnInit, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators, FormControlName, FormBuilder, FormArray } from '@angular/forms';
import { QuestionService } from '../question.service';
import { MatOption, MatSnackBar, MatTableDataSource, MatPaginator, MatDialog, MatDialogConfig } from '@angular/material';
import { environment } from 'src/environments/environment';
import { GenericValidator } from '../../shared';
import { Subscription, Observable, from } from 'rxjs';
import { Http } from '@angular/http';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray } from 'util';
import { isEmpty } from 'rxjs/operators';
import { QuestionAssignComponent } from '../question-assign/question-assign.component';
import { QuetionPreviewComponent } from '../quetion-preview/quetion-preview.component';
import { PermissionAssignComponent } from '../permission-assign/permission-assign.component';
import { QuestionRemarksComponent } from '../question-remarks/question-remarks.component';
import { BothPreviewComponent } from '../both-preview/both-preview.component';
import { QueAddRemarksComponent } from '../que-add-remarks/que-add-remarks.component';
import { BothAssignComponent } from '../both-assign/both-assign.component';
import { QuestionLogsComponent } from '../question-logs/question-logs.component';

@Component({
  selector: 'app-ques-user-assign',
  templateUrl: './ques-user-assign.component.html',
  styleUrls: ['./ques-user-assign.component.css']
})
export class QuesUserAssignComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('ref') ref;
  @ViewChild('allSelectedLessons') private allSelectedLessons: MatOption;
  @ViewChild('allSelectedTopics') private allSelectedTopics: MatOption;
  private apiUrl = environment.apiUrl;
  displayMessage: { [key: string]: string } = {};
  displayedColumns = ['S_No', 'question_id', 'setName', 'assignedTo', 'assignedBy', 'status', 'assign'];
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
  reAssignBtn: number = 0;

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
        this.getAllTopicQuestions(this.selectData.topic_id);

        this.quizForm.patchValue({
          board_id: this.selectData.board_id,
          class_id: this.selectData.class_id,
          subject_id: this.selectData.subject_id,
          lesson_id: this.selectData.lesson_id,
          topic_id: this.selectData.topic_id
        });
        this.topicId = this.selectData.topic_id;
        this.qc_done = paramsData.QC_Done;
        if(parseInt(this.qc_done) == 0){this.reAssignBtn = 1} else this.reAssignBtn = 0;
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
    });
  }

  getAllTopicQuestions(strVal) {
    this.quizForm.patchValue({
      QC_Done: ""
    });
    this.topicArr = strVal;
    const paramsVal = { 
      syllabus_id: this.topicArr, 
      syllabus_type: 'Topic',
      qc_done: [0,1]
    };
    this.quesSelection = paramsVal;
    this.getAllQuestions(paramsVal);
    this.selectedAll = true;
  }

  getQcDone(QcValue) {
    if(parseInt(this.qc_done) == 0){ this.reAssignBtn = 1} else this.reAssignBtn = 0;
    if(QcValue == ""){
      QcValue = [0,1]
    }else{
      QcValue = [QcValue]
    }
    const paramsVal = { 
      syllabus_id: this.topicArr, 
      syllabus_type: 'Topic', 
      qc_done: QcValue
    };    
    this.quesSelection = paramsVal;
    this.getAllQuestions(paramsVal);
  }

  getAllQuestions(paramsVal){
    this.quizSetService.getAllTopicQuestions(paramsVal).subscribe((result: any) => {
      if (result.data) {
        let response = result.data;
        this.questionData = [];
        // console.log(response);
        response.forEach(sq => {
          if(sq.syllabus_questions){
            sq.isSelected = true;
            this.questionData.push(sq);
          }
        });
        this.dataSource = new MatTableDataSource(this.questionData);
        this.dataSource.paginator = this.paginator;
      }
    });
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
    this.getAllTopicQuestions(topicVal);
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

  assignQues() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.height = '800px';
    // dialogConfig.width = '600px';
    for (var i = 0; i < this.questionData.length; i++) {
      if(this.questionData[i].isSelected===true){
          this.quesIdArr.push(this.questionData[i].id);
      }
    }
    if (this.quesIdArr.length < 1) {
      this.openSnackBar("Please select a question. ", "Close");
      return false;
    }

    dialogConfig.data = {
      question_id: this.quesIdArr
    };
    const dialogRef = this.dialog.open(BothAssignComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        this.quesIdArr = [];
        let paramsVal = this.quesSelection;
        this.selectedAll = true;
        this.getAllQuestions(paramsVal);
        if(data || data == undefined){
        }
        else{
          this.openSnackBar("Questions for QC have been assigned successfully. ", "Close");
        }
      }
    );
  }

  removeAssign(){
    
    for (var i = 0; i < this.questionData.length; i++) {
      if(this.questionData[i].isSelected===true){
          this.quesIdArr.push(this.questionData[i].id);
      }
    }
    if (this.quesIdArr.length < 1) {
      this.openSnackBar("Please select a question. ", "Close");
      return false;
    }
    var result = confirm("Are you sure, you want to remove assigning?");
    if (result) {
      let obj = { question_id: this.quesIdArr}
      this.quizSetService.removeAssignQue(obj).subscribe((result: any) => {
        if (result.status) {
          this.quesIdArr = [];
          let paramsVal = this.quesSelection;
          this.selectedAll = true;
          this.getAllQuestions(paramsVal);
          this.openSnackBar('Question remove assigning successfully. ', 'Close');
        }
      });
    }
  }

  assignPemission() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.width = '600px';
    dialogConfig.height = '600px';
    // console.log(this.quesIdArr);

    dialogConfig.data = {
      topic_id: this.topicArr
    };
    const dialogRef = this.dialog.open(PermissionAssignComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getAllTopicQuestions(this.topicId);
        let paramsVal = this.quesSelection;
        this.selectedAll = true;
        this.getAllQuestions(paramsVal);
        if(data || data == undefined){
         // this.openSnackBar("Topic assigned closed. ", "Close");
        }
        else{
          this.openSnackBar("Topic for QC have been assigned successfully. ", "Close");
        }
        // this.openSnackBar("Topic for QC have been assigned successfully. ", "Close");
      }
    );
  }


  previewQues(question_id){
    const dialogConfig = new MatDialogConfig();
    let questionIds = [question_id];
    dialogConfig.data = {
        question_id: questionIds
    };
    const dialogRef = this.dialog.open(BothPreviewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getAllTopicQuestions(this.topicId);
        let paramsVal = this.quesSelection;
        this.selectedAll = true;
        this.getAllQuestions(paramsVal);
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
        //this.getAllTopicQuestions(this.topicId);
        let paramsVal = this.quesSelection;
        this.selectedAll = true;
        this.getAllQuestions(paramsVal);
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
        //this.getAllTopicQuestions(this.topicId);
        let paramsVal = this.quesSelection;
        this.selectedAll = true;
        this.getAllQuestions(paramsVal);
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
        backTo: 1
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
        this.selectedAll = true;
        this.getAllQuestions(paramsVal);
      }
    );
  }
}
