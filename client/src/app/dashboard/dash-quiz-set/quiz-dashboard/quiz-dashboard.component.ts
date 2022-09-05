import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatDialogConfig, MatDialog } from '@angular/material';
import { DashboardService } from '../../dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { QuizInfoDashboardComponent } from '../quiz-info-dashboard/quiz-info-dashboard.component';

@Component({
  selector: 'app-quiz-dashboard',
  templateUrl: './quiz-dashboard.component.html',
  styleUrls: ['./quiz-dashboard.component.css']
})
export class QuizDashboardComponent implements OnInit {

  @Input() inputData;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild(MatSort) sort: MatSort;

  currentUser: any;
  type_order: String;
  school_id: number;
  class_id: number;
  section_id: number;
  limit = 12;
  offset = 0;
  quizSetData: any;
  total_count: number;
  customFilters = {}
  quizSetLength: number;
  heading = false;
  section_name: string;
  rowHeight = '650px';
  chartTile = '';
  

  constructor(private dashboardService: DashboardService,
    private route: ActivatedRoute,
    public dialog: MatDialog) {  }

  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
        this.class_id = +params['class_id'];
        this.section_id = +params['section_id'];
      }
    );

    this.section_name = this.inputData.section_name;
    this.customFilters = {
      user_id: this.currentUser.id,
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id,
      chart_type: 'quizDash',
      limit: this.limit,
      offset: this.offset
    }
    
    this.getQuizSets();

  }


  getQuizSets(){
    this.dashboardService.getDasboardQuizSets(this.customFilters).subscribe((quizSets: any) => {
      this.quizSetData = quizSets.data;      
      this.total_count = quizSets.total_count;
      // console.log(this.quizSetData);
      this.quizSetLength = this.total_count;
        if(this.quizSetLength > 2){
          this.rowHeight = "480px";
          this.quizSetLength = 3;
          this.heading = true;
        }
    });
  }

  ngAfterViewInit() {

    merge( this.paginator.page)
    .pipe(
    tap(() => {
        this.offset = this.paginator.pageIndex * this.paginator.pageSize;
        this.limit = this.paginator.pageSize;
        this.ngOnInit();
        })
    )
    .subscribe();
}

openDialog(quiz_set_id) {

  const dialogConfig = new MatDialogConfig();
  dialogConfig.data = {
    school_id: this.school_id,
    class_id: this.class_id,
    section_id: this.section_id,
    quiz_set_id: quiz_set_id
  };
  this.dialog.open(QuizInfoDashboardComponent, dialogConfig);
}
}
