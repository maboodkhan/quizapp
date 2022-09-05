import { Component, OnInit, ViewChild } from '@angular/core';
import { MatOption, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { SyllabusService } from '../syllabus.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.css']
})
export class TopicComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('allSelectedLessons') private allSelectedLessons: MatOption;


  pageTitle = 'Topics';
  displayedColumns: string[] = ['Sno', 'board', 'class', 'subject', 'lesson', 'topic', 'id'];
  currentUser: any;
  dataSource: any;
  customFilters: any = {};
  limit = 10;
  offset = 0;
  totalTopic: number;
  msUrl = environment.msUrl;
  contentTypeDisable: boolean = true;
  classList = [];
  subjectList = [];
  lessonList = [];

   
  searchFilter: any = {
    topic_name : '',
    board_id: [],
    class_id: [],
    subject_id: [],
    lesson_id: [],
    status: 0,
    limit: 10,
    offset: 0
  };
  boards: any;
 
  
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
        if (this.customFilters.lesson_id != '') {
          this.changeLesson(this.customFilters.lesson_id);
        }
        this.offset = this.paginator.pageIndex = (this.customFilters.offset / this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
        this.searchFilter = this.customFilters;
      } else {
        this.customFilters = {};
      }
    });
    this.getTopicListNew();
    this.getBoards();

  }

  getTopicListNew() {
    this.customFilters = {
      topic_name : this.customFilters.topic_name,
      board_id : this.customFilters.board_id,
      class_id : this.customFilters.class_id,
      subject_id: this.customFilters.subject_id,
      lesson_id : this.searchFilter.lesson_id,
      status: this.customFilters.status,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    //console.log(this.customFilters);
    this.syllabusService.getTopicListNew(this.customFilters).subscribe((data: any) => {
       //console.log(data);
      this.totalTopic = data.totalTopic;
      this.dataSource = new MatTableDataSource(data.data);
      // this.dataSource.paginator = this.paginator;
      // console.log(this.totalContent);
    })
  }
  reset() {
    this.getTopicListNew();
  }
  
  resetPageIndex() {
    this.paginator.pageIndex = 0;
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
  
  
  changeSubject(subject_id, defaultVal = 0) {
    const paramsVal = { subject_id: subject_id };
    this.syllabusService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessonList = result.data;
    });
    this.contentTypeDisable = true;
  }

  changeLesson(strVal, defaultVal = 0) {
    const paramsVal = { lesson_id: [strVal] };

  }

  searchUserData(filters: any) {
    //console.log(filters);
     this.resetPageIndex();
    if (filters) {
      filters.limit = this.paginator.pageSize;
      filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
      this.customFilters = filters;
      this.getTopicListNew();
    }
  }

  selectAllLessons() {
    let lessonVal = [0];
    if (this.allSelectedLessons.selected) {
      this.searchFilter.lesson_id = this.lessonList.map(item => item.id)
      this.searchFilter.lesson_id.push(0);
      lessonVal = this.searchFilter.lesson_id;
    } else {
      this.searchFilter.lesson_id=[];
    }
    this.changeLesson(lessonVal);
  }

  tosslePerLesson() {
    if (this.allSelectedLessons.selected) {
      this.allSelectedLessons.deselect();
      return false;
    }
    if (this.searchFilter.lesson_id.length === this.lessonList.length) {
      this.allSelectedLessons.select();
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
    this.getTopicListNew();
  }

  editTopic(topic_id) {
    this.router.navigate(['/addedittopic', topic_id],
      {
        queryParams: { customFilters: JSON.stringify(this.customFilters) }
      });
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getTopicListNew();
        })
      ).subscribe();
  }

}
