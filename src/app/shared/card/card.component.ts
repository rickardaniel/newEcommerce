import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import Glide from '@glidejs/glide';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent implements AfterViewInit {
  @Input('data')data:any;
  @Input('color')color:any;
  @Output() viewModal = new EventEmitter<any>();

  urlFB= environment.firebaseUrl;

  ngOnInit(){
    console.log('data PRODUCTO SOLD ',this.data);
    document.documentElement.style.setProperty('--dynamic-color', this.color);
    
  }

  ngAfterViewInit() {
    new Glide('#glide', {
      type: 'carousel',
      perView: 1,
      autoplay:5000,
      focusAt: 'center',
      gap: 10
    }).mount();
  }

  seeDetail(product){
    console.log("Doy click hijo");
    
    this.viewModal.emit(product);
  }
}
