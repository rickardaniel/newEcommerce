import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { ServiceService } from '../../services/service.service';
import { environment } from '../../environments/environment';
import { StylesService } from '../../services/styles.service';
import { NgxLoadingModule } from 'ngx-loading';
import { UtilsService } from '../../services/utils.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NgxLoadingModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.scss'
})
export class CarritoComponent {
  information: any = [];
  configuracion: any = [];
  idEmpresa = environment.idShop;
  public clientLogin = {
    name: '',
    imagen: '',
    login: false,
    rol: ''
  }
  clienteLogin2: any = [];
  arrayProduct: any = [];
  flagLoader = false;
  urlFB = environment.firebaseUrl;
  prodSelected: any = [];
  numberProducts = 0;
  user: any;

  esLocal = 0
  flagLocal = true

  constructor
    (
      private webService: ServiceService,
      private stylesService: StylesService,
      private util: UtilsService,
      private alert: AlertService,
      private router: Router,
    ) {
  }

  ngOnInit() {
    this.getConfiguracion();
    this.getInformacion();
  }


  async getConfiguracion() {
    await this.webService.getGeneral(`configuracion/${this.idEmpresa}`).subscribe({
      next: (resp: any) => {
        console.log('resp config', resp);
        this.configuracion = resp[0];
        console.log('AQUI ES EL PRIMER PASO EN HOME', this.configuracion);
        let user = JSON.parse(localStorage.getItem(this.configuracion.loginStorage));
        this.user = user;
        console.log('user ===> ', user);
        this.getShoppingCart(user)

        // this.login = user;
        // this.webService.isAuthenticatedClient(this.configuracion.loginStorage).then((resauth: any) => {
        //   console.log('PRIMERA VEZ QUE LOGUEO',resauth );

        // Usar el servicio de estilos en lugar de aplicar directamente
        this.stylesService.updateConfiguration(this.configuracion);
      }
    });
  }

  async getInformacion() {
    await this.webService.getGeneral(`informacions/${this.idEmpresa}`).subscribe((resinfo: any) => {
      this.information = resinfo[0];
    });
  }

  async getShoppingCart(user) {
    this.flagLoader = true;
    console.log('user ===> ', user);
    if (user) {
      await this.webService.getproductsCart({ id_cliente: user.user.PersonaComercio_cedulaRuc, bodega: this.configuracion.id_bodega }).then(async (rescart: any) => {
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

          for (let prod of this.arrayProduct) {
            this.numberProducts += prod.quantity;
          }
          console.log('Array Product', this.arrayProduct);
        }
      });
    }
  }

  isEmpty(obj: any): boolean {
    return obj == null || (typeof obj === 'object' && Object.keys(obj).length === 0);
  }

  openModal(name, prod) {
    this.prodSelected = prod
    let modal = this.util.createModal(name);
    modal.show();
  }

  closeModal(name) {
    let modal = this.util.createModal(name);
    modal.hide();
  }

  async deleteProduct(id_carrito) {
    await this.webService.deleteProductCart(id_carrito).then(async (resdel: any) => {
      console.log('resdel', resdel);
      if (resdel) {
        this.alert.alertSuccess('', 'Producto eliminado');
        this.closeModal('#deleteProduct');
        await this.webService.getproductsCart({ id_cliente: this.user.user.PersonaComercio_cedulaRuc, bodega: this.configuracion.id_bodega }).then(async (rescart: any) => {
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
    })

  }

  async quantityProduct(tipo, product) {
    this.flagLoader = true;
    await this.webService.settingQuantityProduct(tipo, product).then(async (resQuant) => {
      console.log('ENTRA METODO', resQuant);

      if (resQuant.rta == true) {

        await this.webService.createDataInsertProductCart(product, this.user.user, '').then(async (resinsert: any) => {
          console.log('AGREGAR CARRITO 1 ', resinsert);
          console.log('datos que van', product.id_carrito);
          console.log('PROD', product);
          const { id, ...newObject } = resinsert;

          // await this.webService.updateProductsCart(product.id_carrito, resinsert).then(async (resupd: any) => {
          await this.webService.putGeneral2("https://www.pulpoplace.com:8448/carrito/update/" + product.id_carrito, newObject).subscribe(async (resupd: any) => {
            console.log('AGREGAR CARRITO 2 ', resupd);

            if (resupd.rta == true) {
              product = resQuant.data;
              let counter = parseFloat(localStorage.getItem('carCount'));
              if (tipo == 'quit') {

                counter -= 1;
                console.log('QUITA');

                // localStorage.setItem('carCount', JSON.stringify(counter));
                this.webService.saveToLocalStorage('carCount', counter);
              } else {
                console.log('AGREGA');

                counter += 1;
                // localStorage.setItem('carCount', JSON.stringify(counter));
                this.webService.saveToLocalStorage('carCount', counter);

              }

              console.log('carrito', resupd);
              this.alert.alertSuccess('', 'Carrito modificado');
              this.flagLoader = false;
              // await this.service.calculateTotalCartProducts2(this.shoppingCart).then((restot) => {
              //   console.log('total', restot);
              //   this.totalCart = restot;
              // });

              // await this.service.updateObservableShoppingCart(this.user).then((res) => { });
            } else {
              this.alert.alertDanger('Algo sucedió, intente nuevamente', '');
              this.flagLoader = false;
            }
          });
        });

      } else {
        this.flagLoader = false;
        this.alert.alertWarning(resQuant.message, '');
      }
    });
  }

   setOption(event: any) {
    console.log('event bandera', event)
    this.flagLocal = event
    if (!this.flagLocal) {
      console.log('agrega')
      this.esLocal = 1
    } else {
      this.esLocal = 0
    }
    console.log('valor esDomicilio', this.esLocal)
  }

  goToPage(){
    this.router.navigateByUrl('products')
  }

  openModal2(name){
    let modal= this.util.createModal(name);
    modal.show();
  }

}
