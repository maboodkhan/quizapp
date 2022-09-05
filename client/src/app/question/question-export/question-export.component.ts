import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { QuestionService } from '../question.service';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
// import pdfMake from "pdfmake/build/pdfmake";  
// import pdfFonts from "pdfmake/build/vfs_fonts";  
// pdfMake.vfs = pdfFonts.pdfMake.vfs; 
import { MathContent } from 'src/app/math/math-content';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';

@Component({
  selector: 'app-question-export',
  templateUrl: './question-export.component.html',
  styleUrls: ['./question-export.component.css']
})
export class QuestionExportComponent implements OnInit {

  inputData: any;
  questionData = [];
  // subArr = [];
  decodeData = [];
  quesVal: string;
  mathMl: MathContent = {
    mathml: ''
  };
  consvertObj: any;
  private imgUrl = environment.imgUrl;

  constructor(private questionService: QuestionService,
    private route: ActivatedRoute) {}

  ngOnInit() {

    this.route.queryParams.subscribe((paramsData: any) => {
      this.inputData = paramsData;
    });

    this.getAllQuestions(this.inputData);
    // this.generatePDF();
  }

  getAllQuestions(paramsVal) {
    // console.log(paramsVal);
    this.questionService.getAllTopicQuestions(paramsVal).subscribe((result: any) => {
      if (result.data) {
        console.log(result.data);
        this.questionData = [];
        let response = result.data;
        response = response.filter(sq => sq.syllabus_questions);
        let group = response.reduce((r, a) => {
          r[a.syllabus_id] = [...r[a.syllabus_id] || [], a];
          return r;
         }, {});
        //  console.log(group);
         this.questionData = Object.values(group);
 
      }
    });
  }
 
  close() {
    // this.dialogRef.close();
  }

  exportAsPDF() {
    let data = document.getElementById('pdf');
    console.log(data);
    html2canvas(data).then(canvas => {
      const contentDataURL = canvas.toDataURL('image/png');
      var imgWidth = 210;
      var pageHeight = 295;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var heightLeft = imgHeight;

      var doc = new jspdf.jsPDF('p', 'mm');
      var position = 0;

      doc.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      }
      doc.save( 'file.pdf');
    });
  }

 


}
