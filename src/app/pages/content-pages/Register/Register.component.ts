import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'embryo-Register',
  templateUrl: './Register.component.html',
  styleUrls: ['./Register.component.scss']
})
export class RegisterComponent implements OnInit 
{

  @BlockUI() blockUI: NgBlockUI;

  popupResponse    : any;

    registerForm  : FormGroup;

   emailPattern : any = /\S+@\S+\.\S+/;

   dniPattern : any = /^[0-9]\d*$/;
   passwordPattern : any = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).{6,12}$/;

  



   tiposDocumento : any = [
    {
       id: 1,
       name:"Carnet de Extranjeria",       
       checked: false
    },
    {
      id: 2,
      name:"DNI",
      content: "2",
      checked: true
    },
    {
      id: 2,
      name:"Pasaporte",
      content: "3",
      checked: false
    }
     ]

     
    bancos : any = [
      {
        id: 1,
        name:"Banco Azteca",
        checked: true
      },
      {
        id: 2,
        name:"Banco de Comercio",
        checked: true
      }
      ,
      {
        id: 3,
        name:"Banco de Crédito del Perú",
        checked: true
      }
      ,
      {
        id: 4,
        name:"Banco Falabella",
        checked: true
      }
      ,
      {
        id: 5,
        name:"Banco GNB Perú",
        checked: true
      }
      ,
      {
        id: 6,
        name:"Banco Interamericano de Finanzas (BanBif)otiabank",
        checked: true
      }
      ,
      {
        id: 7,
        name:"Banco Pichincha",
        checked: true
      }
      ,
      {
        id: 8,
        name:"Banco Ripley",
        checked: true
      }
      ,
      {
        id: 9,
        name:"Banco Santander Perú",
        checked: true
      }
      ,
      {
        id: 10,
        name:"BBVA",
        checked: true
      }
      ,
      {
        id: 11,
        name:"Citibank Perú",
        checked: true
      }
      ,
      {
        id: 12,
        name:"CRAC CAT Perú",
        checked: true
      }
      ,
      {
        id: 13,
        name:"ICBC PERU BANK",
        checked: true
      }
      ,
      {
        id: 14,
        name:"Interbank",
        checked: true
      }
      ,
      {
        id: 15,
        name:"MiBanco",
        checked: true
      }
      ,
      {
        id: 16,
        name:"Scotiabank Perú",
        checked: true
      }
    ]

    tiposBanco : any = [
      {
        id: 1,
        name:"Local",
        checked: true
      },
      {
        id: 2,
        name:"Extranjero",
        checked: false
      }      
    ]

    selectedTiposBanco : any;

   constructor(private formGroup : FormBuilder, public authService: AuthService, public router: Router, public translate: TranslateService)
   {
     
   }

   ngOnInit() 
   {
     this.registerForm = this.formGroup.group({                
       email      : ['', { validators: [Validators.required, Validators.pattern(this.emailPattern)] }],
       password    : ['', { validators: [Validators.required,Validators.pattern(this.passwordPattern)]}],  
       nombres    : ['', { validators: [Validators.required] }],
       apellidos    : ['', { validators: [Validators.required] }],
       tipoDocumento    : ['', { validators: [Validators.required] }],
       numeroDocumento    : ['', { validators: [Validators.required,Validators.pattern(this.dniPattern),Validators.minLength(8) ,Validators.maxLength(20)] }],
       tipoBanco    : [''] ,
       banco    : [''],
       numeroCuentaBancaria    : [''],
       numeroCuentaInterbancaria    : [''] ,
       iban    : [''] ,   
       bic    : [''] ,
       codigoSwift    : [''] 
    }) 
   }

   

 public getPopupResponse(response:any) 
 {
    if(response)
     {
      this.router.navigate(['/']);  
    }
 }

 
   public submitForm() 
   {
      if(this.registerForm.valid)
      {
        /*
          this.blockUI.start("Registrando Cliente...");

           this.authService.registrarUsuario(this.registerForm.controls['email'].value,this.registerForm.controls['password'].value,
          this.registerForm.controls['apellidos'].value,this.registerForm.controls['nombres'].value,this.registerForm.controls['tipoDocumento'].value,
          this.registerForm.controls['numeroDocumento'].value,this.registerForm.controls['banco'].value,this.registerForm.controls['numeroCuentaBancaria'].value,
          this.registerForm.controls['numeroCuentaInterbancaria'].value,this.registerForm.controls['iban'].value,this.registerForm.controls['bic'].value,this.registerForm.controls['codigoSwift'].value).subscribe(
            response => 
            {     
                this.blockUI.stop();
                console.log(response);

                if (response.StatusCode == "409") 
                {
                  alert('El usuario ya existe.');
                  
                }
                else if (response.StatusCode == "200") 
                {                    
                    this.router.navigate(['/session/register-processsed']);
                } 
            });  
            */
      } 
      else 
      {
         for (let i in this.registerForm.controls) 
         {
            this.registerForm.controls[i].markAsTouched();
         }
      }
   }
  
}
