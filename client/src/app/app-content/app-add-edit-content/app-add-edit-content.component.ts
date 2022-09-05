import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray } from 'lodash';
import { Observable } from 'rxjs';
import { GenericValidator } from 'src/app/shared';
import { environment } from 'src/environments/environment';
import { AppContentService } from '../app-content.service';

@Component({
  selector: 'app-app-add-edit-content',
  templateUrl: './app-add-edit-content.component.html',
  styleUrls: ['./app-add-edit-content.component.css']
})
export class AppAddEditContentComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  boards: any;
  pageTitle = 'Add Content';
  appContentUrl = environment.appContentUrl;
  errorMessage: any;
  contentForm: FormGroup;
  currentUser: any;
  classList: any;
  schoolList: any;
  sectionIdArr = [];
  sectionList: any;
  subjectList: any;
  lessonList: any;
  user_id: number;
  type_order: any;
  fileData: File = null;
  uploadResponse = { status: '', message: '', file: '' };
  fileUploadProgress: string = null;
  appFileUploadProgress: string = null;
  apiUrl = environment.apiUrl;
  content_id: number;
  contentData: any;
  showInput: boolean = false;
  showFile: boolean = false;
  fileType: any;
  contentTypeDisable: boolean = true;
  uploadStatus: number;
  board_id: number;
  class_id: number;
  subject_id: number;
  lesson_id: number;

  constructor(
    private contentService: AppContentService,
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
      section_id: {
        required: 'Section is required.'
      },
      subject_id: {
        required: 'Subject is required.'
      },
      lesson_id: {
        required: 'Lesson is required.'
      },
      encryptionKey: {
        required: 'Encryption Key is required.'
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
    Observable.merge(this.contentForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.contentForm);
    });
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // this.user_id = this.currentUser.id;
    if (this.currentUser) {
      this.user_id = this.currentUser.id;
      this.type_order = this.currentUser.user_Type.type_order;
    }

    const reg = "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
    this.contentForm = this.fb.group({
      board_id: ['', [Validators.required]],
      // school_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      lesson_id: ['', [Validators.required]],
      version: ['', [Validators.required]],
      zipPath: ['', ''],
      path: ['', [Validators.required]],
      appZipPath: ['',''],
      encryptionKey: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    this.route.params.subscribe(params => {
      this.content_id = params['content_id'];
      if (this.content_id) {
        this.pageTitle = `Update Content`;
        this.getContent();
      } else {
        this.pageTitle = 'Add Content';
        this.contentForm.patchValue({
          version: 1
        })
      }
    });

    this.route.queryParams.subscribe((paramsData: any) => {
      if (Object.keys(paramsData).length != 0) {

        if (paramsData.board_id) {
          this.board_id = parseInt(paramsData.board_id);
          this.changeBoard(this.board_id);
          this.contentForm.patchValue({ board_id: this.board_id });
        }
        if (paramsData.class_id) {
          this.class_id = parseInt(paramsData.class_id);
        this.changeClass(this.class_id);
        this.contentForm.patchValue({ class_id: this.class_id });
        }
        if (paramsData.subject_id) {
          this.subject_id = parseInt(paramsData.subject_id);
          this.changeSubject(this.subject_id);
          this.contentForm.patchValue({ subject_id: this.subject_id });
        }
        if (paramsData.lesson_id) {
          this.lesson_id = parseInt(paramsData.lesson_id);
          this.changeLesson(this.lesson_id);
          this.contentForm.patchValue({ lesson_id: this.lesson_id });
        }
      }
    })


    this.getBoards();
  }

  getBoards(nonAcademicVal = 0) {
    const paramsVal = { non_academic: nonAcademicVal };
    this.contentService.getBoards(paramsVal).subscribe((result: any) => {
      this.boards = result.data;
    });
  }

  changeBoard(strVal, defaultVal = 0) {
    let paramsVal = { board_id: strVal };
    let obj = {}
    // Update the data on the form
    this.contentService.getActiveSchools(obj).subscribe((result: any) => {
      this.schoolList = result.data;
    });
    this.contentService.getClasses(paramsVal).subscribe((result: any) => {
      this.classList = result.data;
    });
    this.contentTypeDisable = true;
  }

  changeClass(class_id) {
    this.sectionIdArr = [class_id];
    this.lessonList = null;
    let classObj = { class_id: this.sectionIdArr }
    this.contentService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
    this.contentTypeDisable = true;
  }

  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    this.contentService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessonList = result.data;
    });
    this.contentTypeDisable = true;
  }

  changeLesson(strVal, defaultVal = 0) {
    this.showFile = true;
  }

  // changecontentType(contentType) {
  //   this.contentForm.controls.path.setValue('');
  //   this.contentForm.controls.zipPath.setValue('');
  //   if (contentType == 6) {
  //     this.showFile = false;
  //     this.showInput = true;
  //   } else {
  //     this.showInput = false;
  //     this.showFile = true;
  //   }

  //   this.contentForm.value.content_type;
  //   if (this.contentForm.value.content_type == 1) {
  //     this.fileType = 'zip, ZIP'
  //   } else if (this.contentForm.value.content_type == 2) {
  //     this.fileType = 'html, HTML'
  //   } else if (this.contentForm.value.content_type == 3) {
  //     this.fileType = 'mp4, MP4'
  //   } else if (this.contentForm.value.content_type == 4) {
  //     this.fileType = 'pdf, PDF'
  //   } else if (this.contentForm.value.content_type == 5) {
  //     this.fileType = 'jpg, JPG, JPEG, jpeg'
  //   }
  // }

  onFileChange(event) {
    console.log('event', event)
    if (event.target.files.length > 0) {
      this.contentForm.controls.path.setValue('');
      this.contentForm.controls.zipPath.setValue('');
      this.uploadResponse.message = '';
      this.fileData = event.target.files[0] as File;
      const fileName = this.fileData.name;
      console.log("fine", fileName)
      let extension = fileName.split('.').pop();
      let chkExtension = this.checkExtension(extension);
      // console.log(this.fileData)
      // console.log(chkExtension);
      if (chkExtension) {
        this.errorMessage = "";

        const formData = new FormData();
        // console.log(this.fileData);
        formData.append('files', this.fileData);
        // formData.append('board_id', this.contentForm.value.board_id);
        // formData.append('class_id', this.contentForm.value.class_id);
        // formData.append('section_id', this.contentForm.value.section_id);
        // formData.append('lesson_id', this.contentForm.value.lesson_id);
        this.fileUploadProgress = '0%';
        let boardId = this.contentForm.value.board_id;
        let classId = this.contentForm.value.class_id;
        let subjectId = this.contentForm.value.subject_id;
        let lessonId = this.contentForm.value.lesson_id;
        let version = this.contentForm.value.version;

        if (this.content_id) {
          let dec = (version % 1).toFixed(1);
          if (dec == '0.9') {
            version = parseInt(version) + 1
          } else {
            version = parseFloat(this.contentForm.value.version) + 0.1
            version = (version).toFixed(1);
          }
        }
        
        this.http.post(`${this.apiUrl}/containers/uploadAppContent?board_id=${boardId}&class_id=${classId}&subject_id=${subjectId}&lesson_id=${lessonId}&version=${version}`,
          formData, {
          reportProgress: true,
          observe: 'events'
        })
          .subscribe(events => {
            if (events.type === HttpEventType.UploadProgress) {
              if (events.loaded != events.total) {
                this.fileUploadProgress = Math.round((events.loaded / events.total) * 100) + '%';
              }
            } else if (events.type === HttpEventType.DownloadProgress) {
              this.fileUploadProgress = "100%"
            } else if (events.type === HttpEventType.Response) {
              let response;
              response = events.body;
              console.log(response);
              this.contentForm.controls.zipPath.setValue(response.fileName);
              // console.log(response.url); //https://storage.googleapis.com/lms-app/content/2021-6-14/773376917862185.zip
              let pathUrl = response.fileName.replace('.7z', '/index.html');
              console.log(pathUrl);
              this.contentForm.controls.path.setValue(pathUrl);
            }
          });
      }
      else {
        this.fileUploadProgress = '';
        this.errorMessage = "Only 7z file is allowed. Please try again!";
        return;
      }
    }
    // alert("under maintenance");
  }

  onAppFileChange(event) {
    console.log('event', event)
    if (event.target.files.length > 0) {
      this.uploadResponse.message = '';
      this.fileData = event.target.files[0] as File;
      const fileName = this.fileData.name;
      // console.log("fine", fileName)
      let extension = fileName.split('.').pop();
      let chkExtension = this.checkExtension(extension);
      // console.log(this.fileData)
      // console.log(chkExtension);
      if (chkExtension) {
        this.errorMessage = "";

        const formData = new FormData();
        // console.log(this.fileData);
        formData.append('files', this.fileData);
        // formData.append('board_id', this.contentForm.value.board_id);
        // formData.append('class_id', this.contentForm.value.class_id);
        // formData.append('section_id', this.contentForm.value.section_id);
        // formData.append('lesson_id', this.contentForm.value.lesson_id);
        this.appFileUploadProgress = '0%';
        let boardId = this.contentForm.value.board_id;
        let classId = this.contentForm.value.class_id;
        let subjectId = this.contentForm.value.subject_id;
        let lessonId = this.contentForm.value.lesson_id;
        let version = this.contentForm.value.version;

        if (this.content_id) {
          let dec = (version % 1).toFixed(1);
          if (dec == '0.9') {
            version = parseInt(version) + 1
          } else {
            version = parseFloat(this.contentForm.value.version) + 0.1
            version = (version).toFixed(1);
          }
        }
        
        this.http.post(`${this.apiUrl}/containers/uploadAppContent?board_id=${boardId}&class_id=${classId}&subject_id=${subjectId}&lesson_id=${lessonId}&version=${version}`,
          formData, {
          reportProgress: true,
          observe: 'events'
        })
          .subscribe(events => {
            if (events.type === HttpEventType.UploadProgress) {
              if (events.loaded != events.total) {
                this.appFileUploadProgress = Math.round((events.loaded / events.total) * 100) + '%';
              }
            } else if (events.type === HttpEventType.DownloadProgress) {
              this.appFileUploadProgress = "100%"
            } else if (events.type === HttpEventType.Response) {
              let response;
              response = events.body;
              // console.log(response);
              this.contentForm.controls.appZipPath.setValue(response.fileName);
              // console.log(response.url); //https://storage.googleapis.com/lms-app/content/2021-6-14/773376917862185.zip
            }
          });
      }
      else {
        this.appFileUploadProgress = '';
        this.errorMessage = "Only 7z file is allowed. Please try again!";
        return;
      }
    }
    // alert("under maintenance");
  }


  savecontent() {
    let obj = {};
    if (this.content_id) {
      // console.log(obj);
      let ver = this.contentForm.value.version;
      let dec = (ver % 1).toFixed(1);
      if (dec == '0.9') {
        this.contentForm.value.version = parseInt(this.contentForm.value.version) + 1
      } else {
        this.contentForm.value.version = parseFloat(this.contentForm.value.version) + 0.1
        this.contentForm.value.version = (this.contentForm.value.version).toFixed(1);
      }
      // console.log(this.contentForm.value.version);
      obj = Object.assign({},
        { content_id: this.content_id },
        { modified_by: this.user_id },
        this.contentForm.value);
      this.contentService.update(obj).subscribe((data: any) => {
        console.log("DATA", data)
        if (data.status == true) {
          this.router.navigate(['/appcontent']);
          this.openSnackBar('Content has been updated successfully. ', 'Close');
        } else {
          this.errorMessage = data;
        }
      })
    } else {
      obj = Object.assign({}, { created_by: this.user_id }, { modified_by: this.user_id }, { created_on: new Date() }, this.contentForm.value);
      // obj = this.contentForm.value;
      // console.log(obj);
      this.contentService.create(obj).subscribe((data: any) => {
        if (data.status == true) {
          this.router.navigate(['/appcontent']);
          this.openSnackBar('Content has been added successfully. ', 'Close');
        } else {
          this.errorMessage = data;
        }
      })
    }
    // this.contentService.create(obj).subscribe((data:any) => {
    //   if(data.status == true){
    //     this.router.navigate(['/content']);
    //     this.openSnackBar('Content has been updated successfully. ', 'Close');
    //   }
    // })
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  getContent() {
    let obj = {
      content_id: this.content_id
    }
    this.contentService.getContentById(obj).subscribe((contentData: any) => {
      this.contentData = contentData.data;
      this.uploadStatus = this.contentData.uploadStatus;

      this.changeBoard(this.contentData.board_id);
      this.changeClass(this.contentData.class_id);
      this.changeSubject(this.contentData.subject_id);
      // this.changecontentType(this.contentData.content_type);
      this.changeLesson(this.contentData.lesson_id);
      this.contentForm.patchValue({
        board_id: this.contentData.board_id,
        class_id: this.contentData.class_id,
        subject_id: this.contentData.subject_id,
        lesson_id: this.contentData.lesson_id,
        version: this.contentData.version,
        path: this.contentData.path,
        zipPath: this.contentData.zipPath,
        encryptionKey: this.contentData.encryptionKey,
        status: this.contentData.status
      });
    });
  }

  previewFile() {
    this.router.navigate(['/appcontentdata', this.content_id, this.contentForm.value.lesson_id]);
  }


  checkExtension(extension) {
    if (extension == '7z' || extension == '7Z') {
      return true;
    }
  }
}
