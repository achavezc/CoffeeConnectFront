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

@Component({
  selector: 'app-ciudades-edit',
  templateUrl: './ciudades-edit.component.html',
  styleUrls: ['./ciudades-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CiudadesEditComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private ubigeoService : UbigeoService,
    private authService : AuthService) { }

  precioDiaEditForm: FormGroup;
  listMoneda: [];
  listProducto: [];  
  listEstado: [];
  listSubProducto: [];
  responsable: any = '';
  esEdit = false;
  selectedMoneda: any;
  selectedProducto: any;
  selectedEstado: any;
  selectedSubProducto: any;
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
    this.route.queryParams
    .subscribe(params => {
      if (Number(params.id)) {
        this.vId = Number(params.id);
        this.ConsultarPorId();
        this.esEdit= true;
      }
    });
    ////this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.precioDiaEditForm);
  }

  ConsultarPorId() {
    this.spinner.show();
    this.ubigeoService.ConsultarPorId({ UbigeoId: this.vId }).subscribe((res: any) => {
     
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

    if (data.Codigo) {
      this.precioDiaEditForm.controls.codigo.setValue(data.Codigo);
    }
    if (data.Descripcion) {
      this.precioDiaEditForm.controls.descripcion.setValue(data.Descripcion);
    }
    if (data.CodigoPais) {
      this.precioDiaEditForm.controls.producto.setValue(data.CodigoPais);
    }
    if (data.EstadoRegistro) {
      this.precioDiaEditForm.controls.estado.setValue("01");
    }
   
    this.spinner.hide();
  }

  LoadForm() {
    this.precioDiaEditForm = this.fb.group({
      codigo: ['', ],
      descripcion: ['',Validators.required],
      producto: ['', Validators.required],
      estado: ['',Validators.required]
    });
    
  }

  get f() {
    return this.precioDiaEditForm.controls;
  }

   LoadCombos() {
   this.GetPaises();
   this.GetEstados();
  }

  async GetPaises() {
    const res: any = await this.maestroService.ConsultarPaisAsync().toPromise();
    if (res.Result.Success) {
      this.listProducto = res.Result.Data;
    }
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
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con el registro?.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#2F8BE6',
          cancelButtonColor: '#F55252',
          confirmButtonText: 'Si',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
            form.CreatePrecioDia();
          }
        });
      }
      else{

        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la actualización?.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#2F8BE6',
          cancelButtonColor: '#F55252',
          confirmButtonText: 'Si',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
             form.ActualizarPrecioDia();
          }
        });
       
      }
          
    }    
  }

  ActualizarPrecioDia(): void {
    
    var request = this.getRequest();
    this.ubigeoService.Actualizar(request)
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

  CreatePrecioDia(): void {
    
      var request = this.getRequest();
      this.ubigeoService.Registrar(request)
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
    return {
      IdUbigeo: this.vId ,
      Codigo: this.precioDiaEditForm.value.codigo ? this.precioDiaEditForm.value.codigo : '',
      Descripcion: this.precioDiaEditForm.value.descripcion ? this.precioDiaEditForm.value.descripcion : '',
      UsuarioCreacion: this.vSessionUser.Result.Data.NombreUsuario,
      FechaHoraCreacion: new Date(),
      Usuario:  this.vSessionUser.Result.Data.NombreUsuario,
      EstadoRegistro: true,
      CodigoPais: this.precioDiaEditForm.controls["producto"].value ? this.precioDiaEditForm.controls["producto"].value: '',
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId
    };
  }

  Cancel(): void {
    this.router.navigate(['/acopio/operaciones/ciudades-list']);
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
