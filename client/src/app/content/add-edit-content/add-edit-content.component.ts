import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GenericValidator } from 'src/app/shared';
import { UserService } from 'src/app/user/user.service';
import { environment } from 'src/environments/environment';
import { ContentSearchComponent } from '../content-search/content-search.component';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-add-edit-content',
  templateUrl: './add-edit-content.component.html',
  styleUrls: ['./add-edit-content.component.css']
})
export class AddEditContentComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  boards: any;
  pageTitle = 'Add Content';
  contentUrl = environment.contentUrl;
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
  iconUploadProgress: string = null;
  apiUrl = environment.apiUrl;
  content_id: number;
  contentData: any;
  showInput: boolean = false;
  showFile: boolean = false;
  fileType: any;
  contentTypeDisable: boolean = true;
  countryList = [];
  schoolArr = [];
  classArr = [];
  topics: any;
  customFilters: any;
  showEncryption: boolean = false;
  showSearch: boolean = false;
  topicValue: string;

  constructor(
    private contentService: ContentService,
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService,
    public dialog: MatDialog
  ) {
    this.validationMessages = {
      country_id: {
        required: 'country is required.'
      },
      board_id: {
        required: 'Board is required.'
      },
      school_id: {
        required: 'school is required.'
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
        required: 'topic is required.'
      },
      content_type: {
        required: 'Content Type is required.'
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
      this.countryList = this.currentUser.user_countries;
    }

    const reg = "((http|https)://)(www.)?[a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)";
    this.contentForm = this.fb.group({
      country_id: ['', [Validators.required]],
      school_id: ['', [Validators.required]],
      board_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      lesson_id: ['', [Validators.required]],
      topic_id: ['', [Validators.required]],
      title: ['', [Validators.required]],
      version: ['', [Validators.required]],
      zipPath: ['', ''],
      path: ['', [Validators.required]],
      content_type: ['', [Validators.required]],
      encryptionKey: ['', ''],
      status: ['', [Validators.required]]
    });

    // if (this.type_order == 1 || this.type_order == 2) {
    //   this.userService.getActiveSchools(this.user_id).subscribe((data: any) => {
    //     this.schoolList = data.data;
    //     // this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
    //   });
    // } else {
    //   let obj = { user_id: this.user_id }
    //   this.userService.userSchools(obj).subscribe((data: any) => {
    //     this.schoolList = data.data;
    //     if (this.schoolList.length == 1) {
    //       this.contentForm.patchValue({
    //         school_id: this.schoolList[0].id
    //       });
    //     }
    //     this.classArr = data.userClass;
    //     let classObj = {
    //       board_id: 1,
    //       class_id: this.classArr
    //     }
    //     this.userService.getClasses(classObj).subscribe((data: any) => {
    //       this.classList = data.data;
    //     });
    //   });
    // }

    let classObj = {
      board_id: 1
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });

    this.route.params.subscribe(params => {
      this.content_id = params['content_id'];
      if (this.content_id) {
        this.pageTitle = `Update Content`;
        this.getContent();
      } else {
        this.pageTitle = 'Add Content';
        let selCountryId = this.countryList.length == 1 ? this.countryList[0] : '';
        this.contentForm.patchValue({
          version: 1
        })
        if (selCountryId) {
          this.contentForm.patchValue({
            country_id: selCountryId.countries.id
          });
          this.changeCountry(selCountryId.countries.id);
        }
      }
    });

    this.route.queryParams.subscribe(paramsData => {
      if (paramsData.customFilters) {
        this.customFilters = JSON.parse(paramsData.customFilters);
      }
    })

    this.getBoards();
  }

  getBoards(nonAcademicVal = 0) {
    const paramsVal = { non_academic: nonAcademicVal };
    this.contentService.getBoards(paramsVal).subscribe((result: any) => {
      this.boards = result.data;
      if(this.boards.length == 1){
        this.contentForm.patchValue({
          board_id: this.boards[0].id
        })
      }
    });
  }

  changeCountry(strVal) {
    let params = { country_id: strVal }
    if (this.type_order == 1 || this.type_order == 2) {
      this.contentService.getCountrySchool(params).subscribe((data: any) => {
        this.schoolList = data.data;
        // this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
      });
    } else {
      let obj = { user_id: this.user_id }
      this.userService.userSchools(obj).subscribe((userData: any) => {
        let tempArr = userData.data
        tempArr.forEach(element => { this.schoolArr.push(element.id) });
        let params = { country_id: strVal, school_id: this.schoolArr }
        console.log(userData);
        this.contentService.getCountrySchool(params).subscribe((data: any) => {
          this.schoolList = data.data;
          // console.log(this.schoolList);
          if (this.schoolList.length == 1) {
            this.contentForm.patchValue({
              school_id: this.schoolList[0].id
            });
          }
          this.classArr = userData.userClass;
          let classObj = {
            board_id: 1,
            class_id: this.classArr
          }
          this.userService.getClasses(classObj).subscribe((data: any) => {
            this.classList = data.data;
          });
        })
      });
    }
  }

  changeBoard(strVal, defaultVal = 0) {
    let paramsVal = { board_id: strVal };
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
    this.contentTypeDisable = false;
    const paramsVal = { lesson_id: [strVal] };
    this.contentService.getTopics(paramsVal).subscribe((result: any) => {
      this.topics = result.data;
    });
  }

  changecontentType(contentType) {
    this.contentForm.controls.path.setValue('');
    this.contentForm.controls.zipPath.setValue('');
    this.errorMessage = "";
    if (contentType == 7) {
      this.showSearch = true;
      this.showEncryption = false;
      this.showFile = false;
      this.showInput = true;
    }else if(contentType == 6){
      this.showSearch = false;
      this.showEncryption = false;
      this.showFile = false;
      this.showInput = true;
    }
    else if(contentType == 1){
      this.showSearch = false;
      this.showEncryption = true;
      this.showFile = true;
      this.showInput = false;
    }else {
      this.showSearch = false;
      this.showEncryption = false;
      this.showInput = false;
      this.showFile = true;
    }

    this.contentForm.value.content_type;
    if (this.contentForm.value.content_type == 1) {
      this.fileType = '7z'
    } else if (this.contentForm.value.content_type == 2) {
      this.fileType = 'html'
    } else if (this.contentForm.value.content_type == 3) {
      this.fileType = 'mp4'
    } else if (this.contentForm.value.content_type == 4) {
      this.fileType = 'pdf'
    } else if (this.contentForm.value.content_type == 5) {
      this.fileType = 'jpeg, gif, png'
    }
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      this.contentForm.controls.path.setValue('');
      this.contentForm.controls.zipPath.setValue('');
      this.uploadResponse.message = '';
      this.fileData = event.target.files[0] as File;
      const fileName = this.fileData.name;
      let extension = fileName.split('.').pop();
      let chkExtension = this.checkExtension(extension);
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
          let schoolId = this.contentForm.value.school_id;
          let boardId= this.contentForm.value.board_id;
          let classId= this.contentForm.value.class_id;
          let subjectId= this.contentForm.value.subject_id;
          let lessonId= this.contentForm.value.lesson_id;
          let topicId= this.contentForm.value.topic_id;
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
        // let sybPath = this.contentForm.value.class_id + '/' + this.contentForm.value.subject_id;
        this.http.post(`${this.apiUrl}/containers/uploadContentFile?school_id=${schoolId}&board_id=${boardId}&class_id=${classId}&subject_id=${subjectId}&lesson_id=${lessonId}&topic_id=${topicId}&version=${version}`, 
        formData, {
          reportProgress: true,
          observe: 'events'
        })
          .subscribe(events => {
            // console.log(events);
            if (events.type === HttpEventType.UploadProgress) {
              if(events.loaded != events.total){
                this.fileUploadProgress = Math.round((events.loaded / events.total) * 100) + '%';
              }
            }else if(events.type === HttpEventType.DownloadProgress){
              this.fileUploadProgress = "100%"
            } else if (events.type === HttpEventType.Response) {
              let response;
              response = events.body;
              if (this.contentForm.value.content_type == 1) {
                this.contentForm.controls.zipPath.setValue(response.fileName);
                // console.log(response.url); //https://storage.googleapis.com/lms-app/content/2021-6-14/773376917862185.zip
                let pathUrl = response.url.replace('.7z', '/index.html');
                this.contentForm.controls.path.setValue(pathUrl);
              } else {
                console.log(response);
                this.contentForm.controls.path.setValue(response.fileName);
                this.contentForm.controls.zipPath.setValue('');
              }
            }
          });
      }
      else {
        this.fileUploadProgress = '';
        this.errorMessage = "Please select an " + this.fileType + " file."
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
        console.log(obj);
      this.contentService.update(obj).subscribe((data: any) => {
        if (data.status == true) {
          this.router.navigate(['/content']);
          this.openSnackBar('Content has been updated successfully. ', 'Close');
        } else {
          this.errorMessage = data;
        }
      })
    } else {
      obj = Object.assign({}, 
        { created_by: this.user_id }, 
        { modified_by: this.user_id }, 
        { created_on: new Date() }, 
        this.contentForm.value);
      // obj = this.contentForm.value;
      console.log(obj);
      this.contentService.create(obj).subscribe((data: any) => {
        console.log(data);
        if (data.status == true) {
          this.router.navigate(['/content']);
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
      console.log(this.contentData);
      this.changeCountry(this.contentData.country_id);
      this.changeBoard(this.contentData.board_id);
      this.changeClass(this.contentData.class_id);
      this.changeSubject(this.contentData.subject_id);
      this.changecontentType(this.contentData.content_type);
      this.changeLesson(this.contentData.lesson_id);
      this.contentForm.patchValue({
        country_id: this.contentData.country_id,
        board_id: this.contentData.board_id,
        school_id: this.contentData.school_id,
        class_id: this.contentData.class_id,
        subject_id: this.contentData.subject_id,
        lesson_id: this.contentData.lesson_id,
        topic_id: this.contentData.topic_id,
        title: this.contentData.title,
        version: this.contentData.version,
        path: this.contentData.path,
        zipPath: this.contentData.zipPath,
        encryptionKey: this.contentData.encryptionKey,
        content_type: this.contentData.content_type,
        status: this.contentData.status
      });
    });
  }

  previewFile() {
    if (this.contentForm.value.content_type == 6) {
      window.open(this.contentForm.value.path);
    } else {
      this.router.navigate(['/contentdata', this.content_id], {
        queryParams: {
          customFilters: JSON.stringify(this.customFilters)
        }
      });
    }
  }


  checkExtension(extension) {
    if ((this.contentForm.value.content_type == 1) && (extension == '7z' || extension == '7Z')) {
      return true;
    }
    else if ((this.contentForm.value.content_type == 2) && (extension == 'html' || extension == 'HTML')) {
      return true;
    }
    else if ((this.contentForm.value.content_type == 3) && (extension == 'mp4' || extension == 'MP4')) {
      return true;
    }
    else if ((this.contentForm.value.content_type == 4) && (extension == 'pdf' || extension == 'PDF')) {
      return true;
    }
    else if ((this.contentForm.value.content_type == 5) && (extension == 'jpg' || extension == 'jpeg' || extension == 'JPG' || extension == 'JPEG' || extension == 'png' || extension == 'gif')) {
      return true;
    } else {
      return false;
    }
  }

  openDialog(topicValue) {
    const dialogConfig = new MatDialogConfig ();
    dialogConfig.width = '1000px';
    dialogConfig.height = '600px';
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      topicValue: topicValue
    };
    const dialogRef = this.dialog.open(ContentSearchComponent, dialogConfig);

    dialogRef.afterClosed().subscribe( data => {
      if(data != undefined){
        this.contentForm.patchValue({
          path: data
        });
      }
      }
    );
  }

  getTopicDetails(){
    let topicId = this.contentForm.value.topic_id;

    this.contentService.getTopic(topicId).subscribe((data: any) => {
      if(data.status){
        this.topicValue = data.data.topic_name;
      } else {
        this.topicValue = '';
      }
      this.contentService.getClass(this.contentForm.value.class_id).subscribe((classData: any)=> {
        if(classData.status){
          this.topicValue = this.topicValue + ' for ' + classData.data.class_name
        }
        this.openDialog(this.topicValue);
      })
    });
  }
}
