import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-question-upload',
  templateUrl: './question-upload.component.html',
  styleUrls: ['./question-upload.component.css']
})
export class QuestionUploadComponent implements OnInit {

  uploadURL: any;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    // this.uploadURL = environment.quesUploadUrl;
    this.uploadURL = this.sanitizer.bypassSecurityTrustResourceUrl(environment.quesUploadUrl);
  }

}
