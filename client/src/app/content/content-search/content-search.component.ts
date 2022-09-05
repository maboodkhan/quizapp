import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-content-search',
  templateUrl: './content-search.component.html',
  styleUrls: ['./content-search.component.css']
})
export class ContentSearchComponent implements OnInit {

  items = [];
  videos: any;
  search: any;
  videoUrl = '';
  nextPageToken = '';
  prevPageToken = '';
  pageToken: string;

  constructor(
    private dialogRef: MatDialogRef<ContentSearchComponent>,
    private contentService: ContentService,
    @Inject(MAT_DIALOG_DATA) data
  ) { 
    console.log("data",data)
    this.search = data.topicValue;
   
  }

  ngOnInit() {
    if(this.search != ''){
      this.searchVideo();
    }
  }

  searchVideo(){
    this.contentService.getVideos(this.search, this.pageToken).subscribe((data: any)=> {
     //console.log(data);
      this.items = data.items;
      if(data.prevPageToken){
        this.prevPageToken = data.prevPageToken;
      }
      this.nextPageToken  = data.nextPageToken;
      this.videos = this.items.map(item => {
        return {
          title: item.snippet.title,
          videoId: item.id.videoId,
          // videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          videoUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
          channelId: item.snippet.channelId,
          channelUrl: `https://www.youtube.com/channel/${item.snippet.channelId}`,
          channelTitle: item.snippet.channelTitle,
          description: item.snippet.description,
          publishedAt: new Date(item.snippet.publishedAt),
          thumbnail: item.snippet.thumbnails.high.url
        };
      });

    })
  }

  closeDialog(videoUrl){
    this.dialogRef.close(videoUrl);
  }

  cancel() {
    this.dialogRef.close();
  }

  watchVideo(url){
    this.videoUrl = url;
  }

  closeVideo(){
    this.videoUrl = '';
  }

  changePage(pageToken){
    this.pageToken = pageToken;
    this.searchVideo();
  }
}
