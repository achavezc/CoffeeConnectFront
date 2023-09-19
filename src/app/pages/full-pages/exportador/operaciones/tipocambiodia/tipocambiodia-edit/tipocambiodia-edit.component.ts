import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { TipoCambioDiaService } from '../../../../../../services/tipocambiodia.service';
import {AuthService} from './../../../../../../services/auth.service';
import { SocioService } from '../../../../../../services/socio.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';

@Component({
  selector: 'app-tipocambiodia-edit',
  templateUrl: './tipocambiodia-edit.component.html',
  styleUrls: ['./tipocambiodia-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TipoCambioDiaEditComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private socioService: SocioService,
    private router: Router,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private tipoCambioDiaService : TipoCambioDiaService,
    private authService : AuthService) { }

  precioDiaEditForm: FormGroup;  
  listEstado: [];  
  responsable: any = '';
  esEdit = false;
  selectedEstado: any;
  activo  = "01";
  vId: number = 0;
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
    //this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
    this.route.queryParams
    .subscribe(params => {
      if (Number(params.id)) {
        this.vId = Number(params.id);
        this.ConsultarPorId();
        this.esEdit= true;
      }
    });
  }

  ConsultarPorId() {
    this.spinner.show();
    this.tipoCambioDiaService.ConsultarPorId({ TipoCambioDiaId: this.vId }).subscribe((res: any) => {
     
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

    this.responsable = data.UsuarioRegistro;
    
    if (data.Monto) {
      this.precioDiaEditForm.controls.monto.setValue(data.Monto);
    }
    if (data.EstadoId) {
      this.precioDiaEditForm.controls.estado.setValue(data.EstadoId);
    }
    if (data.FechaRegistro) {
      this.precioDiaEditForm.controls.fecRegistro.setValue(data.FechaRegistro.substring(0, 10));
    }
    if (data.Fecha) {
      this.precioDiaEditForm.controls.fecha.setValue(data.Fecha.substring(0, 10));
    }


    this.spinner.hide();
  }

  LoadForm() {
    this.precioDiaEditForm = this.fb.group({
      
      monto: ['',Validators.required],
      estado: ['',Validators.required],
      fecha: ['',Validators.required],
      fecRegistro: ['']
    });
    
  }

  get f() {
    return this.precioDiaEditForm.controls;
  }

   LoadCombos() { 
   this.GetEstados();
  }

  
  async GetEstados() {

    var data = await this.maestroService.obtenerMaestros("EstadoMaestro").toPromise();
    if (data.Result.Success) {
      this.listEstado = data.Result.Data;
    }

    this.route.queryParams
    .subscribe(params => {
      if (!Number(params.id)) {
        this.precioDiaEditForm.controls.estado.setValue("01");
        this.precioDiaEditForm.controls.estado.disable();
      }
    });
   

  }

  Save(): void {
    const form = this;
    if (this.precioDiaEditForm.invalid) {
      this.submittedEdit = true;
      this.errorGeneral = { isError: true, errorMessage: 'Por favor completar los campos OBLIGATORIOS.' };
      return;
      } 
    else 
    {
      if (this.vId <= 0)
      {
        form.CreatePrecioDia();
      }
      else{

        form.ActualizarPrecioDia();
      }
          
    }    
  }

  ActualizarPrecioDia(): void {
    
    var request = this.getRequest();
    this.tipoCambioDiaService.Actualizar(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("Se Actualizo!", "Se completo correctamente!",
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

  CreatePrecioDia(): void {
    
      var request = this.getRequest();
      this.tipoCambioDiaService.Registrar(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            this.alertUtil.alertOkCallback("Registrado!", "Se completo el registro correctamente!",
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
    return {
      TipoCambioDiaId: this.vId ,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
      EstadoId: this.precioDiaEditForm.controls["estado"].value ? this.precioDiaEditForm.controls["estado"].value: '',
      Monto: this.precioDiaEditForm.value.monto ? this.precioDiaEditForm.value.monto : '',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      Fecha: this.precioDiaEditForm.value.fecha ? this.precioDiaEditForm.value.fecha : ''
     
    };
  }

  Cancel(): void {
    this.router.navigate(['/exportador/operaciones/tipocambiodia/list']);
  }

 

  comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {

      if (!group.value.mCodProductor && !group.value.mNombRazonSocial && !group.value.mTipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar al menos un filtro.' };
      } else if (group.value.mNroDocumento && !group.value.mTipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un tipo de documento.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

}
