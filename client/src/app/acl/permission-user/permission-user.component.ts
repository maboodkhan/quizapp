import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSnackBar, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/user/user.service';
import { AclService } from '../acl.service';

@Component({
  selector: 'app-permission-user',
  templateUrl: './permission-user.component.html',
  styleUrls: ['./permission-user.component.css']
})

export class PermissionUserComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;
  dataSource: any;
  pageTitle = 'Assign Permission';
  displayedColumns: string[] = ['Sno', 'label', 'link', 'id'];
  permissionData = [];
  user_id: any;
  parent_id: number;
  isSelected: any;
  selectedAll: any;
  permissionArr = [];
  isChecked: any;
  prev_parent_id: number;
  showBack: boolean = false;
  currentUser: any;
  loginUserId: number;
  loginUserTypeId: number;
  userName: string;

  constructor(private aclService: AclService,
    private userService: UserService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router) {
    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // };
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.loginUserId = this.currentUser.id;
    this.loginUserTypeId = this.currentUser.user_Type.id;

    this.route.params.subscribe(params => {
      this.user_id = params['user_id'];
      this.parent_id = params['parent_id'];
    });

    this.getUser();
    this.getUserTyePermission();
    this.getPrevParentId();
  }

  getUser(){
    this.userService.getUser(this.user_id).subscribe((data: any)=> {
      console.log(data);
      this.userName = data.username;
      if(data.data){
      }
    })
  }

  getPrevParentId(){
    let obj = {parent_id: this.parent_id}
    this.aclService.getPrevParentId(obj).subscribe((data: any)=> {
      // console.log(data);
      if(data.data){
        this.prev_parent_id = data.data.parent_id;
        this.showBack = true;
      }else{
        this.showBack = false;
      }
    })
  }


  getUserTyePermission() {
    let obj = {
      loginUserId: this.loginUserId,
      loginUserTypeId: this.loginUserTypeId,
      user_id: this.user_id,
      parent_id: this.parent_id
    }
    this.aclService.getPermission(obj).subscribe((result: any)=> {
      // console.log(result);
      result.data.forEach(pr => {
        if(pr.permissionUser.length>0){
          pr.isSelected = true;
        }else{
          pr.isSelected = false;
        }
        this.permissionData.push(pr);
        this.selectedAll = this.permissionData.every(function (item: any) {
          return item.isSelected == true;
        })
      });
      this.dataSource = new MatTableDataSource(this.permissionData);
    })
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  selectAll(isChecked: any) {
    this.isChecked = isChecked;
    this.permissionArr = [];
    for (var i = 0; i < this.permissionData.length; i++) {
      this.permissionData[i].isSelected = this.selectedAll;
      this.permissionArr.push(this.permissionData[i].id)
    }
    if (this.isChecked) {
      this.addPermission();
    } else {
      this.removePermission();
    }
  }

  assignRole(permission_id: number, isChecked: any) {
    this.isChecked = isChecked;
    this.permissionArr.push(permission_id);
    this.selectedAll = this.permissionData.every(function (item: any) {
      return item.isSelected == true;
    })
    if (this.isChecked) {
      this.addPermission();
    } else {
      this.removePermission();
    }
  }

  addPermission() {
    let obj = {
      permission_id: this.permissionArr,
      user_id: this.user_id
    }
    this.aclService.userPermissionAssign(obj).subscribe((data: any) => {
      // console.log(data);
      this.openSnackBar(data.message, "Close");
      this.permissionArr = [];
    })
  }

  removePermission() {
    let obj = {
      permission_id: this.permissionArr,
      user_id: this.user_id
    }
    this.aclService.userPermissionRemove(obj).subscribe((data: any) => {
      // console.log(data);
      this.openSnackBar("Permission removed successfully", "Close");
      this.permissionArr = [];
    })
  }

  parentPermision(permission_id) {
    // console.log(permission_id);
    // this.router.navigate(['/permission_user', this.user_id, permission_id]);
    this.paginator.pageSize = 10;
    this.paginator.pageIndex = 0;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
        // this.router.navigate([currentUrl]);
        this.router.navigate(['/permission_user', this.user_id, permission_id]);
    });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

}
