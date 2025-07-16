import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-colores-products',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxLoadingModule],
  templateUrl: './colores-products.component.html',
  styleUrl: './colores-products.component.scss'
})
export default class ColoresProductsComponent {
  loading=false;
  public colorsTable: any = [];
  public information: any = [];
  public colorAddTable = {
    nombre: '',
    codigo: '',
    id_empresa: '',
    descripcion: null
  }
  public closeResult: string;
  colorSelect:any;
  constructor
  (
   private webService: ServiceService, 
   private alert: AlertService, 
   private util: UtilsService,
   
  )
  {}

  async ngOnInit(){
     await this.getColorsTable();
  }


    async getColorsTable() {
    this.loading = true;
    await this.webService.getColors().then(async (rescolors: any) => {
      if (!rescolors.error) {
        if (rescolors.rta == true) {
          this.colorsTable = rescolors.data;
        }
      } else {
        this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
      }
    });
    this.loading = false;

  }

    async addColorTable(newColor) {
    if (newColor.nombre && newColor.codigo) {
      this.loading = true;
      newColor.nombre = newColor.nombre.toUpperCase();
      await this.webService.addColorTable(newColor).then(async (rescolor: any) => {
        if (!rescolor.error) {
          if (rescolor.rta == true) {
            await this.getColorsTable();
            this.alert.alertSuccess('Color registrado exitosamente', '');

          } else {
            this.alert.alertWarning(rescolor.message, '');
          }
        } else {
          this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
        }
      });
      this.loading = false;
    } else {
      this.alert.alertDanger('Campos vacios, agrege la información', '');
    }
  }

    openModal(name, color) {
    this.colorSelect=color;
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

    async deleteColorTable(color) {
      this.loading=true;
    await this.webService.deleteColorTable(color).then(async (resdel: any) => {
      if (!resdel.error) {
        if (resdel.rta == true) {
          await this.getColorsTable();
          this.alert.alertSuccess('Color eliminado exitosamente', '');
          this.closeModal(true, "#deleteFileModal");
           this.loading=false;
        } else {
          this.alert.alertWarning('Ha ocurrido un error, intente nuevamente', '');
          this.closeModal(true, "#deleteFileModal");
          this.loading=false;
        }
      } else {
        this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
        this.closeModal(true, "#deleteFileModal");
        this.loading=false;
      }
    });
  }

}
