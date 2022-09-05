import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {

  userForm: FormGroup;
  currentUser: any;
  user_id: number;
  type_order: number;
  name: string;
  email: string;
  contactNumber: string;
  userType: string;
  school_id = [];
  class_id = [];
  section_id = [];
  user_class = [];
  schoolList = [];
  classList = [];
  sectionList = [];

  constructor(private fb: FormBuilder,
    private userService: UserService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;
    this.name = this.currentUser.firstName + '' + this.currentUser.lastName;
    this.email = this.currentUser.email;
    this.contactNumber = this.currentUser.contactNumber;
    this.userType = this.currentUser.userType;

    this.userForm = this.fb.group({
      name: ['', ''],
      email: ['', ''],
      contactNumber: ['', ''],
      userType: ['', ''],
      school_id: ['', ''],
      class_id: ['', ''],
      section_id: ['', '']
    });

    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.user_id).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.school_id.push(element.id) });
      });
      let classObj = { board_id: 1, class_id: this.class_id }
      this.userService.getClasses(classObj).subscribe((data: any) => {
        this.classList = data.data;
        this.classList.forEach(element => { this.class_id.push(element.id) });
        let sectionObj = { class_id: this.class_id }
        this.userService.getClassSections(sectionObj).subscribe((result: any) => {
          this.sectionList = result.data;
          this.sectionList.forEach(element => { this.section_id.push(element.id) });
        })
      });
      // this.getClasses();
      // this.getSections();
      this.patchData();

    } else {
      let obj = { user_id: this.user_id }
      this.userService.userSchools(obj).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(sc => {
          this.school_id.push(sc.id);
        })
        this.class_id = data.userClass;
        this.section_id = data.userSection;
        this.getClasses();
        this.getSections();
        this.patchData();
      });
    }
  }

  getClasses() {
    let classObj = {
      board_id: 1,
      class_id: this.class_id
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });
  }

  getSections() {
    let sectionObj = { class_id: this.class_id, section_id: this.section_id }
    this.userService.getClassSections(sectionObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })
  }

  patchData(){
    this.userForm.patchValue({
      name: this.name,
      email: this.email,
      contactNumber: this.contactNumber,
      userType: this.userType,
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id
    });
  }

}
