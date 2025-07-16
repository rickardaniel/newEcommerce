import { Injectable } from '@angular/core';
// import { Modal, ModalInterface, ModalOptions } from 'flowbite';
import { FlowbiteService } from './flowbite.service';
import { Modal, ModalInterface, ModalOptions } from 'flowbite';
import { Product } from '../interface/product';


@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private flowbiteService: FlowbiteService

  ) {
    // this.flowbiteService.loadFlowbite(flowbite => {
    //   console.log('Flowbite loaded', flowbite);

    // });
  }

  obtenerCodigoVideo(url) {
    // Expresión regular para buscar el código después de /youtu.be/
    const regex = /youtu\.be\/([^\/]+)/;
    // Ejecutar la búsqueda en la URL proporcionada
    const match = url.match(regex);
    // Si hay coincidencia, devolver el código encontrado; de lo contrario, devolver null
    return match ? match[1] : null;
  }

  cadenaByPuntos(text: string) {
    const maxLength = 80; // Maximum number of characters to display
    if (text.length <= maxLength) {
      return text; // No truncation needed if the text is already within the limit
    }
    return text.substring(0, maxLength) + '...'; // Truncate and add ellipsis
  }

  hexToRgba(hex, alpha = 1) {
    // Remover el símbolo de hash si está presente
    hex = hex?.replace(/^#/, '');

    // Expandir la notación corta (por ejemplo, #03F) a la forma completa (#0033FF)
    if (hex?.length === 3) {
      hex = hex?.split('').map(char => char + char).join('');
    }

    // Asegurar que el string hex esté en el formato correcto
    if (hex?.length !== 6) {
      throw new Error('El formato del color hexadecimal no es válido');
    }

    // Extraer los valores de rojo, verde y azul
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  truncateString(str: string, maxLength: number = 15): string {
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + '..';
    } else {
      return str;
    }
  }
  truncateString2(str: string, maxLength: number): string {
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + '..';
    } else {
      return str;
    }
  }


  // Modales Métodos
  createModal(modal: any) {
    const $modalElement: HTMLElement | any = document.querySelector(modal);

    const modalOptions: ModalOptions = {
      placement: 'top-center',
      backdrop: 'static',
      backdropClasses:
        'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
      closable: false,
    };

    const modalF: ModalInterface = new Modal($modalElement, modalOptions);
    return modalF;
    // modalF.show();
  }
  createModal2(modal: any) {
    const $modalElement: HTMLElement | any = document.querySelector(modal);

    const modalOptions: ModalOptions = {
      placement: 'center',
      backdrop: 'dynamic',
      backdropClasses:
        'bg-blue-900/50 dark:bg-gray-900/80 fixed inset-0  z-50',
      closable: false,

    };

    const modalF: ModalInterface = new Modal($modalElement, modalOptions);
    return modalF;
    // modalF.show();
  }

  // Modales Métodos Admin
  createModal3(modal: any) {
    const $modalElement: HTMLElement | any = document.querySelector(modal);

    const modalOptions: ModalOptions = {
      placement: 'top-center',
      backdrop: 'static',
      backdropClasses:
        'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-50',
      closable: false,
    };

    const modalF: ModalInterface = new Modal($modalElement, modalOptions);
    return modalF;
    // modalF.show();
  }
  createModal4(modal: any) {
    const $modalElement: HTMLElement | any = document.querySelector(modal);

    const modalOptions: ModalOptions = {
      placement: 'center',
      backdrop: 'dynamic',
      backdropClasses:
        'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0  z-60',
      closable: false,

    };

    const modalF: ModalInterface = new Modal($modalElement, modalOptions);
    return modalF;
    // modalF.show();
  }

  dosDecimales(numero: number): number {
    // // ////console.log (numero);
    let resul = Number(numero.toFixed(2));
    // // ////console.log ('res', resul);
    return resul;
  }

  addOrUpdateProduct(productsArray: any[], newProduct: any): any[] {
  // Busca si el producto ya existe en el arreglo por su ID
  
  const existingProductIndex = productsArray.findIndex(
    (product) => product.id_producto === newProduct.id_producto
  );
  console.log(' lo que llego', existingProductIndex);
  

  if (existingProductIndex >-1) {
    // Si el producto ya existe, incrementa su cantidad
    productsArray[existingProductIndex].quantity += 1;
    // También puedes agregar la lógica para sumar otras propiedades si es necesario,
    // por ejemplo, si el newProduct ya tiene una cantidad predefinida:
    // productsArray[existingProductIndex].quantity += newProduct.quantity || 1;
    console.log('====>', productsArray[existingProductIndex]);
    
  } else {
    // Si el producto no existe, agrégalo al arreglo.
    // Asegúrate de que el nuevo producto tenga una cantidad inicial de al menos 1
    // si no la tiene o si quieres asegurar que siempre empiece en 1 al añadirlo por primera vez.
    productsArray.push({ ...newProduct, quantity: newProduct.quantity || 1 });
  }

  return productsArray;
}

groupProductsAndSumQuantityReduce(products: any[]): any[] {
  const grouped = products.reduce((acc, product) => {
    const productId = product.id_producto;
    
    if (acc[productId]) {
      acc[productId].quantity += product.quantity;
    } else {
      acc[productId] = { ...product };
    }
    
    return acc;
  }, {} as { [key: string]: any });

  return Object.values(grouped);
}




}
