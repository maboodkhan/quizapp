import { Component, OnInit, ViewChild } from '@angular/core';
import { QuizSetService } from '../quiz-set.service';
import { Http } from '@angular/http';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-quiz-set-school',
  templateUrl: './quiz-set-school.component.html',
  styleUrls: ['./quiz-set-school.component.css']
})
export class QuizSetSchoolComponent implements OnInit {

  pageTitle = 'Quiz Set Schools';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private apiUrl = environment.apiUrl;
  displayedColumns = ['schoolName', 'publishDate', 'id'];
  searchFilter: any = {
    schoolName: ''
  };
  customFilters: any = null;
  quizSets: any;
  quizSetSchoolData: any;
  errorMessage: any;
  dataSource: any;
  isSelected: any;
  selectedAll: any;
  setId: number;
  msgData: any;
  private sub: Subscription;

  constructor(
    private http: Http,
    private quizSetService: QuizSetService,
    public snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(
      params => {
          this.setId = +params['set_id'];
          if (!this.setId) {
            this.openSnackBar('Please provide set id.', 'close')
            this.router.navigate(['/quizset']);
          }
      }
    );
    this.customFilters = {set_id: this.setId};
    this.getQuizSetSchools();
  }

  getQuizSetSchools() {
    this.quizSetService.getQuizSetSchools(this.customFilters)
        .subscribe(quizSetSchools => {
          this.quizSetSchoolData = quizSetSchools;
          const totalSchools = [];
          this.quizSetSchoolData.data.map((value) => {
            if(value.quiz_set_schools.length) {
              value.publishDate = new Date(value.quiz_set_schools[0].publishDate);
              value.isSelected = true;
              totalSchools.push(1);
            } else {
              value.publishDate = '';
            }
          });
          if(totalSchools.length === this.quizSetSchoolData.data.length) {
            this.selectedAll = this.quizSetSchoolData.data;
          }
          this.freshDataList(this.quizSetSchoolData.data);
          return quizSetSchools;
        },
        error => this.errorMessage = error as any);
  }

  searchQuizSetSchools(filters: any) {
    //Reset page index()
    this.resetPageIndex();

    if (filters) {
      this.customFilters = filters;
      this.getQuizSetSchools();
    }

}

  freshDataList(quizData) {
    this.quizSetSchoolData = quizData;
    this.dataSource = new MatTableDataSource(this.quizSetSchoolData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  reset() {
    this.resetPageIndex();
    this.searchFilter = {};
    this.customFilters = {};
    this.getQuizSetSchools();
  }

  resetPageIndex(){
      // reset the paginator 
      this.paginator.pageIndex = 0;
  }

  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.customFilters = {};
    this.getQuizSetSchools();
  }

  checkIfAllSelected() {
    this.selectedAll = this.quizSetSchoolData.every( (item: any) => {
        return item.isSelected === true;
    });
  }

  selectAll() {
    for (var i = 0; i < this.quizSetSchoolData.length; i++) {
      this.quizSetSchoolData[i].isSelected = this.selectedAll;
    }
  }

  assignSchool(setId) {
    let schoolData = [];
    for (var i = 0; i < this.quizSetSchoolData.length; i++) {
        if(this.quizSetSchoolData[i].isSelected === true) {
            schoolData.push(
              {
                school_id: this.quizSetSchoolData[i].id,
                quiz_set_id: setId,
                publishDate: this.quizSetSchoolData[i].publishDate
              }
            );
        }
    }

    if (schoolData.length < 1) {
        this.openSnackBar('Please select a school. ', 'Close');
        return false;
    }
    const asgnData = {set_id: setId, data: schoolData};
    this.quizSetService.asgnQuizSetSchools(asgnData)
      .subscribe((resultData) => {        
        this.msgData = resultData;
        if(this.msgData.status){
          this.openSnackBar(this.msgData.message, 'Close');
          this.router.navigate(['/quizset'], {queryParamsHandling:'preserve'});
        }
        this.errorMessage = {message: this.msgData.message};
      });
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
        duration: 1500,
    });
}

}
