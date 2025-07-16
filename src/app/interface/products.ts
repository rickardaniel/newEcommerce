// interfaces/product.interface.ts
export interface Product {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  imagen?: string;
  descripcion?: string;
  categoria?: Category;
  subCategoria?: SubCategory;
  tallas?: ProductSize[];
  atributos?: ProductAttribute[];
}

export interface ProductSize {
  id: string;
  nombre: string;
  precio?: number;
  stock?: number;
}

export interface ProductAttribute {
  id: string;
  nombre: string;
  valor: string;
}

export interface Category {
  idgrupo: string;
  nombre: string;
  subgrupos?: SubCategory[];
  viewSubgrupo?: boolean;
}

export interface SubCategory {
  id_sub: string;
  nombre: string;
  id_grupo: string;
}

export interface Configuration {
  id: string;
  tipo_precio: string;
  mostrar_precio: number;
  show_attributes_prod: boolean;
  tipo_web: number;
  colorPrincipal?: string;
  colorLetra?: string;
  colorLetraSecundario?: string;
  imgLogo?: string;
  loginStorage?: boolean;
}

export interface Information {
  id: string;
  nombre: string;
  colorLetraSlogan?: string;
  mision?: string;
}


export interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  selectedCategory: Category | null;
  selectedSubCategory: SubCategory | null;
  searchTerm: string;
}

export interface RouteParams {
  type: 'search' | 'selectCatalogue' | 'selectProduct';
  value: string;
  value2?: string;
}

