import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { environment } from '../../environments/environment';
import { UtilsService } from '../../services/utils.service';
import { ServiceService } from '../../services/service.service';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { CarServiceService } from '../../services/car-service.service';
import { Product } from '../../interface/product'

@Component({
  selector: 'app-card-general',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-general.component.html',
  styleUrl: './card-general.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardGeneralComponent implements OnInit, OnDestroy, OnChanges {

  // ===== INPUTS EXISTENTES (mantener tal como están) =====
  @Input('prod') d: any;
  @Input('logo') logo: any;
  @Input('color') color: any;
  @Input('configuration') configuracion: any;
  @Input('information') information: any;

  // ===== NUEVOS INPUTS PARA LAZY LOADING =====
  @Input() loading: boolean = false;
  @Input() isMobile: boolean = false;
  @Input() isLazyLoaded: boolean = true;
  @Input() showSkeleton: boolean = false;
  // @Input() tipoNegocio: any;
  // @Input() tipoDefault: any;

  // ===== OUTPUTS EXISTENTES =====
  @Output() viewModalR = new EventEmitter<any>();

  // ===== NUEVOS OUTPUTS =====
  @Output() addToCartEvent = new EventEmitter<any>();
  @Output() wishlistToggle = new EventEmitter<any>();
  @Output() imageLoaded = new EventEmitter<boolean>();
  @Output() imageError = new EventEmitter<boolean>();

  // ===== PROPIEDADES EXISTENTES (mantener) =====
  public configurationVariables = {
    tipo_precio: 'pA',
    mostrar_precio: 1,
    show_attributes_prod: false,
  };
  public login: any = {};
  public productsSold: any = {};
  productSelect: any;
  urlFB = environment.firebaseUrl;

  // ===== NUEVAS PROPIEDADES PARA OPTIMIZACIÓN =====
  public imageLoadedState: boolean = false;
  public imageErrorState: boolean = false;
  public isInWishlist: boolean = false;
  public addToCartLoading: boolean = false;

  productDefault: any;
  loadingAll = false;
  public client: any = {};
  tipoNegocio: any;
  tipoDefault = 0;
  urlBilling = environment.urlBilling;
  flagLoader = false;
  arrayProduct: any = [];
  constructor(
    private util: UtilsService,
    private webService: ServiceService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    private carBehavior: CarServiceService,

  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log('changes.', changes);
    // console.log('information.', this.information);
    this.tipoNegocio = this.information.esPuntoVenta;
  }

  async ngOnInit() {
    // console.log('color ---- > ', this.color);
    document.documentElement.style.setProperty('--dynamic-color', this.color);
    // console.log('this.configuracion', this.configuracion);
    this.login = JSON.parse(localStorage.getItem(this.configuracion?.loginStorage));
    // console.log('this.login', (this.login));

  }

  ngOnDestroy() {
    // Limpieza de recursos si es necesario
  }

  // ===== GETTERS COMPUTADOS PARA OPTIMIZACIÓN =====

  // get shouldShowSkeleton(): boolean {
  //   return false
  //   // return this.loading || this.showSkeleton || (!this.imageLoadedState && !this.imageErrorState && this.isLazyLoaded);
  // }

  get cardClasses(): string {
    const baseClasses = 'max-w-sm mx-auto';
    const mobileClasses = this.isMobile ? 'card-mobile' : 'card-desktop';
    const loadingClasses = this.loading ? 'opacity-75' : '';

    return `${baseClasses} ${mobileClasses} ${loadingClasses}`.trim();
  }

  get productImage(): string {
    if (!this.d?.imagenPrincipal || this.d.imagenPrincipal === '1bW4FHKxVF0tHzYbiYTu1iEh4BaSYbRm2') {
      return `${this.urlFB}${this.logo}?alt=media`;
    }
    return `${this.urlFB}${this.d.imagenPrincipal}?alt=media`;
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

  get productPrice(): number {
    return this.d?.precioOferta > 0 ? this.d.precioOferta : this.d?.precioReal || 0;
  }

  get originalPrice(): number {
    return this.d?.precioOferta > 0 ? this.d.precioReal : 0;
  }

  get hasDiscount(): boolean {
    return this.d?.precioOferta > 0;
  }

  get discountPercentage(): number {
    if (!this.hasDiscount) return 0;
    return this.calculateDescount(this.d.precioOferta, this.d.precioReal);
  }

  get stockLevel(): 'high' | 'medium' | 'low' | 'out' {
    const stock = this.d?.stockactual || 0;
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    if (stock <= 20) return 'medium';
    return 'high';
  }

  get stockColor(): string {
    switch (this.stockLevel) {
      case 'out': return 'text-red-600';
      case 'low': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  }

  // ===== MÉTODOS EXISTENTES (mantener funcionalidad) =====

  clampText(text: string): string {
    return this.util.truncateString2(text, 42);
  }

  calculateDescount(cantR: number, cantD: number): number {
    let percent = (parseFloat(cantD.toString()) * 100) / parseFloat(cantR.toString());
    let desc = 100 - percent;
    desc = Number(desc.toFixed(1));
    return desc;
  }

  getProductById(product: any) {
    console.log('ENTRA ', product);
    let send = {
      product: product,
      configuracion: this.configuracion,
      show_price: this.configurationVariables.mostrar_precio,
      show_attributes_product: this.configurationVariables.show_attributes_prod,
      login: this.login,
      productsSold: this.productsSold
    };
    this.webService.setProductSelectedDetail(send);

    let ruta = 'producto/:idProduct';
    ruta = ruta.replace(':idProduct', product.id_producto.toString());
    this.router.navigateByUrl(ruta).then();
  }

  open(name: string) {
    console.log('CLICK');
    this.openModal(name);
  }

  openModal(name: string) {
    let modal = this.util.createModal(name);
    modal.show();
  }

  closeModal(flag: boolean, name: string) {
    let modal = this.util.createModal(name);
    if (flag) {
      modal.hide();
    } else {
      modal.hide();
    }
  }

  seeDetail(product: any) {
    console.log("Doy click hijo, AR", product);
    this.productSelect = product;
    this.productSelect.product = product;
    this.viewModalR.emit(product);
  }

  // ===== NUEVOS MÉTODOS PARA OPTIMIZACIÓN =====

  /**
   * Manejo de carga de imagen exitosa
   */
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

  /**
   * Click en el botón de agregar al carrito
   */
  async onAddToCart(event: Event): Promise<void> {
    console.log('Entra aqui', event);

    event.stopPropagation();

    if (this.d?.stockactual <= 0 || this.addToCartLoading) return;

    this.addToCartLoading = true;
    this.cdr.detectChanges();

    try {
      // Simular delay de API (opcional)
      await new Promise(resolve => setTimeout(resolve, 300));

      this.addToCartEvent.emit(this.d);
      this.showAddToCartFeedback();

    } catch (error) {
      console.error('Error agregando al carrito:', error);
    } finally {
      this.addToCartLoading = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Toggle wishlist
   */
  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    this.isInWishlist = !this.isInWishlist;
    this.updateWishlistStorage();
    this.wishlistToggle.emit({
      product: this.d,
      isInWishlist: this.isInWishlist
    });
    this.cdr.detectChanges();
  }

  /**
   * Click en la card completa
   */
  onCardClick(event: Event): void {
    // Solo si no se hizo click en botones
    const target = event.target as HTMLElement;
    if (!target.closest('button')) {
      this.seeDetail(this.d);
    }
  }

  /**
   * Verificar si el producto está en wishlist
   */
  private checkWishlistStatus(): void {
    try {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      this.isInWishlist = wishlist.some((item: any) =>
        item.id_producto === this.d?.id_producto ||
        item.codigo === this.d?.codigo
      );
    } catch (error) {
      console.warn('Error verificando wishlist:', error);
      this.isInWishlist = false;
    }
  }

  /**
   * Actualizar wishlist en localStorage
   */
  private updateWishlistStorage(): void {
    try {
      let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

      if (this.isInWishlist) {
        // Agregar al wishlist
        if (!wishlist.some((item: any) => item.id_producto === this.d.id_producto)) {
          wishlist.push(this.d);
        }
      } else {
        // Remover del wishlist
        wishlist = wishlist.filter((item: any) => item.id_producto !== this.d.id_producto);
      }

      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.warn('Error actualizando wishlist:', error);
    }
  }

  /**
   * Feedback visual al agregar al carrito
   */
  private showAddToCartFeedback(): void {
    // Opcional: Mostrar toast o animación
    console.log('Producto agregado al carrito:', this.d.pro_nom);
    this.setMethodAddCart(this.d, this.tipoNegocio, this.tipoDefault)
  }

  /**
   * Formatear precio para mostrar
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * Obtener texto de stock según nivel
   */
  getStockText(): string {
    const stock = this.d?.stockactual || 0;

    switch (this.stockLevel) {
      case 'out': return 'Sin stock';
      case 'low': return `¡Solo ${stock} disponibles!`;
      case 'medium': return `${stock} disponibles`;
      default: return `${stock} disponibles`;
    }
  }

  /**
   * Verificar si se puede agregar al carrito
   */
  canAddToCart(): boolean {
    return this.d?.stockactual > 0 && !this.addToCartLoading;
  }

  /**
   * Obtener clases CSS para el botón de carrito
   */
  getCartButtonClasses(): string {
    const baseClasses = 'py-2 px-3 rounded-md shadow-md transition-all duration-200';

    if (this.canAddToCart()) {
      return `${baseClasses} bg-orange-100 text-orange-400 hover:bg-orange-200 hover:scale-105 active:scale-95`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
  }

  /**
   * Obtener icono del botón de carrito
   */
  getCartButtonIcon(): string {
    if (this.addToCartLoading) {
      return 'ri-loader-4-line animate-spin';
    }
    return this.canAddToCart() ? 'ri-shopping-cart-fill' : 'ri-shopping-cart-2-line';
  }

  /**
   * Generar srcset para imágenes responsivas
   */
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


  // ------------------------- LOGIN -------------------------
  // ---------------------------------------------------------- 
  public setMethodAddCart(product, esPunto, tipo) {
    console.log('es punto venta', esPunto);
    console.log('es tipo', tipo);
    this.tipoNegocio = esPunto;
    this.tipoDefault = tipo;
    this.productDefault = product;

    this.webService.saveToLocalStorage('tipoCliente', this.tipoDefault);
    if (esPunto == 1) {
      console.log('ENTRA A ESTE METODO 1');
      let sessionInit = localStorage.getItem('isLoged');
      console.log('sessionInit', sessionInit);
      if (sessionInit == 'true') {
        //  this.addProductShoppingCart(product, login.data);
        this.verifyLoginClientFinal(product, 'direct', tipo);
      } else {
        this.verifyLoginClientFinal(product, 'direct', tipo);
      }
    } else {
      console.log('ENTRA A ESTE METODO 2');
      // if (product.talla || product.guarnicion == true) {
      //   this.modalViewDetailProduct(product);
      // } else {
      //   this.verifyLoginClient(product, 'direct',tipo);
      // }
      this.verifyLoginClient(product, 'direct', tipo);

    }
  }

  async verifyLoginClient(product, type, tipo) {

    console.log('login', this.login);


    if (this.login) {
      console.log('login', this.login);

      this.client = this.login;
      if (type == 'direct') {
        product.quantity = 1;
      }
      await this.addProductShoppingCart(product, this.login.user);
    } else {
      // await this.loginClient();
    }

    // await this.webService.isAuthenticatedClient(this.configuracion.loginStorage).then(async (login: any) => {
    //   console.log('login',login);

    //   if (login.rta == true) {
    //     this.client = login.data;
    //     if (type == 'direct') {
    //       product.quantity = 1;
    //     }
    //     await this.addProductShoppingCart(product, login.data);
    //   } else {
    //     await this.loginClient();
    //   }
    // });
  }

  async verifyLoginClientFinal(product, type, tipo) {
    console.log('TIPO QUE ENTRA === > ', tipo);
    this.tipoDefault = tipo;
    this.webService.saveToLocalStorage('tipoCliente', this.tipoDefault);
    await this.webService.isAuthenticatedClient(this.configuracion.loginStorage).then(async (login: any) => {
      if (login.rta == true) {
        this.client = login.data;
        if (type == 'direct') {
          product.quantity = 1;
        }
        console.log("viene aqui ----: Acá debo agregar ",);

        await this.addProductShoppingCart(product, login.data);
      } else {
        console.log('ABRE MODAL PARA LOGUEAR');

        // this.setMethodAddCart(product,1)
        // this.modalCtrl.open(this.modalFinalCustomer, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'sm' })

        // let login={
        //   usuario:'9999999999',
        //   clave:'9999999999'
        // }
        // await this.loginClient2(`https://sofpymes.com/${environment.empresa}/common/movil/`, this.configuracion, login, 'login');
      }
    });
  }

  async addProductShoppingCart(product, client) {
    this.flagLoader = true;

    const productos = await this.verificarCarrito(client);
    console.log("Productos del carrito:", productos);

    if (productos.length > 0) {
      const productoExiste = this.existeProductoEnCarrito(productos, product.id_producto); // true
      console.log('productoExiste', productoExiste);
      if (productoExiste) {
        this.alert.alertWarning('Producto ya se encuentra en el carrito', '')
      } else {
        console.log('ENTRA PARA AGREGAR', client);
        let counter = 0;
        if (product.precioReal > 0) {
          await this.webService.addProductCartSecond(product, client, this.configuracion, this.urlBilling).then(async (res: any) => {
            console.log('respuesta agrega primero ==> ', res);

            if (res.rta == true) {
              this.alert.alertSuccess(res.mensaje, '');
              if (localStorage.getItem('carCount')) {
                counter = parseFloat(localStorage.getItem('carCount'));
              }
              counter += 1;
              this.webService.saveToLocalStorage('carCount', counter);
            } else {
              this.alert.alertWarning(res.mensaje, '');
            }

          });
          this.flagLoader = false;
        } else {
          this.alert.alertWarning('No se puede agregar el producto, precio no válido', '');
          this.flagLoader = false;
        }
      }

    } else {
      console.log('ENTRA PARA AGREGAR', client);
      let counter = 0;
      if (product.precioReal > 0) {
        await this.webService.addProductCartSecond(product, client, this.configuracion, this.urlBilling).then(async (res: any) => {
          console.log('respuesta agrega primero ==> ', res);

          if (res.rta == true) {
            this.alert.alertSuccess(res.mensaje, '');
            if (localStorage.getItem('carCount')) {
              counter = parseFloat(localStorage.getItem('carCount'));
            }
            counter += 1;
            this.webService.saveToLocalStorage('carCount', counter);
          } else {
            this.alert.alertWarning(res.mensaje, '');
          }

        });
        this.flagLoader = false;
      } else {
        this.alert.alertWarning('No se puede agregar el producto, precio no válido', '');
        this.flagLoader = false;
      }
    }
  }

  async loginClient() {
    console.log('lo llama');

    // this.modalCtrl.open(LoginUserComponent, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'sm' }).result.then(async (result) => {
    // this.modalCtrl.dismissAll
    //   // this.modalCtrl.dismissAll('home');
    //   // this.modalCtrl.activeInstances.subscribe((data:any)=>{
    //   //   console.log('data',data);

    //   //   this.tipoLogin= 'home';

    //   // })
    //   this.closeResult = `Closed with: ${result}`;
    // }, (reason) => {
    //   this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //   // console.log(reason);
    // });
  }



  async verificarCarrito(client): Promise<any[]> {
    console.log('llega client', client);

    if (client) {
      await this.webService.getproductsCart({
        id_cliente: client.PersonaComercio_cedulaRuc,
        bodega: this.configuracion.id_bodega
      }).then((rescart: any) => {
        console.log('RESSSSS ', rescart);
        this.arrayProduct = rescart.products;

        if (this.arrayProduct.length > 0) {
          const productosAgrupados = this.arrayProduct.reduce((acumulador, productoActual) => {
            const grupoExistente = acumulador.find(p => p.id_producto === productoActual.id_producto);

            if (grupoExistente) {
              grupoExistente.quantity += productoActual.quantity;
            } else {
              acumulador.push({ ...productoActual });
            }
            return acumulador;
          }, []);

          this.arrayProduct = productosAgrupados;
          console.log('Array Product', this.arrayProduct);
        }
      });
    }

    // Retornamos el array de productos
    return this.arrayProduct;
  }

  existeProductoEnCarrito(productos: any[], idProducto: number): boolean {
    return productos.some(producto => producto.id_producto === idProducto);
  }




}