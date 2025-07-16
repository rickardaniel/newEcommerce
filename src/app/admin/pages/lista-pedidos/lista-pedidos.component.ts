import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from '../../../services/service.service';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../../services/alert.service';
import { CommonModule } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { UtilsService } from '../../../services/utils.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [CommonModule, NgxLoadingModule, FormsModule],
  templateUrl: './lista-pedidos.component.html',
  styleUrl: './lista-pedidos.component.scss'
})
export default class ListaPedidosComponent implements OnInit  {
  public queryCortizations = {
    cedula: '',
    desde: '',
    hasta: '',
  }
  public cotizationsSelected: any = {};
  public cotizations: any = [];
  loading=false;
  empresa = environment.empresa;
  urlBase = environment.firebaseUrl;
  urlBilling = environment.urlBilling;
  public closeResult: string;
  flagLoader=false;
  cotizacionSelect:any;
  constructor
  (
    private webService: ServiceService,
    private alert: AlertService,
    private toaster: ToastrService,
    private util: UtilsService

  )
  {

  }

  async ngOnInit() {
    await this.listActualCotizations(); 
  }

  async listActualCotizations() {
    await this.restoreQueryGetCotizations().then(async (resrestore) => {
      this.queryCortizations = resrestore;
      await this.getDateCurrent();
      await this.getCotizations(this.queryCortizations, 'No se ha encontrado resultados de la fecha actual');
    });
  }
  async restoreQueryGetCotizations() {
    this.queryCortizations = {
      cedula: '',
      desde: '',
      hasta: ''
    }
    return this.queryCortizations;
  }
  async getDateCurrent() {
    await this.webService.getDate(0).then(async (resdate: any) => {
      this.queryCortizations.desde = resdate.año + '-' + resdate.mes_num + '-' + resdate.dia;
      this.queryCortizations.hasta = resdate.año + '-' + resdate.mes_num + '-' + resdate.dia;
    });
  }
  async getCotizations(data, message) {
    this.loading = true;
      await this.webService.getCotizationsClient(this.urlBilling , data).then((rescoti: any) => {
        if (rescoti.rta == true) {
          this.cotizations = this.webService.orderCotizationsById(rescoti.data, 'desc');
        } else {
          this.alert.alertInfo(message, '');
          this.cotizations = [];
        }
      });
    this.loading = false;
  }
  async listAllCotizations() {
    await this.restoreQueryGetCotizations().then(async (resrestore) => {
      this.queryCortizations = resrestore;
      await this.getCotizations(this.queryCortizations, 'No se ha encontrado resultados');
      await this.getDateCurrent();
    });
  }

  async listRangeDateCotizations() {
    this.queryCortizations.cedula = '';
    await this.getCotizations(this.queryCortizations, 'No se ha encontrado resultados');
  }

  async listCotizationsById() {
    if (this.queryCortizations.cedula) {
      this.queryCortizations.desde = '';
      this.queryCortizations.hasta = '';
      await this.getCotizations(this.queryCortizations, 'No se ha encontrado resultados');
      await this.getDateCurrent();
    } else {
      // this.toaster.warning('Campo vacío, Ingrese el número de identificación', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
      this.alert.alertWarning('Campo vacío, Ingrese el número de identificación', '');

    }
  }
  verComprobante(file:any){
    window.open(this.urlBase + file+'?alt=media', '_blank');
  }

  openModal(name:any, cotizacion){
    console.log('COTIZACION SELECT ==> ', cotizacion );
    
    this.cotizacionSelect=cotizacion;
    let modal = this.util.createModal(name);
    modal.show();
    }

    closeModal(flag:boolean, name:string){
      let modal = this.util.createModal(name)
      
      if(flag){

      }else{
       modal.hide();
      }
      
      // this.modalService.show();
      // modalF.show();
      }

  async modalShowDetailCotization(showDetailCotizationModal, cotization) {
    this.cotizationsSelected = cotization;
    // this.modalCtrl.open(showDetailCotizationModal, { ariaLabelledBy: 'modal-basic-title', centered: true }).result.then(async (result) => {
    //   this.closeResult = `Closed with: ${result}`;
    // }, (reason) => {
    //   this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //   this.cotizationsSelected = {};
    // });
  }

  private getDismissReason(reason: any): any {
    // if (reason === ModalDismissReasons.ESC) {
    //   return 'by pressing ESC';
    // } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
    //   return 'by clicking on a backdrop';
    // } else {
    //   return `with: ${reason}`;
    // }
  }

}
