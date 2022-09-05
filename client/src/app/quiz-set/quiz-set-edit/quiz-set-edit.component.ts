import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import { QuizSetService } from '../quiz-set.service';
import { FormBuilder, Validators, FormGroup, FormControlName, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericValidator } from 'src/app/shared';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import { Observable, fromEvent, from } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { MatSnackBar, MatOption, MatDialog, MatDialogConfig } from '@angular/material';
import { Http } from '@angular/http';
import { environment } from 'src/environments/environment';
import { QuizsetPreviewComponent } from '../quizset-preview/quizset-preview.component'

@Component({
  selector: 'app-quiz-set-edit',
  templateUrl: './quiz-set-edit.component.html',
  styleUrls: ['./quiz-set-edit.component.css']
})
export class QuizSetEditComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('ref') ref;
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;
  @ViewChild('allSelectedLessons') private allSelectedLessons: MatOption;
  @ViewChild('allSelectedTopics') private allSelectedTopics: MatOption;
  @ViewChild('allSelectedCountryLessons') private allSelectedCountryLessons: MatOption;
  @ViewChild('countryVal') countryVal;
  
  private apiUrl = environment.apiUrl;
  displayMessage: { [key: string]: string } = {};
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
  questionData: any;
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
  num_ques = 0;
  school_id = [];
  view: any;
  countryList: any;
  showCountryLesson = false;
  countryName: string;
  countryLessonList: any;
  lessonType: string;
  mapLessonList: any;
  countryLessonIdArr = [];
  countryIdArr = [];
  schoolList: any;
  schoolIdArr = [];
  
  constructor(
    private http: Http,
    private quizSetService: QuizSetService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog) {
      // Defines all of the validation messages for the form.
      // These could instead be retrieved from a file or database.
      this.validationMessages = {
        set_name: {
          required: 'Quiz set name is required.',
          pattern: 'Special characters are not allowed'
        },
        num_ques: {
          required: 'Number of questions are required.'
        },
        duration: {
          required: 'Duration is required.'
        },
        status: {
          required: 'Status is required.'
        },
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
        country_id: {
          required: 'Country is required.'
        },
        school_id: {
          required: 'School is required.'
        },
      };
      this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
        this.userId = this.currentUser.id;
        this.token = this.currentUser.token;
        this.userType = this.currentUser.userType;
        // this.school_id = this.currentUser.user_class.length > 0 ? this.currentUser.user_class[0].school_id : 0;
        this.countryList = this.currentUser.user_countries;
    }
    this.currentUser.user_class.forEach(userVal => {
      if (this.school_id.indexOf(userVal.school_id) == -1) {
        this.school_id.push(userVal.school_id);
      }
    });

    this.quizForm = this.fb.group({
      set_name: ['', [Validators.required, Validators.pattern("^[A-Za-z0-9\\s-_;]+$")]],
      set_type: ['', ''],
      num_ques: ['', ''],
      duration: ['', [Validators.required]],
      status: ['', [Validators.required]],
      board_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      section_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      lesson_id: ['', [Validators.required]],
      topic_id: ['', [Validators.required]],
      country_id: ['',[Validators.required]],
      school_id: ['',[Validators.required]],
      country_lesson_id: ['',''],
      multiple_attempts: ['',''],
      questions: this.fb.array([])
    });

    this.quesArray = this.quizForm.controls.questions as FormArray;

    this.quizForm.patchValue({
      board_id: 1
    });

    // Read the quiz set Id from the route parameter
    this.sub = this.route.params.subscribe(
        params => {
            const id = +params['id'];
            if (id) {
              const setData = {set_id: id};
              this.getQuizSet(setData);
            } else {
              let selCountryId = this.countryList.length == 1 ? this.countryList[0] : '';
        
              if(selCountryId){
                this.quizForm.patchValue({
                  country_id: selCountryId.countries.id
                });
                this.changeCountry(selCountryId.countries.countryName);
              }
            }
        }
    );

    this.route.queryParams.subscribe((paramsData: any) => {
      if(paramsData.view){
        this.view = paramsData.view;
      }
    });

    this.getBoards();
    this.changeBoard(1);
    // this.getClassSections();
    this.sub.add(null);
  }
  getQuizSet(setData: any): void {
    this.quizSetService.getQuizSetDetails(setData)
        .subscribe(
        (quizSet) =>  this.onDataRetrieved(quizSet),
        (error: any) => this.errorMessage = error as any
        );
  }


  ngOnDestroy(): void {
    this.sub.unsubscribe();
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

  uniqueVals(arr) {
    const uniqVal = arr.filter((v, i, a) => a.indexOf(v) === i);
    return uniqVal;
  }

  onDataRetrieved(quizData): void {
    if (this.quizForm) {
        this.quizForm.reset();
    }
    this.quizData = quizData.data;
    console.log(this.quizData);

    if (this.quizData.id == null) {
        this.pageTitle = 'Add Quiz Set';
        let selCountryId = this.countryList.length == 1 ? this.countryList[0] : '';
        if(selCountryId){
          this.quizForm.patchValue({
            country_id: selCountryId.countries.id
          });
          this.changeCountry(selCountryId.countries.countryName);
        }
    } else {
        this.pageTitle = `Update Quiz Set`;
    }
    this.quizData.quiz_schools.forEach(schools => {
      this.schoolIdArr.push(schools.school_id);
    });
    this.changeBoard(this.quizData.quiz_syllabus[0].board_id);
    this.quizData.quiz_syllabus.forEach(sybVal => {
      this.classIdArr.push(sybVal.class_id);
      this.sectionIdArr.push(sybVal.section_id);
      this.subjectIdArr.push(sybVal.subject_id);
      this.lessonIdArr.push(sybVal.lesson_id);
      this.topicIdArr.push(sybVal.topic_id);
      this.countryLessonIdArr.push(sybVal.country_lesson_id);
      this.countryIdArr.push(sybVal.country_id);
    });
    this.lessonIdArr = this.uniqueVals(this.lessonIdArr);
    this.countryLessonIdArr = this.uniqueVals(this.countryLessonIdArr);
    
    this.changeBoard(this.quizData.quiz_syllabus[0].board_id, 1);
    this.changeClass(this.classIdArr, 1);
    this.changeSubject(this.subjectIdArr, 1);
    this.changeLesson(this.lessonIdArr, 1);
    this.getRetrievedTopicQuestions(this.topicIdArr);

    this.num_ques = this.quizData.num_ques;

    // Update the data on the form
    this.quizForm.patchValue({
      set_name: this.quizData.set_name,
      num_ques: this.quizData.num_ques,
      duration: this.quizData.duration,
      set_type: this.quizData.set_type,
      multiple_attempts: this.quizData.multiple_attempts,
      status: this.quizData.status,
      board_id: this.quizData.quiz_syllabus[0].board_id,
      class_id: this.classIdArr,
      section_id: this.sectionIdArr,
      subject_id: this.subjectIdArr,
      lesson_id: this.lessonIdArr,
      topic_id: this.topicIdArr,
      country_id: this.countryIdArr[0],
      country_lesson_id: this.countryLessonIdArr,
      school_id: this.schoolIdArr
    });
    this.changeCountry(this.countryVal.triggerValue, 1);
    if(this.showCountryLesson) {
      this.getCountryMapLessons(this.countryLessonIdArr);
    }
  }

  saveQuizSet() {
    // if (this.quizForm.dirty && this.quizForm.valid) {
    //   // Copy the form values over the quizData object values
    //   const quizSet = Object.assign({}, this.quizData, this.quizForm.value);
    //   const quizId = (quizSet.id !== undefined ? quizSet.id : null);
    //   this.createQuizSet(quizSet);
    // } else if (this.quesArray.length.toString() !== this.quizForm.controls.num_ques.value.toString()) {
    //   this.errorMessage.message = 'Number of questions does not match. Please try again.';
    // } else if (!this.quizForm.dirty) {
    //     this.onSaveComplete();
    // }

    if (this.quesArray.length.toString() !== this.quizForm.controls.num_ques.value.toString()) {
      this.errorMessage.message = 'Number of questions does not match. Please try again.';
    } else {
      if(this.quizForm.value.multiple_attempts){
        this.quizForm.value.multiple_attempts = 1
      }else{
        this.quizForm.value.multiple_attempts = 0;
      }
      const quizSet = Object.assign({}, this.quizData, this.quizForm.value);
      const quizId = (quizSet.id !== undefined ? quizSet.id : null);
      // console.log(quizSet);
      this.createQuizSet(quizSet);
    }
  }

  createQuizSet(quizSet: any){
    const saveQuizSetUrl = `${this.apiUrl}/quiz_sets/create`;
    if(quizSet.created_by == '' || quizSet.created_by== undefined){
      quizSet.created_by = this.userId;
    }
    quizSet.modified_by = this.userId;
    // quizSet.school_id = this.school_id;
   
    if(!this.showCountryLesson){
      quizSet.country_lesson_id = 0;
    }
    this.http.post(saveQuizSetUrl, quizSet).subscribe((response) => {
      const result = response.json();

      if (result.status){
        this.onSaveComplete();
      } else {
        this.errorMessage.message = result.message;
      }
    });
  }

  getBoards(nonAcademicVal = 0) {
    const paramsVal = {non_academic: nonAcademicVal};
    this.quizSetService.getBoards(paramsVal).subscribe((result: any) => {
        this.boards = result.data;
    });
  }


  // classSectionsById(let classArr){}
  changeBoard(strVal, defaultVal = 0) {
    const paramsVal = {board_id: strVal};
    if (defaultVal === 0) {
      this.classes = [];
      this.sectionIdArr = [];
      this.subjectIdArr = [];
      this.lessonIdArr = [];
      this.topicIdArr = [];
      this.countryLessonIdArr = [];
    }
    let sectionId = [];
    if (this.quizData) {
      sectionId = this.quizData.quiz_syllabus;
    }
    // Update the data on the form
    this.quizForm.patchValue({
      class_id: this.classIdArr,
      section_id: sectionId,
      subject_id: this.subjectIdArr,
      lesson_id: this.lessonIdArr,
      topic_id: this.topicIdArr,
      country_lesson_id: this.countryLessonIdArr
    });
    this.quizSetService.getClasses(paramsVal).subscribe((result: any) => {
        this.classes = result.data;
    });
  }

  changeClass(strVal, defaultVal = 0) {
    const paramsVal = {class_id: strVal};
    if (defaultVal === 0) {
      this.sectionIdArr = [];
      this.subjectIdArr = [];
      this.lessonIdArr = [];
      this.topicIdArr = [];
      this.countryLessonIdArr = [];
      // Update the data on the form
      this.quizForm.patchValue({
        section_id: this.sectionIdArr,
        subject_id: this.subjectIdArr,
        lesson_id: this.lessonIdArr,
        topic_id: this.topicIdArr,
        country_lesson_id: this.countryLessonIdArr
      });
    }
    this.quizSetService.classSectionsById(paramsVal).subscribe((res: any) => {
      this.sections = res.data;
    });
    this.quizSetService.getSubjects(paramsVal).subscribe((result: any) => {
        this.subjects = result.data;
    });
  }

  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = {subject_id: strVal};
    if (defaultVal === 0) {
      this.lessonIdArr = [];
      this.topicIdArr = [];
      this.countryLessonIdArr = [];
      // Update the data on the form
      this.quizForm.patchValue({
        country_lesson_id: this.countryLessonIdArr,
        lesson_id: this.lessonIdArr,
        topic_id: this.topicIdArr
      });
    }
    if(this.showCountryLesson){
      this.getCountryLessons(strVal);
    } else {        
      this.getLessons(strVal);
    } 
  }

  getCountryLessons(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: strVal };
    this.quizSetService.getCountryLessons(paramsVal).subscribe((result: any) => {
      
      if (result.data) {
        this.countryLessonList = result.data;
      } else {
        this.countryLessonList = [];
      }
      if (this.countryLessonIdArr.length === this.countryLessonList.length) {
        this.countryLessonIdArr.push(0);
      }
    });
  }

  getLessons(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: strVal };
    this.quizSetService.getLessons(paramsVal).subscribe((result: any) => {
      if (result.data) {
        this.lessons = result.data;
      } else {
        this.lessons = [];
      }
      if (this.lessonIdArr.length === this.lessons.length) {
        this.lessonIdArr.push(0);
      }
    });
  }

  getCountryMapLessons(strVal, defaultVal = 0) {
    const paramsVal = { country_lesson_id: strVal };
    this.quizSetService.getCountryMapLessons(paramsVal).subscribe((result: any) => {
      this.mapLessonList = result.data;
    });
  }

  changeLesson(strVal, defaultVal = 0) {
    const paramsVal = {lesson_id: strVal};
    if (defaultVal === 0) {
      this.topicIdArr = [];
      // Update the data on the form
      this.quizForm.patchValue({
        topic_id: this.topicIdArr
      });
    }
    this.quizSetService.getTopics(paramsVal).subscribe((result: any) => {
      if (result.data) {
        this.topics = result.data;
      } else {
        this.topics = [];
      }
      if (this.topicIdArr.length === this.topics.length) {
        this.topicIdArr.push(0);
      }
    });
  }

  getTopicQuestions(strVal) {
    this.num_ques = 0;
    const paramsVal = {syllabus_id: strVal, syllabus_type: 'Topic',qc_done: [0,1,2]};
    this.quizSetService.getTopicQuestions(paramsVal).subscribe((result: any) => {
      if (result.data) {
        this.questionData = result.data;
        this.quesArray.controls = [];
        // if (this.quizData) {
        //   if(this.quizData.quiz_syllabus[0].topic_id == strVal){
        //     this.quizData.quiz_questions.forEach(quesVal => {
        //       /*this.quesIdArr.push(quesVal.question_id);
        //       this.quesArray.push(new FormControl(quesVal.question_id));*/
        //       this.quesArray.controls = [];
        //     });
        //   } else {
        //     this.quesIdArr = [];
        //     this.quizData.quiz_questions.map((quesVal, index) => {
        //       /*** To blank question array containing previous topic questions  ****/
        //       const indexVal = this.quesArray.controls.findIndex(x => x.value === quesVal.question_id);
        //       this.quesArray.removeAt(indexVal);
        //       // this.quesArray.splice(0,this.quesArray.length)
        //       this.quesArray.controls = [];
        //       /**************************************************/
        //     });
        //   }
        // }
        if (this.questionData) {
          this.questionData.map((quesVal, index) => {
            if(this.quesIdArr.includes(quesVal.question_id)){
              this.questionData[index].isChecked = true;
            } else {
              this.questionData[index].isChecked = false;
            }
          });
        }
      }
    });
  }

  getRetrievedTopicQuestions(strVal) {
    const paramsVal = {syllabus_id: strVal, syllabus_type: 'Topic',qc_done: [0,1,2]};
    this.quizSetService.getTopicQuestions(paramsVal).subscribe((result: any) => {
      if (result.data) {
        this.questionData = result.data;
        if (this.quizData) {
          this.quizData.quiz_questions.forEach(quesVal => {
            this.quesIdArr.push(quesVal.question_id);
            this.quesArray.push(new FormControl(quesVal.question_id));
          });
        }
        if (this.questionData) {
          this.questionData.map((quesVal, index) => {
            if(this.quesIdArr.includes(quesVal.question_id)){
              this.questionData[index].isChecked = true;
            } else {
              this.questionData[index].isChecked = false;
            }
          });
        }
      }
    });
  }

  onSaveComplete(): void {
      // Reset the form to clear the flags
      this.openSnackBar('Quiz set has been saved successfully. ', 'Close');
      this.router.navigate(['/quizset'], {queryParamsHandling: 'preserve'});
  }

  openSnackBar(message: string, action: string) {
      this.snackBar.open(message, action, {
          duration: 1500,
      });
  }

  onQuesChange(question: string, isChecked: any) {
    if (isChecked) {
      this.quesArray.push(new FormControl(question));
      this.num_ques++;
    } else {
      const index = this.quesArray.controls.findIndex(x => x.value === question);
      this.quesArray.removeAt(index);
      this.num_ques--;
    }
    // this.quizForm.controls.num_ques.value = this.num_ques
    this.quizForm.controls['num_ques'].setValue(this.num_ques);
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

  selectAllSection() {
    let sectionVal = [0];
    if (this.allSelectedSection.selected) {
      this.quizForm.controls.section_id
        .patchValue([...this.sections.map(item => item.id), 0]);
      sectionVal = this.quizForm.controls.section_id.value;
    } else {
      this.quizForm.controls.section_id.patchValue([]);
    }
  }

  tosslePerLesson(all) {
    if (this.allSelectedLessons.selected) {
      this.allSelectedLessons.deselect();
      return false;
    }
    if (this.quizForm.controls.lesson_id.value.length === this.lessons.length ) {
      this.allSelectedLessons.select();
    }
  }

  tosslePerTopic(all) {
    if (this.allSelectedTopics.selected) {
      this.allSelectedTopics.deselect();
      return false;
    }
    if (this.quizForm.controls.topic_id.value.length === this.topics.length ) {
      this.allSelectedTopics.select();
    }
  }
  
  tosslePerSection(all) {
    if (this.allSelectedSection.selected) {
      this.allSelectedSection.deselect();
      return false;
    }
    if (this.quizForm.controls.section_id.value.length === this.sections.length ) {
      this.allSelectedSection.select();
    }
  }

  changeSetType(setType) {
    this.getBoards(setType);
    const quizSetType = (this.quizData === undefined ? '' : this.quizData.set_type);
    if (setType !== quizSetType) {
      this.quizForm.patchValue({
        board_id: '',
        class_id: '',
        section_id: '',
        subject_id: '',
        lesson_id: '',
        topic_id: '',
        country_lesson_id: ''
      });
      this.changeBoard(0);
      this.changeClass(0);
      this.changeSubject(0);
      this.changeLesson(0);
      this.getTopicQuestions(0);
      this.questionData = [];
    } else {
      this.quizForm.patchValue({
        board_id: this.quizData.quiz_syllabus[0].board_id,
        class_id: this.classIdArr,
        section_id: this.sectionIdArr,
        subject_id: this.subjectIdArr,
        lesson_id: this.lessonIdArr,
        topic_id: this.topicIdArr,
        country_lesson_id: this.countryLessonIdArr
      });
      this.changeBoard(this.quizData.quiz_syllabus[0].board_id);
      this.changeClass([this.quizData.quiz_syllabus[0].class_id]);
      this.changeSubject([this.quizData.quiz_syllabus[0].subject_id]);
      this.changeLesson([this.quizData.quiz_syllabus[0].lesson_id]);
      this.getTopicQuestions([this.quizData.quiz_syllabus[0].topic_id]);
    }
  }


  openDialog() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
        question_id: this.quesArray.value
    };
    this.dialog.open(QuizsetPreviewComponent, dialogConfig);
  }

  changeCountry(countryVal, defaultVal=0){
    this.countryName = countryVal;
    if(defaultVal == 0){
      this.quizForm.patchValue({
        country_lesson_id: 0,
        lesson_id: 0
      });
    }

    if(this.countryName == 'Indonesia') {
      this.showCountryLesson = true;
      this.lessonType = "Sub Lesson";
    } else {
      this.lessonType = "Lesson";
      this.showCountryLesson = false;
    }

    let obj = {
      country_id: this.quizForm.value.country_id,
      school_id: this.school_id
    }
    this.quizSetService.getCountrySchool(obj).subscribe((data: any)=> {
      this.schoolList = data.data;
    })

    if(this.quizForm.value.subject_id) {
      this.changeSubject(this.quizForm.value.subject_id, defaultVal);
    }
  }

  selectAllCountryLessons() {
    let lessonVal = [0];
    if (this.allSelectedCountryLessons.selected) {
      this.quizForm.controls.country_lesson_id
        .patchValue([...this.countryLessonList.map(item => item.id), 0]);
      lessonVal = this.quizForm.controls.country_lesson_id.value;
    } else {
      this.quizForm.controls.country_lesson_id.patchValue([]);
    }
    this.changeLesson(lessonVal);
  }

  tosslePerCountryLesson(all) {
    if (this.allSelectedCountryLessons.selected) {
      this.allSelectedCountryLessons.deselect();
      return false;
    }
    if (this.quizForm.controls.country_lesson_id.value.length === this.countryLessonList.length ) {
      this.allSelectedCountryLessons.select();
    }
  }
}
