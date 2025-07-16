import { Component } from '@angular/core';
import { FormControl, FormGroup,  FormsModule,  ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceService } from '../../../services/service.service';
import { AlertService } from '../../../services/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-credenciales',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './credenciales.component.html',
  styleUrl: './credenciales.component.scss'
})
export default class CredencialesComponent {
  public administration: {
    data: any,
    validate: {
      current: '',
      new: ''
    }
  };
  loading = false;

  constructor
    (
      private webService: ServiceService,
      private alert: AlertService,

    ) {
  }

  async ngOnInit() {
    this.getDataAdministration();
  }

  // formUpdateProfile = new FormGroup({
  //   user: new FormControl(''),
  //   pass: new FormControl('', Validators.required),
  //   newPass: new FormControl('', Validators.required),
  // })

    async getDataAdministration() {
    this.loading = true;
    await this.webService.getDataAdministration().then((resadmin) => {
      console.log('resadmin', resadmin);
      
      this.administration = {
        data: resadmin[0],
        validate: {
          current: '',
          new: ''
        }
      }
      // this.formUpdateProfile.setValue({
      //   'user':resadmin[0].usuario,
      //   'pass':'',
      //   'newPass':''
      // })

       
    });
    // console.log("administration", this.administration);
    this.loading = false;
  }

  async updateAdministration(administration) {
    console.log('administration',administration);
    
    if (administration.validate.current && administration.validate.new) {
      if (administration.data.password == administration.validate.current) {
        administration.data.password = administration.validate.new;
        this.loading = true;
        await this.webService.updateAdministration(administration.data).then(async (resupd: any) => {
          this.loading = false;
          if (!resupd.error) {
            await this.getDataAdministration();
            this.alert.alertSuccess('Contraseña actualizada exitosamente', '');
          } else {
            this.alert.alertDanger('Ha ocorrido un error, intente nuevamente', '');
          }
        });
      } else {
        this.alert.alertDanger('Las constraseñas no coinciden, vueva a intentarlo', '');
      }
    } else {
      this.alert.alertDanger('Campos vacios, verifique e intente nuevamente', '');
    }
  }



}
