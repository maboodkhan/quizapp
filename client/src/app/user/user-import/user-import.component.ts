import { Component, OnInit, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-user-import',
  templateUrl: './user-import.component.html',
  styleUrls: ['./user-import.component.css']
})

export class UserImportComponent implements OnInit {
  showVal = false;
  description = 'Import Questions';
  fileData: File = null;
  fileUploadProgress: string = null;
  error: any;
  uploadResponse = { status: '', message: '', file: '' };
  currentUser: any;
  userid: any;
  apiUrl = environment.apiUrl;
  syllabusId: any;
  importData: any;
  leadValues: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<UserImportComponent>,
    @Inject(MAT_DIALOG_DATA) data
    ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
        this.userid = this.currentUser.id;
    }
  }

  close() {
    this.dialogRef.close();
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      this.showVal = false;
      this.uploadResponse.message = '';
      this.fileData = event.target.files[0] as File;
      const fileName = this.fileData.name;
      if (fileName.indexOf('.csv') > 0) {
        this.error = '';
      } else {
        //this.error = {message: 'Only *.csv file is allowed. Please try again.'};
      }
    }
  }

  onSubmit() {
    const formData = new FormData();
    // console.log(this.fileData);
    formData.append('files', this.fileData);
    this.fileUploadProgress = '0%';
    // console.log(formData);
    this.http.post(`${this.apiUrl}/user_data/userUpload`, formData, {
      //this.http.post(`${this.apiUrl}/containers/lms-app/upload`, formData, {
    //this.http.post(`${this.apiUrl}/containers/uploadfile`, formData, {
      // this.http.post(`${this.apiUrl}/question_issues/reportissue`, formData, {
      reportProgress: true,
      observe: 'events'
    })
    .subscribe(events => {
      if (events.type === HttpEventType.UploadProgress) {
        this.fileUploadProgress = Math.round((events.loaded / events.total) * 100) + '%';
       // console.log(this.fileUploadProgress);
      } else if (events.type === HttpEventType.Response) {
        let response;
        response = events.body;
        this.uploadResponse.message = response.message;
        this.uploadResponse.file = response.file;
      }
    });
    // this.questionService.uploadQuestion(formData)
    // .subscribe((result) => {
    //   console.log(result);
    //   if (result) {
    //     let response;
    //     response = result;
    //     this.uploadResponse.message = response.message;
    //   }
    // }),
    // (error: any) => this.error = error as any;
  }

  getImportDetails(file: string) {
    // console.log(file);
    const getImportDetails = `${this.apiUrl}/user_data/getImportDetails/${file}`;

    this.http.get(getImportDetails).subscribe((result) => {
      // console.log(result);
      this.importData = result;
      this.importData = this.importData.response;
      if (!this.importData) {
        this.showVal = true;
      } else {
        this.leadValues = this.importData.split(',').sort();
      }
    });
  }
}
