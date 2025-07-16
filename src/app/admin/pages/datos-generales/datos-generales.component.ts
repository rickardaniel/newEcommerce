import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { MigrationService } from '../../../services/migration.service';
import { environment } from '../../../environments/environment';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxLoadingModule } from 'ngx-loading';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-datos-generales',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxLoadingModule],
  templateUrl: './datos-generales.component.html',
  styleUrl: './datos-generales.component.scss',
})
export default class DatosGeneralesComponent implements OnInit {
  public configuracion: any = {};
  public information: any = {};
  public buttonsPay: any = {};
  urlBase = environment.firebaseUrl;
  empresa = environment.empresa;
  sistema = environment.empresa;
  idEmpresa = environment.idShop;
  public closeResult: string;
  public loading = false;
  public price = {
    before: 50,
    now: 0,
  };

  //URLS PARA FIREBASE QUE SE REEMPLAZAN EN LA BD

  urlLogo_sobre_nosotros_grupos = 'urlLogo_sobre_nosotros_grupos%2F';
  urlLogo_sobre_nosotros_gruposFB = 'urlLogo_sobre_nosotros_grupos';
  urlProductos = 'productos%2F';
  urlProductosFB = 'productos';
  urlBanner = 'banner%2F';
  urlBannerFB = 'banner';
  urlPromociones = 'promociones%2F';
  urlPromocionesFB = 'promociones';
  // --------------- CARGAR CODIGOS QR  PAGO ----------------
  file1: any;
  file2: any;
  file3: any;
  fileImg:any;
  fileLogo2: any;
  flagFile1 = false;
  flagFile2 = false;
  flagFile3 = false;
  flagFileLogo2 = false;
  flagfileImg = false;

  constructor(
    private webService: ServiceService,
    private alert: AlertService,
    private util: UtilsService,
    // private storage: AngularFireStorage,
    private fireService: MigrationService
  ) {}

  async ngOnInit() {
    await this.getConfiguration();
    await this.getInformation();
    // await this.webService.visibilityPurchaseButtons(this.configuracion, {}).then((resbtn: any) =>{
    //   this.buttonsPay = resbtn;
    // });
  }

  formLogoDos = new FormGroup({
    logo: new FormControl(''),
    url: new FormControl(''),
  });
  formPortada = new FormGroup({
    slogan: new FormControl(),
    color: new FormControl(),
    detalle: new FormControl(),
    fraseClave: new FormControl(),
    fraseEmpresa: new FormControl(),
    video: new FormControl(),
    descEmpresa: new FormControl(),
    detalleDesEmpresa: new FormControl(),
  });

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

    // await this.webService.getConfiguracion().then(async (data: any) => {
    //   // console.log('data', data);

    //   if (!data.error) {
    //     if (data[0]) {
    //       this.configuracion = data[0];
    //       this.loading=false;
    //       // Precio oferta y real ejemplo
    //       if (this.configuracion.porcentajePrecioOferta > 0) {
    //         let porcent = (this.price.before * this.configuracion.porcentajePrecioOferta) / 100;
    //         this.price = {
    //           before: 50,
    //           now: this.price.before - porcent
    //         }
    //       }
    //       // console.log(this.configuracion);
    //     } else {
    //       this.loading=false;
    //       console.log("No se ha encontrado configuracion");
    //     }
    //   } else {
    //     this.loading=false;
    //     this.alert.alertDanger('No se ha podido acceder al servicio, comuniquese con su administrador','');
    //   }
    // });
  }

  async getInformation() {
    await this.webService
      .getGeneral('informacions/' + this.idEmpresa)
      .subscribe({
        next: (resp: any) => {
          this.information = resp[0];
          console.log('Informacion', this.information);
          this.formLogoDos.controls['url'].setValue(
            this.information.redirect_logo_dos
          );
          this.formPortada.setValue({
            slogan: this.information.slogan,
            color: this.information.colorLetraSlogan,
            detalle: this.information.detalleSlogan,
            fraseClave: this.information.fraseClave,
            fraseEmpresa: this.information.fraseEmpresa,
            video: this.information.video,
            descEmpresa: this.information.detalleEmpresa,
            detalleDesEmpresa: this.information.detallefraseClave,
          });
        },
        error: (err: any) => {
          this.loading = false;
          console.log(err);
        },
        complete: () => {},
      });
    //   await this.webService.getInformacion().then(async (data: any) => {
    //     if (!data.error) {
    //       if (data[0]) {
    //         this.information = data[0];
    //         // console.log("Informacion", this.information);
    //         this.formLogoDos.controls['url'].setValue(this.information.redirect_logo_dos);
    //         this.formPortada.setValue({
    //           'slogan': this.information.slogan,
    //           'color': this.information.colorLetraSlogan,
    //           'detalle': this.information.detalleSlogan,
    //           'fraseClave': this.information.fraseClave,
    //           'fraseEmpresa': this.information.fraseEmpresa,
    //           'video': this.information.video,
    //           'descEmpresa': this.information.detalleEmpresa,
    //           'detalleDesEmpresa': this.information.detallefraseClave,

    //         })
    //       } else {
    //         console.log("No se ha encontrado information");
    //       }
    //     } else {
    //       this.alert.alertDanger('No se ha podido acceder al servicio, comuniquese con su administrador','');

    //     }
    //   });
  }
  async updateColors(colorFondo, colorTexto, colorTextoSecundario) {
    if (colorFondo || colorTexto) {
      this.configuracion.colorPrincipal = colorFondo;
      this.configuracion.colorLetra = colorTexto;
      this.configuracion.colorLetraSecundario = colorTextoSecundario;
      this.loading = true;
      await this.webService
        .updateConfiguracion(this.configuracion)
        .then(async (data) => {
          this.loading = false;
          await this.getConfiguration();
          this.alert.alertSuccess('Colores actualizados exitosamente', '');
        });
    } else {
      this.alert.alertSuccess('Seleccione un color', '');
    }
  }

  async changeTipoNegocio(event, information) {
    let resul = event.target.checked;
    information.esPuntoVenta = resul;
    this.loading = true;
    await this.webService.updateInformation(information).then(async (data) => {
      await this.getInformation();
      this.alert.alertSuccess('Información actualizada exitosamente', '');
    });
    this.loading = false;
  }

  async changeVerPromociones(event, information) {
    let resul = event.target.checked;
    information.verPromos = resul;
    this.loading = true;
    await this.webService.updateInformation(information).then(async (data) => {
      await this.getInformation();
      this.alert.alertSuccess('Información actualizada exitosamente', '');
    });
    this.loading = false;
  }

  // NUEVOS REQUERIMIENTOS CODE QR PAGO
  onSelectQR1(event) {
    console.log('evento no se ejecuta');

    if (event.target.files.length > 0) {
      this.file1 = event.target.files[0];
      console.log(this.file1);
      if (this.file1.type.startsWith('application/')) {
        this.alert.alertDanger(
          'Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.',
          ''
        );
        this.file1 = {};
        console.log(this.file1);
        if (Object.keys(this.file1).length === 0) {
          this.flagFile1 = false;
        }
      } else {
        this.flagFile1 = true;
        this.updateInformation(this.information);
      }
    }
  }
  onSelectQR2(event) {
    if (event.target.files.length > 0) {
      this.file2 = event.target.files[0];
      console.log(this.file1);
      if (this.file2.type.startsWith('application/')) {
        this.alert.alertDanger(
          'Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.',
          ''
        );

        this.file2 = {};
        console.log(this.file2);
        if (Object.keys(this.file2).length === 0) {
          this.flagFile2 = false;
        }
      } else {
        this.flagFile2 = true;
        this.updateInformation(this.information);
      }
    }
  }
  onSelectQR3(event) {
    if (event.target.files.length > 0) {
      this.file3 = event.target.files[0];
      console.log(this.file3);
      if (this.file3.type.startsWith('application/')) {
        this.alert.alertDanger(
          'Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.',
          ''
        );

        this.file3 = {};
        console.log(this.file3);
        if (Object.keys(this.file3).length === 0) {
          this.flagFile3 = false;
        }
      } else {
        this.flagFile3 = true;
        this.updateInformation(this.information);
      }
    }
  }

  async updateInformation(information) {
    this.loading=true;
    // console.log('informacion', information);
    if (this.flagFile1) {
      //  await this.deleteFileFirebase(information.imgQrP);
      let path1 = await this.uploadImg(this.file1, '1');
      information.imgQrP = path1;
    }
    if (this.flagFile2) {
      // await this.deleteFileFirebase(information.imgQrS);
      let path2 = await this.uploadImg(this.file2, '2');
      information.imgQrS = path2;
    }
    if (this.flagFile3) {
      // await this.deleteFileFirebase(information.imgQrT);
      let path3 = await this.uploadImg(this.file3, '3');
      information.imgQrT = path3;
    }
    if (this.flagFileLogo2) {
      if(information.logo_dos){
        await this.fireService.deleteImage(information.logo_dos);
        let pathLogo2 = await this.uploadLogo2(this.fileLogo2);
        information.logo_dos = pathLogo2;
        information.redirect_logo_dos = this.formLogoDos.controls['url'].value;
      }else{
        let pathLogo2 = await this.uploadLogo2(this.fileLogo2);
        information.logo_dos = pathLogo2;
        information.redirect_logo_dos = this.formLogoDos.controls['url'].value;  
      }
     
    }

    await this.webService.updateInformation(information).then(async (data) => {
      await this.getInformation();
      this.alert.alertSuccess('Información actualizada exitosamente', '');
    });
    this.loading = false;
  }

  async updateConfiguration(configuration) {
    // console.log('informacion', information);
    this.loading = true;
    if (this.flagfileImg) {
      await this.fireService.deleteImage(configuration.imgLogo);
      let pathLogo2 = await this.uploadAnyImg(this.fileImg);
      configuration.imgLogo = pathLogo2;
      // configuration.redirect_logo_dos = this.formLogoDos.controls['url'].value;
    }

    
    await this.webService.updateConfiguracion(configuration).then(async (data) => {
      await this.getConfiguration();
      this.alert.alertSuccess('Información actualizada exitosamente', '');
      this.fileImg=[];
      this.closeModal(true, "#modalUpload")
    });
    this.loading = false;
  }

  async updateDataPortada(information, form){
    console.log('form', form);
    information.slogan=form.slogan;
    information.colorLetraSlogan=form.color;
    information.detalleSlogan=form.detalle;
    information.fraseClave=form.fraseClave;
    information.fraseEmpresa=form.fraseEmpresa;
    information.detalleEmpresa=form.descEmpresa;
    information.detallefraseClave=form.detalleDesEmpresa;
    information.video=form.video;
    console.log('---> ', information);
    
    this.loading = true;
    await this.webService.updateInformation(information).then(async (data) => {
      await this.getInformation();
      this.alert.alertSuccess('Información actualizada exitosamente', '');

    });
    this.loading = false;
  }

  async uploadImg(file, orden) {
    // let randomC = this.fireService.generateRandomString();
    let rutaC = `${this.empresa}/img_QR_pago/${orden}/${file.name}`;
    let rutaCBD = `img_QR_pago%2F${orden}%2F${file.name}`;
    await this.fireService.uploadImage(file, rutaC).then((data: any) => {
      // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
    });
    console.log('rutaCBD', rutaCBD);

    return rutaCBD;
  }

  async uploadLogo2(file) {
    // let randomC = this.fireService.generateRandomString();
    let rutaC = `${this.empresa}/logo_dos/${file.name}`;
    let rutaCBD = `logo_dos%2F${file.name}`;
    await this.fireService.uploadImage(file, rutaC).then((data: any) => {
      // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
    });
    console.log('rutaCBD', rutaCBD);

    return rutaCBD;
  }

  async uploadAnyImg(file){
    let nameLogo = this.generateRandomString();
    let rutaC = `${this.empresa}/urlLogo_sobre_nosotros_grupos/logoPrincipal${nameLogo}`;
    let rutaCBD = `urlLogo_sobre_nosotros_grupos%2FlogoPrincipal${nameLogo}`;
    await this.fireService.uploadImage(file, rutaC).then((data: any) => {
      // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
    });
    console.log('rutaCBD', rutaCBD);

    return rutaCBD;
  }

  async onRemoveQR1(url) {
    this.file1 = {};
    if (Object.keys(this.file1).length === 0) {
      this.flagFile1 = false;
      await this.fireService.deleteImage(url);
      this.information.imgQrP = null;
      this.updateInformation(this.information);
    }
  }
  async onRemoveQR2(url) {
    this.file2 = {};
    if (Object.keys(this.file2).length === 0) {
      this.flagFile2 = false;
      await this.fireService.deleteImage(url);
      this.information.imgQrS = null;
      this.updateInformation(this.information);
    }
  }
  async onRemoveQR3(url) {
    this.file3 = {};
    if (Object.keys(this.file3).length === 0) {
      this.flagFile3 = false;
      await this.fireService.deleteImage(url);
      this.information.imgQrT = null;
      this.updateInformation(this.information);
    }
  }

  verComprobante(file: any) {
    window.open(this.urlBase + file + '?alt=media', '_blank');
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

  generateRandomString() {
    let letters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 5; i++) {
      let randomIndex = Math.floor(Math.random() * letters.length);
      result += letters[randomIndex];
    }
    return result;
  }

  async uploadLogo(archive, configuracion) {
    // const now =  new Date().getTime();
    let fireBase;
    let bd;
    const file: File = archive.files[0];
    console.log('file', file);

    let pathFB;
    let rutaBD;

    let imgB: any;

    if (file) {
      let nameLogo = this.generateRandomString();
      this.loading = true;
      fireBase = this.urlLogo_sobre_nosotros_gruposFB;
      bd = this.urlLogo_sobre_nosotros_grupos;

      pathFB = fireBase + '/logoGeneral' + nameLogo;
      // rutaBD = bd+'logoGeneral'+nameLogo;
      await this.fireService.deleteImage(configuracion.imgLogo);
      let path1 = await this.fireService.uploadImage(file, pathFB);
      console.log('path 1', path1);

      configuracion.imgLogo = path1;
      console.log('ssssss ', configuracion);

      //  imgB = await  this.fireService.uploadImage(file, pathFB);
      //   console.log('imgB', imgB);
      //   configuracion.imgLogo = imgB;

      //  await this.fireService.uploadImage(file ,pathFB).then((data:any)=>{
      //     console.log(data);
      //     this.configuracion.imgLogo = data;
      //     this.webService.updateConfiguracion(this.configuracion).then(async (data) => {
      //     await this.getConfiguration();
      //     this.loading = false;
      //     this.alert.alertSuccess('La Imagen ha sido actualizada exitosamente', '');
      //   });
      //   });
      // console.log('PATH', path);

      await this.webService
        .updateConfiguracion(configuracion)
        .then(async (data) => {
          await this.getConfiguration();
          this.loading = false;
          this.alert.alertSuccess(
            'La Imagen ha sido actualizada exitosamente',
            ''
          );
          this.closeModal(true, '#modalUpload');
        });
    }
  }

//  NUEVO METODO UPLOAD IMG

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
        this.updateConfiguration(this.configuracion);
      }
    }
  }

  onSelecLogo2(event){
    if (event.target.files.length > 0) {
      this.fileLogo2 = event.target.files[0];
      // console.log(this.fileLogo2);
      if (this.fileLogo2.type.startsWith("application/")) {
        this.alert.alertDanger('Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.','');
        this.fileLogo2 = {};
        console.log(this.fileLogo2);
        if (Object.keys(this.fileLogo2).length === 0) {
            this.flagFileLogo2 = false;
        }
       
      } else {
        this.flagFileLogo2 = true;
        console.log('imagen lista',this.fileLogo2 );
      }
    }
  }

  saveLogo2(form:any){
    this.updateInformation(this.information)
    this.closeModal(true, "#modalUploadL2")
  }


}
