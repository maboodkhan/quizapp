import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchoolComponent } from './school.component'
  import { from } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { MathModule } from '../math/math.module';
import { HttpClientModule } from '@angular/common/http';
import { SchoolAddEditComponent } from './school-add-edit/school-add-edit.component';
import { CouponComponent } from './coupon/coupon.component';
import { AddEditCouponComponent } from './add-edit-coupon/add-edit-coupon.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CouponImportComponent } from './coupon-import/coupon-import.component';

  const routes = [

    { path: 'school', component: SchoolComponent },
    {
      path: 'addSchool', component: SchoolAddEditComponent
    },
    {
      path: 'editSchool/:school_id', component: SchoolAddEditComponent
    },
    {
      path: 'coupon', component: CouponComponent
    },
    {
      path: 'addCoupon', component: AddEditCouponComponent
    },
    {
      path: 'editCoupon/:coupon_id', component: AddEditCouponComponent
    }

  ];

@NgModule({
  declarations: [
    SchoolComponent,
    SchoolAddEditComponent,
    CouponComponent,
    AddEditCouponComponent,
    CouponImportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    MathModule.forRoot(),
    HttpClientModule,
    NgxMatSelectSearchModule,
  ],
  entryComponents: [CouponImportComponent],
})
export class SchoolModule { }
