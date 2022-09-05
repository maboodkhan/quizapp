import { Component, OnInit, ViewChildren, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IUser } from '../user';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { Observable, Subscription } from 'rxjs';
import { GenericValidator } from '../../shared/generic-validator';
import { MatSnackBar, MatOption } from '@angular/material';

@Component({
  selector: 'app-user-data-add-edit',
  templateUrl: './user-data-add-edit.component.html',
  styleUrls: ['./user-data-add-edit.component.css']
})

export class UserDataAddEditComponent implements OnInit, AfterViewInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;

  pageTitle = 'Add Student/Teacher';
  errorMessage: any;
  userForm: FormGroup;
  user: any;
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
  subjectList: any;
  id: any;
  sectionIdArr = [];
  assignedUser: any;
  type_order: any;
  suggestEmail: any;
  suggestContact: any;
  classArr = [];
  sectionArr = [];
  userType: number;
  renewedGrade = [];

  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private userService: UserService) {
    this.validationMessages = {
      studentName: {
        required: 'Student Name is required.'
      },
      email: {
        pattern: 'Invalid email address.'
      },
      studentContactNo: {
        maxlength: 'Contact number cannot exceed 10 characters.'
      },
      city: {
        required: 'city is required.'
      },
      user_type: {
        required: 'User type is required.'
      },
      school_id: {
        required: 'school is required.'
      },
      class_id: {
        required: 'class is required.'
      },
      section_id: {
        required: 'section is required.'
      },
      subject_id: {
        required: 'subject is required.'
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

    this.userForm = this.fb.group({
      studentName: ['', [Validators.required]],
      rollNumber: ['', ""],
      zoom_id: ['', ''],
      zoom_pass: ['', ""],
      email: ['', [Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
      studentContactNo: ['', [Validators.required]],
      city: ['', ''],
      user_type: ['', [Validators.required]],
      school_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      section_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    this.userService.getUserTypes(this.userId).subscribe((data) => {
      this.userTypes = data;
    });

    this.route.params.subscribe(params => {
      this.id = params['id'];
      // if (this.id) {
      //   this.getUser(this.id);
      //   this.pageTitle = `Update Student/Teacher`;
      // }
    });

    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.userId).subscribe((data: any) => {
        this.schoolList = data.data;
        if (this.id) {
          this.getUser(this.id);
          this.pageTitle = `Update Student/Teacher`;
        }
        // this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
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
        if (this.id) {
          this.getUser(this.id);
          this.pageTitle = `Update Student/Teacher`;
        }
      });
    }

    let classObj = {
      board_id: 1,
      class_id: this.classArr
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });

    // Read the user Id from the route parameter
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



  getUser(id): void {
    let idObj = { id: id }
    this.userService.showEditUsersData(idObj).subscribe(
      (user: any) => {
        this.onUserRetrieved(user);
      },
      (error: any) => this.errorMessage = error as any
    );
  }

  onUserRetrieved(user): void {
    if (this.userForm) {
      this.userForm.reset();
    }
    // console.log(user);
    this.user = user.data;
    this.userType = this.user.user_type;
    // console.log(this.userType);
    let createdBy = this.currentUser.id;
    let userClassArr = [];
    userClassArr = this.user.user_class;
    let zoom_id;
    let zoom_pass;
    if (this.user.quiz_user_data) {
      zoom_id = this.user.quiz_user_data.zoom_id;
      zoom_pass = this.user.quiz_user_data.zoom_pass;
    }
    this.changeClass(this.user.class_id);
    // console.log(this.sectionArr, this.user.section_id.length);
    if (this.sectionArr.length == this.user.section_id.length) {
      this.user.section_id.push(0);
    }
    // Update the data on the form
    this.userForm.patchValue({
      studentName: this.user.studentName,
      rollNumber: this.user.rollNumber,
      zoom_id: zoom_id,
      zoom_pass: zoom_pass,
      email: this.user.email,
      studentContactNo: this.user.studentContactNo,
      city: this.user.city,
      user_type: this.user.user_type,
      school_id: this.user.school_id,
      class_id: this.user.class_id,
      section_id: this.user.section_id,
      subject_id: this.user.subject_id,
      status: this.user.status
    });

  }

  saveUser(): void {
    // if (this.userForm.dirty && this.userForm.valid) {
    // Copy the form values over the customer object values
    // const user = Object.assign({}, this.user, this.userForm.value);

    if (this.id) {
      this.user.modified_by = this.userId;
      let obj = Object.assign({}, this.user, this.userForm.value);
      this.userService.editUsersData(obj).subscribe((result: any) => {
        if (result.status) {
          this.openSnackBar('User Data has been updated successfully. ', 'Close');
          this.router.navigate(['/userData'], { queryParamsHandling: 'preserve' });
        } else {
          this.errorMessage = result;
        }
      })
    } else {
      let obj = Object.assign({}, { created_by: this.userId }, 
        {modified_by: this.userId}, this.user, this.userForm.value);
      this.userService.addUsersData(obj).subscribe((result: any) => {
        if (result.status) {
          this.onSaveComplete();
        } else {
          this.errorMessage = result;
          this.openSnackBar(result.message, 'Close');
        }
      });
    }
    // } else if (!this.userForm.dirty) {
    //   this.onSaveComplete();
    // }
  }

  onSaveComplete(): void {
    if (this.formSubmit) {
      this.openSnackBar('User Data has been saved successfully. ', 'Close');
      this.errorMessage = { "message": 'User data saved successfully.' };
      this.router.navigate(['/userData']);
    }
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
    let classObj = { class_id: this.sectionIdArr, section_id: this.sectionArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
      if (this.sectionList.length == this.user.section_id.length) {
        this.user.section_id.push(0);
      }

    })
    this.userService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
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

  tosslePerSection() {
    if (this.allSelectedSection.selected) {
      this.allSelectedSection.deselect();
      return false;
    }
    if (this.userForm.controls.section_id.value.length === this.sectionList.length) {
      this.allSelectedSection.select();
    }
  }

  emailFilter(filterValue: string) {
    this.errorMessage = {};
    if (filterValue.length > 4) {
      let obj = { email: filterValue };
      this.userService.getSuggestData(obj).subscribe((emailData: any) => {
        this.suggestEmail = emailData.data;
        // console.log(filterValue.indexOf('@'),  this.suggestData.length);
        if (filterValue.indexOf('@') > 0 && this.suggestEmail.length <= 0) {
          this.errorMessage.message = "User is not registered"
        }
      });
    }
  }

  contactFilter(filterValue: string) {
    filterValue = filterValue.replace('+', '');
    this.errorMessage = {};
    if (filterValue.length > 8) {
      let obj = { contactNumber: filterValue };
      this.userService.getSuggestData(obj).subscribe((contactData: any) => {
        this.suggestContact = contactData.data;
        if (this.suggestContact.length <= 0) {
          this.errorMessage.message = "User is not registered"
        }
      });
    }
  }

  fillData(suggest) {
    this.userForm.patchValue({
      email: suggest.email,
      studentName: suggest.firstName + ' ' + suggest.lastName,
      studentContactNo: suggest.contactNumber,
    });
    let contactNumber = suggest.contactNumber.substring(suggest.contactNumber.length - 10);
    let classObj = {
      email: suggest.email, //'pvappdelhi2013@gmail.com',
      customerNumber: contactNumber //'9560400828'
    }
    this.userService.getOnlineClassStatus(classObj).subscribe((result: any) => {
      if (result.data) {
        let grades = [];
        this.renewedGrade = result.data.renewedGrade;
        this.classList.forEach(cl => {
          this.renewedGrade.forEach(rg => {
            if (cl.class_name === rg) {
              grades.push(cl.id);
            }
          });
        });
        this.userForm.patchValue({
          class_id: grades
        });
        this.changeClass(grades);
      }
    })
  }

  chkUserType(typeVal) {
    this.userType = typeVal;
  }
}