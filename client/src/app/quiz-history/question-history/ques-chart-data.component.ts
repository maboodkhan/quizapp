import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ques-chart-data',
  template: `
  <mat-grid-list [cols]="colNum" [rowHeight]="rowHeight">
  <mat-grid-tile>
    <mat-card>
      <canvas baseChart [data]="pieChartData" [labels]="pieChartLabels" [chartType]="pieChartType"
        [options]="pieChartOptions" [colors]="pieChartColors"></canvas>
    </mat-card>

  </mat-grid-tile>


</mat-grid-list>
  `,
  styles: []
})
export class QuesChartDataComponent implements OnInit {

  @Input() questionId;
  @Input() quesData;

  getTotalCorrect: any;
  getTotalIncorrect: any;
  getTotalSkipped: any;
  
  colNum = '1';
  rowHeight = '200px';

  public pieChartLegend = true;
  public pieChartPlugins = [];
  public pieChartType = 'pie';
  public pieChartLabels: Array<string> = ['Correct', 'Incorrect', 'Skipped'];
  public pieChartData: Array<number> = [1, 1, 1];
  public pieChartColors: Array<any> = [
    { // all colors in order
      backgroundColor: ['green', 'red', 'grey'],
      color:['white', 'white', 'white']
    }
  ];

  public pieChartOptions: any = {
    pieceLabel: {
      render: function (args) {
        const label = args.label,
              value = args.value;
        return value;
      },
      fontColor: '#fff'
    },
    legend: { position: 'right' }
  }

  constructor() { }

  ngOnInit() {
    this.getTotalCorrect = this.getTotalCorrectCount();
    this.getTotalIncorrect = this.getTotalIncorrectCount();
    this.getTotalSkipped = this.getTotalSkippedCount();
    this.pieChartData = [this.getTotalCorrect, this.getTotalIncorrect, this.getTotalSkipped];
  }

  getTotalCorrectCount() {
    return this.quesData.map(t =>  t.attempted_quiz_questions.map(td => {
      let cVal = 0;
      if(td.attempt_status === 1 && td.attempted_quiz_question.id === this.questionId) {
        cVal = cVal + 1;
      }
      return cVal;
    })
    .reduce((acc, value) => {
      return  acc + value;
      }, 0)
    )
    .reduce((acc, value) => {
      return acc + value;
      }, 0
    );
  }

  getTotalIncorrectCount() {
    return this.quesData.map(t =>  t.attempted_quiz_questions.map(td => {
      let cVal = 0;
      if(td.attempt_status === 2 && td.attempted_quiz_question.id === this.questionId) {
        cVal = cVal + 1;
      }
      return cVal;
    })
    .reduce((acc, value) => {
      return  acc + value;
      }, 0)
    )
    .reduce((acc, value) => {
      return acc + value;
      }, 0
    );
  }

  getTotalSkippedCount() {
    return this.quesData.map(t =>  t.attempted_quiz_questions.map(td => {
      let cVal = 0;
      if(td.attempt_status === 0 && td.attempted_quiz_question.id === this.questionId) {
        cVal = cVal + 1;
      }
      return cVal;
    })
    .reduce((acc, value) => {
      return  acc + value;
      }, 0)
    )
    .reduce((acc, value) => {
      return acc + value;
      }, 0
    );
  }

}
