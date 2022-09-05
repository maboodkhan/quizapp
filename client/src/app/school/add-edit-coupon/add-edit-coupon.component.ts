import { Component, ElementRef, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { GenericValidator } from 'src/app/shared';
import { SchoolService } from '../school.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-edit-coupon',
  templateUrl: './add-edit-coupon.component.html',
  styleUrls: ['./add-edit-coupon.component.css']
})

export class AddEditCouponComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  couponForm: FormGroup;
  displayMessage: { [key: string]: string } = {};
  coupon_id: number;
  pageTitle: string;
  couponData: any;
  schoolList = [];
  expireType: number;
  errorMessage: any;
  todayDate:Date = new Date();

  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private schoolService: SchoolService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { 
    this.validationMessages = {
      couponCode: {
          required: 'Coupon Code is required.'
      },
      expiration_type: {
        required: 'Expiration Type is  required.'
      },
      num_attempts: {
        required: 'Number of attempts is  required.'
      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
   }

  ngOnInit() {

    this.route.params.subscribe(params => {
          this.coupon_id = params['coupon_id'];
          if(this.coupon_id){
            this.pageTitle = `Update Coupon`;
            this.getCoupon();
          }else{
            this.pageTitle = 'Add Coupon';
          }
      });
      this.schoolService.getSuggestSchools({}).subscribe((schoolList: any) => {
        this.schoolList = schoolList.data;
      })
    this.couponForm = this.fb.group({
      couponCode: ['', [Validators.required]],
      school_id: ['', ''],
      expiration_type: ['',[Validators.required]],
      expiration_date: ['', ''],
      num_days: ['', ''],
      num_attempts: ['', [Validators.required]]
    });

  }

  ngAfterViewInit(): void {
    const controlBlurs: Observable<any>[] = this.formInputElements
        .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    Observable.merge(this.couponForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.couponForm);
    });
  }

  schoolFilter(school_name: string) {
    // console.log(filterValue);
      let obj = { school_name: school_name };
      this.schoolService.getSuggestSchools(obj).subscribe((schoolData: any) => {
        this.schoolList = schoolData.data;
      });
  }

  onFocusOut(){
    this.schoolService.getSuggestSchools({}).subscribe((schoolList: any) => {
      this.schoolList = schoolList.data;
    })
  }


  saveSchool(){
    this.errorMessage = null;
    if(this.coupon_id){
      this.editCoupn();
    }else{
      this.createCoupon();
    }
  }

  createCoupon(){
    this.schoolService.createCoupon(this.couponForm.value).subscribe((response:any) => {
      if(response.status){
        this.router.navigate(['/coupon']);
        this.openSnackBar('Coupon has been created successfully. ', 'Close');
      }else{
        this.errorMessage = response;
      }
    });
  }

  editCoupn(){
    let obj = Object.assign({}, {coupon_id: this.coupon_id}, this.couponForm.value);
    // console.log(obj);
    this.schoolService.editCoupon(obj).subscribe((response:any) => {
      if(response.status){
        this.router.navigate(['/coupon']);
        this.openSnackBar('Coupon has been edit successfully. ', 'Close');
      }else{
        console.log(response);
        this.errorMessage = response;
      }
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
        duration: 1500,
    });
  }

  getCoupon(){
    let obj = {
      coupon_id: this.coupon_id
    }
    this.schoolService.getCouponsById(obj).subscribe((couponData: any) => {
      this.couponData = couponData.data;
      console.log(this.couponData);
      let schoolArr = []
      this.couponData.coupon_School.forEach(element => {
        schoolArr.push(element.school_id);
      });
      this.couponForm.patchValue({
        couponCode: this.couponData.couponCode,
        school_id: schoolArr,
        expiration_type: this.couponData.expiration_type,
        expiration_date: this.couponData.expiration_date,
        num_days: this.couponData.num_days,
        num_attempts: this.couponData.num_attempts
      });
      this.expireType = this.couponData.expiration_type;
    });
  }

  chkExpireType(typeVal){
    this.expireType = typeVal
  }

}