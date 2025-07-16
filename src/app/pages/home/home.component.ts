import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { ServiceService } from '../../services/service.service';
import { environment } from '../../environments/environment';
import { CatalogoComponent } from "../../shared/catalogo/catalogo.component";
import { CarouselComponent } from "../../shared/carousel/carousel.component";
import { CardComponent } from "../../shared/card/card.component";
import { CardCommonComponent } from "../../shared/card-common/card-common.component";
import { FooterComponent } from '../../shared/footer/footer.component';
import { NgxLoadingModule } from 'ngx-loading';
import { RenderComponent } from '../../shared/render/render.component';
import { UtilsService } from '../../services/utils.service';
import { DetailProductComponent } from "../../shared/detail-product/detail-product.component";
import Glide from '@glidejs/glide';
import { OffertsComponent } from '../../shared/all-cards/offerts/offerts.component';
import { StylesService } from '../../services/styles.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeaderComponent, CatalogoComponent, CarouselComponent,
    CardComponent, CardCommonComponent, FooterComponent, OffertsComponent,
    RenderComponent, NgxLoadingModule, DetailProductComponent, DetailProductComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  //Variables Globales
  urlBase = environment.firebaseUrl;
  idEmpresa = environment.idShop;
  idShop = environment.idShop;
  information: any = [];
  configuracion: any = [];
  banners: any = [];
  flagLoader = false;
  productsSold = [];
  urlBilling = environment.urlBilling;
  productosR = [];
  productos = [];
  oferts = [];
  groups = [];
  public promocionesWeb = {
    promociones: [],
    titulo: ''
  }
  //COLORES CONFIG
  colorMain: any;
  imgLogo: any;

  public login: any = {};
  flagRender = false;
  titleRender: any;
  productSelect: any;
  productSelectSend: any;

  // See Detail Product
  public configurationVariables = {
    tipo_precio: 'pA', // No se esta usando
    mostrar_precio: 1,
    show_attributes_prod: false
  }

  modal: any;




  constructor(
    private webService: ServiceService,
    private util: UtilsService,
    private stylesService: StylesService, // Agregar esta línea

  ) {
  }


  async ngOnInit() {

    window.scrollTo({ top: 0, behavior: 'smooth' });
    await this.getConfiguracion();
    await this.getDataEmpresa();
    await this.getInformacion();
    await this.getBanners();
    await this.getProductPopularSold();
    await this.getNewProducts();
    await this.getOferts();
    await this.getPromocionesWeb();
  }

  ngAfterViewInit(): void {

    document.querySelectorAll('#glide3').forEach((element) => {
      let glideInstance = new Glide(element, {
        type: 'carousel',
        perView: 1,
        breakpoints: {
          600: {
            perView: 1
          },
          800: {
            perView: 2
          },
          1080: {
            perView: 3
          },
          1366: {
            perView: 4
          },
          1900: {
            perView: 4,
          },
          1920: {
            perView: 5,
          }
        }
      })
      glideInstance.mount()
    })
  }

  async getConfiguracion() {
    await this.webService.getGeneral(`configuracion/${this.idEmpresa}`).subscribe({
      next: (resp: any) => {
        console.log('resp config', resp);
        this.configuracion = resp[0];
        console.log('AQUI ES EL PRIMER PASO EN HOME', this.configuracion);

        this.webService.isAuthenticatedClient(this.configuracion.loginStorage).then((resauth: any) => {
          console.log('PRIMERA VEZ QUE LOGUEO',resauth );
          
          this.login = resauth;
          console.log('login ---> ', this.login);

          if (resauth.rta == true) {
            this.configurationVariables.mostrar_precio = 1;
          } else {
            this.configurationVariables.mostrar_precio = this.configuracion.mostrar_precio;
          }
        });

        this.configurationVariables.show_attributes_prod = this.webService.showAtttibutesProducts(this.configuracion);

        let color = this.configuracion.colorPrincipal;
        this.colorMain = color;
        this.imgLogo = this.configuracion.imgLogo;

        // Usar el servicio de estilos en lugar de aplicar directamente
        this.stylesService.updateConfiguration(this.configuracion);
      }
    });
  }


  // 2. Get Data Empresa 
  async getDataEmpresa() {

  }
  // 3. Get Configuracion 
  async getInformacion() {
    await this.webService.getGeneral(`informacions/${this.idEmpresa}`).subscribe((resinfo: any) => {
      this.information = resinfo[0];
      // console.log('information.mision',this.information); 
      // this.companyNane = resinfo[0]?.nombre;
      let color = this.information.colorLetraSlogan;
      let colorLetraSecundario = this.configuracion.colorLetraSecundario;
      // console.log('color', color); 
      document.documentElement.style.setProperty('--color-font-portada', color);
      document.documentElement.style.setProperty('--color-letter-secondary', colorLetraSecundario);
    });
  }

  // 4. Get Banners
  async getBanners() {
    await this.webService.getGeneral("imagenes-banners/" + this.idEmpresa).subscribe({
      next: (resp: any) => {
        this.banners = resp;
      }, error: (err: any) => {
        this.flagLoader = false;
      },
      complete: () => {
      },
    })
  }

  // 5. Products Sold
  async getProductPopularSold() {

    await this.webService.getTemporaryProductsPopular().then(async (restemp: any) => {
      // console.log(restemp);

      if (restemp.rta == true) {
        this.productsSold = restemp.data;
        console.log('PRODUCTO SOLD', this.productsSold);

      } else {
        await this.webService.getProductPopularSoldService(this.urlBilling, this.configuracion).then(async (respopular: any) => {
          console.log(respopular);

          if (!respopular.error) {
            console.log("ENTRA ", this.configuracion);

            if (respopular.rta) {

              if (this.configuracion.tipo_web == 1) {
                await this.webService.obtainAndCalculatePriceProduct(respopular.data, this.configuracion, this.login).then(async (resPrice) => {
                  this.productsSold = resPrice;
                });
              }

              if (this.configuracion.tipo_web == 2) {
                console.log('login', this.login);

                // let prod;
                // prod = await this.webService.deleteProductsDuplicated(respopular.data, 'tagDeGrupo');
                await this.webService.obtainAndCalculatePriceProduct(respopular.data, this.configuracion, this.login).then(async (resPrice) => {
                  await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
                    this.productsSold = resTalla;
                  });

                  // await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
                  //   await this.webService.deleteProductsDuplicated(resTalla, 'tagDeGrupo').then((resProd) => {
                  //     this.productsSold = resProd;
                  //   });
                  // });
                });
              }
              await this.webService.saveTemporaryProductsPopular(true, this.productsSold);
            } else {
              await this.webService.saveTemporaryProductsPopular(true, respopular.data);
              // this.toaster.warning('No se ha encontrado productos mas vendidos', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
            }
          } else {
            // this.toaster.error('Error al conectar con el servidor', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
          }
        });
      }
    });
    // console.log("mas vendidos",  this.productsSold);
  }

  // 6. Get Productos Nuevos
  async getNewProducts() {
    await this.webService.getTemporaryProductosNew().then(async (resnew: any) => {
      if (resnew.rta == true) {
        this.productosR = resnew.data;
        console.log("productosR", this.productosR);

      } else {
        await this.getProductosNew().then(async (resProdNew: any) => {
          // console.log("nuevos", resProdNew);
          await this.webService.saveTemporaryProductosNew(true, resProdNew);
          if (resProdNew.length > 0) {
            this.productosR = resProdNew;
            console.log("productosR", this.productosR);
          } else {
            // this.toaster.warning('Actualmente la Tienda no posee productos nuevos.', '', { timeOut: 3000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
          }
        });
      }
    });
  }

  //7. Promociones
  async getOferts() {
    // Obtener productos de promocion billing
    await this.webService.getTemporaryPromotions().then(async (respromotion: any) => {
      if (respromotion.rta == true) {
        this.oferts = respromotion.data;
      } else {
        await this.getProductospromocion().then(async (resProdProm: any) => {
          // console.log("promociones", resProdProm);
          this.webService.saveTemporaryPromotions(true, resProdProm);
          if (resProdProm.length > 0) {
            this.oferts = resProdProm;
          } else {
            // this.toaster.warning('Actualmente la Tienda no posee productos de promoción.', '', { timeOut: 3000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
          }
        });
      }
    });
  }

  //8. GRUPOS
  async getGroupsCatalogue(event) {
    this.groups = event;
    console.log('TODOS LOS GRUPOS', this.groups);

  }

  async getProductosNew() {
    let products;
    this.flagLoader = true;

    if (this.configuracion.tipo_web == 1) {
      // console.log("Tienda normal");
      await this.webService.getProductosNewService(this.urlBilling, this.configuracion, 0).then(async (resProdProm: any) => {
        if (resProdProm.rta == true) {
          await this.webService.obtainAndCalculatePriceProduct(resProdProm.data, this.configuracion, this.login).then(async (resPrice) => {
            products = resPrice;
          });
        } else {
          products = []
        }
      });
    }

    if (this.configuracion.tipo_web == 2) {
      // console.log("Tienda por tallas", this.configuracion.tipo_web);
      // let prod;
      await this.webService.getProductosNewService(this.urlBilling, this.configuracion, 40).then(async (resProdProm: any) => {
        if (resProdProm.rta == true) {
          // prod = await this.webService.deleteProductsDuplicated(resProdProm.data, 'tagDeGrupo');
          await this.webService.obtainAndCalculatePriceProduct(resProdProm.data, this.configuracion, this.login).then(async (resPrice) => {
            await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
              products = resTalla;
            });
          });
        } else {
          products = [];
        }
      });
    }

    if (this.configuracion.tipo_web == 3) {
      console.log("Tienda con 2 BD, codigo se encuentra en proceso");
      let data1;
      let data2;
      products = [];
      await this.webService.getProductosNewService(this.urlBilling, this.configuracion, 5).then((resProdProm: any) => {
        data1 = resProdProm.data;
      });

      await this.webService.getProductosNewService(this.urlBilling, this.configuracion, 5).then((resProdProm2: any) => {
        data2 = resProdProm2.data;
      });

      await this.webService.unifyProductosDosUrls(data1, data2).then(async (resProd) => {
        let aux = 4;
        let d1;
        let d2;
        if (resProd.length < 10) {
          console.log("entro al if");
          while (resProd.length < 10) {
            await this.webService.getProductosNewService(this.urlBilling, this.configuracion, aux).then(async (resProdProm: any) => {
              d1 = resProdProm.data;
            });

            await this.webService.getProductosNewService(this.urlBilling, this.configuracion, aux).then(async (resProdProm2: any) => {
              d2 = resProdProm2.data;
            });

            await this.webService.unifyProductosDosUrls(d1, d2).then(async (resProd) => {
              await this.webService.obtainAndCalculatePriceProduct(resProd, this.configuracion.porcentajePrecioOferta, this.login).then(async (resPrice) => {
                products = resPrice;
              });
            });
            aux = aux + 1;
          }
        } else {
          console.log("entro al else");
          await this.webService.obtainAndCalculatePriceProduct(resProd, this.configuracion.porcentajePrecioOferta, this.login).then(async (resPrice) => {
            products = resPrice;
          });
        }
      });
    }

    if (this.configuracion.tipo_web == 4) {
      console.log("Tienda Internet");
      products = [];
    }

    // this.webService.orderObjectsAsc(products).then((resprod) => {
    //   // console.log("order", resprod);
    // });
    // console.log("PRODUCTOS", products);
    if (!products) {
      products = []
      // console.log('debe hacer algo');
      // location.reload();
      // this.toaster.warning('Actualmente la Tienda no posee productos de promoción.', '', { timeOut: 3000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });


    }
    // Cuando hay 3 resultados, dejar todo el nombre
    if (products.length <= 3) {
      for (let p of products) {
        p.nombre_producto = p.pro_nom;
      }
    } else {
      for (let p of products) {
        p.nombre_producto = p.pro_nom;
      }
    }



    this.flagLoader = false;

    return products;

  }

  // tipoWeb = 1 => Tienda normal 
  // tipoWeb = 2 => Tienda por tallas 
  // tipoWeb = 3 => Tienda con 2 BD   ** Supendido por el momento **
  // tipoWeb = 4 => Tienda Internet
  // async getProductospromocion() {
  //   let products;
  //   this.flagLoader = true;
  //   if (this.configuracion.tipo_web == 1) {
  //     console.log("Tienda normal");
  //     await this.webService.getProductosPromocionService(this.urlBilling, this.configuracion).then(async (resProdProm: any) => {
  //       if (resProdProm.rta == true) {
  //         await this.webService.obtainAndCalculatePriceProduct(resProdProm.data, this.configuracion, this.login).then(async (resPrice) => {
  //           products = resPrice;
  //         });
  //       } else {
  //         products = [];
  //         // this.toaster.warning('Actualmente, la tienda no posee productos de promoción.', '', { timeOut: 3000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
  //       }
  //     });
  //   }
  //   if (this.configuracion.tipo_web == 2) {
  //     console.log("Tienda por tallas");
  //     await this.webService.getProductosPromocionService(this.urlBilling, this.configuracion).then(async (resProdProm: any) => {
  //       if (resProdProm.rta == true) {
  //         await this.webService.obtainAndCalculatePriceProduct(resProdProm.data, this.configuracion, this.login).then(async (resPrice) => {
  //           await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
  //             products = resTalla;
  //           });
  //         });
  //       } else {
  //         products = [];
  //       }
  //     });
  //   }

  //   if (this.configuracion.tipo_web == 3) {
  //     console.log("Tienda con 2 BD, codigo se encuentra en proceso");
  //      products = []
  //     //  products = []
  //   }

  //   if (this.configuracion.tipo_web == 4) {
  //     console.log("Tienda Internet");
  //      products = []
  //   }

  //   // Cuando hay 3 resultados, dejar todo el nombre
  //   console.log('PRODUCTS ====> ', products);

  //      if(!products){
  //     products = []

  //   }

  //   if (products.length <= 3) {
  //     for (let p of products) {
  //       p.nombre_producto = p.pro_nom;
  //     }
  //   }else{
  //     for (let p of products) {
  //       p.nombre_producto = p.pro_nom;
  //     }
  //   }

  //   // console.log("Productos Promocion", products);
  //   this.flagLoader = false;
  //   return products;
  // }
  async getProductospromocion() {
    let products = []; // Inicializar como array vacío
    this.flagLoader = true;

    try {
      if (this.configuracion.tipo_web == 1) {
        // console.log("Tienda normal");
        await this.webService.getProductosPromocionService(this.urlBilling, this.configuracion).then(async (resProdProm: any) => {
          if (resProdProm.rta == true) {
            await this.webService.obtainAndCalculatePriceProduct(resProdProm.data, this.configuracion, this.login).then(async (resPrice) => {
              products = resPrice || [];
            });
          } else {
            products = [];
            // this.toaster.warning('Actualmente, la tienda no posee productos de promoción.', '', { timeOut: 3000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
          }
        }).catch(() => {
          products = [];
        });
      }

      if (this.configuracion.tipo_web == 2) {
        // console.log("Tienda por tallas");
        await this.webService.getProductosPromocionService(this.urlBilling, this.configuracion).then(async (resProdProm: any) => {
          if (resProdProm.rta == true) {
            await this.webService.obtainAndCalculatePriceProduct(resProdProm.data, this.configuracion, this.login).then(async (resPrice) => {
              await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
                products = resTalla || [];
              });
            });
          } else {
            products = [];
          }
        }).catch(() => {
          products = [];
        });
      }

      if (this.configuracion.tipo_web == 3) {
        console.log("Tienda con 2 BD, codigo se encuentra en proceso");
        // Implementar lógica aquí o asegurar que products mantenga su valor inicial []
        products = [];
      }

      if (this.configuracion.tipo_web == 4) {
        console.log("Tienda Internet");
        // Implementar lógica aquí o asegurar que products mantenga su valor inicial []
        products = [];
      }

      // Asegurar que products sea siempre un array
      if (!Array.isArray(products)) {
        products = [];
      }

      // Cuando hay 3 resultados, dejar todo el nombre
      console.log('PRODUCTS ====> ', products);

      if (products.length <= 3) {
        for (let p of products) {
          p.nombre_producto = p.pro_nom;
        }
      } else {
        for (let p of products) {
          p.nombre_producto = p.pro_nom;
        }
      }

    } catch (error) {
      console.error('Error en getProductospromocion:', error);
      // console.error('Error en getProductospromocion:', error);
      products = [];
    }

    // console.log("Productos Promocion", products);
    this.flagLoader = false;
    return products;
  }

  async getPromocionesWeb() {
    await this.webService.getPromocionesWeb().then((resProm: any) => {
      if (resProm) {
        for (let p of resProm) {
          p.target = '#' + p.id_promocion;
          p.view = false;

          if (resProm.length > 2) {
            // Titulo
            p.titulo = this.webService.setDescriptionTitle(p.nombrePromocion, 'title-promotion');
            // Descripcion
            if (p.descripcion) {
              if (p.descripcion.length > 70) {
                p.preliminar = p.descripcion.slice(0, 65) + ' ...';
                p.vermas = true;
              } else {
                p.preliminar = p.descripcion;
                p.vermas = false;
              }
            } else {
              p.preliminar = '';
              p.vermas = false;
            }
          } else {
            // Titulo
            p.titulo = p.nombrePromocion;
            // Descripcion
            if (p.descripcion) {
              p.preliminar = p.descripcion;
              p.vermas = false;
            } else {
              p.preliminar = '';
              p.vermas = false;
            }
          }
        }
      }
      this.promocionesWeb.promociones = resProm;
      //BTN CARD


    });
    console.log("this.promocionesWeb", this.promocionesWeb);
  }


  isEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  scrollToElement($element: any): void {
    // // //// ////////console.log()($element);
    setTimeout(() => {
      $element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      // this.listarTodos1();    
    }, 500);
  }

  seeNewAddProduct(prods, titleRender) {
    console.log('prods', prods);

    this.productos = prods;
    this.flagRender = true;
    this.titleRender = titleRender;
    let send = {
      product: '',
      configuracion: this.configuracion,
      show_price: this.configurationVariables.mostrar_precio,
      show_attributes_product: this.configurationVariables.show_attributes_prod,
      login: this.login,
      productsSold: this.productsSold
    }
    this.productSelectSend = send;
    this.stylesService.forceApplyStyles();

    window.scrollTo({ top: 0, behavior: 'smooth' });

  }
  changeView(event) {
    console.log(event);

    this.flagRender = event;
    this.stylesService.forceApplyStyles();

  }

  openDetailProduct() {
    console.log('Presiono entra aqui ');

  }


  // ------------------------ VISTA MODALES ----------------------------
  viewModalProduct(event) {
    console.log('llega EVENT 2 ===>', event);
    let send = {
      product: event,
      configuracion: this.configuracion,
      show_price: this.configurationVariables.mostrar_precio,
      show_attributes_product: this.configurationVariables.show_attributes_prod,
      login: this.login,
      productsSold: this.productsSold
    }
    this.productSelect = send;
    console.log('send', this.productSelect);
    this.openModal('#modalProduct');
  }

  viewModalProductSM(event) {
    console.log('llega EVENT 2 ===>', event);
    let send = {
      product: event,
      configuracion: this.configuracion,
      show_price: this.configurationVariables.mostrar_precio,
      show_attributes_product: this.configurationVariables.show_attributes_prod,
      login: this.login,
      productsSold: this.productsSold
    }
    this.productSelect = send;
    console.log('send', this.productSelect);
    this.openModal('#popup-modal');
  }

  viewModalProductAR(event) {
    console.log('llega EVENT ===>', event);
    let send = {
      product: event,
      configuracion: this.configuracion,
      show_price: this.configurationVariables.mostrar_precio,
      show_attributes_product: this.configurationVariables.show_attributes_prod,
      login: this.login,
      productsSold: this.productsSold
    }
    this.productSelect = send;
    console.log('send', this.productSelect);
    this.openModal('#modalProduct');

  }

  // METODOS MODALES
  openModal(name) {
    this.modal = this.util.createModal(name);
    this.modal.show();
  }

  closeModal() {
    this.modal.hide();
  }


  closeModalTrue(flag: boolean, name: string) {
    let modal = this.util.createModal(name);

    if (flag) {
      modal.hide();
    } else {
      modal.hide();
    }
  }

  viewDetail() {
    console.log('da click');

  }

  seeDetail(prod) {
    let send = {
      product: prod,
      configuracion: this.configuracion,
      show_price: this.configurationVariables.mostrar_precio,
      show_attributes_product: this.configurationVariables.show_attributes_prod,
      login: this.login,
      productsSold: this.productsSold
    }
    this.productSelect = send;
    this.openModal('#modalProduct');

  }
  clampText(d) {

  }
  calculateDescount(num, num2) {

  }

  openALGO() {
    console.log('DA CLIC');
  }

  numberTwoDecimals(number) {
    return this.util.dosDecimales(number)
  }

}
