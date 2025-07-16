import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { MigrationService } from '../../../services/migration.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-mision-vision',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mision-vision.component.html',
  styleUrl: './mision-vision.component.scss'
})
export default class MisionVisionComponent implements OnInit {
  information:any=[];
  urlBase = environment.firebaseUrl;
  empresa = environment.empresa;
  public closeResult: string;
  loading=false;

      //URLS PARA FIREBASE QUE SE REEMPLAZAN EN LA BD

      urlLogo_sobre_nosotros_grupos = 'urlLogo_sobre_nosotros_grupos%2F';
      urlLogo_sobre_nosotros_gruposFB = 'urlLogo_sobre_nosotros_grupos';
      urlProductos= 'productos%2F';
      urlProductosFB= 'productos';
      urlBanner = 'banner%2F';
      urlBannerFB = 'banner';
      urlPromociones = 'promociones%2F';
      urlPromocionesFB = 'promociones';
      idEmpresa = environment.idShop;

    fileImg:any;
    flagfileImg = false;


  constructor
  (
    private webService: ServiceService,
    private alert: AlertService,
    private util: UtilsService,
    private fireService: MigrationService,
  ) 
  {

  }

 async ngOnInit() {
    await this.getInformation();

  }
  formMisionVision = new FormGroup({
    mision: new FormControl(),
    vision: new FormControl(),
    valores: new FormControl(),
  })


  async getInformation() {
    await this.webService
      .getGeneral('informacions/' + this.idEmpresa)
      .subscribe({
        next: (resp: any) => {
          this.information = resp[0];
          console.log('Informacion', this.information);

          this.formMisionVision.setValue({
            mision: this.information.mision,
            vision: this.information.vision,
            valores: this.information.valores,
          })
        },
        error: (err: any) => {
          this.loading = false;
          console.log(err);
        },
        complete: () => {},
      });
    
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

  openModal(name: any) {
    let modal = this.util.createModal(name);
    modal.show();
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
        this.updateInformation(this.information);
      }
    }
  }

  async updateInformation(information) {

    this.loading = true;
    if (this.flagfileImg) {
      await this.fireService.deleteImage(information.imagenMision);
      let pathLogo2 = await this.uploadAnyImg(this.fileImg);
      information.imagenMision = pathLogo2;
    }
    await this.webService.updateInformation(information).then(async (data) => {
      await this.getInformation();
      this.alert.alertSuccess('Información actualizada exitosamente', '');
      this.fileImg=[];
      this.closeModal(true, "#modalUpload")
    });
    this.loading = false;
  }

  async uploadAnyImg(file){
    let nameLogo = this.generateRandomString();
    let rutaC = `${this.empresa}/urlLogo_sobre_nosotros_grupos/misionGeneral${nameLogo}`;
    let rutaCBD = `urlLogo_sobre_nosotros_grupos%2FmisionGeneral${nameLogo}`;
    await this.fireService.uploadImage(file, rutaC).then((data: any) => {
    });
    return rutaCBD;
  }

  

 

  // async onCompleteUpload(res, type, other) {


  //   if (type == 'AboutUs') {
  //     await this.createUpdateAboutUs(res, type, other);
  //   }

    
  //   this.loading = false;
  // }

  // async createUpdateAboutUs(res, type, other) {
  //   this.loading = true;
  //   console.log('res', res);

  //   // let data = JSON.parse(res);
  //   let data  = res;
  //   // let imageDelet;

  //   if (other == 'history') {
  //     // imageDelet = this.information.imagenHistoria;
  //     this.information.imagenHistoria = data;
  //     await this.updateAboutUs(this.information);
  //   }
  //   // if (other == 'history') {
  //   //   imageDelet = this.information.imagenHistoria;
  //   //   this.information.imagenHistoria = data.id;
  //   //   await this.updateAboutUs(this.information, imageDelet);
  //   // }

  //   if (other == 'mision') {
  //     // imageDelet = this.information.imagenMision;
  //     this.information.imagenMision = data;
  //     await this.updateAboutUs(this.information);
  //     // await this.updateAboutUs(this.information, imageDelet);
  //   }

  //   if (other == 'vision') {
  //     // imageDelet = this.information.imagenVision;
  //     this.information.imagenVision = data;
  //     await this.updateAboutUs(this.information);
  //   }

  //   if (other == 'valores') {
  //     // imageDelet = this.information.imagenValores;
  //     this.information.imagenValores = data.id;
  //     await this.updateAboutUs(this.information);
  //   }

  //   this.loading = false;
  // }

  async updateAboutUs(form) {
    console.log('FORM ----->',form);
    
    this.information.mision = form.mision;
    this.information.vision = form.vision;
    this.information.valores = form.valores;
    // console.log('llega a este punto y debe actualizarse');

    await this.updateInformation(this.information);
    // if (imageDelet) {
    //   this.appContext.Repository.File.delete(imageDelet).then(async (resDrive) => {
    //   });
    // }
  }

  // async updateInformation(information) {
  //   // console.log('informacion', information);
   

  //   this.loading = true;
  //   await this.webService.updateInformation(information).then(async (data) => {
  //     await this.getInformation();
  //     this.alert.alertSuccess('Información actualizada exitosamente', '');

  //   });
  //   this.loading = false;
  // }


  // ===================================================================================================================
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
