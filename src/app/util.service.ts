import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private isMenuEnabled = new Subject<boolean>();
  baseUrl = 'http://localhost/wordpressdoc/wordpress/'; // Update this with your actual WordPress site URL
  url = '  http://localhost/wordpressdoc/wordpress/wp-json/addapi/v1/';
  private loader: HTMLIonLoadingElement;


  constructor(
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private toastController: ToastController,
    private router: Router,
    private alertController: AlertController
  ) { }
  // Creating method to handle Side Menu State (Enabled or Disabeld)
  setMenuState(enabled: boolean): void {
    this.isMenuEnabled.next(enabled);
  }

  // Method for get the Menu State
  getMenuState(): Subject<boolean> {
    return this.isMenuEnabled;
  }

  loginUrl(data: any) {
    return this.http.post(this.baseUrl + 'wp-json/jwt-auth/v1/token', data);
  }

  post(endpoint: any, data: any) {
    return this.http.post(this.url + endpoint, data);
  }

  sendData(endPoint: any, data: any, token?: any) {
    let headers = {};
    if (token) {
      headers = {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      };
    }
    return this.http.post(this.url + endPoint, data, {headers}).pipe(map((result) => result));
  }

  checkUser(): boolean {

    const userData = localStorage.getItem('login');

    if (userData) {
      return true; // Data is available, allow navigation
    } else {
      this.router.navigate(['/login']); // Redirect to login page
      this.presentToast('Not Authenticated');
      return false; // Prevent navigation
    }
  }



  async showLoading() {
    this.loader = await this.loadingCtrl.create({
      message: 'Loading...',
      duration: 0,
      spinner: 'circles',
    });

    await this.loader.present();
  }

  async hideLoader() {
    if (this.loader) {
      await this.loader.dismiss();
    }
  }

  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }

  canActivate(route: any, state: any): boolean {
    return this.checkUser();
  }

  async presentAlert(header: string, message: string, buttons: any[] = ['OK']) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons
    });
    await alert.present();
  }

}
