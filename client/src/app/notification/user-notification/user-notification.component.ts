import { Component, OnInit, ViewChildren, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '../../user/user';
import { Observable, Subscription } from 'rxjs';
import { GenericValidator } from '../../shared/generic-validator';
import { MatSnackBar, MatOption } from '@angular/material';
import { NotificationService } from '../notification.service';


@Component({
  selector: 'app-user-notification',
  templateUrl: './user-notification.component.html',
  styleUrls: ['./user-notification.component.css']
})
export class UserNotificationComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;
  
  user: IUser = {} as IUser;
  pageTitle = 'User Notifications';
  errorMessage: any;
  userForm: FormGroup;
  status = {1: 'Active', 2: 'Inactive'};
//  status = [{id: 1, statusVal: 'Active'}, {id: 2, statusVal: 'Inactive'}];
  displayMessage: { [key: string]: string } = {};
  currentUser: any;
  token: string;
  formSubmit = false;
  userTypes: any;
  departments: any;
  userId: string;
  department: string;
  users: any;
  salesUsers: any;
  schoolList: any;
  classList: any;
  sectionList: any;
  id: any;
  assignedUser: any;
  type_order: number;
  deepLink: any;
  classNames = [
    {
      class_id: 7,
      className: 'Grade 7'
    },
    {
      class_id:8,
      className: 'Grade 8'
    },
    {
      class_id:9,
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
      title: {
        required: 'Title is required.'
      },
      message: {
          required: 'Message is required.'
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
      this.notificationService.getAppDeepLink({}).subscribe((data: any) => {
        // console.log(data);
        this.deepLink = data.data;
      })
    }

    this.userForm = this.fb.group({
      class_id: ['', ''],
      email: ['', ''],
      contactNumber: ['', ''],     
      title:['',[Validators.required]],
      message:['',[Validators.required]],
      deep_link: ['', ''],
      image_url: ['', '']
    });
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

  sendNotification(): void {
    if (this.userForm.dirty && this.userForm.valid) {
      let obj = Object.assign({}, {created_by: this.userId}, this.userForm.value);
      let imageUrlVal = this.userForm.value.image_url;
      if((imageUrlVal === '')
          || (imageUrlVal.match(/^(http|https)/i) != null &&
              imageUrlVal.match(/\.(jpeg|jpg)$/) != null)){
        this.notificationService.sendUserNotification(obj).subscribe((result:any) =>{
          this.onSaveComplete(result.message);
        });
      }else{
        this.onSaveComplete("Image Url is not in format");
      }
    } 
  }

  onSaveComplete(message): void {   
    // if(this.formSubmit){
      this.openSnackBar(message, 'Close');     
      // this.router.navigate(['/user']);  
    // }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
        duration: 1500,
    });
}

  onFormSubmit(): void{
      this.formSubmit = true;
  }
}
