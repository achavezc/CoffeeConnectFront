import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { EmpresaProveedoraService } from '../../../../../../services/empresaproveedora.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { SocioService } from '../../../../../../services/socio.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ILogin } from '../../../../../../services/models/login';
import { formatCurrency } from '@angular/common';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
@Component({
    selector: 'app-empresaproveedora-edit',
    templateUrl: './empresaproveedora-edit.component.html',
    styleUrls: ['./empresaproveedora-edit.component.scss', '/assets/sass/libs/datatables.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EmpresaProveedoraEditComponent implements OnInit {

    constructor(
        private maestroUtil: MaestroUtil,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private socioService: SocioService,
        private router: Router,
        private alertUtil: AlertUtil,
        private spinner: NgxSpinnerService,
        private maestroService: MaestroService,
        private empresaProveedoraService: EmpresaProveedoraService) { }

    empresaProveedoraEditForm: FormGroup;

    listEstado: [];
    listClasificacion: [];
    listDepartamento: [];
    listProvincia: [];
    listDistrito: [];
    listTipoCertificacion: [];
    responsable: any = '';
    esEdit = false;
    selectedEstado: any;
    selectedClasificacion: any;
    selectedDepartamento: any;
    selectedProvincia: any;
    selectedDistrito: any;
    selectedTipoCertificacion: any;
    rowsDetails = [];
    isLoading = false;
    activo = "01";
    vId: number = 0;
    errorGeneral = { isError: false, errorMessage: '' };
    vMensajeErrorGenerico: string = 'Ha ocurrido un error interno.';
    errorGenerico = { isError: false, msgError: '' };
    submitted
    vSessionUser: ILogin;
    
    @ViewChild(DatatableComponent) tblDetails: DatatableComponent;

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
        this.empresaProveedoraService.ConsultarPorId({ EmpresaProveedoraAcreedoraId: this.vId }).subscribe((res: any) => {

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
            this.empresaProveedoraEditForm.controls.departamento.setValue(data.DepartamentoId);
            await this.GetProvincias(data.DepartamentoId);

        }
        if (data.ProvinciaId) {
            this.empresaProveedoraEditForm.controls.provincia.setValue(data.ProvinciaId);
            await this.GetDistritos(data.DepartamentoId, data.ProvinciaId)
        }
        if (data.DistritoId) {
            this.empresaProveedoraEditForm.controls.distrito.setValue(data.DistritoId);
        }
        if (data.ClasificacionId) {
            this.empresaProveedoraEditForm.controls.clasificacion.setValue(data.ClasificacionId);
        }
        this.empresaProveedoraEditForm.controls.nombreRazonSocial.setValue(data.RazonSocial);
        this.empresaProveedoraEditForm.controls.ruc.setValue(data.Ruc);
        this.empresaProveedoraEditForm.controls.direccion.setValue(data.Direccion);
        this.empresaProveedoraEditForm.controls.estado.setValue(data.EstadoId);
        await this.GetTipoCertificacion();
        this.rowsDetails = data.Certificaciones;
        this.spinner.hide();
    }

    LoadForm() {
        this.empresaProveedoraEditForm = this.fb.group({
            nombreRazonSocial: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
            ruc: ['', Validators.required],
            direccion: ['', Validators.required],
            departamento: ['', Validators.required],
            provincia: ['', Validators.required],
            distrito: ['', Validators.required],
            clasificacion: ['', Validators.required],
            estado: ['',],
            fecRegistro: ['',]
        });

    }

    get f() {
        return this.empresaProveedoraEditForm.controls;
    }

    LoadCombos() {
        this.GetDepartments();
        this.GetClasificacion();
        this.GetEstados();
        this.GetTipoCertificacion();
    }

    async GetClasificacion() {
        let res = await this.maestroService.obtenerMaestros('ClasificacionEmpresaProveedoraAcreedora').toPromise();
        if (res.Result.Success) {
            this.listClasificacion = res.Result.Data;
        }
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

    async GetDistritos(codigoDepartamento: any, codigoProvincia: any) {
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
                    this.empresaProveedoraEditForm.controls.estado.setValue("01");
                    this.empresaProveedoraEditForm.controls.estado.disable();
                }
            });


    }
    async GetTipoCertificacion() {
        let res = await this.maestroService.obtenerMaestros('TipoCertificacion').toPromise();
        if (res.Result.Success) {
            this.listTipoCertificacion = res.Result.Data;
        }
    }

    
    addRowDetail(): void {
        this.rowsDetails = [...this.rowsDetails, {
            TipoCertificacionId: "01",
            CodigoCertificacion: ""
        }];
    }

    UpdateValuesGridDetails(event: any, index: any, prop: any): void {
        if (prop === 'TipoCertificacionId')
            this.rowsDetails[index].TipoCertificacionId = event.target.value;
        else if (prop === 'CodigoCertificacion')
            this.rowsDetails[index].CodigoCertificacion = event.target.value;

    }
    
    DeleteRowDetail(index: any): void {
        this.rowsDetails.splice(index, 1);
        this.rowsDetails = [...this.rowsDetails];
    }


    onChangeDepartament(event: any): void {
        const form = this;
        this.listProvincia = [];
        this.empresaProveedoraEditForm.controls.provincia.reset();
        this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
            if (res.Result.Success) {
                form.listProvincia = res.Result.Data;
            }
        });
    }

    onChangeProvince(event: any): void {
        const form = this;
        this.listDistrito = [];
        this.empresaProveedoraEditForm.controls.distrito.reset();
        this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
            (res: any) => {
                if (res.Result.Success) {
                    form.listDistrito = res.Result.Data;
                }
            });
    }



    Save(): void {
        const form = this;
        if (this.empresaProveedoraEditForm.invalid) {
            this.submitted = true;
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

                if (this.vId <= 0) {
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
        this.empresaProveedoraService.Actualizar(request)
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
        this.empresaProveedoraService.Registrar(request)
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

    validarCertificaciones(){
        var result = false;
        var lstCert = this.rowsDetails.filter(x => x.TipoCertificacionId
            && x.CodigoCertificacion);
        if(lstCert.length > 0){
            result = true;
        }
        return result;
    }

    getRequest(): any {
        var lstCert = this.rowsDetails.filter(x => x.TipoCertificacionId )
            lstCert.forEach( x => x.EmpresaProveedoraAcreedoraId = this.vId)  ;
            
        return {
            EmpresaProveedoraAcreedoraId: this.vId,
            RazonSocial: this.empresaProveedoraEditForm.value.nombreRazonSocial ? this.empresaProveedoraEditForm.value.nombreRazonSocial : '',
            Ruc: this.empresaProveedoraEditForm.value.ruc ? this.empresaProveedoraEditForm.value.ruc : '',
            Direccion: this.empresaProveedoraEditForm.value.direccion ? this.empresaProveedoraEditForm.value.direccion : '',
            DepartamentoId: this.empresaProveedoraEditForm.controls["departamento"].value ? this.empresaProveedoraEditForm.controls["departamento"].value : '',
            ProvinciaId: this.empresaProveedoraEditForm.controls["provincia"].value ? this.empresaProveedoraEditForm.controls["provincia"].value : '',
            DistritoId: this.empresaProveedoraEditForm.controls["distrito"].value ? this.empresaProveedoraEditForm.controls["distrito"].value : '',
            EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
            Usuario: this.vSessionUser.Result.Data.NombreUsuario,
            EstadoId: this.empresaProveedoraEditForm.controls["estado"].value ? this.empresaProveedoraEditForm.controls["estado"].value : '',
            ClasificacionId: this.empresaProveedoraEditForm.controls["clasificacion"].value ? this.empresaProveedoraEditForm.controls["clasificacion"].value : '',
            Certificaciones: lstCert

        };
    }

    Cancel(): void {
        this.router.navigate(['/acopio/operaciones/empresaproveedora-list']);
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

