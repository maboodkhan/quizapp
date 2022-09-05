import { Component, OnInit, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-coupon-import',
  templateUrl: './coupon-import.component.html',
  styleUrls: ['./coupon-import.component.css']
})

export class CouponImportComponent implements OnInit {
  showVal = false;
  description = 'Import Coupons';
  fileData: File = null;
  fileUploadProgress: string = null;
  error: any;
  uploadResponse = { status: '', message: '', file: '' };
  currentUser: any;
  userid: any;
  apiUrl = environment.apiUrl;
  syllabusId: any;
  importData: any;
  couponValues: any;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private dialogRef: MatDialogRef<CouponImportComponent>,
    @Inject(MAT_DIALOG_DATA) data
    ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
        this.userid = this.currentUser.id;
    }
    this.form = this.fb.group({
      couponFile: [''],
    });
  }

  close() {
    this.dialogRef.close();
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      this.showVal = false;
      this.importData = '';
      this.uploadResponse.message = '';
      const file = event.target.files[0] as File;
      let fileName = file.name;
      if (fileName.indexOf('.csv') > 0) {
        this.form.get('couponFile').setValue(file);
        this.error = '';
      } else {
        this.form.reset();
        this.error = {message: 'Only *.csv file is allowed. Please try again.'};
      }
    }
  }

  onSubmit() {
    if(!this.form.get('couponFile').value){
      this.error = {message: 'Please select a file.'};
      return;
    }
    this.importData = '';
    this.showVal = false;
    const formData = new FormData();
    formData.append('file', this.form.get('couponFile').value);
    this.fileUploadProgress = '0%';
    this.http.post(`${this.apiUrl}/coupons/couponUpload`, formData, {
      reportProgress: true,
      observe: 'events'
    })
    .subscribe(events => {
      if (events.type === HttpEventType.UploadProgress) {
        this.fileUploadProgress = Math.round((events.loaded / events.total) * 100) + '%';
      } else if (events.type === HttpEventType.Response) {
        let result;
        result = events.body;
        // console.log(response);
        this.uploadResponse = result.response;
      }
    });
  }

  getImportDetails(file: string) {
    const getImportDetails = `${this.apiUrl}/coupons/getImportDetails/${file}`;
    this.http.get(getImportDetails).subscribe((response: any) => {
        this.importData = response.response.slice(0, -1);
        this.couponValues = this.importData.split(',').sort();
        if (!this.importData) {
          this.showVal = true;
        }
    });
  }

}
