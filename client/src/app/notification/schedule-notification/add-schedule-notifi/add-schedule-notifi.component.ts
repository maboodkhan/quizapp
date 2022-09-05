import { Component, OnInit, ViewChildren, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '../../../user/user';
import { Observable, Subscription } from 'rxjs';
import { GenericValidator } from '../../../shared/generic-validator';
import { MatSnackBar, MatOption } from '@angular/material';
import { NotificationService } from '../../notification.service';
import * as ClassicEditor from '../../../../assets/js/ck-editor-mathtype/ckeditor.js';
import stripHtml from '../../../../../node_modules/string-strip-html';

@Component({
  selector: 'app-add-schedule-notifi',
  templateUrl: './add-schedule-notifi.component.html',
  styleUrls: ['./add-schedule-notifi.component.css']
})
export class AddScheduleNotifiComponent implements OnInit {
  // AddScheduleNotifiComponent
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;

  public Editor = ClassicEditor ;
  user: IUser = {} as IUser;
  pageTitle = 'Send User Notifications';
  errorMessage: any;
  userForm: FormGroup;
  status = { 1: 'Active', 2: 'Inactive' };
  //  status = [{id: 1, statusVal: 'Active'}, {id: 2, statusVal: 'Inactive'}];
  displayMessage: { [key: string]: string } = {};
  currentUser: any;
  token: string;
  formSubmit = false;
  userTypes: any;
  userId: string;
  users: any;
  id: any;
  type_order: number;
  deepLink: any;
  notificationType: any;
  subNotifiType: any;
  scheduleDate: boolean;
  notification_id: number;
  notificationData: any;
  countries: any;
  countryArr = [];
  classArr = [];
  classNames = [
    {
      class_id: 7,
      className: 'Grade 7'
    },
    {
      class_id: 8,
      className: 'Grade 8'
    },
    {
      class_id: 9,
      className: 'Grade 9'
    },
    {
      class_id: 10,
      className: 'Grade 10'
    }
  ];


  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  private sub: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService) {
    this.validationMessages = {
      country_id: {
        required: 'Country is required.'
      },
      class_id: {
        required: 'Class is required.'
      },
      title: {
        required: 'Title is required.'
      },
      message: {
        required: 'Message is required.'
      },
      notificationTypeId: {
        required: 'Notification Type is required'
      },
      subNotificationTypeId: {
        required: 'Lable Frequency is required'
      },
      status: {
        required: 'Status is required.'
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

      this.notificationService.getCountries({}).subscribe((data: any) => {
        this.countries = data.data;
      });

      this.notificationService.getAppDeepLink({}).subscribe((data: any) => {
        this.deepLink = data.data;
      });
      this.notificationService.notificationType({}).subscribe((data: any) => {
        this.notificationType = data.data;
      });

      this.route.params.subscribe(params => {
        this.notification_id = parseInt(params['notification_id']);
        if (this.notification_id) {
          this.getNotification();
        }
      });
    }

    this.userForm = this.fb.group({
      country_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      title: ['', [Validators.required]],
      message: ['', [Validators.required]],
      emailMessage: ['', ''],
      deep_link: ['', ''],
      image_url: ['', ''],
      notificationTypeId: ['', [Validators.required]],
      subNotificationTypeId: ['', [Validators.required]],
      notifyScheduleDate: ['', ''],
      dayHourMinuts: ['', ''],
      userRegFromDate: ['', ''],
      userRegToDate: ['', ''],
      status: ['', [Validators.required]]
    });
  }


  getNotification() {
    let notificationObj = { notification_id: this.notification_id }
    this.notificationService.getNotificationById(notificationObj).subscribe((data: any) => {
      // console.log(data);
      this.notificationData = data.data;
      this.notificationData.notificationDetails.forEach(element => { 
        if(!this.classArr.includes(element.class_id)) {
          this.classArr.push(element.class_id);
        }        
        if(!this.countryArr.includes(element.country_id)) {
          this.countryArr.push(element.country_id);
        }
      });
      this.changeNotifiType(this.notificationData.notificationTypeId);
      // console.log(this.notificationData.deep_link);
      let date;
      if (this.notificationData.dayHour && this.notificationData.dayMinutes) {
        date = new Date();
        date.setHours(this.notificationData.dayHour);
        date.setMinutes(this.notificationData.dayMinutes);
      }
      if (this.notificationData.subNotificationType.type_value == 0) {
        this.scheduleDate = true;
      } else { this.scheduleDate = false }
      // subNotificationType
      if(this.notificationData.emailMessage != null){
        this.notificationData.emailMessage = this.getEmailMessage(this.notificationData.emailMessage);
      }
      this.userForm.patchValue({
        country_id: this.countryArr,
        class_id: this.classArr,
        notificationTypeId: this.notificationData.notificationTypeId,
        subNotificationTypeId: this.notificationData.subNotificationTypeId,
        notifyScheduleDate: this.notificationData.notifyScheduleDate,
        dayHourMinuts: date,
        title: this.notificationData.title,
        message: this.notificationData.message,
        emailMessage: this.notificationData.emailMessage,
        deep_link: this.notificationData.deep_link,
        image_url: this.notificationData.image_url,
        userRegFromDate: this.notificationData.userRegFromDate,
        userRegToDate: this.notificationData.userRegToDate,
        status: this.notificationData.status
      });
    })
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.userForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.userForm);
    });
  }

  changeNotifiType(notificationTypeId) {
    let subNotifiObj = { notificationTypeId: notificationTypeId }
    this.notificationService.subNotification(subNotifiObj).subscribe((result: any) => {
      this.subNotifiType = result.data;
      // console.log("zxcvbnm",this.subNotifiType);
    })
    this.scheduleDate = false;
    this.userForm.patchValue({ dayHourMinuts: "" });
    if (this.userForm.value.notifyScheduleDate) {
      this.userForm.controls.notifyScheduleDate.setValue(null);
    }
    if (this.userForm.value.dayHourMinuts) {
      this.userForm.controls.dayHourMinuts.setValue(null);
    }
  }

  changeSubNotifiType(subNotificationTypeId) {
    if (this.userForm.value.notifyScheduleDate) {
      this.userForm.controls.notifyScheduleDate.setValue(null);
    }
    if (this.userForm.value.dayHourMinuts) {
      this.userForm.controls.dayHourMinuts.setValue(null);
    }
    // console.log("qwerty",this.subNotifiType);
    this.subNotifiType.forEach(element => {
      if (element.id == subNotificationTypeId) {
        if (element.type_value == 0) {
          this.scheduleDate = true;
        } else { this.scheduleDate = false }
      }
    });
    // this.userForm.controls.subNotificationTypeId.patchValue(data.id);
    // this.userForm.controls.subNotificationTypeId.setValue(data.id);
    // this.userForm.patchValue({ subNotificationTypeId: data.id });
    // this.userForm.value.subNotificationTypeId = data.id;
    // if(data.type_value == 0){
    //   this.scheduleDate = true;
    // }else{this.scheduleDate = false}
  }

  sendNotification(): void {
    if (this.userForm.dirty && this.userForm.valid) {
     if(!this.userForm.value.notifyScheduleDate && !this.userForm.value.dayHourMinuts){
      this.errorMessage = {message : "Notify date or time is required"} 
      return;
     }
      let obj = {}
      if (this.notification_id) {
        obj = Object.assign({}, { notification_id: this.notification_id }, { modified_by: this.userId }, this.userForm.value);
        // console.log(obj);
      }else{
        obj = Object.assign({}, { created_by: this.userId }, { created_on: new Date() }, this.userForm.value);
      }

      this.notificationService.addNotification(obj).subscribe((result:any) =>{
        this.onSaveComplete(result.message);
        if(result.status){         
          this.router.navigate(['/scheduleNotifications']);
        }
      });

      /* if(this.userForm.value.image_url.match(/^(http|https)/i) != null &&
        this.userForm.value.image_url.match(/\.(jpeg|jpg)$/) != null){
        this.notificationService.addNotification(obj).subscribe((result:any) =>{
          this.onSaveComplete(result.message);
          this.router.navigate(['/scheduleNotifications']);
        });
      }else{
        this.onSaveComplete("Image Url is not in format");
      } */
    }
  }

  onSaveComplete(message): void {
    // if(this.formSubmit){
    this.openSnackBar(message, 'Close');
    // }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  onFormSubmit(): void {
    this.formSubmit = true;
  }

  decodeEntities(str) {
    // this prevents any overhead from creating the object each time
    const element = document.createElement('div');
    if (str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^''>]|'[^']*'|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }
    str = str.replace(/src="/g, `src="`);
    return str;
  }
  
  getEmailMessage(emailMessage){
    const stripOption = {
      ignoreTags: ['xml'],
      onlyStripTags: ['span'],
      stripTogetherWithTheirContents: ['script'],
      skipHtmlDecoding: false,
      returnRangesOnly: false,
      trimOnlySpaces: false,
      dumpLinkHrefsNearby: {
        enabled: false,
        putOnNewLine: false,
        wrapHeads: '',
        wrapTails: ''
      }
    };
  
    let desc = this.decodeEntities(emailMessage);
    desc = desc.replace(/\r?\n|\r/g, '');
    desc = desc.replace(/>\s+</g, '><');
    let dstr1 = desc.indexOf('annotation');
    do {
      if (desc.indexOf('/annotation') > -1) {
        const dstr3 = '/annotation';
        const dstr2 = desc.indexOf('/annotation') + dstr3.length + 2;
        const dres = desc.substring(dstr1, dstr2);
        desc = desc.replace(dres, '');
      }
      dstr1 = desc.indexOf('annotation');
    }while (dstr1 !== -1);
    desc = stripHtml(desc, stripOption);
    return desc;
    // console.log(des)
  
  }
}
