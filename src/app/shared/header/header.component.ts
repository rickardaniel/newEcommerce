import { Component, effect, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceService } from '../../services/service.service';
import { UtilsService } from '../../services/utils.service';
import { LoginRegisterComponent } from '../login-register/login-register.component';
import { catchError, lastValueFrom, of, Subscription, tap } from 'rxjs';
import { SidebarLayoutComponent } from "../sidebar-layout/sidebar-layout.component";
import { SidebarLayoutRigthComponent } from '../sidebar-layout-rigth/sidebar-layout-rigth.component';
import { CarServiceService } from '../../services/car-service.service';
import { Product } from '../../interface/product'
import { ClientSession2 } from '../../interface/clientSession';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginRegisterComponent,  SidebarLayoutRigthComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnChanges {
  @Input('information') information: any;
  @Input('configuracion') configuracion: any;
  urlBase = environment.firebaseUrl;
  public clientLogin = {
    name: '',
    imagen: '',
    login: false,
    rol: ''
  }
  clienteLogin2: any = []

  public cartProducts = {
    number: 0,
    total: 0.00
  }

  counterCar = 0;
  flagCarLocal = true;
  private storageSubscription!: Subscription;
  isNavbarCollapsed = true;
  isDrawerOpen: boolean = false;
  currentRoute: string = '';
  arrayProduct: any = [];
  logo: any;
  flagLoader = false;
  producto: any;
  arrayOrden: any = [];
  isAuthenticated = this.auth.isAuthenticated;
  // arrayProduct:any=[];
  loading = false;
  constructor
    (
      private webService: ServiceService,
      private util: UtilsService,
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private carBehavior: CarServiceService,
      private auth: AuthService,
      private alert: AlertService,

    ) {
    this.carBehavior.products$.subscribe((product: Product[]) => {
      this.producto = product
      this.arrayOrden = this.producto;
      let result = this.util.groupProductsAndSumQuantityReduce(this.arrayOrden);
      // console.log('result ', result);
      this.arrayProduct = result;
      // console.log('HEADER ', this.arrayOrden);

      // effect(() => {
      //   console.log('Header detectó cambio en autenticación:', this.isAuthenticated());
      //   // Aquí puedes ejecutar lógica adicional cuando cambia el estado
      //   const user = this.auth.getCurrentUserValue();
      //   console.log('Datos de usuario actualizados:', user);
      //   if (user) {
      //     this.clientLogin = user;
      //     this.clienteLogin2 = user;
      //   } else {
      //     let user = JSON.parse(localStorage.getItem(this.configuracion.loginStorage));
      //     this.clientLogin = user;
      //     this.clienteLogin2 = user;

      //   }
      // });

    })
    this.carBehavior.productBehaviorSubject(this.arrayProduct)

    if (this.arrayProduct.length == 0) {
      //   let result = JSON.parse(localStorage.getItem('products'));
      //   console.log('RESULTADO ', result);
      //   this.arrayOrden = result
      //   // if(result){
      //     this.arrayProduct=this.arrayOrden
      //   // }


    }

  }
  async ngOnChanges(changes: SimpleChanges) {
    // console.log('changes ==> ', changes);

    this.configuracion = changes['configuracion'].currentValue;
    this.logo = this.configuracion?.imgLogo;
    // console.log('====> ', this.configuracion);
    // this.storageSubscription = this.webService
    //   .getStorageObservable()
    //   .subscribe((data) => {
    //     console.log('data', data);
    //     if (data.key === this.configuracion.loginStorage) {
    //       this.clientLogin = data.data
    //     } else {
    //       this.counterCar = data.data;
    //     }
    //   });
  }

  async ngOnInit() {
       await this.isAutenticatedClient(this.configuracion).then(async (resauth: any) => {
      // Obtener productos del carrito y su total
      if (resauth.rta == true) {
        console.log('AQUIIIII _____________', resauth);

        this.storageSubscription = this.webService
          .getStorageObservable()
          .subscribe((data) => {
            this.counterCar = data.data;
            console.log('data', data);

          });
        this.counterCar = parseInt(this.webService.getFromLocalStorage('carCount'));
        await this.webService.getproductsCart({ id_cliente: resauth.data.PersonaComercio_cedulaRuc }).then(async (resprod: any) => {
          this.cartProducts = {
            number: resprod.data.length,
            total: await this.webService.calculateTotalCartProducts(resprod.data)
            // total: 0
          }
        });
        console.log('data', this.cartProducts);
        this.webService.saveToLocalStorage('carCount', this.cartProducts.number);
        this.counterCar = this.webService.getFromLocalStorage('carCount');

      } else {
        this.storageSubscription = this.webService
          .getStorageObservable()
          .subscribe((data) => {
            if (data.key == 'carLocal') {
              if (data.data == '1') {
                this.flagCarLocal = false;
              } else {
                this.flagCarLocal = true;

              }
            } else {
              this.counterCar = data.data;
            }
            console.log('data', data);

          });
      }
    });
    this.currentRoute = this.activatedRoute.snapshot.url.join('/');
    // console.log('ruta actual', this.currentRoute);

    let color = this.configuracion.colorPrincipal;
    let colorLetra = this.configuracion.colorLetra;
    let lighterTone = this.util.hexToRgba(color, 0.2)
    document.documentElement.style.setProperty('--dynamic-color', color);
    document.documentElement.style.setProperty('--font-color-letter', colorLetra);
    document.documentElement.style.setProperty('--lighterTone', lighterTone);

    // let  clientLogin = this.auth.initializeAuthState(this.configuracion.loginStorage);


    // console.log('CLIENTE LOGIN ----< ', clientLogin);

    // this.clientLogin = clientLogin

    // this.clientLogin = this.webService.getFromLocalStorage(this.configuracion.loginStorage);
    // console.log('REcupera == > Login', this.clientLogin);

    //     await this.webService.isAuthenticatedClient(this.configuracion.loginStorage).then((login: any) => {
    //       console.log('LOGIN ', login);

    //   if (login.rta == true) {
    //     // this.user = login.data;
    //     // this.addressDeliveryData.client = this.user;
    //   } else {
    //     //console.log("no se ha encontrado login");
    //   }
    // });

    await this.webService.observableProductsCart().subscribe((rescart: any) => {
      // console.log("suscrito car", rescart);
      this.cartProducts = {
        number: rescart.number,
        total: rescart.total
      }
    });




  }

  eraseRoute() {
    localStorage.removeItem('g_s')
  }


  openModal(name) {
    let modal = this.util.createModal(name);
    modal.show();
  }

  // async isAutenticatedClient(configuracion) {
  //   console.log('LLEGA CONFIG BIEN', configuracion);


  //   let auth;
  //   await this.webService.isAuthenticatedClient(configuracion?.loginStorage).then(async (login: any) => {
  //     console.log('entra ******** ', login);

  //     auth = await login;
  //     if (login.rta == true) {
  //       this.clientLogin = {
  //         name: login.data.nameUser,
  //         imagen: login.data.imagen,
  //         login: true,
  //         rol: login.data.rol
  //       }
  //     } else {
  //       this.clientLogin = {
  //         name: '',
  //         imagen: '',
  //         login: false,
  //         rol: ''
  //       }
  //       this.counterCar = 0;
  //     }
  //   });
  //   return auth;
  // }

   async isAutenticatedClient(configuracion) {
    let auth;
    await this.webService.isAuthenticatedClient(configuracion?.loginStorage).then((login: any) => {
      auth = login;
      if (login.rta == true) {
        this.clientLogin = {
          name: login.data.nameUser,
          imagen: login.data.imagen,
          login: true,
          rol: login.data.rol
        }
      } else {
        this.clientLogin = {
          name: '',
          imagen: '',
          login: false,
          rol: ''
        }
        this.counterCar = 0;
      }
    });
    return auth;
  }

  async signOff() {

    await this.webService.signOuth(this.configuracion.loginStorage).then((resClose: any) => { });

    // localStorage.removeItem(this.configuracion.loginStorage);
    this.auth.logout(this.configuracion.loginStorage);
    this.webService.saveToLocalStorage('carCount', 0);
    this.counterCar = 0;
    this.cartProducts = {
      number: 0,
      total: 0.00
    }
    // await this.webService.goHome();
    // await this.webService.refreshPage(this.configuracion);
    await this.isAutenticatedClient(this.configuracion).then(async (resauth: any) => {
      // Obtener productos del carrito y su total
      if (resauth.rta == true) {
        await this.webService.getproductsCart({ id_cliente: resauth.data.PersonaComercio_cedulaRuc }).then(async (resprod: any) => {
          this.arrayProduct = resprod.data;
          console.log('PRODUCTOS ALL ====> ', this.arrayProduct);

          this.cartProducts = {
            number: resprod.data.length,
            total: await this.webService.calculateTotalCartProducts(resprod.data)
          }
        });
        console.log('total =======> ', this.cartProducts);

      }
      console.log('ESTA DESLOGUEADO');


      localStorage.setItem('isLoged', 'false');
      if (this.information.esPuntoVenta == 1) {
        // this.router.navigateByUrl('catalogo')
        this.router.navigateByUrl(this.currentRoute);
        // this.flagCarLocal=true;
        this.webService.saveToLocalStorage('carLocal', 0);
      } else {
        // this.router.navigateByUrl('ecommerce')
        this.router.navigateByUrl(this.currentRoute);

      }
    });
  }

  getInitials(fullName) {
    // Dividir el nombre completo en un array de palabras
    const names = fullName.trim().split(' ');

    // Obtener la inicial del primer nombre
    const firstInitial = names[0].charAt(0);

    // Obtener la inicial del primer apellido (primera palabra después del/los nombre/s)
    // Asumimos que el último o penúltimo elemento es el apellido
    const lastNameInitial = names[names.length - (names.length > 2 ? 2 : 1)].charAt(0);
    // console.log('AQUI', fullName);
    // console.log('firstInitial', firstInitial);
    // console.log('lastNameInitial', lastNameInitial);

    // Retornar las iniciales en mayúsculas
    return (firstInitial + lastNameInitial).toUpperCase();
  }

  async goClientProfile() {
    await this.webService.isAuthenticatedClient(this.configuracion.loginStorage).then(async (reslogin: any) => {
      if (reslogin.rta == true) {
        if (reslogin.data.rol == 'Client') {
          this.webService.goUserProfile();
          this.router.navigateByUrl('admin_usuario/perfil');
          // console.log("ar al cliente");
        }
        if (reslogin.data.rol == 'Administrator') {
          this.router.navigateByUrl('administrador/datos_generales');

          // this.webService.goAdminProfile();
          // console.log("ar al administrador");
        }
      }
    });
  }

  async toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
    this.loading = true;
    this.flagLoader = true;
    console.log('-----> ', this.clientLogin);
    console.log('-----> ', this.clienteLogin2);
    if (this.clienteLogin2) {
      await this.webService.getproductsCart({ id_cliente: this.clienteLogin2.user.PersonaComercio_cedulaRuc, bodega: this.configuracion.id_bodega }).then(async (rescart: any) => {
        console.log('RESSSSS ', rescart);
        if(rescart.rta){
  this.arrayProduct = rescart.products;
        if (this.arrayProduct.length > 0) {

          const productosAgrupados = this.arrayProduct.reduce((acumulador, productoActual) => {
            // Buscamos si ya existe un grupo para este id_producto
            const grupoExistente = acumulador.find(p => p.id_producto === productoActual.id_producto);

            if (grupoExistente) {
              // Si existe, incrementamos la cantidad
              grupoExistente.quantity += productoActual.quantity;
            } else {
              // Si no existe, añadimos el producto al acumulador
              acumulador.push({ ...productoActual });
            }

            return acumulador;
          }, []);

          // this.arrayProduct = result
          // this.arrayProduct = this.util.addOrUpdateProduct( this.arrayProduct, object)
          // arrayProduct.push(arrayProduct);
          this.flagLoader = false;
          this.arrayProduct = productosAgrupados;
          console.log('Array Product', this.arrayProduct);
        }
        }else{
          // this.isDrawerOpen = !this.isDrawerOpen;
          this.alert.alertWarning('','Carrito Vacío');
           this.flagLoader = false;
        }
      
      });
    }




    // this.webService.saveToLocalStorage('products', this.arrayProduct)
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  subTotal(array) {
    let subTotal = 0;
    for (let a of array) {
      subTotal += parseFloat(a.precioReal) * a.quantity;
    }
    return subTotal
  }

  async updateCarNow(event) {
    this.loading = true;
    this.flagLoader = true;
    console.log('event');
    if (event) {
      await this.webService.getproductsCart({ id_cliente: this.clienteLogin2.user.PersonaComercio_cedulaRuc, bodega: this.configuracion.id_bodega }).then(async (rescart: any) => {
        console.log('RESSSSS ', rescart);
        this.arrayProduct = rescart.products;
        if (this.arrayProduct.length > 0) {

          const productosAgrupados = this.arrayProduct.reduce((acumulador, productoActual) => {
            // Buscamos si ya existe un grupo para este id_producto
            const grupoExistente = acumulador.find(p => p.id_producto === productoActual.id_producto);

            if (grupoExistente) {
              // Si existe, incrementamos la cantidad
              grupoExistente.quantity += productoActual.quantity;
            } else {
              // Si no existe, añadimos el producto al acumulador
              acumulador.push({ ...productoActual });
            }

            return acumulador;
          }, []);

          // this.arrayProduct = result
          // this.arrayProduct = this.util.addOrUpdateProduct( this.arrayProduct, object)
          // arrayProduct.push(arrayProduct);
          this.flagLoader = false;
          this.arrayProduct = productosAgrupados;
          console.log('Array Product', this.arrayProduct);
        }
      });
    }

  }

  async quantityProduct(tipo, product) {
    await this.webService.settingQuantityProduct(tipo, product).then(async (resQuant) => {
      console.log('ENTRA METODO', resQuant);
      
      if (resQuant.rta == true) {
        this.loading = true;
        await this.webService.createDataInsertProductCart(product,this.clienteLogin2.user, '').then(async (resinsert: any) => {
          console.log('AGREGAR CARRITO 1 ', resinsert);
          console.log('datos que van', product.id_carrito);
          console.log('PROD', product);
          const { id, ...newObject } = resinsert;

          // await this.webService.updateProductsCart(product.id_carrito, resinsert).then(async (resupd: any) => {
          await this.webService.putGeneral2("https://www.pulpoplace.com:8448/carrito/update/" + product.id_carrito, newObject).subscribe(async (resupd: any) => {
            console.log('AGREGAR CARRITO 2 ', resupd);
            
            if (resupd.rta == true) {
              product = resQuant.data;
              let counter = parseFloat(localStorage.getItem('carCount')) ;
              if(tipo=='quit'){
                
                counter -= 1;
                console.log('QUITA');
                
                // localStorage.setItem('carCount', JSON.stringify(counter));
                this.webService.saveToLocalStorage('carCount', counter);
              }else{
                console.log('AGREGA');

                counter += 1;
                // localStorage.setItem('carCount', JSON.stringify(counter));
                this.webService.saveToLocalStorage('carCount', counter);

              }

              console.log('carrito', resupd);
                
                
              // await this.service.calculateTotalCartProducts2(this.shoppingCart).then((restot) => {
              //   console.log('total', restot);
              //   this.totalCart = restot;
              // });
     
              // await this.service.updateObservableShoppingCart(this.user).then((res) => { });
            } else {
              this.alert.alertDanger('Algo sucedió, intente nuevamente', '');
            }
          });
        });
        this.loading = false;
      } else {
        this.alert.alertWarning(resQuant.message, '');
      }
    });
  }

  callQuitProduct(data){
    console.log('llega --> ', data);
    
    this.quantityProduct(data.type, data.product)
  }

  goToCheckout(){
    this.router.navigateByUrl('carrito')
  }

}
