import { Component, OnInit, ViewChild } from '@angular/core';
import { UserTypeService } from './user-type.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

@Component({
  selector: 'app-user-type',
  templateUrl: './user-type.component.html',
  styleUrls: ['./user-type.component.css']
})
export class UserTypeComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any;
  pageTitle = 'User Types';
  displayedColumns: string[] = ['Sno', 'type_name', 'type_order', 'status', 'id'];
  currentUser: any;
  user_id: any;

  constructor(private userTypeSerice: UserTypeService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.getTypes();
  }

  getTypes(){
    this.userTypeSerice.getNextTypes(this.user_id).subscribe((result: any) =>{
      this.dataSource = new MatTableDataSource(result);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  reset() {
    this.getTypes();
  }

}
