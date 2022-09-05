import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AclService } from '../acl.service';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';





@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})
export class PermissionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'Permissions';
  displayedColumns: string[] = ['Sno', 'label', 'link', 'menu_order', 'status', 'id'];
  parent_id: any;
  totalPermission: any;
  dataSource: any;
  currentUser: any;
  user_id: any;
  type_order: any;
  limit = 10;
  offset = 0;
  prev_parent_id: number;
  showBack: boolean = false;
  order = '';
  objT = {};
  errorMessage: any;



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aclService: AclService
  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   return false;
    // };
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;

    this.route.params.subscribe((params) => {
      this.parent_id = params['parent_id'];
      // this.parent_id = params.parent_id;
      //console.log(this.parent_id);
      this.getPermission();
      this.getPrevParentId();
    });
  }

  getPrevParentId() {
    let obj = { parent_id: this.parent_id }
    this.aclService.getPrevParentId(obj).subscribe((data: any) => {
      console.log(data);
      if (data.data) {
        this.prev_parent_id = data.data.parent_id;
        this.showBack = true;
      } else {
        this.showBack = false;
      }
    })
  }

  addPermission(parent_id) {
    this.router.navigate(['/addPermission', parent_id]);
  }

  editPermission(id) {
    this.router.navigate(['/editPermission', this.parent_id, id]);
  }

  openPermission(parent_id) {
    // this.parent_id = parent_id;
    // this.getPermission();
    this.paginator.pageSize = 10;
    this.paginator.pageIndex = 0;
    this.router.navigate(['/permission', parent_id]);
  }

  onChange(newOrder, parent_id){
    // this.parent_id = parent_id;
    this.order = newOrder.target.value;
    let obj = {
      parent_id : parent_id,
      menu_order : this.order
    }
      this.aclService.updateMenuOrder(obj).subscribe((response: any) => {
        if (response.status == true) {
         console.log("updated");
        }
        else {
          this.errorMessage = response;
        }
      });
    }

  getPermission() {
    let obj = {};
    obj = {
      parent_id: this.parent_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    console.log(obj);
    this.aclService.getPermissions(obj).subscribe((data: any) => {
      console.log(data);
      this.totalPermission = data.totalPermission;
      this.dataSource = new MatTableDataSource(data.data);
    });
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          this.getPermission();
        })
      ).subscribe();
  }
}
