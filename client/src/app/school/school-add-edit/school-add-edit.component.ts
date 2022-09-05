import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControlName } from '@angular/forms';
import { GenericValidator } from 'src/app/shared';
import { Observable } from 'rxjs';
import { SchoolService } from '../school.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-school-add-edit',
  templateUrl: './school-add-edit.component.html',
  styleUrls: ['./school-add-edit.component.css']
})
export class SchoolAddEditComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  schoolForm: FormGroup;
  displayMessage: { [key: string]: string } = {};
  status = { 1: 'Active', 2: 'Inactive' };
  school_id: any;
  publish_status = {};
  pageTitle: string;
  schoolData: any;
  testUrl : any;
  countryList = [];
  fileData: File = null;
  errorMessage: any;
  fileUploadProgress: string = null;
  apiUrl = environment.apiUrl;

  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private schoolService: SchoolService,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    this.validationMessages = {
      country_id: {
        required: 'Country is required.'
      },
      school_name: {
        required: 'School name is required.'
      },
      school_code: {
        required: 'School code is required.'
      },
      publish_status: {
        required: 'Publish Status is required.'
      },
      status: {
        required: 'Status is required.'
      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.school_id = params['school_id'];
      if (this.school_id) {
        this.pageTitle = `Update School`;
        this.getSchool();
      } else {
        this.pageTitle = 'Add School';
      }
    }
    );

    this.schoolForm = this.fb.group({
      country_id: ['', Validators.required],
      school_name: ['', [Validators.required]],
      address: ['', ''],
      school_code: ['', [Validators.required]],
      school_logo: ['', ''],
      publish_status: [''],
      status: ['', [Validators.required]]
    });

    this.schoolService.getCountries().subscribe((data: any) => {
      this.countryList = data.data;
    })

  }

  ngAfterViewInit(): void {
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    Observable.merge(this.schoolForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.schoolForm);
    });
  }


  saveSchool() {
    if (this.school_id) {
      this.editSchool();
    }
    else {
      this.addSchool();
    }
  }

  addSchool() {
    this.schoolService.createdSchool(this.schoolForm.value).subscribe((response: any) => {
      if (response.status == true) {
        this.router.navigate(['/school']);
        this.openSnackBar('School has been created successfully. ', 'Close');
      }
    });
  }


  editSchool() {
    let editObj = {
      school_id: this.school_id,
      country_id: this.schoolForm.value.country_id,
      school_name: this.schoolForm.value.school_name,
      school_code: this.schoolForm.value.school_code,
      school_logo: this.schoolForm.value.school_logo,
      address: this.schoolForm.value.address,
      publish_status: this.schoolForm.value.publish_status,
      status: this.schoolForm.value.status
    }
    this.schoolService.updateSchool(editObj).subscribe((response: any) => {
      if (response.status == true) {
        this.router.navigate(['/school']);
        this.openSnackBar('School has been updated successfully. ', 'Close');
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  getSchool() {
    let obj = {
      school_id: this.school_id
    }
    this.schoolService.getSchoolById(obj).subscribe((schoolData: any) => {
      console.log(schoolData);
      this.schoolData = schoolData.data;
      this.schoolForm.patchValue({
        country_id: this.schoolData.schoolCountry.id,
        school_name: this.schoolData.school_name,
        address: this.schoolData.address,
        school_code: this.schoolData.school_code,
        school_logo: this.schoolData.school_logo,
        publish_status: this.schoolData.publish_status,
        status: this.schoolData.status.toString()
      });
    });
  }

  previewFile(){
      window.open(this.schoolData.school_logo);
  }

  checkLogo(){
    window.open(this.testUrl);
  }


  onFileChange(event) {
    if (event.target.files.length > 0) {
      this.fileData = event.target.files[0] as File;
      const fileName = this.fileData.name;
      if (fileName.indexOf('.jpg') > 0 || fileName.indexOf('.JPG') > 0 || 
          fileName.indexOf('.png') > 0 || fileName.indexOf('.PNG') > 0 ||
          fileName.indexOf('.jpeg') > 0 || fileName.indexOf('.JPEG') > 0) {
        this.errorMessage = "";
      }
      else {
        this.fileUploadProgress = '';
        this.errorMessage = "Only .jpeg, .jpg, .png files are allowed"
        return;
      }
      const formData = new FormData();
      formData.append('files', this.fileData);
      this.fileUploadProgress = '0%';
      this.http.post(`${this.apiUrl}/containers/uploadSchoolLogo`, formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe(events => {
          if (events.type === HttpEventType.UploadProgress) {
            this.fileUploadProgress = Math.round((events.loaded / events.total) * 100) + '%';
          } else if (events.type === HttpEventType.Response) {
            let response;
            response = events.body;
            this.schoolForm.controls.school_logo.setValue(response.url);
            this.testUrl = response.url;
          }
        });
    }
  }

}
