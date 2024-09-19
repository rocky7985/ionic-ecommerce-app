import { Component, ElementRef, ViewChild } from '@angular/core';
import { UtilService } from '../util.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.page.html',
  styleUrls: ['./update-profile.page.scss'],
})

export class UpdateProfilePage {

  @ViewChild('profileFormElement', { static: true }) profileFormElement: ElementRef;

  updateForm: FormGroup;
  loginUser: any = [];
  updatedData: any = [];
  public loadProfileData = true;

  constructor(private util: UtilService,
    private router: Router // Inject Router

  ) {

    this.updateForm = new FormGroup({
      name: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
    });
  }

  ionViewWillEnter() {
    this.getLoginUser();
    this.getProfileData();
    this.profileFormElement.nativeElement.addEventListener('touchstart', this.handleTouchStart, { passive: true });

  }

  // ngOnInit() {
  //   this.profileFormElement.nativeElement.addEventListener('touchstart', this.handleTouchStart, { passive: true });

  // }

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
          const profile = p.data;
          this.updateForm.patchValue({
            name: profile.name,
            phone: profile.phone,
            address: profile.address,
          });
          console.log('Profile Data:', profile);
        }
        this.loadProfileData = false;

      }, error: () => {
        console.log('Error loading profile');
        this.loadProfileData = false;

      }
    });
  }

  getUpdatedData() {

    if (this.updateForm.valid) {

      this.loadProfileData = true; // Start spinner

      const updatedData = this.updateForm.value;
      const login = JSON.parse(localStorage.getItem('login'));
      const logindata = login.token;
      this.util.sendData('updateUserInfo', updatedData, logindata).subscribe({
        next: (p: any) => {
          if (p.status == 'success') {
            this.updatedData = p.data;
            console.log('Profile Updated Data:', p.data);
            this.util.presentToast('Profile Updated');
            this.router.navigate(['/profile']);
          }
          this.loadProfileData = false;

        }, error: () => {
          this.loadProfileData = false;

        }
      });
    }
    else {
      console.log('Error:', this.updateForm.invalid);

    }
  }

  // Your touchstart event handler
  handleTouchStart(event: Event) {
    console.log('Touch start event:', event);
  }
}