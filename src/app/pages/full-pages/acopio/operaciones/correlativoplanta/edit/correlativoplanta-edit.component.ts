import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { UbigeoService } from '../../../../../../services/ubigeo.service';
import { SocioService } from '../../../../../../services/socio.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from './../../../../../../services/auth.service';
import swal from 'sweetalert2';
import { number } from 'ngx-custom-validators/src/app/number/validator';

@Component({
  selector: 'app-ciudades-edit',
  templateUrl:'./correlativoplanta-edit.component.html',
  styleUrls: ['./correlativoplanta-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CorrelativoPlantaEditComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private ubigeoService : UbigeoService,
    private authService : AuthService) { }

  CorrelativoEditForm: FormGroup;
  precioDiaEditForm:FormGroup;
  listMoneda: [];
  listaCampania: [];  
  listaConcepto: [];
  listActivo: [];

  responsable: any = '';
  esEdit = false;
  selectedMoneda: any;
  selectedProducto: any;
  selectedEstado: any;
  selectedActivo: any;
  activo  = "01";
  CorrelativoPlantaId: number = 0;
  errorGeneral = { isError: false, errorMessage: '' };
  vMensajeErrorGenerico: string = 'Ha ocurrido un error interno.';
  errorGenerico = { isError: false, msgError: '' };
  submittedEdit
  vSessionUser: any;
  readonly: boolean;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.route.queryParams
    .subscribe(params => {
      if (Number(params.id)) {
        this.CorrelativoPlantaId = Number(params.id);
        this.ConsultarPorId();
        this.esEdit= true;
      }
    });
  //  this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.CorrelativoEditForm);
  }

  ConsultarPorId() {
    this.spinner.show();
    this.maestroService.ConsultarCorrelativoPorId({ CorrelativoPlantaId: this.CorrelativoPlantaId }).subscribe((res: any) => {
     
      if (res.Result.Success) {
         this.CompletarFormulario(res.Result.Data);
      } else {
        this.spinner.hide();
      }
    }, (err: any) => {
      this.spinner.hide();
    })
  }

  async CompletarFormulario(data: any) {

    if (data.Campanha) {
      this.CorrelativoEditForm.controls.Campanha.setValue(data.Campanha);
    }
    if (data.CodigoTipo) {
      this.CorrelativoEditForm.controls.CodigoTipo.setValue(data.CodigoTipo);
    }
    if (data.CodigoTipoConcepto) {
      this.CorrelativoEditForm.controls.CodigoTipoConcepto.setValue(data.CodigoTipoConcepto);
    }
    if (data.CantidadDigitosPlanta) {
      this.CorrelativoEditForm.controls.CantidadDigitosPlanta.setValue(data.CantidadDigitosPlanta);
    }
   
    if (data.Prefijo) {
      this.CorrelativoEditForm.controls.Prefijo.setValue(data.Prefijo);
    }
   
    if (data.Contador) {
      this.CorrelativoEditForm.controls.Contador.setValue(data.Contador);
    }
   
    if (data.Tipo) {
      this.CorrelativoEditForm.controls.Tipo.setValue(data.Tipo);
    }
    if (data.Concepto) {
      this.CorrelativoEditForm.controls.Concepto.setValue(data.Concepto);
    }
    if (data.activo) {
      this.CorrelativoEditForm.controls.activo.setValue(data.activo);
    }
   
    this.spinner.hide();
  }

  LoadForm() {
    this.CorrelativoEditForm = this.fb.group({
  
      Campanha: ['',],
      CodigoTipo: ['', ],
      CodigoTipoConcepto: ['',],
      CantidadDigitosPlanta: ['',],
      Prefijo: ['',],
      Contador: ['',],
      Concepto:['',],
      Tipo: ['',],
      Activo: ['',]
    });
    
  }

  get f() {
    return this.CorrelativoEditForm.controls;
  }

   LoadCombos() {
   this.cargaCampania();
   this.cargaConceptos();
   this.GetListEstado();
  }
  async cargaCampania() {

    var data = await this.maestroService.ConsultarCampanias("01").toPromise();
    if (data.Result.Success) {
      this.listaCampania = data.Result.Data;
    }

  }
    async cargaConceptos() {

    var data = await this.maestroService.ConsultarConceptos("01").toPromise();
    if (data.Result.Success) {
      this.listaConcepto = data.Result.Data;
    }

  }
  async GetListEstado() {
    let res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listActivo = res.Result.Data;
      this.CorrelativoEditForm.get('Activo').setValue('01');
    }
  }



  async GetPaises() {
  
  /*  const res: any = await this.maestroService.ConsultarPaisAsync().toPromise();
    if (res.Result.Success) {
      this.listProducto = res.Result.Data;
    }*/
  }

  async GetEstados() {
/*
    var data = await this.maestroService.obtenerMaestros("EstadoMaestro").toPromise();
    if (data.Result.Success) {
      this.listEstado = data.Result.Data;
    }

    this.route.queryParams
    .subscribe(params => {
      if (!Number(params.id)) {
        this.CorrelativoEditForm.controls.estado.setValue("01");
        this.CorrelativoEditForm.controls.estado.disable();
      }
    });
  */ 

  }

  Guardar(): void {
    const form = this;
    if (this.CorrelativoEditForm.invalid) {
        this.submittedEdit = true;
        this.errorGeneral = { isError: true, errorMessage: 'Por favor completar los campos OBLIGATORIOS.' };
        return;
    }
    else {
        /*
         if(!this.validarCertificaciones()){
            this.submitted = true;
            this.errorGeneral = { isError: true, errorMessage: 'Por favor completar los campos OBLIGATORIOS.' };
            return;
        }else{ */

            if (this.CorrelativoPlantaId <= 0) {
                this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.' , function (result) {
                    if (result.isConfirmed) {
                      form.Create();
                    }
                  });   
            }
            else {
                this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.' , function (result) {
                    if (result.isConfirmed) {
                      form.Actualizar();
                    }
                  });

            }

        //}
    }
}







  Actualizar(): void {
  
    var request = this.getRequest();
    this.maestroService.ActualizarCorrelativo(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("Se Actualizó!", "Se completó correctamente!",
            () => {
              this.Cancel();
            });
        } else {
          this.alertUtil.alertError("Error!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
    
}

  Create(): void {
    
      var request = this.getRequest();
      this.maestroService.RegistrarCorrelativo(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            this.alertUtil.alertOkCallback("Registrado!", "Se completó el registro correctamente!",
              () => {
                this.Cancel();
              });
          } else {
            this.alertUtil.alertError("Error!", res.Result.Message);
          }
        }, (err: any) => {
          console.log(err);
          this.spinner.hide();
        });
    
  }


  getRequest(): any {
    var ActivoFinal =false; 
    if(this.CorrelativoEditForm.value.Activo == "01" )
    {
       ActivoFinal = true;
    }
    return {
      CorrelativoPlantaId: this.CorrelativoPlantaId ,
      Campanha: this.CorrelativoEditForm.value.Campanha ? this.CorrelativoEditForm.value.Campanha : '',
      CodigoTipo: this.CorrelativoEditForm.value.CodigoTipo ? this.CorrelativoEditForm.value.CodigoTipo : '',
      
      CodigoTipoConcepto: this.CorrelativoEditForm.value.CodigoTipoConcepto ? this.CorrelativoEditForm.value.CodigoTipoConcepto : '',
      CantidadDigitosPlanta: String( this.CorrelativoEditForm.value.CantidadDigitosPlanta )?String( this.CorrelativoEditForm.value.CantidadDigitosPlanta) : '8',    
      Prefijo:  this.CorrelativoEditForm.value.CodigoTipo ? this.CorrelativoEditForm.value.CodigoTipo : '',
      Contador: this.CorrelativoEditForm.value.Contador ? this.CorrelativoEditForm.value.Contador : '',
      Tipo: this.CorrelativoEditForm.value.Tipo ? this.CorrelativoEditForm.value.Tipo : '',
      Concepto: this.CorrelativoEditForm.value.Concepto ? this.CorrelativoEditForm.value.Concepto : '',
      Activo: ActivoFinal
    };
  }

  Cancel(): void {
    this.router.navigate(['/acopio/operaciones/correlativoplanta-list']);
  }

 

 // comparisonValidator(): ValidatorFn {
    /*
    return (group: FormGroup): ValidationErrors => {

      if (!group.value.mCodProductor && !group.value.mNombRazonSocial && !group.value.mTipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar al menos un filtro.' };
      } else if (group.value.mNroDocumento && !group.value.mTipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un tipo de documento.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };*/
  //}

}