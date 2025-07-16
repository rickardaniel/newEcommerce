import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { MigrationService } from '../../../services/migration.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { UtilsService } from '../../../services/utils.service';
import { NgxLoadingModule } from 'ngx-loading';

@Component({
  selector: 'app-servicios-inicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxLoadingModule],
  templateUrl: './servicios-inicio.component.html',
  styleUrl: './servicios-inicio.component.scss'
})
export default class ServiciosInicioComponent {
// --------------- BOTONES DE ACCESO ----------------
botones: any = [];
prodServicios: any = [];
// loadingAll = false;
loading=false;
tipoBtn: any;
element: any;
configuracion:any={};
information:any={};
// --------------- SERCIVIOS PAG INICIO ----------------
servicios: any = [];
fileService: any;
flagFileService = false;
flagPicture = false;
urlBase = environment.firebaseUrl;
sistema = environment.empresa;
empresa = environment.empresa;
idEmpresa = environment.idShop;
public buttonsPay: any = {};

constructor
(
  private webService: ServiceService,
  private alert: AlertService,
  private util: UtilsService,
  // private storage: AngularFireStorage,
  private fireService: MigrationService,

) 
{

}
async ngOnInit() {
  await this.getBotones();
  await this.getServicios();
  await this.webService.visibilityPurchaseButtons(this.configuracion, {}).then((resbtn: any) =>{
    this.buttonsPay = resbtn;
  });
}

formCrearServicio = new FormGroup({
  nombre : new FormControl('', Validators.required), 
  detalle : new FormControl('',Validators.required), 
  imagen : new FormControl(''), 
  colorLetra : new FormControl('#ffff'), 
})
formCrearButton = new FormGroup({
  titulo : new FormControl('', Validators.required), 
  url : new FormControl('',Validators.required), 
  colorBoton : new FormControl('#000'), 
  colorLetra : new FormControl('#ffff'), 
})


    //  ======================== CRUD BOTONES PAG INICIO ========================

    getBotones(){
      this.loading=true;
      this.webService.getGeneral('botonesAcceso/'+this.idEmpresa).subscribe((data:any)=>{
        console.log('data',data);
         if(data.rta){
          this.botones= data.data;
          this.loading=false;

         }else{
          this.botones = [];
          this.loading=false;

         }
      })
    }
  

  deleteBtn(element){
    this.element= element;
    Swal.fire({
      title: "Eliminar botón",
      text: "¿Está seguro de eliminar el botón?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#404040",
      cancelButtonColor: "#d1001f",
      confirmButtonText: "Si",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteButton();
      }
    });
  }

  deleteButton(){
    this.webService.deleteGeneral('botonesAcceso/'+this.element.id).subscribe((data:any)=>{
      console.log('data',data);
        if(data.rta){
          this.alert.alertSuccess('Botón eliminado ', '');

          this.getBotones();
        }
    })
  }
  deleteBtnService(element){
    this.element= element;
    Swal.fire({
      title: "Eliminar Servicio",
      text: "¿Está seguro de eliminar el servicio?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#404040",
      cancelButtonColor: "#d1001f",
      confirmButtonText: "Si",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteButtonServ(element);
      }
    });
  }

  async  deleteButtonServ(element){
    this.loading=true;
    // await  this.deleteFileFirebase(this.formCrearServicio.controls['imagen'].value);
    await  this.fireService.deleteImage(element.imagen);

      this.webService.deleteGeneral('productoservicios/'+this.element.id).subscribe((data:any)=>{
        console.log('data',data);
          if(data.rta){
            this.alert.alertSuccess('Servicio eliminado ', '');
            this.loading=false;

            this.getServicios();
          }
      })
    }

  redirecTO(url){
    window.open(url, '_blank')
  }

   // ==================================================================================================

   //  ======================== CRUD BOTONES PAG INICIO ========================

   getServicios(){
    this.webService.getGeneral('productoservicios/'+this.idEmpresa).subscribe((data:any)=>{
      console.log('servicios -=> ',data);
      if(data.rta){
        this.servicios= data.data;
       }else{
        this.servicios = [];
       }
    })
  }

  closeModalBtn(){
    // this.modalCtrl.dismissAll();
    this.formCrearButton.reset();
  }

  crearNuevoBoton(form){
    this.loading=true;
    form.id_empresa= environment.idShop;
    this.webService.postGeneral('botonesAcceso/insert', form).subscribe((data:any)=>{
      console.log('data',data);
      if(data.rta){
        this.loading=false;
        // this.modalCtrl.dismissAll();
        this.closeModal(true, '#modalNewBtn');

        this.alert.alertSuccess('Botón creado exitosamente', '');

        this.getBotones();
      }      
    })
  }

  editNuevoBoton(form){
    this.loading=true;
    form.id = this.element.id;
    form.id_empresa= environment.idShop;
    this.webService.postGeneral('botonesAcceso/update', form).subscribe((data:any)=>{
      console.log('data',data);
      if(data.response){
        this.loading=false;
        // this.modalCtrl.dismissAll();
        this.closeModal(true, '#modalNewBtn');
        this.alert.alertSuccess('Información actualizada exitosamente', '');

        this.getBotones();

      }      
    })
  }

  closeModalServicio(){
    // this.modalCtrl.dismissAll();
    this.formCrearServicio.reset();
    this.fileService={};
    this.flagPicture=false;

  }

  selectImgService(event){
    if (event.target.files.length > 0) {
      this.fileService = event.target.files[0];
      console.log(this.fileService);
      if (this.fileService.type.startsWith("application/")) {

        this.alert.alertDanger('Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.', '');

        this.fileService = {};
        console.log(this.fileService);
        if (Object.keys(this.fileService).length === 0) {
            this.flagFileService = false;
        }
       
      } else {
        if(this.tipoBtn!='create'){
          this.flagPicture= false;
        }
        this.flagFileService = true;
        // this.updateInformation(this.information);
      }
    }
    
  }

  changePicture(flag){
    this.flagPicture=flag;
  }

  async  crearNuevoServicio(form){
    this.loading=true;
    form.id_empresa= environment.idShop;
    if(!this.flagFileService){
      form.imagen = null;
    }else{
      let img = await this.uploadImgService(this.fileService);
      form.imagen = img;
    }

    this.webService.postGeneral('productoservicios/insert', form).subscribe((data:any)=>{
      console.log('data',data);
      if(data.rta){
        this.formCrearServicio.reset();
        this.closeModal(true, '#modalNewServ');
        this.alert.alertSuccess('Servicio creado exitosamente', '');
        this.loading=false;
        this.getServicios();
      }      
    })
  }

  async uploadImgService(file){
    // let randomC = this.fireService.generateRandomString(); 
    let rutaC = `${this.empresa}/img_service/${file.name
    }`; 
    let rutaCBD = `img_service%2F${file.name}`
    await this.fireService
    .uploadImage(file, rutaC)
    .then((data: any) => {
      // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
    });
    console.log('rutaCBD', rutaCBD);
    
    return rutaCBD;
  }

  async editNuevoServicio(form){
    this.loading=true;
    form.id = this.element.id;
    form.id_empresa= environment.idShop;
    console.log('entra aqu[i === > ', this.flagPicture);

    if(this.flagPicture){
      console.log('entra aqu[i === > ',true);
      
      // let img = await this.uploadImgService(this.fileService);
      form.imagen = this.formCrearServicio.controls['imagen'].value; 
    }else{
      console.log('entra aqu[i === > ',false);

      // await  this.deleteFileFirebase(this.formCrearServicio.controls['imagen'].value);
      await  this.fireService.deleteImage(this.formCrearServicio.controls['imagen'].value);
      let img = await this.uploadImgService(this.fileService);
      form.imagen = img;
    }
    this.webService.postGeneral('productoservicios/update', form).subscribe((data:any)=>{
      console.log('data',data);
      if(data.response){
        // this.modalCtrl.dismissAll();
        this.closeModal(true, '#modalNewServ');
        this.alert.alertSuccess('Información actualizada exitosamente', '');
        this.loading=false;

        this.formCrearServicio.reset();
        this.getServicios();

      }      
    })
  }

    // METODOS MODALES
    closeModal(flag: boolean, name: string) {
      this.formCrearButton.reset();
      this.formCrearServicio.reset();
      this.fileService={};
      this.flagPicture=false;
      let modal = this.util.createModal(name);
  
      if (flag) {
        modal.hide();
      } else {
        modal.hide();
      }
    }
  
    openModal(name, tipo, element) {
      this.tipoBtn=tipo;
      this.element=element;
      if(tipo=='create'){
  
      }else{
        this.formCrearButton.setValue({
          'titulo':  this.element.titulo,
          'url': this.element.url ,
          'colorBoton': this.element.colorBoton ,
          'colorLetra':this.element.colorLetra  ,
        })
      }
      let modal = this.util.createModal(name);
      modal.show();
    }

    openModalS(name , tipo, element){
      this.tipoBtn = tipo;
      this.element = element;
      if (tipo == "create") {
        this.flagPicture = false;
      } else {
        this.formCrearServicio.setValue({
          nombre: this.element.nombre,
          detalle: this.element.detalle,
          imagen: this.element.imagen,
          colorLetra: this.element.colorLetra,
        });
      }
      this.flagPicture = true;
      let modal = this.util.createModal(name);
      modal.show();
    }



}
