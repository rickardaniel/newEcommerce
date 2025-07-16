import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UtilsService } from '../../services/utils.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service';
import { ServiceService } from '../../services/service.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-register.component.html',
  styleUrl: './login-register.component.scss'
})
export class LoginRegisterComponent implements OnInit, OnChanges {
  flagPassword=false;
  flagSelectButton=true;
  action='login';  
 
  @Input('configuracion') configuracion:any;
  @Input('information') information:any;
  loginForm:any;
  public existCliente = false;
  url = environment.urlBilling;
  constructor
  (
    private util: UtilsService,
    private alert: AlertService,
    private webService: ServiceService,
    private router : Router

    // private util: UtilsService,
  )
  {  
  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log("LLEGA CONFIG A MODAL LOGIN", this.configuracion);

  }
  ngOnInit(): void {
    console.log("LLEGA CONFIG A MODAL LOGIN", this.configuracion);
    let color  = this.configuracion.colorPrincipal;
    let colorLetra  = this.configuracion.colorLetra;
    document.documentElement.style.setProperty('--dynamic-color', color);
    document.documentElement.style.setProperty('--font-color-letter', colorLetra);

  }

  formUser = new FormGroup({
    usuario: new FormControl('',Validators.required),
    clave: new FormControl('',Validators.required),
  })

  formAdmin = new FormGroup({
    usuario: new FormControl('', Validators.required),
    clave: new FormControl('', Validators.required),
  })

  formRegister = new FormGroup({
    nombres: new FormControl('', Validators.required),
    apellidos: new FormControl(''),
    cedula: new FormControl(''),
    razonsocial: new FormControl(''),
    direccion: new FormControl(''),
    telefonos: new FormControl(''),
    email: new FormControl(''),
    celular: new FormControl(''),
    tipoCli: new FormControl('1'),
    vendedor_id: new FormControl(''),
    diasCredito: new FormControl('0'),
    cupo_credito:new FormControl('0'),
    es_pasaporte: new FormControl(0)

  })


  selectLoginDefault(type){
    console.log('da', type);
    
      if(type=='user'){
        this.flagSelectButton=true;
      }else{
        this.flagSelectButton=false;
      }
  }


  closeModal(flag: boolean, name: string) {
    let modal = this.util.createModal(name);
  
    if (flag) {
      modal.hide();
    } else {
      modal.hide();
    }
  } 
  seePassword(flag:boolean){
    if(flag){
      this.flagPassword=true;
    }else{
      this.flagPassword=false;
    }
  }

  changeForm(action){
    console.log('action',action);
    
    this.action=action;
  }

  async registerUser(form){
    console.log('form Register', form);
    this.registerClient(form);
    
  }

  async registerClient(form) {
    // this.modalCtrl.open(this.registerUserModal, { ariaLabelledBy: 'modal-basic-title', centered: true, size: 'sm' }).result.then(async (result) => {
    //   this.closeResult = `Closed with: ${result}`;
      let url_billing;
      let client = form;
      console.log(client);
      
      if (client.cedula && client.nombres && client.apellidos && client.email) {
        if (client.cedula.length <= 13) {
          this.alert.alertWarning('Espere un momento ...', '');
          // await this.webService.getUrlEmpresa().then(async (url) => {
          //   url_billing = url;
          // });
          url_billing = this.url;
          await this.webService.validateCi(url_billing, client.cedula).then(async (resValid: any) => {
            if (!resValid.error) {
              if (this.webService.validateEmail(client.email) == true) {
                client.nombres = this.webService.convertMayuscula(client.nombres);
                client.apellidos = this.webService.convertMayuscula(client.apellidos);
                client.razonsocial = client.nombres + ' ' + client.apellidos;
                if (resValid.valor == 0) {
                  client.es_pasaporte = 1;
                }
                (await this.webService.registerClientBilling(url_billing, client)).subscribe(async (resRegist: any) => {
                  if (!resValid.error) {
                    if (resRegist.rta) {
                      let data = {
                        nombres: client.nombres,
                        apellidos: client.apellidos,
                        cedula: client.cedula,
                        email: client.email
                      }
                      await this.webService.createBodyMailRegister(this.configuracion, data).then(async (resbody) => {
                        await this.webService.sendMailService(resbody).then((resmail: any) => {
                          // console.log(resmail);
                        });
                      });
                      let login = {
                        usuario: client.cedula,
                        clave: client.cedula
                      }
                      await this.loginClient(url_billing, this.configuracion, login, 'register');
                    } else {
                      // this.toaster.warning('El cliente ya se encuentra regitrado, Inicie sesión', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
                      this.alert.alertWarning('El cliente ya se encuentra regitrado, Inicie sesión', '');

                    }
                  } else {
                    // this.toaster.error('Error al conectar con el servidos, vualva a intentarlo', '', { timeOut: 4000, positionClass: 'toast-bottom-full-width', closeButton: true, progressBar: true });
                    this.alert.alertDanger('Error al conectar con el servidos, vualva a intentarlo', '');

                  }
                });
              } else {
                this.alert.alertWarning('Correo electrónico no válido', '');

                // this.dismissModal('Registrar');
                // this.modalService.dismissAll();
                this.closeModal(true,'#modalLogin' )

              }
            } else {
              this.alert.alertWarning('Error al conectar con el servidos, vualva a intentarlo', '');

            }
          });
        } else {
          this.alert.alertDanger('El número de idenficación no puede poseer más de 13 caracteres.', '');

          // this.dismissModal('Registrar');
          this.closeModal(true,'#modalLogin' )

        }
      } else {
        this.alert.alertDanger('Campos vacios, ingrese su información', '');

        // this.dismissModal('Registrar');
        // this.modalService.dismissAll();
        this.closeModal(true,'#modalLogin' )


      }

    }
 async loginClient(url_billing, configuracion, login, type) {
    console.log('entra aquí --> ',login);
    console.log('entra configuracion --> ',configuracion);
    console.log('entra url_billing --> ',url_billing);
    
    if (login.usuario && login.clave) {
      if (type == 'login') {
        this.alert.alertWarning('Espere un momento ...', '');

      }
      await this.webService.loginCliente(url_billing, login, 'login').then(async (resclient: any) => {
        console.log('==============================', resclient );
        let user :any;
        if (!resclient.error) {
          user= resclient.data[0];
          if (resclient.rta == true) {
            // await this.webService.saveUserLocalStorage(resclient.data[0], configuracion.loginStorage, "Client").then(async (resauth: any) => {

            let nameAll = user.nombres + ' ' + user.apellidos;
            user.rol = 'Client';
            if (nameAll) {
              if (nameAll.length <= 30) {
                user.nameUser = nameAll;
              } else {
                user.nameUser = nameAll.slice(0, 30);
              }
            } else {
              user.nameUser = 'DEFAULT NAME';
            }

            let login = {
              name: user.nameUser,
              imagen: user.imagen,
              login: true,
              rol: user.rol,
              user: user
            }
            this.webService.saveToLocalStorage(configuracion.loginStorage, login )

              await this.webService.getproductsCart({ id_cliente: user.PersonaComercio_cedulaRuc }).then(async (resprod: any) => {
                if (resprod.rta == true) {
                  let observable = {
                    number: resprod.data.length,
                    total: await this.webService.calculateTotalCartProducts(resprod.data)
                  }
                  this.webService.shopcart$.next(observable);
                }
              });
              localStorage.setItem('isLoged','true');
              await this.webService.refreshPage(configuracion);
              this.alert.alertSuccess('Bienvenid@, ' + resclient.data[0].nombres, '');
              this.closeModal(true, '#modalLogin')

            // });

          } else {
            if (resclient.code == 406) {
              this.alert.alertWarning('Contraseña incorrecta, Intente nuevamente o Proceda a recuperarla',  '');

              // this.dismissModal('Recover');
              // this.modalService.dismissAll('Recover');

            } else {
              this.alert.alertWarning('Usuario no encontrado, Registrelo.', '');

              // this.modalService.dismissAll('Registrar');
              // this.returnMsjForm.emit('registrar');
            }
          }
        } else {
          this.alert.alertWarning('Ha ocurrido un error, Intente nuevamente', '');

        }
      });
    } else {
      this.alert.alertWarning('Ingrese sus credenciales', '');

    }
  }

  async loginSystemUser(form:any){
    if(this.information.esPuntoVenta==0){     
    }else{
      form.clave = form.usuario;
    }    
    this.loginForm=form
    console.log('imprime PASO 1', this.loginForm);  
    this.loginUser(form,'Login')
  }



  async loginUser(login,data){
    let url;
    if (data == 'Login') {
    
      url = this.url;
      // await this.webService.getUrlEmpresa().then(async (url_billing) => {
      //   url = url_billing
      // });
      if (this.existCliente == true) {
        // this.modalService.dismissAll(data);
        console.log('login', login);       
        await this.loginClient(url, this.configuracion, login, 'login');
      } else {
        console.log("validar");
        await this.validateClientExist(url, login.usuario);

        console.log("vino de validar", this.existCliente);
      }
    }
    if (data == 'Registrar') {
      // this.modalCtrl.dismissAll(data);
      // await this.registerClient();
    }
    if (data == 'Recover') {
      // this.modalCtrl.dismissAll(data);
      // await this.modalRecoverPassword();
    }
    if (data == 'Close') {
      // this.modalCtrl.dismissAll(data);
      this.closeModal(true,'#modalLogin' )

    }
  }

  async validateClientExist(url, cedula) {
    // this.loadingAll = true;
    await this.webService.getCustomerDataByCedula(url, cedula).then(async (resvalidate: any) => {
      if (!resvalidate.error) {
        if (resvalidate.length > 0) {
          this.existCliente = true;
          let login :any;
            login={
              'usuario':cedula,
              'clave':this.loginForm.clave,
            }
          

          await this.loginClient(url, this.configuracion, login, 'login');
          console.log('entra cuando meto cédula');
          
          this.alert.alertSuccess('Ingrese su contraseña, Por defecto es su Cédula / Ruc', '');

          // await document.getElementById('inp-password').focus();
        } else {
          this.existCliente = false;
          this.alert.alertWarning('Usuario no encontrado, Registrelo.','');
          this.action='registrar';
        }
      } else {
        this.closeModal(true,'#modalLogin' )
        this.alert.alertWarning('Ha ocurrido un error, intente nuevamente','');

      }
    });
    // this.loadingAll = false;
  }

  async loginSystem(form:any){
    await this.loginAdministrator(form, this.configuracion);
}

async loginAdministrator(login, configuracion) {
  this.alert.alertInfo('Espere un momento ...', '');
  let user :any;

  await this.webService.loginAdministrator(login).then(async (resadmin: any) => {
    if (resadmin.rta == true) {
      resadmin.data.PersonaComercio_cedulaRuc = resadmin.data.cedula;
      resadmin.data.default_price = configuracion.tipoPrecio;
      await this.webService.saveUserLocalStorage(resadmin.data, configuracion.loginStorage, "Administrator").then(async (resLocal: any) => {

      // let nameAll = user.nombres + ' ' + user.apellidos;
      // user.rol = 'Administrator';
      // if (nameAll) {
      //   if (nameAll.length <= 30) {
      //     user.nameUser = nameAll;
      //   } else {
      //     user.nameUser = nameAll.slice(0, 30);
      //   }
      // } else {
      //   user.nameUser = 'DEFAULT NAME';
      // }

      // let login = {
      //   name: user.nameUser,
      //   imagen: user.imagen,
      //   login: true,
      //   rol: user.rol,
      //   user: user
      // }
      // this.webService.saveToLocalStorage(configuracion.loginStorage, login )

        await this.webService.getproductsCart({ id_cliente: resadmin.data.cedula }).then(async (resprod: any) => {
          if (resprod.rta == true) {
            let observable = {
              number: resprod.data.length,
              total: await this.webService.calculateTotalCartProducts(resprod.data)
            }
            this.webService.shopcart$.next(observable);
          }
        });
        // await this.webService.refreshPage(configuracion);
        this.alert.alertSuccess('Bienvenid@, ' + resadmin.data.nombres, '');

        localStorage.setItem('isLoged','true');
        // await this.webService.goAdminProfile();
        this.router.navigateByUrl('administrador/datos_generales');

        this.closeModal(true, '#modalLogin');
      });
    } else {
      this.alert.alertWarning('Usuario no encontrado, Registrelo.', '');
      // this.dismissModal('Registrar');
    }
  });
}

}
