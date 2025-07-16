import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginRegisterComponent, SidebarLayoutComponent, SidebarLayoutRigthComponent],
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

  constructor
    (
      private webService: ServiceService,
      private util: UtilsService,
      private router: Router,
      private activatedRoute: ActivatedRoute,
      private carBehavior: CarServiceService,

    ) {
    this.carBehavior.products$.subscribe((product: Product[]) => {
      this.producto = product
      this.arrayOrden = this.producto;
      let result = this.util.groupProductsAndSumQuantityReduce(this.arrayOrden);
      console.log('result ', result);
      this.arrayProduct = result;
      console.log('HEADER ', this.arrayOrden);

    })
     this.carBehavior.productBehaviorSubject(this.arrayProduct)

    if(this.arrayProduct.length==0){
    //   let result = JSON.parse(localStorage.getItem('products'));
    //   console.log('RESULTADO ', result);
    //   this.arrayOrden = result
    //   // if(result){
    //     this.arrayProduct=this.arrayOrden
    //   // }


    }
   
  }
  async ngOnChanges(changes: SimpleChanges) {
    console.log('changes ==> ', changes);

    this.configuracion = changes['configuracion'].currentValue;
    this.logo = this.configuracion?.imgLogo;

    console.log('====> ', this.configuracion);
    this.storageSubscription = this.webService
      .getStorageObservable()
      .subscribe((data) => {
        console.log('data', data);
        if (data.key === this.configuracion.loginStorage) {
          this.clientLogin = data.data
        } else {
          this.counterCar = data.data;
        }
      });
  }

  async ngOnInit() {
    console.log('CONFIGURATION HEADER ngOnInit ================> ', this.configuracion);
    this.storageSubscription = this.webService
      .getStorageObservable()
      .subscribe((data) => {
        console.log('data', data);
        if (data.key === this.configuracion.loginStorage) {
          this.clientLogin = data.data
        } else {
          this.counterCar = data.data;
        }
      });
    this.currentRoute = this.activatedRoute.snapshot.url.join('/');
    console.log('ruta actual', this.currentRoute);

    let color = this.configuracion.colorPrincipal;
    let colorLetra = this.configuracion.colorLetra;
    let lighterTone = this.util.hexToRgba(color, 0.2)
    document.documentElement.style.setProperty('--dynamic-color', color);
    document.documentElement.style.setProperty('--font-color-letter', colorLetra);
    document.documentElement.style.setProperty('--lighterTone', lighterTone);

    this.clientLogin = this.webService.getFromLocalStorage(this.configuracion.loginStorage);
    console.log('REcupera == > Login', this.clientLogin);

            await this.webService.isAuthenticatedClient(this.configuracion.loginStorage).then((login: any) => {
              console.log('LOGIN ', login);
              
          if (login.rta == true) {
            // this.user = login.data;
            // this.addressDeliveryData.client = this.user;
          } else {
            //console.log("no se ha encontrado login");
          }
        });

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

  async isAutenticatedClient(configuracion) {
    console.log('LLEGA CONFIG BIEN', configuracion);


    let auth;
    await this.webService.isAuthenticatedClient(configuracion?.loginStorage).then(async (login: any) => {
      console.log('entra ******** ', login);

      auth = await login;
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

    localStorage.removeItem(this.configuracion.loginStorage);

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

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;

    // if (localStorage.getItem('products')) {
    //   this.arrayProduct = JSON.parse(localStorage.getItem('products'));
    // }
    let result = this.util.groupProductsAndSumQuantityReduce(this.arrayOrden);
    console.log('result ', result);

    this.arrayProduct = result
    // this.arrayProduct = this.util.addOrUpdateProduct(arrayProduct, product)
    // arrayProduct.push(arrayProduct);
    console.log('Array Product', this.arrayProduct);

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

}
