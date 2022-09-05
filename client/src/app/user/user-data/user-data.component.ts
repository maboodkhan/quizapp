import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialog, MatPaginator, MatSort, MatTableDataSource, MatOption, MatSnackBar } from '@angular/material';
import { UserImportComponent } from '../user-import/user-import.component';
import { UserService } from '../user.service';
// import { FormsModule } from '@angular/forms';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ClassSectionComponent } from '../class-section/class-section.component';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css']
})
export class UserDataComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;
  dataSource: any;
  displayedColumns: string[] = ['S_No', 'name', 'email', 'phone', 'user_type', 'school', 'class_section', 'user_activate', 'id'];
  pageTitle = 'Class Management';
  limit = 10;
  offset = 0;
  total_students: number;
  customFilters: any = null;
  currentUser: any;
  user_id: number;
  schoolList = [];
  classList: any;
  sectionList: any;
  subjectList: any;
  sectionIdArr = [];
  type_order: number;
  schoolArr = [];
  classArr = [];
  sectionArr = [];
  userData = [];
  userDataSchool = [];
 
  searchFilter: any = {
    studentName: '',
    rollNumber: '',
    email: '',
    studentContactNo: null,
    user_type: null,
    school_id: [],
    class_id: [],
    section_id: [],
    subject_id: [],
    status: 0,
    limit: 10,
    offset: 0
  };

  constructor(public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private userService: UserService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;

    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        this.searchFilter = this.customFilters;
        if (this.customFilters.class_id != '') {
          this.changeClass(this.customFilters.class_id, 1);
        }
        this.offset = this.paginator.pageIndex = (this.customFilters.offset / this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
        this.getUserData();
      } else {
        this.customFilters = {
          school_id: this.schoolArr,
          class_id: this.classArr,
          section_id: this.sectionArr,
          user_id: this.user_id,
          limit: this.paginator.pageSize,
          offset: this.paginator.pageIndex * this.paginator.pageSize
        }
      }
    })
    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.user_id).subscribe((data: any) => {
        this.schoolList = data.data;
        this.getUserData();
      });
    } else {
      let obj = { user_id: this.user_id }
      // console.log(obj);
      this.userService.userSchools(obj).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.classArr = data.userClass;
        this.sectionArr = data.userSection;
        // console.log(this.schoolArr);
        this.customFilters = {
          school_id: this.schoolArr,
          class_id: this.classArr,
          section_id: this.sectionArr,
          user_id: this.user_id,
          limit: this.paginator.pageSize,
          offset: this.paginator.pageIndex * this.paginator.pageSize
        }
        this.getUserData();
      });
    }

    let classObj = {
      board_id: 1
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });

  }

  getUserData() {
    this.customFilters = {
      studentName: this.customFilters.studentName,
      rollNumber: this.customFilters.rollNumber,
      email: this.customFilters.email,
      studentContactNo: this.customFilters.studentContactNo,
      user_type: this.customFilters.user_type,
      school_id: this.customFilters.school_id,
      class_id: this.customFilters.class_id,
      section_id: this.customFilters.section_id,
      subject_id: this.customFilters.subject_id,
      status: this.customFilters.status,
      user_id: this.user_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    console.log(this.customFilters);
    this.userService.showUsersData(this.customFilters).subscribe((result: any) => {
      // console.log(result);      
      this.total_students = result.totalCount;
      this.dataSource = new MatTableDataSource(result.data);
    });
  }

  importDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(UserImportComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => this.ngOnInit()
    );
  }

  schoolInfo(school_data_id){
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      school_data_id: school_data_id
    };
    const dialogRef = this.dialog.open(ClassSectionComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {        
        this.getUserData();
      }
    );
  }

  changeClass(class_id, defaultVal = 0) {
    this.sectionIdArr = class_id;
    let classObj = { class_id: this.sectionIdArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })
    this.userService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
  }

  selectAllSection() {
    let sectionVal = [0];
    if (this.allSelectedSection.selected) {

      this.sectionList.forEach(element => {
        sectionVal.push(element.id);
      });
      this.searchFilter.section_id = sectionVal;
    }else{
      this.searchFilter.section_id = []
    }
  }
  tosslePerSection() {
    if (this.allSelectedSection.selected) {
      this.allSelectedSection.deselect();
      // this.searchFilter.section_id = [];
      return false;
    }
    if (this.searchFilter.section_id.length === this.sectionList.length) {
      this.allSelectedSection.select();
    }
  }

  resetPage() {
    this.resetPageIndex();
    this.searchFilter = {};
    this.customFilters = {
      school_id: this.schoolArr,
      class_id: this.classArr,
      section_id: this.sectionArr,
      user_id: this.user_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    // console.log(this.customFilters)    
    this.toggleUserBtn(0);
    this.getUserData();
  }

  searchUserData(filters: any) {
    this.resetPageIndex();
    if (filters) {
      if (!filters.school_id || filters.school_id.length <= 0) {
        filters.school_id = this.schoolArr;
      }
      if (!filters.class_id || filters.class_id.length <= 0) {
        filters.class_id = this.classArr;
      }
      if (!filters.section_id || filters.section_id.length <= 0) {
        filters.section_id = this.sectionArr;
      }
      
      this.toggleUserBtn(filters.status);
      filters.user_id = this.user_id;
      filters.limit = this.paginator.pageSize;
      filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
      this.customFilters = filters;
      this.getUserData();
    }
  }

  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.customFilters = {
      school_id: this.schoolArr,
      class_id: this.classArr,
      section_id: this.sectionArr,
      user_id: this.user_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize,
    }
    this.toggleUserBtn(0);
    this.getUserData();
  }

  resetPageIndex() {
    this.paginator.pageIndex = 0;
  }

  deleteData(school_data_id, user_id, email){
    // console.log(user_id, email);
    var result = confirm("Are you sure, you want to delete?");
    if (result) {
      let obj = { school_data_id: school_data_id, user_id: user_id, email: email }
      this.userService.deleteUsersData(obj).subscribe((result: any) => {
        // console.log(result);
        if (result.status) {
          this.getUserData();
          this.openSnackBar('Deleted successfully. ', 'Close');
        }
      });
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  pendingReq(statusVal){
    // this.userStatusValue = !this.userStatusValue;
    this.toggleUserBtn(statusVal);
    this.getUserData();
  }

  toggleUserBtn(statusVal){
    this.customFilters.status = statusVal;
    // if(this.userStatusValue){
    //   this.customFilters.status = 2,
    //   this.userStatusTxt = "allowed";
    //   this.activeBtn = true;
    //   this.deactiveBtn = false;      
    // }else{
    //   if(reset) {
    //     this.customFilters.status = 0;
    //   } else {
    //     this.customFilters.status = 1;
    //   }      
    //   this.userStatusTxt = "disallowed";
    //   this.activeBtn = false;
    //   this.deactiveBtn = true;
    // }
  }

  allowDisAllowUser(user_id, status){
    // console.log(user_id, status);
    let obj = {
      user_id: user_id,
      status: status
    }
    this.userService.userStatus(obj).subscribe((data: any)=> {
      // console.log(data);
      if(data.status){
        this.openSnackBar("User status change successfully", "close");
      this.getUserData();
      }
    })
  }

  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getUserData();
        })
      )
      .subscribe();
  }

}
