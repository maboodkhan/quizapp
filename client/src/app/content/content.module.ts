import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { from } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { MathModule } from '../math/math.module';
import { HttpClientModule } from '@angular/common/http';
import { AddEditContentComponent } from './add-edit-content/add-edit-content.component';
import { ContentComponent } from './content.component';
import { ContentImageComponent } from './content-file-data/content-image.component';
import { ContentHtmlComponent } from './content-file-data/content-html.component';
import { ContentMp4Component } from './content-file-data/content-mp4.component';
import { ContentPdfComponent } from './content-file-data/content-pdf.component';
import { ContentFileDataComponent } from './content-file-data/content-file-data.component';
import { ContentSearchComponent } from './content-search/content-search.component';
import { ContentYoutubeComponent } from './content-file-data/content-youtube.component';

const routes = [

  { path: 'content', component: ContentComponent },
  { path: 'addcontent', component: AddEditContentComponent },
  { path: 'editcontent/:content_id', component: AddEditContentComponent },
  { path: 'contentdata/:content_id', component: ContentFileDataComponent },

];

@NgModule({
declarations: [
  ContentComponent,
  AddEditContentComponent,
  ContentImageComponent,
  ContentHtmlComponent,
  ContentMp4Component,
  ContentPdfComponent,
  ContentFileDataComponent,
  ContentSearchComponent,
  ContentYoutubeComponent
],
imports: [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  RouterModule.forChild(routes),
  MathModule.forRoot(),
  HttpClientModule
],
entryComponents: [ContentSearchComponent],
})

export class ContentModule { }
