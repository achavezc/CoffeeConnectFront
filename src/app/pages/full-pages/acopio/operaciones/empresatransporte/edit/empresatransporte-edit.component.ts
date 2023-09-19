import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { EmpresaTransporteService } from '../../../../../../services/empresatransporte.service';
import { SocioService } from '../../../../../../services/socio.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from './../../../../../../services/auth.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';

@Component({
    selector: 'app-empresatransporte-edit',
    templateUrl: './empresatransporte-edit.component.html',
    styleUrls: ['./empresatransporte-edit.component.scss', '/assets/sass/libs/datatables.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EmpresaTransporteEditComponent implements OnInit {

    constructor(
        private maestroUtil: MaestroUtil,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private socioService: SocioService,
        private router: Router,
        private alertUtil: AlertUtil,
        private spinner: NgxSpinnerService,
        private maestroService: MaestroService,
        private empresaTransporteService: EmpresaTransporteService,
        private authService : AuthService) { }

    empresaTransporteEditForm: FormGroup;
    listMoneda: [];
    listProducto: [];
    listEstado: [];
    listSubProducto: [];

    listDepartamento: [];
    listProvincia: [];
    listDistrito: [];

    responsable: any = '';
    esEdit = false;
    selectedMoneda: any;
    selectedProducto: any;
    selectedEstado: any;
    selectedSubProducto: any;

    selectedDepartamento: any;
    selectedProvincia: any;
    selectedDistrito: any;

    activo = "01";
    vId: number = 0;
    errorGeneral = { isError: false, errorMessage: '' };
    vMensajeErrorGenerico: string = 'Ha ocurrido un error interno.';
    errorGenerico = { isError: false, msgError: '' };
    submitted
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
                    this.esEdit = true;
                }
            });
            //this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura,this.empresaTransporteEditForm );
    }

    ConsultarPorId() {
        this.spinner.show();
        this.empresaTransporteService.ConsultarPorId({ EmpresaTransporteId: this.vId }).subscribe((res: any) => {

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
        
        if (data.DepartamentoId) {
            this.empresaTransporteEditForm.controls.departamento.setValue(data.DepartamentoId);
            await this.GetProvincias(data.DepartamentoId);
          
        }
        if (data.ProvinciaId) {
            this.empresaTransporteEditForm.controls.provincia.setValue(data.ProvinciaId);
            await this.GetDistritos(data.DepartamentoId,data.ProvinciaId)
        }
        if (data.DistritoId) {
            this.empresaTransporteEditForm.controls.distrito.setValue(data.DistritoId);
        }
        this.empresaTransporteEditForm.controls.nombreRazonSocial.setValue(data.RazonSocial);
        this.empresaTransporteEditForm.controls.ruc.setValue(data.Ruc);
        this.empresaTransporteEditForm.controls.direccion.setValue(data.Direccion);
        this.empresaTransporteEditForm.controls.estado.setValue(data.EstadoId);
        this.spinner.hide();
    }

    LoadForm() {
        this.empresaTransporteEditForm = this.fb.group({
            nombreRazonSocial: ['', Validators.required],
            ruc: ['', Validators.required],
            direccion: ['', Validators.required],
            departamento: ['', Validators.required],
            provincia: ['', Validators.required],
            distrito: ['', Validators.required],
            estado: ['', ],
            fecRegistro: ['', ]
        });

    }

    get f() {
        return this.empresaTransporteEditForm.controls;
    }

    LoadCombos() {
        this.GetDepartments();
        this.GetEstados();
    }

  
    async GetDepartments() {
        this.listDepartamento = [];
        const res: any = await this.maestroUtil.GetDepartmentsAsync('PE');
        if (res.Result.Success) {
          this.listDepartamento = res.Result.Data;
        }
      }
    
      async GetProvincias(codigoDepartamento: any) {
        this.listProvincia = [];
        const res: any = await this.maestroUtil.GetProvincesAsync(codigoDepartamento, 'PE');
        if (res.Result.Success) {
          this.listProvincia = res.Result.Data;
        }
      }
    
      async GetDistritos(codigoDepartamento: any,codigoProvincia: any) {
        this.listDistrito = [];
        const res: any = await this.maestroUtil.GetDistrictsAsync(codigoDepartamento, codigoProvincia, 'PE');
        if (res.Result.Success) {
          this.listDistrito = res.Result.Data;
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
                    this.empresaTransporteEditForm.controls.estado.setValue("01");
                    this.empresaTransporteEditForm.controls.estado.disable();
                }
            });


    }

    
  onChangeDepartament(event: any): void {
    const form = this;
    this.listProvincia = [];
    this.empresaTransporteEditForm.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      if (res.Result.Success) {
        form.listProvincia = res.Result.Data;
      }
    });
  }

  onChangeProvince(event: any): void {
    const form = this;
    this.listDistrito = [];
    this.empresaTransporteEditForm.controls.distrito.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        if (res.Result.Success) {
          form.listDistrito = res.Result.Data;
        }
      });
  }

 

    Save(): void {
        const form = this;
        if (this.empresaTransporteEditForm.invalid) {
            this.submitted = true;
            this.errorGeneral = { isError: true, errorMessage: 'Por favor completar los campos OBLIGATORIOS.' };
            return;
        }
        else {
            if (this.vId <= 0) {
                this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.' , function (result) {
                    if (result.isConfirmed) {
                      form.CreatePrecioDia();
                    }
                  });   
            }
            else {

                this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.' , function (result) {
                    if (result.isConfirmed) {
                      form.ActualizarPrecioDia();
                    }
                  });
            }

        }
    }

    ActualizarPrecioDia(): void {

        var request = this.getRequest();
        this.empresaTransporteService.Actualizar(request)
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
        this.empresaTransporteService.Registrar(request)
            .subscribe((res: any) => {
                this.spinner.hide();
                //if (res.Result.Success) 
                if (res.Result.Success && (!res.Result.ErrCode || res.Result.ErrCode === '00'))
                {
                    this.alertUtil.alertOkCallback("Registrado!", "Se completo el registro correctamente!",
                        () => {
                            this.Cancel();
                        });
                }
                 else 
                {
                    this.alertUtil.alertError("Error!", res.Result.Message);
                }
            }, (err: any) => {
                console.log(err);
                this.spinner.hide();
            });

    }


    getRequest(): any {
        return {
            EmpresaTransporteId: this.vId,
            RazonSocial: this.empresaTransporteEditForm.value.nombreRazonSocial ? this.empresaTransporteEditForm.value.nombreRazonSocial : '',
            Ruc: this.empresaTransporteEditForm.value.ruc ? this.empresaTransporteEditForm.value.ruc : '',
            Direccion: this.empresaTransporteEditForm.value.direccion ? this.empresaTransporteEditForm.value.direccion : '',
            DepartamentoId: this.empresaTransporteEditForm.controls["departamento"].value ? this.empresaTransporteEditForm.controls["departamento"].value : '',
            ProvinciaId: this.empresaTransporteEditForm.controls["provincia"].value ? this.empresaTransporteEditForm.controls["provincia"].value : '',
            DistritoId: this.empresaTransporteEditForm.controls["distrito"].value ? this.empresaTransporteEditForm.controls["distrito"].value : '',
            EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
            Usuario:  this.vSessionUser.Result.Data.NombreUsuario,
            EstadoId: this.empresaTransporteEditForm.controls["estado"].value
        };
    }

    Cancel(): void {
        this.router.navigate(['/acopio/operaciones/empresatransporte-list']);
    }

    Transportista(): void {
        this.router.navigate(['/acopio/operaciones/transporte-list'], { queryParams: { idEmpresaTransporte: this.vId } });
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

