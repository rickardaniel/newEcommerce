import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
// import function to register Swiper custom elements
import { register } from 'swiper/element/bundle';
// register Swiper custom elements
// window.console.log = () => { };
localStorage.setItem('carLocal', "0");
localStorage.setItem('carCount', "0");
register();
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
