import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GenericValidator } from 'src/app/shared';
import { environment } from 'src/environments/environment';
import { AclService } from '../../acl.service';

@Component({
  selector: 'app-add-edit-permission',
  templateUrl: './add-edit-permission.component.html',
  styleUrls: ['./add-edit-permission.component.css']
})

export class AddEditPermissionComponent implements OnInit {
  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @Input() value: string;
  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
 
  pageTitle : string;
  errorMessage: any;
  permissionForm: FormGroup;
  permissionData: any;
  currentUser: any;
  user_id: number;
  type_order: any;
  fileUploadProgress: string = null;
  fileData: File = null;
  apiUrl = environment.apiUrl;
  parent_id: any;
  id: any;
  hrefTargetType: any;
  //isChecked: any;
  externalRedirect: any;
  checkCd: any;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private aclService : AclService
 
  ) {
    this.validationMessages = {
     
      label:{
        required : 'Label is required'
      },
      status: {
        required: 'Status is required.'
      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
  
   }
 
  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.permissionForm.valueChanges, controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.permissionForm);
    });
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // this.user_id = this.currentUser.id;
    if (this.currentUser) {
     this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;
    }

    this.permissionForm = this.fb.group({
      label: ['', [Validators.required]],
      description:['', [Validators.required]],
      link: ['', [Validators.required]],
      icon: ['', ''],
      menu_order: ['', [Validators.required]],
      externalRedirect : ['', [Validators.required]],
      hrefTargetType:['', ''],
      showStatus: ['', [Validators.required]],
      status: ['', [Validators.required]]
      });
      
  this.route.params.subscribe((params) => {
    this.parent_id = params['parent_id'];
    this.parent_id = params.parent_id;
    this.id = params['id'];
    if (this.id) {
      this.pageTitle = `Update Permission`;
      this.getPermission();
    } else {
      this.pageTitle = 'Add Permission';
      this.checkCd = 0;
    }
  });
  
  this.permissionForm = this.fb.group({
    label: ['', [Validators.required]],
    description:['', ''],
    link: ['', ''],
    icon: ['', ''],
    menu_order: ['', ''],
    externalRedirect : ['', ''],
    hrefTargetType:['', ''],
    showStatus: ['', ''],
    status: ['', [Validators.required]]
    });

  }
 
  savePermission() {
    
    if (this.id) {
      this.editPermission();
    }
    else {
      this.addPermission();
    }
  
}

changeExRd(checkCd) {
  this.checkCd = checkCd;
  //console.log(checkCd);
  if (this.checkCd == 0) { 
   this.permissionForm.controls.hrefTargetType.setValue('');
    this.permissionForm.get('hrefTargetType').clearValidators();
   // console.log(this.permissionForm.value) ;
  }else{
    this.permissionForm.controls.hrefTargetType.setValue('');
    this.permissionForm.get('hrefTargetType').setValidators(Validators.required);
  }
  this.permissionForm.get('hrefTargetType').updateValueAndValidity();
}

  addPermission(){
    //console.log(this.permissionForm.value);
    let obj = {};
      obj = Object.assign({},
      { parent_id: this.parent_id },
        this.permissionForm.value);
        this.aclService.addNewPermission(obj).subscribe((data: any) => {
          if (data.status == true) {
            //console.log(data);
            this.router.navigate(['/permission', this.parent_id]);
            this.openSnackBar('Permission has been added successfully. ', 'Close');
          } else {
            this.errorMessage = data;
          }
        })
  }
  
  editPermission(){
    let editObj = {
      parent_id: this.id,
      label: this.permissionForm.value.label,
      description: this.permissionForm.value.description,
      link : this.permissionForm.value.link,
      icon : this.permissionForm.value.icon,
      menu_order : this.permissionForm.value.menu_order,
      externalRedirect :  this.permissionForm.value.externalRedirect,
      hrefTargetType : this.permissionForm.value.hrefTargetType,
      showStatus: this.permissionForm.value.showStatus,
      status: this.permissionForm.value.status
    }
    //console.log(editObj);
    this.aclService.updatePermission(editObj).subscribe((response: any) => {
      if (response.status == true) {
        this.router.navigate(['/permission', this.parent_id]);
        this.openSnackBar('Permission has been updated successfully. ', 'Close');
      }
      else {
        this.errorMessage = response;
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }
  
  getPermission() {
    let obj = {
      parent_id: this.id
    }
    this.aclService.getPermissionsById(obj).subscribe((permissionData: any) => {
      //console.log(permissionData);
      this.permissionData = permissionData.data;
      this.permissionForm.patchValue({
        label: this.permissionData.label,
        description: this.permissionData.description,
        link : this.permissionData.link,
        icon: this.permissionData.icon,
        menu_order : this.permissionData.menu_order,
        externalRedirect : this.permissionData.externalRedirect,
        hrefTargetType : this.permissionData.hrefTargetType,
        showStatus : this.permissionData.showStatus,
        status: this.permissionData.status
      });
    });
  }

}
