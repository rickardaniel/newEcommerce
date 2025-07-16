import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../../services/service.service';

@Component({
  selector: 'app-detail-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './detail-product.component.html',
  styleUrl: './detail-product.component.scss'
})
export class DetailProductComponent implements OnChanges {
  @Input('product')product:any;
  productSelect:any;
  arrayFotos:any=[];
  imgDefault:any;
  urlFB = environment.firebaseUrl;
  imgLogo:any;
  configuration:any=[];
  //CANTIDAD ADD PRODUCT
  cant=1;

  // ====================
  // ====================
  selectedColor: any = null;
  selectedSizeId: number | null = null; // Variable para guardar la talla seleccionada
  stockDinamic: number | null = 0;
  productSelectDefault:any=[];
  public login: any = {};
   public configurationVariables = {
    show_price: 1,
    show_attributes_product: false,
    guarnition: [],
    exists_referidos: false,
    referidos: [],
    spinner: false,
    productsSold: [],
  }

    public productSelected: any = {
    tallas: [],
    colores: []
  }

  public sizeGuide: any = [];
  public loadingAll = false;
  urlBilling = environment.urlBilling;
  rutaUrl=environment.firebaseUrl;

  constructor
  (
      private util: UtilsService,
      private webService: ServiceService
  )
  {

  }

async  ngOnChanges(changes: SimpleChanges) {
    this.productSelect = changes['product']?.currentValue;
    if(this.productSelect){
    console.log('this.productSelect', this.productSelect);
    
    this.configuration = this.productSelect?.configuracion;
    this.imgLogo = this.configuration?.imgLogo;
    let color = this.configuration?.colorPrincipal;
    let colorLigth:any;
    if(color!=undefined){
      colorLigth =  this.util?.hexToRgba(color, 0.2) ;
    }
    document.documentElement.style.setProperty('--dynamic-color', color);
    document.documentElement.style.setProperty('--lighter-thone', colorLigth);
    let imgOne:any;
    if(this.productSelect?.product?.imagen_uno){
      imgOne = this.productSelect?.product?.imagen_uno;
    }else{
      imgOne = this.imgLogo

    }
    this.arrayFotos=[
        {id:1, 'resource':imgOne},
        {id:2, 'resource':this.productSelect?.product?.imagen_dos},
        {id:3, 'resource':this.productSelect?.product?.imagen_tres},
        {id:4, 'resource':this.productSelect?.product?.imagen_cuatro},
    ]
    this.imgDefault = imgOne;

    let productDetail =  this.productSelect
    console.log('LOG PRD', productDetail);
    
    await this.stablishDescription(productDetail.product).then((resdet: any) => {
      productDetail!.product!.desc_product_detail = resdet.desc_product_detail;
      productDetail!.product!.desc_product_detail_aux = resdet.desc_product_detail_aux;
      productDetail!.product!.show_more_detail = resdet.show_more;
      // productDetail!.product!.show_more_detail = resdet.show_more;
    });
    let product = productDetail!.product;
    console.log('productDetail ===> ', productDetail);
    
    
   this.productSelectDefault=product;
   console.log("PRODUCT", this.productSelectDefault);
    let checkReferidos = true;
    if(this.configuration.tipo_web==2){


      console.log('ENTTRA DEVE EBTRAR');
      if(product.talla_color_selected){
        this.selectedColor = product.tallas[0].colores[0];
        this.stockDinamic= this.selectedColor.stockactual;
      }

      // console.log('color', this.selectedColor);
      // this.selectedColorProduct(this.selectedColor ,this.productSelected)
      
    }

    this.login = productDetail.login;
    this.configurationVariables = {
      show_price: productDetail.show_price,
      show_attributes_product: productDetail.show_attributes_product,
      guarnition: [],
      exists_referidos: false,
      referidos: [],
      spinner: false,
      productsSold: []
    }
    let url = this.urlBilling;

    // Agreagar solo 2 productos mas vendidos para mostrar si no hay referidos
    if (!product.referidos) {
      if (productDetail.productsSold.length > 0) {
        let aleatorio = [];
        for (let i = 0; i < 2; i++) {
          // Generar valor alearotio para no repetir
          let a = Math.floor(Math.random() * productDetail.productsSold.length);
          while (aleatorio.indexOf(a) == -1) {
            // Agregar posicion aleaoria
            this.configurationVariables.productsSold.push(productDetail.productsSold[a]);
            aleatorio.push(a);
          }
        }
      } else {
        this.configurationVariables.spinner = true;
        await this.webService.getProductosNewService(url, this.configuration, 2).then(async (resnew: any) => {
          if (resnew.rta == true) {
            await this.webService.obtainAndCalculatePriceProduct(resnew.data, this.configuration, this.login).then(async (resprice) => {
              this.configurationVariables.productsSold = resprice;
            });
          }
        });
        this.configurationVariables.spinner = false;
      }
    }
    // Establecer talla y colores por defecto
    if (this.configuration.tipo_web == 2) {
      if (product.tallas.length > 0) {
        await this.getSizeProduct(product.tallas[0].id_producto, product).then(async (reSize) => { });
        checkReferidos = false;
      } else {
        this.productSelected = product;
      }
      await this.webService.getGuiaTallasGroupId(url, product.id_grupo).then(async (resguia: any) => {
        this.sizeGuide = resguia;
      });
    } else {
      this.productSelected = product;
    }
    // Establecer guarniciones
    if (this.productSelected.guarnicion == true) {
      this.loadingAll = true;
      // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getGuarnitionsProduct(url, this.productSelected.id_producto).then((resguarn: any) => {
        if (resguarn.rta == true) {
          this.configurationVariables.guarnition = resguarn.data;
        } else {
          this.configurationVariables.guarnition = [];
        }
      });
      // });
      this.loadingAll = false;
    } else {
      this.configurationVariables.guarnition = [];
    }
    // Validar si se consulta los referidos
    if (checkReferidos == true) {
      await this.getProductReferidos(this.productSelected).then((resref) => {
        console.log('LOG RESFREF',resref);
        
        this.configurationVariables.referidos = resref;
      });
    }
    }
    
  }


  ngOnInit(){
    // console.log('llega detail Modal', this.productSelect);  
  }


  changePicture(picture){
    console.log('picture', picture);   
    this.imgDefault= picture;
  }

  addItem(){
    this.cant+=1;
  }

  removeItem(){
    this.cant-=1;
    if(this.cant==0){
      this.cant=1;
    }
  }

    async stablishDescription(p) {
    let num =  255;
    let resp = {
      desc_product_detail: '',
      desc_product_detail_aux: '',
      show_more: false
    }
    if (p?.descripcion) {
      if (p?.descripcion.length > num) {
        resp = {
          desc_product_detail: p?.descripcion.slice(0, num) + ' ...',
          desc_product_detail_aux: p?.descripcion.slice(0, num) + ' ...',
          show_more: true
        }
      }
    }
    return resp;
  }


    async getSizeProduct(id, product) {
    let id_producto = id;
    this.loadingAll = true;
    this.selectedSizeId = id; // Guarda la talla seleccionada

    await this.webService.selectSizeProduct(id_producto, product).then(async (reSize: any) => {
      console.log('elige', reSize );
      
      this.productSelected = reSize;
      for(let color of reSize.colores){
        if(reSize.color== color.color){
          this.selectedColor = color;
          this.stockDinamic = color.stockactual;
          // this.productSelected = color;
          reSize.quantity=1;
          reSize.stockactual = this.stockDinamic;
          this.productSelected = reSize;
          
        }
        
      }
 

      await this.getProductReferidos(this.productSelected).then((resref) => {
        console.log('LOG RESFREF',resref);

        this.configurationVariables.referidos = resref;
      });
    });
    this.loadingAll = false;
  }


  // async getProductReferidos(product) {
  //   console.log('referidos', product);
  //   console.log('configurationVariables', this.configurationVariables);
    
  //   this.configurationVariables.referidos = [];
  //   this.configurationVariables.spinner = true;
  //   this.configurationVariables.exists_referidos = false;
  //   let arr_prod = [];
  //   let productReferidos = [];
  //   if (product.referidos) {
  //     // await this.webService.getUrlEmpresa().then(async (url) => {
  //       await this.webService.getReferidosProduct(this.urlBilling, product.id_producto).then(async (resref: any) => {
  //         console.log('resref ==> ', resref);
          
  //         if (resref.rta == true) {
  //           this.configurationVariables.exists_referidos = true;
  //           for (let p of resref.data) {
  //             await this.webService.getProductosCodigoService(this.urlBilling, p.codigo, this.configuration).then(async (resproduct: any) => {
  //               if (resproduct.rta == true) {
  //                 await this.webService.obtainAndCalculatePriceProduct(resproduct.data, this.configuration, this.login).then((resprice: any) => {
  //                   arr_prod.push(resprice[0]);
  //                 });
  //               }
  //             });
  //           }
  //           productReferidos = arr_prod;
  //           // Agregar tallas si la web es de ese tipo
  //           // if (this.configuracion.tipo_web == 2) {
  //           //   await this.webService.createTallasProduct(arr_prod).then(async (resTalla) => {
  //           //     productReferidos = resTalla;
  //           //   });
  //           // } else {
  //           //   productReferidos = arr_prod;
  //           // }
  //         }
  //       });
  //   } else {
  //     productReferidos = this.configurationVariables.productsSold;
  //     this.configurationVariables.exists_referidos = false;
  //   }
  //   this.configurationVariables.spinner = false;
  //   return productReferidos;
  // }

  async getProductReferidos(product) {
  console.log('referidos', product);
  console.log('configurationVariables', this.configurationVariables);
  
  this.configurationVariables.referidos = [];
  this.configurationVariables.spinner = true;
  this.configurationVariables.exists_referidos = false;
  let arr_prod = [];
  let productReferidos = [];
  if (product.referidos) {
    await this.webService.getReferidosProduct(this.urlBilling, product.id_producto).then(async (resref: any) => {
      console.log('resref ==> ', resref);
      
      if (resref.rta == true) {
        this.configurationVariables.exists_referidos = true;
        for (let p of resref.data) {
          await this.webService.getProductosCodigoService(this.urlBilling, p.codigo, this.configuration).then(async (resproduct: any) => {
            if (resproduct.rta == true) {
              await this.webService.obtainAndCalculatePriceProduct(resproduct.data, this.configuration, this.login).then((resprice: any) => {
                // Asegurar que tipo_web se asigne correctamente
                let productWithTipoWeb = resprice[0];
                productWithTipoWeb.tipo_web = this.configuration.tipo_web.toString(); // Convertir a string
                arr_prod.push(productWithTipoWeb);
              });
            }
          });
        }
        productReferidos = arr_prod;
      }
    });
  } else {
    // También asegurar que los productos vendidos tengan tipo_web
    productReferidos = this.configurationVariables.productsSold.map(prod => ({
      ...prod,
      tipo_web: this.configuration.tipo_web.toString()
    }));
    this.configurationVariables.exists_referidos = false;
  }
  this.configurationVariables.spinner = false;
  return productReferidos;
}


}
