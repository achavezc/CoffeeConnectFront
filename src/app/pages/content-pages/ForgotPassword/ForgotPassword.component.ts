import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ToastaService, ToastaConfig, ToastOptions, ToastData} from 'ngx-toasta';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'embryo-ForgotPassword',
  templateUrl: './ForgotPassword.component.html',
  styleUrls: ['./ForgotPassword.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;

  popupResponse    : any;

    registerForm  : FormGroup;

   emailPattern : any = /\S+@\S+\.\S+/;

  constructor(private formGroup : FormBuilder, public authService: AuthService, public router: Router,private toastyService: ToastaService,public translate: TranslateService) { }

  ngOnInit() 
  {
    this.registerForm = this.formGroup.group({                
      email      : ['', { validators: [Validators.required, Validators.pattern(this.emailPattern)] }],
      emailRepetir    : ['', { validators: [Validators.required,Validators.pattern(this.emailPattern)]}]
   }) 
  }

  

  public submitForm() 
   {
      if(this.registerForm.valid)
      {
          this.blockUI.start("Recuperando Password...");
          /*
           this.authService.recuperarPassword(this.registerForm.controls['email'].value).subscribe(
            response => 
            {               

                if (response.StatusCode == "0") 
                {
                  this.blockUI.stop();
                  alert('El Email ingresado no se encuentra registrado.');
                  
                }
                else if (response.StatusCode == "200") 
                { 
                  this.blockUI.stop();                   
                  let toastOption: ToastOptions = {
                    title: "Recuperar password",
                    msg: "Se envió un Email para la recuperación de su password.",
                    showClose: true,
                    timeout: 1000,
                    theme: "material"
                 };
                 this.toastyService.success(toastOption);                        
                 this.registerForm.reset();
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
