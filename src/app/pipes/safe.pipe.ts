import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  constructor(protected _sanitizer: DomSanitizer) {
  }

  transform(url) {
    return this._sanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
