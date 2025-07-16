import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StylesService {
  private currentConfiguration: any = null;
  private currentInformation: any = null;
  constructor() { }

  // Actualizar configuración y aplicar estilos
  updateConfiguration(configuracion: any, information?: any) {
    this.currentConfiguration = configuracion;
    if (information) {
      this.currentInformation = information;
    }
    this.applyStyles();
  }

  // Aplicar estilos basados en la configuración actual
  applyStyles() {
    if (!this.currentConfiguration) return;

    const color = this.currentConfiguration.colorPrincipal;
    const colorLetra = this.currentConfiguration.colorLetra;
    const colorLetraSecundario = this.currentConfiguration.colorLetraSecundario;
    
    // Aplicar variables CSS básicas
    document.documentElement.style.setProperty('--dynamic-color', color || 'black');
    document.documentElement.style.setProperty('--color-letter-primary', colorLetra || 'black');
    document.documentElement.style.setProperty('--color-letter-secondary', colorLetraSecundario || 'black');
    
    // Aplicar color de slogan si hay información disponible
    if (this.currentInformation && this.currentInformation.colorLetraSlogan) {
      document.documentElement.style.setProperty('--color-font-portada', this.currentInformation.colorLetraSlogan);
    }
    
    // Calcular tono más claro para efectos hover
    const rgbaColor = this.hexToRgba(color, 0.1);
    document.documentElement.style.setProperty('--lighter-tone', rgbaColor);
  }

  // Forzar re-aplicación de estilos
  forceApplyStyles() {
    setTimeout(() => {
      this.applyStyles();
    }, 0);
  }

  // Utilidad para convertir hex a rgba
  private hexToRgba(hex: string, alpha: number = 1): string {
    if (!hex) return 'rgba(0, 0, 0, 0.1)';
    
    // Remover el # si existe
    hex = hex.replace('#', '');
    
    // Convertir hex a RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Getter para la configuración actual
  getCurrentConfiguration() {
    return this.currentConfiguration;
  }
}
