import { Component, OnInit, ViewChildren, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '../user';
import { UserService } from '../user.service';
import { Observable, Subscription } from 'rxjs';
import { GenericValidator } from '../../shared/generic-validator';
import { MatSnackBar, MatOption } from '@angular/material';

@Component({
  selector: 'app-user-class-notify',
  templateUrl: './user-class-notify.component.html',
  styleUrls: ['./user-class-notify.component.css']
})
export class UserClassNotifyComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;

  user: IUser = {} as IUser;
  pageTitle = 'Send School Notifications';
  errorMessage: any;
  userForm: FormGroup;
  status = { 1: 'Active', 2: 'Inactive' };
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
  sectionIdArr = [];
  assignedUser: any;
  type_order: number;
  deepLink: any;
  classArr = [];
  sectionArr = [];

  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  private sub: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService) {
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
    }

    this.userService.getAppDeepLink({}).subscribe((data: any) => {
      this.deepLink = data.data;
    })

    this.userForm = this.fb.group({
      email: ['', ''],
      contactNumber: ['', ''],
      school_id: ['', ''],
      class_id: ['', [Validators.required]],
      section_id: ['', ''],
      title: ['', [Validators.required]],
      message: ['', [Validators.required]],
      deep_link: ['', ''],
      image_url: ['', '']
    });

    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.userId).subscribe((data: any) => {
        this.schoolList = data.data;
        // this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
      });

      let classObj = {
        board_id: 1,
        class_id: this.classArr
      }
      this.userService.getClasses(classObj).subscribe((data: any) => {
        this.classList = data.data;
      });
    } else {
      let obj = { user_id: this.userId }
      this.userService.userSchools(obj).subscribe((data: any) => {
        this.classArr = data.userClass;
        this.sectionArr = data.userSection;
        // console.log("here section assign>>>>>>>>>>>>>>>>>>>>>>>>>");
        this.schoolList = data.data;
        if (this.schoolList.length == 1) {
          this.userForm.patchValue({
            school_id: [this.schoolList[0].id]
          });
        }
        let classObj = {
          board_id: 1,
          class_id: this.classArr
        }
        this.userService.getClasses(classObj).subscribe((data: any) => {
          this.classList = data.data;
        });
      });
    }
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
      let obj = Object.assign({}, {sent_by: this.userId}, this.userForm.value);

      let imageUrlVal = this.userForm.value.image_url;
      if((imageUrlVal === '')
          || (imageUrlVal.match(/^(http|https)/i) != null &&
              imageUrlVal.match(/\.(jpeg|jpg)$/) != null)){
        this.userService.sendNotification(obj).subscribe((result:any) =>{
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

  onFormSubmit(): void {
    this.formSubmit = true;
  }

  changeClass(class_id) {
    this.sectionIdArr = class_id;
    let classObj = { class_id: this.sectionIdArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })
  }

  selectAllSection() {
    let sectionVal = [0];
    if (this.allSelectedSection.selected) {
      this.userForm.controls.section_id
        .patchValue([...this.sectionList.map(item => item.id), 0]);
      sectionVal = this.userForm.controls.section_id.value;
    } else {
      this.userForm.controls.section_id.patchValue([]);
    }
  }

}
