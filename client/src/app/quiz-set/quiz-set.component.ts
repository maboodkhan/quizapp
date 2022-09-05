import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatSnackBar,
  MatPaginator,
  MatTableDataSource,
  MatSort,
  MatDialogConfig,
  PageEvent
} from '@angular/material';
import { Observable, merge } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Http, Response } from '@angular/http';
import { QuizSetService } from './quiz-set.service';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-quiz-set',
  templateUrl: './quiz-set.component.html',
  styleUrls: ['./quiz-set.component.css']
})
export class QuizSetComponent implements OnInit {

  pageTitle = 'Quiz Sets';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  pageEvent: PageEvent;

  private apiUrl = environment.apiUrl;
  displayedColumns = ['set_name', 'status', 'created_on', 'id'];
  searchFilter: any = {
    setName: '',
    created_by: '',
    limit: 0,
    offset: 0
  };
  customFilters: any = null;
  quizSets: any;
  quizSetData: any;
  errorMessage: string;
  dataSource: any;
  userId: number;
  token: string;
  currentUser: any;
  user_type_order: any;
  limit = 10;
  offset = 0;
  total_count: number;
  hostName: string;
  protocol: string;
  
  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private quizSetService: QuizSetService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.currentUser) {
      this.user_type_order = this.currentUser.user_Type.type_order;
      this.userId = this.currentUser.id;
      this.token = this.currentUser.token;
      this.customFilters = { 
        created_by: this.userId,
        offset: this.paginator.pageIndex * this.paginator.pageSize,
        limit: this.paginator.pageSize
      };
      // if(this)
      
      this.route.queryParams.subscribe(
        params => {
          if (params.customFilters) {
            this.customFilters = JSON.parse(params.customFilters);
            this.offset = this.paginator.pageIndex = (this.customFilters.offset/this.customFilters.limit);
            this.limit = this.paginator.pageSize = this.customFilters.limit;
          }
        }
      );
      this.getQuizSets();
    }
  }


  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // on sort or paginate events, load a new page
    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
    tap(() => {
        this.getQuizSets();
        })
    )
    .subscribe();
}


  getQuizSets() {
    this.customFilters = { 
      created_by: this.userId,
      setName: this.customFilters.setName,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    };
    // console.log(this.customFilters);
    this.quizSetService.getQuizSets(this.customFilters)
      .subscribe(quizSets => {
        // console.log(quizSets);
        this.quizSetData = quizSets;
        this.total_count = this.quizSetData.total_count;
        this.freshDataList(this.quizSetData.data);
        return quizSets;
      },
        error => this.errorMessage = error as any);
  }

  searchQuizSets(filters: any) {
    this.resetPageIndex();
    if (filters) {
      filters.created_by = this.userId;
      filters.limit = this.paginator.pageSize
      filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
      this.customFilters = filters;
      this.getQuizSets();
    }

  }

  freshDataList(quizData) {
    this.quizSetData = quizData;
    this.dataSource = new MatTableDataSource(this.quizSetData);
    //this.dataSource.paginator = this.paginator;
   // this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  reset() {
    this.resetPageIndex();
    this.searchFilter = {};
    this.customFilters = { 
      created_by: this.userId,
      limit: this.limit,
      offset: this.offset
    };
    this.getQuizSets();
  }

  resetPageIndex() {
    // reset the paginator
    this.paginator.pageIndex = 0;
  }

  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.customFilters = { created_by: this.userId };
    this.getQuizSets();
  }

  deleteQuiz(quiz_id) {
    var result = confirm("Are you sure, you want to delete the quiz set?");
    if (result) {
      let obj = { quiz_id: quiz_id }
      this.quizSetService.deleteQuiz(obj).subscribe((result: any) => {
        if (result.status) {
          this.getQuizSets();
          this.openSnackBar('QuizSet deleted successfully. ', 'Close');
        }
      },
        error => this.errorMessage = error as any);
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  copyClipboard(quizSetId){
    // console.log(quizSetId);
    quizSetId = btoa(quizSetId)
    this.hostName = window.location.hostname;
    this.protocol = window.location.protocol;
    // let url = this.protocol + '//' + this.hostName + '/attempt-quiz/' + quizSetId
    let url = this.protocol + '//' + this.hostName + ':4200' + '/#/attempt-quiz/' + quizSetId
    
    const selBox = document.createElement('textarea');
    selBox.value = url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    console.log(url);
    this.openSnackBar('Quiz Set URL Copied. ', 'Close');
  }

}
