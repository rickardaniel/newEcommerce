import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private toastr: ToastrService) {}

  // -------------------------  TOAST SERVICE ------------------------------
  alertDanger( title: any, desc: any ) {
    this.toastr.error(  title,desc );
  }

  alertSuccess( title: any, desc: any ) {
    this.toastr.success(title,desc );
  }

  alertWarning( title: any, desc: any ) {
    this.toastr.warning( title,desc );
  }


  alertInfo( title: any, desc: any ) {
    this.toastr.info( title,desc );
  }

   alertDangerBottom( title: any, desc: any ) {
    this.toastr.error(  title,desc,{positionClass: 'toast-bottom-left',} );
  }

  alertSuccessBottom( title: any, desc: any ) {
    this.toastr.success(title,desc,{positionClass: 'toast-bottom-left',} );
  }


    alertWarningBottom( title: any, desc: any ) {
    this.toastr.warning( title,desc,{positionClass: 'toast-bottom-left',} );
  }
    alertInfoBottom( title: any, desc: any ) {
    this.toastr.info( title,desc,{positionClass: 'toast-bottom-left',} );
  }
}
