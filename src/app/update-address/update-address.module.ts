import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { UpdateAddressPageRoutingModule } from './update-address-routing.module';

import { UpdateAddressPage } from './update-address.page';

const routes: Routes=[
  {
    path: '',
    component:UpdateAddressPage


  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    UpdateAddressPageRoutingModule
  ],
  declarations: [UpdateAddressPage]
})
export class UpdateAddressPageModule {}
