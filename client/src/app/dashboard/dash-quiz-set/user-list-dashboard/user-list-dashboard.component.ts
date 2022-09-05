import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';

@Component({
  selector: 'app-user-list-dashboard',
  templateUrl: './user-list-dashboard.component.html',
  styleUrls: ['./user-list-dashboard.component.css']
})
export class UserListDashboardComponent implements OnInit {

  @Input() inputData;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns = ['userName', 'total_quiz_attempt', 'total_attempted', 'total_correct', 'total_incorrect', 'total_skipped', 'percentage'];

  dataSource: any;
  school_id: any;
  class_id: any;
  section_id: any;
  limit = 12;
  offset = 0;
  customFilters = {}
  studentList: any;
  section_name: string;

  constructor(private dashboardService: DashboardService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {

    this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
        this.class_id = +params['class_id'];
        this.section_id = +params['section_id'];
      }
    );
    this.customFilters = {
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id,
      limit: this.limit,
      offset: this.offset
    }
    this.section_name = this.inputData.section_name;
    this.getAttemptUserList();
  }


  getAttemptUserList(){
    this.dashboardService.getAttemptUserList(this.customFilters).subscribe((student: any) => {
      // console.log(student);
      this.studentList = student;
    this.dataSource = new MatTableDataSource(this.studentList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    })
  }

  graphView(){
    this.router.navigate(['/quiz_dashboard', `${this.school_id}`, `${this.class_id}`, `${this.section_id}`]);
  }
}
