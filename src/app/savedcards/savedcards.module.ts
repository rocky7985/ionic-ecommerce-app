import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SavedcardsPageRoutingModule } from './savedcards-routing.module';

import { SavedcardsPage } from './savedcards.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SavedcardsPageRoutingModule
  ],
  declarations: [SavedcardsPage]
})
export class SavedcardsPageModule {}
