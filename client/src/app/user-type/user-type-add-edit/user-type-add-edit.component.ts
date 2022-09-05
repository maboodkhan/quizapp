import { Component, OnInit, ViewChildren, ElementRef } from '@angular/core';
import { FormControlName, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GenericValidator } from 'src/app/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { UserTypeService } from '../user-type.service';

@Component({
  selector: 'app-user-type-add-edit',
  templateUrl: './user-type-add-edit.component.html',
  styleUrls: ['./user-type-add-edit.component.css']
})
export class UserTypeAddEditComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  userTypeForm: FormGroup;
  displayMessage: { [key: string]: string } = {};
  status = {1: 'Active', 2: 'Inactive'};
  type_id: any;
  pageTitle: string;
  userTypeData: any;

  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userTypeSerice: UserTypeService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { 
    this.validationMessages = {
      type_name: {
          required: 'Type name is required.'
      },
      type_order: {
          required: 'Type order is required.'
      },
      status: {
          required: 'Status is required.'
      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
   }

  ngOnInit() {

    this.route.params.subscribe(params => {
          this.type_id = params['type_id'];
          if(this.type_id){
            this.pageTitle = `Update User Type`;
            this.getUserType();
          }else{
            this.pageTitle = 'Add User Type';
          }
      }
  );

    this.userTypeForm = this.fb.group({
      type_name: ['', [Validators.required]],
      type_order: ['', [Validators.required]],    
      status: ['', [Validators.required]]
    });

  }

  ngAfterViewInit(): void {
    const controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    Observable.merge(this.userTypeForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.userTypeForm);
    });
  }


  saveSchool(){
    if(this.type_id){
      this.editUserType();
    }
    else{
      this.addUserType();
    }
  }

  addUserType(){
    this.userTypeSerice.createUserType(this.userTypeForm.value).subscribe((response:any) => {
      if(response.status == true){
        this.router.navigate(['/userType']);
        this.openSnackBar('User Type has been created successfully. ', 'Close');
      }
    });
  }

  editUserType(){
    let editObj = {
      type_id: this.type_id,
      type_name: this.userTypeForm.value.type_name,
      type_order: this.userTypeForm.value.type_order,
      status: this.userTypeForm.value.status
    }
    this.userTypeSerice.updateUserType(editObj).subscribe((response:any) => {
      if(response.status == true){
        this.router.navigate(['/userType']);
        this.openSnackBar('User Type has been updated successfully. ', 'Close');
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
        duration: 1500,
    });
  }

  getUserType(){
    let obj = {
      type_id: this.type_id
    }
    this.userTypeSerice.UserTypeById(obj).subscribe((userTypeData: any) => {
      this.userTypeData = userTypeData.data;
      this.userTypeForm.patchValue({
        type_name: this.userTypeData.type_name,
        type_order: this.userTypeData.type_order,
        status: this.userTypeData.status.toString()
      });
    });
  }
  
}
