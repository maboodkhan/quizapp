import { Component, OnInit, Input } from '@angular/core';
import { DashboardService } from '../../dashboard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topic-chart',
  templateUrl: './topic-chart.component.html',
  styleUrls: ['./topic-chart.component.css']
})
export class TopicChartComponent implements OnInit {

  @Input() chartData;

  school_id: number;
  class_id: number;
  section_id: number;
  chartSize: number;
  chartGridWidth = '400px';
  chart_type: string;
  quiz_set_id: number;
  student_id: number;
  topic_id: number;
  customFilters: {};
  errorMessage: string;
  topicData: any;

  total_correct: number = 0;
  total_incorrect: number = 0;
  total_skipped: number = 0;
  total_question: number = 0;

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
          value = args.value+'%';
        return value;
      },
      fontColor: '#fff'
    },
    legend: { position: 'right' }
  };

  constructor(private dashboardService: DashboardService,
    private router: Router) { }

  ngOnInit() {
console.log(this.chartData);
    this.school_id = this.chartData.school_id;
    this.class_id = this.chartData.class_id;
    this.section_id = this.chartData.section_id;
    // this.chartSize = this.chartData.chartSize;
    this.chart_type = this.chartData.chart_type;
    this.quiz_set_id = this.chartData.quiz_set_id;
    this.student_id = this.chartData.student_id;
    this.topic_id = this.chartData.topic_id;

    this.customFilters = {
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id,
      chart_type: this.chart_type,
      quiz_set_id: this.quiz_set_id,
      topic_id: this.topic_id,
      student_id: this.student_id
    }

    this.getTopicQuizReport();
  }

  public randomizeType(): void {
    this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
  }

  getTopicQuizReport() {
    this.dashboardService.getTopicReport(this.customFilters).subscribe((topicRes: any) => {
      // console.log(this.chartData);
      this.topicData = topicRes.data
      this.total_question = topicRes.total_question;

      this.topicData.forEach(attempData => {
        if (attempData.attempt_status == 1) {
          this.total_correct = attempData.attempt_count;
        }

        if (attempData.attempt_status == 2) {
          this.total_incorrect = attempData.attempt_count;
        }

        if (attempData.attempt_status == 0) {
          this.total_skipped = attempData.attempt_count;
        }
      });
      // this.quizSetData = quizSets;
      // this.attempt_id = this.quizSetData[0].attempt_id;

      // this.total_attempted = this.quizSetData[0].total_attempted;
      // this.total_correct = this.quizSetData[0].total_correct;
      // this.total_incorrect = this.quizSetData[0].total_incorrect;
      // this.total_skipped = this.quizSetData[0].total_skipped;

      this.pieChartData = [this.total_correct, this.total_incorrect, this.total_skipped];
    },
      error => this.errorMessage = error as any);
  }

}
