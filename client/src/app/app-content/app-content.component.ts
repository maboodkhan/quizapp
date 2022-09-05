import { Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup, Validators } from '@angular/forms';
import { MatOption, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { isArray } from 'lodash';
import { merge, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { GenericValidator } from '../shared';
import { AppContentService } from './app-content.service';

@Component({
  selector: 'app-app-content',
  templateUrl: './app-content.component.html',
  styleUrls: ['./app-content.component.css']
})

export class AppContentComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('allSelectedLessons') private allSelectedLessons: MatOption;

  pageTitle = 'Marksharks Content';
  appContentUrl = environment.appContentUrl;
  
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  displayMessage: { [key: string]: string } = {};
  displayedColumns: string[] = ['Sno', 'board', 'class', 'subject', 'lesson', 'version', 'modified_by', 'modified_on', 'preview', 'id'];
  currentUser: any;
  dataSource: any;
  customFilters: any = {};
  limit = 10;
  offset = 0;
  totalContent: number;
  contentForm: FormGroup;
  boards: any;
  classes: any;
  subjects: any;
  lessons: any;
  board_id: number;
  class_id: number;
  subject_id: number;
  lesson_id: number;

  constructor(
    private contentService: AppContentService,
    private route: Router,
    private router: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.validationMessages = {
      board_id: {
        required: 'Board is required.'
      },
      class_id: {
        required: 'Class is required.'
      },
      section_id: {
        required: 'Section is required.'
      },
      subject_id: {
        required: 'Subject is required.'
      },
      lesson_id: {
        required: 'Lesson is required.'
      },
      topic_id: {
        required: 'Topic is required.'
      },
      question_id: {
        required: 'Question is required.'
      },
      QC_Done: {
        require: 'QC Done is required'

      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));

    this.contentForm = this.fb.group({
      board_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      subject_id: ['', [Validators.required]],
      lesson_id: ['', [Validators.required]]
    });

    this.router.queryParams.subscribe((paramsData: any) => {

      if (Object.keys(paramsData).length != 0) {

        if (isArray(paramsData.board_id)) {
          this.board_id = paramsData.board_id.map(Number);
        } else {
          this.board_id = parseInt(paramsData.board_id);
        }

        if (isArray(paramsData.class_id)) {
          this.class_id = paramsData.class_id.map(Number);
        } else {
          this.class_id[0] = parseInt(paramsData.class_id);
        }

        if (isArray(paramsData.subject_id)) {
          this.subject_id = paramsData.subject_id.map(Number);
        } else {
          this.subject_id[0] = parseInt(paramsData.subject_id);
        }

        if (isArray(paramsData.lesson_id)) {
          this.lesson_id = paramsData.lesson_id.map(Number);
        } else {
          this.lesson_id[0] = parseInt(paramsData.lesson_id);
        }
        // console.log(this.selectData);

        this.changeBoard(this.board_id);
        this.changeClass(this.class_id);
        this.changeSubject(this.subject_id);
        this.changeLesson(this.lesson_id);

        this.contentForm.patchValue({
          board_id: this.board_id,
          class_id: this.class_id,
          subject_id: this.subject_id,
          lesson_id: this.lesson_id
        });
      }

    })

    this.getBoards();
    this.getContent();
  }


  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap((data: any) => {
          // this.sortBy = data.action;
          // this.sortDirection = data.direction;
          this.getContent();
        })
      ).subscribe();

    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.contentForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.contentForm);
    });

  }

  getBoards(nonAcademicVal = 0) {
    const paramsVal = { non_academic: nonAcademicVal };
    this.contentService.getBoards(paramsVal).subscribe((result: any) => {
      this.boards = result.data;
    });
  }

  changeBoard(strVal, defaultVal = 0) {
    const paramsVal = { board_id: strVal };

    this.contentService.getClasses(paramsVal).subscribe((result: any) => {
      this.classes = result.data;
    });
  }

  changeClass(strVal, defaultVal = 0) {
    const paramsVal = { class_id: [strVal] };

    this.contentService.getSubjects(paramsVal).subscribe((result: any) => {
      this.subjects = result.data;
    });
  }

  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };

    this.contentService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessons = result.data;
    });
  }

  changeLesson(strVal, defaultVal = 0) {
    this.customFilters = {
      lesson_id: strVal,
    };
    this.getContent();
  }

  tosslePerLesson() {
    if (this.allSelectedLessons.selected) {
      this.allSelectedLessons.deselect();
      return false;
    }
    if (this.contentForm.controls.lesson_id.value.length === this.lessons.length) {
      this.allSelectedLessons.select();
    }
  }

  selectAllLessons() {
    let lessonVal = [0];
    if (this.allSelectedLessons.selected) {
      this.contentForm.controls.lesson_id
        .patchValue([...this.lessons.map(item => item.id), 0]);
      lessonVal = this.contentForm.controls.lesson_id.value;
    } else {
      this.contentForm.controls.lesson_id.patchValue([]);
    }
    // console.log(this.contentForm.value.lesson_id);
    this.changeLesson(lessonVal);
  }

  getContent() {
    this.customFilters = {
      lesson_id: this.customFilters.lesson_id,
      offset: this.paginator.pageIndex * this.paginator.pageSize,
      limit: this.paginator.pageSize
    }
    // console.log(this.customFilters);
    this.contentService.getContent(this.customFilters).subscribe((data: any) => {
      console.log(data);
      this.totalContent = data.totalContent;
      this.dataSource = new MatTableDataSource(data.data);
      // this.dataSource.paginator = this.paginator;
      // console.log(this.totalContent);
    })
  }

  reset() {
    this.getContent();
  }

  previewContent(content) {
  }

  editContent(content_id) {
    this.route.navigate(['/appeditcontent', `${content_id}`], {
      queryParams: {
        board_id: this.contentForm.value.board_id,
        class_id: this.contentForm.value.class_id,
        subject_id: this.contentForm.value.subject_id,
        lesson_id: this.contentForm.value.lesson_id
      }
    })
  }

  
  addContent(){
    this.route.navigate(['/appaddcontent'], {
      queryParams: {
        board_id: this.contentForm.value.board_id,
        class_id: this.contentForm.value.class_id,
        subject_id: this.contentForm.value.subject_id,
        lesson_id: this.contentForm.value.lesson_id
      }
    })
  }


}
