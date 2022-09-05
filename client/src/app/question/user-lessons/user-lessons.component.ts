import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-user-lessons',
  templateUrl: './user-lessons.component.html',
  styleUrls: ['./user-lessons.component.css']
})
export class UserLessonsComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  pageTitle = 'Lesson Assignment For Feedback';
  displayedColumns: string[] = ['name', 'lessonName', 'assignedBy', 'id'];
  users: any;
  currentUser: any;
  userId: string;
  token: string;
  dataSource: any = null;
  customerFilters: any = null;
  errorMessage: string;
  panelOpenState = false;
  userLessonArr: any;
  lessonArrr = [];

  constructor(private questionService: QuestionService) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (this.currentUser) {
      this.userId = this.currentUser.id;
      this.token = this.currentUser.token;
      this.getUserLesson();
    }
  }

  getUserLesson() {
    let obj = {}
    this.questionService.getUserLessons(obj).subscribe((data: any) => {
      this.freshDataList(data.data);
    },
    error => this.errorMessage = error as any)

  }

  freshDataList(users: any) {
    this.userLessonArr = users;
    this.dataSource = new MatTableDataSource(this.userLessonArr);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }

}
