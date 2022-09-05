import { Component, OnInit, ViewChildren, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IUser } from '../user';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { Observable, Subscription } from 'rxjs';
import { GenericValidator } from '../../shared/generic-validator';
import { MatSnackBar, MatOption } from '@angular/material';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;

  pageTitle = 'Add User';
  errorMessage: any;
  userForm: FormGroup;
  user: IUser = {} as IUser;
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
  type_order: any;
  classArr = [];
  sectionArr = [];
  sectionIdArr = [];
  assignedUser: any;
  countryList = [];

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
      firstName: {
        required: 'Fist name is required.'
      },
      username: {
        required: 'Username is required.'
      },
      status: {
        required: 'Status is required.'
      },
      contactNumber: {
        maxlength: 'Contact number is required.'
      },
      altNumber: {
        maxlength: 'Alternate contact number cannot exceed 10 characters.'
      },
      email: {
        pattern: 'Invalid email address.'
      },
      country_id: {
        required: 'Country is required.'
      },
      user_type_id: {
        required: 'User type is required.'
      },
      assigned_to: {
        required: 'Assign user is required.'
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
      firstName: ['', [Validators.required]],
      lastName: ['', ''],
      username: ['', [Validators.required]],
      password: ['', ''],
      email: ['', [Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]],
      country_id: ['',[Validators.required]],
      status: ['', [Validators.required]],
      contactNumber: ['', [Validators.required]],
      altNumber: ['', ''],
      user_type_id: ['', [Validators.required]],
      school_id: ['', ''],
      class_id: ['', ''],
      section_id: ['', ''],
      assigned_to: ['', [Validators.required]]
    });

    this.userService.getUserTypes(this.userId).subscribe((data) => {
      this.userTypes = data;
    });
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      // if (this.id) {
      //   this.getUser(this.id);
      //   this.pageTitle = `Update User`;
      // } else {
      //   this.pageTitle = 'Add User';
      // }
    });
    this.sub.add(null);

    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.userId).subscribe((data: any) => {
        this.schoolList = data.data;
        if (this.id) {
          this.getUser(this.id);
          this.pageTitle = `Update User`;
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
          this.pageTitle = `Update User`;
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
    this.userService.getCountries().subscribe((data: any) => {
      this.countryList = data.data;
    })

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

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getUser(id: string): void {
    this.userService.getUser(id).subscribe(
      (user: IUser) => {
        this.onUserRetrieved(user);
      },
      (error: any) => this.errorMessage = error as any
    );
  }

  onUserRetrieved(user: IUser): void {
    if (this.userForm) {
      this.userForm.reset();
    }
    this.user = user;

    let createdBy = this.currentUser.id;
    let userClassArr = [];
    userClassArr = this.user.user_class;
    let country_id = [];
    let school_id = [];
    let class_id = [];
    let section_id = [];
    if (userClassArr.length > 0) {
      userClassArr.forEach(element => {
        school_id.push(element.school_id);
        class_id.push(element.class_id);
        // if(element.section_id !=0 || userClassArr.length != 1)
        section_id.push(element.section_id);
      });
      school_id = school_id.filter((v, i, a) => a.indexOf(v) === i);
      class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
      section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);
    }
    this.user.user_countries.forEach((country:any) => {
      country_id.push(country.country_id);
    })
    // if(userClassArr.length > 0) {
    //   userClassArr.forEach(element => {
    //     class_id.push(element.class_id);
    //   });
    //   class_id = class_id.filter((v, i, a) => a.indexOf(v) === i);
    // }
    // if(userClassArr.length > 0) {
    //   userClassArr.forEach(element => {
    //     if(element.section_id != 0)
    //     section_id.push(element.section_id);
    //   });
    //   section_id = section_id.filter((v, i, a) => a.indexOf(v) === i);
    // }
    this.changeClass(class_id);
    this.changeUserType(this.user.user_type_id);
    // if(this.sectionArr.length == section_id.length){
    //   section_id.push(0);
    // }
    // Update the data on the form
    console.log(this.user);
    this.userForm.patchValue({
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      username: this.user.username,
      password: this.user.password,
      contactNumber: this.user.contactNumber,
      altNumber: this.user.altNumber,
      email: this.user.email,
      country_id: country_id,
      user_type_id: this.user.user_type_id,
      assigned_to: this.user.assigned_to,
      school_id: school_id,
      class_id: class_id,
      section_id: section_id,
      status: this.user.status.toString(),
      createdBy: createdBy
    });

  }

  saveUser(): void {
    if (this.userForm.dirty && this.userForm.valid) {
      // Copy the form values over the customer object values            
      const user = Object.assign({}, this.user, this.userForm.value);
      this.userService.createUser(user).subscribe((result: any) => {
        if (result.status) {
          this.onSaveComplete();
        } else {
          this.errorMessage = result;
        }
      });
    } else if (!this.userForm.dirty) {
      this.onSaveComplete();
    }
  }

  onSaveComplete(): void {
    if (this.formSubmit) {
      this.openSnackBar('User has been saved successfully. ', 'Close');
      this.errorMessage = { "message": 'User data saved successfully.' };
      this.router.navigate(['/user'],{queryParamsHandling: 'preserve'});
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
    })
  }

  changeUserType(user_type_id) {
    let typeObj = {
      "user_type_id": user_type_id,
      "user_id": parseInt(this.id)
    }
    this.userService.getTypeUsers(typeObj).subscribe((result: any) => {
      // console.log(result);
      this.assignedUser = result.data;
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

  tosslePerSection() {
    if (this.allSelectedSection.selected) {
      this.allSelectedSection.deselect();
      return false;
    }
    if (this.userForm.controls.lesson_id.value.length === this.sectionList.length) {
      this.allSelectedSection.select();
    }
  }
}
