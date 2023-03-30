import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { TransporteService } from '../../../../../../services/transporte.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from './../../../../../../services/auth.service';
@Component({
    selector: 'app-transporte-edit',
    templateUrl: './transporte-edit.component.html',
    styleUrls: ['./transporte-edit.component.scss', '/assets/sass/libs/datatables.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TransporteEditComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private router: Router,
        private alertUtil: AlertUtil,
        private spinner: NgxSpinnerService,
        private maestroService: MaestroService,
        private transporteService: TransporteService,
        private authService : AuthService) { }

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
    vSessionUser: any;
    readonly: boolean;

    ngOnInit() {
    this.LoadForm();
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
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura,this.transporteEditForm);
    }

    ConsultarPorId() {
        this.spinner.show();
        this.transporteService.ConsultarPorId({ TransporteId: this.vId }).subscribe((res: any) => {

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
        await this.cargarMarcaVehiculo();
        await this.cargarMarcaCarreta();
        await this.cargarEstado();
        await this.cargarConfiguracion();
        this.transporteEditForm.controls.propietario.setValue(data.Propietario);
        this.transporteEditForm.controls.estado.setValue(data.EstadoId);
        this.transporteEditForm.controls.marcaTractor.setValue(data.MarcaTractorId);
        this.transporteEditForm.controls.placaTractor.setValue(data.PlacaTractor);
        this.transporteEditForm.controls.configVehicular.setValue(data.ConfiguracionVehicularId);
        this.transporteEditForm.controls.marcaCarreta.setValue(data.MarcaCarretaId);
        this.transporteEditForm.controls.placaCarreta.setValue(data.PlacaCarreta);
        this.transporteEditForm.controls.color.setValue(data.Color);
        this.transporteEditForm.controls.pesoBruto.setValue(data.PesoBruto);
        this.transporteEditForm.controls.altura.setValue(data.Altura);
        this.transporteEditForm.controls.cargaUtil.setValue(data.CargaUtil);
        this.transporteEditForm.controls.pesoNeto.setValue(data.PesoNeto);
        this.transporteEditForm.controls.ancho.setValue(data.Ancho);
        this.transporteEditForm.controls.longitud.setValue(data.Longitud);
        this.transporteEditForm.controls.conductor.setValue(data.Conductor);
        this.transporteEditForm.controls.numeroDni.setValue(data.Dni);
        this.transporteEditForm.controls.licencia.setValue(data.Licencia);
        this.transporteEditForm.controls.soat.setValue(data.Soat);
        this.transporteEditForm.controls.constanciaMTC.setValue(data.NumeroConstanciaMTC);
        this.transporteEditForm.controls.numeroCelular.setValue(data.NroCelular);
        this.spinner.hide();
    }

   async LoadForm() {
        this.transporteEditForm = this.fb.group({
            propietario: ['', Validators.required],
            estado: ['', Validators.required],
            marcaTractor: ['', Validators.required],
            placaTractor: ['', Validators.required],
            configVehicular: ['', Validators.required],
            marcaCarreta: ['', ],
            placaCarreta: ['', ],
            color: ['', ],
            //color: ['', Validators.required],
            pesoBruto: ['', ],
            altura: ['', ],
            cargaUtil: ['', ],
            pesoNeto: ['', ],
            ancho: ['', ],
            longitud: ['', ],
            conductor: ['', Validators.required],
            numeroDni: ['', Validators.required],
            //licencia: ['', Validators.required],
            licencia: ['', ],
            //soat: ['', Validators.required],
            soat: ['', ],
            //constanciaMTC: ['', Validators.required],
            constanciaMTC: ['', ],
            numeroCelular: ['', ]

            
        });
       await this.LoadCombos();
    }

    get f() {
        return this.transporteEditForm.controls;
    }

   async LoadCombos() {
        await this.cargarMarcaVehiculo();
        await this.cargarMarcaCarreta();
        await this.cargarEstado();
        await this.cargarConfiguracion();
    }

 
    async cargarMarcaVehiculo(){
          var form = this;
        var dataMarcaVehiculo = await this.maestroService.obtenerMaestros("MarcaVehiculo").toPromise();
          if (dataMarcaVehiculo) {
              form.listMarcaTractor = dataMarcaVehiculo.Result.Data;
            }
    }
 
    async cargarMarcaCarreta(){
        var form = this;
        var dataMarcaCarreta = await this.maestroService.obtenerMaestros("MarcaVehiculo").toPromise();
        if (dataMarcaCarreta) {
            form.listMarcaCarreta = dataMarcaCarreta.Result.Data;
          }
     }

     async cargarEstado(){
        var form = this;
        var dataEstado = await this.maestroService.obtenerMaestros("EstadoMaestro").toPromise();
        if (dataEstado) {
            form.listEstado = dataEstado.Result.Data;
          }
          if(!this.vId)
          {
              this.transporteEditForm.controls.estado.setValue(this.activo);
          }
     }
     async cargarConfiguracion(){
        var form = this;
        var dataConfVehiculo = await this.maestroService.obtenerMaestros("ConfiguracionVehiculo").toPromise();
        if (dataConfVehiculo) {
            form.listConfigVehicular = dataConfVehiculo.Result.Data;
          }
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

        }
    }

    Actualizar(): void {

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

    Create(): void {

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
            NumeroConstanciaMTC: this.transporteEditForm.value.constanciaMTC ? this.transporteEditForm.value.constanciaMTC : '',
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

