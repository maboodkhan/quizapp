import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserService } from '../user/user.service';
import { ContentService } from './content.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})

export class ContentComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'School Content';
  contentUrl = environment.contentUrl;
  displayedColumns: string[] = ['Sno', 'syllabus', 'title', 'version', 'contentType', 'modified_by', 'modified_on', 'status', 'preview', 'id'];
  currentUser: any;
  dataSource: any;
  customFilters: any;
  limit = 10;
  offset = 0;
  totalContent: number;
  user_id: number;
  type_order: number;

  schoolList: any;
  classList = [];
  subjectList = [];
  lessonList = [];
  topicList = [];
  scheduleData = [];
  userList: any;
  schoolArr = [];
  classArr = [];
  sectionArr = [];

  searchFilter: any = {
    school_id: [],
    class_id: [],
    subject_id: [],
    topic_id: [],
    lesson_id: [],
    status: 0,
    limit: 10,
    offset: 0
  };
  constructor(
    private contentService: ContentService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;

    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        // console.log(this.customFilters);
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
    })

    if (this.type_order == 1 || this.type_order == 2) {
      this.contentService.getActiveSchools(this.user_id).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.getUserClasses();
        this.getContent();
      });
    } else {
      let obj = { user_id: this.user_id }
      this.userService.userSchools(obj).subscribe((data: any) => {
        this.schoolList = data.data;
        this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
        this.classArr = data.userClass;
        // this.customFilters = {
        //   school_id: this.schoolArr,
        //   class_id: this.classArr
        // }
        this.getUserClasses();
        if (Object.keys(this.customFilters).length === 0) {
          this.customFilters = {
            school_id: this.schoolArr,
            class_id: this.classArr
          }
        }
        this.getContent();
      });
    }

  }

  getContent() {

    this.customFilters = {
      school_id: this.customFilters.school_id,
      class_id: this.customFilters.class_id,
      subject_id: this.customFilters.subject_id,
      lesson_id: this.customFilters.lesson_id,
      topic_id: this.customFilters.topic_id,
      status: this.customFilters.status,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    // console.log(this.customFilters);
    this.contentService.getContent(this.customFilters).subscribe((data: any) => {
      console.log(data);
      this.totalContent = data.totalContent;
      this.dataSource = new MatTableDataSource(data.data);
    })
  }

  getUserClasses() {
    let classObj = {
      board_id: 1,
      class_id: this.classArr
    }
    this.contentService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });
  }

  changeClass(class_id) {
    // this.sectionIdArr = [class_id];
    this.subjectList = [];
    this.searchFilter.subject_id = [];
    this.lessonList = [];
    this.searchFilter.lesson_id = [];
    this.topicList = [];
    this.searchFilter.topic_id = [];
    let classObj = { class_id: class_id, section_id: this.sectionArr }

    this.contentService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
  }

  changeSubject(subject_id, defaultVal = 0) {
    this.lessonList = [];
    this.searchFilter.lesson_id = [];
    this.topicList = [];
    this.searchFilter.topic_id = [];
    const paramsVal = { subject_id: subject_id };
    this.contentService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessonList = result.data;
    });
  }

  changeLesson(lesson_id, defaultVal = 0) {
    this.topicList = [];
    this.searchFilter.topic_id = [];
    const paramsVal = { lesson_id: lesson_id };
    this.contentService.getTopics(paramsVal).subscribe((result: any) => {
      this.topicList = result.data;
    });
  }

  searchUserData(filters: any) {
    this.resetPageIndex();
    if (filters) {
      if (!filters.school_id || filters.school_id.length <= 0) {
        filters.school_id = this.schoolArr;
      }
      if (!filters.class_id || filters.class_id.length <= 0) {
        filters.class_id = this.classArr;
      }

      filters.limit = this.paginator.pageSize;
      filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
      this.customFilters = filters;
      this.getContent();
    }
  }

  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.searchFilter = {};
    this.customFilters = {
      school_id: this.schoolArr,
      class_id: this.classArr,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    this.getContent();
  }

  resetPageIndex() {
    this.paginator.pageIndex = 0;
  }

  reset() {
    this.getContent();
  }

  previewContent(content) {
    if (content.content_type == 6) {
      window.open(content.path);
    } else {
      this.router.navigate(['/contentdata', `${content.id}`], {
        queryParams: {
          customFilters: JSON.stringify(this.customFilters),
          prwCheck: 'prew'
        }
      })
    }
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getContent();
        })
      ).subscribe();
  }
}
