import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SyllabusService } from '../syllabus.service';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.component.html',
  styleUrls: ['./lesson.component.css']
})
export class LessonComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'Lessons';
  displayedColumns: string[] = ['Sno', 'lessonLogo', 'class', 'subject', 'lesson', 'id'];
  currentUser: any;
  dataSource: any;
  customFilters: any = {};
  limit = 10;
  offset = 0;
  boards: any;
  totalLesson: number;
  contentTypeDisable: boolean = true;
  classList = [];
  subjectList = [];

  msUrl = environment.msUrl;

  
  searchFilter: any = {
    lesson_name : '',
    board_id: [],
    class_id: [],
    subject_id: [],
    status: 0,
    limit: 10,
    offset: 0
  };
  

  constructor(
    private syllabusService: SyllabusService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        if (this.customFilters.board_id != '') {
          this.changeBoard(this.customFilters.board_id);
        }
         if (this.customFilters.class_id != '') {
          this.changeClass(this.customFilters.class_id);
         }
         if (this.customFilters.subject_id != '') {
          this.changeSubject(this.customFilters.subject_id);
        }
        this.offset = this.paginator.pageIndex = (this.customFilters.offset / this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
        this.searchFilter = this.customFilters;
      } else {
        this.customFilters = {};
      }
      this.getLessonsList();
    });
    this.getBoards();
  }

  getLessonsList() {
    this.customFilters = {
      lesson_name : this.customFilters.lesson_name,
      board_id : this.customFilters.board_id,
      class_id : this.customFilters.class_id,
      subject_id: this.customFilters.subject_id,
      status: this.customFilters.status,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    //console.log(this.customFilters);
    this.syllabusService.getLessonsList(this.customFilters).subscribe((data: any) => {
       console.log(data);
      this.totalLesson = data.totalLesson;
      this.dataSource = new MatTableDataSource(data.data);
      // this.dataSource.paginator = this.paginator;
      // console.log(this.totalContent);
    })
  }
  reset() {
    this.getLessonsList();
  }

  
  resetPageIndex() {
    this.paginator.pageIndex = 0;
  }

  editLesson(lesson_id) {
    this.router.navigate(['/addeditlesson', lesson_id],
      {
        queryParams: { customFilters: JSON.stringify(this.customFilters) }
      });
  }

 
  getBoards(nonAcademicVal = 0) {
    const paramsVal = { non_academic: nonAcademicVal };
    this.syllabusService.getBoards(paramsVal).subscribe((result: any) => {
      this.boards = result.data;
    });
  }

 
  changeBoard(strVal, defaultVal = 0) {
    let paramsVal = { board_id: strVal };
    this.syllabusService.getClasses(paramsVal).subscribe((result: any) => {
      this.classList = result.data;
      //console.log(this.classList)
    });
    this.contentTypeDisable = true;
  }
 
  changeClass(class_id, defaultVal = 0) {
    let classObj = { class_id: class_id }
    this.syllabusService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
    this.contentTypeDisable = true;
  }
  
  
  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    this.contentTypeDisable = true;
  }


  searchUserData(filters: any) {
    //console.log(filters);
    
    this.resetPageIndex();
    if (filters) {
      filters.limit = this.paginator.pageSize;
      filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
      this.customFilters = filters;
      this.getLessonsList();
    }
  }


  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.customFilters = {
      //class_id: this.classArr,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    this.getLessonsList();
  }

 

  ngAfterViewInit() {
    window.scrollTo(0, 0);
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getLessonsList();
        })
      ).subscribe();
  }



}
