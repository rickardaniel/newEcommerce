import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ServiceService } from '../../../services/service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-configuracion-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion-admin.component.html',
  styleUrl: './configuracion-admin.component.scss'
})
export default class ConfiguracionAdminComponent implements OnInit {
  public bodegas: any = {};
  public configuracion: any = [];
  urlBilling = environment.urlBilling;
  idEmpresa = environment.idShop;
  public pricesTypes: any = {};
  loading=false;
  public price = {
    before: 50,
    now: 0
  }
  public provinces: any = [];

  constructor
  (
    private webService: ServiceService,
    private alert: AlertService
  )
  {  
  }
 async ngOnInit() {
  await this.getBodegasAll(); 
  await this.getPricesTypes(); 
  await this.getConfiguration();
  await this.getProvinces();
  }



  async getBodegasAll() {
    await this.webService.getGeneral2(this.urlBilling+'get_bodegas').subscribe({
      next: (resp: any) => {
        if(resp.rta){
          this.bodegas = resp.data;
          console.log('this bodega ===> ', this.bodegas);
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {},
    });
  }

  async getPricesTypes() {
    await this.webService.getGeneral2(this.urlBilling+'get_tipos_pvp?grupo_id').subscribe({
      next: (resp: any) => {
        this.pricesTypes=resp.query;
        console.log(' this.pricesTypes',  this.pricesTypes);
        
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {},
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
        complete: () => {},
      });

  }

  // ========================================= ALL FUNCTIONS =========================================
  async updateShowPrice(p) {
    this.loading = true;
    this.configuracion.mostrar_precio = p.target.value;
    await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
      this.loading = false;
      await this.getConfiguration();
      this.alert.alertSuccess('Mostrar precio actualizado exitosamente','') 
    });
  }

  async updateBodega(b) {
    this.loading = true;
    this.configuracion.id_bodega = b.target.value;
    await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
      this.loading = false;
      await this.getConfiguration();
      this.alert.alertSuccess('Bodega actualizada exitosamente','') 
    });
  }
  async updatePriceType(p) {
    this.loading = true;
    this.configuracion.tipoPrecio = p.target.value;
    await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
      this.loading = false;
      await this.getConfiguration();
      this.alert.alertSuccess('Tipo de precio actualizado exitosamente','') 
    });
  }
  async updateTrendProductsShow(t) {
    this.loading = true;
    this.configuracion.productos_tendencia = t.target.value;
    await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
      this.loading = false;
      await this.getConfiguration();
      this.alert.alertSuccess('Productos de tendencia actualizado exitosamente','') 
    });
  }

  async updateRouteDefault(e) {
    this.loading = true;
    this.configuracion.ruta_inicio_defecto = e.target.value;
    await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
      this.loading = false;
      await this.getConfiguration();
      this.alert.alertSuccess('Ruta principal del sitio actualizada exitosamente','') 
    });
  }
  async  changeView(event, configuration, type){
    let resul = event.target.checked;
    this.loading = true;

    if(type=='inicio'){
      configuration.verInicio = resul;
      await this.webService.updateConfiguracion(configuration).then(async (data) => {
        await this.getConfiguration();
        this.alert.alertSuccess('Información actualizada exitosamente','') 

      });
      this.loading = false;
    }else if(type=='home'){
      configuration.verHome = resul;
      await this.webService.updateConfiguracion(configuration).then(async (data) => {
        await this.getConfiguration();
        this.alert.alertSuccess('Información actualizada exitosamente','') 
      });
      this.loading = false;
    }else{
      configuration.verCatalogo = resul;
      await this.webService.updateConfiguracion(configuration).then(async (data) => {
        await this.getConfiguration();
        this.alert.alertSuccess('Información actualizada exitosamente','') 
      });
      this.loading = false;

    }

  }
  async changeVerPromociones(event, information){
    let resul = event.target.checked;
    information.verPromos=resul;
    this.loading = true;
    await this.webService.updateInformation(information).then(async (data) => {
      await this.getConfiguration();
      this.alert.alertSuccess('Ruta principal del sitio actualizada exitosamente','') 

    });
    this.loading = false;
  }

  async updateShowButton(w, type) {
    this.loading = true;
    if (type == 'whatsapp') {
      this.configuracion.visibilidadBtnWhatsapp = w.target.value;
    }
    if (type == 'entrega') {
      this.configuracion.valor_minimo_compra = w.target.value;
    }
    await this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
      this.loading = false;
      await this.getConfiguration();
      this.alert.alertSuccess('','Visualizar botón actualizado exitosamente');
    });
  }

  async updateConfiguration(configuracion) {

    this.loading = true;

    if (!configuracion.porcentajePrecioOferta) {
      configuracion.porcentajePrecioOferta = 0;
    }
    if (!configuracion.porcentajeDescuento) {
      configuracion.porcentajeDescuento = 0;
    }
    if (!configuracion.valor_minimo_compra) {
      configuracion.valor_minimo_compra = 0;
    }
    if (!configuracion.porcentajeCompraTarjeta) {
      configuracion.porcentajeCompraTarjeta = 0;
    }
    if (!configuracion.costoEnvio) {
      configuracion.costoEnvio = 0;
    }
    if (!configuracion.costoEnvio2) {
      configuracion.costoEnvio2 = 0;
    }

    await this.webService.updateConfiguracion(configuracion).then(async (data) => {
      this.loading = false;
      await this.getConfiguration();
      this.alert.alertSuccess('','Información actualizada exitosamente');

    });

  }

  async getProvinces() {
    this.loading = true;
      await this.webService.getProvincesEcuador(this.urlBilling).then(async (resprovinces: any) => {
        if (!resprovinces.error) {
          if (resprovinces.rta == true) {
            this.provinces = resprovinces.data;
          } else {
            this.alert.alertWarning('','No se ha encontrado provincias');

          }
        } else {
          this.alert.alertDanger('','Error en el servidor, intente nuevamente');

        }
      });
    this.loading = false;
  }

  async updateCostShippingProvince(province) {
    let aux = false;
    // Comprobar si el valor es valido
    if (!province.precio_envio || province.precio_envio < 0) {
      aux = false;
    } else {
      if (province.precio_envio == 0) {
        aux = true;
      } else {
        aux = this.webService.validateNumbers(province.precio_envio);
      }
    }
    // Si el valor es valido se actualiza
    if (aux == true) {
      this.loading = true;
      let data = {
        tabla: 'bill_provincia',
        id: 'idProvincia',
        valor_id: province.idProvincia,
        atributo: 'precio_envio',
        valor_atributo: province.precio_envio
      }
        this.loading = false;
        await this.webService.updateAtributeProvince(this.urlBilling, data).then((resupd: any) => {
          if (resupd.rta == true) {
            this.getProvinces();
            this.alert.alertSuccess('','El costo ha sido actualizado');

          } else {
            this.alert.alertSuccess('','Ha ocurrido un error, Intente nuevamente');
          }
        });
    } else {
      this.alert.alertSuccess('','Valor no válido, verifique e intente nuevamente');
    }
  }

}
