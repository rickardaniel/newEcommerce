import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { environment } from '../../../environments/environment';
import { QRCodeComponent } from 'angularx-qrcode';
import { NgxLoadingModule } from 'ngx-loading';

@Component({
  selector: 'app-generar-vaucher',
  standalone: true,
  imports: [FormsModule,CommonModule, QRCodeComponent, NgxLoadingModule],
  templateUrl: './generar-vaucher.component.html',
  styleUrl: './generar-vaucher.component.scss'
})
export default class GenerarVaucherComponent {
public myAngularxQrCode: string = null;
  
  public vaucher: any = {
    id_empresa: null,
    valor_transaccion: null,
    detalle_transaccion: null,
    fecha_creacion: null,
    hora_creacion: null,
    estado: 0
  };
  loading=false;
  public configuracion: any = {};
  public buttonsPay: any = {};
  urlBilling = environment.urlBilling;
  idEmpresa = environment.idShop;


    constructor
  (
    private webService: ServiceService,
    private alert: AlertService,
    // private fireService: MigrationService,
    // private storage: AngularFireStorage,
    // private router: Router,
  )
  { }

  async ngOnInit() {
   await this.getConfiguration();
   await this.webService.visibilityPurchaseButtons(this.configuracion, {}).then((resbtn: any) =>{
    this.buttonsPay = resbtn;
  });
  }

   async getConfiguration() {
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

        },
        error: (err: any) => {
          this.loading = false;
          console.log(err);
        },
        complete: () => {},
      });

  }

  async generateVaucher() {
    this.myAngularxQrCode = '';
    if (this.vaucher.valor_transaccion > 0 && this.vaucher.detalle_transaccion) {
      this.loading = true;
      await this.webService.getCurrentDate().then((resdate: any) => {
        this.vaucher.fecha_creacion = resdate.year + '-' + resdate.month_number + '-' + resdate.day_number;
        this.vaucher.hora_creacion = resdate.hour + ':' + resdate.minute + ':' + resdate.second;
      });
      this.vaucher.id_empresa = this.configuracion.id_empresa;
      await this.webService.generateVaucher(this.vaucher).then((resgene: any) => {
        if (resgene.rta) {
          // this.myAngularxQrCode = this.configuracion.dominioPagina + '/vaucher/' + resgene.id;
          this.myAngularxQrCode = this.configuracion.dominioPagina + '/vaucher?id=' + resgene.id;
          this.alert.alertSuccess('Vaucher generado exitosamente', '');
        } else {
          this.alert.alertDanger('Error al generar el vaucher, Intente nuevamente', '', );
        }
      });
      this.loading = false;
    } else {
      this.alert.alertWarning('Campos vacios, Ingrese la información solicitada', '');
    }
  }

    async openLik(){
    window.open(this.myAngularxQrCode, "_blank");
  }

  async sharedWhatsapp(){
    await this.webService.getInformacion().then((datainfo: any) => {
      window.open("https://wa.me/" + datainfo[0].whatsapp + "?text=" + this.myAngularxQrCode + "", "_blank");
    });
  }
}
