// services/products-facade.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, throwError } from 'rxjs';
import { map, catchError, finalize, tap } from 'rxjs/operators';
import { Product, ProductsState, Category, SubCategory, Configuration, RouteParams } from '../interface/products';
import { ServiceService } from './service.service';
import { AlertService } from './alert.service';
import { APP_CONSTANTS } from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class ProductsFacadeService {
  private readonly _state = new BehaviorSubject<ProductsState>({
    products: [],
    loading: false,
    error: null,
    selectedCategory: null,
    selectedSubCategory: null,
    searchTerm: ''
  });

  public readonly state$ = this._state.asObservable();
  public readonly products$ = this.state$.pipe(map(state => state.products));
  public readonly loading$ = this.state$.pipe(map(state => state.loading));
  public readonly error$ = this.state$.pipe(map(state => state.error));

  constructor(
    private webService: ServiceService,
    private alertService: AlertService
  ) {}

  private updateState(partialState: Partial<ProductsState>): void {
    this._state.next({ ...this._state.value, ...partialState });
  }

  private setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  private setError(error: string | null): void {
    this.updateState({ error });
  }

  async loadProductsByCategory(
    url: string, 
    categoryId: string, 
    subCategoryId: string, 
    configuration: Configuration,
    login: any = null
  ): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      let  response :any;
      response = await this.webService.getProductosService(url, categoryId, subCategoryId, configuration);
      
      if (!response.rta) {
        throw new Error('No se encontraron productos en esta categoría');
      }

      const products = await this.processProductsByWebType(response.data, configuration, login);
      
      this.updateState({ 
        products,
        selectedCategory: { idgrupo: categoryId, nombre: '' } as Category,
        selectedSubCategory: { id_sub: subCategoryId, nombre: '', id_grupo: categoryId } as SubCategory
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar productos';
      this.setError(errorMessage);
      this.alertService.alertWarning('', errorMessage);
      this.updateState({ products: [] });
    } finally {
      this.setLoading(false);
    }
  }

  async searchProducts(
    url: string, 
    searchTerm: string, 
    configuration: Configuration,
    login: any = null
  ): Promise<void> {
    if (!searchTerm.trim()) {
      this.updateState({ products: [], searchTerm: '' });
      return;
    }

    this.setLoading(true);
    this.setError(null);

    try {
      let  response :any;
       response = await this.webService.searchProduct(url, searchTerm, configuration);
      
      if (!response.rta) {
        throw new Error('No se encontraron coincidencias');
      }

      const products = await this.processProductsByWebType(response.data, configuration, login);
      
      this.updateState({ 
        products,
        searchTerm
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en la búsqueda';
      this.setError(errorMessage);
      this.alertService.alertWarning('', errorMessage);
      this.updateState({ products: [] });
    } finally {
      this.setLoading(false);
    }
  }

  async loadProductByCode(
    url: string, 
    productCode: string, 
    configuration: Configuration,
    login: any = null
  ): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      let  response :any;
      response = await this.webService.getProductosCodigoService(url, productCode, configuration);
      
      if (!response.rta) {
        throw new Error('No se encontró el producto');
      }

      const products = await this.processProductsByWebType(response.data, configuration, login);
      this.updateState({ products });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el producto';
      this.setError(errorMessage);
      this.alertService.alertWarning('', errorMessage);
      this.updateState({ products: [] });
    } finally {
      this.setLoading(false);
    }
  }

  async loadDefaultProducts(url: string, categories: Category[], configuration: Configuration, login: any = null): Promise<void> {
    if (!categories.length) {
      await this.loadCategoriesAndDefaultProducts(url, configuration, login);
      return;
    }

    const firstCategory = categories[0];
    const firstSubCategory = firstCategory.subgrupos?.[0];

    if (firstSubCategory) {
      await this.loadProductsByCategory(
        url, 
        firstCategory.idgrupo, 
        firstSubCategory.id_sub, 
        configuration, 
        login
      );
    }
  }

  private async loadCategoriesAndDefaultProducts(url: string, configuration: Configuration, login: any): Promise<void> {
    try {
      let  categoriesResponse :any;
      categoriesResponse = await this.webService.getGruposService(url, 'filter');
      
      if (categoriesResponse.error || !categoriesResponse.rta) {
        throw new Error('Error al obtener las categorías');
      }

      const orderedCategories = await this.webService.orderObjectsAsc(categoriesResponse.data);
      const categoriesWithSubgroups = await this.loadSubgroupsForCategories(orderedCategories, url);
      
      if (categoriesWithSubgroups.length > 0) {
        await this.webService.saveTemporaryCatalogue(categoriesWithSubgroups);
        await this.loadDefaultProducts(url, categoriesWithSubgroups, configuration, login);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar el catálogo';
      this.setError(errorMessage);
      this.alertService.alertWarning('', errorMessage);
    }
  }

  private async loadSubgroupsForCategories(categories: Category[], url: string): Promise<Category[]> {
    const firstCategory = categories[0];
    if (!firstCategory) return categories;
    let  subgroupsResponse :any;
    subgroupsResponse = await this.webService.getSubgruposService(url, firstCategory.idgrupo);
    const orderedSubgroups = await this.webService.orderObjectsAsc(subgroupsResponse.data);
    
    categories[0].subgrupos = orderedSubgroups;
    return categories;
  }

  private async processProductsByWebType(products: any[], configuration: Configuration, login: any): Promise<Product[]> {
    const processedProducts = await this.webService.obtainAndCalculatePriceProduct(products, configuration, login);
    
    switch (configuration.tipo_web) {
      case APP_CONSTANTS.WEB_TYPES.NORMAL:
        return processedProducts;
      
      case APP_CONSTANTS.WEB_TYPES.TALLAS:
        return await this.webService.createTallasProduct(processedProducts);
      
      case APP_CONSTANTS.WEB_TYPES.DOS_BD:
        console.warn('Tienda con 2 BD en proceso de desarrollo');
        return [];
      
      case APP_CONSTANTS.WEB_TYPES.INTERNET:
        console.warn('Tienda Internet en proceso de desarrollo');
        return [];
      
      default:
        return processedProducts;
    }
  }

  orderProducts(orderType: string): void {
    const currentProducts = this._state.value.products;
    this.webService.orderProductPriceAscDesc(currentProducts, orderType).then(orderedProducts => {
      this.updateState({ products: orderedProducts });
    });
  }

  clearProducts(): void {
    this.updateState({ products: [], searchTerm: '', error: null });
  }

  getCurrentState(): ProductsState {
    return this._state.value;
  }
}