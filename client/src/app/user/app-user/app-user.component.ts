import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { UserService } from '../user.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-app-user',
  templateUrl: './app-user.component.html',
  styleUrls: ['./app-user.component.css']
})

export class AppUserComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private apiUrl = environment.apiUrl;
  pageTitle = 'App Users';
  displayedColumns: string[] = ['Sno', 'userId', 'name', 'email', 'contact', 'class', 'id'];
  users: any;
  currentUser: any;
  userId: string;
  token: string;
  dataSource: any = null;
  customFilters: any = {};
  errorMessage: string;
  limit = 10;
  offset = 0;
  totalUser: number;

  searchFilter: any = {
    name: '',
    email: '',
    contactNumber: null,
    limit: 10,
    offset: 0
  };

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
      this.userId = this.currentUser.id;
      this.token = this.currentUser.token;
    }

    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        // console.log(this.customFilters);
        this.searchFilter = this.customFilters;
        this.offset = this.paginator.pageIndex = (this.customFilters.offset / this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
      } else {
        this.customFilters = {};
      }
    })
    this.getUsers();

  }


  getUsers(): void {
    this.customFilters = {
      name: this.customFilters.name,
      email: this.customFilters.email,
      contactNumber: this.customFilters.contactNumber,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    };
    this.userService.getAppUser(this.customFilters).subscribe((users: any) => {
      console.log(users);
      this.totalUser = users.totalUser;
      this.dataSource = new MatTableDataSource(users.data);
      // this.dataSource.paginator = this.paginator;
    },
      error => this.errorMessage = error as any);
  }


  searchUserData(filters: any) {
    this.resetPageIndex();
    filters.limit = this.paginator.pageSize;
    filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
    this.customFilters = filters;
    this.getUsers();
  }

  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.customFilters = {
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    this.getUsers();
  }

  resetPageIndex() {
    this.paginator.pageIndex = 0;
  }

  reset() {
    this.getUsers();
  }


  deleteUser(user_id) {
    // console.log(user_id, email);
    var result = confirm("Are you sure, you want to delete?");
    if (result) {
      let obj = { user_id: user_id }
      this.userService.deleteUser(obj).subscribe((result: any) => {
        // console.log(result);
        if (result.status) {
          this.getUsers();
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


  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getUsers();
        })
      ).subscribe();
  }

}
