import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppContentService } from '../app-content.service';

@Component({
  selector: 'app-app-content-file-data',
  templateUrl: './app-content-file-data.component.html',
  styleUrls: ['./app-content-file-data.component.css']
})

export class AppContentFileDataComponent implements OnInit {

  lesson_id: number;
  content_id: number;
  contentData: any;
  path: string;
  extension: string;
  prwCheck: string;
  constructor(
    private route: ActivatedRoute,
    private contentService: AppContentService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.lesson_id = parseInt(params.lesson_id);
      this.content_id = parseInt(params.content_id);
      this.getContent();
    });
    this.route.queryParams.subscribe(paramsData =>{
      this.prwCheck = paramsData.prwCheck;
      // console.log(this.prwCheck)
    })
  }

  getContent(){
    let obj = {
      content_id: this.content_id
    }
    this.contentService.getLessonContent(obj).subscribe((contentData: any) => {
      this.contentData = contentData.data;
      // console.log(this.contentData);
      this.path = this.contentData.path;
      this.extension = this.path.split('.').pop();
    });
  }

}

