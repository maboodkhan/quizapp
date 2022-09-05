import { Component, OnInit, ViewChild, ViewChildren, ElementRef } from '@angular/core';
import { Http } from '@angular/http';
import { QuestionService } from '../question.service';
import { FormBuilder, FormControlName, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatPaginator, MatOption, MatTableDataSource, MatDialog, MatDialogConfig } from '@angular/material';
import { GenericValidator } from 'src/app/shared';
import { environment } from 'src/environments/environment';
import { Subscription, Observable } from 'rxjs';
import { AssignMessageComponent } from './assign-message.component';

@Component({
  selector: 'app-lesson-assign',
  templateUrl: './lesson-assign.component.html',
  styleUrls: ['./lesson-assign.component.css']
})
export class LessonAssignComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('ref') ref;
  @ViewChild('allSelectedLessons') private allSelectedLessons: MatOption;
  // @ViewChild('allSelectedTopics') private allSelectedTopics: MatOption;
  // private apiUrl = environment.apiUrl;
  displayMessage: { [key: string]: string } = {};
  displayedColumns = ['S_No', 'UserName', 'assign'];
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  private sub: Subscription;
  lessonForm: FormGroup;
  quizData: any;
  currentUser: any;
  userId: number;
  token: string;
  errorMessage: any = {};
  boards: any;
  classes: any;
  subjects: any;
  lessons: any;
  duration: any;
  classIdArr = [];
  subjectIdArr = [];
  lessonIdArr = [];
  quesIdArr = [];
  sections: any;
  sectionIdArr = [];
  quesArray: any;
  userType: string;
  dataSource: any;
  num_ques: number = 0;
  pageSize: 10;
  userIdArr = [];
  selectLessonArr = [];
  grade_id: [];
  message = '';
  selBoard: number;

  constructor(
    private http: Http,
    private questionService: QuestionService,
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
      question_id: {
        required: 'Question is required.'
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

    this.lessonForm = this.fb.group({
      board_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      section_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      lesson_id: ['', [Validators.required]],
      questions: this.fb.array([])
    });

    this.quesArray = this.lessonForm.controls.questions as FormArray;
    this.getBoards();
    this.getClassSections();
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.lessonForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.lessonForm);
    });
  }

  getBoards(nonAcademicVal = 0) {
    const paramsVal = { non_academic: nonAcademicVal };
    this.questionService.getBoards(paramsVal).subscribe((result: any) => {
      this.boards = result.data;
      this.lessonForm.patchValue({
        board_id: 1
      });
      this.changeBoard(1);
    });
  }

  getClassSections() {
    const paramsVal = {};
    this.questionService.getClassSections(paramsVal).subscribe((result: any) => {
      this.sections = result.data;
    });
  }

  changeBoard(strVal, defaultVal = 0) {
    const paramsVal = { board_id: strVal };
    if (defaultVal === 0) {
      this.classes = [];
      this.subjectIdArr = [];
      this.lessonIdArr = [];
    }
    let sectionId = '';
    if (this.quizData) {
      sectionId = this.quizData.quiz_syllabus[0].section_id;
    }
    // Update the data on the form
    this.lessonForm.patchValue({
      class_id: this.classIdArr,
      section_id: sectionId,
      subject_id: this.subjectIdArr,
      lesson_id: this.lessonIdArr
    });
    this.questionService.getClasses(paramsVal).subscribe((result: any) => {
      this.classes = result.data;
    });
  }

  changeClass(strVal, defaultVal = 0) {
    const paramsVal = { class_id: [strVal] };
    this.grade_id = strVal;
    if (defaultVal === 0) {
      this.subjectIdArr = [];
      this.lessonIdArr = [];
      // Update the data on the form
      this.lessonForm.patchValue({
        subject_id: this.subjectIdArr,
        lesson_id: this.lessonIdArr
      });
    }

    this.questionService.getSubjects(paramsVal).subscribe((result: any) => {
      this.subjects = result.data;
    });
  }

  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    if (defaultVal === 0) {
      this.lessonIdArr = [];
      // Update the data on the form
      this.lessonForm.patchValue({
        lesson_id: this.lessonIdArr
      });
    }
    this.questionService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessons = result.data;
      if (this.lessonIdArr.length === this.lessons.length) {
        this.lessonIdArr.push(0);
      }
    });
  }

  changeLesson(strVal, defaultVal = 0) {
    // console.log(strVal);
    this.userIdArr = [];
    this.selectLessonArr = strVal;
    const paramsVal = { lesson_id: [strVal] };
    let customFilter = {
      user_id: this.currentUser.id,
      type_order: this.currentUser.user_Type.type_order
    }
    this.questionService.getAssignUsers(customFilter).subscribe((data: any) => {
      // console.log(data);
      this.dataSource = new MatTableDataSource(data.data);
      this.dataSource.paginator = this.paginator;
    })
  }

  selectAllLessons() {
    let lessonVal = [0];
    if (this.allSelectedLessons.selected) {
      this.lessonForm.controls.lesson_id
        .patchValue([...this.lessons.map(item => item.id), 0]);
      lessonVal = this.lessonForm.controls.lesson_id.value;
    } else {
      this.lessonForm.controls.lesson_id.patchValue([]);
    }
    this.changeLesson(lessonVal);
  }


  onUserChange(user_id: number, isChecked: any) {
    if (isChecked) {
      this.userIdArr.push(user_id);
    } else {
      this.userIdArr = this.userIdArr.filter(function (item) {
        return item !== user_id
      });
    }
    // console.log(this.userIdArr);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  assignChapter() {
    this.selectLessonArr;
    if(this.userIdArr == []){
      this.openSnackBar("Please select user to assign.", "Close");
    }else{
      let obj = {
        grade_id: this.grade_id,
        user_id: this.userIdArr,
        lesson_id: this.selectLessonArr,
        assigned_by: this.userId
      }
      this.questionService.addUserLessons(obj).subscribe((data: any) => {
        // console.log(data);
        if(data.status){
          this.userIdArr = [];
          this.router.navigate(['/userLesson']);
          // this.openSnackBar(data.message, "Close");
        }
        // this.message = data.message;
        this.showMessageBox(data.message);
      });
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  showMessageBox(message: string){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
        message: message
    };
    this.dialog.open(AssignMessageComponent, dialogConfig);
  }

}
