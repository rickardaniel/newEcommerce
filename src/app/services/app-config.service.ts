// services/app-config.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Configuration, Information } from '../interface/products';
import { ServiceService } from './service.service';
import { StylesService } from './styles.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly _configuration = new BehaviorSubject<Configuration | null>(null);
  private readonly _information = new BehaviorSubject<Information | null>(null);
  private readonly _isLoaded = new BehaviorSubject<boolean>(false);

  public readonly configuration$ = this._configuration.asObservable();
  public readonly information$ = this._information.asObservable();
  public readonly isLoaded$ = this._isLoaded.asObservable();

  constructor(
    private webService: ServiceService,
    private stylesService: StylesService
  ) {}

  async loadAppConfig(): Promise<{ configuration: Configuration; information: Information }> {
    try {
      const [configuration, information] = await Promise.all([
        this.loadConfiguration(),
        this.loadInformation()
      ]);

      this.applyStyles(configuration, information);
      this._isLoaded.next(true);

      return { configuration, information };
    } catch (error) {
      console.error('Error loading app configuration:', error);
      throw error;
    }
  }

  private loadConfiguration(): Promise<Configuration> {
    return new Promise((resolve, reject) => {
      this.webService.getGeneral(`configuracion/${environment.idShop}`).subscribe({
        next: (response: Configuration[]) => {
          if (response && response.length > 0) {
            const config = response[0];
            this._configuration.next(config);
            resolve(config);
          } else {
            reject(new Error('No configuration found'));
          }
        },
        error: (error) => {
          console.error('Error loading configuration:', error);
          reject(error);
        }
      });
    });
  }

  private loadInformation(): Promise<Information> {
    return new Promise((resolve, reject) => {
      this.webService.getGeneral(`informacions/${environment.idShop}`).subscribe({
        next: (response: Information[]) => {
          if (response && response.length > 0) {
            const info = response[0];
            this._information.next(info);
            resolve(info);
          } else {
            reject(new Error('No information found'));
          }
        },
        error: (error) => {
          console.error('Error loading information:', error);
          reject(error);
        }
      });
    });
  }

  private applyStyles(configuration: Configuration, information: Information): void {
    if (configuration) {
      this.applyCSSVariables({
        '--dynamic-color': configuration.colorPrincipal,
        '--color-letter-primary': configuration.colorLetra,
        '--color-letter-secondary': configuration.colorLetraSecundario
      });
    }

    if (information) {
      this.applyCSSVariables({
        '--color-font-portada': information.colorLetraSlogan
      });
    }

    this.stylesService.forceApplyStyles();
  }

  private applyCSSVariables(variables: Record<string, string | undefined>): void {
    Object.entries(variables).forEach(([property, value]) => {
      if (value) {
        document.documentElement.style.setProperty(property, value);
      }
    });
  }

  getConfiguration(): Configuration | null {
    return this._configuration.value;
  }

  getInformation(): Information | null {
    return this._information.value;
  }

  isConfigLoaded(): boolean {
    return this._isLoaded.value;
  }

  updateConfiguration(config: Partial<Configuration>): void {
    const currentConfig = this._configuration.value;
    if (currentConfig) {
      const updatedConfig = { ...currentConfig, ...config };
      this._configuration.next(updatedConfig);
      this.applyStyles(updatedConfig, this._information.value!);
    }
  }
}

