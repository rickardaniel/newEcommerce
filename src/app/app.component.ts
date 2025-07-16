import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { UtilsService } from './services/utils.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'newEcommerce';

  constructor
    (
      private util: UtilsService,
    ) {
  }

  ngOnInitI() {

    
    initFlowbite();


  }
  // open(name:string){
  //   let modal = this.util.createModal(name);
  //   modal.show();
  //   }
  // closeModal(flag: boolean, name: string) {
  //   let modal = this.createModal(name);
  //   if (flag) {
  //   } else {
  //     modal.hide();
  //   }
  // }
  // closeModal(flag: boolean, name: string) {

  //   let modal = this.util.createModal(name);
  //   if (flag) {
  //     modal.hide();

  //   } else {
  //     modal.hide();
  //   }
  // }
}
