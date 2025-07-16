import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ServiceService } from '../../services/service.service';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { UtilsService } from '../../services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss'
})
export class CatalogoComponent implements OnChanges, AfterViewInit {
  urlBase = environment.firebaseUrl;
  idEmpresa = environment.idShop;
  idShop = environment.idShop;
  public empresa: any;
  information: any = [];
  configuracion: any = [];
  //Flag Loader
  flagLoader = false;
  //Variables para grupos
  grupos: any = [];
  @Output() sendGrupos = new EventEmitter<any>();
  @Output() sendConfig = new EventEmitter<any>();
  @Output() return = new EventEmitter<any>();
  @Output() sendGrupSubgrupo = new EventEmitter<any>();
  @Input('flagRender') flagRender: any;
  // @Input('configuracion') configuracion: any;
  public subgrupos: [];
  classSelected = false;
  idGrupoSubGrupo: any;


  constructor(
    private webService: ServiceService,
    public router: Router,
    private util: UtilsService,
  ) {
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDropdownToggles();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // throw new Error('Method not implemented.');
    console.log('changes', changes);
    console.log('configuration', this.configuracion);
    // this.sendConfig.emit(this.configuracion);

    // let color = this.configuracion?.colorPrincipal;
    // let colorLetra = this.configuracion?.colorLetra;
    // console.log('colorLetra', colorLetra);
    // document.documentElement.style.setProperty('--dynamic-color', color);
    // document.documentElement.style.setProperty('--color-letter-primary', colorLetra);
    // const rgbaColor = this.util.hexToRgba(color, 0.1);
    // document.documentElement.style.setProperty('--lighter-tone', rgbaColor);
  }

  async ngOnInit() {
    this.getGeneralConfig();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // console.log('configuration', this.configuracion);
    //  let color = this.configuracion?.colorPrincipal;
    // let colorLetra = this.configuracion?.colorLetra;
    // console.log('colorLetra', colorLetra);
    // document.documentElement.style.setProperty('--dynamic-color', color);
    // document.documentElement.style.setProperty('--color-letter-primary', colorLetra);
    // const rgbaColor = this.util.hexToRgba(color, 0.1);
    // document.documentElement.style.setProperty('--lighter-tone', rgbaColor);

    await this.getConfiguracion();
    await this.getDataEmpresa();
    await this.getInformacion();
  }


  // 0 Config Catalogo
  getGeneralConfig() {

    // Seleccionar los elementos de la DOM
    const sidebarToggle = document.querySelector('.sidebar-toggle') as HTMLElement;
    const sidebarOverlay = document.querySelector('.sidebar-overlay') as HTMLElement;
    const sidebarMenu = document.querySelector('.sidebar-menu') as HTMLElement;
    const main = document.querySelector('.main') as HTMLElement;

    // Verificar que los elementos existen antes de agregar eventos
    if (sidebarToggle && sidebarOverlay && sidebarMenu && main) {
      // Evento para el botón de alternar el sidebar
      sidebarToggle.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        main.classList.toggle('active');
        sidebarOverlay.classList.toggle('hidden');
        sidebarMenu.classList.toggle('-translate-x-full');
      });

      // Evento para el overlay del sidebar
      sidebarOverlay.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        main.classList.add('active');
        sidebarOverlay.classList.add('hidden');
        sidebarMenu.classList.add('-translate-x-full');
      });
    }
  }


  // 1. Get Configuracion 
  async getConfiguracion() {
    await this.webService.getGeneral(`configuracion/${this.idEmpresa}`).subscribe({
      next: (resp: any) => {
        console.log('resp', resp);
        this.configuracion = resp[0];
        this.sendConfig.emit(this.configuracion);

        let color = this.configuracion.colorPrincipal;
        let colorLetra = this.configuracion.colorLetra;
        console.log('colorLetra', colorLetra);
        document.documentElement.style.setProperty('--dynamic-color', color);
        document.documentElement.style.setProperty('--color-letter-primary', colorLetra);
        const rgbaColor = this.util.hexToRgba(color, 0.1);
        document.documentElement.style.setProperty('--lighter-tone', rgbaColor);
      }
    });
  }
  // 2. Get Configuracion 
  async getDataEmpresa() {
    await this.webService.getGeneral('empresa/' + this.idEmpresa).subscribe({
      next: (resp) => {
        console.log(resp);
        this.empresa = resp.data[0];
        this.getGrupos(this.empresa, 1)

      }
    })
  }

  // 3. Get Configuracion 
  async getInformacion() {
    await this.webService.getGeneral(`informacions/${this.idEmpresa}`).subscribe((resinfo: any) => {
      this.information = resinfo[0];
      // console.log('information.mision',this.information); 
      // this.companyNane = resinfo[0]?.nombre;
      let color = this.information.colorLetraSlogan;
      let colorLetraSecundario = this.configuracion.colorLetraSecundario;
      console.log('color', color);
      document.documentElement.style.setProperty('--color-font-portada', color);
      document.documentElement.style.setProperty('--color-letter-secondary', colorLetraSecundario);
    });
  }

  // 4. GET Secctions Grupos
  async getGrupos(empresa, tipo_web) {
    if (tipo_web == 1 || tipo_web == 2 || tipo_web == 4) {
      this.flagLoader = true;
      await (await this.webService.getGruposService(empresa.url_billing, 'filter')).subscribe(async (resCategorias: any) => {
        // console.log('print',resCategorias);
        this.grupos = await resCategorias.data;
        this.sendGrupos.emit(this.grupos);
        if (!resCategorias.error) {
          if (resCategorias.rta == true) {
            await this.getSubgrupos(resCategorias.data, empresa.url_billing).then(async (resSubgrup: any) => {
              // console.log(' =========== > ', resSubgrup);
              await this.webService.orderObjectsAsc(resSubgrup).then((resorder) => {
                // console.log('resorder', resorder);

                resSubgrup.data = this.webService.viewOptionsCatalogueGroup(resorder, empresa.url_billing);
              });
              // this.emitGrupoSubGrupo.emit(resSubgrup);
              // await this.webService.saveTemporaryCatalogue(resSubgrup);
              this.grupos = resSubgrup;
              // for(let g of this.grupos){
              //   this.initializeDropdownToggles(g.codigo);

              // }

              this.ordenarPorNumOrden(this.grupos, 'orden')
              // console.log('grupos', this.grupos);

              // await this.viewButtonPagination2(this.grupos);
            });
          } else {
            // this.toaster.warning('Catálogo de la tienda vacio', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
          }
        } else {
          // this.toaster.error('Error al obtener las categorias', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
        }
      });
      this.flagLoader = false;

    }

    if (tipo_web == 3) {
      console.log("Tienda con 2 BD, codigo se encuentra en proceso");
    }

  }

  async getSubgrupos(grupos, url_billing) {
    this.subgrupos = [];
    this.flagLoader = true;
    console.log('grupos ', grupos);

    const gr = grupos.map(async (group_) => {
      group_.nombre = this.webService.convertStringTypeSentence(group_.nombre);

      await (await this.webService.getSubgruposService(url_billing, group_.idgrupo)).subscribe(async (resSubgrup: any) => {
        group_.subgrupos = resSubgrup.data;
        for (let s of resSubgrup.data) {
          s.url_billing = url_billing;
        }
        await this.webService.orderObjectsAsc(resSubgrup.data).then((resorder) => {
          resSubgrup.data = this.webService.viewOptionCatalogueSubgroup(resorder);
        });
        return resSubgrup.data
      });

      // group_.subgrupos = await this.webService.getSubgruposService(url_billing, group_.idgrupo)
      // .then((resSubgrup: any) => { 
      //   console.log('los subgrupos',resSubgrup);

      //   return resSubgrup.data } );

    });


    this.flagLoader = false;
    return grupos;
  }

  ordenarPorNumOrden(arr: any[], criterio: string) {
    const datosOrdenados = arr.sort((a, b) => {
      const ordenA = Number(a.orden);
      const ordenB = Number(b.orden);

      if (ordenA < ordenB) {
        return -1;
      }
      if (ordenA > ordenB) {
        return 1;
      }
      return 0;
    });
  }

  tuncateNameGroup(cad, num) {
    return this.util.truncateString(cad, num)
  }


  seeSubGroups(codigo) {
    console.log('clic', codigo);
    // this.initializeDropdownToggles();
    // this.toggleSubGroup(codigo);

    const selector = `.sidebar-dropdown-toggle-${codigo}`;
    const item = document.querySelector(selector) as HTMLElement | null;
    if (item) {
      // console.log('ENTRA');   
      const parent = item.closest('.group') as HTMLElement | null;
      console.log('parent', parent);
      if (parent) {
        const isSelected = parent.classList.contains('selected');
        // Remover la clase 'selected' de todos los elementos
        document.querySelectorAll('.group').forEach((group) => {
          group.classList.remove('selected');
        });
        // Alternar la clase 'selected' en el elemento actual si no estaba seleccionada
        if (!isSelected) {
          parent.classList.add('selected');
        }
      }
    }
  }
  seeSubGroups1(codigo) {
    console.log('clic', codigo);

    // const selector = `.sidebar-dropdown-toggle-${codigo}`;
    // // console.log(selector);
    // const item = document.querySelector(selector) as HTMLElement | null;
    // // console.log(item);

    // document.querySelectorAll(selector).forEach(function (item) {
    //   item.addEventListener('click', function (e) {
    //     // e.preventDefault()
    //     const parent = item.closest('.group')
    //     if (parent.classList.contains('selected')) {
    //       parent.classList.remove('selected')
    //     } else {
    //       document.querySelectorAll(selector).forEach(function (i) {
    //         i.closest('.group').classList.remove('selected')
    //       })
    //       parent.classList.add('selected')
    //     }
    //   })
    // })



    // if (item) {
    //   console.log('ENTRA');

    //   const parent = item.closest('.group') as HTMLElement | null;
    //   console.log('parent', parent);

    //   if (parent) {
    //     const isSelected = parent.classList.contains('selected');

    //     // Remover la clase 'selected' de todos los elementos
    //     document.querySelectorAll('.group').forEach((group) => {
    //       group.classList.remove('selected');
    //     });

    //     // Alternar la clase 'selected' en el elemento actual si no estaba seleccionada
    //     if (!isSelected) {
    //       parent.classList.add('selected');
    //     }
    //   }
    // }
    this.initializeDropdownToggles();

  }

  returnHome(flag) {
    this.flagRender = flag;
    this.return.emit(this.flagRender);
  }

  async getProductos(grupo, subGrupo) {
    console.log(grupo);
    console.log(subGrupo);

    let type = 'selectCatalogue';
    this.classSelected = true;
    let arr = {
      id_grupo: grupo.idgrupo,
      name_grupo: grupo.nombre,
      id_subgrupo: subGrupo.id_sub,
      name_subgrupo: subGrupo.nombre,

    }
    localStorage.setItem('g_s', JSON.stringify(arr))

    this.sendGrupSubgrupo.emit(arr);

    this.router.navigateByUrl('product/' + type + '/' + grupo.idgrupo + '/' + subGrupo.id_sub);
    this.idGrupoSubGrupo = subGrupo.id_sub;

  }

  // sendConfiguration(){
  //   console.log('configuracion', this.configuracion);

  //   this.sendConfig.emit(this.configuracion)
  // }


  // Método unificado para manejar el toggle de subgrupos
  private toggleSubGroup(codigo: string) {
    const selector = `.sidebar-dropdown-toggle-${codigo}`;
    const item = document.querySelector(selector) as HTMLElement | null;

    if (item) {
      const parent = item.closest('.group') as HTMLElement | null;

      if (parent) {
        const isSelected = parent.classList.contains('selected');

        // Remover la clase 'selected' de todos los elementos
        document.querySelectorAll('.group').forEach((group) => {
          group.classList.remove('selected');
        });

        // Alternar la clase 'selected' en el elemento actual si no estaba seleccionada
        if (!isSelected) {
          parent.classList.add('selected');
        }
      }
    }
  }

  private initializeDropdownToggles() {
    // Remover event listeners existentes para evitar duplicados
    this.removeExistingListeners();

    // Agregar event listeners una sola vez para todos los toggles
    document.querySelectorAll('[class*="sidebar-dropdown-toggle-"]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const parent = item.closest('.group') as HTMLElement;

        if (parent) {
          const isSelected = parent.classList.contains('selected');

          // Remover 'selected' de todos los grupos
          document.querySelectorAll('.group').forEach((group) => {
            group.classList.remove('selected');
          });

          // Agregar 'selected' al grupo actual si no estaba seleccionado
          if (!isSelected) {
            parent.classList.add('selected');
          }
        }
      });
    });
  }

  private removeExistingListeners() {
    // Clonar y reemplazar elementos para remover todos los event listeners
    document.querySelectorAll('[class*="sidebar-dropdown-toggle-"]').forEach((item) => {
      const clone = item.cloneNode(true);
      item.parentNode?.replaceChild(clone, item);
    });
  }

  async getProductos2(grupo) {
    console.log('grupo 2', grupo);

    let type = 'selectCatalogue';

    await this.webService.getSubgruposService2(this.empresa.url_billing, grupo.idgrupo)
      .then((resSubgrup: any) => {
        console.log('los subgrupos', resSubgrup);
        //  grupo.data
        console.log('los grupo.data', grupo.data);

        this.router.navigateByUrl('product/' + type + '/' + grupo.idgrupo + '/' + resSubgrup.data[0].id_sub);

      });
  }


}
