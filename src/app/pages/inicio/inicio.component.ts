import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { ServiceService } from '../../services/service.service';
import { environment } from '../../environments/environment';
import { UtilsService } from '../../services/utils.service';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../../pipes/safe.pipe';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NgxLoadingModule } from 'ngx-loading';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule,SafePipe, NgxLoadingModule],
  // providers:[SafePipe],
  // declarations:[],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {
  //Variables Globales
  urlBase= environment.firebaseUrl;
  idEmpresa = environment.idShop;
  idShop = environment.idShop;

  information:any=[];
  configuracion:any=[];
  companyNane:any;
  textoValores:any;
  urlPortada:any;
  // ---- Video ----
  videoY:any;
  video2:any;
  // --- Portada ---
  botones:any=[];
  servicios:any=[];
  flagLoader=false;
  
  constructor
  (
    private webService: ServiceService,
    private util: UtilsService
  )
  {
  }

   async ngOnInit(){
    await this.getInformacion();
    await this.getConfiguracion();
    await this.getBotones();
    await this.getServicios();
  }

  async getInformacion() {
    this.flagLoader=true;

    await this.webService.getGeneral(`informacions/${this.idEmpresa}`).subscribe((resinfo: any) => {
      this.information=resinfo[0];
      console.log('information.mision',this.information); 
      this.companyNane = resinfo[0]?.nombre;
      this.textoValores = resinfo[0]?.valores;
      this.urlPortada = this.urlBase+this.configuracion?.imgFooter+'?alt=media'
      let color  = this.information.colorLetraSlogan;
      let colorLetraSecundario  = this.configuracion.colorLetraSecundario;
      console.log('color', color); 
      document.documentElement.style.setProperty('--color-font-portada', color);
     
      document.documentElement.style.setProperty('--color-letter-secondary', colorLetraSecundario);
      let urlV = this.util.obtenerCodigoVideo( this.information.video)
      let urlV2 = this.util.obtenerCodigoVideo( this.information.youtube)
      let url = 'https://www.youtube.com/embed/'+urlV;    
      let url2 = 'https://www.youtube.com/embed/'+urlV2;    
      this.videoY =  url ;
      this.video2 =  url2 ;

    });
  }

  async getConfiguracion() {
    this.flagLoader=true;
    await this.webService.getGeneral(`configuracion/${this.idEmpresa}`).subscribe( {
      next: (resp: any) => {
        console.log('resp',resp);      
     this.configuracion = resp[0];
      this.urlPortada = this.urlBase+this.configuracion?.imgFooter+'?alt=media'
      let color  = this.configuracion.colorPrincipal;
      let colorLetra  = this.configuracion.colorLetra;
      console.log('colorLetra', colorLetra); 

      document.documentElement.style.setProperty('--dynamic-color', color);
      document.documentElement.style.setProperty('--color-letter-primary', colorLetra);

      }
    });
  }
  // async getConfiguracion() {
  //   await this.webService.getGeneral(`configuracion/${this.idEmpresa}`).subscribe((data: any) => {
 
     

  //     await this.isAutenticatedClient(this.configuracion).then(async (resauth: any) => {
  //       // Obtener productos del carrito y su total
  //       if (resauth.rta == true) {
  //         await this.webService.getproductsCart({ id_cliente: resauth.data.PersonaComercio_cedulaRuc }).then(async (resprod: any) => {
  //           this.cartProducts = {
  //             number: resprod.data.length,
  //             total: await this.webService.calculateTotalCartProducts(resprod.data)
  //           }
  //         });
  //       }
  //     });
  //   });
  // }
 async getBotones(){
  this.flagLoader=true;
    this.webService.getGeneral(`botonesAcceso/${this.idEmpresa}`).subscribe({
      next: (resp: any) => {
        console.log('resp', resp);
        if(resp.rta){
          this.botones= resp.data;
          console.log('data',this.botones);
          let color  = this.botones[0]?.colorBoton;
          document.documentElement.style.setProperty('--color-btn', color);
  
         }else{
          this.botones = [];
          let color  = this.configuracion?.colorPrincipal;
          document.documentElement.style.setProperty('--color-btn', color);
         }
        
      },
      error: (err: any) => {
        this.flagLoader = false;
        console.log(err);
      },
      complete: () => {
        this.flagLoader = false;
        console.log('sea acab[o esta fritada');
      },
    })
  }
 async getServicios(){
  this.flagLoader=true;
    this.webService.getGeneral(`productoservicios/${this.idEmpresa}`).subscribe({
      next: (resp: any) => {
        console.log('resp', resp);
        if(resp.rta){
          this.servicios=resp.data;
        }
        
      },
      error: (err: any) => {
        this.flagLoader = false;
        console.log(err);
      },
      complete: () => {
        this.flagLoader = false;
        console.log('sea acab[o esta fritada');
      },
    })
  }

  redirecTO(url){
    window.open(url, '_blank')
  }

  isEmpty(obj: any): boolean {
    return Object.keys(obj).length === 0;
  }
  transformText(texto:string){
    return this.util.cadenaByPuntos(texto);
   }



}
