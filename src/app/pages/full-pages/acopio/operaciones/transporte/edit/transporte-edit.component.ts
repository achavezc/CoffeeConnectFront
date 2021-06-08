import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { TransporteService } from '../../../../../../services/transporte.service';

import { SocioService } from '../../../../../../services/socio.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ILogin } from '../../../../../../services/models/login';
import { formatCurrency } from '@angular/common';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
@Component({
    selector: 'app-transporte-edit',
    templateUrl: './transporte-edit.component.html',
    styleUrls: ['./transporte-edit.component.scss', '/assets/sass/libs/datatables.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TransporteEditComponent implements OnInit {

    constructor(
        private maestroUtil: MaestroUtil,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private socioService: SocioService,
        private router: Router,
        private alertUtil: AlertUtil,
        private spinner: NgxSpinnerService,
        private maestroService: MaestroService,
        private transporteService: TransporteService) { }

    transporteEditForm: FormGroup;
    listMarcaTractor: [];
    listMarcaCarreta: [];
    listEstado: [];
    listConfigVehicular: [];

    esEdit = false;
    selectedMarcaTractor: any;
    selectedMarcaCarreta: any;
    selectedEstado: any;
    selectedConfigVehicular: any;

    activo = "01";
    vId: number = 0;
    vidEmpresaTransporte: number = 0;
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
                if (Number(params.idEmpresaTransporte)) {
                    this.vidEmpresaTransporte= Number(params.idEmpresaTransporte);
                }
                if (Number(params.id)) {
                    this.vId = Number(params.id);
                    this.ConsultarPorId();
                    this.esEdit = true;
                }
            });
    }

    ConsultarPorId() {
        this.spinner.show();
        this.transporteService.ConsultarPorId({ EmpresaTransporteId: this.vId }).subscribe((res: any) => {

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

        
        if (data.DepartamentoId) {
            this.transporteEditForm.controls.departamento.setValue(data.DepartamentoId);
           
          
        }
        if (data.ProvinciaId) {
            this.transporteEditForm.controls.provincia.setValue(data.ProvinciaId);
           
        }
        if (data.DistritoId) {
            this.transporteEditForm.controls.distrito.setValue(data.DistritoId);
        }
        this.transporteEditForm.controls.nombreRazonSocial.setValue(data.RazonSocial);
        this.transporteEditForm.controls.ruc.setValue(data.Ruc);
        this.transporteEditForm.controls.direccion.setValue(data.Direccion);
        this.spinner.hide();
    }

    LoadForm() {
        this.transporteEditForm = this.fb.group({
            propietario: ['', Validators.required],
            estado: ['', Validators.required],
            marcaTractor: ['', Validators.required],
            placaTractor: ['', Validators.required],
            configVehicular: ['', Validators.required],
            marcaCarreta: ['', Validators.required],
            placaCarreta: ['', Validators.required],
            color: ['', Validators.required],
            pesoBruto: ['', Validators.required],
            altura: ['', Validators.required],
            cargaUtil: ['', Validators.required],
            pesoNeto: ['', Validators.required],
            ancho: ['', Validators.required],
            longitud: ['', Validators.required],
            conductor: ['', Validators.required],
            numeroDni: ['', Validators.required],
            licencia: ['', Validators.required],
            soat: ['', Validators.required],
            constanciaMTC: ['', Validators.required],
            numeroCelular: ['', Validators.required]
        });

    }

    get f() {
        return this.transporteEditForm.controls;
    }

    LoadCombos() {
        var form = this;
        this.maestroUtil.obtenerMaestros("MarcaVehiculo", function (res) {
          if (res.Result.Success) {
            form.listMarcaTractor = res.Result.Data;
          }
        });
        this.maestroUtil.obtenerMaestros("MarcaVehiculo", function (res) {
            if (res.Result.Success) {
              form.listMarcaCarreta = res.Result.Data;
            }
        });
        this.maestroUtil.obtenerMaestros("EstadoMaestro", function (res) {
            if (res.Result.Success) {
              form.listEstado = res.Result.Data;
            }
        });
        this.maestroUtil.obtenerMaestros("ConfiguracionVehiculo", function (res) {
            if (res.Result.Success) {
              form.listConfigVehicular = res.Result.Data;
            }
        });

    }

 

    Save(): void {
        const form = this;
        if (this.transporteEditForm.invalid) {
            this.submitted = true;
            this.errorGeneral = { isError: true, errorMessage: 'Por favor completar los campos OBLIGATORIOS.' };
            return;
        }
        else {
            if (this.vId <= 0) {
                form.CreatePrecioDia();
            }
            else {

                form.ActualizarPrecioDia();
            }

        }
    }

    ActualizarPrecioDia(): void {

        var request = this.getRequest();
        this.transporteService.Actualizar(request)
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
        this.transporteService.Registrar(request)
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
            TransporteId: this.vId,
            EmpresaTransporteId: this.vidEmpresaTransporte,
            NumeroConstanciaMTC: this.transporteEditForm.value.nombreRazonSocial ? this.transporteEditForm.value.nombreRazonSocial : '',
            MarcaTractorId: this.transporteEditForm.controls["marcaTractor"].value ? this.transporteEditForm.controls["marcaTractor"].value : '',
            PlacaTractor: this.transporteEditForm.value.placaTractor ? this.transporteEditForm.value.placaTractor : '',
            MarcaCarretaId: this.transporteEditForm.controls["marcaCarreta"].value ? this.transporteEditForm.controls["marcaCarreta"].value : '',
            PlacaCarreta: this.transporteEditForm.value.placaCarreta ? this.transporteEditForm.value.placaCarreta : '',
            ConfiguracionVehicularId: this.transporteEditForm.controls["configVehicular"].value ? this.transporteEditForm.controls["configVehicular"].value : '',
            Propietario: this.transporteEditForm.value.propietario ? this.transporteEditForm.value.propietario : '',
            Conductor: this.transporteEditForm.value.conductor ? this.transporteEditForm.value.conductor : '',
            Color: this.transporteEditForm.value.color ? this.transporteEditForm.value.color : '',
            Soat: this.transporteEditForm.value.soat ? this.transporteEditForm.value.soat : '',
            Dni: this.transporteEditForm.value.numeroDni ? this.transporteEditForm.value.numeroDni : '',
            Licencia: this.transporteEditForm.value.licencia ? this.transporteEditForm.value.licencia : '',
            NroCelular: this.transporteEditForm.value.numeroCelular ? this.transporteEditForm.value.numeroCelular : '',
            PesoBruto: Number(this.transporteEditForm.value.pesoBruto),
            PesoNeto:  Number(this.transporteEditForm.value.pesoNeto),
            CargaUtil:  Number(this.transporteEditForm.value.cargaUtil),
            Longitud: Number(this.transporteEditForm.value.longitud),
            Altura: Number(this.transporteEditForm.value.altura),
            Ancho: Number(this.transporteEditForm.value.ancho),
            EstadoId: this.transporteEditForm.controls["estado"].value ? this.transporteEditForm.controls["estado"].value : '',
            Usuario:  this.vSessionUser.Result.Data.NombreUsuario,
           
        };
    }

    Cancel(): void {
        this.router.navigate(['/acopio/operaciones/transporte-list'], { queryParams: { idEmpresaTransporte: this.vidEmpresaTransporte } });
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

