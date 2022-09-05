import { Component, OnInit, Input } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Router } from '@angular/router';
import { PostDashboardService } from '../../post-dashboard.service';

@Component({
  selector: 'app-post-student-quiz-chat',
  templateUrl: './post-student-quiz-chat.component.html',
  styleUrls: ['./post-student-quiz-chat.component.css']
})
export class PostStudentQuizChatComponent implements OnInit {

  @Input() chartData;

  currentUser: any;
  customFilters: any = null;
  quizSetData: any;
  total_attempted: number = 0;
  total_correct: number;
  total_incorrect: number;
  total_skipped: number;
  chartSize: number;
  attempt_id: number;
  percentage: number;

  errorMessage: string;
  colNum = 1;
  school_id: number;
  class_id: number;
  section_id: number;
  chartGridWidth = '400px';
  chart_type: string;

  quiz_set_id: number;
  student_id: number;
  
  
  public pieChartType = 'pie';
  public pieChartLabels: Array<string> = ['Total Correct', 'Total Incorrect', 'Total Skipped'];
  public pieChartData: Array<number> = [0, 0, 0];
  public pieChartColors: Array<any> = [
    { // all colors in order
      backgroundColor: ['green', 'red', 'orange'],
      color: ['white', 'white', 'white']
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


  constructor(private postDashboardService: PostDashboardService,
    private router: Router) { }

  ngOnInit() {

    this.school_id = this.chartData.school_id;
    this.class_id = this.chartData.class_id;
    this.section_id = this.chartData.section_id;
    this.quiz_set_id = this.chartData.quiz_set_id;
    this.student_id = this.chartData.student_id;
    this.chartSize = this.chartData.chartSize;

    this.customFilters = {
      quiz_set_id: this.quiz_set_id,
      student_id: this.student_id
    }

    if (this.chartSize < 3) {
      this.chartGridWidth = '600px';
    }

    this.getQuizSets();
  }

  public randomizeType(): void {
    this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
  }


  getQuizSets() {
    this.postDashboardService.getQuizDataReport(this.customFilters).subscribe(quizSets => {
      // console.log(quizSets);
      this.quizSetData = quizSets;
      this.attempt_id = this.quizSetData[0].attempt_id;

      this.total_attempted = this.quizSetData[0].total_attempted;
      this.total_correct = this.quizSetData[0].total_correct;
      this.total_incorrect = this.quizSetData[0].total_incorrect;
      this.total_skipped = this.quizSetData[0].total_skipped;
      this.percentage = this.quizSetData[0].percentage.toFixed(2);

      // console.log(this.total_correct, this.total_incorrect, this.total_skipped)

      this.pieChartData = [this.total_correct, this.total_incorrect, this.total_skipped];
    },
      error => this.errorMessage = error as any);
  }

  public chartClicked(e: any): void {
    this.router.navigate(['/userQuizHistory', `${this.school_id}`, `${this.class_id}`, 
    `${this.section_id}`, `${this.student_id}`, `${this.quiz_set_id}`, `${this.attempt_id}`],{
      queryParams: {
        postTest: 1
      }
    });
  }

}
