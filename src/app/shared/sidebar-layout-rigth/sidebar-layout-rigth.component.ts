import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-layout-rigth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-layout-rigth.component.html',
  styleUrl: './sidebar-layout-rigth.component.scss'
})


export class SidebarLayoutRigthComponent {
  @Input('arrayProduct')arrayProduct:any;
   @Input('prod') d: any;
   @Input('logo') logo: any;

  @Output() imageLoaded = new EventEmitter<boolean>();
  @Output() imageError = new EventEmitter<boolean>();

    // ===== NUEVOS INPUTS PARA LAZY LOADING =====
  @Input() loading: boolean = false;
  @Input() isMobile: boolean = false;
  @Input() isLazyLoaded: boolean = true;
  @Input() showSkeleton: boolean = false;

  urlFirebae=environment.firebaseUrl;
    // ===== NUEVAS PROPIEDADES PARA OPTIMIZACIÓN =====
  public imageLoadedState: boolean = false;
  public imageErrorState: boolean = false;
  public isInWishlist: boolean = false;
  public addToCartLoading: boolean = false;

  constructor
  (
        private cdr: ChangeDetectorRef,
    
  )
  {}


  get productImage(): string {
    if (!this.d?.imagenPrincipal || this.d.imagenPrincipal === '1bW4FHKxVF0tHzYbiYTu1iEh4BaSYbRm2') {
      return `${this.urlFirebae}${this.logo}?alt=media`;
    }
    return `${this.urlFirebae}${this.d.imagenPrincipal}?alt=media`;
  }
  generateSrcSet(): string {
    const baseImage = this.productImage;
    return [
      `${baseImage}&w=150&h=150&q=80&f=webp 150w`,
      `${baseImage}&w=300&h=300&q=80&f=webp 300w`,
      `${baseImage}&w=400&h=400&q=80&f=webp 400w`,
      `${baseImage}&w=600&h=600&q=80&f=webp 600w`
    ].join(', ');
  }

  /**
   * Obtener sizes para imágenes responsivas
   */
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

  /**
   * Manejo de error de imagen
   */
  onImageError(event: Event): void {
    this.imageErrorState = true;
    this.imageLoadedState = false;
    this.imageError.emit(true);
    console.warn('Error cargando imagen:', this.d?.imagenPrincipal);
    this.cdr.detectChanges();
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


}

