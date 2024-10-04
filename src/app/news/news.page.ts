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
  public loadData = false;
  selectedImage: string | ArrayBuffer | null = null;
  // base64textString: string | null = null;

  constructor(
    private util: UtilService,
    private router: Router
  ) {
    this.newsForm = new FormGroup({
      title: new FormControl('', Validators.required),
      content: new FormControl('', Validators.required),
      featured_image: new FormControl(null),
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

  handleFileSelect(evt: Event) {
    const files = (evt.target as HTMLInputElement).files;
    if (files && files[0]) {
      const file = files[0];
      var reader = new FileReader();

      reader.onload = this._handleReaderLoaded.bind(this);

      // reader.readAsBinaryString(file);
      reader.readAsDataURL(file);

    }
  }

  _handleReaderLoaded(event: ProgressEvent<FileReader>) {
    this.selectedImage = event.target?.result;
  }

  addnews() {
    if (this.newsForm.valid) {
      this.loadData = true;
      const data = {
        post_title: this.newsForm.value.title,
        post_content: this.newsForm.value.content,
        featured_image: this.selectedImage
      };
      const token = this.loginUser.token;
      this.util.sendData('newsfeed', data, token).subscribe({
        next: (p: any) => {
          if (p.status == 'success') {
            this.loadData = false;
            this.util.presentToast('News post added successfully');
            this.newsForm.reset();
            this.selectedImage = null;
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

  navToAllnews(){
    this.router.navigate(['/view-news']);
  }

}
