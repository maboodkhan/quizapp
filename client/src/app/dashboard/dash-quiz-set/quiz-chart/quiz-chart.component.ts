import { Component, OnInit, Input } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-chart',
  templateUrl: './quiz-chart.component.html',
  styleUrls: ['./quiz-chart.component.css']
})
export class QuizChartComponent implements OnInit {

  @Input() chartData;
  @Input() chartTitle;

  total_quizSets: number = 0;
  currentUser: any;
  customFilters: any = null;
  quizSetData: any;
  quizSetValue: any;
  errorMessage: string;
  getTotalBelowAvg: any;
  getTotalAvg: any;
  getTotalAboveAvg: any;
  getFirstAvg: any;
  colNum = 1;
  school_id: number;
  class_id: number;
  section_id: number;
  chartSize: number;
  chartGridWidth = '380px';
  chart_type: string;
  quiz_set_id: number;
  student_id: number;
  topic_id: number;
  totalQuiz: number;
  totalQuizAttempt: number;
  totalStudent: number;
  avgPercent: any;

  public pieChartType = 'pie';
  public pieChartLabels: Array<string> = ['Above 80%', 'Betweeen 61% and 80%', 'Betweeen 40% and 60%', 'Below 40%'];
  public pieChartData: Array<number> = [0, 0, 0];
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


  constructor(private dashboardService: DashboardService,
    private router: Router) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.school_id = this.chartData.school_id;
    this.class_id = this.chartData.class_id;
    this.section_id = this.chartData.section_id;
    this.chartSize = this.chartData.chartSize;
    this.chart_type = this.chartData.chart_type;
    this.quiz_set_id = this.chartData.quiz_set_id;
    this.student_id = this.chartData.student_id;
    this.topic_id = this.chartData.topic_id;

    this.customFilters = {
      user_id: this.currentUser.id,
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id,
      chart_type: this.chart_type,
      quiz_set_id: this.quiz_set_id,
      topic_id: this.topic_id,
      student_id: this.student_id
    }

    if (this.chartSize < 3) {
      this.chartGridWidth = '600px';
    }

    this.getTotalQuiz();
    this.getQuizSets();
  }

  public randomizeType(): void {
    this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
  }

  getTotalQuiz(){
    this.dashboardService.getTotalQuiz(this.customFilters).subscribe((toatalQuizData: any) => {
      // console.log(toatalQuizData);
      this.totalQuiz = toatalQuizData.data.totalQuiz;
      this.totalQuizAttempt = toatalQuizData.data.totalQuizAttempt;
      this.totalStudent = toatalQuizData.data.totalStudent;
    })
  }


  getQuizSets() {
    // console.log(this.customFilters);
    this.dashboardService.getQuizDataReport(this.customFilters).subscribe(quizSets => {
      // console.log(quizSets);
      this.quizSetData = quizSets;
      this.total_quizSets = this.quizSetData.length;
      if (this.quizSetData.length > 0) {
        this.quizSetValue = this.quizSetData[0].set_name;
      }else{
        this.totalQuizAttempt = 0;
      }
      this.quizSetData.map((quizVal, index) => {
        this.quizSetData[index].total_attempted = parseInt(quizVal.total_attempted);
        this.quizSetData[index].total_correct = parseInt(quizVal.total_correct);
        this.quizSetData[index].total_incorrect = parseInt(quizVal.total_incorrect);
        this.quizSetData[index].total_skipped = parseInt(quizVal.total_skipped);
        this.quizSetData[index].percentage = parseInt(quizVal.percentage);
      });
      this.getTotalBelowAvg = this.getBelowAvgCount();
      this.getTotalAvg = this.getAvgCount();
      this.getFirstAvg = this.getFirstAvgCount();
      this.getTotalAboveAvg = this.getAboveAvgCount();
      this.getAvgPercentage();

      this.pieChartData = [this.getTotalAboveAvg, this.getFirstAvg, this.getTotalAvg, this.getTotalBelowAvg];
      // console.log(this.pieChartData);
      return quizSets;
    },
      error => this.errorMessage = error as any);
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

  getAvgPercentage(){
    let totalPercent = 0;
    let count = 0;
    this.quizSetData.forEach(td => {
      if(td.percentage != undefined){
        totalPercent = totalPercent + td.percentage;
        count++;
      }
    });
    this.avgPercent = (totalPercent / count).toFixed(2);
    if(isNaN(this.avgPercent)){this.avgPercent = 0; }
  }

  public chartClicked(e: any): void {
    // console.log("school",this.school_id);
    // console.log("section", this.section_id);
    // console.log("classID",this.class_id);
    // console.log("quiz_set_id",this.quiz_set_id);
    if (this.quizSetData.length > 0) {

      if (this.school_id != undefined && this.class_id == undefined) {
        this.router.navigate(['/class_dashboard', `${this.school_id}`]);
      }

      if (this.class_id != undefined && this.section_id == undefined) {
        this.router.navigate(['/section_dashboard', `${this.school_id}`, `${this.class_id}`]);
      }

      if (this.section_id != undefined && this.quiz_set_id == undefined) {
        this.router.navigate(['/quiz_dashboard', `${this.school_id}`, `${this.class_id}`, `${this.section_id}`]);
      }

      // if(this.section_id != undefined && this.quiz_set_id == undefined){
      //   this.router.navigate(['/user_quiz_dashboard']);
      // }

      if(this.student_id != undefined){
        this.router.navigate(['/student_quiz_dash', `${this.school_id}`, `${this.class_id}`, `${this.section_id}`, `${this.student_id}`]);
      }

      if (this.quiz_set_id != undefined ) {
        // this.router.navigate(['/topic_dashboard', `${this.school_id}`, `${this.class_id}`, `${this.section_id}`, `${this.quiz_set_id}`]);
        this.router.navigate(['/questionHistory', this.quiz_set_id], {
          queryParams: {
            school_id: this.school_id,
            class_id: this.class_id,
            section_id: this.section_id
          }
        });
      }
      


      // if (this.topic_id != undefined) {
        // this.router.navigate(['/questionHistory', this.quiz_set_id], {
        //   queryParams: {
        //     school_id: this.school_id,
        //     class_id: this.class_id,
        //     section_id: this.section_id
        //   }
        // });
      // }
    }
  }

}
