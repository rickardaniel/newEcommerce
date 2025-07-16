import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { routes } from '../app.routes';
import { ServiceService } from '../services/service.service';
import { Modal, ModalInterface, ModalOptions } from 'flowbite';
import { environment } from '../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export default class AdminComponent {
  flagLoader=false;
  business:any=[];
	closeResult = '';
  configuracion:any;
  information:any;
  urlPortada:any;
  urlBase:any;
  idEmpresa=environment.idShop;
  urlB=environment.firebaseUrl;
  public menuItems = routes
  .map( (route) => route.children ?? [])
  .flat()
  .filter((route)  => route && route.path)
  .filter((route)  => !route.path?.includes(':'))
  constructor
  (
    private renderer: Renderer2,
    private el: ElementRef,
    private ruta: Router,
    private webService: ServiceService
    // @Inject(DOCUMENT) public document: Document,
  )
  {
  }
  
async ngOnInit(){
   this.openNav();
   this.getConfiguracion();
   this.getInformacion();

}
openNav(): void {

    const sidebar = this.el.nativeElement.querySelector("aside");
    const maxSidebar = this.el.nativeElement.querySelector(".max");
    const miniSidebar = this.el.nativeElement.querySelector(".mini");
    const maxToolbar = this.el.nativeElement.querySelector(".max-toolbar");
    const roundout = this.el.nativeElement.querySelector(".roundout");
  
    const logo = this.el.nativeElement.querySelector(".logo");
    // const sun = this.el.nativeElement.querySelector(".sun");
    // const moon = this.el.nativeElement.querySelector(".moon");
    const content = this.el.nativeElement.querySelector(".content");
    
if (sidebar.classList.contains('-translate-x-48')) {
  this.renderer.removeClass(sidebar, '-translate-x-48');
  this.renderer.addClass(sidebar, 'translate-x-none');
  this.renderer.removeClass(maxSidebar, 'hidden');
  this.renderer.addClass(maxSidebar, 'flex');
  this.renderer.removeClass(miniSidebar, 'flex');
  this.renderer.addClass(miniSidebar, 'hidden');
  this.renderer.removeClass(maxToolbar, 'translate-x-24');
  this.renderer.removeClass(maxToolbar, 'scale-x-0');
  this.renderer.addClass(maxToolbar, 'translate-x-0');
  this.renderer.removeClass(logo, 'ml-12');
  this.renderer.removeClass(content, 'ml-12');
  this.renderer.addClass(content, 'ml-12');
  this.renderer.addClass(content, "md:ml-60");
  } else {
    //console.log('ENTRA CASO 2');
    // this.varSidebar=false;
      // mini sidebar
      this.renderer.addClass(sidebar, '-translate-x-48');
      this.renderer.removeClass(sidebar, 'translate-x-none');
      this.renderer.addClass(maxSidebar, 'hidden');
      this.renderer.removeClass(maxSidebar, 'flex');
      this.renderer.addClass(miniSidebar, 'flex');
      this.renderer.removeClass(miniSidebar, 'hidden');
      this.renderer.addClass(maxToolbar, 'translate-x-24');
      this.renderer.addClass(maxToolbar, 'scale-x-0');
      this.renderer.removeClass(maxToolbar, 'translate-x-0');
      this.renderer.addClass(logo, 'ml-12');
      this.renderer.removeClass(content, 'ml-12');
      this.renderer.addClass(content, 'ml-12');
      this.renderer.removeClass(content, "md:ml-60");
  }
}

async getConfiguracion() {
  await this.webService.getConfiguracion().then(async (data: any) => {
    console.log('data', data);
    
    this.configuracion = data[0];
    this.urlPortada = this.urlBase+this.configuracion?.imgFooter+'?alt=media'
    let color  = this.configuracion.colorPrincipal;
    let colorLight0  = this.webService.hexToRgba(color, 0.1);
    let colorLight  = this.webService.hexToRgba(color, 0.3);
    let colorLight1  = this.webService.hexToRgba(color, 0.5);
    let colorLight2  = this.webService.hexToRgba(color, 0.7);
    document.documentElement.style.setProperty('--dynamic-color', color);
    document.documentElement.style.setProperty('--ligther-color0', colorLight0);
    document.documentElement.style.setProperty('--ligther-color', colorLight);
    document.documentElement.style.setProperty('--ligther-color1', colorLight1);
    document.documentElement.style.setProperty('--ligther-color2', colorLight2);
  });
}
async getInformacion() {
  await this.webService.getGeneral(`informacions/${this.idEmpresa}`).subscribe((resinfo: any) => {
    this.information=resinfo[0];
    // console.log('information.mision',this.information); 
    let color  = this.information?.colorLetraSlogan;
    let colorLetraSecundario  = this.configuracion?.colorLetraSecundario;
    document.documentElement.style.setProperty('--color-font-portada', color); 
    document.documentElement.style.setProperty('--color-letter-secondary', colorLetraSecundario);
  });
}

createModal(modal:any){

const $modalElement: HTMLElement |any  = document.querySelector(modal);

const modalOptions: ModalOptions = {
  // placement: 'bottom-right',
  backdrop: 'static',
  // backdropClasses:
  //     'bg-blue-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
  closable: false,
};

const modalF: ModalInterface = new Modal($modalElement,modalOptions);
return modalF;
// modalF.show();
}


closeModal(flag:boolean, name:string){
let modal = this.createModal(name)

if(flag){
  this.ruta.navigateByUrl('login');
  localStorage.removeItem('uid');
  localStorage.removeItem('user');
}else{
 modal.hide();
}

// this.modalService.show();
// modalF.show();
}

openModal(name:any){
let modal = this.createModal(name);
modal.show();
}

seeProfileBussines(){
this.ruta.navigateByUrl('dashboard/configuracion')
}

redirecto(){
 this.ruta.navigateByUrl('/ecommerce') 
}


}
