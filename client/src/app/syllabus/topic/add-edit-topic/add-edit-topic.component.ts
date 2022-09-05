import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GenericValidator } from 'src/app/shared';
import { environment } from 'src/environments/environment';
import { SyllabusService } from '../../syllabus.service';

@Component({
  selector: 'app-add-edit-topic',
  templateUrl: './add-edit-topic.component.html',
  styleUrls: ['./add-edit-topic.component.css']
})
export class AddEditTopicComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  boards: any;
  pageTitle = 'Add Topic';
  errorMessage: any;
  topicForm: FormGroup;
  topicData: any;
  currentUser: any;
  user_id: number;
  type_order: any;
  contentTypeDisable: boolean = true;
  classList: any;
  fileUploadProgress: string = null;
  fileData: File = null;
  apiUrl = environment.apiUrl;
  lessonList: any;

  sectionIdArr: any;
  subjectList: any;
  topic_id: any;
  topic_name: any;

  constructor(
    private syllabusService: SyllabusService,
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.validationMessages = {
      board_id: {
        required: 'Board is required.'
      },
      class_id: {
        required: 'Class is required.'
      },
      subject_id: {
        required: 'Subject is required.'
      },
      lesson_id: {
        required: 'Lesson is required.'
      },
      topic_name: {
        required: 'Topic Name required.'
      },
      topic_num:{
          required : 'Topic Number is required'
      },
      keywords:{
        required : 'Keyword is required'
      },
      status: {
        required: 'Status is required.'
      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.topicForm.valueChanges, controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.topicForm);
    });
  }


  ngOnInit() { 
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      // this.user_id = this.currentUser.id;
      if (this.currentUser) {
       this.user_id = this.currentUser.id;
      this.type_order = this.currentUser.user_Type.type_order;
   
   
    }
    
    this.topicForm = this.fb.group({
      board_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      lesson_id: ['', [Validators.required]],
      topic_name: ['', [Validators.required]],
      topic_num: ['', [Validators.required]],
      keywords: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.topic_id = params['topic_id'];
      //console.log(this.lesson_id);
      if (this.topic_id ) {
        this.pageTitle = `Update Topic`;
        this.getLesson();
      } else {
        this.pageTitle = 'Add Topic';
       }
    });

    this.getBoards();
  }

  getBoards(nonAcademicVal = 0) {
    const paramsVal = { non_academic: nonAcademicVal };
    this.syllabusService.getBoards(paramsVal).subscribe((result: any) => {
      this.boards = result.data;
    });
  }

  changeBoard(strVal, defaultVal = 0) {
    let paramsVal = { board_id: strVal };
    this.syllabusService.getClasses(paramsVal).subscribe((result: any) => {
      this.classList = result.data;
    });
    this.contentTypeDisable = true;
  }
 
  changeClass(class_id) {
    this.sectionIdArr = [class_id];
    let classObj = { class_id: this.sectionIdArr }
    this.syllabusService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
    this.contentTypeDisable = true;
  }


  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    this.syllabusService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessonList = result.data;
    });
    this.contentTypeDisable = true;
  }

  saveLesson(){
    let obj = {};
    if (this.topic_id) {
      // console.log(obj);
     
      obj = Object.assign({},
        { topic_id: this.topic_id },
          this.topicForm.value);
        this.syllabusService.updateTopic(obj).subscribe((data: any) => {
        if (data.status == true) {
          this.router.navigate(['/topic']);
          this.openSnackBar('Topic has been updated successfully. ', 'Close');
        } else {
          this.errorMessage = data;
        }
      })
    } else {
     obj = this.topicForm.value;
      // console.log(obj);
      this.syllabusService.createNewTopic(obj).subscribe((data: any) => {
        if (data.status == true) {
          this.router.navigate(['/topic']);
          this.openSnackBar('Topic has been added successfully. ', 'Close');
        }else {
          this.errorMessage = data;
        }
      })
        
  }
}
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }
 
  getLesson() {
    let obj = {
      topic_id: this.topic_id
    }
    this.syllabusService.getTopicById(obj).subscribe((topicData: any) => {
    this.topicData = topicData.data;
      this.changeBoard(this.topicData.lesson_topics.subject_lessons.class_subjects.board_id);
      this.changeClass(this.topicData.lesson_topics.subject_lessons.class_id);
      this.changeSubject(this.topicData.lesson_topics.subject_id);
      this.topicForm.patchValue({
        board_id: this.topicData.lesson_topics.subject_lessons.class_subjects.board_id,
        class_id: this.topicData.lesson_topics.subject_lessons.class_id,
        subject_id: this.topicData.lesson_topics.subject_id,
        lesson_id: this.topicData.lesson_id,
        topic_name: this.topicData.topic_name,
        topic_num: this.topicData.topic_num,
        keywords: this.topicData.keywords,
        status: this.topicData.status
      });
    });
  }

}
