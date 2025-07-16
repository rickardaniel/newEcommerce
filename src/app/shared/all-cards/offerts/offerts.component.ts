import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import Glide from '@glidejs/glide';
import { environment } from '../../../environments/environment';
import { FlowbiteService } from '../../../services/flowbite.service';

@Component({
  selector: 'app-offerts',
  standalone: true,
  imports: [],
  templateUrl: './offerts.component.html',
  styleUrl: './offerts.component.scss'
})
export class OffertsComponent {
  @Input('offerts')offerts:any;
    urlFB= environment.firebaseUrl;
    // ===== NUEVOS INPUTS PARA LAZY LOADING =====
    @Input() isMobile: boolean = false;
    @Input() isLazyLoaded: boolean = true;
    @Output() imageLoaded = new EventEmitter<boolean>();
    // ===== NUEVAS PROPIEDADES PARA OPTIMIZACIÓN =====
    public imageLoadedState: boolean = false;
    public imageErrorState: boolean = false;
    productImage: any


    constructor(
      private flowbiteService: FlowbiteService,
          private cdr: ChangeDetectorRef
      
    )
    {
    }
    ngOnInit(){
      console.log('LLEGA =>', this.offerts);
  
    }
  
    ngAfterViewInit() {
      new Glide('.glide', {
        type: 'slider',
        perView: 1,
        autoplay:6000,
        focusAt: 'center',
        gap: 1
      }).mount();

    }

      getSizes(): string {
    return this.isMobile
      ? '(max-width: 768px) 150px, 300px'
      : '(max-width: 1024px) 300px, (max-width: 1280px) 350px, 400px';
  }

    onImageLoad(event: Event): void {
    this.imageLoadedState = true;
    this.imageErrorState = false;
    this.imageLoaded.emit(true);
    this.cdr.detectChanges();
  }

}
