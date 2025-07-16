// import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';
// import { environment } from '../../environments/environment';
// import { CommonModule } from '@angular/common';
// import Glide from '@glidejs/glide';
// import { UtilsService } from '../../services/utils.service';
// import { Router } from '@angular/router';
// import { ServiceService } from '../../services/service.service';

// @Component({
//   selector: 'app-card-common',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './card-common.component.html',
//   styleUrl: './card-common.component.scss',
//   schemas:[CUSTOM_ELEMENTS_SCHEMA]

// })
// export class CardCommonComponent {
//   @Input('data') data:any;
//     @Input('prod') d: any;

//   @Input('tipo') tipo:any;
//   @Input('color') colorMain:any;
//   @Input('logo') logo:any;
//   urlFB = environment.firebaseUrl;
//   empresa = environment.empresa;
//   @Output() sendGrupos = new EventEmitter<any>();
//   @Output() sendAction = new EventEmitter<any>();
//   @Output() viewModalR = new EventEmitter<any>();

//   public configurationVariables = {
//     tipo_precio: 'pA', // No se esta usando
//     mostrar_precio: 1,
//     show_attributes_prod: false,
//   }

//    // ===== NUEVOS INPUTS PARA LAZY LOADING =====
//   @Input() loading: boolean = false;
//   @Input() isMobile: boolean = false;
//   @Input() isLazyLoaded: boolean = true;
//   @Input() showSkeleton: boolean = false;

//   // ===== NUEVOS OUTPUTS =====
//   @Output() addToCartEvent = new EventEmitter<any>();
//   @Output() wishlistToggle = new EventEmitter<any>();
//   @Output() imageLoaded = new EventEmitter<boolean>();
//   @Output() imageError = new EventEmitter<boolean>();

//     // ===== NUEVAS PROPIEDADES PARA OPTIMIZACIÓN =====
//   public imageLoadedState: boolean = false;
//   public imageErrorState: boolean = false;
//   public isInWishlist: boolean = false;
//   public addToCartLoading: boolean = false;

//   constructor
//   (
//     private util: UtilsService,
//     private router: Router,
//     private webService: ServiceService,
//     private cdr: ChangeDetectorRef

//   )
//   {
//   }

//   ngOnInit(){
//     document.documentElement.style.setProperty('--dynamic-color', this.colorMain);
//     console.log('data', this.data);

//   }

//   ngAfterViewInit(): void {
// }

//   clampText(text){
//     return this.util.truncateString2(text,42);
//   }

//   calculateDescount(cantR, cantD){
//     let percent = (parseFloat(cantD)*100)/parseFloat(cantR);
//     let desc =  100 - percent;
//     desc = Number(desc.toFixed(1))
//     return desc
//    }

//    verProductDetail(product: any) {
//     console.log('ENTRA ', product);
//     let send = {
//       product: product,
//       // configuracion: this.configuracion,
//       // show_price: this.configurationVariables.mostrar_precio,
//       // show_attributes_product: this.configurationVariables.show_attributes_prod,
//       // login: this.login,
//       // productsSold: this.productsSold
//     }
//     this.webService.setProductSelectedDetail(send);

//     let ruta = 'producto/:idProduct'
//     ruta = ruta.replace(':idProduct', product.id_producto.toString())
//     // window.open(`/#/reportes/ordenes/detalle_orden/${idOrden}/${tipo}`, '_blank')
//     this.router.navigateByUrl(ruta).then();
//   }

//   newMethod(){
//     console.log('ENTRA ', );
//       this.sendGrupos.emit();
//   }

//   getProductById(id){
//     console.log('ESTE ID se imprime', id);

//   }

//   onCardClick(event: any): void {
//     console.log('event', event);

//     // Asegurarse de que el click se hizo en la tarjeta y no en otros elementos dentro del contenedor
//     const clickedCard = event.target.closest('.glide__slide');
//     console.log('glide', clickedCard );

//     if (clickedCard) {
//       // Obtener el índice de la tarjeta
//       const index = Array.from(clickedCard.parentElement.children).indexOf(clickedCard);
//       const selectedProduct = this.data[index];

//       // Realizar la lógica que se hacía antes en seeDetail
//       // this.seeDetail(selectedProduct);
//     }
//   }

//   seeDetail(product){
//     console.log("Doy click hijo, AR",product);

//     this.viewModalR.emit(product);
//   }

//   // ----------------------------------------------------------------------
//   // ----------------------------------------------------------------------

//     get cardClasses(): string {
//     const baseClasses = 'max-w-sm mx-auto';
//     const mobileClasses = this.isMobile ? 'card-mobile' : 'card-desktop';
//     const loadingClasses = this.loading ? 'opacity-75' : '';

//     return `${baseClasses} ${mobileClasses} ${loadingClasses}`.trim();
//   }

//     getSizes(): string {
//     return this.isMobile
//       ? '(max-width: 768px) 150px, 300px'
//       : '(max-width: 1024px) 300px, (max-width: 1280px) 350px, 400px';
//   }

//     generateSrcSet(): string {
//     const baseImage = this.productImage;
//     return [
//       `${baseImage}&w=150&h=150&q=80&f=webp 150w`,
//       `${baseImage}&w=300&h=300&q=80&f=webp 300w`,
//       `${baseImage}&w=400&h=400&q=80&f=webp 400w`,
//       `${baseImage}&w=600&h=600&q=80&f=webp 600w`
//     ].join(', ');
//   }

//     onImageLoad(event: Event): void {
//     this.imageLoadedState = true;
//     this.imageErrorState = false;
//     this.imageLoaded.emit(true);
//     this.cdr.detectChanges();
//   }

//     onImageError(event: Event): void {
//     this.imageErrorState = true;
//     this.imageLoadedState = false;
//     this.imageError.emit(true);
//     console.warn('Error cargando imagen:', this.d?.imagenPrincipal);
//     this.cdr.detectChanges();
//   }

//     get productImage(): string {
//     if (!this.d?.imagenPrincipal || this.d.imagenPrincipal === '1bW4FHKxVF0tHzYbiYTu1iEh4BaSYbRm2') {
//       return `${this.urlFB}${this.logo}?alt=media`;
//     }
//     return `${this.urlFB}${this.d.imagenPrincipal}?alt=media`;
//   }

//  get productPrice(): number {
//     return this.d?.precioOferta > 0 ? this.d.precioOferta : this.d?.precioReal || 0;
//   }

//   get originalPrice(): number {
//     return this.d?.precioOferta > 0 ? this.d.precioReal : 0;
//   }

//   get hasDiscount(): boolean {
//     return this.d?.precioOferta > 0;
//   }

//   get discountPercentage(): number {
//     if (!this.hasDiscount) return 0;
//     return this.calculateDescount(this.d.precioOferta, this.d.precioReal);
//   }

//   get stockLevel(): 'high' | 'medium' | 'low' | 'out' {
//     const stock = this.d?.stockactual || 0;
//     if (stock === 0) return 'out';
//     if (stock <= 5) return 'low';
//     if (stock <= 20) return 'medium';
//     return 'high';
//   }

//   get stockColor(): string {
//     switch (this.stockLevel) {
//       case 'out': return 'text-red-600';
//       case 'low': return 'text-orange-600';
//       case 'medium': return 'text-yellow-600';
//       default: return 'text-green-600';
//     }
//   }

//     formatPrice(price: number): string {
//     return new Intl.NumberFormat('es-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(price);
//   }

//   getStockText(): string {
//     const stock = this.d?.stockactual || 0;

//     switch (this.stockLevel) {
//       case 'out': return 'Sin stock';
//       case 'low': return `¡Solo ${stock} disponibles!`;
//       case 'medium': return `${stock} disponibles`;
//       default: return `${stock} disponibles`;
//     }
//   }

//     getCartButtonClasses(): string {
//     const baseClasses = 'py-2 px-3 rounded-md shadow-md transition-all duration-200';

//     if (this.canAddToCart()) {
//       return `${baseClasses} bg-orange-100 text-orange-400 hover:bg-orange-200 hover:scale-105 active:scale-95`;
//     } else {
//       return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
//     }
//   }

//     canAddToCart(): boolean {
//     return this.d?.stockactual > 0 && !this.addToCartLoading;
//   }

//   async onAddToCart(event: Event): Promise<void> {
//     event.stopPropagation();

//     if (this.d?.stockactual <= 0 || this.addToCartLoading) return;

//     this.addToCartLoading = true;
//     this.cdr.detectChanges();

//     try {
//       // Simular delay de API (opcional)
//       await new Promise(resolve => setTimeout(resolve, 300));

//       this.addToCartEvent.emit(this.d);
//       this.showAddToCartFeedback();

//     } catch (error) {
//       console.error('Error agregando al carrito:', error);
//     } finally {
//       this.addToCartLoading = false;
//       this.cdr.detectChanges();
//     }
//   }

//     private showAddToCartFeedback(): void {
//     // Opcional: Mostrar toast o animación
//     console.log('Producto agregado al carrito:', this.d.pro_nom);
//   }

//     getCartButtonIcon(): string {
//     if (this.addToCartLoading) {
//       return 'ri-loader-4-line animate-spin';
//     }
//     return this.canAddToCart() ? 'ri-shopping-cart-fill' : 'ri-shopping-cart-2-line';
//   }

//     get optimizedImageSrc(): string {
//     const baseImage = this.productImage;

//     // Optimización de imagen según dispositivo
//     if (this.isMobile) {
//       return `${baseImage}&w=300&h=300&q=80&f=webp`;
//     } else {
//       return `${baseImage}&w=400&h=400&q=80&f=webp`;
//     }
//   }

// }

import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils.service';
import { Router } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { StylesService } from '../../services/styles.service';

@Component({
  selector: 'app-card-common',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-common.component.html',
  styleUrl: './card-common.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CardCommonComponent {
  @Input('data') data: any;
  @Input('prod') d: any;
  @Input('tipo') tipo: any;
  @Input('color') colorMain: any;
  @Input('logo') logo: any;

  @Output() sendGrupos = new EventEmitter<any>();
  @Output() sendAction = new EventEmitter<any>();
  @Output() viewModalR = new EventEmitter<any>();

  urlFB = environment.firebaseUrl;
  empresa = environment.empresa;

  // Propiedades simples para lazy loading
  imageLoaded: boolean = false;
  imageError: boolean = false;

  public configurationVariables = {
    tipo_precio: 'pA',
    mostrar_precio: 1,
    show_attributes_prod: false,
  };

  constructor(
    private util: UtilsService,
    private router: Router,
    private webService: ServiceService,
    private cdr: ChangeDetectorRef,
    private stylesService: StylesService // Agregar esta línea
  ) {}

  ngOnInit() {
    document.documentElement.style.setProperty(
      '--dynamic-color',
      this.colorMain
    );
    console.log('data', this.data);
  }

  // Métodos existentes (mantener)
  clampText(text: string) {
    return this.util.truncateString2(text, 42);
  }

  calculateDescount(cantR: number, cantD: number) {
    let percent =
      (parseFloat(cantD.toString()) * 100) / parseFloat(cantR.toString());
    let desc = 100 - percent;
    desc = Number(desc.toFixed(1));
    return desc;
  }

  seeDetail(product: any) {
    console.log('Doy click hijo, AR', product);
    this.viewModalR.emit(product);
  }

  newMethod() {
    console.log('ENTRA');
    this.sendGrupos.emit();
  }

  getProductById(id: any) {
    console.log('ESTE ID se imprime', id);
  }

  verProductDetail(product: any) {
    console.log('ENTRA ', product);
    let send = {
      product: product,
    };
    this.webService.setProductSelectedDetail(send);

    let ruta = 'producto/:idProduct';
    ruta = ruta.replace(':idProduct', product.id_producto.toString());
    this.router.navigateByUrl(ruta).then();
  }

  // Métodos simples para lazy loading
  onImageLoad() {
    this.imageLoaded = true;
    this.imageError = false;
    this.cdr.detectChanges();
  }

  onImageError() {
    this.imageError = true;
    this.imageLoaded = false;
    console.warn('Error cargando imagen:', this.d?.imagenPrincipal);
    this.cdr.detectChanges();
  }

  // Getter simple para la imagen
  get productImage(): string {
    if (
      !this.d?.imagenPrincipal ||
      this.d.imagenPrincipal === '1bW4FHKxVF0tHzYbiYTu1iEh4BaSYbRm2'
    ) {
      return `${this.urlFB}${this.logo}?alt=media`;
    }
    return `${this.urlFB}${this.d.imagenPrincipal}?alt=media`;
  }

  // Getters simples para precios
  get hasDiscount(): boolean {
    return this.d?.precioOferta > 0;
  }

  get currentPrice(): number {
    return this.d?.precioOferta > 0
      ? this.d.precioOferta
      : this.d?.precioReal || 0;
  }

  get originalPrice(): number {
    return this.d?.precioOferta > 0 ? this.d.precioReal : 0;
  }

  numberTwoDecimals(number) {
    return this.util.dosDecimales(number);
  }
}
