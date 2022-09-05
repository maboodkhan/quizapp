import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatOption, PageEvent, MatSnackBar, MatDialog, MatTableDataSource, MatDialogConfig } from '@angular/material';
import { QuestionService } from '../question.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BothAssignComponent } from '../both-assign/both-assign.component';
import { BothPreviewComponent } from '../both-preview/both-preview.component';
import { QueAddRemarksComponent } from '../que-add-remarks/que-add-remarks.component';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css']
})

export class ViewIssueComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;  
  @ViewChild('allSelectedLessons') private allSelectedLessons: MatOption;
  pageEvent: PageEvent;

  pageTitle = 'Question Issues';
  displayedColumns: string[] = ['S_No', 'question', 'issueBy' , 'issueStatus', 'created', 'assignedTo', 'edit_id', 'editQuestion', 'id'];
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
  question_id: any;
  backTo: any;

  // searchFilter: any = {
  //   issueBy: '',
  //   fromDate: '',
  //   toDate: '',
  //   issue_status: '',
  //   class_id: [],
  //   subject_id: [],
  //   lesson_id: [],
  //   topic_id: [],
  //   limit: 0,
  //   offset: 0
  // };

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
      question_id: this.question_id,
      offset: this.offset,
      limit: this.limit
    }
    
    this.route.params.subscribe(params => {
      this.question_id = +params['question_id'];
    });

    this.route.queryParams.subscribe((params: any) => {
      if (params.customFilters) {
        this.customFilters = JSON.parse(params.customFilters);
        this.offset = this.paginator.pageIndex = (this.customFilters.offset/this.customFilters.limit);
        this.limit = this.paginator.pageSize = this.customFilters.limit;
      }
      this.backTo = params.backTo;
    })

    if(this.userType !== 'Teacher Jr.'){
      this.showAssign = true;
    }
    this.getQuestion();
    // this.getIssueList();
    this.selectedAll = true;
  }

  // getIssueList(){
  //   this.questionService.getUserIssueList(this.customFilters).subscribe((data: any) => {
  //     // console.log(data);
  //     this.userList = data.data;
  //   });
  // }

  getQuestion(){
    // console.log(this.customFilters);
    this.customFilters = {
      question_id: this.question_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    // this.searchFilter = this.customFilters;
    this.questionData = [];
    this.questionService.viewIssueList(this.customFilters).subscribe((response: any) => {
      response.data.forEach(sq => {
          sq.isSelected = true;
          this.questionData.push(sq);
      });
      this.totalIssue = response.totalIssue;
      this.freshDataList(this.questionData);
    })
  } 

  freshDataList(question: any) {
    this.dataSource = new MatTableDataSource(question);
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }


  resetPage(){
    this.resetPageIndex();
    this.customFilters = { 
      question_id: this.question_id,
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
    this.router.navigate(['questionEdit/', `${queId}`], {queryParamsHandling: 'preserve'});
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
        //this.getTopicQuestions(this.topicId);
        this.quesIdArr = [];
        this.selectedAll = true;
        this.getQuestion();
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

  backButton(){
    // [routerLink]="['/question']" queryParamsHandling="preserve"
    if(this.backTo == 0){
      this.router.navigate(['/question'], {queryParamsHandling: 'preserve'})
    }
    if(this.backTo == 1){
      this.router.navigate(['/questionAssign'], {queryParamsHandling: 'preserve'})
    }
  }

  // IssueDetail(){
  //   this.router.navigate(['/quesIssuesEdit/',this.question_id], {
  //     queryParamsHandling: 'preserve',
  //     queryParams: {
  //       customFilters:this.customFilters,
  //       viewBack: 0
  //     }
  //   })
  // }

  deleteIssue(issue_id){

    var result = confirm("Are you sure, you want to delete the Question issue?");
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


ngAfterViewInit() {

  this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

  merge(this.sort.sortChange, this.paginator.page)
  .pipe(
  tap(() => {
      this.getQuestion();
      })
  )
  .subscribe();
}
}
