import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppContentComponent } from './app-content.component';
import { AppAddEditContentComponent } from './app-add-edit-content/app-add-edit-content.component';
import { AppContentFileDataComponent } from './app-content-file-data/app-content-file-data.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared';
import { RouterModule } from '@angular/router';
import { MathModule } from '../math/math.module';
import { HttpClientModule } from '@angular/common/http';
import { AppContentHtmlComponent } from './app-content-file-data/app-content-html.component';
import { AppContentImageComponent } from './app-content-file-data/app-content-image.component';
import { AppContentMp4Component } from './app-content-file-data/app-content-mp4.component';
import { AppContentPdfComponent } from './app-content-file-data/app-content-pdf.component';

const routes = [

  { path: 'appcontent', component: AppContentComponent },
  { path: 'appaddcontent', component: AppAddEditContentComponent },
  { path: 'appeditcontent/:content_id', component: AppAddEditContentComponent },
  { path: 'appcontentdata/:content_id/:lesson_id', component: AppContentFileDataComponent },

];

@NgModule({
declarations: [
  AppContentComponent,
  AppAddEditContentComponent,
  AppContentFileDataComponent,
  AppContentHtmlComponent,
  AppContentImageComponent,
  AppContentMp4Component,
  AppContentPdfComponent
],
imports: [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  RouterModule.forChild(routes),
  MathModule.forRoot(),
  HttpClientModule,
]
})

export class AppContentModule { }
