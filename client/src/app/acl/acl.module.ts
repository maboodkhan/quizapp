import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ACLComponent } from './acl.component';
import { PermissionComponent } from './permission/permission.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { MathModule } from '../math/math.module';
import { HttpClientModule } from '@angular/common/http';
import { PermissionRoleComponent } from './permission-role/permission-role.component';
import { AddEditPermissionComponent } from './permission/add-edit-permission/add-edit-permission.component';
import { PermissionUserComponent } from './permission-user/permission-user.component';

const routes = [
  { path: 'permission/:parent_id', component: PermissionComponent },
  { path: 'addPermission/:parent_id', component: AddEditPermissionComponent},
  { path: 'permission_role/:user_type_id/:parent_id', component: PermissionRoleComponent },
  { path: 'permission_user/:user_id/:parent_id', component: PermissionUserComponent },
  { path: 'editPermission/:parent_id/:id', component: AddEditPermissionComponent}
];


@NgModule({
  declarations: [
    ACLComponent,
    PermissionComponent,
    PermissionRoleComponent,
    AddEditPermissionComponent,
    PermissionUserComponent
  ],
  imports: [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  RouterModule.forChild(routes),
  MathModule.forRoot(),
  HttpClientModule,
]
})
export class AclModule { }
