import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom, map, Observable, startWith, Subject, take, timeout } from 'rxjs';
import { environment } from '../environments/environment';
import { userNames } from '../interface/client';
// import { Products } from '../interface/products';
import { ShoppingCart } from '../interface/shopping-cart';
import { Payphone } from '../interface/payphone';
import { Router } from '@angular/router';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  public apiLoxafree = "https://www.pulpoplace.com:8448/";

  public id_empresa = environment.idShop;
   //urlRutaImagenFirebase
  public rutaUrl = environment.firebaseUrl;

  public usr$ = new Subject<userNames>();
  public userLogin = {
    name: '',
    imagen: '',
    login: false,
    rol: '',
    user:''
  }
  public catalogue: any;
  public promotions = {
    rta: false,
    data: []
  };
  public nuewProducts = {
    rta: false,
    data: []
  };
  public productsPopular = {
    rta: false,
    data: []
  };
  // public products$ = new Subject<Products>();
  public shopcart$ = new Subject<ShoppingCart>();
  public payphone$ = new Subject<Payphone>();
  public filterProdcuts$ = new Subject<string>();

  public detailProduct: any;
  public size = 8;
 


  // Alamacenar producto para ver su detalle
  public productDetail: any = {};
  public routeDefault: any;
  private storageSubject = new Subject<any>();
  urlBilling = environment.urlBilling;

  private http = inject(HttpClient);
  constructor
  (
    private router:Router,
    // private localStorage: AsyncLocalStorage
    private localStorage: StorageMap 
  )
   { }





  async getGruposService(url_billing, type) {
    let url = '';
    if (type == 'all') {
      url = url_billing + "get_grupos?all=true";
    } else {
      url = url_billing + "get_grupos";
    }
    console.log('URL === > ', url);
    
    return this.http.get(url);
  }

  async getSubgruposService(url_billing, idgrupo) {
    let url = url_billing + "get_subgrupos?idgrupo=" + idgrupo;
    console.log('URL ----->', url);
    
    return this.http.get(url);
  }
  // async getSubgruposService2(url_billing, idgrupo) {
  //   let url = url_billing + "get_subgrupos?idgrupo=" + idgrupo;
  //   return new Promise((resolve, reject) => {
  //     this.http.get(url)
  //       .subscribe(async (data: any) => {
  //         for (let s of data.data) {
  //           s.url_billing = url_billing;
  //         }
  //         await this.orderObjectsAsc(data.data).then((resorder) => {
  //           data.data = this.viewOptionCatalogueSubgroup(resorder);
  //         });
  //         resolve((data));
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }

  async getSubgruposService2(url_billing, idgrupo) {
  let url = url_billing + "get_subgrupos?idgrupo=" + idgrupo;
  return new Promise((resolve, reject) => {
    this.http.get(url).subscribe({
      next: async (data: any) => {
        for (let s of data.data) {
          s.url_billing = url_billing;
        }
        await this.orderObjectsAsc(data.data).then((resorder) => {
          data.data = this.viewOptionCatalogueSubgroup(resorder);
        });
        resolve(data);
      },
      error: (error) => {
        reject(error); // Changed from resolve to reject for proper error handling
      }
    });
  });
}


  // FUNCIONES GENERALES DE GRUPOS Y SUBGRUPOS
  async orderObjectsAsc(data) {
    // Ordenar alfabeticamente
    let order = data.sort(function (a, b) {
      if (a.nombre < b.nombre)
        return -1;
      if (a.nombre > b.nombre)
        return 1;
      return 0;
    });
    return order;
  }


  getEmpresaService(): Observable<any> {
    let url = this.apiLoxafree + "empresa/" + this.id_empresa;
    console.log('llega ', url);
    
    return this.http.get<any>(url);

  }


  // ****** Api Expres ******

  // async getConfiguracion() {
  //   let url = this.apiLoxafree + "configuracion/" + this.id_empresa;
  //   return new Promise((resolve, reject) => {
  //     this.http.get(url)
  //       .subscribe((data: any) => {
  //         // console.log("Configuracion", data);
  //         resolve(data);
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }
  async getConfiguracion() {     
  let url = this.apiLoxafree + "configuracion/" + this.id_empresa;     
  return new Promise((resolve, reject) => {       
    this.http.get(url).subscribe({
      next: (data: any) => {
        // console.log("Configuracion", data);
        resolve(data);
      },
      error: (error) => {
        reject(error); // Changed from resolve to reject
      }
    });     
  });   
}



  // async getPromocionesWeb() {
  //   let url = this.apiLoxafree + "promociones/" + this.id_empresa;
  //   return new Promise((resolve) => {
  //     this.http.get(url)
  //       .subscribe((data: any) => {
  //         // console.log('promociones', data);
  //         resolve(data);
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }
  async getPromocionesWeb() {
  let url = this.apiLoxafree + "promociones/" + this.id_empresa;
  return new Promise((resolve, reject) => {
    this.http.get(url).subscribe({
      next: (data: any) => {
        // console.log('promociones', data);
        resolve(data);
      },
      error: (error) => {
        reject(error); // Changed from resolve to reject for proper error handling
      }
    });
  });
}

  async getInformacion() {
    let url = this.apiLoxafree + "informacions/" + this.id_empresa;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          resolve(data);
        },
          error => {
            resolve(error)
          });
    })
  }

  async getUrlEmpresa() {
    let url_billing;
    await this.getEmpresaService().subscribe((resEmp: any) => {
      console.log('resp  ----> ', resEmp);
      
      if (resEmp.rta == true) {
        url_billing = resEmp.data[0].url_billing;
      } else {
        url_billing = '';
      }

    });
    return url_billing;
  }

  async sendMailService(data) {
    let url = this.apiLoxafree + "enviarCorreo/send";
    // console.log("data enviar", data);
    return new Promise((resolve) => {
      this.http.post(url, data).subscribe((res: any) => {
        console.log("Send Mail", res);
        resolve((res));
      },
        error => {
          resolve(error)
        });
    });
  }

  async insertProductCart(data) {
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "carrito/insert/";
    return new Promise((resolve, reject) => {
      this.http.post(url, data)
        .subscribe((data1: any) => {
          resolve(data1);
          console.log('data insertProductCart ===> ', data);
          
        },
          error => {
            resolve(error)
          });
    });
  }

  // AQUI AGREGAR ATRIBUTOSSSS Y EMPEZAR NUEVAMENTE
  async getproductsCart(data) {
    console.log("llega cuanta veces");
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "carrito/getProductsClient/";
    return new Promise(async (resolve, reject) => {
      this.http.post(url, data)
        .subscribe(async (data: any) => {
          let car = [];
          let prod = [];
          let config;
          let url_billing;
          // let tipoPrecio;
          if (data.rta == true) {
            // MEJOR GUARDAR EL TIPO DE PRECIO EN LA OTRA BD
            await this.getConfiguracion().then((resconfig: any) => {
              config = resconfig[0];
            });
            await this.getUrlEmpresa().then((url) => {
              url_billing = url;
            });
            console.log('data === >',data);
            let p = data.data.length-1;
            console.log('p  ---> ',p);
            for (let p of data.data) {
              await this.getProductosCodigoService(url_billing, p.id_producto, config).then(async (resprod: any) => {
                console.log('SE IMPRIME EN EL SERVICIO  getproductsCart');         
                if (resprod.rta == true) {
                  for (let precio of resprod.data[0].precios) {
                    // AQUI ES EL CAMELLOOOOOOOO DEL PRECIO POR AVANCE
                    if (precio.id_tipo == p.tipo_precio) {
                      resprod.data[0].ivaval = precio.ivaval;
                      resprod.data[0].precio_sin_iva = parseFloat(precio.valor);
                    }
                  }
                  resprod.data[0].quantity = p.cantidad;
                  resprod.data[0].precioReal = p.precio;
                  resprod.data[0].id_carrito = p.id;
                  resprod.data[0].tipoPrecio = p.tipo_precio;
                  resprod.data[0].guarnicion_descripcion = p.otro;
                  prod.push(resprod.data[0]);
                  car.push(p);
                }
              });
            }
          }

          if (car.length > 0) {
            data.rta = true;
          } else {
            data.rta = false;
          }
          data.data = car;
          data.products = prod;
          this.saveToLocalStorage('data',data)
          resolve(data);
        },
          error => {
            resolve(error)
          });
    });
  }
  async getproductsCart2(data) {
    console.log("llega cuanta veces", data);
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "carrito/getProductsClient/";
    return new Promise(async (resolve, reject) => {
      this.http.post(url, data)
        .subscribe(async (data: any) => {
          console.log('data Add PRODUCT == > ', data);
          
          let car = [];
          let prod = [];
          let config;
          let url_billing;
          // let tipoPrecio;
          if (data.rta == true) {
            // MEJOR GUARDAR EL TIPO DE PRECIO EN LA OTRA BD
            await this.getConfiguracion().then((resconfig: any) => {
              config = resconfig[0];
            });
            await this.getUrlEmpresa().then((url) => {
              url_billing = url;
            });

            console.log('data === >',data);
            let p = data.data.length-1;
            console.log('p  ---> ',p);
            
            await this.getProductosCodigoService(url_billing, data.data[p].id_producto, config).then(async (resprod: any) => {

              console.log('SE IMPRIME EN EL SERVICIO  getproductsCart', resprod);
              

              if (resprod.rta == true) {
                for (let precio of resprod.data[0].precios) {
                  // AQUI ES EL CAMELLOOOOOOOO DEL PRECIO POR AVANCE
                  if (precio.id_tipo == data.data[p].tipo_precio) {
                    resprod.data[0].ivaval = precio.ivaval;
                    resprod.data[0].precio_sin_iva = parseFloat(precio.valor);
                  }
                }
                resprod.data[0].quantity = data.data[p].cantidad;
                resprod.data[0].precioReal = data.data[p].precio;
                resprod.data[0].id_carrito = data.data[p].id;
                resprod.data[0].tipoPrecio = data.data[p].tipo_precio;
                resprod.data[0].guarnicion_descripcion = data.data[p].otro;

                prod.push(resprod.data[0]);
                car.push(p);
              }
            });
            // for (let p of data.data) {
            //   await this.getProductosCodigoService(url_billing, p.id_producto, config).then(async (resprod: any) => {

            //     console.log('SE IMPRIME EN EL SERVICIO  getproductsCart');
                

            //     if (resprod.rta == true) {
            //       for (let precio of resprod.data[0].precios) {
            //         // AQUI ES EL CAMELLOOOOOOOO DEL PRECIO POR AVANCE
            //         if (precio.id_tipo == p.tipo_precio) {
            //           resprod.data[0].ivaval = precio.ivaval;
            //           resprod.data[0].precio_sin_iva = parseFloat(precio.valor);
            //         }
            //       }
            //       resprod.data[0].quantity = p.cantidad;
            //       resprod.data[0].precioReal = p.precio;
            //       resprod.data[0].id_carrito = p.id;
            //       resprod.data[0].tipoPrecio = p.tipo_precio;
            //       resprod.data[0].guarnicion_descripcion = p.otro;

            //       prod.push(resprod.data[0]);
            //       car.push(p);
            //     }
            //   });
            // }
          }

          if (car.length > 0) {
            data.rta = true;
          } else {
            data.rta = false;
          }
          data.data = car;
          data.products = prod;
          resolve(data);
          // this.saveToLocalStorage('data',data)

        },
          error => {
            resolve(error)
          });
    });
  }
  async getproductsCartOne(data,  config , url_billing, product) {
    console.log("llega cuanta veces", data);
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "carrito/getProductsClient/";
    return new Promise(async (resolve, reject) => {
      this.http.post(url, data)
        .subscribe(async (data: any) => {
          console.log('data Add PRODUCT == > ', data);
          
          let car = [];
          let prod = [];
          let config;
          let url_billing;
          // let tipoPrecio;
          if (data.rta == true) {
            // MEJOR GUARDAR EL TIPO DE PRECIO EN LA OTRA BD
            await this.getConfiguracion().then((resconfig: any) => {
              config = resconfig[0];
            });
            await this.getUrlEmpresa().then((url) => {
              url_billing = url;
            });

            console.log('data === >',data);
            let p = data.data.length-1;
            console.log('p  ---> ',p);
            
            await this.getProductosCodigoService(url_billing, data.data[p].id_producto, config).then(async (resprod: any) => {

              console.log('SE IMPRIME EN EL SERVICIO  getproductsCart', resprod);
              

              if (resprod.rta == true) {
                for (let precio of resprod.data[0].precios) {
                  // AQUI ES EL CAMELLOOOOOOOO DEL PRECIO POR AVANCE
                  if (precio.id_tipo == data.data[p].tipo_precio) {
                    resprod.data[0].ivaval = precio.ivaval;
                    resprod.data[0].precio_sin_iva = parseFloat(precio.valor);
                  }
                }
                resprod.data[0].quantity = data.data[p].cantidad;
                resprod.data[0].precioReal = data.data[p].precio;
                resprod.data[0].id_carrito = data.data[p].id;
                resprod.data[0].tipoPrecio = data.data[p].tipo_precio;
                resprod.data[0].guarnicion_descripcion = data.data[p].otro;

                prod.push(resprod.data[0]);
                car.push(p);
              }
            });
            // for (let p of data.data) {
            //   await this.getProductosCodigoService(url_billing, p.id_producto, config).then(async (resprod: any) => {

            //     console.log('SE IMPRIME EN EL SERVICIO  getproductsCart');
                

            //     if (resprod.rta == true) {
            //       for (let precio of resprod.data[0].precios) {
            //         // AQUI ES EL CAMELLOOOOOOOO DEL PRECIO POR AVANCE
            //         if (precio.id_tipo == p.tipo_precio) {
            //           resprod.data[0].ivaval = precio.ivaval;
            //           resprod.data[0].precio_sin_iva = parseFloat(precio.valor);
            //         }
            //       }
            //       resprod.data[0].quantity = p.cantidad;
            //       resprod.data[0].precioReal = p.precio;
            //       resprod.data[0].id_carrito = p.id;
            //       resprod.data[0].tipoPrecio = p.tipo_precio;
            //       resprod.data[0].guarnicion_descripcion = p.otro;

            //       prod.push(resprod.data[0]);
            //       car.push(p);
            //     }
            //   });
            // }
          }

          if (car.length > 0) {
            data.rta = true;
          } else {
            data.rta = false;
          }
          data.data = car;
          data.products = prod;
          resolve(data);
          // this.saveToLocalStorage('data',data)

        },
          error => {
            resolve(error)
          });
    });
  }
  async getproductsCartSecond(data, config , url_billing, product) {
    console.log("llega cuanta veces", data);
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "carrito/getProductsClient/";
    return new Promise(async (resolve, reject) => {
      this.http.post(url, data)
        .subscribe(async (data: any) => {
          console.log('data Add PRODUCT == > ', data);
          
          let car = [];
          let prod = [];
          // let config;
          // let url_billing;
          // let tipoPrecio;
          if (data.rta == true) {
            // MEJOR GUARDAR EL TIPO DE PRECIO EN LA OTRA BD
            // await this.getConfiguracion().then((resconfig: any) => {
            //   config = resconfig[0];
            // });
            // await this.getUrlEmpresa().then((url) => {
            //   url_billing = url;
            // });

            console.log('data === >',data);
            let p = data.data.length-1;
            console.log('p  ---> ',p);
            
            await this.getProductosCodigoService(url_billing, data.data[p].id_producto, config).then(async (resprod: any) => {

              console.log('SE IMPRIME EN EL SERVICIO  getproductsCart');
              

              if (resprod.rta == true) {
                for (let precio of resprod.data[0].precios) {
                  // AQUI ES EL CAMELLOOOOOOOO DEL PRECIO POR AVANCE
                  if (precio.id_tipo == data.data[p].tipo_precio) {
                    resprod.data[0].ivaval = precio.ivaval;
                    resprod.data[0].precio_sin_iva = parseFloat(precio.valor);
                  }
                }
                resprod.data[0].quantity = data.data[p].cantidad;
                resprod.data[0].precioReal = data.data[p].precio;
                resprod.data[0].id_carrito = data.data[p].id;
                resprod.data[0].tipoPrecio = data.data[p].tipo_precio;
                resprod.data[0].guarnicion_descripcion = data.data[p].otro;

                prod.push(resprod.data[0]);
                car.push(p);
              }
            });
           
          }

          if (car.length > 0) {
            data.rta = true;
          } else {
            data.rta = false;
          }
          data.data = car;
          data.products = prod;
          resolve(data);
          // this.saveToLocalStorage('data',data)

        },
          error => {
            resolve(error)
          });
    });
  }

  async updateProductsCart(id, data) {
    console.log('entra put Car', id);
    
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "carrito/update/" + id;
    console.log('url', url);
    console.log('data', data);
    return new Promise((resolve, reject) => {
      this.http.put(url, data)
        .subscribe((data: any) => {
          resolve(data);
        },
          error => {
            resolve(error)
          });
    });
  }

  async deleteProductCart(id) {
    let url = this.apiLoxafree + "carrito/deleteProductCar/" + id;
    return new Promise((resolve, reject) => {
      this.http.delete(url)
        .subscribe((data: any) => {
          resolve(data);
          
        },
          error => {
            resolve(error)
          });
    });
  }

  async loginAdministrator(login) {
    let url = this.apiLoxafree + "administracions/" + this.id_empresa;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          let res: any;
          if (data.length > 0) {
            if (data[0].usuario == login.usuario && data[0].password == login.clave) {
              res = {
                rta: true,
                data: data[0]
              }
            } else {
              res = {
                rta: false,
                data: {}
              }
            }
          } else {
            res = {
              rta: false,
              data: {}
            }
          }
          resolve((res));
        },
          error => {
            resolve(error)
          });
    })
  }

  async emptyProductCart(data) {
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "carrito/empty/";
    return new Promise((resolve, reject) => {
      this.http.post(url, data)
        .subscribe((data: any) => {
          resolve(data);
        },
          error => {
            resolve(error)
          });
    });
  }

  async createBodyMailSupport(configuracion, data) {

    let html = '<table style="font-family:arial; border:1px solid #e8e6e6; border-top:none; border-bottom:none; border-spacing:0; max-width:600px; color:#707173; border-radius:40px;" align="center">';
    // Imagen de la cabecera
    html += '<thead>';
    html += '<tr>';
    html += '<td style="padding:0">';
    html += '<img style="width:100%; border-radius:20px 20px 0 0" src="https://drive.google.com/uc?export=view&id=1PA4wN0Sxs7vJlmn5zpVwdDlQm-XCwCsz">';
    html += '</td>';
    html += '</tr>';
    html += '</thead>';

    html += '<tbody>';

    html += '<tr>';
    html += '<td style="font-size: 18px; text-align: justify; padding:10px 8px 8px 8px; display:block">';
    html += '<span style="text-align: center">Hola, mi nombre es, </span>';
    html += '<span><strong style="color: #868686;">' + data.nombres + '</strong></span>';
    html += '<br>';
    html += '<p> Mensaje: ' + data.mensaje + '</p>';
    html += '<p><strong style="color: #868686;">Datos del contacto</strong></p>';
    html += '<p><strong style="color: #868686;">Teléfono: </strong>' + data.telefono + '</p>';
    html += '<p><strong style="color: #868686;">Correo: </strong>' + data.correo + '</p>';
    html += '</td>';
    html += '</tr>';

    html += '</tbody>';

    html += '</table>';


    let dataEmail = {
      sender_mail: configuracion.correo_api,
      sender_password: configuracion.password_correo_api,
      entity_mail: '',
      receiver: configuracion.correo_personal_api,
      subject: 'Sugerencia',
      text: '',
      body: html
    }

    return dataEmail;
  }

  async createBodyMailRecoveryPassword(configuracion, data, userPasword) {

    let html = '<table style="font-family:arial; border:1px solid #e8e6e6; border-top:none; border-bottom:none; border-spacing:0; max-width:600px; color:#707173; border-radius:40px;" align="center">';

    // Imagen de la cabecera
    html += '<thead>';
    html += '<tr>';
    html += '<td style="padding:0">';
    html += '<img style="width:100%; border-radius:20px 20px 0 0" src="https://drive.google.com/uc?export=view&id=1PA4wN0Sxs7vJlmn5zpVwdDlQm-XCwCsz">';
    html += '</td>';
    html += '</tr>';
    html += '</thead>';

    html += '<tbody>';

    // Texto del encabezado
    html += '<tr>';
    html += '<td style="font-size: 18px; text-align: justify; padding:10px 8px 8px 8px; display:block">';
    html += '<span>Hola, </span>';
    html += '<span><strong style="color: #868686;">' + data.nombres + ' ' + data.apellidos + '</strong>. Su contraseña para acceder al sitio ' + configuracion.dominioPagina + ', se muestra a continuación: </span>';
    html += '</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td style="font-size: 18px; text-align: center; padding:10px 5px 8px 5px; display:block">';
    html += '<p style="font-size: 15px;">Contraseña: ' + userPasword + ' </p>';
    html += '</td>';
    html += '</tr>';

    html += '</tbody>';

    html += '</table>';



    let dataEmail = {
      sender_mail: configuracion.correo_api,
      sender_password: configuracion.password_correo_api,
      entity_mail: '',
      receiver: data.email,
      subject: 'Recuperación de contraseña',
      text: '',
      body: html
    }
    return dataEmail;
  }

  async createBodyMailRegister(configuracion, data) {

    let html = '<table style="font-family:arial; border:1px solid #e8e6e6; border-top:none; border-bottom:none; border-spacing:0; max-width:600px; color:#707173; border-radius:40px;" align="center">';

    // Imagen de la cabecera
    html += '<thead>';
    html += '<tr>';
    html += '<td style="padding:0">';
    html += '<img style="width:100%; border-radius:20px 20px 0 0" src="https://drive.google.com/uc?export=view&id=1PA4wN0Sxs7vJlmn5zpVwdDlQm-XCwCsz">';
    html += '</td>';
    html += '</tr>';
    html += '</thead>';

    html += '<tbody>';

    // Texto del encabezado
    html += '<tr>';
    html += '<td style="font-size: 18px; text-align: justify; padding:10px 8px 8px 8px; display:block">';
    html += '<span>Bienvenid@, </span>';
    html += '<span><strong style="color: #868686;">' + data.nombres + ' ' + data.apellidos + '</strong>. Gracias por registrarte en nuestro sitio web ' + configuracion.dominioPagina + ', sus credenciales para acceder al sitio son las siguientes:</span>';
    html += '</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td style="font-size: 18px; text-align: center; padding:10px 5px 8px 5px; display:block">';
    html += '<p style="font-size: 15px;">Cédula / Ruc: ' + data.cedula + ' </p>';
    html += '<p style="font-size: 15px;">Contraseña: ' + data.cedula + ' </p>';
    html += '</td>';
    html += '</tr>';

    html += '</tbody>';
    html += '</table>';

    let dataEmail = {
      sender_mail: configuracion.correo_api,
      sender_password: configuracion.password_correo_api,
      entity_mail: '',
      receiver: data.email,
      subject: 'Registro exitoso',
      text: '',
      body: html
    }

    return dataEmail;
  }

  async createBodyMailPixelFacebook(configuracion) {

    let developer = ['andycarlos.vicente@gmail.com', 'edisonmacas@gmail.com'];

    let html = '<table style="font-family:arial; border:1px solid #e8e6e6; border-top:none; border-bottom:none; border-spacing:0; max-width:600px; color:#707173; border-radius:40px;" align="center">';
    // Imagen de la cabecera
    html += '<thead>';
    html += '<tr>';
    html += '<td style="padding:0">';
    html += '<img style="width:100%; border-radius:20px 20px 0 0" src="https://drive.google.com/uc?export=view&id=1PA4wN0Sxs7vJlmn5zpVwdDlQm-XCwCsz">';
    html += '</td>';
    html += '</tr>';
    html += '</thead>';

    html += '<tbody>';

    html += '<tr>';
    html += '<td style="font-size: 18px; text-align: justify; padding:10px 8px 8px 8px; display:block">';
    html += '<span style="text-align: center">Hola, el administrador de la tienda en linea ' + configuracion.dominioPagina + ', ha solicitado la implementación del plugin referente a Pixel de Facebook </span>';
    html += '</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td style="font-size: 18px; text-align: center; padding:10px 8px 8px 8px; display:block">';
    html += '<a href=https://www.pulpoplace.com:8448/configuracion/pixel_facebook/' + configuracion.id_empresa + ' target=_blank>';
    html += '<input type="button" value="Visualizar" style="border-radius: 5px; padding: 8px 16px; background-color: #d12136; color: white; border: 0px">';
    html += '</a>';
    html += '</td>';
    html += '</tr>';

    html += '</tbody>';

    html += '</table>';

    let dataEmail = {
      sender_mail: configuracion.correo_api,
      sender_password: configuracion.password_correo_api,
      entity_mail: '',
      receiver: developer,
      subject: 'Administrar código fuente de Pixel de Facebook',
      text: '',
      body: html
    }

    return dataEmail;
  }

  async updateUserData(data) {
    // console.log(JSON.stringify(data));
    let url = this.apiLoxafree + "billing/update_user";
    return new Promise((resolve, reject) => {
      this.http.post(url, data)
        .subscribe((data: any) => {
          resolve(data.respuesta);
        },
          error => {
            resolve(error)
          });
    });
  }

  async getPaymentButtons() {
    let url = this.apiLoxafree + "pasarelaPago/botones/" + this.id_empresa;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          resolve(data);
        },
          error => {
            resolve(error)
          });
    });
  }

  async updateConfiguracion(data: any) {
    let url = this.apiLoxafree + "configuracion/" + data.id_configuracion;
    return new Promise((resolve) => {
      this.http.put(url, data)
        .subscribe((data: any) => {
          
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async updateInformation(information) {
    let url = this.apiLoxafree + "informacions/" + information.id_informacion;
    return new Promise((resolve) => {
      this.http.put(url, information)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  // PayPhone

  async verifyPayphoneAccount(info, payphone) {
    let url = this.apiLoxafree + "payphone/verifyAccount";
    let send = {
      payphone: payphone,
      data: info
    }
    return new Promise((resolve, reject) => {
      this.http.post(url, send)
        .subscribe((data: any) => {
          resolve(data.respuesta);
        },
          error => {
            resolve(error)
          });
    });
  }

  async createDataPaypal(shoppingCart, values) {

    let response = {};
    let items = [];
    let subtot = 0;
    let totalPagar;

    shoppingCart.forEach(element => {
      element.value_final = this.roundValue(element.value_final);
      let detail = {
        name: element.pro_nom,
        quantity: element.quantity,
        unit_amount: {
          currency_code: 'USD',
          value: element.value_final,
        }
      }
      items.push(detail);
      subtot = subtot + (element.quantity * element.value_final);
    });

    await this.calculateTotalAndShippingCost(values).then(async (ressend: any) => {
      if (ressend.value != 0) {
        let detail = {
          name: 'COSTO ENVIO',
          quantity: 1,
          unit_amount: {
            currency_code: 'USD',
            value: ressend.value,
          }
        }
        items.push(detail);
        totalPagar = subtot + ressend.value;
      } else {
        totalPagar = subtot;
      }
    });

    response = {
      items: items,
      totalPagar: this.roundValue(totalPagar)
    }

    return response;
  }

  async sendTransactionPayphone(dataCompra, payphone) {
    let url = this.apiLoxafree + "payphone/sendTransaccion";
    let send = {
      payphone: payphone,
      data: dataCompra
    }
    return new Promise((resolve, reject) => {
      this.http.post(url, send)
        .subscribe((data: any) => {
          resolve(data.respuesta);
        },
          error => {
            resolve(error)
          });
    });

  }

  async checkPayphoneStatus(id_transaccion, payphone) {
    let url = this.apiLoxafree + "payphone/statusTransaction";
    let send = {
      payphone: payphone,
      id_transaccion: id_transaccion
    }
    return new Promise((resolve, reject) => {
      this.http.post(url, send)
        .subscribe((data: any) => {
          resolve(data.respuesta);
        },
          error => {
            resolve(error)
          });
    });
  }

  async cancelTransactionPayphone(id_transaccion, payphone) {
    let url = this.apiLoxafree + "payphone/cancelTransaccion";
    let send = {
      payphone: payphone,
      id_transaccion: id_transaccion
    }
    return new Promise((resolve, reject) => {
      this.http.post(url, send)
        .subscribe((data: any) => {
          resolve(data.respuesta);
        },
          error => {
            resolve(error)
          });
    });
  }

  observableStatusPayphone(): Observable<Payphone> {
    return this.payphone$.asObservable();
  }

  async addObservableStatusPayphone(data) {
    this.payphone$.next(data);
  }

  async manipulatePayphoneStatus(status, id_cotizacion) {
    if (status.rta == true) {
      switch (status.res.statusCode) {
        case 1: {
          let obs = {
            rta: true,
            status: status.res.transactionStatus,
            data: status.res,
            id_cotizacion: id_cotizacion
          }
          await this.addObservableStatusPayphone(obs);
          console.log("Estado Pendiente: ", status.res.transactionStatus);
          break;
        }
        case 2: {
          let obs = {
            rta: false,
            status: status.res.transactionStatus,
            data: status.res,
            id_cotizacion: id_cotizacion
          }
          await this.addObservableStatusPayphone(obs);
          console.log("Estado Caducada: ", status.res.transactionStatus);
          break;
        }
        case 3: {
          let obs = {
            rta: true,
            status: status.res.transactionStatus,
            data: status.res,
            id_cotizacion: id_cotizacion
          }
          await this.addObservableStatusPayphone(obs);
          console.log("Estado Aprovada: ", status.res.transactionStatus);
          break;
        }
      }
    } else {
      console.log("no consulto el estado");
    }

  }

  // DataFast

  async getPaymentIdentifierDatafast(datafast, client, id_cotizacion, shoppingCart, values) {
    let query: any;
    let url = this.apiLoxafree + 'datafast/checkOutId';
    let ipAddress;
    let cedula = '';
    let direction = client.direccion + ', ' + client.referencia_domicilio;
    let company = '';
    let totalPagar;
    let costoEnvio = 0;
    await this.getIpAddress().then((resip: any) => {
      ipAddress = resip.geobytesipaddress;
    });
    await this.getInformacion().then((resinfo) => {
      company = resinfo[0].nombre;
    });
    if (client.PersonaComercio_cedulaRuc.length == 10) {
      cedula = client.PersonaComercio_cedulaRuc;
    } else {
      if (client.PersonaComercio_cedulaRuc.length < 10) {
        let complet = 10 - client.PersonaComercio_cedulaRuc.length;
        for (var i = 0; i < complet; i++) {
          cedula += '0';
        }
        cedula += client.PersonaComercio_cedulaRuc;
      }
      if (client.PersonaComercio_cedulaRuc.length > 10) {
        cedula = client.PersonaComercio_cedulaRuc.substring(0, 10);
      }
    }
    if (direction.length > 100) {
      direction = direction.substring(0, 100);
    }
    let iva0 = parseFloat(this.roudDecimals(values.calculos.sinIva.subtotalNeto, 2));
    let iva12 = parseFloat(this.roudDecimals(values.calculos.conIva.subtotalNeto, 2));
    let iva = parseFloat(this.roudDecimals(values.calculos.iva, 2))
    await this.calculateTotalAndShippingCost(values).then(async (ressend: any) => {
      if (ressend.value != 0) {
        values.calculos.sinIva.subtotalNeto = ressend.value;
        costoEnvio = ressend.value;
      }
    });
    totalPagar = iva0 + iva12 + iva + costoEnvio;
    query = {
      endPoint: datafast.url + 'v1/checkouts',
      token: datafast.token,
      data: {
        'entityId': datafast.secret_key,
        'amount': this.roudDecimals(totalPagar, 2),
        'currency': 'USD',
        'paymentType': 'DB',
        'customer.givenName': client.nombres,
        'customer.surname': client.apellidos,
        'customer.ip': ipAddress,
        'customer.merchantCustomerId': client.PersonaComercio_cedulaRuc,
        'customer.email': client.email,
        'customer.identificationDocType': 'IDCARD',
        'customer.identificationDocId': cedula,
        'customer.phone': client.celular,
        'shipping.street1': direction,
        'billing.street1': direction,
        'shipping.country': 'EC',
        'billing.country': 'EC',
        'merchantTransactionId': id_cotizacion,
        'customParameters[SHOPPER_VAL_BASE0]': this.roudDecimals(values.calculos.sinIva.subtotalNeto, 2),
        'customParameters[SHOPPER_VAL_BASEIMP]': this.roudDecimals(values.calculos.conIva.subtotalNeto, 2),
        'customParameters[SHOPPER_VAL_IVA]': this.roudDecimals(values.calculos.iva, 2),
        'customParameters[SHOPPER_ECI]': '0103910', // Valores fijos
        'customParameters[SHOPPER_PSERV]': '17913101', // Valores fijos
        'customParameters[SHOPPER_VERSIONDF]': 2,
        'risk.parameters[USER_DATA2]': company,

        'customParameters[SHOPPER_MID]': datafast.mid, // Obtenerlos de la BD
        'customParameters[SHOPPER_TID]': datafast.tid, // Obtenerlos de la BD
        'testMode': 'EXTERNAL' // Quitar para produccion
      }
    }
    for (var i = 0; i < shoppingCart.length; i++) {
      shoppingCart[i].value_final = this.roudDecimals(shoppingCart[i].value_final, 2);
      query.data['cart.items[' + i + '].name'] = shoppingCart[i].pro_nom;
      query.data['cart.items[' + i + '].description'] = shoppingCart[i].pro_nom;
      query.data['cart.items[' + i + '].price'] = shoppingCart[i].value_final;
      query.data['cart.items[' + i + '].quantity'] = shoppingCart[i].quantity;
    }
    await this.calculateTotalAndShippingCost(values).then(async (ressend: any) => {
      if (ressend.value != 0) {
        query.data['cart.items[' + i + '].name'] = 'COSTO ENVIO';
        query.data['cart.items[' + i + '].description'] = 'COSTO ENVIO';
        query.data['cart.items[' + i + '].price'] = this.roudDecimals(ressend.value, 2);
        query.data['cart.items[' + i + '].quantity'] = 1;
      }
    });
    // console.log(JSON.stringify(query));

    // query = {
    //   endPoint: datafast.url + 'v1/checkouts',
    //   token: datafast.token,
    //   data: {
    //     entityId: datafast.secret_key,
    //     amount: 1.00,
    //     currency: 'USD',
    //     paymentType: 'DB'
    //   }
    // }

    return new Promise((resolve, reject) => {
      this.http.post(url, query).subscribe((res: any) => {
        resolve(res.respuesta);
      },
        error => {
          resolve(error)
        });
    });

  }

  async getStatusDatafast(path, datafast) {
    let url = this.apiLoxafree + 'datafast/status';
    let transaccion = {
      endPoint: datafast.url + path + '?entityId=' + datafast.secret_key,
      token: datafast.token
    }
    // console.log("request2", JSON.stringify(transaccion));
    return new Promise((resolve, reject) => {
      this.http.post(url, transaccion).subscribe((data: any) => {
        resolve(data.respuesta);
      },
        error => {
          resolve(error)
        });
    });

  }

  async checkDatafastStatus(id_transaccion, datafast) {

    let url = this.apiLoxafree + 'datafast/statusTransaccion';
    let response;

    let transaccion = {
      endPoint: datafast.url + 'v1/query?entityId=' + datafast.secret_key + '&merchantTransactionId=' + id_transaccion,
      token: datafast.token
    }
    // console.log("Reqwuest validacion", JSON.stringify(transaccion));

    return new Promise((resolve, reject) => {
      this.http.post(url, transaccion).subscribe((data: any) => {
        let rescheck = data.respuesta;
        if (rescheck.rta == true) {
          if (rescheck.res.result.code == '000.000.100') {
            let code = rescheck.res.payments[0].result.code;
            if (code == '000.100.112' || code == '000.000.000') {
              response = {
                rta: true,
                message: {
                  status: 'Accepted',
                  result: 'La transacción se ha realizado con éxito. (' + rescheck.res.payments[0].result.description + ')',
                  reference: id_transaccion
                }
              }
            } else {
              response = {
                rta: false,
                message: {
                  status: 'Rejected',
                  result: 'La transacción ha sido rechazada, intente nuevamente. (' + rescheck.res.payments[0].result.description + ')',
                  reference: 0
                }
              }
            }
          }
        } else {
          response = {
            rta: false,
            data: {
              message: 'Rejected',
              result: 'La transacción ha sido rechazada, intente nuevamente',
              reference: 0
            }
          }
        }
        data.respuesta.response = response;
        resolve(data.respuesta);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getImagesBanner() {
    let url = this.apiLoxafree + "imagenes-banners/" + this.id_empresa;
    // console.log('url', url);
    
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async insertImageBanner(data) {
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "imagenes-banners";
    return new Promise((resolve) => {
      this.http.post(url, data)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async deleteImageBanner(id) {
    let url = this.apiLoxafree + "imagenes-banners/" + id;
    return new Promise((resolve) => {
      this.http.delete(url)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async insertPromotionWeb(data: any) {
    data.id_empresa = this.id_empresa;
    let url = this.apiLoxafree + "promociones"
    return new Promise((resolve) => {
      this.http.post(url, data)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async deletePromotionWeb(id_promocion) {
    let url = this.apiLoxafree + "promociones/" + id_promocion;
    return new Promise((resolve) => {
      this.http.delete(url)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async getDataAdministration() {
    let url = this.apiLoxafree + "administracions/" + this.id_empresa;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async updateAdministration(administration: any) {
    let url = this.apiLoxafree + "administracions";
    return new Promise((resolve) => {
      this.http.put(url, administration)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async getCredentialsDrive() {
    let data = {
      client_id: '',
      api_key: '',
      rta: false
    }
    await this.getConfiguracion().then((resconf: any) => {
      data = {
        client_id: resconf[0].client_id_drive,
        api_key: resconf[0].api_key_drive,
        rta: true
      }
    });
    return data;
  }

  async updateAttributesTableBilling(data) {
    let url = this.apiLoxafree + "billing/update_attribute_table";
    return new Promise((resolve) => {
      this.http.post(url, data)
        .subscribe((data: any) => {
          resolve((data.respuesta));
        },
          error => {
            resolve(error)
          });
    });
  }

  async insertTableBillingPost(data) {
    let url = this.apiLoxafree + "billing/insert_data_post_billing";
    return new Promise((resolve) => {
      this.http.post(url, data)
        .subscribe((data: any) => {
          resolve((data.respuesta));
        },
          error => {
            resolve(error)
          });
    });
  }

  // async addColorTable(newColor) {
  //   newColor.id_empresa = this.id_empresa;
  //   let url = this.apiLoxafree + "informacions/colores/create";
  //   return new Promise((resolve) => {
  //     this.http.post(url, newColor)
  //       .subscribe((data: any) => {
  //         resolve((data));
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }

  // async getColors() {
  //   let url = this.apiLoxafree + "informacions/colores/get";
  //   return new Promise((resolve) => {
  //     this.http.get(url)
  //       .subscribe((data: any) => {
  //         resolve((data));
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }

   async addColorTable(newColor: Omit<any, 'id'>): Promise<any | null> {
    const colorData = { 
      ...newColor, 
      id_empresa: this.id_empresa
    };
    const url = `${this.apiLoxafree}informacions/colores/create`;
    
    return new Promise((resolve) => {
      this.http.post<any>(url, colorData).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (error) => {
          console.error('Error al crear color:', error);
          resolve(null);
        }
      });
    });
  }
    async getColors(): Promise<any | null> {
    const url = `${this.apiLoxafree}informacions/colores/get`;
    
    return new Promise((resolve) => {
      this.http.get<any>(url).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (error) => {
          console.error('Error al obtener colores:', error);
          resolve(null);
        }
      });
    });
  }

  // async deleteColorTable(color) {
  //   let url = this.apiLoxafree + "informacions/colores/delete";
  //   const options = {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'application/json',
  //     }),
  //     body: {
  //       id_empresa: this.id_empresa,
  //       color: color
  //     },
  //   };
  //   return new Promise((resolve) => {
  //     this.http.delete(url, options)
  //       .subscribe((data: any) => {
  //         resolve((data));
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }
  async deleteColorTable(color: any): Promise<any | null> {
    const url = `${this.apiLoxafree}informacions/colores/delete`;
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: {
        id_empresa: this.id_empresa,
        color: color
      },
    };
    
    return new Promise((resolve) => {
      this.http.delete<any>(url, options).subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (error) => {
          console.error('Error al eliminar color:', error);
          resolve(null);
        }
      });
    });
  }



  async getMenu() {
    let url = this.apiLoxafree + 'configuracion/menu/' + this.id_empresa;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      }, error => {
        resolve(error);
      })
    })
  }

  async updateMenu(menu) {
    let url = this.apiLoxafree + 'configuracion/menu/update';
    return new Promise((resolve) => {
      this.http.put(url, menu).subscribe((data: any) => {
        resolve(data);
      }, error => {
        resolve(error);
      });
    });
  }

  async generateVaucher(vaucher){
    let url = this.apiLoxafree + 'datafast/generate_vaucher/';
    return new Promise((resolve) => {
      this.http.post(url, vaucher).subscribe((data: any) => {
        resolve(data);
      }, error => {
        resolve(error);
      });
    });
  }

  async searchVaucher(data){
    let url = this.apiLoxafree + 'datafast/get_vaucher/';
    return new Promise((resolve) => {
      this.http.post(url, data).subscribe((data: any) => {
        resolve(data);
      }, error => {
        resolve(error);
      });
    });
  }

  async updateClientVaucher(data) {
    let url = this.apiLoxafree + 'datafast/update_vaucher/' + data.id;
    return new Promise((resolve) => {
      this.http.put(url, data).subscribe((data: any) => {
        resolve(data);
      }, error => {
        resolve(error);
      });
    });
  }

  // ****** Api Billing ******

  async uploadScripts(archivos: string[]) {
    for (let a of archivos) {
      let script = document.createElement("script");
      script.src = "../../../assets/js/" + a + ".js";
      let body = document.getElementsByTagName("body")[0];
      body.appendChild(script);
    }
  }



  async updateAtributeGroup(url_billing, data) {
    let url = url_billing + "update_atributo_tabla?tabla=" + data.tabla + "&id=" + data.id + "&valor_id=" + data.valor_id + "&atributo=" + data.atributo + "&valor_atributo=" + data.valor_atributo;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  viewOptionsCatalogueGroup(group, url_billing) {
    let aux = 1;
    let id = 0;
    for (let g of group) {
      g.url_billing = url_billing;
      id = id + 1;
      g.identificador = id;
      if (aux <= this.size) {
        g.view_catalogo = true;
      } else {
        g.view_catalogo = false;
      }
      if (!g.nombre) {
        g.nombre = 'S/N';
      }
      aux = aux + 1;
    }
    return group;
  }

  async paginationCatalogueGroup(grupo, type) {
    let last;
    let range;

    if (type == 'next') {
      for (let g of grupo) {
        if (g.view_catalogo == true) {
          last = g.identificador;
        }
      }
      if (last + this.size <= grupo.length) {
        range = last + this.size;
      } else {
        range = grupo.length;
        if (last == range) {
          last = 0;
          range = range = last + this.size;
        }
      }
    } else {
      let aux = true;
      for (let g of grupo) {
        if (g.view_catalogo == true) {
          if (aux == true) {
            last = g.identificador;
            aux = false;
          }
        }
      }
      if (last - this.size <= 0) {
        let calc = grupo.length % this.size;
        if (calc == 0) {
          last = grupo.length - this.size;
        } else {
          last = grupo.length - calc;
        }
        range = grupo.length;
      } else {
        if (last - this.size <= grupo.length) {
          range = last - 1;
          last = range - this.size;
        }
      }
    }

    for (var i = 0; i < grupo.length; i++) {
      if (grupo[i].identificador > last && grupo[i].identificador <= range) {
        grupo[i].view_catalogo = true;
      } else {
        grupo[i].view_catalogo = false;
      }
    }

    return grupo;
  }

 
  viewOptionCatalogueSubgroup(subgroup) {
    if (subgroup.length > 0) {
      if (subgroup.length == 1) {
        if (subgroup[0].nombre == 'OTROS') {
          subgroup.viewSubgrupo = false;
        }
      } else {
        subgroup.viewSubgrupo = true;
      }
    } else {
      subgroup.viewSubgrupo = false;
    }

    return subgroup;
  }

  async getProductosService(url_billing, idgrupo, idsubgrupo, configuracion) {
    let url = url_billing + 'get_productos?idgrupo=' + idgrupo + '&idsub=' + idsubgrupo + '&bodega_id=' + configuracion.id_bodega;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          // Eliminar productos duplicados, que vienen en el servicio
          await this.deleteProductsDuplicated(data.data, 'id_producto').then((res: any) => {
            data.data = res;
          });
          let resp;
          await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
            resp = {
              rta: resprod.rta,
              data: resprod.data
            }
          });
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  // async getProductosPromocionService(url_billing, configuracion) {
  //   // console.log(configuracion.id_bodega);
  //   let url = url_billing + 'product_promocion?bodega_id=' + configuracion.id_bodega;
  //   return new Promise(async (resolve, reject) => {
  //     this.http.get(url)
  //       .subscribe(async (data: any) => {
  //         // console.log("Promocion", data);
  //         await this.deleteProductsDuplicated(data.data, 'id_producto').then(async (resdup) => {
  //           data.data = resdup;
  //         });
  //         let resp;
  //         await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
  //           resp = {
  //             rta: resprod.rta,
  //             data: resprod.data
  //           }
  //         });
  //         resolve((resp));
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }
async  getProductosPromocionService(url_billing: string, configuracion: any): Promise<any> {
  const url = `${url_billing}product_promocion?bodega_id=${configuracion.id_bodega}`;
  
  return new Promise((resolve, reject) => {
    this.http.get(url).subscribe({
      next: async (data: any) => {
        try {
          // Procesar productos duplicados
          const resdup = await this.deleteProductsDuplicated(data.data, 'id_producto');
          data.data = resdup;
          
          // Agregar atributos a productos
          const resprod = await this.addAtributesProducts(data.data, url_billing, configuracion);
          
          resolve({
            rta: resprod.rta,
            data: resprod.data
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        resolve(error); // O usar reject(error) según tu lógica de negocio
      }
    });
  });
}

  async getProductPopularSoldService(url_billing, configuracion) {
    let url = url_billing + "producto_mas_vendido?bodega_id=" + configuracion.id_bodega;
    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe(async (data: any) => {
        // console.log("Mas vendido", data);
        let resp;
        await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
          resp = {
            rta: resprod.rta,
            data: resprod.data
          }
        });
        resolve((resp));
      },
        error => {
          resolve(error)
        });
    });
  }

  async getProductosNewService(url_billing, configuracion, numero) {
    // console.log("bodega", configuracion.id_bodega);
    let numeroProductos = 10;
    if (configuracion.tipo_web == 2 || configuracion.tipo_web == 3) {
      numeroProductos = numero;
    }
    let url = url_billing + 'product_new?bodega_id=' + configuracion.id_bodega + '&numero=' + numeroProductos;
    return new Promise(async (resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          // console.log("Nuevos", data);
          let resp;
          await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
            resp = {
              rta: resprod.rta,
              data: resprod.data
            }
          });
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  async getProductosCodigoService(url_billing, id_producto, configuracion) {
    let url = url_billing + 'get_product_id?codigo=' + id_producto + '&bodega_id=0';
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          let resp = {
            rta: false,
            data: []
          };
          if (data.rta == true) {
            await this.addAtributesProducts([data.data], url_billing, configuracion).then((resprod) => {
              resp = {
                rta: resprod.rta,
                data: resprod.data
              }
            });
          }
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  async searchProduct(url_billing, search, configuracion) {
    let url = url_billing + 'buscar_productos_all?buscar=' + search + '&bodega_id=' + configuracion.id_bodega;
    return new Promise(async (resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          let resp;
          await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
            resp = {
              rta: resprod.rta,
              data: resprod.data
            }
          });
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  async searchProductCodeName(url_billing, search, configuracion) {
    let url = url_billing + 'search_product_name_code?search=' + search + '&bodega_id=' + configuracion.id_bodega;
    return new Promise(async (resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          let resp;
          await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
            resp = {
              rta: resprod.rta,
              data: resprod.data
            }
          });
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  // Buscar productos para el admin, sin controlar stock ni bodega
  async search_products_free(url_billing, search) {
    let url = url_billing + 'search_products_free?search=' + search;
    return new Promise(async (resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async getProductosAll(url_billing, configuracion) {
    let url = url_billing + 'get_productos_all?&bodega_id=' + configuracion.id_bodega;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          let resp;
          await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
            resp = {
              rta: resprod.rta,
              data: resprod.data
            }
          });
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  async getProductosOrigin(url_billing, origen, configuracion) {
    let url = url_billing + 'get_product_origen?origen=' + origen;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          let resp;
          await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
            resp = {
              rta: resprod.rta,
              data: resprod.data
            }
          });
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  async getProductosMarca(url_billing, marca_id, configuracion) {
    let url = url_billing + 'get_product_marca?marca_id=' + marca_id;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          let resp;
          await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
            resp = {
              rta: resprod.rta,
              data: resprod.data
            }
          });
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  async getProductosGrupo(url_billing, idgrupo, configuracion) {
    let url = url_billing + 'get_productos_grupo?idgrupo=' + idgrupo + '&bodega_id=' + configuracion.id_bodega;
    return new Promise((resolve, reject) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          let resp;
          // Eliminar productos duplicados, que vienen en el servicio
          await this.deleteProductsDuplicated(data.data, 'id_producto').then((res: any) => {
            data.data = res;
          });
          await this.addAtributesProducts(data.data, url_billing, configuracion).then((resprod) => {
            resp = {
              rta: resprod.rta,
              data: resprod.data
            }
          });
          resolve((resp));
        },
          error => {
            resolve(error)
          });
    });
  }

  async loginCliente(url_billing: string, data: any, type: string) {
    const url = `${url_billing}login_user?usuario=${data.usuario}&clave=${data.clave}`;
    
    try {
        const response: any = await lastValueFrom(this.http.get(url));
        return type === 'login' ? response : response.data[0];
    } catch (error) {
        return error;
    }
}

  // async loginCliente(url_billing, data, type) {
  //   let url = url_billing + "login_user?usuario=" + data.usuario + "&clave=" + data.clave;
  //   return new Promise((resolve) => {
  //     this.http.get(url)
  //       .subscribe((data: any) => {
  //         let resp;
  //         if (type == 'login') {
  //           resp = data;
  //         }
  //         if (type == 'other') {
  //           resp = data.data[0];
  //         }
  //         resolve(resp);
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });


  //   // let url = url_billing + "login_web_cliente?usuario=" + data.usuario + "&clave=" + data.clave;
  //   // return new Promise((resolve) => {
  //   //   this.http.get(url)
  //   //     .subscribe((data: any) => {
  //   //       // console.log("aquiiiiiiii", data.query[0]);
  //   //       resolve((data.query[0]));
  //   //     },
  //   //       error => {
  //   //         resolve(error)
  //   //       });
  //   // });
  // }

  async validateCi(url_billing, ci) {
    let url = url_billing + "validar_cedula?ci=" + ci;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          resolve((data));
        },
          error => {
            resolve(error)
          });
    });
  }

  async registerClientBilling(url_billing, newClient) {
    let url = this.apiLoxafree + "billing/registrarCliente";
    let data = {
      endPoint: url_billing + "registrar_cliente",
      user: {
        cedula: newClient.cedula,
        nombres: newClient.nombres,
        apellidos: newClient.apellidos,
        razonsocial: newClient.razonsocial,
        direccion: newClient.direccion,
        telefonos: newClient.telefonos,
        email: newClient.email,
        celular: newClient.celular,
        tipoCli: newClient.tipoCli,
        vendedor_id: newClient.vendedor_id,
        diasCredito: newClient.diasCredito,
        cupo_credito: newClient.cupo_credito,
        es_pasaporte: newClient.es_pasaporte,
      }
    }
    return this.http.post(url_billing + "registrar_cliente", data.user);
    // return new Promise((resolve) => {
    //   this.http.post(url, data).subscribe((data: any) => {
    //     resolve(data.respuesta);
    //   },
    //     error => {
    //       resolve(error)
    //     });
    // });
  }

  async addAtributesProducts(products, url_billing, configuracion) {
    let data = [];
    let resp: any;
    let venta_volumen = false;

    let query = {
      tabla: 'bill_settings',
      atributo: 'variable',
      valor_atributo: 'VENTAS_VOLUMEN_TIPOPRECIO',
      filas: '*'
    }

    await this.getDataAnyTabe(url_billing, query).then((resvar: any) => {
      if (resvar.rta == true) {
        if (resvar.data[0].valor == 1) {
          venta_volumen = true;
        }
      }
    });

    for (let d of products) {
      d.venta_volumen = venta_volumen;
      d.colores = [];
      d.color = '';
      d.tallas = [];
      d.talla_color_selected = false;
      // Validar si el producto tiene combo para la venta por volumen
      if (d.venta_volumen == true) {
        let aux = false;
        for (let pric of d.precios) {
          if (pric.cantidad_volumen > 0) {
            aux = true;
          }
        }
        d.combo_venta_volumen = aux;
      } else {
        d.combo_venta_volumen = false;
      }
      // Establecer el nombre y la descripcion
      d.nombre_producto = this.setDescriptionTitle(d.pro_nom, 'name');
      d.desc = this.setDescriptionTitle(d.descripcion, 'description');
      // No validar stock si es servicio o super producto
      if (d.productotipo_id == 3 || d.productotipo_id == 4) {
        d.imagenPrincipal = await this.getImagenPrincipalProductoPopular(d);
        d.tipo_web = configuracion.tipo_web;
        d.url_billing = url_billing;
        d.quantity = 1;
        d.stockactual = parseFloat(d.stockactual);
        d.guarnicion_add = [];
        if (configuracion.tipo_web == 2) {
          await this.verifyTallaProduct(d).then(async (restall) => {
            d.pro_nom = restall.pro_nom;
            d.talla = restall.talla;
            d.tagDeGrupo = restall.tagDeGrupo;
            d.color = restall.color;
          });
        } else {
          d.talla = '';
          d.tagDeGrupo = '';
        }
        data.push(d);
      } else {
        if (d.stockactual > 0) {
          d.imagenPrincipal = await this.getImagenPrincipalProductoPopular(d);
          d.tipo_web = configuracion.tipo_web;
          d.url_billing = url_billing;
          d.quantity = 1;
          d.stockactual = parseFloat(d.stockactual);
          d.guarnicion_add = [];
          if (configuracion.tipo_web == 2) {
            await this.verifyTallaProduct(d).then(async (restall: any) => {
              d.pro_nom = restall.pro_nom;
              d.talla = restall.talla;
              d.tagDeGrupo = restall.tagDeGrupo;
              d.color = restall.color;
            });
          } else {
            d.talla = '';
            d.tagDeGrupo = '';
          }
          data.push(d);
        }
      }
      // Agregando video youtube
      if (d.fotourl) {
        d.url_video_youtube = this.getIdVideoYoutube(d.fotourl);
      } else {
        d.url_video_youtube = '';
      }
    }

    if (data.length > 0) {
      resp = {
        rta: true,
        data: data
      }
    } else {
      resp = {
        rta: false,
        data: data
      }
    }

    return resp;
  }

  async validateClientCedIdentity(url_billing, validate) {
    let url = url_billing + "cliente_ci?identificacion=" + validate.cedula;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((datares: any) => {
          let data = datares[0];
          // console.log(data);
          let res: any;
          if (data) {
            if (validate.correo == data.email) {
              res = {
                rta: true,
                data: data
              }
            } else {
              res = {
                rta: false,
                data: {}
              }
            }
          } else {
            res = {
              rta: false,
              data: {}
            }
          }
          resolve((res));
        },
          error => {
            resolve(error)
          });
    });
  }

  async updateAttributeTable(url_billing, query) {
    let url = this.apiLoxafree + "billing/update_attribute_table";
    let info = {
      endPoint: url_billing + "update_atributo_tabla",
      data: query
    }

    // console.log("que se vaaa", info);
    return new Promise((resolve) => {
      this.http.post(url, info).subscribe((data: any) => {
        resolve(data.respuesta);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getCustomerDataByCedula(url_billing, cedula) {
    let url = url_billing + "cliente_ci?identificacion=" + cedula;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  // Obtener datos de cualquier tabla
  async getDataAnyTabe(url_billing, data) {
    let url = url_billing + "get_atributo_tabla?tabla=" + data.tabla + "&atributo=" + data.atributo + "&valor_atributo=" + data.valor_atributo + "&filas=" + data.filas;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getDirectionsClient(url_billing, id_client) {
    let url = url_billing + "directions_by_client?id_cliente=" + id_client;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getDataUserByCedula(url_billing, cedula) {
    let url = url_billing + 'get_client_cedula?cedula=' + cedula;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  async insertCotization(url_billing, cotization) {
    let url = this.apiLoxafree + "billing/create_cotization";
    let data = {
      endPoint: url_billing + "insert_cotizacion",
      data: cotization
    }
    return new Promise((resolve) => {
      this.http.post(url, data).subscribe((data: any) => {
        resolve(data.respuesta);
      },
        error => {
          resolve(error)
        });
    });
  }
  postGeneral2(url: any, json: any) {
    console.log('url ==> ', url);
    console.log('json ==> ', url);
    
    return this.http.post(url, json);
  }


  async deleteCotization(url_billing, id_cotization) {
    let url = url_billing + 'eliminar_cotizacion?id_cotizacion=' + id_cotization;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getCotizationsClient(url_billing, data) {
    let url = url_billing + 'list_cotizacion_all?cedula=' + data.cedula + '&desde=' + data.desde + '&hasta=' + data.hasta;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getCotizacionByIdOrCedula(url_billing, search) {
    let url = url_billing + 'get_cotizacion_id_o_client?search=' + search;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        for(let c of data.data){
          c.checked = false;
        }
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getPricesType(url_billing) {
    let url = url_billing + 'get_tipos_pvp?grupo_id';
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data.query);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getBodegasAll(url_billing) {
    let url = url_billing + 'get_bodegas';
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  // Obtiene los productos de un grupo, se usa para cambiar esteblecer imagenes de productos
  async getProductsByGroup(url_billing, id_group) {
    let url = url_billing + "productosall_x_grupoid?grupo_id=" + id_group;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          resolve(data.query);
        },
          error => {
            resolve(error)
          });
    });
  }

  async getProductsByGroupFree(url_billing, id_group, configuracion) {
    let url = url_billing + "get_productos_grupo_free?idgrupo=" + id_group + '&bodega_id=' + configuracion.id_bodega;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe(async (data: any) => {
          await this.deleteProductsDuplicated(data.data, 'id_producto').then(async (resdup) => {
            data.data = resdup;
          });
          resolve(data);
        },
          error => {
            resolve(error)
          });
    });
  }

  checkedAtributes(atribute) {
    let aux;
    if (atribute == 1) {
      aux = true;
    } else {
      aux = false;
    }
    return aux;
  }

  async getGuarnitionsProduct(url_billing, id_producto) {
    let url = url_billing + "get_guarnicion_product?id_producto=" + id_producto;
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          if (data.rta == true) {
            for (let g of data.data) {
              g.checked = false;
            }
          }
          resolve(data);
        },
          error => {
            resolve(error)
          });
    });
  }

  async sendNotificationAdministrator(url_billing, notification) {
    let url = this.apiLoxafree + "billing/send_notification_admin";
    let data = {
      endPoint: url_billing + "send_notification_all_client",
      data: notification
    }
    return new Promise((resolve) => {
      this.http.post(url, data).subscribe((data: any) => {
        // console.log("data", data);
        resolve(data.respuesta);
      },
        error => {
          resolve(error)
        });
    });
  }

  async updateAtributeProduct(url_billing, data) {
    let url = url_billing + "update_atributo_tabla?tabla=" + data.tabla + "&id=" + data.id + "&valor_id=" + data.valor_id + "&atributo=" + data.atributo + "&valor_atributo=" + data.valor_atributo;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  async getAttributesProducts(url_billing) {
    let url = url_billing + "get_atributes_new_product?marca=1&impuesto_ice=0&impuesto_iva=0&precios=0&tipo_producto=0&guarniciones=0";
    return new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          resolve(data);
        },
          error => {
            resolve(error)
          });
    });
  }

  // async getReferidosProduct(url_billing, id_producto) {
  //   let url = url_billing + "get_referidos_product?id_producto=" + id_producto;
  //   return new Promise((resolve) => {
  //     this.http.get(url)
  //       .subscribe((data: any) => {
  //         resolve(data);
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }

  async getReferidosProduct(url_billing, id_producto) {
  let url = url_billing + "get_referidos_product?id_producto=" + id_producto;
  return new Promise((resolve, reject) => {
    this.http.get(url)
      .subscribe({
        next: (data: any) => {
          resolve(data);
        },
        error: (error) => {
          reject(error); // Cambiado de resolve a reject
        }
      });
  });
}

  // async insertReferidosProduct(url_billing, data) {
  //   let url = url_billing + "insert_referidos_product?id_producto=" + data.id_producto + "&id_referido=" + data.id_referido + "&bodega_id=" + data.bodega_id;
  //   return new Promise((resolve) => {
  //     this.http.get(url)
  //       .subscribe((data: any) => {
  //         resolve(data);
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }
  async insertReferidosProduct(url_billing, data) {
  let url = url_billing + "insert_referidos_product?id_producto=" + data.id_producto + "&id_referido=" + data.id_referido + "&bodega_id=" + data.bodega_id;
  return new Promise((resolve, reject) => {
    this.http.get(url)
      .subscribe({
        next: (data: any) => {
          resolve(data);
        },
        error: (error) => {
          resolve(error); // Manteniendo tu lógica original
        }
      });
  });
}

  // async updateAtributeProvince(url_billing, data) {
  //   let url = url_billing + "update_atributo_tabla?tabla=" + data.tabla + "&id=" + data.id + "&valor_id=" + data.valor_id + "&atributo=" + data.atributo + "&valor_atributo=" + data.valor_atributo;
  //   return new Promise((resolve) => {
  //     this.http.get(url).subscribe((data: any) => {
  //       resolve(data);
  //     },
  //       error => {
  //         resolve(error)
  //       });
  //   });
  // }
  async updateAtributeProvince(url_billing, data) {
  let url = url_billing + "update_atributo_tabla?tabla=" + data.tabla + "&id=" + data.id + "&valor_id=" + data.valor_id + "&atributo=" + data.atributo + "&valor_atributo=" + data.valor_atributo;
  return new Promise((resolve, reject) => {
    this.http.get(url).subscribe({
      next: (data: any) => {
        resolve(data);
      },
      error: (error) => {
        resolve(error); // Manteniendo tu lógica original
      }
    });
  });
}

  // async getGuiaTallasAll(url_billing) {
  //   let url = url_billing + "get_guias_tallas_all";
  //   return new Promise((resolve) => {
  //     this.http.get(url).subscribe((data: any) => {
  //       resolve(data);
  //     },
  //       error => {
  //         resolve(error)
  //       });
  //   });
  // }
  async getGuiaTallasAll(url_billing) {
  let url = url_billing + "get_guias_tallas_all";
  return new Promise((resolve, reject) => {
    this.http.get(url).subscribe({
      next: (data: any) => {
        resolve(data);
      },
      error: (error) => {
        resolve(error); // Manteniendo tu lógica original
      }
    });
  });
}

  // async deleteGuiaTalla(url_billing, id_guia_talla) {
  //   let url = url_billing + "delete_guias_talla?id_guia=" + id_guia_talla;
  //   return new Promise((resolve) => {
  //     this.http.get(url)
  //       .subscribe((data: any) => {
  //         resolve(data);
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }
  async deleteGuiaTalla(url_billing, id_guia_talla) {
  let url = url_billing + "delete_guias_talla?id_guia=" + id_guia_talla;
  return new Promise((resolve, reject) => {
    this.http.get(url)
      .subscribe({
        next: (data: any) => {
          resolve(data);
        },
        error: (error) => {
          resolve(error); // Manteniendo tu lógica original
        }
      });
  });
}

  // async getGuiaTallasGroupId(url_billing, id_grupo) {
  //   let url = url_billing + "get_guias_tallas_x_grupo?id_grupo=" + id_grupo;
  //   return new Promise((resolve) => {
  //     this.http.get(url).subscribe((data: any) => {
  //       resolve(data);
  //     },
  //       error => {
  //         resolve(error)
  //       });
  //   });
  // }

  async getGuiaTallasGroupId(url_billing, id_grupo) {
  let url = url_billing + "get_guias_tallas_x_grupo?id_grupo=" + id_grupo;
  return new Promise((resolve, reject) => {
    this.http.get(url).subscribe({
      next: (data: any) => {
        resolve(data);
      },
      error: (error) => {
        resolve(error); // Manteniendo tu lógica original
      }
    });
  });
}

  // async deleteGuiaTallaDetalle(url_billing, id_guia_talla_detalle) {
  //   let url = url_billing + "delete_guias_talla_detalle?id_guia_detalle=" + id_guia_talla_detalle;
  //   return new Promise((resolve) => {
  //     this.http.get(url)
  //       .subscribe((data: any) => {
  //         resolve(data);
  //       },
  //         error => {
  //           resolve(error)
  //         });
  //   });
  // }

  async deleteGuiaTallaDetalle(url_billing, id_guia_talla_detalle) {
  let url = url_billing + "delete_guias_talla_detalle?id_guia_detalle=" + id_guia_talla_detalle;
  return new Promise((resolve, reject) => {
    this.http.get(url)
      .subscribe({
        next: (data: any) => {
          resolve(data);
        },
        error: (error) => {
          resolve(error); // Manteniendo tu lógica original
        }
      });
  });
}

  // ****** Funciones globales ******

  setDescriptionTitle(letters, type) {
    let text = '';
    if (letters) {
      if (type == 'name') {
        if (letters.length <= 40) {
          text = letters;
        } else {
          text = letters.slice(0, 37) + ' ...';
        }
      }

      if (type == 'description') {

        if (letters) {
          if (letters.length <= 40) {
            text = letters;
          } else {
            text = letters.slice(0, 37) + ' ...';
          }
        } else {
          text = '';
        }
      }

      if (type == 'title-promotion') {
        if (letters) {
          if (letters.length <= 30) {
            text = letters;
          } else {
            text = letters.slice(0, 27) + ' ...';
          }
        } else {
          text = 'Promoción';
        }
      }

      if (type == 'title-referidos') {
        if (letters.length <= 15) {
          text = letters;
        } else {
          text = letters.slice(0, 15);
        }
      }
    }
    return text;
  }

  async verifyTallaProduct(product) {

    let res = {
      pro_nom: product.pro_nom,
      talla: '',
      tagDeGrupo: '',
      color: ''
    };

    let str = product.pro_nom;
    let i = str.indexOf("TALLA ");
    if (i > 0) {
      let pro_nom = str.substring(0, (i - 1));
      let tagDeGrupo = str.substring(0, (i - 1));
      let talla = '';
      let color = ''

      // Validar si tiene color
      let colorStr = str.indexOf("COLOR ");
      if (colorStr > 0) {
        talla = str.substring(i, (colorStr - 1));
        color = str.substring(colorStr + 6, (str.length));
      } else {
        talla = str.substring(i, (str.length));
      }

      res = {
        pro_nom: pro_nom,
        talla: talla,
        tagDeGrupo: tagDeGrupo,
        color: color
      }
    }
    return res;
  }

  async createTallasProduct(products) {
    let prodTallas = [];
    let prodSinTallas = [];
    let clasifyTall = [];
    let colorTable = [];
    // Recorrer productos para agregar tallas y colores
    for (let p of products) {
      p.review_talla = false;
      if (p.tagDeGrupo) {
        prodTallas.push(p);
      } else {
        prodSinTallas.push(p);
        p.tallas = [];
      }
    }
    // Si hay productos con tallas ingresar
    if (prodTallas.length > 0) {
      // Obtener colores
      await this.getColors().then(async (rescolors: any) => {
        if (rescolors.rta == true) {
          colorTable = rescolors.data;
        }
      });
      // Clasificar tallas del mismo producto
      for (let p1 of prodTallas) {
        let tallas = [];
        // Tallas del mismo producto
        if (p1.review_talla == false) {
          for (let p2 of prodTallas) {
            if (p1.tagDeGrupo == p2.tagDeGrupo) {
              p2.review_talla = true;
              tallas.push(this.addAtributtesProductTallas(p2));
            }
          }
        }
        // Crear el arreglo de tallas
        if (tallas.length > 0) {
          let aux = {
            tagTalla: p1.tagDeGrupo,
            data: tallas
          }
          clasifyTall.push(aux);
        }
      }
      // Agregar colores a sus tallas
      await this.deleteProductsDuplicatedTalla(products, 'tagDeGrupo').then(async (resprod) => {
        for (let p of resprod) {
          for (let ct of clasifyTall) {
            if (p.tagDeGrupo == ct.tagTalla) {
              await this.deleteProductsDuplicated(ct.data, 'talla').then(async (restalla) => {
                for (let t of restalla) {
                  let colores = [];
                  for (let dt of ct.data) {
                    if (dt.review_color == false && t.talla == dt.talla) {
                      if (dt.color) {
                        colores.push(this.addAtributtesProductTallas(dt));
                        dt.review_color = true;
                      }
                    }
                  }
                  // Agregar el codigo del color
                  t.colores = colores;
                  if (colores.length > 0) {
                    await this.stablishColorsProduct(colorTable, t).then(async (rescolors) => {
                      t.colores = rescolors;
                    });
                  }
                }
                // Ordenar tallas de menor a mayor si hay mas de una
                if (restalla.length > 1) {
                  p.tallas = this.orderTallasProducts(restalla, 'asc');
                } else {
                  p.tallas = restalla;
                }
              });
            }
          }
        }
        products = resprod;
      });
    }

    // console.log("con", prodTallas);
    // console.log("sin", prodSinTallas);
    // console.log("devuelto", products);


    return products;
  }

  addAtributtesProductTallas(product) {
    let data = {
      codigo2: product.codigo2,
      desc_impuesto: product.desc_impuesto,
      descripcion: product.descripcion,
      id_grupo: product.id_grupo,
      id_subgrupo: product.id_subgrupo,
      id_producto: product.id_producto,
      imagenPrincipal: product.imagenPrincipal,
      imagen_cuatro: product.imagen_cuatro,
      imagen_dos: product.imagen_dos,
      imagen_tres: product.imagen_tres,
      imagen_uno: product.imagen_uno,
      img: product.img,
      impuesto_porcent: product.impuesto_porcent,
      nombre_producto: product.nombre_producto,
      precioOferta: product.precioOferta,
      precioReal: product.precioReal,
      precios: product.precios,
      pro_nom: product.pro_nom,
      productotipo_id: product.productotipo_id,
      quantity: product.quantity,
      stockactual: product.stockactual,
      tagDeGrupo: product.tagDeGrupo,
      talla: product.talla,
      tipo_web: product.tipo_web,
      url_billing: product.url_billing,
      review_color: false,
      color: product.color,
      fotourl: product.fotourl,
      url_video_youtube: product.url_video_youtube,
      talla_color_selected: product.talla_color_selected,
      referidos: product.referidos
    }
    return data;
  }

  async unifySubgroup(data1, data2) {

    let group = [];

    for (let d1 of data1) {
      for (let d2 of data2) {
        if (d1.nombre == d2.nombre) {
          if (d2.subgrupos.length > 0) {
            for (let g of d2.subgrupos) {
              d1.subgrupos.push(g);
            }
          }
        }
      }
    }

    for (let d1 of data1) {
      if (d1.subgrupos.length > 0) {
        d1.subgrupos = this.subgroupFormat(d1.subgrupos);
      }
    }

    for (let d1 of data1) {
      for (let d2 of data2) {
        if (d1.nombre == d2.nombre) {
          if (d2.subgrupos.length == 0) {
            console.log("esteeeeee", d2);
            d1.url_billing_2 = d2.url_billing;
            d1.idgrupo_2 = d2.idgrupo;
          }
          data2 = this.deleteItemDuplicated(data2, d2);
        }
      }
    }

    for (let d1 of data1) {
      group.push(d1);
    }
    for (let d2 of data2) {
      group.push(d2);
    }

    // console.log("diferenete", group);

    return group;
  }

  subgroupFormat(subgroups) {
    let hash = {};
    let sub = [];
    let sg = subgroups;

    for (let s1 of subgroups) {
      for (let s2 of sg) {
        if (s1.nombre == s2.nombre && s1.url_billing != s2.url_billing) {
          // console.log("igual", s1.nombre);
          let data = {
            estado: 1,
            id_grupo: s1.id_grupo,
            id_grupo_2: s2.id_grupo,
            id_sub: s1.id_sub,
            id_sub_2: s2.id_sub,
            img: "",
            nombre: "OTROS",
            url_billing: s1.url_billing,
            url_billing_2: s2.url_billing
          }
          sub.push(data)
        }
      }
    }

    let data = sub.filter(o => hash[o.nombre] ? false : hash[o.nombre] = true);
    // console.log(data);
    return data;
  }

  deleteItemDuplicated(data, item) {
    var i = data.indexOf(item);
    data.splice(i, 1);
    return data;
  }

  async unifyProductosDosUrls(data1, data2) {
    let prodAll = [];
    let hash = {};
    for (let d2 of data2) {
      prodAll.push(d2);
    }

    // obtener los productos iguales
    for (let d1 of data1) {
      // unificar
      prodAll.push(d1);
      for (let d2 of data2) {
        if (d1.pro_nom == d2.pro_nom) {
          if (d1.pA > d2.pA) {
            prodAll.push(d1)
          } else {
            prodAll.push(d2)
          }
        }
      }
    }

    // Elimnar similares
    let productos = prodAll.filter(o => hash[o.pro_nom] ? false : hash[o.pro_nom] = true);
    return productos;
  }

  async deleteProductsDuplicated(productos, atributo) {
    var newProducts = [];
    var lookupObject = {};
    for (var i in productos) {
      lookupObject[productos[i][atributo]] = productos[i];
    }
    for (i in lookupObject) {
      newProducts.push(lookupObject[i]);
    }
    return newProducts;
  }

  async deleteProductsDuplicatedTalla(productos, atributo) {
    productos = this.orderProductForId(productos, 'desc');
    var newProducts = [];
    var lookupObject = {};
    for (var i in productos) {
      if (productos[i][atributo]) {
        lookupObject[productos[i][atributo]] = productos[i];
      } else {
        lookupObject[productos[i]['id_producto']] = productos[i];
      }
    }

    for (i in lookupObject) {
      newProducts.push(lookupObject[i]);
    }
    return newProducts;
  }

  async getImagenPrincipalProducto(product) {
    let imagenes = [
      { 'id': 1, 'imagen': product.imagen_uno },
      { 'id': 2, 'imagen': product.imagen_dos },
      { 'id': 3, 'imagen': product.imagen_tres },
      { 'id': 4, 'imagen': product.imagen_cuatro }
    ]
    let aux = false;
    let imagenPrincipal;
    for (let i of imagenes) {
      if (aux == false) {
        if (i.imagen) {
          imagenPrincipal = i.imagen;
          aux = true;
        } else {
          imagenPrincipal = '1bW4FHKxVF0tHzYbiYTu1iEh4BaSYbRm2';
        }
      }
    }
    return imagenPrincipal;
  }

  async getImagenPrincipalProductoPopular(product) {
    let imagenes = [
      { 'id': 1, 'imagen': product.imagen_uno },
      { 'id': 2, 'imagen': product.imagen_dos },
      { 'id': 3, 'imagen': product.imagen_tres },
      { 'id': 4, 'imagen': product.imagen_cuatro }
    ]
    let aux = false;
    let imagenPrincipal;
    for (let i of imagenes) {
      if (aux == false) {
        if (i.imagen) {
          imagenPrincipal = i.imagen;
          aux = true;
        } else {
          imagenPrincipal = '1bW4FHKxVF0tHzYbiYTu1iEh4BaSYbRm2';
        }
      }
    }
    return imagenPrincipal;
  }

  async getDate(tipo) {
    let fechActual;
    var month_name = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
    var month_number = new Array('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12');
    const date = new Date();

    if (tipo == 0) {
      fechActual = date.getFullYear() + "/" + month_name[date.getMonth()] + "/" + date.getDate();
    }

    if (tipo == 1) {
      date.setMinutes(date.getMinutes() + 3);
      date.setHours(date.getHours() - 5);
      fechActual = date.toISOString();
    }

    if (tipo == 2) {
      date.setHours(date.getHours() - 5);
      fechActual = date.toISOString();
    }

    let fecha = {
      año: date.getFullYear(),
      mes: month_name[date.getMonth()],
      mes_num: month_number[date.getMonth()],
      dia: date.getDate(),
      hora: date.getHours(),
      minuto: date.getMinutes(),
      segundo: date.getSeconds(),
      fechActual: fechActual
    }

    return fecha;
  }

  async getDateBeforeMonth() {
    var fechaHoy = new Date();
    var month_number = new Array('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12');

    var year = (fechaHoy.getMonth() - 1 == -1) ? fechaHoy.getUTCFullYear() - 1 : fechaHoy.getUTCFullYear();

    let month: any = (fechaHoy.getMonth() - 2 == -1) ? 12 : fechaHoy.getMonth() - 2;
    // console.log("mes", (fechaHoy.getMonth() - 2 == -1) ? 12 : fechaHoy.getMonth() - 2);

    if (month < 10) {
      month = String('0' + month);
    }
    let data = {
      desde: year + '-' + month + '-01',
      hasta: fechaHoy.getUTCFullYear() + '-' + month_number[fechaHoy.getMonth()] + '-' + fechaHoy.getDate()
    }
    return data;
  }

  async setNameProduct(nombre, tag) {
    let name;

    if (tag) {
      if (tag.length <= 43) {
        name = tag;
      } else {
        name = tag.slice(0, 40) + ' ...';
      }
    } else {
      if (nombre <= 43) {
        name = nombre;
      } else {
        name = nombre.slice(0, 40) + ' ...';
      }
    }

    return name;

  }

  // async saveUserLocalStorage(user, loginStorage, rol) {
  //   let nameAll = user.nombres + ' ' + user.apellidos;
  //   user.rol = rol;
  //   if (nameAll) {
  //     if (nameAll.length <= 30) {
  //       user.nameUser = nameAll;
  //     } else {
  //       user.nameUser = nameAll.slice(0, 30);
  //     }
  //   } else {
  //     user.nameUser = 'DEFAULT NAME';
  //   }
  //   //  return this.localStorage.setItem(loginStorage, user).subscribe({
  //   //     next:(resp:any)=>{
  //   //     let data = {
  //   //       rta: resp,
  //   //       data: user,
  //   //     }
  //   //     this.userLogin = {
  //   //       name: user.nameUser,
  //   //       imagen: user.imagen,
  //   //       login: true,
  //   //       rol: user.rol
  //   //     }
  //   //     this.usr$.next(this.userLogin); 
  //   //     },
  //   //     error: (err: any) => {
  //   //         let data = {
  //   //         rta: false,
  //   //         data: err,
  //   //        }
  //   //     },
  //   //     complete: () => {
  //   //       // this.flagLoader = false;
  //   //       // console.log('sea acab[o esta fritada');
  //   //     },
  //   //   })

  // return  new Promise((resolve) => {
  //     this.localStorage.set(loginStorage, user).subscribe({
  //       next: (auth) => {
  //         const data = {
  //           rta: auth,
  //           data: user,
  //         };
  //         this.userLogin = {
  //           name: user.nameUser,
  //           imagen: user.imagen,
  //           login: true,
  //           rol: user.rol
  //         };
  //         this.usr$.next(this.userLogin);
  //         resolve(data);
  //       },
  //       error: (error) => {
  //         const data = {
  //           rta: false,
  //           data: error,
  //         };
  //         resolve(data);
  //       }
  //     });
  //   });   
    
  //   // new Promise(async (resolve) => {
  //   //   await this.localStorage.setItem(loginStorage, user).subscribe(async (auth) => {
  //   //     let data = {
  //   //       rta: auth,
  //   //       data: user,
  //   //     }
  //   //     this.userLogin = {
  //   //       name: user.nameUser,
  //   //       imagen: user.imagen,
  //   //       login: true,
  //   //       rol: user.rol
  //   //     }
  //   //     this.usr$.next(this.userLogin);
  //   //     resolve(data);
  //   //   }, error => {
  //   //     let data = {
  //   //       rta: false,
  //   //       data: error,
  //   //     }
  //   //     resolve(data);
  //   //   });
  //   // });
  // }

  // async saveUserLocalStorage(user, loginStorage, rol) {
  //   let nameAll = user.nombres + ' ' + user.apellidos;
  //   user.rol = rol;
  //   if (nameAll) {
  //     if (nameAll.length <= 30) {
  //       user.nameUser = nameAll;
  //     } else {
  //       user.nameUser = nameAll.slice(0, 30);
  //     }
  //   } else {
  //     user.nameUser = 'DEFAULT NAME';
  //   }
  //   return new Promise(async (resolve) => {
  //     await this.localStorage.setItem(loginStorage, user).subscribe(async (auth) => {
  //       let data = {
  //         rta: auth,
  //         data: user,
  //       }
  //       this.userLogin = {
  //         name: user.nameUser,
  //         imagen: user.imagen,
  //         login: true,
  //         rol: user.rol,
  //         user: user
  //       }
  //       this.usr$.next(this.userLogin);
  //       localStorage.setItem(loginStorage, JSON.stringify(this.userLogin) )
  //       resolve(data);
  //     }, error => {
  //       let data = {
  //         rta: false,
  //         data: error,
  //       }
  //       resolve(data);
  //     });
  //   });
  // }

  // ---------------------------------------- NUEVO PWA ---------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------

  async saveUserLocalStorage(user: any, loginStorage: string, rol: string) {
    // Validaciones de entrada
    if (!user || !loginStorage || !rol) {
        return {
            rta: false,
            data: 'Invalid parameters: user, loginStorage, and rol are required'
        };
    }

    try {
        // Preparar nombre completo con validación
        const fullName = `${user.nombres || ''} ${user.apellidos || ''}`.trim();
        user.rol = rol;
        user.nameUser = this.formatUserName(fullName);

        // Guardar en storage principal
        await this.localStorage.set(loginStorage, user);
        
        // Crear objeto de sesión
        this.userLogin = {
            name: user.nameUser,
            imagen: user.imagen || null,
            login: true,
            rol: user.rol,
            user: user
        };

        // Actualizar estado reactivo
        this.usr$.next(this.userLogin);
        
        // Backup en localStorage nativo para persistencia adicional
        localStorage.setItem(`${loginStorage}_backup`, JSON.stringify(this.userLogin));

        return {
            rta: true,
            data: user
        };

    } catch (error) {
        console.error('Error saving user data:', error);
        
        // Intentar limpiar estado en caso de error
        this.clearUserSession();
        
        return {
            rta: false,
            data: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

private formatUserName(fullName: string): string {
    if (!fullName || fullName.trim() === '') {
        return 'DEFAULT NAME';
    }
    
    const trimmedName = fullName.trim();
    return trimmedName.length <= 30 ? trimmedName : `${trimmedName.slice(0, 27)}...`;
}

private clearUserSession(): void {
    this.userLogin = null;
    this.usr$.next(null);
}
// -------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------

  observableLoginUser(): Observable<userNames> {
    return this.usr$.asObservable();
  }

  async signOuth(loginStorage: string) {
    try {
        // Usar .delete() en lugar de .removeItem()
        await firstValueFrom(this.localStorage.delete(loginStorage));
        
        // Limpiar estado del usuario
        this.userLogin = {
            name: '',
            imagen: '',
            login: false,
            rol: '',
            user: ''
        };

        // Actualizar BehaviorSubject (descomenta si lo necesitas)
        // this.usr$.next(this.userLogin);
        
        // Limpiar localStorage nativo
        localStorage.removeItem(loginStorage);
        localStorage.removeItem(`${loginStorage}_backup`);
        
        // Guardar estado vacío
        await this.saveToLocalStorage(loginStorage, this.userLogin);

        return {
            rta: true,
            data: 'User logged out successfully'
        };

    } catch (error) {
        console.error('Error during logout:', error);
        return {
            rta: false,
            data: error instanceof Error ? error.message : 'Logout failed'
        };
    }
}

  // async signOuth(loginStorage) {
  //   return new Promise(async (resolve) => {
  //     this.localStorage.removeItem(loginStorage).subscribe((remov) => {
  //       let data = {
  //         rta: true,
  //         data: remov
  //       }

  //       this.userLogin = {
  //         name: '',
  //         imagen: '',
  //         login: false,
  //         rol: '',
  //         user:''
  //       }
  //       // this.usr$.next(this.userLogin);
  //      localStorage.removeItem(loginStorage);
  //      this.saveToLocalStorage(loginStorage,this.userLogin );

  //       resolve(data);
  //     });
  //   });
  // }

  // async isAuthenticatedClient(loginStorage) {
  //   console.log('LOGIN STORAGE === > ', loginStorage);
    
  //   return new Promise((resolve) => {
  //     this.localStorage.get(loginStorage).subscribe((auth: any) => {
  //       console.log('auth ===> ', auth);
        
  //       let data;
  //       // console.log('datos admin',auth);
        
  //       if (auth) {
  //         data = {
  //           rta: true,
  //           data: auth
  //         }
  //       } else {
  //         data = {
  //           rta: false,
  //           data: auth
  //         }
  //       }
  //       resolve(data);
  //     });
  //   });
  // }

 async isAuthenticatedClient(loginStorage: string) {
    console.log('LOGIN STORAGE === > ', loginStorage);
    
    try {
        const auth = await firstValueFrom(
            this.localStorage.get(loginStorage).pipe(
                startWith(null), // Asegura que siempre emita algo
                take(1),         // Toma solo el primer valor
                timeout(3000)    // Timeout de 3 segundos
            )
        );
        
        console.log('auth ===> ', auth);
        
        return {
            rta: !!auth,
            data: auth || null
        };
        
    } catch (error) {
        console.error('Auth check failed:', error);
        return {
            rta: false,
            data: null
        };
    }
}



//   isAuthenticatedClient(loginStorage: string): Observable<{ rta: boolean; data: any }> {
//   console.log('LOGIN STORAGE === > ', loginStorage);

//   return this.localStorage.getItem(loginStorage).pipe(
//     map((auth: any) => {
//       console.log('auth ===> ', auth);

//       if (auth) {
//         return {
//           rta: true,
//           data: auth
//         };
//       } else {
//         return {
//           rta: false,
//           data: auth
//         };
//       }
//     })
//   );
// }

  async obtainAndCalculatePriceProduct(products, config, login) {
    let tipoPrecio;
    if (login.rta == true) {
      if (login.data.rol == 'Client') {
        // await this.getUrlEmpresa().then(async (url) => {
          await this.loginCliente(this.urlBilling, { usuario: login.data.PersonaComercio_cedulaRuc, clave: login.data.clave }, 'other').then(async (reslogin: any) => {
            if (reslogin.default_price == login.data.default_price) {
              tipoPrecio = reslogin.default_price;
            } else {
              tipoPrecio = reslogin.default_price;
              await this.saveUserLocalStorage(reslogin, config.loginStorage, "Client").then(async (resauth: any) => { });
            }
          });
        // });
      } else {
        tipoPrecio = config.tipoPrecio;
      }
    } else {
      tipoPrecio = config.tipoPrecio;
    }
    for (let prod of products) {
      let aux = {
        bandera: false,
        tipo: 'pA',
        valor: '',
      }

      for (let p of prod.precios) {
        if (p.cantidad_volumen > 0) {
          p.combo = 'Lleva más de ' + p.cantidad_volumen + ' x $ ' + this.roundValue(p.valor_mas_iva) + ' c/u';
        } else {
          p.combo = ''
        }

        if (p.id_tipo == tipoPrecio) {
          aux = {
            bandera: true,
            tipo: p.id_tipo,
            valor: p.valor_mas_iva
          }
        } else {
          if (aux.bandera == false) {
            aux = {
              bandera: false,
              tipo: p.id_tipo,
              valor: p.valor_mas_iva
            }
          }
        }
      }

      if (aux.bandera == true) {
        prod.tipoPrecio = aux.tipo;
        prod.precioReal = parseFloat(aux.valor).toFixed(2);
        if (config.porcentajePrecioOferta > 0) {
          await this.calculatePriceOfert(aux.valor, config.porcentajePrecioOferta).then((resVal) => {
            prod.precioOferta = resVal;
          });
        } else {
          prod.precioOferta = 0;
        }
      } else {
        prod.tipoPrecio = aux.tipo;
        prod.precioReal = parseFloat(aux.valor).toFixed(2);
        if (config.porcentajePrecioOferta > 0) {
          await this.calculatePriceOfert(aux.valor, config.porcentajePrecioOferta).then((resVal) => {
            prod.precioOferta = resVal;
          });
        } else {
          prod.precioOferta = 0;
        }
      }

    }
    products = await this.orderProductPriceAscDesc(products, 'asc');
    return products;
  }

  async calculatePriceOfert(price, porcent) {
    let porcentVal = (price * porcent) / 100;
    let val = price + porcentVal;
    return val;
  }

  async selectSizeProduct(id_producto, product) {
    let prodTemp;
    for (let p of product.tallas) {
      if (p.id_producto == id_producto) {
        prodTemp = p;
      }
    }
    prodTemp.quantity = product.quantity;
    prodTemp.stockactual = product.stockactual;
    prodTemp.tallas = product.tallas;

    return prodTemp;
  }

  async stablishColorsProduct(colors, product) {
    for (let cp of product.colores) {
      for (let c of colors) {
        if (cp.color == c.nombre) {
          cp.colorCodigo = c.codigo;
        }
      }
    }
    // Establecer el color seleccionado del producto
    for (let cs of product.colores) {
      if (product.color == cs.color) {
        cs.talla_color_selected = true;
      } else {
        cs.talla_color_selected = false;
      }
    }
    return product.colores;
  }

  // Establecer el color seleccionado del producto
  async selectColorProduct(color, product) {
    let prodAux;
    let colorAux = product.colores;
    let tallasAux = product.tallas;
    for (let cs of product.colores) {
      if (color.color == cs.color) {
        cs.talla_color_selected = true;
        prodAux = cs;
      } else {
        cs.talla_color_selected = false;
      }
    }
    prodAux.tallas = tallasAux;
    prodAux.colores = colorAux;
    return prodAux;
  }

  // Obtener el color de las tallas
  colorDefaultProduct(product) {
    let aux;
    for (let t of product.tallas) {
      if (product.talla == t.talla) {
        for (let c of t.colores) {
          c.colores = t.colores;
          if (product.color == c.color) {
            aux = c;
            break;
          }
        }
      }
    }
    return aux;
  }

  async addGuarnitionProduct(checked, guarnition, product) {
    if (checked == true) {
      guarnition.checked = true;
      product.guarnicion_add.push(guarnition);
    }
    if (checked == false) {
      product.guarnicion_add = this.deleteItemDuplicated(product.guarnicion_add, guarnition);
    }
    return product;
  }

  validateEmail(email) {
    let expr = /^(?:[^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*|"[^\n"]+")@(?:[^<>()[\].,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,63}$/i;
    if (expr.test(email)) {
      return true;
    } else {
      return false;
    }
  }

  convertMayuscula(string) {
    let cadena = string.toUpperCase();
    return cadena;
  }

  convertStringTypeSentence(string) {

    let arreglo = string.split(' ');
    let new_arr = [];
    let new_string = '';

    for (let s of arreglo) {
      let i = s.charAt(0).toUpperCase();
      let f = s.substr(1, s.length);
      let n = i + f.toLowerCase();
      new_arr.push(n)
    }

    for (let s of new_arr) {
      new_string += s + ' ';
    }

    return new_string;
  }

  validateNumbers(numero) {
    numero.search(/^([0-9])*$/);
    let response;
    if (numero > 0) {
      response = true;
    } else {
      response = false;
    }
    return response;
  }



  // Ordenar por el precio
  async orderProductPriceAscDesc(data, type) {

    let order;

    if (type == 'asc') {
      order = data.sort(function (a, b) {
        if (a.precioReal < b.precioReal)
          return -1;
        if (a.precioReal > b.precioReal)
          return 1;
        return 0;
      });
    }

    if (type == 'desc') {
      order = data.sort(function (a, b) {
        if (a.precioReal > b.precioReal)
          return -1;
        if (a.precioReal < b.precioReal)
          return 1;
        return 0;
      });
    }

    return order;
  }

  orderProductForId(products, type) {

    let order;

    if (type == 'asc') {
      order = products.sort(function (a, b) {
        if (a.id_producto < b.id_producto)
          return -1;
        if (a.id_producto > b.id_producto)
          return 1;
        return 0;
      });
    }

    if (type == 'desc') {
      order = products.sort(function (a, b) {
        if (a.id_producto > b.id_producto)
          return -1;
        if (a.id_producto < b.id_producto)
          return 1;
        return 0;
      });
    }

    return order;
  }

  // Ordenar cotizaciones por fecha Asc/Des
  orderCotizationsById(data, type) {
    let order;

    if (type == 'asc') {
      order = data.sort(function (a, b) {
        return a.id - b.id;
      });
    }

    if (type == 'desc') {
      order = data.sort(function (a, b) {
        return b.id - a.id;
      });
    }

    return order;
  }

   saveTemporaryCatalogue(catalogo) {
    this.catalogue =  catalogo;
    // console.log("guardo catalogo", this.catalogue);
  }

  async getTemporaryCatalogue() {
    return await this.catalogue;
  }

  async saveTemporaryPromotions(value, promotions) {
    this.promotions = {
      rta: value,
      data: promotions
    }
    // console.log("guardo promociones", this.promotions);
  }

  async getTemporaryPromotions() {
    return this.promotions;
  }

  async saveTemporaryProductosNew(value, newProducts) {
    this.nuewProducts = {
      rta: value,
      data: newProducts
    }
    // console.log("guardo nuevos", this.nuewProducts);
  }

  async getTemporaryProductosNew() {
    return this.nuewProducts;
  }

  async saveTemporaryProductsPopular(value, productsPopular) {
    this.productsPopular = {
      rta: value,
      data: productsPopular
    };
    // console.log("guardo Products Popular", this.productsPopular);
  }

  async getTemporaryProductsPopular() {
    return this.productsPopular;
  }

  async goHomeClean() {
    this.getConfiguracion().then(async (config) => {
      this.router.navigateByUrl(config[0].ruta_inicio_defecto);
    });
  }

  async goHome() {
    this.router.navigateByUrl('home/' + 1);
  }

  async goProductsCatalogue() {
    // this.router.navigateByUrl('products');
    let ruta = '';
    await this.getConfiguracion().then(async (config) => {
      if (config[0].ruta_inicio_defecto == 'home/1') {
        ruta = 'products';
      } else {
        ruta = 'home/1';
      }
    });
    this.router.navigateByUrl(ruta);
  }
  async goProducts() {
    // this.router.navigateByUrl('products');
    let ruta = '';
    await this.getConfiguracion().then(async (config) => {
      if (config[0].ruta_inicio_defecto != 'home/1') {
        ruta = 'products';
      } else {
        ruta = 'home/1';
      }
    });
    this.router.navigateByUrl(ruta);
  }
  async goProducts1() {

    // console.log("entra");
    
    // this.router.navigateByUrl('products');
    let ruta = '';
    await this.getConfiguracion().then(async (config) => {
      if (config[0].ruta_inicio_defecto == 'home/1') {
        ruta = 'products';
      } else {
        ruta = 'products';
      }
    });
    this.router.navigateByUrl(ruta);
  }
  

  async goShoppingCart() {
    this.router.navigateByUrl('carrito');
  }

  async goAdminProfile() {
    this.router.navigateByUrl('administrator');
  }

  async goUserProfile() {
    this.router.navigateByUrl('user');
  }

  async goAboutUs() {
    this.router.navigateByUrl('about-us');
  }

  async goPolitics() {
    this.router.navigateByUrl('politics');
  }

  async settingQuantityProduct(tipo, product) {
    let rta = true;
    let message = '';
    if (tipo == 'add') {
      if (product.quantity < product.stockactual) {
        product.quantity = product.quantity + 1;
        await this.validatePriceByVolume(product, tipo).then(async (resvolprod) => {
          product = resvolprod;
        });
      } else {
        rta = false;
        message = 'Stock agotado';
      }
    }

    if (tipo == 'quit') {
      if (product.quantity > 1) {
        product.quantity = product.quantity - 1;
        await this.validatePriceByVolume(product, tipo).then(async (resvolprod) => {
          product = resvolprod;
        });
      } else {
        rta = false;
        message = 'Cantidad no permitida';
      }
    }

    let data = {
      rta: rta,
      data: product,
      message: message
    }
    return data;
  }

  async addProductCart(product, client) {
    let cart;
    let message = {
      rta: true,
      mensaje: ''
    }
    let type = 'add';
    // Obtener productos del carrito
    let exist = false;
    await this.getproductsCart2({ id_cliente: client.PersonaComercio_cedulaRuc }).then(async (resprod: any) => {
      console.log("RESPUESTA getproductsCart",resprod );
      
      cart = resprod;
    });

    if (cart.rta == true) {
      for (let p of cart.data) {
        if (p.id_producto == product.id_producto) {
          exist = true;
          // let cantidad = p.cantidad + 1;
          let cantidad = p.cantidad + product.quantity;
          if (product.stockactual > cantidad) {
            product.quantity = cantidad;
            await this.validatePriceByVolume(product, type).then(async (resvolprod) => {
              product = resvolprod;
            });
            await this.createDataInsertProductCart(product, client, p).then(async (res) => {
              await this.updateProductsCart(p.id, res).then((resupd: any) => {
                if (resupd.rta == true) {
                  message = {
                    rta: true,
                    mensaje: product.pro_nom + ', ha sido agregado a su carrito de compras'
                  }
                } else {
                  message = {
                    rta: false,
                    mensaje: 'Ha ocurrido un error, intente nuevamente'
                  }
                }
              });
            });
          } else {
            message = {
              rta: false,
              mensaje: 'Stock no disponible, ' + product.pro_nom
            }
          }
        }
      }
      if (exist == false) {
        await this.validatePriceByVolume(product, type).then(async (resvolprod) => {
          product = resvolprod;
        });
        await this.createDataInsertProductCart(product, client, '').then(async (resinsert) => {
          await this.insertProductCart(resinsert).then((resinsert: any) => {
            if (resinsert.rta == true) {
              message = {
                rta: true,
                mensaje: product.pro_nom + ', ha sido agregado a su carrito de compras'
              }
            } else {
              message = {
                rta: false,
                mensaje: 'Ha ocurrido un error, intente nuevamente'
              }
            }
          });
        });
      }
    } else {
      await this.validatePriceByVolume(product, type).then(async (resvolprod) => {
        product = resvolprod;
      });
      await this.createDataInsertProductCart(product, client, '').then(async (resinsert) => {
        await this.insertProductCart(resinsert).then((resinsert: any) => {
          if (resinsert.rta == true) {
            message = {
              rta: true,
              mensaje: product.pro_nom + ', ha sido agregado a su carrito de compras'
            }
          } else {
            message = {
              rta: false,
              mensaje: 'Ha ocurrido un error, intente nuevamente'
            }
          }
        });
      });
    }
    // await this.updateObservableShoppingCart(client).then((res) => { });
    return message;
  }
  async addProductCartSecond(product, client, config, url) {
    let cart;
    let message = {
      rta: true,
      mensaje: ''
    }
    let type = 'add';
    // Obtener productos del carrito
    let exist = false;
    await this.getproductsCartSecond({ id_cliente: client.PersonaComercio_cedulaRuc }, config, url, product).then(async (resprod: any) => {
    // await this.getproductsCart({ id_cliente: client.PersonaComercio_cedulaRuc }).then(async (resprod: any) => {
      console.log("RESPUESTA getproductsCart",resprod );
      
      cart = resprod;
    });

    if (cart.rta == true) {
      for (let p of cart.data) {
        if (p.id_producto == product.id_producto) {
          exist = true;
          // let cantidad = p.cantidad + 1;
          let cantidad = p.cantidad + product.quantity;
          if (product.stockactual > cantidad) {
            product.quantity = cantidad;
            await this.validatePriceByVolume(product, type).then(async (resvolprod) => {
              product = resvolprod;
            });
            await this.createDataInsertProductCart(product, client, p).then(async (res) => {
              await this.updateProductsCart(p.id, res).then((resupd: any) => {
                if (resupd.rta == true) {
                  message = {
                    rta: true,
                    mensaje: product.pro_nom + ', ha sido agregado a su carrito de compras'
                  }
                  let array:any;
                  array.push(product)
                  // this.saveToLocalStorage('carShop',array)

                } else {
                  message = {
                    rta: false,
                    mensaje: 'Ha ocurrido un error, intente nuevamente'
                  }
                }
              });
            });
          } else {
            message = {
              rta: false,
              mensaje: 'Stock no disponible, ' + product.pro_nom
            }
          }
        }
      }
      if (exist == false) {
        await this.validatePriceByVolume(product, type).then(async (resvolprod) => {
          product = resvolprod;
        });
        await this.createDataInsertProductCart(product, client, '').then(async (resinsert) => {
          await this.insertProductCart(resinsert).then((resinsert: any) => {
            if (resinsert.rta == true) {
              message = {
                rta: true,
                mensaje: product.pro_nom + ', ha sido agregado a su carrito de compras'
              }
            } else {
              message = {
                rta: false,
                mensaje: 'Ha ocurrido un error, intente nuevamente'
              }
            }
          });
        });
      }
    } else {
      console.log('PRIMERA PRODUCT AGREGADO');
      
      await this.validatePriceByVolume(product, type).then(async (resvolprod) => {
        product = resvolprod;
      });
      await this.createDataInsertProductCart(product, client, '').then(async (resinsert) => {
        console.log('resinsert', resinsert );
        await this.insertProductCart(resinsert).then((resinsert2: any) => {
        // await this.postGeneral2(this.rutaUrl+'', resinsert).subscribe((resinsert2: any) => {
          console.log('resinsert 2 ====> ', resinsert2 );
          resinsert.id = resinsert2.id;
          let arrayData:any=[];
          arrayData.push(resinsert);
          if (resinsert2.rta == true) {
            message = {
              rta: true,
              mensaje: product.pro_nom + ', ha sido agregado a su carrito de compras'
            }          
            let arr:any=[];
            arr.id_carrito = resinsert2.id;
            arr.push(product)
            let data = {
              'data' : arrayData,
              'products' : arr,
              'rta':true
            }            
            // this.saveToLocalStorage('carShop',data)
          } else {
            message = {
              rta: false,
              mensaje: 'Ha ocurrido un error, intente nuevamente'
            }
          }
        });
      });
    }
    // await this.updateObservableShoppingCart(client).then((res) => { });
    return message;
  }

  async createDataInsertProductCart(product, client, cart) {
    let guarn_prev = '';
    if (cart) {
      guarn_prev = cart.otro;
    }

    let guarnicion = '';
    let detail = '';
    if (product.guarnicion == true) {
      if (product.guarnicion_add.length > 0) {
        for (let g of product.guarnicion_add) {
          guarnicion += g.guar_name + ', '
        }
        detail = guarnicion.substring(0, guarnicion.length - 2);
        if (cart) {
          guarn_prev = guarn_prev + '/';
        }
      }
    }

    let insert = {
      id_cliente: client.PersonaComercio_cedulaRuc,
      id_producto: product.id_producto,
      cantidad: product.quantity,
      precio: product.precioReal,
      tipo_precio: product.tipoPrecio,
      talla: product.talla,
      color: product.color,
      otro: guarn_prev + detail,
      id:''
    }

    return insert;
  }

  async validatePriceByVolume(product, type) {
    if (product.venta_volumen == true) {
      if (type == 'add') {
        for (let p of product.precios) {
          if (p.cantidad_volumen > 0) {
            if (product.quantity >= (p.cantidad_volumen)) {
              product.precioReal = p.valor_mas_iva;
              product.tipoPrecio = p.id_tipo
            }
          }
        }
      }

      if (type == 'quit') {
        let aux = false;
        for (let p of product.precios) {
          if (p.cantidad_volumen > 0) {
            if (aux == false && (product.quantity >= p.cantidad_volumen)) {
              // console.log(product.quantity + ' >= ' + p.cantidad_volumen + ' = ' + (product.quantity >= p.cantidad_volumen));
              product.precioReal = p.valor_mas_iva;
              product.tipoPrecio = p.id_tipo
              aux = true;
            } else {
              if (aux == false) {
                let tipoPrecio;
                await this.getConfiguracion().then(async (config) => {
                  await this.isAuthenticatedClient(config[0].loginStorage).then(async (login: any) => {
                    if (login.rta == true) {
                      if (login.data.rol == 'Client') {
                        await this.getUrlEmpresa().then(async (url) => {
                          await this.loginCliente(url, { usuario: login.data.PersonaComercio_cedulaRuc, clave: login.data.clave }, 'other').then(async (reslogin: any) => {
                            if (reslogin.default_price == login.data.default_price) {
                              tipoPrecio = reslogin.default_price;
                            } else {
                              tipoPrecio = reslogin.default_price;
                            }
                          });
                        });
                      } else {
                        tipoPrecio = config[0].tipoPrecio;
                      }
                    } else {
                      tipoPrecio = config[0].tipoPrecio;
                    }
                  });
                });
                for (let pric of product.precios) {
                  if (tipoPrecio == pric.id_tipo) {
                    product.precioReal = pric.valor_mas_iva;
                    product.tipoPrecio = pric.id_tipo
                  }
                }

              }
            }
          }
        }
      }
    }
    return product;
  }

  async updateObservableShoppingCart(user) {
    await this.getproductsCart({ id_cliente: user.PersonaComercio_cedulaRuc }).then(async (resprod: any) => {
      let observable = {
        number: resprod.data.length,
        total: await this.calculateTotalCartProducts(resprod.data)
      }
      this.shopcart$.next(observable);
    });
  }

  // Observable para mostrar los productos ya sean de busqueda, compartidos, promocion, catalogo, etc
  // observableProducts(): Observable<Products> {
  //   return this.products$.asObservable();
  // }

  async calculateTotalCartProducts(cart) {
    let total = 0;
    for (let p of cart) {
      total += (p.cantidad * p.precio);
    }
    return total;
  }
  async calculateTotalCartProducts2(cart) {
    let total = 0;
    for (let p of cart) {
      total += (p.quantity * p.precioReal);
    }
    return total;
  }

  observableProductsCart(): Observable<ShoppingCart> {
    return this.shopcart$.asObservable();
  }

  async refreshPage(configuracion) {
    // if (configuracion.mostrar_precio == 0) {
    //   window.location.reload();
    // }
    window.location.reload();

  }

  async validateCustomerData(client) {
    let answer = {
      rta: false,
      data: client
    }
    if (
      client.PersonaComercio_cedulaRuc &&
      client.nombres && client.apellidos &&
      client.email && client.celular &&
      client.provincia && client.direccion) {
      answer.rta = true;
    } else {
      answer.rta = false;
    }
    return answer;
  }

  // Nuevo proceso de compra
  async validateInformationClient(client) {
    let answer = {
      rta: false,
      data: client,
      empty: {
        nombres: true,
        apellidos: true,
        provincia: true,
        canton: true,
        direccion: true,
        referencia_domicilio: true,
        celular: true,
      }
    }
    if (
      client.nombres && client.apellidos &&
      client.celular && (client.provincia != 0 && client.provincia != null) &&
      (client.canton != 0 && client.canton != null) && client.direccion &&
      client.referencia_domicilio) {
      answer.rta = true;
    } else {
      if (!client.nombres) {
        answer.empty.nombres = false;
      }
      if (!client.apellidos) {
        answer.empty.apellidos = false;
      }
      if (client.provincia == 0 || client.provincia == null) {
        answer.empty.provincia = false;
        answer.empty.canton = false;
      }
      if (client.canton == 0 || client.canton == null) {
        answer.empty.canton = false;
      }
      if (!client.direccion) {
        answer.empty.direccion = false;
      }
      if (!client.referencia_domicilio) {
        answer.empty.referencia_domicilio = false;
      }
      if (!client.celular) {
        answer.empty.celular = false;
      }
      answer.rta = false;
    }
    return answer;
  }

  async visibilityPurchaseButtons(configuracion, cart) {
    let buttonVisibility = {
      tienda: true,
      domicilio: false,
      tranferencia: false,
      payphone: false,
      datafast: false,
      placetopay: false,
      paypal: false,
      whatsapp: false,
      pagoQR:false
    }

    // NUEVO
    if (configuracion.valor_minimo_compra > 0) {
      buttonVisibility.domicilio = true;
    }

    if (configuracion.visibilidadBtnWhatsapp == 1) {
      buttonVisibility.whatsapp = true;
    }

    await this.getInformacion().then((resinfo) => {
      if (resinfo[0]?.numeroCuenta) {
        buttonVisibility.tranferencia = true;
      }
    });
    await this.getInformacion().then((resinfo) => {
      if (resinfo[0]?.imgQrP || resinfo[0]?.imgQrS || resinfo[0]?.imgQrT ) {
        buttonVisibility.pagoQR = true;
      }
    });

    await this.getPaymentButtons().then((resbtn: any) => {
      if (resbtn) {
        for (let b of resbtn) {
          if (b.nombre == "PayPhone") {
            buttonVisibility.payphone = true;
          }
          if (b.nombre == "DataFast") {
            buttonVisibility.datafast = true;
          }
          if (b.nombre == "PlacetoPay") {
            buttonVisibility.placetopay = true;
          }
          if (b.nombre == "PayPal") {
            buttonVisibility.paypal = true;
          }
        }
      } else {
        buttonVisibility.payphone = false;
        buttonVisibility.datafast = false;
        buttonVisibility.placetopay = false;
        buttonVisibility.paypal = false;
      }
    });

    return buttonVisibility;
  }

  // Obtener descuentos, recargos y costos de envios QUITARRRR xxxxx
  async generateOrderData(type, configuracion, cartBD) {

    let data = {
      costoEnvio: {
        rta: false,
        data: {}
      },
      formCostoEnvio: false,
      recargo: {
        rta: false,
        data: {}
      },
      descuento: {
        rta: false,
        data: {}
      },
    };

    if (configuracion.porcentajeDescuento > 0) {
      data.descuento = {
        rta: true,
        data: {
          porcent: configuracion.porcentajeDescuento,
          message: 'Descuento por promoción'
        }
      }
    }

    if (type == 1 || type == 3) {
      if (configuracion.aplicarCostoEnvioBtn1 == 1) {
        await this.getShipingCost(configuracion.costoEnvio, configuracion.costoEnvio2).then((rescost: any) => {
          data.costoEnvio.rta = rescost.rta;
          data.costoEnvio.data = rescost.data;
          data.formCostoEnvio = rescost.form;
        });
      }
    }

    if (type == 5 || type == 6 || type == 7 || type == 8) {
      if (configuracion.porcentajeCompraTarjeta > 0) {
        data.recargo = {
          rta: true,
          data: {
            porcent: configuracion.porcentajeCompraTarjeta,
            message: configuracion.txtRecargoTarjetaC
          }
        }
      }
    }

    if (configuracion.costoEnvio) {
      if (type == 2 || type == 4 || type == 5 || type == 6 || type == 7 || type == 8) {
        await this.getShipingCost(configuracion.costoEnvio, configuracion.costoEnvio2).then((rescost: any) => {
          data.costoEnvio.rta = rescost.rta;
          data.costoEnvio.data = rescost.data;
          data.formCostoEnvio = rescost.form;
        });
      }
    }

    return data;

  }

  // Obtener costo de envio  QUITARRRRR xxxxx
  async getShipingCost(value1, value2) {
    let data: any;
    if (value1 > 0 && value2 > 0) {
      data = {
        rta: true,
        data: {
          local: {
            value: parseFloat((value1)),
            selected: true
          },
          fuera: {
            value: parseFloat((value2)),
            selected: false
          }
        },
        form: true
      }
    } else {
      if (value1 > 0) {
        data = {
          rta: true,
          data: {
            local: {
              value: parseFloat((value1)),
              selected: true
            },
            fuera: {}
          },
          form: false
        }
      } else {
        data = {
          rta: false,
          data: {
            local: {},
            fuera: {}
          },
          form: false
        }
      }
    }
    return data;
  }








  // ******** Nuevo metodo de compra ********

  // Obtener las provicias
  async getProvincesEcuador(url_billing) {
    let url = url_billing + 'get_province';
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        for (let p of data.data) {
          p.selected = false;
        }
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  // Obtener los cantones
  async getCantonesProvince(url_billing, data) {
    let url = url_billing + "get_atributo_tabla?tabla=" + data.tabla + "&atributo=" + data.atributo + "&valor_atributo=" + data.valor_atributo + "&filas=" + data.filas;
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });
  }

  // Agregarla provincia y canton
  async stablishProvinceAndCantonClient(client, data, type) {
    let resp = {
      id: 0,
      data: []
    }
    if (type == 'province') {
      for (let p of data) {
        if (p.idProvincia == client.provincia) {
          p.selected = true;
          resp.id = p.idProvincia;
        } else {
          p.selected = false
        }
      }
    }
    if (type == 'canton') {
      for (let c of data) {
        if (c.idCanton == client.canton) {
          c.selected = true;
          resp.id = c.idCanton;
        } else {
          c.selected = false
        }
      }
    }
    resp.data = data;
    return resp;
  }

  // Obtener valores de recargos y descuentos
  async determinateArancelsAndDiscounts(type, configuracion, deliveryData) {
    let costoEnvio = {
      rta: false,
      data: {}
    }
    let recargo = {
      rta: false,
      data: {}
    }
    let descuento = {
      rta: false,
      data: {}
    }
    // Recoger en el local o Envio nacional
    if (type == 1) {
      if (configuracion.aplicarCostoEnvioBtn1 == 1) {
        costoEnvio = {
          rta: true,
          data: {
            local: {
              value: parseFloat(configuracion.costoEnvio),
              selected: true
            },
            nacional: {
              value: 0,
              selected: false
            }
          }
        }
      }
    } else {
      // Costo de envio nacional
      let canton_name;
      for (let p of deliveryData.province) {
        if (deliveryData.infoSend.provincia == p.idProvincia) {
          for (let c of deliveryData.canton) {
            if (deliveryData.infoSend.canton == c.idCanton) {
              canton_name = c.descripCtn;
            }
          }
          costoEnvio = {
            rta: true,
            data: {
              local: {
                value: parseFloat(configuracion.costoEnvio),
                selected: false
              },
              nacional: {
                value: parseFloat(p.precio_envio),
                selected: true,
                provincia: p.descripProv,
                canton: canton_name
              }
            }
          }
        }
      }
      //Porcentaje de recargo tarjeta de credito
      if (type == 5 || type == 6 || type == 7 || type == 8) {
        if (configuracion.porcentajeCompraTarjeta > 0) {
          recargo = {
            rta: true,
            data: {
              porcent: configuracion.porcentajeCompraTarjeta,
              message: configuracion.txtRecargoTarjetaC
            }
          }
        }
      }
    }
    // Descuentos
    if (configuracion.porcentajeDescuento > 0) {
      descuento = {
        rta: true,
        data: {
          porcent: parseFloat(configuracion.porcentajeDescuento),
          message: 'Descuento por promoción'
        }
      }
    }
    return { costoEnvio, recargo, descuento, formCostoEnvio: costoEnvio.rta };
  }

  // Calcular descuento y recargo del subtotal CON/SIN iva
  // Funciona para la forma anterior y actual
  async calculateSeparateSubtotal(aditionalValues, shoppingCart) {
    let data = {
      conIva: {
        subtotalBruto: 0,
        descuento: 0,
        descuentoPorcent: 0,
        recargo: 0,
        recargoPorcent: 0,
        iva: 0,
        ivaval: 0,
        subtotalNeto: 0
      },
      sinIva: {
        subtotalBruto: 0,
        descuento: 0,
        descuentoPorcent: 0,
        recargo: 0,
        recargoPorcent: 0,
        iva: 0,
        ivaval: 0,
        subtotalNeto: 0
      },
      subtotal: 0,
      subtotal0: 0,
      subtotal12: 0,
      subtotalBruto: 0,
      subtotalNeto: 0,
      recargo: 0,
      descuento: 0,
      iva: 0,
      ivaPorcent: 0,
      total: 0,
    }
    for (let p of shoppingCart) {
      let discount = 0;
      let surcharge = 0;
      let ivaPorcet;
      if (aditionalValues.descuento.rta == true) {
        discount = (p.precio_sin_iva * aditionalValues.descuento.data.porcent) / 100;
        data.conIva.descuentoPorcent = aditionalValues.descuento.data.porcent;
        data.sinIva.descuentoPorcent = aditionalValues.descuento.data.porcent;
      }
      let price = (p.precio_sin_iva - discount);
      if (aditionalValues.recargo.rta == true) {
        surcharge = (price * aditionalValues.recargo.data.porcent) / 100;
        data.conIva.recargoPorcent = aditionalValues.recargo.data.porcent;
        data.sinIva.recargoPorcent = aditionalValues.recargo.data.porcent;
      }
      p.precioNeto = (p.precio_sin_iva + surcharge) - discount;
      if (p.impuesto_porcent > 0) {
        ivaPorcet = p.impuesto_porcent;
        data.conIva.ivaval = p.impuesto_porcent;
        let auxBruto = p.precioReal * p.quantity;
        // aqui se multiplica el valor por cantidad para hacer los calculos
        let auxNeto = (p.precio_sin_iva * p.quantity);
        data.conIva.subtotalBruto = data.conIva.subtotalBruto + auxBruto;
        data.conIva.subtotalNeto = data.conIva.subtotalNeto + (p.precioNeto * p.quantity);
        data.conIva.descuento = data.conIva.descuento + (discount * p.quantity);
        data.conIva.recargo = data.conIva.recargo + (surcharge * p.quantity);
        data.conIva.iva = (data.conIva.subtotalNeto * p.impuesto_porcent / 100);
        data.subtotal12 = data.subtotal12 + (p.precio_sin_iva * p.quantity);
      } else {
        data.sinIva.ivaval = p.impuesto_porcent;
        let auxBruto = p.precioReal * p.quantity;
        let auxNeto = p.precio_sin_iva * p.quantity;
        data.sinIva.subtotalBruto = data.sinIva.subtotalBruto + auxBruto;
        data.sinIva.subtotalNeto = data.sinIva.subtotalNeto + (p.precioNeto * p.quantity);
        data.sinIva.descuento = data.sinIva.descuento + (discount * p.quantity);
        data.sinIva.recargo = data.sinIva.recargo + (surcharge * p.quantity);
        data.sinIva.iva = (data.sinIva.subtotalNeto * p.impuesto_porcent / 100);
        data.subtotal0 = data.subtotal0 + (p.precio_sin_iva * p.quantity);
      }
      data.subtotal = data.subtotal12 + data.subtotal0;
      data.subtotalBruto = data.sinIva.subtotalBruto + data.conIva.subtotalBruto;
      data.subtotalNeto = data.sinIva.subtotalNeto + data.conIva.subtotalNeto;
      data.descuento = data.sinIva.descuento + data.conIva.descuento;
      data.recargo = data.sinIva.recargo + data.conIva.recargo;
      data.iva = data.sinIva.iva + data.conIva.iva;
      data.ivaPorcent = ivaPorcet;
      data.total = (data.subtotal - data.descuento) + data.iva + data.recargo;
    }
    return data;
  }

  async calculateShippingCostTotal(values) {
    let query = {
      total: 0,
      value: 0
    };
    if (values.costoEnvio.data.local.selected == true) {
      query = {
        total: values.calculos.total + values.costoEnvio.data.local.value,
        value: values.costoEnvio.data.local.value
      };
      // total = values.calculos.total + values.costoEnvio.data.local.value;
    }
    if (values.costoEnvio.data.nacional.selected == true) {
      query = {
        total: values.calculos.total + values.costoEnvio.data.nacional.value,
        value: values.costoEnvio.data.local.value
      };
      // total = values.calculos.total + values.costoEnvio.data.fuera.value;
    }
    return query;
  }

  // Guardar los datos del nuevo proceso de compra
  async saveDeliveryDataLocalStorage(deliveryData, localStorage) {
    let storageDelivery = localStorage + 'Delivery';
    return new Promise(async (resolve) => {
      await this.localStorage.set(storageDelivery, deliveryData).subscribe(async (res) => {
        let data = {
          rta: res,
          data: deliveryData,
        }
        resolve(data);
      }, error => {
        let data = {
          rta: false,
          data: error,
        }
        resolve(data);
      });
    });
  }

  // Obtener los datos del nuevo proceso de compra
  async getDeliveryData(localStorage) {
    let storageDelivery = localStorage + 'Delivery';
    return new Promise((resolve) => {
      this.localStorage.get(storageDelivery).subscribe((res: any) => {
        let data;
        if (res) {
          data = {
            rta: true,
            data: res
          }
        } else {
          data = {
            rta: false,
            data: res
          }
        }
        resolve(data);
      });
    });
  }

  // Eliminar los datos del nuevo proceso de compra
  async deleteDeliveryData(localStorage) {
    let storageDelivery = localStorage + 'Delivery';
    return new Promise(async (resolve) => {
      this.localStorage.delete(storageDelivery).subscribe((remov) => {
        let data = {
          rta: true,
          data: remov
        }

        this.userLogin = {
          name: '',
          imagen: '',
          login: false,
          rol: '',
          user:''
        }
        this.usr$.next(this.userLogin);

        resolve(data);
      });
    });
  }


  // ******** Fin metodo de compra ********

  async generateDataCotization(shoppingCart, client, aditionalValues, configuracion, type) {
    let ivaporcent;
    let observaciones = configuracion.txtBtnEnviarPedido1;
    let tipo_pago = '01';
    if (aditionalValues.calculos.conIva.iva) {
      ivaporcent = aditionalValues.calculos.conIva.ivaval;
    } else {
      ivaporcent = aditionalValues.calculos.sinIva.ivaval;
    }
    // Establecer el tipo de entrega en el campo observaciones
    if (aditionalValues.costoEnvio.rta == true) {
      let cost_send;
      await this.getTotalAndShoppingCost(aditionalValues).then((restot: any) => {
        cost_send = restot.costoEnvio;
      });
      observaciones = 'Envío a domicilio | Nombres: ' + client.EnvioDomicilio.nombres + ' ' + client.EnvioDomicilio.apellidos
        + ' | Provincia : ' + aditionalValues.costoEnvio.data.nacional.provincia
        + ' | Canton: ' + aditionalValues.costoEnvio.data.nacional.canton
        + ' | Direccion: ' + client.EnvioDomicilio.direccion
        + ' | Referencia : ' + client.EnvioDomicilio.referencia_domicilio
        + ' | Celular: ' + client.EnvioDomicilio.celular
        + ' | Costo Envío: ' + cost_send;
    }

    // Etsablecer tipo de pago
    switch (type) {
      case 1:
        tipo_pago = '01';
        break;
      case 2:
        tipo_pago = '01';
        break;
      case 3:
        tipo_pago = '01';
        break;
      case 4:
        tipo_pago = '06';
        break;
      case 5:
        tipo_pago = '03';
        break;
      case 6:
        tipo_pago = '03';
        break;
      case 8:
        tipo_pago = '03';
        break;
    }

    let data = {
      cotizacion: {
        descuentoporcent: 0,
        creditoval: 0,
        recargovalor: 0,
        recargoporcent: 0,
        subtotalBruto: aditionalValues.calculos.subtotal,
        descuentovalor: 0,
        impuestoImportacion: 0,
        transporteporcent: 0,
        transporteval: 0,
        ivaporcent: ivaporcent,
        subtotalNeto: aditionalValues.calculos.subtotalNeto,
        ivaval: aditionalValues.calculos.iva,
        totalCompra: aditionalValues.calculos.total,
        observaciones: observaciones,
        sustento_cod: 0,
        valorrecibidoefectivo: 0,
        valorcambio: 0,
        tarifacerobruto: aditionalValues.calculos.subtotal0,
        tarifaceroneto: aditionalValues.calculos.sinIva.subtotalNeto,
        tarifadocebruto: aditionalValues.calculos.subtotal12,
        tarifadoceneto: aditionalValues.calculos.conIva.subtotalNeto,
        subtbrutobienes: aditionalValues.calculos.subtotal,
        subtnetobienes: aditionalValues.calculos.subtotalNeto,
        subtbrutoservicios: 0,
        subtnetoservicios: 0,
        iceval: 0,
        efectivoval: 0,
        impverdeval: 0,
        baseiva: aditionalValues.calculos.conIva.subtotalNeto,
        tarjcreditoval: 0,
        chequeval: 0,
        diferidoval: 0,
        anticipoval: 0,
        tipoprecio: client.default_price,
        estado_observ: null,
        estado_user: null,
        estado_fecha: null,
        pagada: 0,
        pagada_detalle: null,
        ndc_tipo_pago: null,
        tipo_pago: tipo_pago,
        total_material: null,
        id_direc_pedido: null,
        tipo_pago_app: ""
      },
      detalle: {},
      cliente: client.PersonaComercio_cedulaRuc,
      user_id: ""
    }

    await this.generateDetailDataCotization(shoppingCart, configuracion).then((resdetail) => {
      data.detalle = resdetail;
    });


    return data;
  }

  async generateDetailDataCotization(product, configuracion) {
    let detail = [];
    for (let p of product) {
      let iva = p.impuesto_porcent;
      let ivaval = (p.precioNeto * iva) / 100;
      let data = {
        "Producto_codigo": p.id_producto,
        "itemcantidad": p.quantity,
        "itempreciobruto": p.precioNeto,
        "itemprecioneto": p.precioNeto,
        "itemprecioxcantidadbruto": p.precioNeto * p.quantity,
        "descuentofactporcent": 0,
        "descuentofactvalor": 0,
        "recargofactporcent": 0,
        "recargofactvalor": 0,
        "itemprecioxcantidadneto": p.precioNeto * p.quantity,
        "ivaporcent": iva,
        "ivavalitemprecioneto": ivaval,
        "itemprecioiva": ((p.precioNeto + ivaval) * p.quantity),
        "ivavalprecioxcantidadneto": ivaval * p.quantity,
        "itemxcantidadprecioiva": ((p.precioNeto + ivaval) * p.quantity),
        "estaAnulada": 0,
        "bodega_id": configuracion.id_bodega,
        "tiposprecio_tipoprecio": p.tipoPrecio,
        "itembaseiva": p.precioNeto,
        "totitembaseiva": p.precioNeto * p.quantity,
        "iceporcent": 0,
        "iceval": 0,
        "priceice": p.precioNeto,
        "totalpriceice": p.precioNeto * p.quantity,
        "totivaval": ivaval * p.quantity,
        "priceiva": p.precioNeto + ivaval,
        "totalpriceiva": ((p.precioNeto + ivaval) * p.quantity),
        "detalle": "",
        "detalle_web": p.guarnicion_descripcion,
        "meses_garantia": null,
        "largo_p": null,
        "ancho_p": null
      }
      detail.push(data);
    }
    return detail;
  }

  async calculateTotalAndShippingCost(values) {
    let query = {
      total: 0,
      value: 0
    };
    if (values.costoEnvio.data.local.selected == true) {
      query = {
        total: values.calculos.total + values.costoEnvio.data.local.value,
        value: values.costoEnvio.data.local.value
      };
      // total = values.calculos.total + values.costoEnvio.data.local.value;
    }
    if (values.costoEnvio.data.nacional.selected == true) {
      query = {
        total: values.calculos.total + values.costoEnvio.data.nacional.value,
        value: values.costoEnvio.data.nacional.value
      };
      // total = values.calculos.total + values.costoEnvio.data.fuera.value;
    }
    return query;
  }

  // Redonder valores decimales
  roundValue(value) {
    let round = Math.round((value + Number.EPSILON) * 100) / 100;
    return round
  }

  roudDecimals(value, num) {
    let val = value.toFixed(num);
    return val;
  }

  async getCurrentDate() {
    var month_name = new Array("Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre");
    var month_number_str = new Array('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12');
    var month_number = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
    var days = new Array("Domingo", 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado');
    const date = new Date();

    let currentDate = {
      year: date.getFullYear(),
      month_name: month_name[date.getMonth()],
      month_number: month_number_str[date.getMonth()],
      day_number: date.getDate(),
      day_name: days[new Date(date.getFullYear() + '-' + month_number[date.getMonth()] + '-' + date.getDate()).getDay()],
      number_day: new Date(date.getFullYear(), month_number[date.getMonth()], 0).getDate(),
      hour: date.getHours(),
      minute: this.formatHour(date.getMinutes()),
      second: this.formatHour(date.getSeconds()),
    }

    return currentDate;
  }

  formatHour(value) {
    if (value < 10) {
      value = 0 + '' + value;
    }
    return value;
  }

  async createMailBody(type, client, values, configuracion, shoppingCart, id_cotizacion) {
    let empresa;
    let date;
    await this.getInformacion().then((resinfo) => {
      empresa = resinfo[0];
    });
    await this.getCurrentDate().then((resdate) => {
      date = resdate;
    });

    let html = '<table style="font-family:arial; border:1px solid #e8e6e6; border-top:none; border-bottom:none; border-spacing:0; max-width:600px; color:#707173; border-radius:40px;" align="center">';

    // Imagen de la cabecera
    html += '<thead>';
    html += '<tr>';
    html += '<td style="padding:0">';
    html += '<img style="width:100%; border-radius:20px 20px 0 0" src="https://drive.google.com/uc?export=view&id=1PA4wN0Sxs7vJlmn5zpVwdDlQm-XCwCsz">';
    html += '</td>';
    html += '</tr>';
    html += '</thead>';

    html += '<tbody>';

    // Texto del encabezado
    html += '<tr>';
    html += '<td style="font-size:20px; text-align:center; padding:10px 0 8px 0; display:block">';
    html += '<span>Hola, </span>';
    html += '<strong style="color: #868686;"><span>' + client.nombres + '' + client.apellidos + '</span></strong>';
    html += '</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td style="font-size:23px; text-align:center; padding:10px 15px 25px 15px;display:block">';
    html += '<span>Tu compra en la Tienda en línea </span>';
    html += '<strong style="color: #868686;"><span> ' + empresa.nombre + ' </span></strong>';
    html += '<span> ha sido </span>';
    html += '<span style="color:#7dd855; text-transform:uppercase; font-size:25px; margin-top:3px"> Exitosa</span>';
    html += '</td>';
    html += '</tr>';

    // Encabezado datos de factura
    html += '<tr>';
    html += '<td';
    html += '<div width="100%">';
    html += '<table style="font-family:arial; border:1px solid #e8e6e6; color:#707173; padding: 5px;" align="center" width="95%">';

    html += '<tr>';
    html += '<td><strong style="color: #868686;">Cliente: </strong><span>' + client.nombres + ' ' + client.apellidos + '</span></td>';
    html += '<td><strong style="color: #868686;">Fecha: </strong><span>' + date.year + '/' + date.month_number + '/' + date.day_number + '</span></td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td><strong style="color: #868686;">Cédula/Ruc: </strong><span>' + client.PersonaComercio_cedulaRuc + '</span></td>';
    html += '<td><strong style="color: #868686;">Teléfono: </strong><span>' + client.celular + '</span></td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td><strong style="color: #868686;">Dirección: </strong><span>' + client.direccion + '</span></td>';
    html += '</tr>';

    html += '</table>';
    html += '</div>';
    html += '</td>';
    html += '</tr>';

    // Texto Detalle del pedido
    html += '<tr>';
    html += '<td style="font-size: 17px; color:#707173; text-align: center; padding: 10px 0;">';
    html += '<span><strong style="color: #868686;">Detalle del Pedido</strong></span>';
    html += '</td>';
    html += '</tr>';

    // Detalle productos del pedido
    html += '<tr>';
    html += '<td>';
    html += '<div width="100%">';
    html += '<table style="font-family:arial; border:1px solid #e8e6e6; border-collapse:collapse; color:#707173; margin-bottom: 10px;" align="center" width="95%">'

    html += '<tr>';
    html += '<td style="border:1px solid #e8e6e6;">Cant.</td>';
    html += '<td style="border:1px solid #e8e6e6;">Cod.</td>';
    html += '<td style="border:1px solid #e8e6e6;">Detalle</td>';
    html += '<td style="border:1px solid #e8e6e6;">P.Unitario</td>';
    html += '<td style="border:1px solid #e8e6e6;">P.Total</td>';
    html += '</tr>';

    shoppingCart.forEach(det => {
      html += '<tr>';
      html += '<td> ' + det.quantity + ' </td>';
      html += '<td> ' + det.id_producto + ' </td>';
      if (det.guarnicion_descripcion) {
        html += '<td> ' + det.pro_nom + '<br> Guarniciones: ' + det.guarnicion_descripcion + ' </td>';
      } else {
        html += '<td> ' + det.pro_nom + '</td>';
      }
      html += '<td> ' + this.roundValue(det.precioNeto) + ' </td>';
      html += '<td> ' + this.roundValue((det.precioNeto * det.quantity)) + ' </td>';
      html += '</tr>';
    });

    html += '</table>';
    html += '</div>'
    html += '</td>';
    html += '</tr>';

    // Subtotales y descuentos
    html += '<tr>';
    html += '<td>';
    html += '<div width="100%">';
    html += '<table style="font-family:arial; font-size: 14px; color:#707173; margin-bottom: 10px;" align="center" width="95%">';

    html += '<tr>';
    html += '<td><strong style="color: #868686;">Subtotal: </strong><span></td>';
    html += '<td><span> ' + this.roundValue(values.calculos.subtotalNeto) + '</span></td>';
    html += '</tr>';

    if (values.descuento.rta == true) {
      html += '<tr>';
      html += '<td><strong style="color: #868686;">Descuento (' + values.descuento.data.porcent + ') : </strong><span></td>';
      html += '<td><span> ' + values.calculos.descuento + '</span></td>';
      html += '</tr>';
    }

    if (values.recargo.rta == true) {
      html += '<tr>';
      html += '<td><strong style="color: #868686;">Recargo (' + values.recargo.data.message + ') : </strong><span></td>';
      html += '<td><span> ' + values.calculos.descuento + '</span></td>';
      html += '</tr>';
    }

    html += '<tr>';
    html += '<td><strong style="color: #868686;">Iva : </strong><span></td>';
    html += '<td><span> ' + this.roundValue(values.calculos.iva) + '</span></td>';
    html += '</tr>';

    // Costo de envio + total a pagar
    if (values.costoEnvio.rta == true) {
      if (values.costoEnvio.data.local.selected == true) {
        html += '<tr>';
        html += '<td><strong>Costo de envío ( Dentro Ciudad ) : </strong><span></td>';
        html += '<td><span> ' + values.costoEnvio.data.local.value + '</span></td>';
        html += '</tr>';
      }
      if (values.costoEnvio.data.nacional.selected == true) {
        html += '<tr>';
        html += '<td><strong>Costo de envío estimado ( ' + values.costoEnvio.data.nacional.provincia + ', ' + values.costoEnvio.data.nacional.canton + ' ) : </strong><span></td>';
        html += '<td><span> ' + values.costoEnvio.data.nacional.value + '</span></td>';
        html += '</tr>';
      }
      html += '<tr style="background-color: #d31f38; color: #ffffff;">';
      html += '<td><strong>Total a pagar : </strong><span></td>';
      html += '<td><span> ' + this.roundValue(values.subtotalAux) + '</span></td>';
      html += '</tr>';
    }

    // Total a pagar
    if (values.costoEnvio.rta == false) {
      html += '<tr style="background-color: #d31f38; color: #ffffff;">';
      html += '<td><strong>Total a pagar : </strong><span></td>';
      html += '<td><span> ' + this.roundValue(values.calculos.total) + '</span></td>';
      html += '</tr>';
    }

    html += '</table>';
    html += '</div>'
    html += '</td>';
    html += '</tr>';

    // Nota y referencia de Compra
    html += '<tr>';
    html += '<td>';
    html += '<div width="100%">';
    html += '<table style="font-family:arial; font-size: 14px; color:#707173; text-align: center;" align="center" width="95%">';

    html += '<tr>';
    html += '<td style="font-size: 18px; padding-bottom: 10px;">';
    html += '<strong><span>La referencia de su compra es: ' + id_cotizacion + ' </span></strong>';
    html += '</td>';
    html += '</tr>';

    if (type == 1) {
      html += '<tr>';
      html += '<td>';
      html += '<strong>Nota: <span>' + configuracion.txtBtnEnviarPedido1 + ' </span></strong>';
      html += '</td>';
      html += '</tr>';
    }

    if (type == 2) {
      html += '<tr>';
      html += '<td>';
      html += '<strong>Nota: <span> El cliente realizará el pago al momento de su entrega. </span></strong>';
      html += '</td>';
      html += '</tr>';
    }

    if (type == 3) {
      html += '<tr>';
      html += '<td>';
      html += '<strong>Nota: <span> El pedido ha sido enviado por medio de WhatsApp. </span></strong>';
      html += '</td>';
      html += '</tr>';
    }

    if (type == 4) {
      html += '<tr>';
      html += '<td>';
      html += '<strong>Nota: <span> El cliente ha seleccionado hacer el pago por medio de depósito o transferencia bancaría. </span></strong>';
      html += '</td>';
      html += '</tr>';
    }

    if (type == 5) {
      html += '<tr>';
      html += '<td>';
      html += '<strong>Nota: <span> La compra ha sido realizada por medio de Payphone. </span></strong>';
      html += '</td>';
      html += '</tr>';
    }

    if (type == 6) {
      html += '<tr>';
      html += '<td>';
      html += '<strong>Nota: <span> La compra ha sido realizada por medio de DataFast. </span></strong>';
      html += '</td>';
      html += '</tr>';
    }

    if (type == 7) {
      html += '<tr>';
      html += '<td>';
      html += '<strong>Nota: <span> La compra ha sido realizada por medio de PlacetoPay. </span></strong>';
      html += '</td>';
      html += '</tr>';
    }

    if (type == 8) {
      html += '<tr>';
      html += '<td>';
      html += '<strong>Nota: <span> La compra ha sido realizada por medio de PayPal. </span></strong>';
      html += '</td>';
      html += '</tr>';
    }

    html += '</table>';
    html += '</div>'
    html += '</td>';
    html += '</tr>';

    if (type == 4) {

      html += '<tr>';
      html += '<td>';
      html += '<div width="100%">';

      html += '<table style="font-family:arial; border:1px solid #e8e6e6; border-radius: 25px; font-size: 14px; color:#0a3e88; background-color: #ffdd21; margin-top: 10px; margin-bottom: 10px; padding: 5px;" align="center" width="95%">';

      html += '<tr>';
      html += '<th colspan="2" style="padding-top: 5px;">' + client.bankAccountData.data.banco + '</th>';
      html += '</tr>';

      html += '<tr>';
      html += '<th colspan="2" style="padding-top: 5px;">' + client.bankAccountData.data.nombre + '</th>';
      html += '</tr>';

      html += '<tr>';
      html += '<th colspan="2" style="padding-top: 5px;">' + client.bankAccountData.data.numero + '</th>';
      html += '</tr>';

      html += '</table>';
      html += '</div>';
      html += '</td>';
      html += '</tr>';

    }

    // Datos de envio a domicilio
    if (values.costoEnvio.rta == true) {

      html += '<tr>';
      html += '<td>';
      html += '<div width="100%">';

      html += '<table style="font-family:arial; border:1px solid #e8e6e6; border-radius: 25px; font-size: 14px; color:#707173;  margin-top: 10px; margin-bottom: 15px; padding: 5px;" align="center" width="95%">';

      html += '<tr>';
      html += '<th colspan="2" style="font-size: 16px; background-color: #7dd855; color: #ffffff; border-radius: 25px; padding-top: 10px; padding-bottom: 10px;">Datos de envío a domicilio</th>';
      html += '</tr>';

      html += '<tr>';
      html += '<td><strong style="color: #868686;">Nombres: </strong><span>' + client.EnvioDomicilio.nombres + ' ' + client.EnvioDomicilio.apellidos + '</span></td>';
      html += '<td><strong style="color: #868686;">Teléfono: </strong><span>' + client.EnvioDomicilio.celular + '</span></td>';
      html += '</tr>';

      html += '<tr>';
      html += '<td><strong style="color: #868686;">Provincia: </strong><span>' + values.costoEnvio.data.nacional.provincia + '</span></td>';
      html += '<td><strong style="color: #868686;">Cantón: </strong><span>' + values.costoEnvio.data.nacional.canton + '</span></td>';
      html += '</tr>';

      html += '<tr>';
      html += '<td><strong style="color: #868686;">Dirección: </strong><span>' + client.EnvioDomicilio.direccion + '</span></td>';
      html += '<td><strong style="color: #868686;">Referencia: </strong><span>' + client.EnvioDomicilio.referencia_domicilio + '</span></td>';
      html += '</tr>';

      html += '</table>';
      html += '</div>';
      html += '</td>';
      html += '</tr>';

    }

    // Sugerencia y Contactos
    html += '<tr>';
    html += '<td>';
    html += '<div width="100%">';
    html += '<table style="font-family:arial; border:1px solid #e8e6e6; border-radius: 25px; font-size: 14px; color:#707173; text-align: center; margin-top: 10px; margin-bottom: 15px; padding: 5px;" align="center" width="95%">';

    html += '<tr>';
    html += '<td>';
    html += '<span> Si tienes alguna pregunta sobre tu compra, te recomendamos contactarte con un asesor del comercio. </span>';
    html += '</td>';
    html += '</tr>';

    html += '<tr>';
    html += '<td>';
    html += '<span>';
    html += '<strong>E-mail: </strong>';
    html += '<a href="mailto:' + empresa.email + '" target="_blank">' + empresa.email + '</a>';
    html += '</span>';
    html += '</td>';
    html += '</tr>';

    html += '</table>';
    html += '</div>';
    html += '</td>';
    html += '</tr>';


    html += '</tbody>';

    html += '</table>';

    let dataEmail = {
      sender_mail: configuracion.correo_api,
      sender_password: configuracion.password_correo_api,
      entity_mail: empresa.email,
      receiver: client.email,
      subject: 'Notificación de compra',
      text: '',
      body: html
    }
    return dataEmail;
  }

  async getIpAddress() {
    let url = 'https://geolocation-db.com/json/';
    return new Promise((resolve) => {
      this.http.get(url).subscribe((data: any) => {
        data.geobytesipaddress = data.IPv4;
        resolve(data);
      },
        error => {
          resolve(error)
        });
    });

  }

  // Obtener el total, tomando en cuento si hay o no Costo de envio
  async getTotalAndShoppingCost(values) {
    let data = {
      total: 0,
      costoEnvio: 0,
    }
    if (values.costoEnvio.rta == true) {
      if (values.costoEnvio.data.local.selected == true) {
        data.costoEnvio = values.costoEnvio.data.local.value;
      }
      if (values.costoEnvio.data.nacional.selected == true) {
        data.costoEnvio = values.costoEnvio.data.nacional.value;
      }
      data.total = values.subtotalAux;
    } else {
      data.total = values.calculos.total;
    }
    return data;
  }

  async goUpPage() {
    if (screen.width >= 768 && screen.height >= 481) {
      let scrollToTop = window.setInterval(() => {
        let pos = window.pageYOffset;
        if (pos > 0) {
          window.scrollTo(0, pos - 20);
        } else {
          window.clearInterval(scrollToTop);
        }
      }, 5);
    }
  }

  // Observable para mostrar el detale de los productos
  async addObservableProductForDetail(product) {
    // this.detailProduct$.next(product);
    this.detailProduct = product;
  }

  async getObservableProductForDetail() {
    return this.detailProduct;
  }

  async addObservableFilterProducts(data) {
    this.filterProdcuts$.next(data);
  }

  observableFilterProducts(): Observable<string> {
    return this.filterProdcuts$.asObservable();
  }

  viewMenuResponsive() {
    let url = this.router.url;
    let rta;

    if (url == '/' || url == '/home' || url == '/products' || url == '/carrito') {
      rta = true;
    } else {
      rta = false;
    }

    return rta;
  }

  // async clasifyProductsGroupSubgroup(type, catalogue, groups) {
  //   let products_final = [];
  //   if (type == 'subgroup') {
  //     let aux_prod = this.orderProductsBySubgroups('', catalogue.products);
  //     let cont = -1;
  //     for (let s of catalogue.subGrupos) {
  //       let arr_aux = [];
  //       // Agrupar productos por subgrupos
  //       for (let p of aux_prod) {
  //         if (s.id_sub == p.id_subgrupo) {
  //           arr_aux.push(p);
  //         }
  //       }
  //       // Asignar el producto que cotiene el grupo y subgrupo
  //       if (arr_aux.length > 0) {
  //         arr_aux.push(await this.createProductViewGroupSubgroup(cont, catalogue.id_grupo, groups, s.id_sub, catalogue.subGrupos));
  //         arr_aux = await this.orderProductForId(arr_aux, 'asc');
  //         for (let a of arr_aux) {
  //           products_final.push(a);
  //         }
  //         cont = (cont) + (-1);
  //       }
  //     }
  //   }

   
    

  //   if (type == 'all' || type == 'search') {
  //     let url_billing = this.urlBilling;
  //     // await this.getUrlEmpresa().then(async (url) => {
  //     //   url_billing = url;
  //     // });
  //     console.log('URL', url_billing);
      
  //     let aux_prod = this.orderProductsByGroups('', catalogue.products);
  //     for (let g of groups) {
  //       let arr_prod_grupo = [];
  //       // Agrupar productos por grupos
  //       for (let p of aux_prod) {
  //         if (g.idgrupo == p.id_grupo) {
  //           arr_prod_grupo.push(p);
  //         }
  //       }
  //       if (arr_prod_grupo.length > 0) {
  //         console.log('LLEGA ACA',arr_prod_grupo );
          
  //          ( this.getSubgruposService2(url_billing, g.idgrupo)).then(async (ressub: any) => {
  //           console.log('ressub', ressub);
            
  //           if (ressub.rta) {
  //             let cont = -1;
  //             for (let s of ressub.data) {
  //               let arr_prod_sub = [];
  //               for (let p of arr_prod_grupo) {
  //                 if (s.id_sub == p.id_subgrupo) {
  //                   arr_prod_sub.push(p);
  //                 }
  //               }
  //               if (arr_prod_sub.length > 0) {
  //                 arr_prod_sub.push(await this.createProductViewGroupSubgroup(cont, g.idgrupo, groups, s.id_sub, ressub.data));
  //                 arr_prod_sub = await this.orderProductForId(arr_prod_sub, 'asc');
  //                 for (let a of arr_prod_sub) {
  //                   products_final.push(a);
  //                 }
  //                 cont = (cont) + (-1);
  //               }
  //             }
  //           }
  //         });
  //       }
  //     }
  //   }
  //   return products_final;
  // }
  async clasifyProductsGroupSubgroup(type, catalogue, groups) {
  let products_final = [];
  
  if (type == 'subgroup') {
    let aux_prod = this.orderProductsBySubgroups('', catalogue.products);
    let cont = -1;
    for (let s of catalogue.subGrupos) {
      let arr_aux = [];
      // Agrupar productos por subgrupos
      for (let p of aux_prod) {
        if (s.id_sub == p.id_subgrupo) {
          arr_aux.push(p);
        }
      }
      // Asignar el producto que cotiene el grupo y subgrupo
      if (arr_aux.length > 0) {
        arr_aux.push(await this.createProductViewGroupSubgroup(cont, catalogue.id_grupo, groups, s.id_sub, catalogue.subGrupos));
        arr_aux = await this.orderProductForId(arr_aux, 'asc');
        for (let a of arr_aux) {
          products_final.push(a);
        }
        cont = (cont) + (-1);
      }
    }
  }

  if (type == 'all' || type == 'search') {
    let url_billing = this.urlBilling;
    console.log('URL', url_billing);
    
    let aux_prod = this.orderProductsByGroups('', catalogue.products);
    
    // ✅ SOLUCIÓN: Usar Promise.all para esperar todas las operaciones asíncronas
    const promises = [];
    
    for (let g of groups) {
      let arr_prod_grupo = [];
      // Agrupar productos por grupos
      for (let p of aux_prod) {
        if (g.idgrupo == p.id_grupo) {
          arr_prod_grupo.push(p);
        }
      }
      
      if (arr_prod_grupo.length > 0) {
        console.log('LLEGA ACA', arr_prod_grupo);
        
        // ✅ Agregar cada promesa al array en lugar de ejecutarla directamente
        const promise = this.getSubgruposService2(url_billing, g.idgrupo).then(async (ressub: any) => {
          console.log('ressub', ressub);
          
          if (ressub.rta) {
            let cont = -1;
            let group_products = []; // Array temporal para este grupo
            
            for (let s of ressub.data) {
              let arr_prod_sub = [];
              for (let p of arr_prod_grupo) {
                if (s.id_sub == p.id_subgrupo) {
                  arr_prod_sub.push(p);
                }
              }
              if (arr_prod_sub.length > 0) {
                arr_prod_sub.push(await this.createProductViewGroupSubgroup(cont, g.idgrupo, groups, s.id_sub, ressub.data));
                arr_prod_sub = await this.orderProductForId(arr_prod_sub, 'asc');
                for (let a of arr_prod_sub) {
                  group_products.push(a);
                }
                cont = (cont) + (-1);
              }
            }
            return group_products;
          }
          return [];
        });
        
        promises.push(promise);
      }
    }
    
    // ✅ Esperar a que TODAS las promesas se resuelvan
    const results = await Promise.all(promises);
    
    // ✅ Agregar todos los resultados al array final
    for (let result of results) {
      for (let product of result) {
        products_final.push(product);
      }
    }
  }
  
  console.log('products_final antes del return:', products_final);
  return products_final;
}

  orderProductsByGroups(type, products) {
    let order = products.sort(function (a, b) {
      if (a.id_grupo > b.id_grupo)
        return -1;
      if (a.id_grupo < b.id_grupo)
        return 1;
      return 0;
    });
    return order;
  }

  orderProductsBySubgroups(type, products) {
    let order = products.sort(function (a, b) {
      if (a.id_subgrupo > b.id_subgrupo)
        return -1;
      if (a.id_subgrupo < b.id_subgrupo)
        return 1;
      return 0;
    });
    return order;
  }

  async filterForOriginMarca(type, filter, products_all, filter_aux) {
    let aux_arr = [];
    if (type == 'origen') {
      for (let p of products_all) {
        if (p.id_producto < 0) {
          aux_arr.push(p);
        }
        if (filter_aux == 0) {
          if (p.origen == filter) {
            aux_arr.push(p);
          }
        } else {
          if (p.origen == filter && p.marca_id == filter_aux) {
            aux_arr.push(p);
          }
        }
      }
    }

    if (type == 'marca') {
      for (let p of products_all) {
        if (p.id_producto < 0) {
          aux_arr.push(p);
        }
        if (p.marca_id == filter) {
          aux_arr.push(p);
        }
      }
    }
    return aux_arr;
  }

  async geUniqueSubgroupsProducts(products) {
    let aux_products = products;
    var hash = {};
    aux_products = products.filter(function (current) {
      var exists = !hash[current.id_subgrupo];
      hash[current.id_subgrupo] = true;
      return exists;
    });
    return aux_products;
  }

  createProductViewGroupSubgroup(id_producto, id_grupo, groups, id_sub, subgroups) {
    let prod = {
      id_producto: id_producto,
      pro_nom: 'Generico',
      id_grupo: null,
      nombre_grupo: '',
      id_subgrupo: null,
      nombre_subgrupo: '',
      view: true,
    }

    for (let g of groups) {
      if (g.idgrupo == id_grupo) {
        prod.id_grupo = g.idgrupo;
        prod.nombre_grupo = g.nombre
      }
    }

    for (let s of subgroups) {
      if (s.id_sub == id_sub) {
        prod.id_subgrupo = s.id_sub;
        prod.nombre_subgrupo = s.nombre
      }
    }

    return prod;

  }

  // Funcion para validar un un subgrupo tiene productos view = true/false
  enableDisableProductGroupSubgroup(products) {
    let aux: any = [];
    // Obtener solo los productos que muestran grupo y subgrupo
    for (let p of products) {
      if (p.id_producto < 0) {
        aux.push(p);
      }
    }
    // Validar si tiene algun producto
    for (let a of aux) {
      let bandera = false;
      for (let p of products) {
        if (a.id_grupo == p.id_grupo && a.id_subgrupo == p.id_subgrupo && p.id_producto > 0) {
          bandera = true;
        }
      }

      if (bandera == true) {
        a.view = true;
      } else {
        a.view = false;
      }
    }

    for (var a = 0; a < aux.length; a++) {
      for (var p = 0; p < products.length; p++) {
        if (aux[a].id_grupo == products[p].id_grupo && products[p].id_subgrupo == aux[a].id_subgrupo) {
          if (aux[a].view == true) {
            products[p].view = aux[a].view;
          } else {
            products.splice(p, 1);
          }
        }
      }
    }

    return products;
  }

  showProducts(products) {
    let bandera = false;
    for (let p of products) {
      if (p.id_producto > 0) {
        bandera = true;
      }
    }

    // Eliminar productos repetidos
    let arr_aux = []
    for (var p = 0; p < products.length; p++) {
      if (products[p].id_producto > 0) {
        arr_aux.push(products[p]);
      }
    }

    return bandera;
  }

  showAtttibutesProducts(conf) {
    if (conf.marca_producto == 0 && conf.peso_producto == 1 || conf.medida_producto == 1 || conf.ubicacion_producto == 1 || conf.cantidadxbulto_producto == 1 || conf.origen_producto == 1) {
      return true;
    } else {
      return false;
    }
  }

  getIdVideoYoutube(url) {
    if (url.indexOf('?v') > 0) {
      let a = url.split('?v=', 2);
      let id = a[1].split('&', 1);
      return id[0];
    } else {
      return '';
    }
  }

  orderTallasProducts(products, type) {
    let order;
    if (type == 'asc') {
      order = products.sort(function (a, b) {
        if (a.talla < b.talla)
          return -1;
        if (a.talla > b.talla)
          return 1;
        return 0;
      });
    }
    if (type == 'desc') {
      order = products.sort(function (a, b) {
        if (a.talla > b.talla)
          return -1;
        if (a.talla < b.talla)
          return 1;
        return 0;
      });
    }
    return order;
  }

  setProductSelectedDetail(product) {
    this.productDetail = product;
  }

  getProductSelectedDetail() {
    return this.productDetail;
  }

  async getInfoProductsReferidos(product, type, configuracion) {
    let referido_arr = [];
    // await this.getUrlEmpresa().then(async (url) => {
      await this.getReferidosProduct(this.urlBilling, product.id_producto).then(async (resref: any) => {
        if (resref.rta == true) {
          if (type == 'configuracion') {
            referido_arr = resref.data;
          } else {
            for (let p of resref.data) {
              await this.getProductosCodigoService(this.urlBilling, p.codigo, configuracion).then(async (respro: any) => {
                if (respro.rta == true) {
                  referido_arr.push(respro.data[0]);
                }
              });
            }
          }
        }
      });
    // });
    return referido_arr;
  }

  async stablishOptionsMenu(menu) {
    let resp = {
      home: 'INICIO',
      catalogo: 'PRODUCTOS',
      sobre_nosotros: 'SOBRE NOSOTROS',
      blog: 'BLOG',
      menu: []
    };
    if (menu.rta) {
      for (let m of menu.data) {
        if (m.referencia == 1) {
          resp.home = m.nombre;
          m.nombre_referencia = 'INICIO / HOME';
          resp.menu.push(m);
        }
        if (m.referencia == 2) {
          resp.catalogo = m.nombre;
          m.nombre_referencia = 'CATALOGO / PRODUCTOS';
          resp.menu.push(m);
        }
        if (m.referencia == 3) {
          resp.sobre_nosotros = m.nombre;
          m.nombre_referencia = 'SOBRE NOSOTROS / INFORMACION';
          resp.menu.push(m);
        }
        if (m.referencia == 4) {
          resp.blog = m.nombre;
          m.nombre_referencia = 'BLOG / SITIO WEB';
          resp.menu.push(m);
        }
      }
    }
    return resp;
  }


  putGeneral(url, body){
    return new Promise((resolve) => {
     this.http.put(url, body).subscribe((data: any) => {
      resolve(data);
    },
      error => {
        resolve(error)
      });
});
  }
  putGeneral2(url: string, body: any): Observable<any> {
    console.log('url', url);
    console.log('body', body);
    
    return this.http.put(url, body);
  }


  hexToRgba(hex, alpha = 1) {
    // Remover el símbolo de hash si está presente
    hex = hex.replace(/^#/, '');

    // Expandir la notación corta (por ejemplo, #03F) a la forma completa (#0033FF)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Asegurar que el string hex esté en el formato correcto
    if (hex.length !== 6) {
        throw new Error('El formato del color hexadecimal no es válido');
    }

    // Extraer los valores de rojo, verde y azul
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
newUrlYoutube(url: string): string {
  try {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    } else {
      throw new Error("No video ID found in the URL");
    }
  } catch (error) {
    console.error(error);
    return url; // Retorna la URL original si hay un error
  }
}

obtenerCodigoVideo(url) {
  // Expresión regular para buscar el código después de /youtu.be/
  const regex = /youtu\.be\/([^\/]+)/;
  // Ejecutar la búsqueda en la URL proporcionada
  const match = url.match(regex);
  // Si hay coincidencia, devolver el código encontrado; de lo contrario, devolver null
  return match ? match[1] : null;
}



getGeneral2( url: any ): Observable<any> {
  // console.log('url ==>', url);
  
  return this.http.get<any>(url)
}

postGeneral( url: string, body: any ): Observable<any> {
  return this.http.post(this.apiLoxafree  + url, body )
}
deleteGeneral( url: string ): Observable<any> {
  return this.http.delete( this.apiLoxafree + url )

}

cadenaByPuntos(text:string) {
  const maxLength = 80; // Maximum number of characters to display
  if (text.length <= maxLength) {
    return text; // No truncation needed if the text is already within the limit
  }
  return text.substring(0, maxLength) + '...'; // Truncate and add ellipsis
}


  // ---- OBSERVABLE ---
  saveToLocalStorage(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
    this.storageSubject.next({ key, data });
  }

  getFromLocalStorage(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getStorageObservable() {
    console.log('ENTRA AL OBSERVABLE');
    
    return this.storageSubject.asObservable();
  }


   rutaDefecto(): Observable<string> {
    const url = `${this.apiLoxafree}configuracion/${this.id_empresa}`;
    return this.http.get<any>(url).pipe(
        map((data:any) => data[0].ruta_inicio_defecto)
    );
}

getRedirectRoute(): Observable<any> {
  const url = `${this.apiLoxafree}configuracion/${this.id_empresa}`;

  return this.http.get<any>(url); // Ajusta la URL a tu API
}


// NUEVAS FUNCIONES ACTUALIZADAS 
  // Metodo Get
  getGeneral( url: any ): Observable<any> {
    return this.http.get<any>(
      `${this.apiLoxafree}${url}`
    )
  }
  dosDecimales(numero: number): number {
  // // ////console.log (numero);
  let resul = Number(numero.toFixed(2));
  // // ////console.log ('res', resul);
  return resul;
}

}
