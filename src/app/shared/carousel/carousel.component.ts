import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FlowbiteService } from '../../services/flowbite.service';
import Glide from '@glidejs/glide';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements AfterViewInit {
  @Input('banners') banners: any;
  urlFB = environment.firebaseUrl;

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

  ) {
  }
  ngOnInit() {
    console.log('LLEGA =>', this.banners);

  }

  ngAfterViewInit() {
    new Glide('.glide', {
      type: 'slider',
      perView: 1,
      autoplay: 6000,
      focusAt: 'center',
      gap: 1
    }).mount();
  }

  get optimizedImageSrc(): string {
    const baseImage = this.productImage;

    // Optimización de imagen según dispositivo
    if (this.isMobile) {
      return `${baseImage}&w=300&h=300&q=80&f=webp`;
    } else {
      return `${baseImage}&w=400&h=400&q=80&f=webp`;
    }
  }


  getSizes(): string {
    return this.isMobile
      ? '(max-width: 768px) 150px, 300px'
      : '(max-width: 1024px) 300px, (max-width: 1280px) 350px, 400px';
  }



  generateSrcSet(d): string {
    const baseImage = d.url;
    this.productImage = baseImage;
    return [
      `${baseImage}&w=150&h=150&q=80&f=webp 150w`,
      `${baseImage}&w=300&h=300&q=80&f=webp 300w`,
      `${baseImage}&w=400&h=400&q=80&f=webp 400w`,
      `${baseImage}&w=600&h=600&q=80&f=webp 600w`
    ].join(', ');
  }

  onImageLoad(event: Event): void {
    this.imageLoadedState = true;
    this.imageErrorState = false;
    this.imageLoaded.emit(true);
    this.cdr.detectChanges();
  }

}

