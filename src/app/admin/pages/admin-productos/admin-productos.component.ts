import { Component, ElementRef, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ServiceService } from '../../../services/service.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../../services/utils.service';
import { MigrationService } from '../../../services/migration.service';
import { NgxLoadingModule } from 'ngx-loading';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxLoadingModule],
  templateUrl: './admin-productos.component.html',
  styleUrl: './admin-productos.component.scss'
})
export default class AdminProductosComponent {
  @ViewChild("table") table!: ElementRef;
  jsonData: any = [];
  impuestosTarifas: any = [];
  impuestoSelect: any = '';

  configuracion: any = {};
  loading = false;
  public price = {
    before: 50,
    now: 0
  }
  public groups = [];
  public productsALL = [];
  public products = [];
  public searchProd = '';
  empresa = environment.empresa;
  urlBase = environment.firebaseUrl;
  enableUpdate = false;
  isLoading = false;
  sistema = environment.empresa;
  public productReferidos: any = [];
  public variables = {
    descripcion: '',
    fotourl: '',
    referido: ''
  }
  public searchProductsReferidos: any = {};
  public productSelected: any = {};
  public buttonsPay: any = {};
  public closeResult: string;
  public cotizationsSelected: any = {};
  urlProductos = 'productos%2F';
  urlProductosFB = 'productos';
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


  // Crear Producto 
  grupos: any = [];
  subGrupos: any = [];
  subGrupos2: any = [];
  tiposPrecio: any = [];
  marcas: any = [];
  datosICE: any = [];
  impuestoIva: any = [];
  preciosT: any = [];
  ivaSelected: any;
  ivaSelectedF: any;
  flagChanges = false;
  ivaPorcentaje: any;
  arregloPrecios: any = [];
  arregloPrecios2: any = [];
  arregloPreciosTemp: any = [];
  arregloPreciosReales: any = [];
  banderaLoader = false;
  // ----------- PRECIOS-------------
  tipoPA: any = 0;
  tipoPB: any = 0;
  tipoPC: any = 0;
  tipoPA_desgloce: any = 0;
  tipoPB_desgloce: any = 0;
  tipoPC_desgloce: any = 0;
  positionTemporal: any;
  // precios:any=[];

  tarifaIVADefecto = 0;
  ivaAnterior = 0;
  banderaTarifaDefecto: any;

  primeraVezCero = 0;
  primeraVezDoce = 0;
  urlBilling = `https://sofpymes.com/${environment.empresa}/common/movil/`;
  flagSearchP = false;
  flagProduct = false;
  productSelecnt: any = [];
  flagSearchCod = false;
  groupSelected: any;
  idEmpresa = environment.idShop;
  imagen: any;
  imgNumber: any;
  public imgSelected: any = [];
  // ------ IMAGENES-------
  fileImg: any;
  flagfileImg: any;
  constructor
    (
      private webService: ServiceService,
      private alert: AlertService,
      private util: UtilsService,
      private fireService: MigrationService


    ) {
  }

  async ngOnInit() {
    this.getConfiguration();
    await this.getGroups2();
    this.getImpuestoTarifa();
    await this.getImpuestoTarifa();
  }

  // ====================================================
  // 1. FORMULARIO PARA CREAR PRODUCTO

  formCrearProducto = new FormGroup({
    nombreUnico: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    productogrupo_codigo: new FormControl(''),
    id_subgrupo: new FormControl(''),
    productotipo_id: new FormControl(3),
    esServicio: new FormControl(1),
    marca_id: new FormControl(''),
    codigo2: new FormControl(''),
    codbarras1: new FormControl(''),
    codbarras2: new FormControl(''),
    codbarras3: new FormControl(''),
    existenciaMinima: new FormControl(1),
    existenciaMaxima: new FormControl(1000),
    prod_fecha_caducidad: new FormControl(null),
    especificaciones: new FormControl(0),
    unidad_medida: new FormControl(0),
    valor_medida: new FormControl(0),
    proteinas: new FormControl(0),
    calorias: new FormControl(0),
    iceporcent: new FormControl(''),
    ivaporcent: new FormControl(''),
    tiempo: new FormControl(0),
    ubicacion: new FormControl(0),
    origen: new FormControl(1),
    cant_bulto: new FormControl(''),
  })
  formEditarProducto = new FormGroup({
    nombreUnico: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    productogrupo_codigo: new FormControl(''),
    id_subgrupo: new FormControl(''),
    productotipo_id: new FormControl(3),
    esServicio: new FormControl(1),
    marca_id: new FormControl(''),
    codigo2: new FormControl(''),
    codbarras1: new FormControl(''),
    codbarras2: new FormControl(''),
    codbarras3: new FormControl(''),
    existenciaMinima: new FormControl(1),
    existenciaMaxima: new FormControl(1000),
    prod_fecha_caducidad: new FormControl(null),
    especificaciones: new FormControl(0),
    unidad_medida: new FormControl(0),
    valor_medida: new FormControl(0),
    proteinas: new FormControl(0),
    calorias: new FormControl(0),
    iceporcent: new FormControl(''),
    ivaporcent: new FormControl(''),
    tiempo: new FormControl(0),
    ubicacion: new FormControl(0),
    origen: new FormControl(1),
    cant_bulto: new FormControl(''),
  })
  // ====================================================


  formStock = new FormGroup({
    checkStock: new FormControl(true)
  })

  formSearchProduct = new FormGroup({
    inputSearch: new FormControl()
  })
  formSearchReferido = new FormGroup({
    referido: new FormControl()
  })

  formCrearMarca = new FormGroup({
    nombre: new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
  })



  openModalNormal(name) {
    let modal = this.util.createModal(name);
    modal.show();
  }

  async openModalNormal2(name, product) {
    console.log('product', product);

    // Agregar datos para controlar si cambiaron proceder a su actualizacion
    this.productReferidos = [];
    this.variables.descripcion = product.descripcion;
    this.variables.fotourl = product.fotourl;
    this.searchProductsReferidos = {};
    this.searchProd = '';
    // Obtener los referidos
    if (product.referidos) {
      this.loading = true;
      await this.webService.getInfoProductsReferidos(product, 'configuracion', this.configuracion).then(async (resreferidos: any) => {
        this.productReferidos = this.formatNameProductReferido(resreferidos);
        console.log('this.productReferidos', this.productReferidos);

      });
      this.loading = false;
    }
    this.productSelected = product;

    let modal = this.util.createModal(name);
    modal.show();
  }
  openModalNormalE(name, prod) {
    this.flagProduct = true;
    this.getGrupos();
    this.getDataInicial();
    this.getSubgrupos2(prod.id_grupo);

    console.log('prod', prod);
    this.productSelecnt = prod
    this.tarifaIVADefecto = parseInt(prod.impuesto_porcent);
    this.ivaAnterior = parseInt(prod.impuesto_porcent);
    console.log('this.tarifaIVADefecto', this.tarifaIVADefecto);
    console.log('this.ivaSelected', this.ivaAnterior);
    this.ivaSelectedF = prod.id_ivaporcent;
    console.log('iva selected', this.ivaSelectedF);

    this.valoresDefecto(this.productSelecnt.precios);

    //   for(let a of this.subGrupos2){
    //     if(prod.id_subgrupo == a.id_sub){
    //       this.formEditarProducto.controls['id_subgrupo'].setValue(a.id_sub);

    //     }
    // }


    this.formEditarProducto.setValue({
      'nombreUnico': prod.pro_nom,
      'descripcion': prod.descripcion,
      'productogrupo_codigo': prod.id_grupo,
      'id_subgrupo': prod.id_subgrupo,
      'productotipo_id': prod.productotipo_id,
      'esServicio': prod.esServicio,
      'marca_id': prod.marca_id,
      'codigo2': prod.codigo2,
      'codbarras1': prod.codbarras1,
      'codbarras2': prod.codbarras2,
      'codbarras3': prod.codbarras3,
      'existenciaMinima': prod.existenciaMinima,
      'existenciaMaxima': prod.existenciaMaxima,
      'prod_fecha_caducidad': prod.prod_fecha_caducidad,
      'especificaciones': prod.especificaciones,
      'unidad_medida': prod.unidad_medida,
      'valor_medida': prod.valor_medida,
      'proteinas': prod.proteinas,
      'calorias': prod.calorias,
      'iceporcent': prod.iceporcent,
      'ivaporcent': prod.ivaporcent,
      'tiempo': prod.tiempo,
      'ubicacion': prod.ubicacion,
      'origen': prod.origen,
      'cant_bulto': prod.cant_bulto,
    })

    let modal = this.util.createModal(name);
    modal.show();
  }
  // METODOS MODALES
  closeModal(flag: boolean, name: string) {
    let modal = this.util.createModal(name);

    if (flag) {
      modal.hide();
    } else {
      modal.hide();
    }
  }


  searchProduct2(form) {
    this.loading = true;
    console.log('form', form);
    let conf = this.configuracion;
    conf.id_bodega = 0;
    this.webService.search_products_free(this.urlBilling, form.inputSearch).then((resprod: any) => {
      console.log('resprod', resprod);

      if (!resprod.error) {
        if (resprod.rta == true) {
          for (let p of resprod.data) {
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.nombre_grupo = this.getNameGroup(p.id_grupo);
            p.nombre_subgrupo = this.getNameGrupoSubgrupo(p.id_subgrupo, 'grupo');
          }
          this.products = resprod.data;
          console.log(this.products);
          this.loading = false;

        } else {
          this.alert.alertWarning('No se ha encontrado productos', '');
          this.products = [];
          this.loading = false;

        }
      } else {
        this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');
        this.loading = false;
        this.products = [];
      }
    })
    this.flagSearchCod = true;
  }

  async viewAttribuesProduct(value, type) {
    this.loading = true;
    switch (type) {
      case 'descripcion':
        this.configuracion.descripcion_producto = value.target.checked;
        break;
      case 'marca':
        this.configuracion.marca_producto = value.target.checked;
        break;
      case 'peso':
        this.configuracion.peso_producto = value.target.checked;
        break;
      case 'medida':
        this.configuracion.medida_producto = value.target.checked;
        break;
      case 'ubicacion':
        this.configuracion.ubicacion_producto = value.target.checked;
        break;
      case 'origen':
        this.configuracion.origen_producto = value.target.checked;
        break;
      case 'cantidadxbulto':
        this.configuracion.cantidadxbulto_producto = value.target.checked;
        break;
      default:
    }
    // await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
    //   this.loading = false;
    //   await this.getConfiguration();
    //   this.alert.alertSuccess('Atributo a visualizar actualizado exitosamente', '');
    // });

    await this.webService
      .updateConfiguracion(this.configuracion)
      .then(async (data) => {
        console.log('resultado', data);

        this.loading = false;
        await this.getConfiguration();
        this.alert.alertSuccess('Atributo a visualizar actualizado exitosamente', '');
      });
  }

  async getConfiguration() {
    console.log('ENTRA');

    this.loading = true;
    await this.webService
      .getGeneral('configuracion/' + this.idEmpresa)
      .subscribe({
        next: (resp: any) => {
          console.log('config', resp);
          this.configuracion = resp[0];
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
        },
        error: (err: any) => {
          this.loading = false;
          console.log(err);
        },
        complete: () => { },
      });
  }

  async filtroStock(event: any) {
    // console.log('Event', event.target.checked);
    if (event.target.checked) {
      await this.selectGroup(this.groups[0].idgrupo);
    } else {
      await this.selectGroup(this.groups[0].idgrupo);
    }
  }

  getGrupos() {
    let i: any;
    this.webService.getGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/get_groups_new_product`).subscribe(async (data: any) => {
      this.grupos = await data.data
      // ////console.log (this.grupos);
      this.formCrearProducto.controls['productogrupo_codigo'].setValue(this.grupos[0].codigo);
      this.getSubgrupos(this.grupos[0].codigo);
      // this.formCrearProducto.controls['id_subgrupo'].patchValue(this.subGrupos[0].codigo);
    })
  }
  getGrupos2() {
    let i: any;
    this.webService.getGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/get_groups_new_product`).subscribe(async (data: any) => {
      this.grupos = await data.data
      console.log(this.grupos);
      // this.formCrearProducto.controls['productogrupo_codigo'].setValue(this.grupos[0].codigo);
      this.getSubgrupos(this.grupos[0].codigo);
      // this.formCrearProducto.controls['id_subgrupo'].patchValue(this.subGrupos[0].codigo);
    })
  }

  async getGroups2() {
    this.getGrupos2();
  }

  async getGroups() {
    // console.log("getGroups");
    let tipo_web = this.configuracion.tipo_web;
    this.loading = true;
    // await this.webService.getUrlEmpresa().then(async (url) => {
    if (tipo_web == 1 || tipo_web == 2 || tipo_web == 4) {
      await this.webService.getGruposService(this.urlBilling, 'filter').then(async (resgrupos: any) => {
        if (!resgrupos.error) {
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
          this.alert.alertDanger('Error al obtener las categorias', '',);
        }
      });
    }
    if (tipo_web == 3) {
      console.log("Tienda con 2 BD, codigo se encuentra en proceso");
    }
    // });
    this.loading = false;
  }

  async selectGroup(id_grupo) {
    console.log('target', id_grupo);
    
    this.loading = true;
    id_grupo = id_grupo.target.value;
    console.log('search', id_grupo);
    await this.getSubgrupos(id_grupo);
    this.groupSelected = id_grupo;
    this.loading = true;
    if (this.formStock.controls['checkStock'].value) {
      // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getProductsByGroupFree(this.urlBilling, id_grupo, this.configuracion).then(async (resprod: any) => {
        if (resprod.rta == true) {
          this.productsALL = resprod.rta;
          for (let p of resprod.data) {
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.pro_cod = p.id_producto;
            p.nombre_grupo = this.getNameGroup(p.id_grupo);
            // p.nombre_subgrupo = this.subGrupos
            p.nombre_subgrupo = this.getNameSugroup(p.id_subgrupo);
          }

          this.products = resprod.data;
          this.flagSearchP = true;
          if (id_grupo != '99') {
            this.products = this.products.filter((producto: any) => producto.stockactual > 0)
            console.log(' this.products ', this.products);
          } else {
            this.products = this.products.filter((producto: any) => producto.stockactual >= 0)
            console.log(' this.products ', this.products);
          }

          this.loading = false;
        } else {
          this.products = [];
          this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');

        }
      });
      // });
    } else {
      await this.webService.getUrlEmpresa().then(async (url) => {
        await this.webService.getProductsByGroupFree(url, id_grupo, this.configuracion).then((resprod: any) => {
          if (resprod.rta == true) {
            this.productsALL = resprod.rta;
            for (let p of resprod.data) {
              // if(this.formStock.controls['checkStock'].value){
              p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
              p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
              p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
              p.pro_cod = p.id_producto;
              p.nombre_grupo = this.getNameGroup(p.id_grupo);
              p.nombre_subgrupo = this.getNameSugroup(p.id_subgrupo);
              // }
            }

            this.products = resprod.data;

          } else {
            this.products = [];
            this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');

          }
        });
      });

    }
    this.loading = false;
    this.flagSearchCod = false;
  }

  async selectGroup2(id_grupo) {
    console.log('target', id_grupo);
    
    this.loading = true;
    // id_grupo = id_grupo.target.value;
    console.log('search', id_grupo);
    await this.getSubgrupos(id_grupo);
    this.groupSelected = id_grupo;
    this.loading = true;
    if (this.formStock.controls['checkStock'].value) {
      // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getProductsByGroupFree(this.urlBilling, id_grupo, this.configuracion).then(async (resprod: any) => {
        if (resprod.rta == true) {
          this.productsALL = resprod.rta;
          for (let p of resprod.data) {
            p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
            p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
            p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
            p.pro_cod = p.id_producto;
            p.nombre_grupo = this.getNameGroup(p.id_grupo);
            // p.nombre_subgrupo = this.subGrupos
            p.nombre_subgrupo = this.getNameSugroup(p.id_subgrupo);
          }

          this.products = resprod.data;
          this.flagSearchP = true;
          if (id_grupo != '99') {
            this.products = this.products.filter((producto: any) => producto.stockactual > 0)
            console.log(' this.products ', this.products);
          } else {
            this.products = this.products.filter((producto: any) => producto.stockactual >= 0)
            console.log(' this.products ', this.products);
          }

          this.loading = false;
        } else {
          this.products = [];
          this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');

        }
      });
      // });
    } else {
      await this.webService.getUrlEmpresa().then(async (url) => {
        await this.webService.getProductsByGroupFree(url, id_grupo, this.configuracion).then((resprod: any) => {
          if (resprod.rta == true) {
            this.productsALL = resprod.rta;
            for (let p of resprod.data) {
              // if(this.formStock.controls['checkStock'].value){
              p.checked_mas_vendido = this.webService.checkedAtributes(p.mas_vendido);
              p.checked_es_promo = this.webService.checkedAtributes(p.es_promo);
              p.checked_vista_web = this.webService.checkedAtributes(p.vista_web);
              p.pro_cod = p.id_producto;
              p.nombre_grupo = this.getNameGroup(p.id_grupo);
              p.nombre_subgrupo = this.getNameSugroup(p.id_subgrupo);
              // }
            }

            this.products = resprod.data;

          } else {
            this.products = [];
            this.alert.alertWarning('No se ha encontrado productos en el grupo seleccionado', '');

          }
        });
      });

    }
    this.loading = false;
    this.flagSearchCod = false;
  }

  async getSubgrupos(id: any) {
    let i: any;
    this.webService.getGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/get_subgrupos_new_produc?idgrupo=` + id).subscribe(async (data: any) => {
      console.log('SubGrupos', data.data);
      this.formCrearProducto.controls['id_subgrupo'].patchValue(data.data[0].id_sub);

      this.subGrupos = await data.data;
      console.log(' ==== > subGrupos', this.subGrupos);
      this.getNameSugroup(data.data[0].id_sub)
    })
  }

  async getSubGroups(idgrupo) {
    this.loading = true;
    this.restablishFilters('');
    this.catalogue.id_grupo = idgrupo;
    // await this.webService.getUrlEmpresa().then(async (url) => {
    if (idgrupo == 0) {
      await this.getProductsAll();
    } else {
      await this.webService.getSubgruposService(this.urlBilling, idgrupo).then(async (ressub: any) => {
        if (!ressub.error) {
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
              await this.getProductsGrupoSubgrupo(resorderg[1].id_sub);
              this.catalogue.name_grupo = this.getNameGrupoSubgrupo(idgrupo, 'subgrupo');
            });
          } else {
            this.alert.alertWarning('No posee sub categorias', '');

          }
        } else {
          this.alert.alertDanger('Error al obtener las sub categorias', '');
        }
      });
    }
    // });
    this.loading = false;
  }

  // id_sub = 0 Traer todos los productos sin importar el subgrupo
  async getProductsGrupoSubgrupo(id_sub) {
    this.loading = true;
    await this.webService.getUrlEmpresa().then(async (url) => {
      if (id_sub >= 0) {
        await this.restablishFilters('grupo');
        await this.webService.getProductosService(url, this.catalogue.id_grupo, id_sub, this.configuracion).then(async (resprod: any) => {
          if (resprod.rta == true) {
            let aux = this.stablishingPriceProduct(resprod.data);
            aux.push(this.webService.createProductViewGroupSubgroup('-1', this.catalogue.id_grupo, this.groups, id_sub, this.catalogue.subGrupos));
            this.catalogue.products = this.webService.orderProductForId(aux, 'asc');
          } else {
            this.catalogue.products = [];
            this.alert.alertWarning('No se ha encontrado productos', '',);
          }
        });
      } else {
        this.catalogue.name_subgrupo = '';
        await this.restablishFilters('subgrupo');
        await this.webService.getProductosGrupo(url, this.catalogue.id_grupo, this.configuracion).then(async (resprod: any) => {
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
    });
    this.catalogue.view_products = this.webService.showProducts(this.catalogue.products);
    this.catalogue.products_all = this.catalogue.products;

    // console.log(this.catalogue.products);
    // console.log("Show", this.catalogue.view_products);

    this.loading = false;
  }

  async getProductsAll() {
    this.loading = true;
    await this.restablishFilters('');
    this.catalogue.complete_inventory = true;
    await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getProductosAll(url, this.configuracion).then(async (resprod: any) => {
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
    });
    this.catalogue.view_products = this.webService.showProducts(this.catalogue.products);
    this.catalogue.products_all = this.catalogue.products;


    // console.log(this.catalogue.products);
    // console.log("Show", this.catalogue.view_products);


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

  getNameGroup(id) {
    const group = this.groups.find(g => g.codigo === id);
    return group ? group.nombre : null; // Retorna el nombre o null si no existe el grupo
  }

  getNameSugroup(id) {
    // console.log('entra a este id ==> ', id, this.subGrupos);   
    const group = this.subGrupos.find(g => g.id_sub === id);
    return group ? group.nombre : null; // Retorna el nombre o null si no existe el grupo

  }

  getNameGrupoSubgrupo(id, type) {
    console.log('entra aqui', id, type);

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

  async modalConfigurationAtributesProduct(configurationProductModal, product) {
    // Agregar datos para controlar si cambiaron proceder a su actualizacion
    this.productReferidos = [];
    this.variables.descripcion = product.descripcion;
    this.variables.fotourl = product.fotourl;
    this.searchProductsReferidos = {};
    this.searchProd = '';
    // Obtener los referidos
    if (product.referidos) {
      this.loading = true;
      await this.webService.getInfoProductsReferidos(product, 'configuracion', this.configuracion).then(async (resreferidos: any) => {
        this.productReferidos = this.formatNameProductReferido(resreferidos);
        console.log(' this.productReferidos', this.productReferidos);

      });
      this.loading = false;
    }
    this.productSelected = product;
    // this.modalCtrl.open(configurationProductModal, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'lg' }).result.then(async (result) => {
    //   this.closeResult = `Closed with: ${result}`;
    //   this.variables = {
    //     descripcion: '',
    //     fotourl: '',
    //     referido: '',
    //   }

    // }, (reason) => {
    //   this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //   this.cotizationsSelected = {};
    //   this.variables = {
    //     descripcion: '',
    //     fotourl: '',
    //     referido: ''
    //   }
    // });
  }

  formatNameProductReferido(referidos) {
    for (let p of referidos) {
      let name_code = p.codigo + ' / ' + p.nombreUnico;
      p.nombre = this.webService.setDescriptionTitle(name_code, 'title-referidos');
    }
    return referidos;
  }

  verImagen(name, url) {
    this.imagen = url;
    let modal = this.util.createModal(name);
    modal.show();
  }

  changePicture(product, name, imgNumber) {
    console.log('product', product);
    console.log('imgNumber', imgNumber);
    this.imgNumber = imgNumber;
    if (imgNumber == 1) {
      this.imagen = product.imagen_uno;
    } else if (imgNumber == 2) {
      this.imagen = product.imagen_dos;
    } else if (imgNumber == 3) {
      this.imagen = product.imagen_tres;
    } else {
      this.imagen = product.imagen_cuatro;
    }

    this.imgSelected = product;
    console.log('url imagen ', imgNumber, ' ==== > ', this.imagen);


    let modal = this.util.createModal(name);
    modal.show();

  }

  // ----------------- IMAGES------------------
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

  async uploadImage(type) {
    console.log('INFO OTHER', this.imgSelected);
    const now = new Date().getTime();

    let fireBase;
    let bd;
    const file: File = this.fileImg;
    let pathFB;
    let rutaBD;
    if (file) {
      this.loading = true;


      if (type == 1 || type == 2 || type == 3 || type == 4) {
        fireBase = this.urlProductosFB;
        bd = this.urlProductos;
        pathFB = this.empresa + '/' + fireBase + '/' + 'producto' + this.imgSelected.id_producto + '_' + type + now;
        rutaBD = bd + 'producto' + this.imgSelected.id_producto + '_' + type + now;
        if (type == 1) {
          this.fireService.deleteImage(this.imgSelected.imagen_uno);
          let fileCompress;
          await this.fireService.compressFile(file).then(async (res: any) => {
            fileCompress = await res;
          });
          await this.fireService.uploadImage(fileCompress, pathFB).then((data: any) => {
            // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
          });

          // this.alert.alertSuccess('Imagen 1 se ha cargado correctamente', '',);

          await this.updateImageProduct(rutaBD, 'imagen_uno', this.imgSelected);

        } else if (type == 2) {
          this.fireService.deleteImage(this.imgSelected.imagen_dos);
          let fileCompress;
          await this.fireService.compressFile(file).then(async (res: any) => {
            fileCompress = await res;
          });
          await this.fireService.uploadImage(fileCompress, pathFB).then((data: any) => {
            // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
          });

          await this.updateImageProduct(rutaBD, 'imagen_dos', this.imgSelected);
        } else if (type == 3) {
          this.fireService.deleteImage(this.imgSelected.imagen_tres);
          let fileCompress;
          await this.fireService.compressFile(file).then(async (res: any) => {
            fileCompress = await res;
          });
          await this.fireService.uploadImage(fileCompress, pathFB).then((data: any) => {
            // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
          });
          await this.updateImageProduct(rutaBD, 'imagen_tres', this.imgSelected);
        } else {
          this.fireService.deleteImage(this.imgSelected.imagen_cuatro);
          let fileCompress;
          await this.fireService.compressFile(file).then(async (res: any) => {
            fileCompress = await res;
          });
          await this.fireService.uploadImage(fileCompress, pathFB).then((data: any) => {
            // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
          });
          await this.updateImageProduct(rutaBD, 'imagen_cuatro', this.imgSelected);
        }

      }

    } else {
      this.alert.alertDanger('Seleccione una imagen, por favor.', '',);
    }
  }

  async updateImageProduct(res, atributo, other) {

    // let data = JSON.parse(res);
    let data = res;
    let imageDelet;

    if (atributo == 'imagen_uno') {
      imageDelet = other.imagen_uno;
      other.imagen_uno = data;
    }
    if (atributo == 'imagen_dos') {
      imageDelet = other.imagen_dos;
      other.imagen_dos = data;
    }
    if (atributo == 'imagen_tres') {
      imageDelet = other.imagen_tres;
      other.imagen_tres = data;
    }
    if (atributo == 'imagen_cuatro') {
      imageDelet = other.imagen_cuatro;
      other.imagen_cuatro = data;
    }

    let query = {
      tabla: 'billing_producto',
      id: 'codigo',
      valor_id: other.pro_cod,
      atributo: atributo,
      valor_atributo: res
    }

    await this.webService.postGeneral2(this.urlBilling + 'update_atributo_tabla', query).subscribe(async (resupd: any) => {
      // console.log('****',resupd);

      if (resupd.rta == true) {
        this.alert.alertSuccess('', 'Imagen del producto actualizada exitosamente');
        this.closeModal(true, '#modalPicture');
        this.loading = false;
      } else {
        this.alert.alertDanger('', 'Ha ocurrido un error, intente nuevamente')
        this.closeModal(true, '#modalPicture');
        this.loading = false;
      }
    });

  }

  crearMarca(form: any) {
    this.loading = true;
    let datos = {
      marca: form
    }
    this.webService.postGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/register_new_marca`, datos).subscribe((data: any) => {
      ////console.log (data);
      this.loading = false;
      if (data.rta) {
        // this.apiService.showToastOK(data.msg, '');
        this.alert.alertSuccess('', data.msg)

      }
      this.closeModal(true, '#modalCrearMarca');
    })
  }

  // ------------------------------- FUNCIONES BOTONES SUPERIORES------------------------------------
  exportToExcel() {

    if (this.products.length == 0) {
      this.alert.alertWarning('Debe primero elegir un grupo de productos', '')
    } else {
      const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
        this.table.nativeElement
      );
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
      const fmt = "@";
      wb.Sheets["Reporte"]["F"] = fmt;

      /* save to file */
      XLSX.writeFile(wb, `Inventario` + ".xlsx");
    }
  }

  getImpuestoTarifa() {
    this.webService.getGeneral2(`https://sofpymes.com/${this.empresa}/pventa_granel/api_restaurant/impuesto_tarifa`).subscribe((data: any) => {
      console.log('impuesto ', data);

      this.impuestosTarifas = data.impuestotarifa;

    })
  }

  onFileChange(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files ? inputElement.files[0] : null;

    if (!file) {
      console.error('No se seleccionó ningún archivo');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convertir la hoja de Excel a JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

      // Transformar el JSON al formato estándar
      const transformedData = this.transformToStandardKeys(jsonData);

      this.jsonData = transformedData;
      const filteredUsers = this.removeNullObjects(this.jsonData);
      this.jsonData = filteredUsers;
      console.log(this.jsonData);

    };

    reader.readAsArrayBuffer(file);

  }

  removeNullObjects(users: any[]): any[] {
    return users.filter(user => {
      // Get all values of the object
      const values = Object.values(user);

      // Check if at least one value is not null
      // If all values are null, the some() will return false and the object will be filtered out
      return values.some(value => value !== null);
    });
  }


  transformToStandardKeys(data: (string | number)[][]): any[] {
    // Las claves estándar que vamos a usar
    const standardKeys: string[] = [
      "nombre_prod",
      "grupo",
      "subgrupo",
      "marca",
      "cantidad",
      "cod_barras1",
      "peso_pieza",
      "valor_medida",
      "ubicacion",
      "origen",
      "cant_bulto",
      "pa_sin_iva",
      "pb_sin_iva",

    ];

    return data.map((row: (string | number)[], index: number) => {
      if (index === 0) {
        // Saltar la primera fila si es un encabezado
        return null;
      }

      // Crear un nuevo objeto con las claves estándar y los valores de la fila
      const mappedRow: Record<string, string | number | null> = {};
      standardKeys.forEach((key: string, i: number) => {
        mappedRow[key] = row[i] === '' || row[i] === undefined ? null : row[i];
      });

      return mappedRow;
    }).filter(item => item !== null);  // Filtrar cualquier fila nula (ej. encabezado)
  }

  selectTarifa(event: any) {
    this.impuestoSelect = event.target.value;
    console.log('tarifa select', this.impuestoSelect);

  }

  cargarInventario() {
    this.loading = true;
    if (this.impuestoSelect == '') {
      this.alert.alertDanger("Debe seleccionar una tarifa", '');

      this.loading = false;
    } else {
      // let ajuste=this.jsonData;
      let obj = {
        "impuestotarifa_id": this.impuestoSelect,
        "ajuste_inicial": this.jsonData
      }
      console.log('objeto que se va', obj);

      this.webService.postGeneral2(`https://sofpymes.com/${this.empresa}/pventa_granel/api_restaurant/load_ajuste_inicial`, obj).subscribe((data: any) => {
        console.log('data update', data);
        this.alert.alertSuccess("Inventario cargado correctamente", '');
        this.loading = false;
        this.closeModal(true, '#modalCrearInventario');
        this.getGroups2();
      })

    }
  }

  async updateAtributesProduct(e, type, product) {
    this.loading = true;

    let data = {
      tabla: 'billing_producto',
      id: 'codigo',
      valor_id: '',
      atributo: '',
      valor_atributo: 0
    }
    let val = 0;
    let send = {}

    if (type == 'mas_vendido' || type == 'es_promo' || type == 'vista_web') {
      if (e.target.checked == true) {
        val = 1;
      } else {
        val = 0;
      }
    }

    if (type == 'mas_vendido') {
      data.valor_id = product.pro_cod;
      data.atributo = 'mas_vendido';
      data.valor_atributo = val;
    }

    if (type == 'es_promo') {
      data.valor_id = product.pro_cod;
      data.atributo = 'es_promo';
      data.valor_atributo = val;
    }

    if (type == 'vista_web') {
      data.valor_id = product.pro_cod;
      data.atributo = 'vista_web';
      data.valor_atributo = val;
    }

    // await this.webService.getUrlEmpresa().then(async (url) => {
    if (type == 'descripcion') {
      let bandera = false;
      // Actualizar descripcion o video de yotube
      if (product.descripcion != this.variables.descripcion || product.fotourl != this.variables.fotourl) {
        bandera = true;
        send = {
          data: {
            "tabla": "billing_producto",
            "id": "codigo",
            "valor_id": product.id_producto,
            "datos": {
              "descripcion": product.descripcion,
              "fotourl": product.fotourl
            }
          },
          "endPoint": this.urlBilling + "update_atributo_tabla"
        }
        await this.webService.updateAttributesTableBilling(send).then(async (res: any) => {
          this.loading = false;
          if (!res.error) {
            if (res.rta == true) {
              this.alert.alertSuccess('Información actualizada con éxito', '');
            } else {
              this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');
            }
          } else {
            this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
          }
        });
      }

      if (bandera == false) {
        this.alert.alertWarning('No se realizó ningún cambio, campos vacios o similares', '');

      }
      this.loading = false;
    } else {
      await this.webService.updateAtributeProduct(this.urlBilling, data).then((resupd: any) => {
        this.loading = false;
        if (!resupd.error) {
          if (resupd.rta == true) {
            this.alert.alertSuccess('Información actualizada con éxito', '');
          } else {
            this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');
          }
        } else {
          this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
        }
      });
    }
    // });
  }

  async deleteProductReferido(product, productReferidos, productSelected) {
    this.loading = true;
    let new_referido = '';
    // Eliminar el producto referido del objeto
    for (let p of productReferidos) {
      if (p.codigo == product.codigo) {
        productReferidos.splice(productReferidos.indexOf(p), 1);
      }
    }
    // Crear los referidos
    for (let p of productReferidos) {
      new_referido += p.codigo + ',';
    }
    // Actualizar nuevos referidos
    let data = {
      tabla: 'billing_producto',
      id: 'codigo',
      valor_id: productSelected.id_producto,
      atributo: 'referidos',
      valor_atributo: new_referido.slice(0, -1)
    }
    // await this.webService.getUrlEmpresa().then(async (url) => {
    await this.webService.updateAtributeProduct(this.urlBilling, data).then((resupd: any) => { });
    // });
    this.loading = false;
  }


  async searchProductForReferido(form) {
    console.log('searchProd', form);


    if (form.referido) {
      this.loading = true;
      // await this.webService.getUrlEmpresa().then(async (url) => {
      // await this.webService.searchProductCodeName(url, searchProd, this.configuracion).then((ressearch: any) => {
      this.webService.search_products_free(this.urlBilling, form.referido).then((resprod: any) => {
        // if (!ressearch.error) {
        //     if (ressearch.rta == true) {
        //       this.searchProductsReferidos = ressearch.data
        console.log('resprod ==> ', resprod);

        // if (!resprod.error) {
        if (resprod.rta) {
          this.searchProductsReferidos = resprod.data
        } else {
          this.alert.alertWarning('No se ha encontrado resultados', '');

        }
        // } else {
        //   this.toaster.error('Error en el servidor, intente nuevamente', '', { timeOut: 3000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
        // }
        //   });
      });
      this.loading = false;
    } else {
      this.alert.alertDanger('Ingrese el producto que desea buscar', '');

    }
  }

  async addProductReferido(product, productSelected) {
    this.loading = true;
    let data = {
      id_producto: productSelected.id_producto,
      id_referido: product.id_producto,
      bodega_id: this.configuracion.id_bodega
    }
    // await this.webService.getUrlEmpresa().then(async (url) => {
    await this.webService.insertReferidosProduct(this.urlBilling, data).then(async (resref: any) => {
      if (resref.rta == true) {
        await this.webService.getInfoProductsReferidos(productSelected, 'configuracion', this.configuracion).then(async (resreferidos: any) => {
          this.productReferidos = this.formatNameProductReferido(resreferidos);
        });
        this.alert.alertSuccess(resref.message, '');

      } else {
        this.alert.alertDanger(resref.message, '');
      }
    });
    // });
    this.loading = false;
  }

  numberDecimal(num) {
    let n = parseFloat(num);
    return this.webService.dosDecimales(n);
  }

  calcularPrecio2(event: any, i: any, obj: any) {
    console.log(obj);

    let val: any;
    let cant = event.target.value;
    //console.log('tarifa defecto', this.tarifaIVADefecto);
    //console.log('ENTRO CANTIDAD', cant);
    this.arregloPreciosReales.push(cant);
    if (this.flagChanges) {
      console.log(' this.flagChanges', this.ivaSelectedF);

    } else {
      this.ivaSelectedF = this.productSelecnt.id_ivaporcent;
    }
    // this.ivaSelected = obj.id_ivaporcent;
    console.log('IVA SELECCCIONADO', this.ivaSelectedF);

    console.log('preciosReales', this.arregloPreciosReales);

    this.positionTemporal = i;
    console.log('this.tarifaIVADefecto', this.tarifaIVADefecto);


    if (cant < 0 || cant == '') {
      this.alert.alertDanger('Cantidad no puede ser menor a cero o ir en blanco', '');

      const input: HTMLInputElement = <HTMLInputElement>document.getElementById('entrada' + i);
      input.value = '0';
      const input2: HTMLInputElement = <HTMLInputElement>document.getElementById('pos' + i);
      input2.value = '0';
    } else {
      const inputElement = document.getElementById('entrada' + this.positionTemporal) as HTMLInputElement;

      if (inputElement) {
        inputElement.value = cant;

      }

      let inputElement2 = document.getElementById('pos' + this.positionTemporal) as HTMLInputElement;

      if (inputElement2) {

        if (this.tarifaIVADefecto == 12) {
          val = cant / 1.12
          //console.log('tran', val);

          inputElement2.value = val.toString();
          console.log('inputElement2', inputElement2.value);

        } else if (this.tarifaIVADefecto == 15) {
          console.log("ENTRA CUANDO IVA ES 15");

          val = cant / 1.15;
          console.log('VAL 15', val);
          inputElement2.value = val.toString();

          //console.log('tran 

        } else {
          inputElement2.value = cant;
        }
      }
    }

    if (this.tarifaIVADefecto == 12) {
      cant = val;
    }
    if (this.tarifaIVADefecto == 15) {
      cant = val;
    }
    console.log('CANTIDAD VAL ', cant);
    this.valoresDefecto(this.arregloPrecios2);
    console.log('this.arregloPrecios VAL ', this.arregloPrecios2);
    this.actualizarValor(this.arregloPrecios2, this.positionTemporal, cant);

  }

  valoresDefecto(precios) {
    console.log('llega precios', precios);
    let arrTemp = [];
    // this.arregloPrecios=[];
    for (let p of precios) {
      let newData = {
        "id_precio": p.id_precio,
        "id": p.id,
        "id_producto": "",
        "valor": p.valor + '',
        "id_tipo": p.id_tipo,
        "cantidad_volumen": 0,
        "porcent_rentabilidad": 0
      }
      arrTemp.push(newData);
    }
    // this.arregloPrecios=[];
    this.arregloPrecios2 = arrTemp;
    console.log('arreglo precios 2', this.arregloPrecios2);

  }

  actualizarValor(arr: any, position: number, nuevoValor: any): void {

    const precio = arr.find((p, index) => index === position);

    if (precio) {
      precio.valor = nuevoValor;
      precio.valor += '';
    } else {
      console.error("La posición está fuera de los límites del arreglo.");
    }
  }

  pricePlusIva(valor, iva) {
    return valor * (1 + (iva / 100));
  }

  elegirGrupo(event: any) {
    this.getSubgrupos(event.target.value);
  }

    getDataInicial(){
        let i:any
        this.webService.getGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/get_atributes_new_product?marca=1&impuesto_ice=1&impuesto_iva=1&precios=1&tipo_producto=1&guarniciones=1`).subscribe((data:any)=>{
          ////console.log (data);
          this.marcas = data.marca;
          this.datosICE = data.impuesto_ice;
          this.impuestoIva =  data.impuesto_iva;
          this.preciosT = data.precios;
          this.formCrearProducto.controls['marca_id'].setValue(this.marcas[0].id);
          this.formCrearProducto.controls['iceporcent'].setValue('');
          this.ivaSelected = this.impuestoIva[0].id;
          this.ivaPorcentaje = this.impuestoIva[0].tarporcent;
          ////console.log ('% IVA DEFECTO',this.ivaPorcentaje  );
          for (let i = 0; i < this.impuestoIva.length; i++) {
            // this.precios.push(new FormControl('0'));
           
          }
          let obj:any;
          for (let j = 0; j < this.preciosT.length; j++) {
           let obj = {
              "id_precio": this.preciosT[j].id,
              "id_producto": "",
              "valor": 0,
              "id_tipo": this.preciosT[j].nombre,
              "cantidad_volumen": 0,
              "porcent_rentabilidad": 0
            }
            this.arregloPrecios.push(obj)
          }
        })
    
      }
 async getSubgrupos2(id:any){
    let i:any;
    this.webService.getGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/get_subgrupos_new_produc?idgrupo=`+id).subscribe(async(data:any)=>{
      console.log ('SubGrupos',data.data);
      // this.formEditarProducto.controls['id_subgrupo'].patchValue(data.data[0].id_sub);

      this.subGrupos2 = await  data.data;
      console.log(' ==== > subGrupos', this.subGrupos);
      this.getNameSugroup(data.data[0].id_sub)
    })
  }

   editarProducto(form:any){

    console.log('FORM',form);
    form.codigo= this.productSelecnt.id_producto;
    console.log('productSelecnt',this.productSelecnt);
    console.log('arregloPrecios',this.arregloPrecios2);
    console.log('ivaSelected',this.ivaSelectedF);
    this.banderaLoader= true;
    form.ivaporcent= this.ivaSelectedF;

    // let data :any;
    
    let arrP = [];
    
    for(let p of this.arregloPrecios2){
      let newData  = {
        "id":  p.id,
        "valor": p.valor+'',
        
        "cantidad_volumen": 0,
        "porcent_rentabilidad": 0
      }
      arrP.push(newData); 
    }

        


    let datos ={
      producto:form,
      // precios:this.arregloPrecios2,
      precios:arrP,
      guarniciones : []
    }    

    console.log('DATOS', datos);
    this.webService.postGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/update_product`, datos).subscribe((data:any)=>{
    this.banderaLoader = false;  
    if(data.rta){
      this.alert.alertSuccess(data.msg, '');

    }
    this.closeModal(true, '#modalEditarProducto');
    this.selectGroup2(this.groupSelected)
    // this.getGroups();   
    })

    // ---------------------------- CREAR GRUPO , SUBGRUPO  & MARCA ==========================================
    
  }


}
