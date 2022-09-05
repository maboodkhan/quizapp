import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { GenericValidator } from 'src/app/shared';
import { UserService } from '../user.service';

@Component({
  selector: 'app-app-user-details',
  templateUrl: './app-user-details.component.html',
  styleUrls: ['./app-user-details.component.css']
})
export class AppUserDetailsComponent implements OnInit {

  userForm: FormGroup;
  displayMessage: { [key: string]: string } = {};
  userData: any;
  school_id = [];
  class_id = [];
  section_id = [];
  country: string;
  city: string;
  notFound: string;
  quiz_user_details = [];

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(private fb: FormBuilder,
    private userService: UserService) {
    this.validationMessages = {
      email: {
        pattern: 'Invalid email address.'
      },
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {

    this.userForm = this.fb.group({
      email: ['', [Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')]]
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

  getUser(): void {
    this.userService.getuserdetails({ username: this.userForm.value.email }).subscribe((data: any) => {
      console.log(data);
      if (data.status) {
        this.notFound = '';
        this.country = data.country;
        this.userData = data.data;
        if (this.userData.userData.length >= 1) {
          this.city = this.userData.userData[0].city;
        }
        this.quiz_user_details = this.userData.quiz_user_details;
        this.userData.userData.forEach(element => {
          this.school_id.push(element.school);
          this.class_id.push(element.class);
          this.section_id.push(element.section);
        });
        this.school_id = this.school_id.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
        this.class_id = this.class_id.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
        this.section_id = this.section_id.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
      } else {
        this.userData = null;
        this.notFound = "No Data Found"
      }
    });
  }

}
