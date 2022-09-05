import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-content-file-data',
  templateUrl: './content-file-data.component.html',
  styleUrls: ['./content-file-data.component.css']
})
export class ContentFileDataComponent implements OnInit {

  lesson_id: number;
  content_id: number;
  contentData: any;
  path: string;
  extension: string;
  prwCheck: string;
  contentType: number;
  contentUrl = environment.contentUrl
  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService) { }

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
    this.contentService.getContentById(obj).subscribe((contentData: any) => {
      this.contentData = contentData.data;
      // console.log(this.contentData);
      if(this.contentData.content_type == 6 || this.contentData.content_type == 7){
        this.path = this.contentData.path;
      }else{
        this.path = this.contentUrl+'/'+this.contentData.path;
      }
      // this.path = this.contentData.path;
      this.contentType = this.contentData.content_type;
      this.extension = this.path.split('.').pop();
    });
  }

}
