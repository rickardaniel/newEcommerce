import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { inject } from '@angular/core';
import { ServiceService } from './services/service.service';

export const routes: Routes = [
     {
          path: '', component: InicioComponent
     },
     {
          path: 'ecommerce',
          component: HomeComponent
     },
     {
          path: 'products',
          component: ProductsComponent
     },
     {
          path: 'product/:type/:value/:value2',
          component: ProductsComponent
     },
     {
          path: 'administrador',
          loadComponent: () => import('./admin/admin.component'),
          children: [
               // <i class="bi bi-speedometer"></i>
               {
                    path: 'lista_pedidos', title: 'Lista de Pedidos',
                    data: {
                         'icon': 'bi bi-file-text',
                         'icon2': 'bi bi-file-text-fill',
                    },
                    loadComponent: () => import('./admin/pages/lista-pedidos/lista-pedidos.component')
               },
               {
                    path: 'datos_generales', title: 'Datos Generales',
                    data: {
                         'icon': 'bi bi-person-vcard',
                         'icon2': 'bi bi-person-vcard-fill',
                    },
                    loadComponent: () => import('./admin/pages/datos-generales/datos-generales.component')
               },
               {
                    path: 'servicios_inicio', title: 'Servicios Inicio',
                    data: {
                         'icon': 'bi bi-alphabet-uppercase',
                         'icon2': 'bi bi-alphabet-uppercase',
                    },
                    loadComponent: () => import('./admin/pages/servicios-inicio/servicios-inicio.component')
               },

               {
                    path: 'mision_vision', title: 'Sobre Misión-Visión',
                    data: {
                         'icon': 'bi bi-chat-left-quote',
                         'icon2': 'bi bi-chat-left-quote-fill',
                    },
                    loadComponent: () => import('./admin/pages/mision-vision/mision-vision.component')
               },

               {
                    path: 'configuraciones', title: 'Configuraciones',
                    data: {
                         'icon': 'bi bi-gear',
                         'icon2': 'bi bi-gear-fill',
                    },
                    loadComponent: () => import('./admin/pages/configuracion-admin/configuracion-admin.component')
               },
               {
                    path: 'testimonio', title: 'Testimonios & Marcas',
                    data: {
                         'icon': 'bi bi-chat-square-text',
                         'icon2': 'bi bi-chat-square-text-fill',
                    },
                    loadComponent: () => import('./admin/pages/testimonio-marcas/testimonio-marcas.component')
               },
               {
                    path: 'banners', title: 'Imágenes Banner',
                    data: {
                         'icon': 'bi bi-image',
                         'icon2': 'bi bi-image-fill',
                    },
                    loadComponent: () => import('./admin/pages/img-banner/img-banner.component')
               },

               {
                    path: 'admin_grupos', title: 'Administrar Grupos',
                    data: {
                         'icon': 'bi bi-boxes',
                         'icon2': 'bi bi-boxes',
                    },
                    loadComponent: () => import('./admin/pages/admin-grupos/admin-grupos.component')
               },

               {
                    path: 'admin_productos', title: 'Administrar Productos',
                    data: {
                         'icon': 'bi bi-box-seam',
                         'icon2': 'bi bi-box-seam-fill',
                    },
                    loadComponent: () => import('./admin/pages/admin-productos/admin-productos.component')
               },

               {
                    path: 'generar_vaucher', title: 'Generar Vaucher',
                    data: {
                         'icon': 'bi bi-cash-coin',
                         'icon2': 'bi bi-cash-coin',
                    },
                    loadComponent: () => import('./admin/pages/generar-vaucher/generar-vaucher.component')
               },
               {
                    path: 'colores_producto', title: 'Colores Productos',
                    data: {
                         'icon': 'bi bi-palette',
                         'icon2': 'bi bi-palette-fill',
                    },
                    loadComponent: () => import('./admin/pages/colores-products/colores-products.component')
               },

               {
                    path: 'guia_tallas', title: 'Guía de tallas',
                    data: {
                         'icon': 'bi bi-arrows-angle-contract',
                         'icon2': 'bi bi-arrows-angle-expand',
                    },
                    loadComponent: () => import('./admin/pages/guia-tallas/guia-tallas.component')
               },

               {
                    path: 'promociones', title: 'Promociones',
                    data: {
                         'icon': 'bi bi-currency-exchange',
                         'icon2': 'bi bi-currency-exchange',
                    },
                    loadComponent: () => import('./admin/pages/promociones/promociones.component')
               },

               {
                    path: 'generar_catalogo', title: 'Generar Catálogo',
                    data: {
                         'icon': 'bi bi-newspaper',
                         'icon2': 'bi bi-newspaper',
                    },
                    resolve: {
                         appConfig: () => {
                              const configService = inject(ServiceService);
                              return configService.getConfiguracion();
                         },
                    },
                    loadComponent: () => import('./admin/pages/generar-catalogo/generar-catalogo.component')

               },
               {
                    path: 'pixel', title: 'Pixel Facebook',
                    data: {
                         'icon': 'bi bi-facebook',
                         'icon2': 'bi bi-facebook',
                    },
                    resolve: {
                         appConfig: () => {
                              const configService = inject(ServiceService);
                              return configService.getConfiguracion();
                         },
                    },
                    loadComponent: () => import('./admin/pages/pixel/pixel.component')

               },
               {
                    path: 'credenciales', title: 'Credenciales',
                    data: {
                         'icon': 'bi bi-key',
                         'icon2': 'bi bi-key-fill',
                    },
                    loadComponent: () => import('./admin/pages/credenciales/credenciales.component')
               },




          ],
     },
];
