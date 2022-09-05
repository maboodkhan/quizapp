import { Component, OnInit, ViewChild } from '@angular/core';
import { QuestionService } from '../question.service';
import { MatSort, MatPaginator, MatTableDataSource, PageEvent, MatOption, MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { merge } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { QuestionAssignComponent } from '../question-assign/question-assign.component';
import { BothPreviewComponent } from '../both-preview/both-preview.component';
import { QueAddRemarksComponent } from '../que-add-remarks/que-add-remarks.component';
import { BothAssignComponent } from '../both-assign/both-assign.component';

@Component({
  selector: 'app-question-issues',
  templateUrl: './question-issues.component.html',
  styleUrls: ['./question-issues.component.css']
})
export class QuestionIssuesComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;  
  @ViewChild('allSelectedLessons') private allSelectedLessons: MatOption;
  pageEvent: PageEvent;

  pageTitle = 'Question Issues';
  displayedColumns: string[] = ['S_No', 'issue_id', 'question_id', 'question', 'issueBy' , 'issueStatus', 'created_on', 'assignedTo', 'edit_id', 'editQuestion', 'id'];
  currentUser: any;
  user_id: number;
  type_order: number;
  dataSource: any = null;
  customFilters: any = null;
  questionData = [];
  classes = [];
  subjects = [];
  lessons = [];
  topics = [];
  userList = [];
  limit = 10;
  offset = 0;
  totalIssue: number;
  selectedAll:any;
  quesIdArr = [];
  userType: string;
  showAssign = false;
  // order: string = 'asc';
  classText = false;
  subText = false;
  lessonText = false;
  topicText = false;
  sortBy = '';
  sortDirection = '';

  searchFilter: any = {
    issue_id: 0,
    issueBy: '',
    fromDate: '',
    toDate: '',
    issue_status: '',
    class_id: [],
    subject_id: [],
    lesson_id: [],
    topic_id: [],
    limit: 10,
    offset: 0,
    sortBy:'',
    sortDirection:''
  };

  constructor(private questionService: QuestionService,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.user_id = this.currentUser.id;
    this.type_order = this.currentUser.user_Type.type_order;
    this.userType = this.currentUser.userType;
    
    
    this.customFilters = {
      user_id: this.user_id,
      type_order: this.type_order,
      offset: this.offset,
      limit: this.limit
    }
    
    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        if(this.customFilters.class_id != ''){
          this.changeClass(this.customFilters.class_id, 1);
          if(this.customFilters.subject_id != ''){
            this.changeSubject(this.customFilters.subject_id, 1);
            if(this.customFilters.lesson_id != ''){
              this.changeLesson(this.customFilters.lesson_id);
            }
          }
        }
        this.offset = this.paginator.pageIndex = (this.customFilters.offset/this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
      }
    })
    

    if(this.userType !== 'Teacher Jr.'){
      this.showAssign = true;
    }
    this.getQuestion();
    this.getClass();
    this.getIssueList();
    this.selectedAll = true;
  }

  getIssueList(){
    this.questionService.getUserIssueList(this.customFilters).subscribe((data: any) => {
      this.userList = data.data;
    });
  }

  getQuestion(){
    this.customFilters = {
      issue_id: this.customFilters.issue_id,
      issueBy: this.customFilters.issueBy,
      fromDate: this.customFilters.fromDate,
      toDate: this.customFilters.toDate,
      issue_status: this.customFilters.issue_status,
      class_id: this.customFilters.class_id,
      subject_id: this.customFilters.subject_id,
      lesson_id: this.customFilters.lesson_id,
      topic_id: this.customFilters.topic_id,
      user_id: this.user_id,
      type_order: this.type_order,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    }
    this.searchFilter = this.customFilters;
    this.questionData = [];
    this.questionService.getQuestionIssue(this.customFilters).subscribe((response: any) => {
      // console.log(response);
      response.data.forEach(sq => {
          sq.isSelected = true;
          this.questionData.push(sq);
      });
      this.totalIssue = response.totalIssue;
      this.freshDataList(this.questionData);
    });
  }

  freshDataList(question: any) {
    this.dataSource = new MatTableDataSource(question);
    this.dataSource.sort = this.sort;
    // this.dataSource.sortingDataAccessor = (question, property): string | number => {
    //   switch (property) {
    //     case 'created_on': return new Date(question.created_on);
    //     default: return question[property];
    //   }
    // };
  }

  searchQueIssue(filters: any) {
    this.resetPageIndex();
    if (filters) {
      filters.user_id = this.user_id;
      filters.type_order = this.type_order
      filters.limit = this.paginator.pageSize
      filters.offset = this.paginator.pageIndex * this.paginator.pageSize;
      this.questionData = [];
      this.customFilters = filters;
      this.getQuestion();
    }
  }

  resetSearchFilter(searchPanel: any) {
    this.resetPageIndex();
    searchPanel.toggle();
    this.questionData = [];
    this.searchFilter = {};
    this.customFilters = { 
      user_id: this.user_id, 
      type_order: this.type_order
    };
    this.getQuestion();
  }

  resetPage(){
    this.resetPageIndex();
    this.customFilters = { 
      user_id: this.user_id, 
      type_order: this.type_order,
      offset: this.offset,
      limit: this.limit
    };
    this.getQuestion();
  }

  resetPageIndex() {
    // reset the paginator
    this.paginator.pageIndex = 0;
  }

  editQue(queId) {
    this.router.navigate(['questionEdit/', `${queId}`], {
      queryParams: {
        ques_issue: 1
      }
    });
  }

  getClass() {
    const paramsVal = { board_id: 1 };
    this.questionService.getClasses(paramsVal).subscribe((result: any) => {
      this.classes = result.data;
    });
  }

  changeClass(strVal, defaultVal = 0) {
    if(strVal.length > 0){
      this.classText = true
    }else{ this.classText = false }
    const paramsVal = { class_id: [strVal] };
    if(defaultVal == 0) {
      this.subjects = [];
      this.lessons = [];
      this.topics = [];
      this.searchFilter.subject_id = [];
      this.searchFilter.lesson_id = [];
      this.searchFilter.topic_id = [];
    }
    
    this.questionService.getSubjects(paramsVal).subscribe((result: any) => {
      this.subjects = result.data;
    });
  }

  changeSubject(strVal, defaultVal = 0) {
    if(strVal.length > 0){
      this.subText = true
    }else{ this.subText = false }
    const paramsVal = { subject_id: [strVal] };
    if(defaultVal == 0) {
      this.lessons = [];
      this.topics = [];
      this.searchFilter.lesson_id = [];
      this.searchFilter.topic_id = [];
    }

    this.questionService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessons = result.data;

    });
  }

  changeLesson(strVal, defaultVal = 0) {
    if(strVal.length > 0){
      this.lessonText = true
    }else{ this.lessonText = false }
    const paramsVal = { lesson_id: [strVal] };
    if(defaultVal == 0) {
      this.topics = [];
      this.searchFilter.topic_id = [];
    }

    this.questionService.getTopics(paramsVal).subscribe((result: any) => {
      this.topics = result.data;
    });
  }

  changeTopic(strVal, defaultVal = 0) {
    if(strVal.length > 0){
      this.topicText = true
    }else{ this.topicText = false }
  }

  assignQues() {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.height = '800px';
    
    for (var i = 0; i < this.questionData.length; i++) {
      if(this.questionData[i].isSelected===true && this.questionData[i].issue_status == 'unresolved'){
          this.quesIdArr.push(this.questionData[i].question_id);
      }
    }
    if (this.quesIdArr.length < 1) {
      // console.log(this.quesIdArr.length);
      this.openSnackBar("Please select a question. ", "Close");
      return false;
    }else{
      this.quesIdArr = this.quesIdArr.filter((v, i, a) => a.indexOf(v) === i);}

    dialogConfig.data = {
      question_id: this.quesIdArr
    };
    const dialogRef = this.dialog.open(BothAssignComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        // console.log(data);
        //this.getTopicQuestions(this.topicId);
        this.quesIdArr = [];
        this.selectedAll = true;
        this.getQuestion();
        if(data || data == undefined){
          // this.openSnackBar("Questions assigned closed. ", "Close");
        }
        else{
          this.openSnackBar("Questions for QC have been assigned successfully. ", "Close");
        }
        // this.openSnackBar("Questions for QC have been assigned successfully. ", "Close");
      }
    );
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 1500,
    });
  }

  selectAll() {    
    for (var i = 0; i < this.questionData.length; i++) {
      this.questionData[i].isSelected = this.selectedAll;
    }
    // console.log(this.questionData);
  }

  checkIfAllSelected() {
      this.selectedAll = this.questionData.every(function(item:any) {
          return item.isSelected == true;
      })
  }

  previewQues(question_id){
    const dialogConfig = new MatDialogConfig();
    let questionIds = [question_id];
    dialogConfig.data = {
        question_id: questionIds
    };
    dialogConfig.autoFocus = true; 
    dialogConfig.height = '700px';
    const dialogRef = this.dialog.open(BothPreviewComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getTopicQuestions(this.topicId);
        // let paramsVal = this.quesSelection;
        this.selectedAll = '';
        this.getQuestion();
        // this.openSnackBar("Questions for QC have been assigned successfully. ", "Close");
      }
    );
  }

  addRemarks(question_id){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
        question_id: question_id
    };
    dialogConfig.autoFocus = true; 
    dialogConfig.height = '700px';
    const dialogRef = this.dialog.open(QueAddRemarksComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      data => {
        //this.getTopicQuestions(this.topicId);
        // let paramsVal = this.quesSelection;
        // this.selectedAll = '';
        this.getQuestion();
        // this.openSnackBar("Remarks have been added successfully. ", "Close");
      }
    );
  }

  deleteIssue(issue_id){
    var result = confirm("Are you sure, you want to delete the question issue?");
    if (result) {
      let obj = {issue_id: issue_id}
      this.questionService.deleteIssue(obj).subscribe((result: any) => {
        if (result.status) {
          this.getQuestion();
          this.openSnackBar('Question issue deleted successfully. ', 'Close');
        }
      });
    }
  }

  // onSortClick(){
  //   if(this.order == "asc"){
  //     this.order = "desc";
  //     this.getQuestion();
  //   }else{
  //     this.order = "asc";
  //     this.getQuestion();
  //   }
  // }


ngAfterViewInit() {

  this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

  merge(this.sort.sortChange, this.paginator.page)
  .pipe(
    tap((data: any) => {
      // console.log(data);
      this.sortBy = data.action;
      this.sortDirection = data.direction;
      this.getQuestion();
    })
  )
  .subscribe();
}
}