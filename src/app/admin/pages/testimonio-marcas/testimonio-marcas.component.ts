import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { UtilsService } from '../../../services/utils.service';
import Swal from 'sweetalert2';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { CommonModule } from '@angular/common';
import { MigrationService } from '../../../services/migration.service';
import { NgxLoadingModule } from 'ngx-loading';

@Component({
  selector: 'app-testimonio-marcas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxLoadingModule],
  templateUrl: './testimonio-marcas.component.html',
  styleUrl: './testimonio-marcas.component.scss'
})
export default class TestimonioMarcasComponent implements OnInit {
  tipoBtn: any;
  element: any;
  empresa = environment.empresa;
  idEmpresa = environment.idShop;
  flagPicture = false;
  flagPicture2 = false;
  flagPicture3 = false;
  testimonios: any = [];
  marcas: any = [];
  urlBase = environment.firebaseUrl
  loadingAll=false;
  loading=false;

  flagFileMarca = false;
  flagFileLogo = false;
  flagFileImagen = false;
  fileMarca: any;
  fileLogo: any;
  fileImagen: any;
  constructor
  (
    private util: UtilsService,
    private webService: ServiceService,
    private alert: AlertService,
    private fireService: MigrationService,

  )
  {

  }

  async ngOnInit() {
    await this.getMarcas();
    await this.getTestimonios();
  }



  formCrearTestimonio = new FormGroup({
    logo: new FormControl(''),
    titulo: new FormControl('', ),
    descripcion: new FormControl('',),
    autor: new FormControl(''),
    cargo: new FormControl(''),
    imagen: new FormControl(''),
    id_empresa: new FormControl(this.idEmpresa),

  })
  formCrearMarca = new FormGroup({
    logo: new FormControl('', Validators.required),
    nombre: new FormControl(''),
    detalle: new FormControl(null),
    id_empresa: new FormControl(this.idEmpresa),
  })
 
 
  openModal(name, tipo, element) {
    this.tipoBtn=tipo;
    this.element=element;
    if(tipo=='create'){
      this.flagPicture2 = false;

    }else{
      console.log('ACA ===> ', tipo);
      this.formCrearMarca.controls['logo'].setValue('');
 
      this.formCrearMarca.setValue({
        nombre: this.element.nombre,
        detalle: this.element.detalle,
        logo: '',
        id_empresa: this.element.id_empresa,
      })
    }
    this.flagPicture2 = true;

    let modal = this.util.createModal(name);
    modal.show();
  }

  openModalS(name, tipo, element) {
    this.tipoBtn = tipo;
    this.element = element;
    if (tipo == "create") {
      this.flagPicture = false;
      this.flagPicture3 = false;
    } else {
      console.log('element',  this.element);
      
      this.formCrearTestimonio.controls['logo'].setValue('');
      this.formCrearTestimonio.controls['imagen'].setValue('');

      this.formCrearTestimonio.setValue({
        // logo: this.element.logo,
        logo: '',
        titulo: this.element.titulo,
        descripcion: this.element.descripcion,
        autor: this.element.autor,
        cargo: this.element.cargo,
        // imagen: this.element.imagen,
        imagen: '',
        id_empresa: this.element.id_empresa,
      });
    }
    this.flagPicture = true;
    this.flagPicture3 = true;
    let modal = this.util.createModal(name);
    modal.show();
  }
  openModalT(name, tipo, element) {
    this.tipoBtn = tipo;
    this.element = element;
    if (tipo == "create") {
      this.flagPicture = false;
      this.flagPicture3 = false;
    } else {
      console.log('element',  this.element);
      
      this.formCrearTestimonio.controls['logo'].setValue('');
      this.formCrearTestimonio.controls['imagen'].setValue('');

      this.formCrearTestimonio.setValue({
        logo: '',
        titulo: this.element.titulo,
        descripcion: this.element.descripcion,
        autor: this.element.autor,
        cargo: this.element.cargo,
        imagen: '',
        id_empresa: this.element.id_empresa,
      });
    }
    this.flagPicture = true;
    this.flagPicture3 = true;
    let modal = this.util.createModal(name);
    modal.show();
  }

  redirecTO(url) {
    window.open(url, '_blank')

  }

  eliminarMarca(element){
    Swal.fire({
      title: "Eliminar Marca",
      text: "¿Está seguro de eliminar la marca?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#404040",
      cancelButtonColor: "#d1001f",
      confirmButtonText: "Si",
      cancelButtonText: "No"
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadingAll=true;

        this.webService.deleteGeneral('marca/'+element.id).subscribe((data:any)=>{
          if(data.rta){
            this.alert.alertSuccess('Marca eliminada ', '');
            this.loadingAll=false;
            this.getMarcas();
          }
        })
      }
    });

  }


    //  ======================== GET MARCAS Y TESTIMONIOS  ========================

    getMarcas() {
      this.webService.getGeneral('marca/all/'+this.idEmpresa).subscribe((data: any) => {
        console.log('marcas -=> ', data);
        if (data.rta) {
          this.marcas = data.data;
        } else {
          this.marcas = [];
        }
      })
    }

    getTestimonios() {
      this.webService.getGeneral('testimonio/all/'+this.idEmpresa).subscribe((data: any) => {
        console.log('testimonio -=> ', data);
        if (data.rta) {
          this.testimonios = data.data;
        } else {
          this.testimonios = [];
        }
      })
    }

    eliminarTestimonio( element){

      Swal.fire({
        title: "Eliminar Testimonio",
        text: "¿Está seguro de eliminar el testimonio?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#404040",
        cancelButtonColor: "#d1001f",
        confirmButtonText: "Si",
        cancelButtonText: "No"
      }).then((result) => {
        if (result.isConfirmed) {
          this.loadingAll=true;
          this.fireService.deleteImage(this.element.logo)
          this.fireService.deleteImage(this.element.imagen)
          this.webService.deleteGeneral('testimonio/'+element.id).subscribe((data:any)=>{
            if(data.rta){
              this.alert.alertSuccess('Testimonio eliminado ', '');
              this.loadingAll=false;
              this.getTestimonios();
            }
          })
        }
      });
  
    }

    closeModal(flag: boolean, name: string) {
      this.formCrearMarca.reset();
      this.formCrearTestimonio.reset();
      // this.fileService={};
      this.flagPicture=false;
      let modal = this.util.createModal(name);
  
      if (flag) {
        modal.hide();
      } else {
        modal.hide();
      }
    }

      // METODOS CREAR MARCA
  async crearNuevaMarca(form) {
    console.log('form', form);

    this.loadingAll = true;
    form.id_empresa = environment.idShop;
    if (!this.flagFileMarca) {
      form.logo = null;
    } else {
      let img = await this.uploadImgMarca(this.fileMarca);
      form.logo = img;
    }

    this.webService.postGeneral('marca/insert', form).subscribe((data: any) => {
      console.log('data', data);
      if (data.rta) {
        this.loadingAll = false;
        this.formCrearMarca.reset();
        this.closeModal(true, '#createMarca')
        this.alert.alertSuccess('Marca creada exitosamente', '');
        this.getMarcas();
      }
    })

  }

  async editarNuevaMarca(form) {
    console.log('ENTRA EDIT');
    
    this.loadingAll = true;
    form.id = this.element.id;
    form.id_empresa = environment.idShop;
    if (this.flagPicture2) {
      console.log('no cambia logo');
      
      // let img = await this.uploadImgService(this.fileService);
      form.logo = this.element.logo
    } else {
      console.log('si cambia logo', this.element.logo);

      await this.fireService.deleteImage(this.element.logo);
      let img = await this.uploadImgMarca(this.fileMarca);
      form.logo = img; 
    }
    console.log('form que se va', form);
    
    this.webService.postGeneral('marca/update', form).subscribe((data: any) => {
      console.log('data', data);
      if (data.response) {
        this.loadingAll = false;
        // this.modalCtrl.dismissAll();
        // this.toaster.success('Información actualizada exitosamente', '', { timeOut: 2000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
        this.closeModal(true, '#createMarca')
        this.alert.alertSuccess('Marca creada exitosamente', '');
        this.formCrearMarca.reset();
        this.getMarcas();
      }
    })

  }

  selectImgMarca(event) {
    if (event.target.files.length > 0) {
      this.fileMarca = event.target.files[0];
      console.log(this.fileMarca);
      if (this.fileMarca.type.startsWith("application/")) {

        this.alert.alertDanger('Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.', '')
        this.fileMarca = {};
        this.formCrearMarca.controls['logo'].setValue('');
        console.log(this.fileMarca);
        if (Object.keys(this.fileMarca).length === 0) {
          this.flagFileMarca = false;
        }

      } else {
        this.flagFileMarca = true;
        // this.updateInformation(this.information);
      }
    }
  }

  changePicture(flag) {
    this.flagPicture2 = flag;
  }
  changeLogo(flag) {
    this.flagPicture = flag;
  }
  changeImagen(flag) {
    this.flagPicture3 = flag;
  }

  async uploadImgMarca(file) {
    let rutaC = `${this.empresa}/img_marcas/${file.name}`;
    let rutaCBD = `img_marcas%2F${file.name}`
    await this.fireService
      .uploadImage(file, rutaC)
      .then((data: any) => {
      });
    console.log('rutaCBD', rutaCBD);
    return rutaCBD;
  }


  async crearNuevoTestimonio(form) {
    console.log('form', form);

    this.loadingAll = true;
    form.id_empresa = environment.idShop;
    if (!this.flagFileLogo) {
      form.logo = null;
    } else {
      let img = await this.uploadImgTestimonio(this.fileLogo);
      form.logo = img;
    }
    if (!this.flagFileImagen) {
      form.imagen = null;
    } else {
      console.log('DEBE ENTRAR ACA CUANDO AGREGO IMAGEN');
      
      let img2 = await this.uploadImgTestimonio2(this.fileImagen);
      form.imagen = img2;
    }

    console.log('form que lelga');
    
    this.webService.postGeneral('testimonio/insert', form).subscribe((data: any) => {
      console.log('data', data);
      if (data.rta) {
        this.loadingAll = false;
        this.formCrearTestimonio.reset();
        
        this.alert.alertSuccess('Testimonio creado exitosamente', '')
        this.closeModal(true, '#creteTestimonio')
        this.getTestimonios();
      }
    })
  }


  async editarNuevoTestimonio(form) {
    console.log("Element", this.element);
    console.log('fileLogo ', this.fileLogo);
    console.log('fileImagen ', this.fileImagen);
    console.log('flagPicture3 ', this.flagPicture3);
    
      this.loadingAll = true;
      form.id = this.element.id;
      form.id_empresa = environment.idShop;
      if (this.flagPicture) {
        console.log('ENTRA LOGO MISMA');
  
        form.logo = this.element.logo;
      } else {
        console.log('ENTRA LOGO DIFERENTE');
  
        // console.log(this.formCrearTestimonio.controls['logo'].value);
        
        await this.fireService.deleteImage(this.element.logo);
        let img = await this.uploadImgTestimonio(this.fileLogo);
        form.logo = img;
      }
  
      if (this.flagPicture3) {
        console.log('ENTRA IMAGEN MISMA');
        
        // let img = await this.uploadImgService(this.fileService);
        form.imagen = this.element.Imagen;
      } else {
  
        if(this.element.imagen){
          console.log('ENTRA IMAGEN DIFERENTE');
  
          await this.fireService.deleteImage(this.element.imagen);
          let img = await this.uploadImgTestimonio2(this.fileImagen);
          form.imagen = img;
        }else{
          let img = await this.uploadImgTestimonio2(this.fileImagen);
  
          form.imagen = img;
        }
  
      }
      this.webService.postGeneral('testimonio/update', form).subscribe((data: any) => {
        console.log('data', data);
        if (data.response) {
          this.loadingAll = false;
          this.closeModal(true, '#creteTestimonio');
          // this.modalCtrl.dismissAll();
          this.alert.alertSuccess('Información actualizada exitosamente', '');
          this.formCrearTestimonio.reset();
          this.getTestimonios();
  
        }  
      })
    }

    selectImgLogo(event) {
      if (event.target.files.length > 0) {
        this.fileLogo = event.target.files[0];
        console.log(this.fileLogo);
        if (this.fileLogo.type.startsWith("application/")) {
          this.alert.alertDanger('Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.', '')
          this.fileLogo = {};
          this.formCrearTestimonio.controls['logo'].setValue('');
          console.log(this.fileLogo);
          if (Object.keys(this.fileLogo).length === 0) {
            this.flagFileLogo = false;    
          }
  
        } else {
          this.flagFileLogo = true;
        }
      }
    }

    selectImg(event) {
      if (event.target.files.length > 0) {
        this.fileImagen = event.target.files[0];
        console.log(this.fileImagen);
        if (this.fileImagen.type.startsWith("application/")) {
          this.alert.alertDanger('Sólo se permiten archivos de imagen. Por favor, seleccione un formato diferente.', '')

          this.fileImagen = {};
          this.formCrearTestimonio.controls['imagen'].setValue('');
          console.log(this.fileImagen);
          if (Object.keys(this.fileImagen).length === 0) {
            this.flagFileImagen  = false;
          }
        } else {
          this.flagFileImagen = true;
          // this.updateInformation(this.information);
        }
      }
    }

    async uploadImgTestimonio(file) {
      let rutaC = `${this.empresa}/img_testimonio/${file.name}`;
      let rutaCBD = `img_testimonio%2F${file.name}`
      await this.fireService
        .uploadImage(file, rutaC)
        .then((data: any) => {
        });
      console.log('rutaCBD', rutaCBD);
      return rutaCBD;
    }
    async uploadImgTestimonio2(file) {
      let rutaC = `${this.empresa}/img_testimonio/${file.name}`;
      let rutaCBD = `img_testimonio%2F${file.name}`
      await this.fireService
        .uploadImage(file, rutaC)
        .then((data: any) => {
        });
      console.log('rutaCBD', rutaCBD);
      return rutaCBD;
    }
  

}
