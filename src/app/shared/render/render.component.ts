import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardGeneralComponent } from '../card-general/card-general.component';
import { environment } from '../../environments/environment';
import { UtilsService } from '../../services/utils.service';
import { CommonModule } from '@angular/common';
import { DetailProductComponent } from '../detail-product/detail-product.component';

@Component({
  selector: 'app-render',
  standalone: true,
  imports: [CardGeneralComponent, CommonModule, DetailProductComponent],
  templateUrl: './render.component.html',
  styleUrl: './render.component.scss'
})
export class RenderComponent {
  @Input('products') products:any;
  @Input('logo') logo:any;
  @Input('title') title:any;
  @Input('color') color:any;
  @Input('configuration') configuration:any;
  @Input('productSelectSend') productSelectSend:any;
  @Input('flagRender') flagRender:any;
  urlFB = environment.firebaseUrl;
  @Output() viewModalR = new EventEmitter<any>();
  @Output() return = new EventEmitter<any>();

  productSelect:any=[];
  modal:any;

  constructor
  (
    private util: UtilsService
  )
  {
  }


  clampText(text){
    return this.util.truncateString2(text,42);
  }

  calculateDescount(cantR, cantD){
    let percent = (parseFloat(cantD)*100)/parseFloat(cantR);
    let desc =  100 - percent;
    desc = Number(desc.toFixed(1))
    return desc
   }

   seeDetail(product){
    console.log("Doy click hijo, AR",product);
    this.productSelect= product;
    this.productSelect.product = product;
    console.log('this.productSelectSend', this.productSelectSend);
    
    this.viewModalR.emit(product);
    // this.openModal('#modalProduct2');

  }

    // METODOS MODALES
    openModal(name){
      this.modal = this.util.createModal2(name);
      this.modal.show();
    }

  closeModal(){
    this.modal.hide();
  }

    returnHome(flag) {
    this.flagRender = flag;
    this.return.emit(this.flagRender);
  }

  
}
