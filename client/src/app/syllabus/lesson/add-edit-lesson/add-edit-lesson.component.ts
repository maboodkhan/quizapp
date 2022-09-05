import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GenericValidator } from 'src/app/shared';
import { environment } from 'src/environments/environment';
import { SyllabusService } from '../../syllabus.service';

@Component({
  selector: 'app-add-edit-lesson',
  templateUrl: './add-edit-lesson.component.html',
  styleUrls: ['./add-edit-lesson.component.css']
})
export class AddEditLessonComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  boards: any;
  pageTitle = 'Add Lesson';
  errorMessage: any;
  lessonForm: FormGroup;
  lessonData: any;
  currentUser: any;
  user_id: number;
  type_order: any;
  contentTypeDisable: boolean = true;
  classList: any;
  fileUploadProgress: string = null;
  fileData: File = null;
  apiUrl = environment.apiUrl;

  sectionIdArr: any;
  subjectList: any;
  lesson_id: any;
  lesson_name: any;

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
      lesson_name: {
        required: 'Lesson Name required.'
      },
      lesson_num:{
          required : 'Lesson Number is required'
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
    Observable.merge(this.lessonForm.valueChanges, controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.lessonForm);
    });
  }


  ngOnInit() { 
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
      // this.user_id = this.currentUser.id;
      if (this.currentUser) {
       this.user_id = this.currentUser.id;
      this.type_order = this.currentUser.user_Type.type_order;
   
   
    }
    
    this.lessonForm = this.fb.group({
      board_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      lesson_name: ['', [Validators.required]],
      lesson_num: ['', [Validators.required]],
      keywords: ['', ''],
      bg_image: ['', ''],
      status: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.lesson_id = params['lesson_id'];
      //console.log(this.lesson_id);
      if (this.lesson_id ) {
        this.pageTitle = `Update Lesson`;
        this.getLesson();
      } else {
        this.pageTitle = 'Add Lesson';
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
    this.contentTypeDisable = true;
  }

  saveLesson(){
    let obj = {};
    if (this.lesson_id) {
      // console.log(obj);
     
      obj = Object.assign({},
        { lesson_id: this.lesson_id },
          this.lessonForm.value);
        this.syllabusService.updateLesson(obj).subscribe((data: any) => {
        if (data.status == true) {
          this.router.navigate(['/lesson'],{queryParamsHandling: 'preserve'});
          this.openSnackBar('Lesson has been updated successfully. ', 'Close');
        } else {
          this.errorMessage = data;
        }
      })
    } else {
     obj = this.lessonForm.value;
      // console.log(obj);
      this.syllabusService.createNewLesson(obj).subscribe((data: any) => {
        if (data.status == true) {
          this.router.navigate(['/lesson'],{queryParamsHandling: 'preserve'});
          this.openSnackBar('Lesson has been added successfully. ', 'Close');
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
      lesson_id: this.lesson_id
    }
    this.syllabusService.getLessonstById(obj).subscribe((lessonData: any) => {
    this.lessonData = lessonData.data;
      this.changeBoard(this.lessonData.subject_lessons.class_subjects.board_id);
      this.changeClass(this.lessonData.subject_lessons.class_id);
      this.changeSubject(this.lessonData.subject_id);
      this.lessonForm.patchValue({
        board_id: this.lessonData.subject_lessons.class_subjects.board_id,
        class_id: this.lessonData.subject_lessons.class_id,
        subject_id: this.lessonData.subject_id,
        lesson_name: this.lessonData.lesson_name,
        lesson_num: this.lessonData.lesson_num,
        keywords: this.lessonData.keywords,
        status: this.lessonData.status
      });
    });
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      this.fileData = event.target.files[0] as File;
      const fileName = this.fileData.name;
      if (fileName.indexOf('.jpg') > 0 ||
        fileName.indexOf('.png') > 0 || 
        fileName.indexOf('.jpeg') > 0) {
        this.errorMessage = "";
      }
      else {
        this.fileUploadProgress = '';
        this.errorMessage = "Only .jpg, .png, files are allowed"
        return;
      }

        const formData = new FormData();
        // console.log(this.fileData);
        formData.append('files', this.fileData);
        this.fileUploadProgress = '0%';
        let class_id= this.lessonForm.value.class_id;
        let subject_id= this.lessonForm.value.subject_id;
        this.http.post(`${this.apiUrl}/syllabus_uploads/uploadLessonLogo?&class_id=${class_id}&subject_id=${subject_id}&lesson_id=${this.lesson_id}`, formData, {
          reportProgress: true,
          observe: 'events'
        })
          .subscribe(events => {
            console.log(events);
            if (events.type === HttpEventType.UploadProgress) {
              if(events.loaded != events.total){
                this.fileUploadProgress = Math.round((events.loaded / events.total) * 100) + '%';
              }
            }else if(events.type === HttpEventType.DownloadProgress){
              this.fileUploadProgress = "100%"
            } else if (events.type === HttpEventType.Response) {
              let response;
              response = events.body;
              console.log(response);
              this.lessonForm.controls.bg_image.setValue(response.fileName);
            }
          });
    }
    // alert("under maintenance");
  }

}