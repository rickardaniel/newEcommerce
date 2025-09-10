import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { ServiceService } from '../../services/service.service';
import { UtilsService } from '../../services/utils.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-sidebar-layout-rigth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-layout-rigth.component.html',
  styleUrl: './sidebar-layout-rigth.component.scss'
})


export class SidebarLayoutRigthComponent implements OnChanges {
  @Input('arrayProduct') arrayProduct: any;
  @Input('prod') d: any;
  @Input('logo') logo: any;

  @Output() imageLoaded = new EventEmitter<boolean>();
  @Output() imageError = new EventEmitter<boolean>();
  @Output() updateCar = new EventEmitter<boolean>();
  @Output() updateCarAddQuit = new EventEmitter<boolean>();

  // ===== NUEVOS INPUTS PARA LAZY LOADING =====
  @Input() loading: boolean;
  @Input() isMobile: boolean = false;
  @Input() isLazyLoaded: boolean = true;
  @Input() showSkeleton: boolean = false;

  urlFirebae = environment.firebaseUrl;
  // ===== NUEVAS PROPIEDADES PARA OPTIMIZACIÓN =====
  public imageLoadedState: boolean = false;
  public imageErrorState: boolean = false;
  public isInWishlist: boolean = false;
  public addToCartLoading: boolean = false;
  productSelected: any = [];
  constructor
    (
      private cdr: ChangeDetectorRef,
      private service: ServiceService,
      private util: UtilsService,
      private alert: AlertService

    ) { }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log('void ---> ', changes);

  }


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

  deleteProduct(prod, name) {
    console.log('name -- ', name);

    this.productSelected = prod;
    console.log('PRODUCT SELECTED ===> ', this.productSelected);

    let modal = this.util.createModal2(name);
    modal.show();
  }

  closeModal(name) {
    let modal = this.util.createModal2(name);
    modal.hide();
  }

  async delete(id_carrito) {
    console.log('id_carrito', id_carrito);
    
    await this.service.deleteProductCart(id_carrito).then(async (resdel: any) => {
      console.log('resdel', resdel);
      if(resdel){
        this.alert.alertSuccess('', 'Producto eliminado');
        this.updateCar.emit(true)
      }
    })
  }

addOrQuitProduct(type, product){
  let obj:any;
  obj = {
    'type':type,
    'product':product
  }
  console.log('OBJ', obj);
  
  this.updateCarAddQuit.emit(obj)
}


}

