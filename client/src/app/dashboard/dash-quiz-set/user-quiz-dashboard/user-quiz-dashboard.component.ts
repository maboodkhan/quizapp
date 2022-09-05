import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardService } from '../../dashboard.service';

@Component({
  selector: 'app-user-quiz-dashboard',
  templateUrl: './user-quiz-dashboard.component.html',
  styleUrls: ['./user-quiz-dashboard.component.css']
})
export class UserQuizDashboardComponent implements OnInit {

  school_id: number;
  class_id: number;
  section_id: number;
  school_name: string;
  class_name: string;
  section_name: string;
  listOpen: boolean;
  tempObj = {};
  defaultTab = 0;
  constructor(private dashboardService: DashboardService,
    private route: ActivatedRoute) { }

  ngOnInit() {

    this.route.params.subscribe(
      params => {
        this.school_id = +params['school_id'];
        this.class_id = +params['class_id'];
        this.section_id = +params['section_id'];
      }
    );

    this.route.queryParams.subscribe((paramsData: any) => {
      if(paramsData.tabType == '1'){
        this.defaultTab = 1;
      }
      // if(paramsData.type == 'list'){
      //   this.listOpen = paramsData.type;
      // }
    })

    this.breadcrumbs();
  }
  
  breadcrumbs(){
    this.tempObj = {
      school_id: this.school_id,
      class_id: this.class_id,
      section_id: this.section_id
    }

    // get School Name
    this.dashboardService.getSchoolById(this.tempObj).subscribe((schoolData: any) => {
      // console.log(schoolData);
      this.school_name = schoolData.data.school_name;
    })

    // get Class Name
    this.dashboardService.getClass(this.class_id).subscribe((classData: any) => {
      // console.log(classData);
      this.class_name = classData.data.class_name;
    })

      // get Section Name
    this.dashboardService.getSection(this.tempObj).subscribe((sectionData: any) => {
      // console.log(sectionData);
      this.section_name = sectionData.data.class_section.section_name;
    })

  }

  changeView(){
    this.listOpen =!this.listOpen;
  }

}
