import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatOption } from '@angular/material';
import { QuizSetService } from '../quiz-set/quiz-set.service';
import { Http } from '@angular/http';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as _ from "lodash"
import 'chart.piecelabel.js';
import { isArray } from 'util';

@Component({
  selector: 'app-quiz-history',
  templateUrl: './quiz-history.component.html',
  styleUrls: ['./quiz-history.component.css']
})
export class QuizHistoryComponent implements OnInit {

  pageTitle = 'Quiz Sets';

  @ViewChild('allSelectedSection') private allSelectedSection: MatOption;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  private apiUrl = environment.apiUrl;
  displayedColumns = ['userName', 'class_section', 'total_attempted', 'total_correct', 'total_incorrect', 'total_skipped', 'time_spent', 'percentage', 'attemptedOn'];
  searchFilter: any = {
    setName: ''
  };
  customFilters: any = null;
  quizSets: any;
  quizSetData: any;
  quizSetValue: any;
  errorMessage: string;
  dataSource: any;
  quizSetId: number;
  getTotalCorrect: any;
  getTotalIncorrect: any;
  getTotalSkipped: any;
  getTotalBelowAvg: any;
  getTotalAvg: any;
  getTotalAboveAvg: any;
  getFirstAvg: any;
  colNum = 1;
  classArr = [];
  sectionArr = [];
  quizClassInfo: any;
  quizSectionInfo: any;
  rowHeight = '400px';
  class_id = [];
  section_id = [];
  filterClassId = [];
  filterSectionId = [];
  // Pie

  public pieChartLegend = true;
  public pieChartPlugins = [];



  public pieChartType = 'pie';
  public pieChartLabels: Array<string> = ['Above 80%', 'Betweeen 61% and 80%', 'Betweeen 40% and 60%', 'Below 40%'];
  public pieChartData: Array<number> = [1, 1, 1];
  public pieChartColors: Array<any> = [
    { // all colors in order
      backgroundColor: ['green', 'blue', 'orange', 'red'],
      color: ['white', 'white', 'white', 'white']
    }
  ];

  public pieChartOptions: any = {
    pieceLabel: {
      render: (args) => {
        const label = args.label,
          value = args.value;
        return value;
      },
      fontColor: '#fff'
    },
    legend: { position: 'right' }
  };

  private sub: Subscription;
  constructor(
    private http: Http,
    private quizSetService: QuizSetService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(
      params => {
        this.quizSetId = +params['id'];
      }
    );

    this.route.queryParams.subscribe((paramsData: any) => {
      if (Object.keys(paramsData).length != 0) {

        if (isArray(paramsData.class_id)) {
          this.class_id = paramsData.class_id.map(Number);
        } else {
          this.class_id[0] = parseInt(paramsData.class_id);
        }

        if (isArray(paramsData.section_id)) {
          this.section_id = paramsData.section_id.map(Number);
        } else {
          this.section_id[0] = parseInt(paramsData.section_id);
        }
        this.filterSectionId = this.section_id;
        this.filterClassId = this.class_id;
      }
    });

    this.customFilters = {
      quiz_set_id: this.quizSetId
    };
    // this.getQuizSets();
    this.getfilterClasses();
  }

  public randomizeType(): void {
    this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
  }

  public chartClicked(e: any): void {
    //console.log(e);
    if (this.quizSetData.length > 0) {
      this.router.navigate(['/questionHistory', this.quizSetId], {
        queryParams: {
          class_id: this.class_id,
          section_id: this.section_id
        }
      });
    }
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  getQuizSets() {
    this.customFilters = {
      quiz_set_id: this.customFilters.quiz_set_id,
      class_id: this.class_id,
      section_id: this.section_id
    };
    this.quizSetService.getQuizSetsData(this.customFilters)
      .subscribe(quizSets => {
        this.quizSetData = quizSets;
        if (this.quizSetData.length > 0) {
          this.quizSetValue = this.quizSetData[0].set_name;
        }
        this.quizSetData.map((quizVal, index) => {
          this.quizSetData[index].total_attempted = parseInt(quizVal.total_attempted);
          this.quizSetData[index].total_correct = parseInt(quizVal.total_correct);
          this.quizSetData[index].total_incorrect = parseInt(quizVal.total_incorrect);
          this.quizSetData[index].total_skipped = parseInt(quizVal.total_skipped);
        });
        this.freshDataList(this.quizSetData);
        this.getTotalBelowAvg = this.getBelowAvgCount();
        this.getTotalAvg = this.getAvgCount();
        this.getFirstAvg = this.getFirstAvgCount();
        this.getTotalAboveAvg = this.getAboveAvgCount();

        this.pieChartData = [this.getTotalAboveAvg, this.getFirstAvg, this.getTotalAvg, this.getTotalBelowAvg];
        return quizSets;
      },
        error => this.errorMessage = error as any);
  }

  getTotalCorrectCount() {
    return this.quizSetData.map(td => {
      let cVal;
      if (td.total_correct === undefined || td.total_correct === '' || td.total_correct === null) {
        cVal = 0;
      } else {
        cVal = td.total_correct;
      }
      return cVal;
    }
    )
      .reduce((acc, value) => {
        return acc + value;
      }, 0
      );
  }

  getTotalIncorrectCount() {
    return this.quizSetData.map(td => {
      let cVal;
      if (td.total_incorrect === undefined || td.total_incorrect === '' || td.total_incorrect === null) {
        cVal = 0;
      } else {
        cVal = td.total_incorrect;
      }
      return cVal;
    }
    )
      .reduce((acc, value) => {
        return acc + value;
      }, 0
      );
  }

  getTotalSkippedCount() {
    return this.quizSetData.map(td => {
      let cVal;
      if (td.total_skipped === undefined || td.total_skipped === '' || td.total_skipped === null) {
        cVal = 0;
      } else {
        cVal = td.total_skipped;
      }
      return cVal;
    }
    )
      .reduce((acc, value) => {
        return acc + value;
      }, 0
      );
  }

  getBelowAvgCount() {
    return this.quizSetData.map(td => {
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalSkipped = 0;
      let totalVal = 0;
      let totalAvgCount = 0;

      if (td.total_correct !== undefined || td.total_correct !== '' || td.total_correct !== null) {
        totalCorrect = td.total_correct;
      }

      if (td.total_incorrect !== undefined || td.total_incorrect !== '' || td.total_incorrect !== null) {
        totalIncorrect = td.total_incorrect;
      }

      if (td.total_skipped !== undefined || td.total_skipped !== '' || td.total_skipped !== null) {
        totalSkipped = td.total_skipped;
      }
      totalVal = (totalCorrect / (totalCorrect + totalIncorrect + totalSkipped)) * 100;
      if (totalVal < 40) {
        totalAvgCount = totalAvgCount + 1;
      }
      return totalAvgCount;
    }
    )
      .reduce((acc, value) => {
        return acc + value;
      }, 0
      );
  }

  getAvgCount() {
    return this.quizSetData.map(td => {
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalSkipped = 0;
      let totalVal = 0;
      let totalAvgCount = 0;

      if (td.total_correct !== undefined || td.total_correct !== '' || td.total_correct !== null) {
        totalCorrect = td.total_correct;
      }

      if (td.total_incorrect !== undefined || td.total_incorrect !== '' || td.total_incorrect !== null) {
        totalIncorrect = td.total_incorrect;
      }

      if (td.total_skipped !== undefined || td.total_skipped !== '' || td.total_skipped !== null) {
        totalSkipped = td.total_skipped;
      }
      totalVal = (totalCorrect / (totalCorrect + totalIncorrect + totalSkipped)) * 100;
      if (totalVal >= 40 && totalVal <= 60) {
        totalAvgCount = totalAvgCount + 1;
      }
      return totalAvgCount;
    }
    )
      .reduce((acc, value) => {
        return acc + value;
      }, 0
      );
  }

  getFirstAvgCount() {
    return this.quizSetData.map(td => {
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalSkipped = 0;
      let totalVal = 0;
      let totalAvgCount = 0;

      if (td.total_correct !== undefined || td.total_correct !== '' || td.total_correct !== null) {
        totalCorrect = td.total_correct;
      }

      if (td.total_incorrect !== undefined || td.total_incorrect !== '' || td.total_incorrect !== null) {
        totalIncorrect = td.total_incorrect;
      }

      if (td.total_skipped !== undefined || td.total_skipped !== '' || td.total_skipped !== null) {
        totalSkipped = td.total_skipped;
      }
      totalVal = (totalCorrect / (totalCorrect + totalIncorrect + totalSkipped)) * 100;
      if (totalVal > 60 && totalVal <= 80) {
        totalAvgCount = totalAvgCount + 1;
      }
      return totalAvgCount;
    }
    )
      .reduce((acc, value) => {
        return acc + value;
      }, 0
      );
  }

  getAboveAvgCount() {
    return this.quizSetData.map(td => {
      let totalCorrect = 0;
      let totalIncorrect = 0;
      let totalSkipped = 0;
      let totalVal = 0;
      let totalAvgCount = 0;

      if (td.total_correct !== undefined || td.total_correct !== '' || td.total_correct !== null) {
        totalCorrect = td.total_correct;
      }

      if (td.total_incorrect !== undefined || td.total_incorrect !== '' || td.total_incorrect !== null) {
        totalIncorrect = td.total_incorrect;
      }

      if (td.total_skipped !== undefined || td.total_skipped !== '' || td.total_skipped !== null) {
        totalSkipped = td.total_skipped;
      }
      totalVal = (totalCorrect / (totalCorrect + totalIncorrect + totalSkipped)) * 100;
      if (totalVal > 80) {
        totalAvgCount = totalAvgCount + 1;
      }
      return totalAvgCount;
    }
    )
      .reduce((acc, value) => {
        return acc + value;
      }, 0
      );
  }


  freshDataList(quizData) {
    this.quizSetData = quizData;
    console.log(this.quizSetData)
    this.dataSource = new MatTableDataSource(this.quizSetData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  resetListFilter() {
    this.resetPageIndex();
    this.getQuizSets();
  }

  reset() {
    this.resetPageIndex();
    this.searchFilter = {};
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
    this.getQuizSets();
  }

  getfilterClasses() {
    let quizObj = {
      quiz_set_id: this.quizSetId
    }
    this.quizSetService.getQuizSetClassInfo(quizObj).subscribe((quizInfoRes: any) => {
      this.quizClassInfo = quizInfoRes.data;
      this.quizClassInfo.forEach(element => {
        this.classArr.push(element.quiz_class);
      });
      this.classArr = this.classArr.filter((thing, index, self) =>
        index === self.findIndex((t) => (
          t.id === thing.id
        ))
      );
      this.filterClassId = [];
      this.classArr.forEach(classData => { this.filterClassId.push(classData.id) });
      this.changeClass(this.filterClassId);
    });
  }

  changeSection(section_id) {
    this.section_id = section_id;
    this.getQuizSets();
  }

  changeClass(class_id) {
    if (class_id[0] == null) {
      this.sectionArr = [];
      this.class_id = null;
      this.section_id = null;
      this.getQuizSets();
    } else {
      this.class_id = class_id;
      this.getQuizSets();
      let quizObj = {
        quiz_set_id: this.quizSetId,
        class_id: this.class_id
      }
      this.quizSetService.getQuizSetSectionInfo(quizObj).subscribe((quizInfoRes: any) => {
        this.sectionArr = quizInfoRes;
      });
    }
  }

}
