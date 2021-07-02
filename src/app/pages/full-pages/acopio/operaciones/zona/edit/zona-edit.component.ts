import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";

import { SocioService } from '../../../../../../services/socio.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ILogin } from '../../../../../../services/models/login';
import { formatCurrency } from '@angular/common';
import { ZonasService } from '../../../../../../services/zonas.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
@Component({
    selector: 'app-zona-edit',
    templateUrl: './zona-edit.component.html',
    styleUrls: ['./zona-edit.component.scss', '/assets/sass/libs/datatables.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ZonaEditComponent implements OnInit {

    constructor(
        private maestroUtil: MaestroUtil,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private socioService: SocioService,
        private router: Router,
        private alertUtil: AlertUtil,
        private spinner: NgxSpinnerService,
        private maestroService: MaestroService,
        private zonasService: ZonasService) { }

        zonaEditForm: FormGroup;

    listEstado: [];
    listClasificacion: [];
    listDepartamento: [];
    listProvincia: [];
    listDistrito: [];

    responsable: any = '';
    esEdit = false;
    selectedEstado: any;
    selectedClasificacion: any;
    selectedDepartamento: any;
    selectedProvincia: any;
    selectedDistrito: any;

    activo = "01";
    vId: number = 0;
    errorGeneral = { isError: false, errorMessage: '' };
    vMensajeErrorGenerico: string = 'Ha ocurrido un error interno.';
    errorGenerico = { isError: false, msgError: '' };
    submitted
    vSessionUser: ILogin;

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
    }

     ConsultarPorId() {
        this.spinner.show();
        this.zonasService.ConsultarPorId({ ZonaId: this.vId }).subscribe((res: any) => {

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
            this.zonaEditForm.controls.departamento.setValue(data.DepartamentoId);
           await this.GetProvincias(data.DepartamentoId);
          
        }
        if (data.ProvinciaId) {
            this.zonaEditForm.controls.provincia.setValue(data.ProvinciaId);
            await this.GetDistritos(data.DepartamentoId,data.ProvinciaId)
        }
        if (data.DistritoId) {
            this.zonaEditForm.controls.distrito.setValue(data.DistritoId);
        }
        this.zonaEditForm.get('nombre').setValue(data.Nombre);
        this.zonaEditForm.controls.estado.setValue(data.EstadoId);
        this.spinner.hide();
    }

    LoadForm() {
        this.zonaEditForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
            departamento: ['', Validators.required],
            provincia: ['', Validators.required],
            distrito: ['', Validators.required],
            estado: ['', ''],
            fecRegistro: ['', ]
        });

    }

    get f() {
        return this.zonaEditForm.controls;
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
                    this.zonaEditForm.controls.estado.setValue("01");
                    this.zonaEditForm.controls.estado.disable();
                }
            });


    }

    
  onChangeDepartament(event: any): void {
    const form = this;
    this.listProvincia = [];
    this.zonaEditForm.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      if (res.Result.Success) {
        form.listProvincia = res.Result.Data;
      }
    });
  }

  onChangeProvince(event: any): void {
    const form = this;
    this.listDistrito = [];
    this.zonaEditForm.controls.distrito.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        if (res.Result.Success) {
          form.listDistrito = res.Result.Data;
        }
      });
  }

 

    Save(): void {
        const form = this;
        if (this.zonaEditForm.invalid) {
            this.submitted = true;
            this.errorGeneral = { isError: true, errorMessage: 'Por favor completar los campos OBLIGATORIOS.' };
            return;
        }
        else {
            if (this.vId <= 0) {
                form.Create();
            }
            else {

                form.Actualizar();
            }

        }
    }

    Actualizar(): void {

        var request = this.getRequest();
        this.zonasService.Actualizar(request)
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

    Create(): void {

        var request = this.getRequest();
        this.zonasService.Registrar(request)
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
            ZonaId: this.vId,
            Nombre: this.zonaEditForm.value.nombre,
            DistritoId: this.zonaEditForm.controls["distrito"].value,
            EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
            Usuario:  this.vSessionUser.Result.Data.NombreUsuario,
            EstadoId: this.zonaEditForm.controls["estado"].value,
        };
    }

    Cancel(): void {
        this.router.navigate(['/acopio/operaciones/zona-list']);
    }



    comparisonValidator(): ValidatorFn {
        return (group: FormGroup): ValidationErrors => {

            if (!group.value.nombre) {
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