import { Component } from '@angular/core';
import { UtilService } from '../util.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  profileData: any={};
  loginUser: any = [];
  public loadProfileData = true;

  constructor(private util: UtilService,

  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.getProfileData();
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  getProfileData() {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getUserInfo', [], logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.profileData = p.data;
          console.log('Profile Data:', this.profileData);

        }
        this.loadProfileData = false;

      }, error:() =>{
        this.loadProfileData = false;

      }
    });
  }
}
