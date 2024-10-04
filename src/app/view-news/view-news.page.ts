import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-news',
  templateUrl: './view-news.page.html',
  styleUrls: ['./view-news.page.scss'],
})
export class ViewNewsPage {
  loginUser: any = [];
  loadData: boolean = false;
  newsData: any = [];
  page: number = 1;
  hasMoreData: boolean = true;

  constructor(
    private util: UtilService,
    private router: Router
  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.getNewsData();
  }

  getLoginUser() {
    const user = JSON.parse(localStorage.getItem('login'));
    if (user !== null) {
      this.loginUser = user;
    }
  }

  getNewsData(event?: any) {
    if (this.loginUser && this.loginUser.token) {
      this.loadData=true;
      const token = this.loginUser.token;
      const paged = { paged: this.page };
      this.util.sendData('getNewsFeed', paged, token).subscribe({
        next: (p: any) => {
          if (p.status == 'success') {
            const newNews = p.data;
            this.newsData = [...this.newsData, ...newNews];
            this.loadData=false;

            // Check if more data is available
            if (newNews.length < 6) {
              this.hasMoreData = false;
            }
          } else {
            console.error('Failed to fetch newsfeed data');
            this.loadData=false;
          }
        },
        error: (err: any) => {
          console.error('Error fetching newsfeed data:', err);
        },
        complete: () => {
          if (event) {
            event.target.complete(); // Complete infinite scroll event
          }
        },
      });
    } else {
      console.error('User token not available');
    }
  }

  loadMoreNews(event: any) {
    if (this.hasMoreData) {
      this.page++;
      this.getNewsData(event); // Fetch next set of data
    } else {
      event.target.disabled = true; 
    }
  }

}
