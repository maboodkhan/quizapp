import { Component, OnInit, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import { OnlineScheduleService } from '../online-schedule.service';
import { FormBuilder, Validators, FormGroup, FormControlName } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { GenericValidator } from 'src/app/shared';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/user/user.service';

@Component({
  selector: 'app-add-edit-schedule',
  templateUrl: './add-edit-schedule.component.html',
  styleUrls: ['./add-edit-schedule.component.css']
})
export class AddEditScheduleComponent implements OnInit {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements: ElementRef[];
  @ViewChild('countryVal') countryVal;

  pageTitle = 'Add Schedule';
  errorMessage: any;
  scheduleForm: FormGroup;
  currentUser: any;
  displayMessage: { [key: string]: string } = {};
  classLevelList = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
  classTypeList = ['Teach', 'Doubt Clearing Class', 'Revision Class', 'Prepare Test', 'Test', 'Final Test'];
  classList: any;
  schoolList: any;
  sectionIdArr = [];
  sectionList: any;
  subjectList: any;
  lessonList: any;
  schedule_id: number;
  scheduleData: any;
  user_id: number;
  type_order: any;
  classArr = [];
  sectionArr = [];
  userList: any;
  countryList = [];
  showCountryLesson = false;
  countryName: string;
  countryLessonList: any;
  lessonType: string;
  mapLessonList: any;
  lessonArr = [];
  autoFill_id: any;
  startMin = new Date();
  endMin: Date;
  endMax: Date;
  endDateDisable: boolean = true;

  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private onlineScheduleService: OnlineScheduleService,
    private userService: UserService) {
    this.validationMessages = {
      country_id: {
        required: 'Country is required.'
      },
      school_id: {
        required: 'school is required.'
      },
      class_id: {
        required: 'class is required.'
      },
      section_id: {
        required: 'section is required.'
      },
      // user_id: {
      //   required: 'Teacher is required.'
      // },
      subject_id: {
        required: 'subject is required.'
      },
      lesson_id: {
        required: 'lesson is required.'
      },
      class_level: {
        required: 'Class level is required.'
      },
      class_type: {
        required: 'Class Type is required.'
      },
      start_date: {
        required: 'Start Date is required.'
      },
      end_date: {
        required: 'End Date is required.'
      },
      status: {
        required: 'Status is required.'
      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnInit() {
    this.showCountryLesson = false;
    this.lessonType = "Lesson";
    this.autoFill_id = history.state.autoFill_id;
    console.log(this.autoFill_id);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // this.user_id = this.currentUser.id;
    if (this.currentUser) {
      this.user_id = this.currentUser.id;
      this.type_order = this.currentUser.user_Type.type_order;
      this.countryList = this.currentUser.user_countries;
    }

    this.scheduleForm = this.fb.group({
      country_id: ['', [Validators.required]],
      school_id: ['', [Validators.required]],
      class_id: ['', [Validators.required]],
      section_id: ['', [Validators.required]],
      user_id: ['', ""],
      subject_id: ['', [Validators.required]],
      country_lesson_id: ['', ''],
      lesson_id: ['', [Validators.required]],
      class_level: ['', [Validators.required]],
      class_type: ['', [Validators.required]],
      start_date: ['', ""],
      end_date: ['', ""],
      status: ['', [Validators.required]]
    });

    if (this.type_order == 1 || this.type_order == 2) {
      this.userService.getActiveSchools(this.user_id).subscribe((data: any) => {
        this.schoolList = data.data;
        // this.schoolList.forEach(element => { this.schoolArr.push(element.id) });
      });
    } else {
      let obj = { user_id: this.user_id }
      this.userService.userSchools(obj).subscribe((data: any) => {
        this.schoolList = data.data;
        if (this.schoolList.length == 1) {
          this.scheduleForm.patchValue({
            school_id: [this.schoolList[0].id]
          });
        }
        this.classArr = data.userClass;
        this.sectionArr = data.userSection;
        let classObj = {
          board_id: 1,
          class_id: this.classArr
        }
        this.userService.getClasses(classObj).subscribe((data: any) => {
          this.classList = data.data;
        });
      });
    }

    let classObj = {
      board_id: 1
    }
    this.userService.getClasses(classObj).subscribe((data: any) => {
      this.classList = data.data;
    });
    // this.userService.getCountries().subscribe((data: any) => {
    //   this.countryList = data.data;
    // })

    this.route.params.subscribe(params => {
      this.schedule_id = params['schedule_id'];
      if (this.schedule_id) {
        this.getSchedule(this.schedule_id);
        this.pageTitle = `Update Schedule`;
      } else {
        this.pageTitle = 'Add Schedule';
        let selCountryId = this.countryList.length == 1 ? this.countryList[0] : '';

        if (selCountryId) {
          this.scheduleForm.patchValue({
            country_id: selCountryId.countries.id
          });
          this.changeCountry(selCountryId.countries.countryName);
        }
        if (this.autoFill_id) {
          this.getSchedule(this.autoFill_id);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Watch for the blur event from any input element on the form.
    const controlBlurs: Observable<any>[] = this.formInputElements
      .map((formControl: ElementRef) => Observable.fromEvent(formControl.nativeElement, 'blur'));

    // Merge the blur event observable with the valueChanges observable
    Observable.merge(this.scheduleForm.valueChanges, ...controlBlurs).debounceTime(800).subscribe(value => {
      this.displayMessage = this.genericValidator.processMessages(this.scheduleForm);
    });
  }

  changeSchool(school_id) {
    this.getTeacher();
  }

  changeClass(class_id) {
    this.sectionIdArr = [class_id];
    this.lessonList = null;
    let classObj = { class_id: this.sectionIdArr, section_id: this.sectionArr }
    this.userService.getClassSections(classObj).subscribe((result: any) => {
      this.sectionList = result.data;
    })
    this.userService.getSubjects(classObj).subscribe((result: any) => {
      this.subjectList = result.data;
    });
  }

  changeSection() {
    this.getTeacher();
  }

  getTeacher() {
    let Obj = {
      school_id: [this.scheduleForm.value.school_id],
      class_id: [this.scheduleForm.value.class_id],
      section_id: [this.scheduleForm.value.section_id]
    }
    this.onlineScheduleService.getScheduleTeacher(Obj).subscribe((result: any) => {
      this.userList = result.data;
    });
  }

  changeSubject(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    if (this.showCountryLesson) {
      this.getCountryLessons(strVal);
    } else {
      this.getLessons(strVal);
    }
  }

  getCountryLessons(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    this.onlineScheduleService.getCountryLessons(paramsVal).subscribe((result: any) => {
      this.countryLessonList = result.data;
    });
  }

  getLessons(strVal, defaultVal = 0) {
    const paramsVal = { subject_id: [strVal] };
    this.onlineScheduleService.getLessons(paramsVal).subscribe((result: any) => {
      this.lessonList = result.data;
    });
  }

  getCountryMapLessons(strVal, defaultVal = 0) {
    const paramsVal = { country_lesson_id: [strVal] };
    this.onlineScheduleService.getCountryMapLessons(paramsVal).subscribe((result: any) => {
      this.mapLessonList = result.data;
    });
  }

  saveschedule() {
    if (!this.showCountryLesson) {
      this.scheduleForm.controls.country_lesson_id.setValue("0");
    }
    if (this.schedule_id) {
      let scheduleObj = Object.assign({}, {
        schedule_id: this.schedule_id,
        modified_on: new Date(),
        modified_by: this.user_id
      }, this.scheduleForm.value);
      // console.log(scheduleObj);
      this.onlineScheduleService.editSchedule(scheduleObj).subscribe((data: any) => {
        if (data.status) {
          this.router.navigate(['/onlineSchedule'], { queryParamsHandling: 'preserve' });
        } else {
          this.errorMessage = data;
        }
      });
    } else {
      let scheduleObj = Object.assign({}, {
        created_on: new Date(),
        created_by: this.user_id,
        modified_by: this.user_id
      }, this.scheduleForm.value);
      // console.log(scheduleObj);
      this.onlineScheduleService.addSchedule(scheduleObj).subscribe((data: any) => {
        if (data.status) {
          this.router.navigate(['/onlineSchedule']);
        } else {
          this.errorMessage = data;
        }
      });
    }
  }

  getSchedule(schedule_id) {
    let scheduleObj = { schedule_id: schedule_id }
    this.onlineScheduleService.getScheduleById(scheduleObj).subscribe((schedleData: any) => {

      this.scheduleData = schedleData.data;
      console.log(this.scheduleData);
      this.changeClass(this.scheduleData.class_id);
      this.changeSubject(this.scheduleData.subject_id);
      if (this.scheduleData.scheduleDetail.length > 0) {
        this.scheduleData.scheduleDetail.forEach(lessonId => {
          this.lessonArr.push(lessonId.lesson_id);
        });
      } else {
        this.lessonArr = [this.scheduleData.lesson_id];
      }
      this.scheduleForm.patchValue({
        country_id: this.scheduleData.country_id,
        school_id: this.scheduleData.school_id,
        class_id: this.scheduleData.class_id,
        section_id: this.scheduleData.section_id,
        user_id: this.scheduleData.user_id,
        subject_id: this.scheduleData.subject_id,
        country_lesson_id: this.scheduleData.country_lesson_id,
        lesson_id: this.lessonArr,
        class_level: this.scheduleData.class_level,
        class_type: this.scheduleData.class_type,
        start_date: this.scheduleData.start_date,
        end_date: this.scheduleData.end_date,
        status: this.scheduleData.status
      });
      this.getTeacher();
      this.changeCountry(this.countryVal.triggerValue, 1);
      if (this.showCountryLesson) {
        this.getCountryMapLessons(this.scheduleData.country_lesson_id);
      }
    })
  }

  changeCountry(countryVal, defaultVal = 0) {
    this.countryName = countryVal;
    if (defaultVal == 0) {
      this.scheduleForm.patchValue({
        country_lesson_id: 0,
        lesson_id: 0
      });
    }

    if (this.countryName == 'Indonesia') {
      this.showCountryLesson = true;
      this.lessonType = "Sub Lesson";
    } else {
      this.lessonType = "Lesson";
      this.showCountryLesson = false;
    }

    if (this.scheduleForm.value.subject_id) {
      this.changeSubject(this.scheduleForm.value.subject_id);
    }
  }

  changeStartDate(date) {
    this.endDateDisable = false;
    this.endMin = date;
    // console.log(date);
    
    var nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate()+1);
    nextDate.setHours(0,0,0,0);

    this.endMax = nextDate;
  }

}
