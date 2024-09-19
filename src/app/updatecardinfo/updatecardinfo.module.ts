import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { UpdatecardinfoPageRoutingModule } from './updatecardinfo-routing.module';

import { UpdatecardinfoPage } from './updatecardinfo.page';

const routes: Routes = [
  {
    path: '',
    component: UpdatecardinfoPage


  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    UpdatecardinfoPageRoutingModule
  ],
  declarations: [UpdatecardinfoPage]
})
export class UpdatecardinfoPageModule { }
