import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../../services/alert.service';
import { MigrationService } from '../../../services/migration.service';
import { ServiceService } from '../../../services/service.service';
import { NgxLoadingModule } from 'ngx-loading';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-img-banner',
  standalone: true,
  imports: [NgxLoadingModule],
  templateUrl: './img-banner.component.html',
  styleUrl: './img-banner.component.scss'
})
export default class ImgBannerComponent {
  public imagesBanner = [];
  empresa = environment.empresa;
  urlBase = environment.firebaseUrl;
  sistema = environment.empresa;
  idEmpresa = environment.idShop;
  public closeResult: string;
  loading=false;
  
  urlBanner = 'banner%2F';
  urlBannerFB = 'banner';

  fileImg:any=[];
  flagfileImg=false;

  constructor
  (
    private webService: ServiceService , 
    private alert: AlertService,
    private fireService: MigrationService,
    private util: UtilsService,

  ) 
  {
  }

 async ngOnInit(){
    await this.getImagesBanner();
  }

  async getImagesBanner() {
    this.loading=true;
    await this.webService.getGeneral("imagenes-banners/"+this.idEmpresa).subscribe({
      next:(resp)=>{
        console.log('resp img ', resp);
          this.imagesBanner = resp;
           // console.log(data);
          this.loading=false;    
      }
    })
  }

  onSelectAnyImage(event){
    // console.log('evento no se ejecuta', event);

    if (event.target.files.length > 0) {
      this.fileImg = event.target.files[0];
      console.log(this.fileImg);
      if (this.fileImg.type.startsWith('application/')) {
        this.alert.alertDanger('Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.','');
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

 async uploadImage(){
  this.loading=true;
   let name = await this.uploadAnyImg(this.fileImg);
  await this.insertImagenBanner(name, 'banner');

  }

  async uploadAnyImg(file){
    let nameLogo = this.generateRandomString();
    let rutaC = `${this.empresa}/banner/${nameLogo}`;
    let rutaCBD = `banner%2F${nameLogo}`;
    await this.fireService.uploadImage(file, rutaC).then((data: any) => {
      // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
    });
    console.log('rutaCBD', rutaCBD);

    return rutaCBD;
  }

  async insertImagenBanner(res, name) {
    // let data = JSON.parse(res);
    // let url = data.id;
    this.loading = true;
    let datos = {
      nombre: name,
      url: res
    }
    this.webService.insertImageBanner(datos).then((data: any) => {
    // this.webService.postGeneral('imagenes-banners',datos).subscribe((data: any) => {
      console.log('resp guardar imagen', data);
      if (!data.error) {
        this.loading=false;
        this.closeModal(true, '#modalUpload')
        this.getImagesBanner();
        this.alert.alertSuccess('Banner insertado exitoramente', '');
      
      } else {
        this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');
      }
    });
  }

  async deleteBanner(banner) {

    // console.log('banner que recibo', banner);

    this.loading = true;
    await this.webService.deleteImageBanner(banner.id_img_banner).then((resdel: any) => {
      if (!resdel.error) {
        this.getImagesBanner();
        console.log('banner', banner.url);
        
        // this.appContext.Repository.File.delete(banner.url).then(async (resDrive) => { });
        this.fireService.deleteImage(banner.url);

      } else {
        this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');
      }
    });
    this.loading = false;
  }

  redirecTo(url){
    window.open(url, '_blank')
  }

  openModal(name) {
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

  generateRandomString() {
    let letters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 5; i++) {
      let randomIndex = Math.floor(Math.random() * letters.length);
      result += letters[randomIndex];
    }
    return result;
  }
}
