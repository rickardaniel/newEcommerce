import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { environment } from '../../../environments/environment';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { MigrationService } from '../../../services/migration.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [NgxLoadingModule, FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './promociones.component.html',
  styleUrl: './promociones.component.scss'
})
export default class PromocionesComponent {
  configuracion: any = {};
  public promotions: any = {};
  empresa = environment.empresa;
  urlBase = environment.firebaseUrl;
  sistema = environment.empresa;
  loading = false;
  public price = {
    before: 50,
    now: 0
  }
  public newPromotion: any = {};
  public closeResult: string;
  urlPromociones = 'promociones%2F';
  urlPromocionesFB = 'promociones';
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
  public productsALL = [];
  public products = [];
  public buttonsPay = {};
  urlBilling = environment.urlBilling;
  promotionSelect: any;
  fileImg: any;
  flagfileImg = false;


  constructor
    (
      private webService: ServiceService,
      private alert: AlertService,
      private fireService: MigrationService,
      private util: UtilsService,

    ) { }

  async ngOnInit() {
    await this.getConfiguration();
    await this.getPromotionsWeb();
    await this.getGroups();
    await this.webService.visibilityPurchaseButtons(this.configuracion, {}).then((resbtn: any) => {
      this.buttonsPay = resbtn;
    });
  }

  formStock = new FormGroup({
    checkStock: new FormControl(true)
  })


  async getConfiguration() {
    this.loading = true;
    await this.webService.getConfiguracion().then(async (data: any) => {
      console.log('data', data);

      if (data) {
        if (data[0]) {
          this.configuracion = data[0];
          this.loading = false;
          // Precio oferta y real ejemplo
          if (this.configuracion.porcentajePrecioOferta > 0) {
            let porcent = (this.price.before * this.configuracion.porcentajePrecioOferta) / 100;
            this.price = {
              before: 50,
              now: this.price.before - porcent
            }
          }
          // console.log(this.configuracion);
        } else {
          this.loading = false;
          console.log("No se ha encontrado configuracion");
        }
      } else {
        this.loading = false;
        this.alert.alertDanger('No se ha podido acceder al servicio, comuniquese con su administrador', '');
      }
    });
  }
  async getPromotionsWeb() {
    this.loading = true;
    await this.webService.getPromocionesWeb().then(async (resprom: any) => {
      if (resprom.length > 0) {
        for (let p of resprom) {
          if (p.id_producto != 0 && p.id_producto) {
            // console.log("Siii se va", p.id_producto);
            await this.webService.getProductosCodigoService(this.urlBilling, p.id_producto, this.configuracion).then(async (resprod: any) => {
              if (resprod.rta == true) {
                p.nombre_producto = p.id_producto + ' / ' + resprod.data[0].nombre_producto;
              } else {
                p.nombre_producto = p.id_producto + ' / No encontrado';
              }
            });
          } else {
            // console.log("Nooo se va", p.id_producto);
            p.nombre_producto = 'No asignado';
          }
        }
      }
      this.promotions = resprom;
    });
    this.loading = false;
  }

  async getGroups() {
    // console.log("getGroups");
    let tipo_web = this.configuracion.tipo_web;
    this.loading = true;
    // await this.webService.getUrlEmpresa().then(async (url) => {
    if (tipo_web == 1 || tipo_web == 2 || tipo_web == 4) {
      await (await this.webService.getGruposService(this.urlBilling, 'filter')).subscribe(async (resgrupos: any) => {
        console.log('resgrupos', resgrupos);

        if (resgrupos) {
          if (resgrupos.rta == true) {
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
              await this.selectGroup(this.groups[0].idgrupo);
              this.catalogue.id_grupo = this.groups[0].idgrupo;
              await this.getSubGroups(this.groups[0].idgrupo);
            });
          } else {
            this.alert.alertWarning('Catálogo de la tienda vacio', '');
          }
        } else {
          this.alert.alertDanger('Error al obtener las categorias', '');
        }
      });
    }
    if (tipo_web == 3) {
      console.log("Tienda con 2 BD, codigo se encuentra en proceso");
    }
    // });
    this.loading = false;
  }



  async updateTitlePromotion(tituloPromocion) {
    this.configuracion.tituloPromocion = tituloPromocion;
    this.loading = true;
    await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
      this.loading = false;
      await this.getConfiguration();
      this.alert.alertSuccess('Titulo sección de promociones actualizada exitosamente', '');
    });
  }

  async selectGroup(id_grupo) {
        console.log(' id Grupo', id_grupo);
    // console.log('search', id_grupo);
    // id_grupo = id_grupo.target.value;

    
    this.loading = true;
    if (this.formStock.controls['checkStock'].value) {
      // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getProductsByGroupFree(this.urlBilling, id_grupo, this.configuracion).then((resprod: any) => {
        if (resprod.rta == true) {
          this.productsALL = resprod.rta;
          for (let p of resprod.data) {
            // if(this.formStock.controls['checkStock'].value){
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.pro_cod = p.id_producto;
            // }
          }

          this.products = resprod.data;
          // console.log(' this.products ',  this.products.length);
          this.products = this.products.filter((producto: any) => producto.stockactual > 0)

        } else {
          this.products = [];
          this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');
        }
      });
      // });
    } else {
      // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getProductsByGroupFree(this.urlBilling, id_grupo, this.configuracion).then((resprod: any) => {
        if (resprod.rta == true) {
          this.productsALL = resprod.rta;
          for (let p of resprod.data) {
            // if(this.formStock.controls['checkStock'].value){
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.pro_cod = p.id_producto;
            // }
          }

          this.products = resprod.data;

        } else {
          this.products = [];
          this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');
        }
      });
      // });

    }
    this.loading = false;
  }
  async selectGroup2(id_grupo) {
        console.log(' id Grupo', id_grupo);
    // console.log('search', id_grupo);
    id_grupo = id_grupo.target.value;

    
    this.loading = true;
    if (this.formStock.controls['checkStock'].value) {
      // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getProductsByGroupFree(this.urlBilling, id_grupo, this.configuracion).then((resprod: any) => {
        if (resprod.rta == true) {
          this.productsALL = resprod.rta;
          for (let p of resprod.data) {
            // if(this.formStock.controls['checkStock'].value){
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.pro_cod = p.id_producto;
            // }
          }

          this.products = resprod.data;
          // console.log(' this.products ',  this.products.length);
          this.products = this.products.filter((producto: any) => producto.stockactual > 0)

        } else {
          this.products = [];
          this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');
        }
      });
      // });
    } else {
      // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getProductsByGroupFree(this.urlBilling, id_grupo, this.configuracion).then((resprod: any) => {
        if (resprod.rta == true) {
          this.productsALL = resprod.rta;
          for (let p of resprod.data) {
            // if(this.formStock.controls['checkStock'].value){
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.pro_cod = p.id_producto;
            // }
          }

          this.products = resprod.data;

        } else {
          this.products = [];
          this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');
        }
      });
      // });

    }
    this.loading = false;
  }


  async getSubGroups(idgrupo) {
    this.loading = true;
    this.restablishFilters('');
    this.catalogue.id_grupo = idgrupo;
    // await this.webService.getUrlEmpresa().then(async (url) => {
    if (idgrupo == 0) {
      await this.getProductsAll();
    } else {
      await (await this.webService.getSubgruposService(this.urlBilling, idgrupo)).subscribe(async (ressub: any) => {
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
    // });
    this.loading = false;
  }

  async getProductsAll() {
    this.loading = true;
    await this.restablishFilters('');
    this.catalogue.complete_inventory = true;
    // await this.webService.getUrlEmpresa().then(async (url) => {
    await this.webService.getProductosAll(this.urlBilling, this.configuracion).then(async (resprod: any) => {
      if (resprod.rta == true) {
        this.catalogue.products = await this.stablishingPriceProduct(resprod.data);
        await this.webService.clasifyProductsGroupSubgroup('all', this.catalogue, this.groups).then((resprod: []) => {
          this.catalogue.products = resprod;
        });
      } else {
        this.catalogue.products = [];
        this.alert.alertWarning('No se ha encontrado resultados', '');
      }
    });
    // });
    this.catalogue.view_products = this.webService.showProducts(this.catalogue.products);
    this.catalogue.products_all = this.catalogue.products;


    // console.log(this.catalogue.products);
    // console.log("Show", this.catalogue.view_products);


    this.loading = false;
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

  // id_sub = 0 Traer todos los productos sin importar el subgrupo
  async getProductsGrupoSubgrupo(id_sub) {
    this.loading = true;
    // await this.webService.getUrlEmpresa().then(async (url) => {
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
            // let aux = this.stablishingPriceProduct(resprod.data);
            // let aux_prod = [];
            // aux = await this.webService.orderProductsBySubgroups('', aux);
            // let cont = -1;
            // for (let sg of this.catalogue.subGrupos) {
            //   let arr_aux = [];
            //   // Agrupar productos por grupos
            //   for (let p of aux) {
            //     if (sg.id_sub == p.id_subgrupo) {
            //       arr_aux.push(p);
            //     }
            //   }
            //   // Asignar el producto que cotiene el grupo y subgrupo
            //   if (arr_aux.length > 0) {
            //     arr_aux.push(await this.webService.createProductViewGroupSubgroup(cont, this.catalogue.id_grupo, this.groups, sg.id_sub, this.catalogue.subGrupos));
            //     arr_aux = await this.webService.orderProductForId(arr_aux, 'asc');
            //     for (let a of arr_aux) {
            //       aux_prod.push(a);
            //     }
            //     cont = (cont) + (-1);
            //   }
            // }
            // this.catalogue.products = aux_prod;
          } else {
            this.catalogue.products = [];
            this.alert.alertWarning('No se ha encontrado resultados', '');
          }
        }
      });
    }
    // });
    this.catalogue.view_products = this.webService.showProducts(this.catalogue.products);
    this.catalogue.products_all = this.catalogue.products;

    // console.log(this.catalogue.products);
    // console.log("Show", this.catalogue.view_products);

    this.loading = false;
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

  openModal(name) {
    let modal = this.util.createModal(name);
    modal.show();
  }
  openModal2(name, promotion) {
    this.promotionSelect = promotion;
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

  async selectProduct(id_producto) {
    this.newPromotion.id_producto = id_producto.target.value;
  }

  formCrearPromocion = new FormGroup({
    nombrePromocion: new FormControl(''),
    descripcion: new FormControl(''),
    nombreImagen: new FormControl(''),
    imgPromocion: new FormControl(''),
    id_empresa: new FormControl(''),
    id_producto: new FormControl('0'),
  })

  async savePromotion(form: any) {
    this.loading=true;
    // this.newPromotion = {
    //   id_producto: 0,
    // };
    let fireBase;
    let bd;
    let pathFB;
    let rutaBD;
    fireBase = this.urlPromocionesFB;
    bd = this.urlPromociones;
    let namePromo = this.generateRandomString();
    pathFB = this.empresa + '/' + fireBase + '/' + 'promocion' + namePromo
    rutaBD = bd + 'promocion' + namePromo
    let fileCompress;

    await this.fireService.compressFile(this.fileImg).then(async (res: any) => {
      fileCompress = await res;
    });
    await this.fireService.uploadImage(fileCompress, pathFB).then((data: any) => {
      // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
    });
    form.id_producto =  this.newPromotion.id_producto;
    let query = {
      "nombrePromocion": form.nombrePromocion,
      "descripcion": form.descripcion,
      "id_producto": form.id_producto,
      "nombreImagen": 'promocion',
      "imgPromocion": rutaBD
    }
    await this.webService.insertPromotionWeb(query).then(async (respromo: any) => {
      if (!respromo.error) {
        await this.getPromotionsWeb();
        this.alert.alertSuccess('Promoción creada exitosamente', '');
        this.loading=false;
        this.formCrearPromocion.reset();
        this.closeModal(true,'#createPromotionModal');
      } else {
        this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');
        this.loading=false;
      }
    });

  }

  async deletePromotionWeb(promotion) {
    this.loading = true;

    await this.webService.deletePromotionWeb(promotion.id_promocion).then(async (resdel: any) => {
      console.log('resdel ===> ', resdel);
      if (resdel) {
    
        this.alert.alertSuccess('Promoción eliminada exitosamente', '');
      await  this.fireService.deleteImage(promotion.imgPromocion);
        this.loading = false;
        this.closeModal(true, '#deletePromotionModal');
            await this.getPromotionsWeb();

      } else {
        this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');
        this.loading = false;
      }
    });
  }

  onSelectAnyImage(event) {
    // console.log('evento no se ejecuta', event);

    if (event.target.files.length > 0) {
      this.fileImg = event.target.files[0];
      console.log(this.fileImg);
      if (this.fileImg.type.startsWith('application/')) {
        this.alert.alertDanger('Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.', '');
        this.fileImg = {};
        console.log(this.fileImg);
        if (Object.keys(this.fileImg).length === 0) {
          this.flagfileImg = false;
        }
      } else {
        this.flagfileImg = true;
        // this.updateConfiguration(this.configuracion);
      }
    }
  }

    generateRandomString() {
    let letters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 5; i++) {
      let randomIndex = Math.floor(Math.random() * letters.length);
      result += letters[randomIndex];
    }
    return result;

  }

}
