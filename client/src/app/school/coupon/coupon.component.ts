import { Component, OnInit, ViewChild } from '@angular/core';
import { SchoolService } from '.././school.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { CouponImportComponent } from '../coupon-import/coupon-import.component';

@Component({
  selector: 'app-coupon',
  templateUrl: './coupon.component.html',
  styleUrls: ['./coupon.component.css']
})

export class CouponComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'Coupons';
  displayedColumns: string[] = ['Sno', 'coupon', 'id'];
  searchFilter: any = {
    limit: 10,
    offset: 0
  }
  currentUser: any;
  customFilters: any = {};
  dataSource: any;
  limit = 10;
  offset = 0;
  total_coupons: number;
  constructor(
    public dialog: MatDialog,
    private schoolService: SchoolService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.getCoupon();
  }

  getCoupon() {
    this.customFilters = {
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    this.schoolService.getCouponsList(this.customFilters).subscribe((couponList: any) => {
      // console.log(couponList);
      this.total_coupons = couponList.total_coupons;
      this.dataSource = new MatTableDataSource(couponList.data);
    })
  }

  reset() {
    this.getCoupon();
  }

  importDialog() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(CouponImportComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => this.getCoupon()
    );
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getCoupon();
        })
      ).subscribe();
  }

}
