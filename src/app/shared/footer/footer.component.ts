import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { environment } from '../../environments/environment';
import { ServiceService } from '../../services/service.service';
import { RouterModule } from '@angular/router';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  @Input('information') information:any;
  @Input('configuracion') configuracion:any;
  urlBase = environment.firebaseUrl;
  public footerText;
  constructor
  (
    private webService: ServiceService,
    private util: UtilsService,
  )
  {

  }
async  ngOnInit(){
    await this.createFooterText();
    let color  = this.configuracion.colorPrincipal;
    let colorLetra  = this.configuracion.colorLetra;
    document.documentElement.style.setProperty('--dynamic-color', color);
    document.documentElement.style.setProperty('--font-color-letter', colorLetra);
    const rgbaColor = this.util.hexToRgba(color, 0.1);
    document.documentElement.style.setProperty('--lighter-tone', rgbaColor);
  }


  async goToSocialNetwork(redSocial) {
    // console.log(redSocial);
    window.open(redSocial, "_blank");
  }

  async createFooterText() {
    await this.getDate(0).then((resDate: any) => {
      // console.log("Fechita", resDate);
      // this.footerText = '© ' + resDate.año + ', Developed by Punto Pymes | Copyright | All rights reserved.';
      this.footerText = '© '+'Todos los derechos  reservados ' + resDate.año ;
    });
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

}
