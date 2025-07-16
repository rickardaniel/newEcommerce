import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../../services/alert.service';
import { ServiceService } from '../../../services/service.service';
import { MigrationService } from '../../../services/migration.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-admin-grupos',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxLoadingModule, ReactiveFormsModule],
  templateUrl: './admin-grupos.component.html',
  styleUrl: './admin-grupos.component.scss'
})
export default class AdminGruposComponent {
  public searchProd = '';
  public groupsFree = [];
  public groupsFree2 = [];
  public grupoSelected:any = [];
  public grupoSelect:any = [];
  imagen:any;
  fileImg:any;
  flagfileImg:any;
  loading=false;
  empresa = environment.empresa;
  urlBase = environment.firebaseUrl;
  sistema = environment.empresa;
  urlBilling = environment.urlBilling;
  urlLogo_sobre_nosotros_grupos = 'urlLogo_sobre_nosotros_grupos%2F';
  urlLogo_sobre_nosotros_gruposFB = 'urlLogo_sobre_nosotros_grupos';
  typeImg:any;


  constructor
  (
    private alert: AlertService,
    private webService: ServiceService,
    private util: UtilsService,
    private fireService: MigrationService
  )
  {
  }

 async ngOnInit(){
    await this.getGroupFree();
  }

  async searchGroupName(event) {
    let texto =  event.target.value;
    if(texto){
      texto = texto.toLowerCase();
      this.groupsFree = this.groupsFree2.filter(item=>{
         return (item.nombre.toLowerCase()) 
                 .includes(texto)
     })
    }else{
      this.groupsFree = this.groupsFree2 ;
    }
}
  
  async getGroupFree() {
    console.log('ENTRA A CARGAR PRODUCTOS');

    this.loading = true;
      await (await this.webService.getGruposService(this.urlBilling, 'all')).subscribe(async (resgrupos: any) => {
        console.log('resgrupos',resgrupos);
        
      
        if (!resgrupos.error) {
          if (resgrupos.rta == true) {
            for (let g of resgrupos.data) {
              g.vista_web = parseInt(g.vista_web);
              g.ocult = false;
            }
            this.groupsFree = await this.webService.orderObjectsAsc(resgrupos.data);
            this.groupsFree2 = await this.webService.orderObjectsAsc(resgrupos.data);
            this.loading = false;
          } else {
            this.alert.alertWarning('No se ha encontrado categorias', '');
          }
        } else {
          this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
        }
      });
  }

  async updateAtributesGroup(e, group, type) {
    this.loading = true;
    let data = {} as any;
    if (type == 'vista_web') {
      data = {
        tabla: 'billing_productogrupo',
        id: 'codigo',
        valor_id: group.codigo,
        atributo: 'vista_web',
        valor_atributo: e.target.checked ? 1 : 0
      }
    }
    if (type == 'descripcion') {
      data = {
        tabla: 'billing_productogrupo',
        id: 'codigo',
        valor_id: group.codigo,
        atributo: 'descripcion',
        valor_atributo: e
      }
    }

      await this.webService.updateAtributeGroup(this.urlBilling, data).then(async (resupd: any) => {
        this.loading = false;
        if (!resupd.error) {
          if (resupd.rta == true) {
            this.alert.alertSuccess('Información actualizada exitosamente', '');
            
          } else {
            this.alert.alertDanger('Error al actualizar, intente nuevamente', '');
          }
        } else {
          this.alert.alertDanger('Error en el servidor, intente nuevamente', '');
        }
      });
  }


  async openModal(name: any, group) {
    // this.grupoSelected = group;
    console.log(group.idgrupo);
    this.grupoSelected = {} as any;
    this.loading = true;
      await this.webService.getSubgruposService2(this.urlBilling, group.idgrupo).then(async (ressub: any) => {
        group.subgroups = ressub.data;
        console.log('ressub', ressub);    
        console.log('group', group.subgroups );    
      });

    this.loading = false;
    this.grupoSelected = group;
    console.log('group selected', this.grupoSelected);
    
    if (this.grupoSelected.subgroups.viewSubgrupo == true) {
        let modal = this.util.createModal(name);
        modal.show(); 
    } else {
      this.alert.alertWarning('El Grupo seleccionado, No cuenta con subgrupos', '');
    }
    

   
  }
  openModalNormal(name){
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

    verImagen(name,url){
      this.imagen = url;
      let modal = this.util.createModal(name);
      modal.show();
    }
    verImagen2(name,url){
      this.imagen = url;
      let modal = this.util.createModal4(name);
      modal.show();
    }

    changePicture(group, name, type){
      console.log('GRUPO', group);
      this.typeImg=type;
      this.imagen = group.img;
      this.grupoSelect = group;
      if(type=='Groups'){
        let modal = this.util.createModal2(name);
        modal.show();
      }else{
        let modal = this.util.createModal4(name);
        modal.show();
      }

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

  async  uploadImage(type){
    this.loading=true;
      let fireBase;
      let bd;
      let pathFB;
      let rutaBD;
        if(type == 'Groups'){
          
          fireBase = this.urlLogo_sobre_nosotros_gruposFB;
          bd = this.urlLogo_sobre_nosotros_grupos;
          let nameGrupo = this.generateRandomString()
          pathFB = this.empresa+'/'+fireBase+'/'+'Grupo'+this.grupoSelect.idgrupo+'_'+nameGrupo;
          rutaBD = bd+'Grupo'+this.grupoSelect.idgrupo+'_'+nameGrupo;
          // Delete Before IMG
          this.fireService.deleteImage(this.grupoSelect.img);
          // Compress new Img
          let fileCompress;
          await this.fireService.compressFile(this.fileImg).then(async(res:any)=>{
            fileCompress = await res;
          });
  
          // Upload new Image Compress
          await this.fireService.uploadImage(fileCompress, pathFB).then((data: any) => {
            // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
          });
            let query = {
              "tabla": "billing_productogrupo",
              "id": "codigo",
              "valor_id": this.grupoSelect.codigo,
              "atributo": "img",
              "valor_atributo": rutaBD
            }

            await this.webService.postGeneral2(this.urlBilling+'update_atributo_tabla', query).subscribe(async (resupd: any) => {
              console.log(' *** ',resupd);
      
              if (resupd.rta == true) {
                // this.deleteFileFirebase();
                this.loading=false;
                await this.getGroupFree();
                this.alert.alertSuccess('Imagen del grupo actualizada exitosamente', '');
                this.closeModal(true,'#modalPicture')
              } else {
                this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');
              }
            });
          

        }else{
          console.log('CASO SUBGRUPO IMG');
          fireBase = this.urlLogo_sobre_nosotros_gruposFB;
        bd = this.urlLogo_sobre_nosotros_grupos;
        let nameSubGrupo = this.generateRandomString()
        pathFB = this.empresa+'/'+fireBase+'/'+'subgrupo'+this.grupoSelect.id_sub+'_'+nameSubGrupo;
        rutaBD = bd+'subgrupo'+this.grupoSelect.id_sub+'_'+nameSubGrupo;
        this.fireService.deleteImage(this.grupoSelect.img);
        let fileCompress;
        await this.fireService.compressFile(this.fileImg).then(async(res:any)=>{
          fileCompress = await res;
        });

        await this.fireService.uploadImage(fileCompress, pathFB).then((data: any) => {
          // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
        });

        let query = {
          "tabla": "subgrupo",
          "id": "id_sub",
          "valor_id": this.grupoSelect.id_sub,
          "atributo": "img",
          "valor_atributo": rutaBD
        }

        await this.webService.postGeneral2(this.urlBilling+'update_atributo_tabla', query).subscribe(async (resupd: any) => {
          console.log(' *** ',resupd);
  
          if (resupd.rta == true) {
            this.grupoSelect.img = rutaBD
            // this.deleteFileFirebase();
            await this.getGroupFree();
            this.alert.alertSuccess('Imagen del Subgrupo actualizada exitosamente', '');
            this.closeModal(true,'#modalPicture')
          } else {
            this.alert.alertDanger('Ha ocurrido un error, intente nuevamente', '');

          }
        });
          
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

  async uploadAnyImg(file){
    // pathFB = this.empresa+'/'+fireBase+'/'+'Grupo'+this.grupoSelect.idgrupo+'_'+nameGrupo;
    // rutaBD = bd+'Grupo'+this.grupoSelect.idgrupo+'_'+nameGrupo;
    let nameLogo = this.generateRandomString();
    let rutaC = `${this.empresa}/banner/${nameLogo}`;
    let rutaCBD = `banner%2F${nameLogo}`;
    await this.fireService.uploadImage(file, rutaC).then((data: any) => {
      // bdC = this.fireService.cambiarUrlFireBtoDataB(data);
    });
    console.log('rutaCBD', rutaCBD);

    return rutaCBD;
  }


  // ================================================================= CREAR GRUPO Y SUBGRUPO ==============================================================
  formCrearGrupo = new FormGroup({
    nombre : new FormControl('', Validators.required),
    descripcion: new FormControl('', Validators.required),
    vista_web: new FormControl(1),
    vista_sistema:new FormControl(1),
    meses_garantia: new FormControl(0),
    activo:new FormControl(1),
    parent:new FormControl(0),
    prodgp_factor_conv: new FormControl(1.00),
    orden:new FormControl(null),
    img: new FormControl(null)
  })

   async crearGrupo(form){
    console.log('form', form);
    
    this.loading = true;
    let datos = {
      "grupo":form,
      "precios":[]
    }

    this.webService.postGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/register_new_group`, datos).subscribe((data:any)=>{
      this.loading = false;
      if(data.rta){
         this.alert.alertSuccess('', data.msg);
      }
      this.closeModal(true,'#modalCrearGrupo' );
      // this.getGrupos(); 
      this.getGroupFree();

  })
}

  formCrearSubGrupo = new FormGroup({
    nombre :new FormControl('', Validators.required),
    id_grupo: new FormControl(''),
    estado: new FormControl(1),
    img: new FormControl(null),
    vista_web: new FormControl(1),
    orden: new FormControl(null),
})

 crearSubGrupo(form:any){
    console.log (form);
    this.loading = true;
    let datos = {
      "subgrupo":form,
    }
    if(form.id_grupo == ''){
         this.alert.alertDanger('', 'Debe seleccionar un grupo');
      this.loading = false;
    }else {
          this.webService.postGeneral2(`https://sofpymes.com/${this.empresa}/common/movil/register_new_subgroup`, datos).subscribe((data:any)=>{
          ////console.log (data);
          this.loading = false;
          if(data.rta){
            this.alert.alertSuccess('', data.msg);

          }
      this.closeModal(true,'#modalCrearSubGrupo' );
          this.getGroupFree();
      }) 
    }
  } 


}
