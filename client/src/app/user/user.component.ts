import { Component, OnInit, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { IUser } from './user';
import { UserService } from './user.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private apiUrl = environment.apiUrl;
  pageTitle = 'Manage Users';
  displayedColumns: string[] = ['username', 'name', 'email', 'role', 'assignedTo', 'id'];
  users: any;
  currentUser: any;
  userId: string;
  token: string;
  dataSource: any = null;
  customFilters: any = {};
  errorMessage: string;
  panelOpenState = false;
  type_order: any;
  sectionArr: [];
  sectionList: any;
  schoolList: any;
  classList: any;
  schoolArr = [];
  classArr = [];
  // limit = 10;
  // offset = 0;
  totalUser: number;

  searchFilter: any = {
    username: '',
    email: '',
    school_id: [],
    class_id: [],
    section_id: []
  };

  constructor(private http: Http,
    private userService: UserService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
      this.userId = this.currentUser.id;
      this.token = this.currentUser.token;
      this.type_order = this.currentUser.user_Type.type_order;
    }

    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        // console.log(this.customFilters);
        this.searchFilter = this.customFilters;
        this.sectionArr = this.customFilters.section_id
        if (this.customFilters.class_id != '') {
          this.changeClass(this.customFilters.class_id);
        }
      } else {
        this.customFilters = {};
      }
    })

    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.userId).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.getUserClasses();
        this.getUsers();
      });
    } else {
      let obj = { user_id: this.userId }
      // console.log(obj);
      this.userService.userSchools(obj).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.classArr = data.userClass;
        this.sectionArr = data.userSection;
        this.getUserClasses();
        // console.log(this.schoolArr);
        // this.getUserClasses();
        // if(params)
        // console.log(this.customFilters);
        // if(Object.keys(this.customFilters).length === 0){
        //   this.customFilters = {
        //     school_id: this.schoolArr,
        //     class_id: this.classArr,
        //     section_id: this.sectionArr,
        //     user_id: this.userId,
        //     limit: this.paginator.pageSize,
        //     offset: this.paginator.pageIndex * this.paginator.pageSize
        //   }
        // }
        this.getUsers();
      });
    }
    // let classObj = {
    //   board_id: 1,
    //   class_id: this.classArr
    // }
    // this.userService.getClasses(classObj).subscribe((data: any) => {
    //   this.classList = data.data;
    // });

  }


  getUsers(): void {
    this.customFilters = {
      username: this.customFilters.username,
      email: this.customFilters.email,
      school_id: this.customFilters.school_id,
      class_id: this.customFilters.class_id,
      section_id: this.customFilters.section_id
    };
    // console.log(this.customFilters);
    this.userService.getUsers(this.userId, this.customFilters)
      .subscribe((users: any) => {
        // this.totalUser = users.totalUser;
        // console.log(users);
        this.freshDataList(users);
      },
        error => this.errorMessage = error as any);
  }

  freshDataList(users: IUser[]) {
    this.users = users;
    this.dataSource = new MatTableDataSource(this.users);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // applyFilter(filterValue: string) {
  //   filterValue = filterValue.trim(); // Remove whitespace
  //   filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
  //   this.dataSource.filter = filterValue;
  // }

  getUserClasses(){
    let classObj = {
      board_id: 1,
      class_id: this.classArr
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });
  }

  searchUserData(filters: any) {
      this.customFilters = filters;
      this.getUsers();
  }

  resetSearchFilter(searchPanel: any) {
    searchPanel.toggle();
    this.searchFilter = {};
    this.sectionArr = null;
    this.customFilters = {
      school_id: this.schoolArr,
      class_id: this.classArr,
      section_id: this.sectionArr
    }
    this.getUsers();
  }

  reset() {
    this.getUsers();
  }

  panelState() {
    this.panelOpenState = !this.panelOpenState;
  }

  changeClass(class_id) {
    // this.sectionIdArr = [class_id];
    let classObj = { class_id: class_id, section_id: this.sectionArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })
  }

  //   ngAfterViewInit() {

  //     this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

  //     merge(this.sort.sortChange, this.paginator.page)
  //     .pipe(
  //     tap(() => {
  //         this.getUsers();
  //         })
  //     )
  //     .subscribe();
  // }

}
