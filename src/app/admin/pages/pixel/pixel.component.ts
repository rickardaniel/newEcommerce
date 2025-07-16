import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-pixel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pixel.component.html',
  styleUrl: './pixel.component.scss'
})
export default class PixelComponent {
  public loading = false;
  configuracion: any = [];

  constructor(
    private webService: ServiceService,
    private alert: AlertService,
      private route: ActivatedRoute,

  ) { }

    ngOnInit(): void {
      this.getConfiguration();
  }

  getConfiguration(){
       this.route.data.subscribe(data => {
      this.configuracion = data['appConfig'][0];
    });
  }

    async updatePixelfacebook(p) {
    if (p) {
      this.loading = true;
      this.configuracion.pixel_facebook = p;
      await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
        await this.webService.createBodyMailPixelFacebook(this.configuracion).then(async (resbody) => {
          await this.webService.sendMailService(resbody).then((resmail) => { });
        });
        this.loading = false;
        await this.getConfiguration();
        this.alert.alertSuccess('Administración de Pixel Facebook solicitada.', '');
      });
    } else {
      this.alert.alertDanger('Campo vacio, Ingrese el código para configurar Pixel de Facebook.', '');
    }
  }



}
