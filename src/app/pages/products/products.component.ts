import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { ServiceService } from '../../services/service.service';
import { environment } from '../../environments/environment';
import { CatalogoComponent } from "../../shared/catalogo/catalogo.component";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { CardGeneralComponent } from "../../shared/card-general/card-general.component";
import { DetailProductComponent } from '../../shared/detail-product/detail-product.component';
import { UtilsService } from '../../services/utils.service';
import { NgxLoadingModule } from 'ngx-loading';
import { CommonModule } from '@angular/common';
import { StylesService } from '../../services/styles.service';
import { SidebarLayoutComponent } from '../../shared/sidebar-layout/sidebar-layout.component';
let apiLoaded = false;

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [SidebarLayoutComponent, CommonModule, HeaderComponent, CatalogoComponent, CardGeneralComponent, DetailProductComponent, NgxLoadingModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, OnChanges {

  rutaUrl = environment.firebaseUrl;
  flagLoader = false;
  public configuracion: any = {};
  public configuration: any = {};
  public information: any = {};
  public login: any = {};
  // public client: any = {};
  public products: any = [];
  public productsTemp: any = [];
  public productsTemp2: any = [];
  public productsSold: any = {};
  public configurationVariables = {
    tipo_precio: 'pA', // No se esta usando
    mostrar_precio: 1,
    show_attributes_prod: false,
  }
  public loadingAll = false;
  public productSelected: any;
  public closeResult: string;
  public guarnition: any = [];
  public productDefault = [];
  public tipoNegocio: any;
  public tipoLogin = '';
  public allGrupos: any = [];
  public groups: any = [];
  tipoDefault = 0;
  flagCarLocal = false;
  private storageSubscription!: Subscription;
  comanda: any = [];
  prods: any = [];
  url = environment.urlBilling;
  flagMakeComanda = false;
  tiposPago: any = [];
  banderaAC = false;
  id_mesero: any;
  id_mesa: any;
  resultadoComanda: any = [];
  contactoFinal: any;
  idComanda: any;
  idEmpresa = environment.idShop;
  urlBilling = environment.urlBilling;
  logo: any;
  color: any;
  productSelect: any = [];
  modal: any;
  dataGrupoSubGrupo: any = [];
  activeDropdown: string | null = null;
  private subscriptions: Subscription[] = [];
  idCatalogo :any;


  constructor
    (
      private webService: ServiceService,
      private activateRoute: ActivatedRoute,
      private alert: AlertService,
      private util: UtilsService,
      private stylesService: StylesService, // Agregar esta línea
    ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

    async ngOnInit() {
      this.flagLoader=true;
      let detalleGS = (this.webService.getFromLocalStorage('g_s'));
      if(detalleGS){
        this.dataGrupoSubGrupo = detalleGS;
      }

      let carLocal = parseInt(this.webService.getFromLocalStorage('carLocal'));
      console.log('card LOCAL', carLocal);
      if(carLocal==1){
       this.flagCarLocal=true;
       this.prods = this.webService.getFromLocalStorage('carrito');
      }
      this.tipoDefault = this.webService.getFromLocalStorage('tipoCliente');
      console.log('tipoDefault', this.tipoDefault);
      
          // Cargar atributos para el video de youtube
      const tag = await document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      await document.body.appendChild(tag);
      apiLoaded = true;
      let url;
      await this.getConfiguracion();
      await this.getInformacion();
      this.url = this.urlBilling;
      url = this.urlBilling;
      await this.activateRoute.params.subscribe(async (params: Params) => {
        console.log('ENTRA AQUI PRIMERO', params);
        this.products = [];
        this.flagLoader = true;
        this.login = this.webService.getFromLocalStorage(this.configuracion.loginStorage);
        console.log('ENTRA ACA ANTES DEL PARAMS');
        console.log('params value', params['value']);

        if (params['value']) { 
          if (params['type'] == 'search') {
            let search = params['value'];
            await this.webService.searchProduct(url, search, this.configuracion).then(async (ressearch: any) => {
              if (ressearch.rta == true) {
                this.products = [];
                if (this.configuracion.tipo_web == 1) {
                  await this.webService.obtainAndCalculatePriceProduct(ressearch.data, this.configuracion, this.login).then(async (resPrice) => {
                    this.products = resPrice;
                    this.productsTemp = resPrice;
                    this.productsTemp2 = resPrice;
                    console.log("search", this.products);
                  });
                }
                if (this.configuracion.tipo_web == 2) {
                  await this.webService.obtainAndCalculatePriceProduct(ressearch.data, this.configuracion, this.login).then(async (resPrice) => {
                    await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
                      this.products = resTalla;
                      this.productsTemp = resTalla;
                      this.productsTemp2 = resTalla;
                      console.log("search", this.products);

                    });
                  });
                }
              } else {
                search = '';
                // this.alert.toaster.warning('No se ha encontrado coincidencias', '', { timeOut: 3000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
                this.alert.alertWarning('','No se ha encontrado coincidencias');
              }
            });
          }

          if (params['type'] == 'selectCatalogue') {

            setTimeout(() => {
              this.flagLoader=true;
              console.log('this configuration', this.configuracion);
              console.log('params1',params['value']);
              console.log('params2',params['value2']);
              this.webService.getProductosService(url, params['value'], params['value2'], this.configuracion).then(async (resprod: any) => {
                console.log('ENTRA A RESPROD', resprod);
                console.log('ENTRA A configuracion', this.configuracion);

                if (resprod.rta) {
                  if (this.configuracion.tipo_web == 1) {
                    await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login).then(async (resPrice) => {
                      this.products = resPrice;
                      this.productsTemp = resPrice;
                      this.productsTemp2 = resPrice;
                      this.flagLoader=false;
                      console.log("seleccionado", this.products);
                    });
                  }

                  if (this.configuracion.tipo_web == 2) {
                    await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login).then(async (resPrice) => {
                      await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
                        this.products = resTalla;
                        this.productsTemp = resTalla;
                        this.productsTemp2 = resTalla;
                        this.flagLoader=false;
                        console.log("search", this.products);
                      });
                    });
                  }
                } else {
                  this.alert.alertWarning('','No se ha encontrado productos');
                  this.flagLoader=false;
                }
              });
            }, 750);
            this.flagLoader=false;
          }

          if (params['type'] == 'selectProduct') {
            await this.webService.getProductosCodigoService(url, params['value'], this.configuracion).then(async (resprod: any) => {
              if (resprod.rta == true) {
                if (this.configuracion.tipo_web == 1) {
                  await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login).then(async (resPrice) => {
                    this.products = resPrice;
                    this.productsTemp = resPrice;
                    this.productsTemp2 = resPrice;
                    console.log("llamado", this.products);
                  });
                }
                if (this.configuracion.tipo_web == 2) {
                  await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login).then(async (resPrice) => {
                    await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
                      this.products = resTalla;
                      this.productsTemp = resTalla;
                      this.productsTemp2 = resTalla;
                      console.log("ACA", this.products);
                    });
                  });
                }
              } else {
                this.alert.alertWarning('','No se ha encontrado productos');
                this.flagLoader=false;
              }
            });
          }

        } else {
          console.log('ENTRA ACA', this.allGrupos);
          this.flagLoader=true;
         setTimeout(() => {
          let idGroup =   this.allGrupos[0].idgrupo;
          console.log('idGroup', idGroup);
          let idSubGroup =  this.allGrupos[0]?.subgrupos[0]?.id_sub;      
            // console.log('idSubGroup', idSubGroup);


            if (this.allGrupos) {
               this.webService.getProductosService(url,  idGroup,   idSubGroup, this.configuracion).then(async (resprod: any) => {
                if (resprod.rta == true) {
                  if (this.configuracion.tipo_web == 1) {
                    await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login).then(async (resPrice) => {
                      this.products = resPrice;
                      console.log("seleccionado", this.products);
                      this.productsTemp = resPrice;
                      this.productsTemp2 = resPrice;
                    });
                  }
                  if (this.configuracion.tipo_web == 2) {
                    await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login).then(async (resPrice) => {
                      await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
                        this.products = resTalla;
                        this.productsTemp = resTalla;
                        this.productsTemp2 = resTalla;
                        // await this.webService.deleteProductsDuplicated(resTalla, 'tagDeGrupo').then(async (resProd) => {
                        //   this.products = resProd;
                          console.log("seleccionado", this.products);
                        // });
                      });
                    });
                  }
                } else {
                  // this.toaster.warning('No se ha encontrado productos', '', { timeOut: 3000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
                  this.alert.alertWarning('','No se ha encontrado productos');
                  this.flagLoader=false;
                }
              });
            } else {
               this.webService.getGruposService(url, 'filter').then(async (resCategorias: any) => {
                // console.log('Antes de la primera',resCategorias );

                if (!resCategorias.error) {
                  if (resCategorias.rta == true) {
                    await this.webService.orderObjectsAsc(resCategorias.data).then(async (resorderg) => {
                      resCategorias.data = resorderg;
                      // console.log('Primera ==> ',resCategorias );

                    });
                    await this.getSubgrupos(resCategorias.data, url).then(async (resSubgrup: any) => {
                      console.log('subgrupos ===>' , resSubgrup );

                      await this.webService.orderObjectsAsc(resSubgrup).then(async (resorder) => {
                        await this.webService.getProductosService(url, resorder[0].idgrupo, resorder[0].subgrupos[0].id_sub, this.configuracion).then(async (resprod: any) => {
                          console.log('SUVB ', resprod);

                          if (resprod.rta == true) {
                            if (this.configuracion.tipo_web == 1) {
                              await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login).then(async (resPrice) => {
                                this.products = resPrice;
                                this.productsTemp = resPrice;
                                this.productsTemp2 = resPrice;
                                console.log("seleccionado", this.products);
                              });
                            }
                            if (this.configuracion.tipo_web == 2) {
                              await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login).then(async (resPrice) => {
                                await this.webService.createTallasProduct(resPrice).then(async (resTalla) => {
                                  this.products = resTalla;
                                  this.productsTemp = resTalla;
                                  this.productsTemp2 = resTalla;
                                  // await this.webService.deleteProductsDuplicated(resTalla, 'tagDeGrupo').then(async (resProd) => {
                                  //   this.products = resProd;
                                    console.log("seleccionado", this.products);
                                  // });
                                });
                              });
                            }
                          } else {
                            this.alert.alertWarning('','No se ha encontrado productos');
                            this.flagLoader=false;
                          }
                        });
                        await this.webService.saveTemporaryCatalogue(resorder);
                      });
                    });
                  } else {
                    // this.toaster.warning('Catálogo de la tienda vacio', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
                    this.alert.alertWarning('','Catálogo de la tienda vacio'),

                    this.flagLoader=false;
                  }
                } else {
                  // this.toaster.error('Error al obtener las categorias', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
                  this.alert.alertWarning('','Error al obtener las categorias');
                }
              });
            }
            this.flagLoader=false;

         }, 1200); 
        //  await this.webService.getTemporaryCatalogue().then(async(rescat: any) => {
        //   console.log('log RESCAT', await rescat);

        //   });
        }
        await this.webService.goUpPage();
        this.flagLoader = false;
        this.flagLoader=false;
      });
      await this.webService.observableFilterProducts().subscribe(async (res) => {
        this.flagLoader = true;
        await this.webService.orderProductPriceAscDesc(this.products, res).then((resorder) => {
          this.products = resorder;
          this.productsTemp = resorder;
          this.productsTemp2 = resorder;
          console.log("search", this.products);

        });
        this.flagLoader = false;
      });
      await this.webService.getProductPopularSoldService(url, this.configuracion).then(async (respopular: any) => {
        if (respopular.rta == true) {
          await this.webService.obtainAndCalculatePriceProduct(respopular.data, this.configuracion, this.login).then(async (resprice) => {
            this.productsSold = resprice;
            this.productsTemp = resprice;
            this.productsTemp2 = resprice;
            console.log("search", this.products);

          });
        }
      });


      // this.storageSubscription  = this.webService
      // .getStorageObservable()
      // .subscribe((data) => {
      //   if(data.key=='carLocal'){
      //     if(data.data=='1'){
      //       this.flagCarLocal=false;
      //     }
      //   }else{
      //     this.flagCarLocal= true;
      //   }
      //   console.log('data',data);

      // });





    }



  ngOnDestroy() {
    // document.removeEventListener('click', this.closeDropdown);
  }


  async getConfiguracion() {
    this.flagLoader = true;
    await this.webService.getGeneral(`configuracion/${this.idEmpresa}`).subscribe({
      next: (resp: any) => {
        console.log('resp', resp);
        this.configuracion = resp[0];
        this.configuration = resp[0];
            this.stylesService.forceApplyStyles();
      }
    });
  }

  async getInformacion() {
    await this.webService.getGeneral(`informacions/${this.idEmpresa}`).subscribe((resinfo: any) => {
      this.information = resinfo[0];
      console.log('this.information ===> ', this.information);
      
      // console.log('information.mision',this.information); 
      // this.companyNane = resinfo[0]?.nombre;
            this.tipoNegocio = this.information.esPuntoVenta ;

      let color = this.information.colorLetraSlogan;
      // console.log('color', color); 
      document.documentElement.style.setProperty('--color-font-portada', color);
    });
  }

  isEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }

  async getGroupsCatalogue(event) {
    this.groups = event;
    this.allGrupos = event;
    console.log('TODOS LOS GRUPOS', this.groups);

  }

  async getConfig(event: any) {

    this.configuracion = await event;
    this.logo = this.configuracion?.imgLogo;
    let color = this.configuracion?.colorPrincipal;
    this.color = color;
    let colorLetra = this.configuracion?.colorLetra;
    let colorLetraSecundario = this.configuracion?.colorLetraSecundario;
    document.documentElement.style.setProperty('--color-letter-secondary', colorLetraSecundario);
    document.documentElement.style.setProperty('--dynamic-color', color);
    document.documentElement.style.setProperty('--color-letter-primary', colorLetra);
    console.log('LLEGA LA CONFIGURACION DESDE CATALOGO', this.configuracion);
  }


  modificarURL(url: string): string {
    console.log('url === > ', url);

    const partes = url.split('/');
    if (partes.length > 4) {
      return partes.slice(0, 4).join('/') + '/';
    }
    return url;
  }

  async getSubgrupos(grupos, url_billing) {
    this.flagLoader = true;
    await this.webService.getSubgruposService(url_billing, grupos[0].idgrupo).then(async (resSubgrup: any) => {
      this.webService.orderObjectsAsc(await resSubgrup.data).then(async (resorder) => {
        grupos[0].subgrupos[0] = await resorder;
        console.log('grupos ======================>', grupos);
      });
    });


    this.flagLoader = false;
    return grupos;
  }

  // METODOS MODALES
  openModal(name) {
    this.modal = this.util.createModal(name);
    this.modal.show();
  }

  closeModal() {
    this.modal.hide();
  }

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

  getNameGrupoSubg(event) {
    this.dataGrupoSubGrupo = event;
    console.log('DATOS GRUPO Y SUBGRUPO ', this.dataGrupoSubGrupo);

  }

  async getProductos(grupo: any, subGrupo: any) {
    console.log('Grupo seleccionado:', grupo);
    console.log('Subgrupo seleccionado:', subGrupo);

    // Actualizar el breadcrumb siguiendo la estructura existente
    this.dataGrupoSubGrupo = {
      id_grupo: grupo.idgrupo,
      name_grupo: grupo.nombre,
      id_subgrupo: subGrupo.id_sub,
      name_subgrupo: subGrupo.nombre,
    };

    // Guardar en localStorage como lo hace el método existente
    // localStorage.setItem('g_s', JSON.stringify(this.dataGrupoSubGrupo));

    try {
      // Activar el loader como en el código existente
      this.flagLoader = true;
      this.flagLoader = true;

      // Limpiar productos actuales
      this.products = [];

      // Obtener productos usando la misma lógica del ngOnInit
      await this.webService.getProductosService(this.url, grupo.idgrupo, subGrupo.id_sub, this.configuracion)
        .then(async (resprod: any) => {
          console.log('Respuesta productos:', resprod);

          if (resprod.rta) {
            // Lógica basada en tipo_web como en el código original
            if (this.configuracion.tipo_web == 1) {
              // Tienda normal
              await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login)
                .then(async (resPrice) => {
                  this.products = resPrice;
                  this.productsTemp = resPrice;
                  this.productsTemp2 = resPrice;
                  console.log("Productos cargados (tipo 1):", this.products);
                });
            }

            if (this.configuracion.tipo_web == 2) {
              // Tienda por tallas
              await this.webService.obtainAndCalculatePriceProduct(resprod.data, this.configuracion, this.login)
                .then(async (resPrice) => {
                  await this.webService.createTallasProduct(resPrice)
                    .then(async (resTalla) => {
                      this.products = resTalla;
                      this.productsTemp = resTalla;
                      this.productsTemp2 = resTalla;
                      console.log("Productos cargados (tipo 2):", this.products);
                    });
                });
            }

            if (this.configuracion.tipo_web == 3) {
              console.log("Tienda con 2 BD, codigo se encuentra en proceso");
              this.products = [];
              this.productsTemp = [];
              this.productsTemp2 = [];
            }

            if (this.configuracion.tipo_web == 4) {
              console.log("Tienda Internet");
              this.products = [];
              this.productsTemp = [];
              this.productsTemp2 = [];
            }

            // Scroll hacia arriba como en el código original
            await this.webService.goUpPage();

          } else {
            // Mostrar alerta si no hay productos, como en el código original
            this.alert.alertWarning('', 'No se ha encontrado productos en esta categoría');
            this.products = [];
            this.productsTemp = [];
            this.productsTemp2 = [];
            this.flagLoader=false;
          }
        })
        .catch((error) => {
          console.error('Error al obtener productos:', error);
          this.alert.alertWarning('', 'Error al cargar los productos');
          this.products = [];
          this.productsTemp = [];
          this.productsTemp2 = [];
        });

    } catch (error) {
      console.error('Error en getProductos:', error);
      this.alert.alertWarning('', 'Error al procesar la solicitud');
    } finally {
      // Desactivar loaders
      this.flagLoader = false;
      this.flagLoader = false;
    }
  }

    get shouldShowSkeleton(): boolean {
    return this.flagLoader;
  }


}



