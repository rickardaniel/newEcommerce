import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxLoadingModule } from 'ngx-loading';
import { provideToastr } from 'ngx-toastr';
import { environment } from './environments/environment';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(),  
    provideAnimations(),
    provideToastr(),
    provideHttpClient(withFetch()),
    importProvidersFrom(NgxLoadingModule.forRoot({
      animationType: 'circle',
      backdropBackgroundColour: 'rgba(0,0,0,0.5)',
      backdropBorderRadius: '4px',
      primaryColour: '#ffffff',
      secondaryColour: '#ccc',
      tertiaryColour: '#333'
    })),
    HttpClientModule, 
    provideFirebaseApp(() => initializeApp( environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    
  ]
};
