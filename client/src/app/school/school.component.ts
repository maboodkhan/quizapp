import { Component, OnInit, ViewChild } from '@angular/core';
import { SchoolService } from './school.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.css']
})
export class SchoolComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'School Management';
  displayedColumns: string[] = ['Sno', 'countryName', 'school_name', 'school_code', 'id'];
  searchFilter: any = {
    school_name: '',
    school_code: '',
    country_id: [],
     status: 0,
    limit: 10,
    offset: 0
  }
  currentUser: any;
  user_type_Obj: any = {};
  dataSource: any;
  limit = 10;
  offset = 0;
  totalSchool: number;
  contentTypeDisable: boolean = true;
  countryList: any;
  constructor(
    private schoolService: SchoolService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.queryParams.subscribe((params: any) => {

      if (params.user_type_Obj) {
        this.user_type_Obj = JSON.parse(params.user_type_Obj);
        if (this.user_type_Obj.country_id != '') {
          this.changeCountry(this.user_type_Obj.country_id);
        }
        this.offset = this.paginator.pageIndex = (this.user_type_Obj.offset / this.user_type_Obj.limit);
        this.limit = this.paginator.pageSize = this.user_type_Obj.limit;
        this.searchFilter = this.user_type_Obj;
      } else {
        this.user_type_Obj = {};
      }
    });  
    this.getSchool();

    this.schoolService.getCountries().subscribe((data: any) => {
      this.countryList = data.data;
      //console.log(data);
    })
  }

  getSchool() {
    this.user_type_Obj = {
      type_name: this.currentUser.user_Type.type_name,
      school_name: this.user_type_Obj.school_name,
      school_code: this.user_type_Obj.school_code,
      country_id : this.user_type_Obj.country_id,
      status: this.user_type_Obj.status,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    //console.log(this.user_type_Obj);
    this.schoolService.getSchoolsList(this.user_type_Obj).subscribe((schoolsList: any) => {
      this.dataSource = new MatTableDataSource(schoolsList.data);
      // this.dataSource.paginator = this.paginator;
      this.totalSchool = schoolsList.total_school;
      // this.dataSource.sort = this.sort;
    })
  }

  changeCountry(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    this.contentTypeDisable = true;
  }
  
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  resetPageIndex() {
    // reset the paginator
    this.paginator.pageIndex = 0;
  }
  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.user_type_Obj = {
      type_name: this.currentUser.user_Type.type_name,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    };
    this.getSchool();
  }

  searchSchool(filters: any) {
    //console.log(filters);
    this.resetPageIndex();
    if (filters) {
      filters.limit = this.paginator.pageSize;
      filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
      this.user_type_Obj = filters;
      this.getSchool();
    }
  }


  reset() {
    this.user_type_Obj = {
      type_name: this.currentUser.user_Type.type_name
    }
    this.getSchool();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getSchool();
        })
      ).subscribe();
  }

}
