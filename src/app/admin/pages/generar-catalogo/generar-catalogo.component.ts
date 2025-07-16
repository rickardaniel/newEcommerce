import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { NgxPrintModule } from 'ngx-print';
import { NgxLoadingModule } from 'ngx-loading';

@Component({
  selector: 'app-generar-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPrintModule, NgxLoadingModule],
  templateUrl: './generar-catalogo.component.html',
  styleUrl: './generar-catalogo.component.scss'
})
export default class GenerarCatalogoComponent {
  loading = false;
  configuracion: any = [];
  public pricesTypes: any = [];
  public buttonsPay: any = {};

  public groups = [];
  public catalogue = {
    id_grupo: 0,
    name_grupo: '',
    id_subgrupo: 0,
    name_subgrupo: '',
    complete_inventory: false,
    type: 'pA',
    subGrupos: [],
    products: [],
    products_all: [],
    view_products: false,
    search: '',
    stock: true,
    description: true,
    peso: true,
    medida: true,
    ubicacion: true,
    origen: true,
    origen_arr: [
      {
        id: 0,
        nombre: ' * TODAS'
      },
      {
        id: 1,
        nombre: 'NACIONAL'
      },
      {
        id: 2,
        nombre: 'IMPORTADO'
      }
    ],
    origen_select: 0,
    cant_bulto: true,
    marca: true,
    marcas: [],
    marca_select: 0,
    show_price: true
  }
  public products = [];
  public productsALL = [];
  empresa = environment.empresa;
  urlBase = environment.firebaseUrl;
  sistema = environment.empresa;
  public price = {
    before: 50,
    now: 0
  }

  urlBilling = environment.urlBilling;
  idEmpresa = environment.idShop;

  constructor
    (
      private webService: ServiceService,
      private alert: AlertService,
      private route: ActivatedRoute,
      
    ) {
  }

  async ngOnInit() {
    // await this.getConfiguration();
    // await this.getGroups();
    this.route.data.subscribe(data => {
      // console.log('data', data);
      this.configuracion = data['appConfig'][0];
      // console.log('Configuración de la aplicación recibida en Dashboard (nueva sintaxis):', this.configuracion);
      let color = this.configuracion.colorPrincipal;
      let colorLight0 = this.webService.hexToRgba(color, 0.1);
      let colorLight = this.webService.hexToRgba(color, 0.3);
      let colorLight1 = this.webService.hexToRgba(color, 0.5);
      let colorLight2 = this.webService.hexToRgba(color, 0.7);
      document.documentElement.style.setProperty('--dynamic-color', color);
      document.documentElement.style.setProperty(
        '--ligther-color0',
        colorLight0
      );
      document.documentElement.style.setProperty(
        '--ligther-color',
        colorLight
      );
      document.documentElement.style.setProperty(
        '--ligther-color1',
        colorLight1
      );
      document.documentElement.style.setProperty(
        '--ligther-color2',
        colorLight2
      );
      this.loading = false;
      // Precio oferta y real ejemplo
      if (this.configuracion.porcentajePrecioOferta > 0) {
        let porcent =
          (this.price.before * this.configuracion.porcentajePrecioOferta) /
          100;
        this.price = {
          before: 50,
          now: this.price.before - porcent,
        };
      }

    });
    this.getGroups();
    await this.getPricesTypes();
    await this.getAtributesProducts();
    await this.webService.visibilityPurchaseButtons(this.configuracion, {}).then((resbtn: any) =>{
    this.buttonsPay = resbtn;
    });
  }

    async getPricesTypes() {
      await this.webService.getPricesType(this.urlBilling).then(async (resprices: any) => {
        this.pricesTypes = resprices;
      });
  }

    async getAtributesProducts() {
    this.loading = true;
      await this.webService.getAttributesProducts(this.urlBilling).then(async (resatr: any) => {
        console.log('resatr', resatr);
        
        if (resatr.rta == true) {
          let aux = {
            id: 0,
            nombre: ' * TODAS',
            descripcion: 'Default'
          }
          resatr.marca.push(aux);
          await this.webService.orderObjectsAsc(resatr.marca).then((res) => {
            this.catalogue.marcas = res;
          })
        }
      });
    this.loading = false;
  }

  formStock = new FormGroup({
    checkStock: new FormControl(true)
  })

  async getGroups() {
    let tipo_web = this.configuracion.tipo_web;
    console.log('tipo_web ==>', tipo_web);
    this.loading = true;
    if (tipo_web == 1 || tipo_web == 2 || tipo_web == 4) {
      await (await this.webService.getGruposService(this.urlBilling, 'filter')).subscribe(async (resgrupos: any) => {
        console.log('resgrupos', resgrupos);
        if (resgrupos.rta) {
          await this.webService.orderObjectsAsc(resgrupos.data).then(async (resorderg) => {
            let aux = {
              codigo: '0',
              nombre: "* LISTAR TODOS",
              url_billing: resorderg[0].url_billing,
              img: "",
              id_grupo: '0',
            }
            resorderg.push(aux);
            this.groups = resorderg;
            console.log('grupos ===>', this.groups);

            await this.selectGroup(this.groups[0].idgrupo);
            this.catalogue.id_grupo = this.groups[0].idgrupo;
            await this.getSubGroups(this.groups[0].idgrupo);
          });
        } else {
          this.alert.alertWarning('Catálogo de la tienda vacio', '');
        }
      });
    }
    if (tipo_web == 3) {
      console.log("Tienda con 2 BD, codigo se encuentra en proceso");
    }
    this.loading = false;
  }

  async selectGroup(id_grupo) {
    this.loading = true;
    if (this.formStock.controls['checkStock'].value) {
      await this.webService.getProductsByGroupFree(this.urlBilling, id_grupo, this.configuracion).then((resprod: any) => {
        if (resprod.rta == true) {
          this.productsALL = resprod.rta;
          for (let p of resprod.data) {
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.pro_cod = p.id_producto;
          }
          this.products = resprod.data;
          this.products = this.products.filter((producto: any) => producto.stockactual > 0)
        } else {
          this.products = [];
          this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');
        }
      });
    } else {
      await this.webService.getProductsByGroupFree(this.urlBilling, id_grupo, this.configuracion).then((resprod: any) => {
        if (resprod.rta == true) {
          this.productsALL = resprod.rta;
          for (let p of resprod.data) {
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.pro_cod = p.id_producto;
          }
          this.products = resprod.data;
        } else {
          this.products = [];
          this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');
        }
      });
    }
    this.loading = false;
  }

  async getSubGroups(idgrupo) {
    console.log('ENTRA SUB GRUPOS INIT', idgrupo);
    
    this.loading = true;
    this.restablishFilters('');
    this.catalogue.id_grupo = idgrupo;
    if (idgrupo == 0) {
      await this.getProductsAll();
    } else {
      await (await this.webService.getSubgruposService(this.urlBilling, idgrupo)).subscribe(async (ressub: any) => {
        console.log('//////', ressub);

        if (ressub.rta == true) {
          await this.webService.orderObjectsAsc(ressub.data).then(async (resorderg) => {
            let aux = {
              estado: 1,
              id_grupo: resorderg[0].id_grupo,
              id_sub: -1,
              img: "",
              nombre: "* LISTAR TODOS",
              url_billing: resorderg[0].url_billing,
            }
            resorderg.push(aux);
            this.catalogue.subGrupos = resorderg;
            await this.getProductsGrupoSubgrupo(resorderg[0].id_sub);
            this.catalogue.name_grupo = this.getNameGrupoSubgrupo(idgrupo, 'grupo');
          });
        } else {
          this.alert.alertWarning('No posee sub categorias', '');
        }

      });
    }
    this.loading = false;
  }
  async getSubGroups2(idgrupo) {
    console.log('id',idgrupo);
    
    
    idgrupo = idgrupo.target.value;
     console.log('id grupo === > ', idgrupo);
    this.loading = true;
    this.restablishFilters('');
    this.catalogue.id_grupo = idgrupo;
    if (idgrupo == 0 || idgrupo=="") {
      // console.log("ENTRA ==> ", idgrupo);
      
      await this.getProductsAll();
    } else {
      await (await this.webService.getSubgruposService(this.urlBilling, idgrupo)).subscribe(async (ressub: any) => {
        console.log('ressub',ressub);
        
          if (ressub.rta == true) {
            await this.webService.orderObjectsAsc(ressub.data).then(async (resorderg) => {
              console.log('resorderg', resorderg);
              
              let aux = {
                estado: 1,
                id_grupo: resorderg[0].id_grupo,
                id_sub: -1,
                img: "",
                nombre: "* LISTAR TODOS",
                url_billing: resorderg[0].url_billing,
              }
              resorderg.push(aux);
              this.catalogue.subGrupos = resorderg;
              await this.getProductsGrupoSubgrupo(resorderg[0].id_sub);
              this.catalogue.name_grupo = this.getNameGrupoSubgrupo(idgrupo, 'grupo');
            });
          } else {
            this.alert.alertWarning('No posee sub categorias', '');
          }

      });
    }
    this.loading = false;
  }

  async getProductsGrupoSubgrupo(id_sub) {
      this.loading = true;
        if (id_sub >= 0) {
          await this.restablishFilters('grupo');
          await this.webService.getProductosService(this.urlBilling, this.catalogue.id_grupo, id_sub, this.configuracion).then(async (resprod: any) => {
            if (resprod.rta == true) {
              let aux = this.stablishingPriceProduct(resprod.data);
              aux.push(this.webService.createProductViewGroupSubgroup('-1', this.catalogue.id_grupo, this.groups, id_sub, this.catalogue.subGrupos));
              this.catalogue.products = this.webService.orderProductForId(aux, 'asc');
            } else {
              this.catalogue.products = [];
              this.alert.alertWarning('No se ha encontrado productos', '');
            }
          });
        } else {
          this.catalogue.name_subgrupo = '';
          await this.restablishFilters('subgrupo');
          await this.webService.getProductosGrupo(this.urlBilling, this.catalogue.id_grupo, this.configuracion).then(async (resprod: any) => {
            if (!resprod.error) {
              if (resprod.rta == true) {
                this.catalogue.products = await this.stablishingPriceProduct(resprod.data);
                await this.webService.clasifyProductsGroupSubgroup('subgroup', this.catalogue, this.groups).then((resprod: []) => {
                  this.catalogue.products = resprod;
                });
               
              } else {
                this.catalogue.products = [];
                this.alert.alertWarning('No se ha encontrado resultados', '');
              }
            }
          });
        }
      this.catalogue.view_products = this.webService.showProducts(this.catalogue.products);
      this.catalogue.products_all = this.catalogue.products;
  
      // console.log(this.catalogue.products);
      // console.log("Show", this.catalogue.view_products);
  
      this.loading = false;
  }
  async getProductsGrupoSubgrupo2(id_sub) {
      this.loading = true;
      id_sub = id_sub.target.value;
        if (id_sub >= 0) {
          await this.restablishFilters('grupo');
          await this.webService.getProductosService(this.urlBilling, this.catalogue.id_grupo, id_sub, this.configuracion).then(async (resprod: any) => {
            if (resprod.rta == true) {
              let aux = this.stablishingPriceProduct(resprod.data);
              aux.push(this.webService.createProductViewGroupSubgroup('-1', this.catalogue.id_grupo, this.groups, id_sub, this.catalogue.subGrupos));
              this.catalogue.products = this.webService.orderProductForId(aux, 'asc');
            } else {
              this.catalogue.products = [];
              this.alert.alertWarning('No se ha encontrado productos', '');
            }
          });
        } else {
          this.catalogue.name_subgrupo = '';
          await this.restablishFilters('subgrupo');
          await this.webService.getProductosGrupo(this.urlBilling, this.catalogue.id_grupo, this.configuracion).then(async (resprod: any) => {
            if (!resprod.error) {
              if (resprod.rta == true) {
                this.catalogue.products = await this.stablishingPriceProduct(resprod.data);
                await this.webService.clasifyProductsGroupSubgroup('subgroup', this.catalogue, this.groups).then((resprod: []) => {
                  this.catalogue.products = resprod;
                });
               
              } else {
                this.catalogue.products = [];
                this.alert.alertWarning('No se ha encontrado resultados', '');
              }
            }
          });
        }
      this.catalogue.view_products = this.webService.showProducts(this.catalogue.products);
      this.catalogue.products_all = this.catalogue.products;
  
      // console.log(this.catalogue.products);
      // console.log("Show", this.catalogue.view_products);
  
      this.loading = false;
  }

  async filterProductForOrigin(origin) {
    console.log('origen', origin);
    origin= origin.target.value;
        this.loading = true;
    // Filtrar
    if (origin > 0) {
      this.catalogue.products = [];
      await this.webService.filterForOriginMarca('origen', origin, this.catalogue.products_all, this.catalogue.marca_select).then(async (resfilter) => {
        this.catalogue.products = resfilter;
      });
      await this.restablishFilters('origin_marca');
    } else {
      this.catalogue.products = this.catalogue.products_all;
      await this.restablishFilters('grupo');
    }
    this.catalogue.view_products = await this.webService.showProducts(this.catalogue.products);
    // Mostrar/Ocultar producto qu contiene grupo/subgrupo
    this.catalogue.products = await this.webService.enableDisableProductGroupSubgroup(this.catalogue.products);
    // console.log(this.catalogue.products);
    this.loading = false;
  }

  async filterProductForMarca(e) {
    
  }
  async filterProductForMarca2(e) {
    e = e.target.value;
    console.log('e',e);
    
 this.loading = true;
    if (e > 0) {
      this.catalogue.products = [];
      await this.webService.filterForOriginMarca('marca', e, this.catalogue.products_all, this.catalogue.origen_select).then(async (resfilter) => {
        this.catalogue.products = resfilter;
      });
      await this.restablishFilters('origin_marca');
    } else {
      this.catalogue.products = this.catalogue.products_all;
      await this.restablishFilters('grupo');
    }
    this.catalogue.view_products = await this.webService.showProducts(this.catalogue.products);
    // Mostrar/Ocultar producto qu contiene grupo/subgrupo
    this.catalogue.products = await this.webService.enableDisableProductGroupSubgroup(this.catalogue.products);

    // console.log(this.catalogue.products);

    this.loading = false;
  }

  async searchProductsCatalogue(search) {
    console.log('AGUA CIELO', search);
    
     this.loading = true;
    await this.restablishFilters('search');
      await this.webService.searchProduct(this.urlBilling, search, this.configuracion).then(async (ressearch: any) => {
        console.log('ressearch', ressearch);
        
        if (ressearch.rta == true) {
            console.log('this.catalogue', this.catalogue);
            console.log('this.groups', this.groups);
          this.catalogue.products = await this.stablishingPriceProduct(ressearch.data);
          await this.webService.clasifyProductsGroupSubgroup('search', this.catalogue, this.groups).then((resprod: []) => {
            console.log('resprod', resprod);
            
            // this.catalogue.products = resprod;
            this.catalogue.products = ressearch.data;
          });
        } else {
          this.alert.alertDanger('No se ha encontrado resultados en la busqueda', '');
        }
      });
    this.catalogue.view_products = this.webService.showProducts(this.catalogue.products);
    this.catalogue.products_all = this.catalogue.products;
    // console.log(this.catalogue.products);
    // console.log("Show", this.catalogue.view_products);
    this.loading = false;
  }

  async selectTypePrice(price) {
      this.loading = true;
    this.catalogue.type = price;
    this.catalogue.products = this.stablishingPriceProduct(this.catalogue.products);
    this.loading = false;
  }
  viewAttributes(e) {
     let type = e.target.value;

    if (type == 'stock') {
      this.catalogue.stock = e.target.checked;
    }

    if (type == 'description') {
      this.catalogue.description = e.target.checked;
    }

    if (type == 'marca') {
      this.catalogue.marca = e.target.checked;
    }

    if (type == 'peso') {
      this.catalogue.peso = e.target.checked;
    }

    if (type == 'medida') {
      this.catalogue.medida = e.target.checked;
    }

    if (type == 'ubicacion') {
      this.catalogue.ubicacion = e.target.checked;
    }

    if (type == 'origen') {
      this.catalogue.origen = e.target.checked;
    }

    if (type == 'cant_bulto') {
      this.catalogue.cant_bulto = e.target.checked;
    }

    if (type == 'show_price') {
      this.catalogue.show_price = e.target.checked;
      console.log("dasdas", this.catalogue.show_price);

    }
  }

  async restablishFilters(type) {

    if (type == '') {
      this.catalogue.subGrupos = [];
      // this.catalogue.verAll = false;
      this.catalogue.search = '';
      this.catalogue.marca_select = 0;
      this.catalogue.origen_select = 0;
    }

    if (type == 'search') {
      this.catalogue.subGrupos = [];
      this.catalogue.marca_select = 0;
      this.catalogue.origen_select = 0;
    }

    if (type == 'grupo') {
      this.catalogue.search = '';
      this.catalogue.marca_select = 0;
      this.catalogue.origen_select = 0;
    }

    if (type == 'subgrupo') {
      this.catalogue.search = '';
      this.catalogue.marca_select = 0;
      this.catalogue.origen_select = 0;
    }

    if (type == 'origin_marca') {
      // this.catalogue.verAll = false;
      this.catalogue.search = '';
    }

  }

  async getProductsAll() {
    
    this.loading = true;
    await this.restablishFilters('');
    this.catalogue.complete_inventory = true;
    await this.webService.getProductosAll(this.urlBilling, this.configuracion).then(async (resprod: any) => {
      
      if (resprod.rta == true) {
        this.catalogue.products = await this.stablishingPriceProduct(resprod.data);
        console.log(' this.catalogue',  this.catalogue);
        
        await this.webService.clasifyProductsGroupSubgroup('all', this.catalogue, this.groups).then((resprod:any) => {
          console.log('resprod', resprod);
          
          this.catalogue.products =  resprod;
          console.log(' this.catalogue.products',  this.catalogue.products);
          
        });
      } else {
        this.catalogue.products = [];
        this.alert.alertWarning('No se ha encontrado resultados', '');
      }
    });
    this.catalogue.view_products = this.webService.showProducts(this.catalogue.products);
    this.catalogue.products_all = this.catalogue.products;
     console.log("Show", this.catalogue.view_products);
    this.loading = false;
  }

  stablishingPriceProduct(product) {
    for (let p of product) {
      if (p.id_producto > 0) {
        p.precioReal = parseFloat(p.precios[0].valor_mas_iva).toFixed(2);
        p.marca_nombre = this.addNameMarKProduct(p.marca_id);
        for (let pric of p.precios) {
          if (pric.id_tipo == this.catalogue.type) {
            p.precioReal = parseFloat(pric.valor_mas_iva).toFixed(2);
          }
        }
      }
    }
    return product;
  }

  addNameMarKProduct(id_marca) {
    let name;
    for (let m of this.catalogue.marcas) {
      if (id_marca == m.id) {
        name = m.nombre;
      }
    }
    return name;
  }

  getNameGrupoSubgrupo(id, type) {
    let name;
    this.catalogue.complete_inventory = false;

    if (type == 'grupo') {
      for (let g of this.groups) {
        if (g.idgrupo == id) {
          name = this.webService.convertStringTypeSentence(g.nombre);
        }
      }
    }

    if (type == 'subgrupo') {
      // console.log(this.catalogue.subGrupos);
      for (let s of this.catalogue.subGrupos) {
        if (s.id_sub == id) {
          name = this.webService.convertStringTypeSentence(s.nombre);
        }
      }
    }

    return name;
  }




}
