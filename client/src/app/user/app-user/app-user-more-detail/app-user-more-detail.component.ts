import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-app-user-more-detail',
  templateUrl: './app-user-more-detail.component.html',
  styleUrls: ['./app-user-more-detail.component.css']
})
export class AppUserMoreDetailComponent implements OnInit {

  id: number;
  userData: any;
  quiz_user_details = [];
  noData = false;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });

    this.userService.appUserDetail({user_id: this.id}).subscribe((userData: any) => {
      console.log(userData);
      this.userData = userData.data;
      this.quiz_user_details = this.userData.quiz_user_details;
      if(this.quiz_user_details.length==0){
        this.noData = true;
      }
    })
  }

}
