import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage {
  newsForm: FormGroup;
  loginUser: any = [];
  // newsData: any = [];
  public loadData = false;

  constructor(
    private util: UtilService,
    private router: Router
  ) {
    this.newsForm = new FormGroup({
      title: new FormControl('', Validators.required),
      content: new FormControl('', Validators.required),
    });
  }

  ionViewWillEnter() {
    this.getLoginUser();
  }

  getLoginUser() {
    const user = JSON.parse(localStorage.getItem('login'));
    if (user !== null) {
      this.loginUser = user;
    }
  }

  addnews() {
    if (this.newsForm.valid) {
      this.loadData = true;
      const data = {
        post_title: this.newsForm.value.title,
        post_content: this.newsForm.value.content
      };
      const token = this.loginUser.token;
      this.util.sendData('newsfeed', data, token).subscribe({
        next: (p: any) => {
          if (p.status == 'success') {
            this.loadData = false;
            this.util.presentToast('News post added successfully');
            this.newsForm.reset();
          }
          else {
            this.loadData = false;
            console.log('Failed to add news post');
          }
        },
        error: () => {
          this.loadData = false;
          console.log('An error occurred while adding news post');
        }
      });
    } else {
      console.log('Please fill in all required fields');
    }
  }

}
