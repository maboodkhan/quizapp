import { Component, OnInit, ViewChildren, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { MatSnackBar, MatOption } from '@angular/material';
import { GenericValidator } from '../../shared/generic-validator';
import { IUser } from '../../user/user';
import { Router } from '@angular/router';
import { ReportService } from './../report.service';
import { DownloadService } from './../download.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.css'],
  providers: [DatePipe]
})
export class PushNotificationComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];

  user: IUser = {} as IUser;
  pageTitle = 'Push Notification Report';
  errorMessage: any;
  reportForm: FormGroup;
  status = { 1: 'Active', 2: 'Inactive' };
  //  status = [{id: 1, statusVal: 'Active'}, {id: 2, statusVal: 'Inactive'}];
  displayMessage: { [key: string]: string } = {};
  currentUser: any;
  token: string;
  formSubmit = false;
  userId: string;
  showToday = false;
  type_order: number;
  reportData: any;
  reportArr = [];

  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  private sub: Subscription;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    public datepipe: DatePipe,
    private reportService: ReportService,
    private downloadService: DownloadService) {
    this.validationMessages = {
      report: {
        required: 'Report is required.'
      }
    };

    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.token = this.currentUser.token;
      this.userId = this.currentUser.id;
      this.type_order = this.currentUser.user_Type.type_order;
    }

    this.reportForm = this.fb.group({
      notificationReport: ['', [Validators.required]],
      day: ['', '']
    });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.reportForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.reportForm);
    });
  }

  sendNotification(): void {
    this.reportArr = [];
    let obj = {
      notificationReport: "",
      day: 0
    };
    if (this.reportForm.value.notificationReport) {
      if (this.reportForm.value.notificationReport == 1) {
        obj.notificationReport = "User Notification";
      }
      else if (this.reportForm.value.notificationReport == 2) {
        obj.notificationReport = "Class Notification";
      }
      else if (this.reportForm.value.notificationReport == 3) {
        obj.notificationReport = "Schedule Notification";
      }
      else if (this.reportForm.value.notificationReport == 4) {
        obj.notificationReport = "Class Reschedule";
      }
    }
    obj.day = this.reportForm.value.day;

    this.reportService.getlogs(obj).subscribe((data: any)=> {
      this.reportData = data.data;
      this.reportData.forEach(report => {
        let newDate = this.datepipe.transform(report.sent_on, 'dd-MM-yyyy h:mm a');
        let senderFirstName = (report.sendByUser.firstName?report.sendByUser.firstName:'');
        let senderLastName = (report.sendByUser.lastName?report.sendByUser.lastName:'');
        let customerFirstName = (report.sendToUser.firstName?report.sendToUser.firstName: '');
        let customerLastName = (report.sendToUser.lastName?report.sendToUser.lastName: '');
        let reportObj = {
          class_id: 'Grade - ' + report.class_id,
          title: report.title,
          message: report.message,
          module: report.module,
          notification_status: report.notification_message,
          sent_by: senderFirstName + ' ' + senderLastName,
          customer_name: customerFirstName + ' ' + customerLastName,
          customer_number: report.sendToUser.contactNumber,
          sent_on: newDate
        }
        this.reportArr.push(reportObj);
      });
      // console.log(this.reportArr);
      this.downloadService.downloadFile(this.reportArr, 'notification-report');
      // this.downloadService
      
    })
  }

  onSaveComplete(message): void {
    this.openSnackBar(message, 'Close');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  onFormSubmit(): void {
    this.formSubmit = true;
  }
}
