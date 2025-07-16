import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';
import { ServiceService } from '../../../services/service.service';
import { environment } from '../../../environments/environment';
import { UtilsService } from '../../../services/utils.service';
import { NgxLoadingModule } from 'ngx-loading';

@Component({
  selector: 'app-guia-tallas',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxLoadingModule],
  templateUrl: './guia-tallas.component.html',
  styleUrl: './guia-tallas.component.scss'
})
export default class GuiaTallasComponent {
  public newGuiaTalla: any;
  public guiaTallasAll: any = [];
  public guiaTallas: any = {};
  public guiaTallas2: any = {};
  loading = false;
  public groupsFree = [];
  public groupsFree2 = [];
  
  public name_guia = '';
  public guiaTallasDetalle: any = {};
  urlBilling = `https://sofpymes.com/${environment.empresa}/common/movil/`;
flagSelect=false;
typeResoruce:any;
elementResource:any;

  constructor
    (
      private webService: ServiceService,
      private alert: AlertService,
      private util: UtilsService,

    ) { }

    ngOnInit(){
      // this.groupsFree = [];
      // this.getGroupFree();
      // this.getGuiaTallasAll();
    }

async  modalCreateGuiaTallas(name) {
    await this.inizializeNewGuiaTallas('all');
    await this.getGroupFree();
    this.guiaTallas = {} as any;
    this.guiaTallas2 = {} as any;
    // this.groupsFree = [];
    this.guiaTallasAll = [];

      let modal = this.util.createModal(name);
    modal.show();
  }

  // async getGroupFree() {
  //   // console.log('ENTRA A CARGAR PRODUCTOS');

  //   this.loading = true;
  //   // await this.webService.getUrlEmpresa().then(async (url) => {
  //     await this.webService.getGruposService(this.urlBilling, 'all').then(async (resgrupos: any) => {
  //       console.log('res ==> ',resgrupos );
        
  //       this.loading = false;
  //       if (!resgrupos.error) {
  //         if (resgrupos.rta == true) {
  //           for (let g of resgrupos.data) {
  //             g.vista_web = parseInt(g.vista_web);
  //             g.ocult = false;
  //           }
  //           this.groupsFree = await this.webService.orderObjectsAsc(resgrupos.data);
  //         } else {
  //           this.alert.alertWarning('No se ha encontrado categorias', '');
  //         }
  //         // console.log("getGroupFree", this.groupsFree);
  //       } else {
  //         this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
  //       }
  //     });

  //   // });
  // }

  //   async getGroupFree() {
  //   console.log('ENTRA A CARGAR PRODUCTOS');

  //   this.loading = true;
  //     await (await this.webService.getGruposService(this.urlBilling, 'all')).subscribe(async (resgrupos: any) => {
  //       console.log('resgrupos',resgrupos);
        
      
  //       if (resgrupos.rta) {
  //         if (resgrupos.rta) {
  //           for (let g of resgrupos.data) {
  //             g.vista_web = parseInt(g.vista_web);
  //             g.ocult = false;
  //           }
  //           this.groupsFree = await this.webService.orderObjectsAsc(resgrupos.data);
  //           console.log('groupsFree', this.groupsFree);
            
  //           // this.groupsFree2 = await this.webService.orderObjectsAsc(resgrupos.data);
  //           this.loading = false;
  //         } else {
  //           this.alert.alertWarning('No se ha encontrado categorias', '');
  //         }
  //       } else {
  //         this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
  //       }
  //     });
  // }

 async getGroupFree() {
  console.log('ENTRA A CARGAR GRUPOS');
  this.loading = true;
  
  // Inicializar como array vacío
  this.groupsFree = [];
  
  (await this.webService.getGruposService(this.urlBilling, 'all')).subscribe({
    next: async (resgrupos: any) => {
      console.log('resgrupos', resgrupos);
      
      if (resgrupos?.rta && resgrupos?.data) {
        // Procesar los datos
        const processedGroups = resgrupos.data.map((g: any) => ({
          ...g,
          vista_web: parseInt(g.vista_web),
          ocult: false
        }));
        
        // Ordenar y asignar
        this.groupsFree2 = await this.webService.orderObjectsAsc(processedGroups);
        this.groupsFree2 =processedGroups;
        console.log('groupsFree2', this.groupsFree2);
        
      } else {
        this.alert.alertWarning('No se ha encontrado categorías', '');
        this.groupsFree = [];
      }
      
      this.loading = false;
    },
    error: (error) => {
      console.error('Error al cargar grupos:', error);
      this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
      this.groupsFree = [];
      this.loading = false;
    }
  });
}


  async inizializeNewGuiaTallas(type) {
    if (type == 'all') {
      this.newGuiaTalla = {
        guiaTallas: {
          id_grupo: null,
          medida: '',
          descripcion: ''
        },
        guia_tallas_detalle: {
          id_guia: null,
          nombre: '',
          detalle: ''
        }
      };
    }
    if (type == 'detail') {
      this.newGuiaTalla.guia_tallas_detalle.id_guia = null;
      this.newGuiaTalla.guia_tallas_detalle.nombre = '';
      this.newGuiaTalla.guia_tallas_detalle.detalle = '';
    }
  }

  async viewGuiaTalla(guiaTallas, guiaTallasAll) {
    console.log("Camellito", guiaTallas);
    console.log("guiaTallasAll", guiaTallasAll);
    if (guiaTallas.view == false) {
      for (let g of guiaTallasAll) {
        if (g.id_grupo == guiaTallas.id_grupo) {
          g.view = !guiaTallas.view;
        } else {
          g.view = false;
        }
      }
      this.guiaTallas = guiaTallas.guias;
      this.guiaTallas2 = guiaTallas.guias;
    } else {
      for (let g of guiaTallasAll) {
        g.view = false;
      }
      // this.guiaTallas = {} as any;
        this.guiaTallas = guiaTallas.guias;
        this.guiaTallas2 = guiaTallas.guias;
    }
  }

  async selectGroupGuiaTalla(id_grupo) {
    this.flagSelect=true;
    id_grupo = id_grupo.target.value;
    this.loading = true;
    this.guiaTallas = {} as any;
    this.guiaTallas2 = {} as any;
    this.newGuiaTalla.guiaTallas.id_grupo = id_grupo;
    // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getGuiaTallasGroupId(this.urlBilling, id_grupo).then(async (resguia: any) => {
        console.log("resguia", resguia);
        this.guiaTallas = resguia;
        this.guiaTallas2 = resguia;
        // this.guiaTallas2 = resguia;
      });
    // });
    this.loading = false;
  }
  async selectGroupGuiaTalla2(id_grupo) {
   
    this.loading = true;
    this.guiaTallas = {} as any;
    this.newGuiaTalla.guiaTallas.id_grupo = id_grupo;
    // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getGuiaTallasGroupId(this.urlBilling, id_grupo).then(async (resguia: any) => {
        // console.log("resguia", resguia);
        this.guiaTallas = resguia;
        this.guiaTallas2 = resguia;
      });
    // });
    this.loading = false;
  }


  async createGuiaTallas(guiaTallas) {
    console.log('guia de tallas', guiaTallas );
    
    if (guiaTallas.id_grupo && guiaTallas.medida) {
      this.loading = true;
      // await this.webService.getUrlEmpresa().then(async (url) => {
        let send = {
          data: guiaTallas,
          "endPoint": this.urlBilling + "register_guia_talla"
        }
        await this.webService.insertTableBillingPost(send).then(async (rescreate: any) => {
          if (!rescreate.error) {
            if (rescreate.rta == true) {
              await this.selectGroupGuiaTalla2(guiaTallas.id_grupo);
              this.alert.alertSuccess('Guía de talla registrada exitosamente', '',);
            } else {
              this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '',);
            }
          } else {
            this.alert.alertDanger('Error de servidor', '');
          }
        });
      // });
      this.loading = false;
    } else {
      this.alert.alertDanger('Campos vacios, Ingrese la información solicitada', '');
    }
  }


    async modalCreateGuiaTallasDetalle(createGuiaTallasDetalleModal, guiaTalla) {
    await this.inizializeNewGuiaTallas('detail');
    this.name_guia = guiaTalla.medida;
    this.guiaTallasDetalle = guiaTalla;
    this.newGuiaTalla.guia_tallas_detalle.id_guia = guiaTalla.id_guia;
     let modal = this.util.createModal4(createGuiaTallasDetalleModal);
      modal.show();
    // this.modalCtrl.open(createGuiaTallasDetalleModal, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'lg' }).result.then(async (result) => {
    //   this.closeResult = `Closed with: ${result}`;
    // }, (reason) => {
    //   this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    // });
  }


    async updateGuiaTallas(guiaTallas) {
    if (guiaTallas.medida && guiaTallas.descripcion) {
      this.loading = true;
      let upd = {
        id_guia: guiaTallas.id_guia,
        id_grupo: guiaTallas.id_grupo,
        medida: guiaTallas.medida,
        descripcion: guiaTallas.descripcion
      }
      // await this.webService.getUrlEmpresa().then(async (url) => {
        let send = {
          data: upd,
          "endPoint": this.urlBilling + "update_guias_talla"
        }
        await this.webService.insertTableBillingPost(send).then(async (rescreate: any) => {
          if (!rescreate.error) {
            if (rescreate.rta == true) {
              this.alert.alertSuccess('La guía de talla ha sido actualizado exitosamente', '');
            } else {
              this.alert.alertWarning('No existen cambios para actualizarlos', '', );
            }
          } else {
            this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
          }
        });
      // });
      this.loading = false;
    } else {
      this.alert.alertDanger('Campos vacios, Ingrese la información solicitada', '');
    }
  }


    async ModaldeleteFile(deleteFileModal, data, type) {
    // this.modalCtrl.open(deleteFileModal, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'sm' }).result.then(async (result) => {
    //   this.closeResult = `Closed with: ${result}`;

    //   if (type == 'talla_guia_detalle') {
    //     await this.deleteGuiaTallasDetalle(data);
    //   }
    //   if (type == 'talla_guia') {
    //     await this.deleteGuiaTallas(data);
    //   }
    // }, (reason) => {
    //   this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    // });
  }

  async createGuiaTallasDetalle(guiaTallasDetalle) {
  this.loading = true;
  if (guiaTallasDetalle.nombre && guiaTallasDetalle.detalle) {
    // await this.webService.getUrlEmpresa().then(async (url) => {
      let send = {
        data: guiaTallasDetalle,
        "endPoint": this.urlBilling + "register_guia_talla_detalle"
      }
      await this.webService.insertTableBillingPost(send).then(async (rescreate: any) => {
        if (!rescreate.error) {
          if (rescreate.rta == true) {
            await this.selectGroupGuiaTalla2(this.guiaTallasDetalle.id_grupo);
            // Mostrar en la lista el nuevo detalle
            this.guiaTallasDetalle = this.getDetailTalla(this.guiaTallas.data, this.guiaTallasDetalle, 'create');
            this.alert.alertSuccess('Talla registrada exitosamente', '');
          } else {
            this.alert.alertWarning('La medida ya se encuentra registrada', '');
          }
        } else {
          this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
        }
      });
    // });
  } else {
    this.alert.alertDanger('Campos vacios, Ingrese la información solicitada', '');
  }
  this.loading = false;
}


getDetailTalla(guiaTallas, guiaTallasDetalle, type) {
  let aux;
  if (type == 'create') {
    for (let t of guiaTallas) {
      if (t.id_guia == guiaTallasDetalle.id_guia) {
        aux = t;
      }
    }
  }
  if (type == 'delete') {
    for (var i = 0; i < guiaTallas.detalle.length; i++) {
      if (guiaTallas.detalle[i].id_guia_detalle == guiaTallasDetalle.id_guia_detalle) {
        guiaTallas.detalle.splice(i, 1);
      }
    }
    aux = guiaTallas;
  }
  return aux;
}

async updateGuiaTallasDetalle(guia_detalle) {
  if (guia_detalle.nombre && guia_detalle.detalle) {
    this.loading = true;
    // await this.webService.getUrlEmpresa().then(async (url) => {
      let send = {
        data: guia_detalle,
        "endPoint": this.urlBilling + "update_guias_talla_detalle"
      }
      await this.webService.insertTableBillingPost(send).then(async (rescreate: any) => {
        if (!rescreate.error) {
          if (rescreate.rta == true) {
            this.alert.alertSuccess('El detalle sa sido actualizado exitosamente', '');
          } else {
            this.alert.alertWarning('No existen cambios para actualizarlos', '');
          }
        } else {
          this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
        }
      });
    // });
    this.loading = false;
  } else {
    this.alert.alertDanger('Campos vacios, Ingrese la información solicitada', '');
  }
}


  closeModal(flag: boolean, name: string) {
    let modal = this.util.createModal(name);

    if (flag) {
      modal.hide();
    } else {
      modal.hide();
    }
    this.flagSelect=false;
  }
  closeModal2(flag: boolean, name: string) {
    let modal = this.util.createModal(name);

    if (flag) {
      modal.hide();
    } else {
      modal.hide();
    }
     this.groupsFree = [];
      this.getGuiaTallasAll();
    this.flagSelect=false;
  }

 async openModal(name, data, type){
       this.typeResoruce=type;
     this.elementResource=data;
     let modal = this.util.createModal4(name);
      modal.show();
  }

 async openModalD(name){
      
     let modal = this.util.createModal4(name);
      modal.show();
  }

 async elimiarResource(type,data){
  console.log('type', type);
  console.log('data', data);
  
   if (type == 'talla_guia_detalle') {
        await this.deleteGuiaTallasDetalle(data);
      }
      if (type == 'talla_guia') {
        await this.deleteGuiaTallas(data);
      }
      this.closeModal(true,'#modalDeleteConfirm')
  }

    async deleteGuiaTallasDetalle(guia_detalle) {
    this.loading = true;
    // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.deleteGuiaTallaDetalle(this.urlBilling, guia_detalle.id_guia_detalle).then(async (resdelete: any) => {
        // console.log("resdelete", resdelete);
        if (resdelete.rta == true) {
          this.guiaTallasDetalle = this.getDetailTalla(this.guiaTallasDetalle, guia_detalle, 'delete');
          this.alert.alertSuccess('Talla eliminada exitosamente', '');
        } else {
          this.alert.alertDanger('Ha ocurrido un erros, Intente nuevamente', '');
        }
      });
    // });
    this.loading = false;
  }

  async deleteGuiaTallas(guiaTallas) {
    this.loading = true;
    // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.deleteGuiaTalla(this.urlBilling, guiaTallas.id_guia).then(async (resdelete: any) => {
        // console.log("resdelete", resdelete);
        if (resdelete.rta == true) {
          await this.selectGroupGuiaTalla2(guiaTallas.id_grupo);
          this.alert.alertSuccess('Talla eliminada exitosamente', '');
        } else {
          this.alert.alertDanger('Ha ocurrido un erros, Intente nuevamente', '');
        }
      });
    // });
    this.loading = false;
    this.closeModal(true, '#modalDeleteConfirm')
}

  async getGuiaTallasAll() {
    this.loading = true;
    // await this.webService.getUrlEmpresa().then(async (url) => {
      await this.webService.getGuiaTallasAll(this.urlBilling).then(async (resguia: any) => {
        console.log("resguia", resguia);
        if (resguia.rta == true) {
          this.guiaTallasAll = resguia.data;
          await this.viewGuiaTalla(this.guiaTallasAll[0], this.guiaTallasAll);
        } else {
          this.guiaTallasAll = [] as any;
          this.alert.alertWarning('No se ha encontrado resultados', '');
        }
      });
    // });
    this.loading = false;
  }




}
