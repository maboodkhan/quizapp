import { Component, OnInit, Input } from '@angular/core';
import { QuestionService } from 'src/app/question/question.service';
// import { QuestionService } from '../question.service';

@Component({
  selector: 'app-poll-chart',
  templateUrl: './poll-chart.component.html',
  styleUrls: ['./poll-chart.component.css']
})
export class PollChartComponent implements OnInit {

  @Input() chartData;

  currentUser: any;
  chartLable = [];
  ansOptions = [];
  totalAnswer: number;
  totalAnsOpt: number;
  chartGridWidth = '380px';
  reportResult: any;
  chartDataArr = [];
  
  public pieChartType = 'pie';
  public pieChartLabels: Array<string> = [];
  public pieChartData: Array<number> = [0, 0, 0];
  public pieChartColors: Array<any> = [
    { // all colors in order
      backgroundColor: ['red', 'grey', 'orange', 'blue', 'green'],
      color: ['white', 'white', 'white', 'white']
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

  constructor(private questionService: QuestionService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.ansOptions = this.chartData.ansOptions;
    // console.log(this.chartData);
    this.ansOptions.forEach(element => {
      this.chartLable.push(element.answer);
    });
    this.pieChartLabels = this.chartLable;
    this.getPollReport();
  }

  public randomizeType(): void {
    this.pieChartType = this.pieChartType === 'doughnut' ? 'pie' : 'doughnut';
  }

  getPollReport(){
    let searchObj = {};
    // console.log(this.chartData);
    if(this.chartData.schedule_id){
      searchObj = {
        poll_question_id: this.chartData.poll_question_id,
        schedule_id: this.chartData.schedule_id,  
      }
    }else{
      searchObj = { 
        poll_question_id: this.chartData.poll_question_id,
        startDate: this.chartData.startDate,
        endDate: this.chartData.endDate,
        school_id: this.chartData.school_id,
        class_id: this.chartData.class_id,
        section_id: this.chartData.section_id,
        teacherUserId: this.chartData.teacherUserId
      }
    }
    
    // console.log(searchObj);
    this.questionService.getPollResult(searchObj).subscribe((result: any) => {
      // console.log(result);
      this.reportResult = result.data;
      this.analyseReport();
      // this.pieChartData = [5,4,8,6,10];
    })
  }

  analyseReport(){
    this.totalAnswer = this.reportResult.length;
    this.ansOptions.forEach(ans => {
      let count = 0;
      this.reportResult.forEach(rs => {
        if(ans.id == rs.id){
          count ++;
        }
      });
      let percent = Math.round((count * 100 ) / this.totalAnswer); 
      this.chartDataArr.push(percent);
    })
    this.pieChartData = this.chartDataArr;
  }

}
