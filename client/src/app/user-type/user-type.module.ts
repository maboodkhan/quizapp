import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTypeComponent } from './user-type.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { MathModule } from '../math/math.module';
import { HttpClientModule } from '@angular/common/http';
import { UserTypeAddEditComponent } from './user-type-add-edit/user-type-add-edit.component';

const routes = [
  { 
    path: 'userType', component: UserTypeComponent 
  },
  { 
    path: 'addUserType', component: UserTypeAddEditComponent 
  },
  { 
    path: 'editUserType/:type_id', component: UserTypeAddEditComponent 
  }
];

@NgModule({
  declarations: [
    UserTypeComponent,
    UserTypeAddEditComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule.forChild(routes),
    MathModule.forRoot(),
    HttpClientModule
  ]
})
export class UserTypeModule { }
