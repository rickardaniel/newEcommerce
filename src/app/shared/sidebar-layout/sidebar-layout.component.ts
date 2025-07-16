import {
  Component,
  signal,
  HostListener,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardGeneralComponent } from '../card-general/card-general.component';
import { ServiceService } from '../../services/service.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-layout',
  standalone: true,
  imports: [CommonModule, CardGeneralComponent],
  templateUrl: './sidebar-layout.component.html',
  styleUrls: ['./sidebar-layout.component.scss']
})
export class SidebarLayoutComponent implements OnInit, OnDestroy {

  // ===== REFERENCIAS DEL DOM =====
  @ViewChild('sidebar', { static: false }) sidebarRef!: ElementRef;
  @ViewChild('overlay', { static: false }) overlayRef!: ElementRef;
  @Output() sendGrupSubgrupo = new EventEmitter<any>();

  // ===== SIGNALS PARA ESTADO REACTIVO =====
  public isSidebarOpen = signal<boolean>(false);
  public isMobile = signal<boolean>(false);
  public isCollapsed = signal<boolean>(false);

  // ===== CONFIGURACIÓN DEL MENÚ =====
  public menuItems = signal([
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      active: true
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: 'users',
      route: '/users',
      active: false,
      badge: '5'
    },
    {
      id: 'products',
      label: 'Productos',
      icon: 'products',
      route: '/products',
      active: false
    },
    {
      id: 'orders',
      label: 'Pedidos',
      icon: 'orders',
      route: '/orders',
      active: false,
      badge: 'New'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'analytics',
      route: '/analytics',
      active: false
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: 'settings',
      route: '/settings',
      active: false
    }
  ]);

  public userInfo = signal({
    name: 'Juan Pérez',
    email: 'juan@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    role: 'Administrador'
  });

  subGroups: any = [];
  grupo: any = [];

  // ===== CONFIGURACIÓN DE BREAKPOINTS =====
  // Cambiado de 768 a 1024 para incluir tablets en comportamiento móvil
  private readonly MOBILE_BREAKPOINT = 1024; // lg breakpoint de Tailwind
  private resizeObserver?: ResizeObserver;

  @Input('groups') groups: any;

  // subgrupos = [];
  flagLoader = true;
  urlBilling = environment.urlBilling;
  idGrupoSubGrupo: any;

  constructor
    (
      private webService: ServiceService,
      public router: Router,

    ) {
    this.checkScreenSize();

  }

  ngOnInit(): void {
    this.setupResizeObserver();
    this.setupKeyboardListeners();
    this.initializeFlowbiteComponents();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // ===== MÉTODOS DE INICIALIZACIÓN =====

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.checkScreenSize();
    });
    this.resizeObserver.observe(document.body);
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
  }

  private initializeFlowbiteComponents(): void {
    // Inicializar componentes de Flowbite si es necesario
    setTimeout(() => {
      if ('initFlowbite' in window) {
        (window as any).initFlowbite();
      }
    }, 100);
  }

  private cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    document.removeEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
  }

  // ===== MÉTODOS DE CONTROL DEL SIDEBAR =====

  /**
   * Toggle del sidebar principal
   */
  toggleSidebar(group): void {
    console.log('🔄 Toggle sidebar', group);
    this.isSidebarOpen.set(!this.isSidebarOpen());
    this.grupo = group;
    this.subGroups = group.subgrupos;
    // En móvil y tablet, agregar/quitar scroll lock del body
    if (this.isMobile()) {
      document.body.style.overflow = this.isSidebarOpen() ? 'hidden' : '';
    }
  }

  /**
   * Abrir sidebar
   */
  openSidebar(): void {
    console.log('📂 Abrir sidebar');
    this.isSidebarOpen.set(true);
    if (this.isMobile()) {
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cerrar sidebar
   */
  closeSidebar(): void {
    console.log('📁 Cerrar sidebar');
    this.isSidebarOpen.set(false);
    if (this.isMobile()) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Toggle collapse del sidebar (solo desktop)
   */
  toggleCollapse(): void {
    if (!this.isMobile()) {
      this.isCollapsed.set(!this.isCollapsed());
      console.log('🔄 Toggle collapse:', this.isCollapsed());
    }
  }

  // ===== MÉTODOS DE NAVEGACIÓN =====

  selectMenuItem(subGroup: any): void {
    console.log('🎯 Seleccionar item:', subGroup);
    this.getProductos(this.grupo, subGroup)
    if (this.isMobile()) {
      setTimeout(() => {
        this.closeSidebar();
      }, 200);
    }
  }

  // ===== MÉTODOS DE RESPONSIVIDAD =====

  private checkScreenSize(): void {
    const width = window.innerWidth;
    const wasMobile = this.isMobile();
    const isMobileNow = width <= this.MOBILE_BREAKPOINT;

    this.isMobile.set(isMobileNow);

    // Si cambió de móvil/tablet a desktop, cerrar sidebar y resetear overflow
    if (wasMobile && !isMobileNow) {
      this.isSidebarOpen.set(false);
      document.body.style.overflow = '';
    }

    // En desktop (> 1024px), el sidebar puede estar abierto por defecto
    if (!isMobileNow && !wasMobile) {
      this.isSidebarOpen.set(true);
    }
  }

  // ===== EVENT LISTENERS =====

  /**
   * Click en overlay para cerrar sidebar
   */
  onOverlayClick(): void {
    if (this.isMobile()) {
      this.closeSidebar();
    }
  }

  /**
   * Prevenir propagación de clicks dentro del sidebar
   */
  onSidebarClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Atajos de teclado
   */
  private handleKeyboardShortcuts(event: KeyboardEvent): void {
    // Ctrl/Cmd + B = Toggle sidebar
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault();
      // this.toggleSidebar();
    }

    // Escape = Cerrar sidebar (solo en móvil/tablet)
    if (event.key === 'Escape' && this.isMobile() && this.isSidebarOpen()) {
      this.closeSidebar();
    }
  }

  /**
   * Listener global para clicks fuera del sidebar
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    // Si es móvil/tablet y el sidebar está abierto, y no se hizo click en el sidebar o botón
    if (this.isMobile() &&
      this.isSidebarOpen() &&
      this.sidebarRef &&
      !this.sidebarRef.nativeElement.contains(target) &&
      !target.closest('[data-sidebar-toggle]')) {
      this.closeSidebar();
    }
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Obtener clases CSS para el sidebar
   */
  getSidebarClasses(): string {
    const baseClasses = 'fixed top-0 left-0 z-50 h-screen mt-20 transition-transform bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700';

    // Width classes
    const widthClasses = this.isCollapsed() ? 'w-16' : 'w-64';

    // Transform classes
    const transformClasses = this.isSidebarOpen() ? 'translate-x-0' : '-translate-x-full';

    // Mobile/tablet specific classes - removido md:translate-x-0
    const mobileClasses = '';

    return `${baseClasses} ${widthClasses} ${transformClasses} ${mobileClasses}`;
  }

  /**
   * Obtener clases CSS para el contenido principal
   */
  getMainContentClasses(): string {
    const baseClasses = 'transition-all duration-300 ease-in-out';

    // Ahora móvil incluye tablets (hasta 1024px)
    if (this.isMobile()) {
      return `${baseClasses} ml-0`;
    }

    if (this.isSidebarOpen()) {
      const marginClass = this.isCollapsed() ? 'ml-16' : 'ml-64';
      return `${baseClasses} ${marginClass}`;
    }

    return `${baseClasses} ml-0`;
  }

  /**
   * Obtener clases CSS para overlay
   */
  getOverlayClasses(): string {
    const baseClasses = 'fixed inset-0 z-30 bg-gray-900/50 transition-opacity';
    const visibilityClasses = (this.isMobile() && this.isSidebarOpen())
      ? 'opacity-100'
      : 'opacity-0 pointer-events-none';

    return `${baseClasses} ${visibilityClasses}`;
  }

  /**
   * Obtener icono SVG por nombre
   */
  getMenuIcon(iconName: string): any {
    const icons:
      { [key: string]: string } = {
      dashboard: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>`,

      users: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>`,

      products: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9a1 1 0 012 0v6a1 1 0 11-2 0V9zm6 0a1 1 0 112 0v6a1 1 0 11-2 0V9z" clip-rule="evenodd"></path></svg>`,

      orders: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>`,

      analytics: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>`,

      settings: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>`
    };

    return icons[iconName] || icons;
  }

  /**
   * Verificar si un item tiene badge
   */
  hasBadge(item: any): boolean {
    return item.badge && item.badge.length > 0;
  }

  /**
   * Obtener clases CSS para badge
   */
  getBadgeClasses(item: any): string {
    const baseClasses = 'inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium rounded-full';

    // Colores diferentes según el contenido del badge
    if (item.badge === 'New') {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else if (isNaN(item.badge)) {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    } else {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
  }

  // ===== MÉTODOS PARA DEBUGGING =====

  /**
   * Obtener clases CSS para items del menú
   */
  getMenuItemClasses(item: any): string {
    const baseClasses = 'flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 group relative transition-colors';
    const activeClasses = item.active
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white'
      : '';

    return `${baseClasses} ${activeClasses}`;
  }

  /**
   * Log del estado actual
   */
  logCurrentState(): void {
    console.log('📊 Estado del Sidebar:', {
      isOpen: this.isSidebarOpen(),
      isMobile: this.isMobile(),
      isCollapsed: this.isCollapsed(),
      activeMenuItem: this.menuItems().find(item => item.active)?.label,
      screenWidth: window.innerWidth
    });
  }

  async getProductos(grupo, subGrupo) {
    console.log(grupo);
    console.log(subGrupo);

    let type = 'selectCatalogue';
    // this.classSelected = true;
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

    async getProductos2(grupo) {
    console.log('grupo 2', grupo);

    let type = 'selectCatalogue';

    await this.webService.getSubgruposService2(this.urlBilling, grupo.idgrupo)
      .then((resSubgrup: any) => {
        console.log('los subgrupos', resSubgrup);
        //  grupo.data
        console.log('los grupo.data', grupo.data);

        this.router.navigateByUrl('product/' + type + '/' + grupo.idgrupo + '/' + resSubgrup.data[0].id_sub);

      });
  }
}