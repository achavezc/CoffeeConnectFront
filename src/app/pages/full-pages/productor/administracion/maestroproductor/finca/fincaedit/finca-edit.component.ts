import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { MaestroService } from '../../../../../../../services/maestro.service';
import { ProductorFincaService } from '../../../../../../../services/productor-finca.service';
import { AlertUtil } from '../../../../../../../services/util/alert-util';

@Component({
  selector: 'app-finca-edit',
  templateUrl: './finca-edit.component.html',
  styleUrls: ['./finca-edit.component.scss']
})
export class FincaEditComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private maestroService: MaestroService,
    private productorFincaService: ProductorFincaService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private router: Router) { }

  fincaEditForm: any;
  listDepartamentos: any[];
  listProvincias: any[];
  listFuentesEnergia: any[];
  listDistritos: any[];
  listFuentesAgua: any[];
  listZonas: any[];
  listInternet: any[];
  listSenialTelefonica: any[];
  listEstableSalud: any[];
  listFlagsCentroEducativo: any[];
  listCentrosEducativos: any[];
  listEstados: any[];
  selectedDepartamento: any;
  selectedProvincia: any;
  selectedFuenteEnergia: any;
  selectedDistrito: any;
  selectedFuenteAgua: any;
  selectedZona: any;
  selectedInternet: any;
  selectedSenialTelefonica: any;
  selectedEstableSalud: any;
  selectedFlagCentroEdu: any;
  selectedCentroEdu: any;
  selectedEstado: any;
  vId: number;
  vCodProductor: number;
  errorGeneral = { isError: false, msgError: '' };
  vSessionUser: any;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseInt(this.route.snapshot.params['id']) : 0
    this.LoadForm();
    this.LoadCombos();
    this.AddValidations();
    this.vCodProductor = undefined;
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    if (this.vId > 0) {
      this.SearchProducerFincaById();
    } else {
      this.route.queryParams.subscribe((res: any) => {
        this.vCodProductor = parseInt(res.codProductor)
      });
    }
  }

  LoadForm(): void {
    this.fincaEditForm = this.fb.group({
      idProductorFinca: [],
      idProductor: [],
      nombreFinca: ['', [Validators.required]],
      latitud: [],
      direccion: ['', [Validators.required]],
      longitud: [],
      departamento: ['', [Validators.required]],
      altitud: [],
      provincia: ['', [Validators.required]],
      fuenteEnergia: [],
      distrito: ['', [Validators.required]],
      fuenteAgua: [],
      zona: ['', [Validators.required]],
      nroAnimalesMenores: [],
      materialVivienda: [],
      fInternet: [],
      suelo: [],
      senialTelefonica: [],
      establecimientoSalud: [],
      tiempoUnidadCentroSalud: [],
      fCentroEducativo: [],
      centroEducativo: [],
      estado: ['', [Validators.required]]
    });
  }

  get f() {
    return this.fincaEditForm.controls;
  }

  async GetDepartments() {
    this.listDepartamentos = [];
    const res: any = await this.maestroUtil.GetDepartmentsAsync('PE');
    if (res.Result.Success) {
      this.listDepartamentos = res.Result.Data;
    }
  }

  async GetProvincias() {
    this.listProvincias = [];
    const res: any = await this.maestroUtil.GetProvincesAsync(this.selectedDepartamento, 'PE');
    if (res.Result.Success) {
      this.listProvincias = res.Result.Data;
    }
  }

  async GetDistritos() {
    this.listDistritos = [];
    const res: any = await this.maestroUtil.GetDistrictsAsync(this.selectedDepartamento, this.selectedProvincia, 'PE');
    if (res.Result.Success) {
      this.listDistritos = res.Result.Data;
    }
  }

  async GetZonas() {
    this.listZonas = [];
    const res: any = await this.maestroUtil.GetZonasAsync(this.selectedDistrito);
    if (res.Result.Success) {
      this.listZonas = res.Result.Data;
    }
  }

  async LoadCombos() {
    let res: any = {};
    this.GetDepartments();
    res = await this.maestroService.obtenerMaestros('NivelEducativo').toPromise();
    if (res.Result.Success) {
      this.listCentrosEducativos = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      if (this.vId <= 0) {
        this.fincaEditForm.controls.estado.setValue('01');
      }
    }

    res = await this.maestroService.obtenerMaestros('FuenteEnergia').toPromise();
    if (res.Result.Success) {
      this.listFuentesEnergia = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('FuenteAgua').toPromise();
    if (res.Result.Success) {
      this.listFuentesAgua = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('SiNo').toPromise();
    if (res.Result.Success) {
      this.listInternet = res.Result.Data;
      this.listEstableSalud = res.Result.Data;
      this.listFlagsCentroEducativo = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('ProveedorTelefonia').toPromise();
    if (res.Result.Success) {
      this.listSenialTelefonica = res.Result.Data;
    }
  }

  onChangeDepartament(event: any): void {
    this.spinner.show();
    const form = this;
    this.listProvincias = [];
    this.listDistritos = [];
    this.listZonas = [];
    this.fincaEditForm.controls.distrito.reset();
    this.fincaEditForm.controls.zona.reset();
    this.fincaEditForm.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
        this.spinner.hide();
      }
    });
  }

  onChangeProvince(event: any): void {
    this.spinner.show();
    const form = this;
    this.listDistritos = [];
    this.listZonas = [];
    this.fincaEditForm.controls.distrito.reset();
    this.fincaEditForm.controls.zona.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        if (res.Result.Success) {
          form.listDistritos = res.Result.Data;
          this.spinner.hide();
        }
      });
  }

  onChangeDistrito(event: any): void {
    this.spinner.show();
    this.listZonas = [];
    this.fincaEditForm.controls.zona.reset();
    this.maestroUtil.GetZonas(event.Codigo, (res: any) => {
      if (res.Result.Success) {
        this.listZonas = res.Result.Data;
        this.spinner.hide();
      }
    });
  }

  AddValidations(): void {
    const centrosEducativos = this.fincaEditForm.controls.centroEducativo;
    this.fincaEditForm.controls.fCentroEducativo.valueChanges
      .subscribe((res: any) => {
        if (res) {
          centrosEducativos.setValidators(Validators.required);
        } else {
          centrosEducativos.clearValidators();
        }
        centrosEducativos.updateValueAndValidity();
      });
  }

  SearchProducerFincaById(): void {
    this.spinner.show();
    this.productorFincaService.SearcById({ ProductorFincaId: this.vId })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.AutocompleteForm(res.Result.Data);
        }
      }, (err: any) => {
        console.log(err);
      });
  }

  async AutocompleteForm(data: any) {
    this.fincaEditForm.controls.idProductorFinca.setValue(data.ProductorFincaId);
    this.fincaEditForm.controls.idProductor.setValue(data.ProductorId);
    this.fincaEditForm.controls.nombreFinca.setValue(data.Nombre);
    if (data.Latitud) {
      this.fincaEditForm.controls.latitud.setValue(data.Latitud);
    }
    this.fincaEditForm.controls.direccion.setValue(data.Direccion);
    if (data.Longuitud) {
      this.fincaEditForm.controls.longitud.setValue(data.Longuitud);
    }
    await this.GetDepartments();
    this.fincaEditForm.controls.departamento.setValue(data.DepartamentoId);
    if (data.Altitud) {
      this.fincaEditForm.controls.altitud.setValue(data.Altitud);
    }
    await this.GetProvincias();
    this.fincaEditForm.controls.provincia.setValue(data.ProvinciaId);
    if (data.FuenteEnergiaId)
      this.fincaEditForm.controls.fuenteEnergia.setValue(data.FuenteEnergiaId);
    await this.GetDistritos();
    this.fincaEditForm.controls.distrito.setValue(data.DistritoId);
    if (data.FuenteAguaId)
      this.fincaEditForm.controls.fuenteAgua.setValue(data.FuenteAguaId);
    if (data.ZonaId) {
      await this.GetZonas();
      if (this.listZonas.length > 0) {
        this.fincaEditForm.controls.zona.setValue(data.ZonaId);
      }
    }
    if (data.CantidadAnimalesMenores)
      this.fincaEditForm.controls.nroAnimalesMenores.setValue(data.CantidadAnimalesMenores);
    if (data.MaterialVivienda)
      this.fincaEditForm.controls.materialVivienda.setValue(data.MaterialVivienda);
    if (data.InternetId)
      this.fincaEditForm.controls.fInternet.setValue(data.InternetId);
    if (data.Suelo)
      this.fincaEditForm.controls.suelo.setValue(data.Suelo);
    if (data.SenialTelefonicaId)
      this.fincaEditForm.controls.senialTelefonica.setValue(data.SenialTelefonicaId);
    if (data.EstablecimientoSaludId)
      this.fincaEditForm.controls.establecimientoSalud.setValue(data.EstablecimientoSaludId);
    if (data.TiempoTotalEstablecimientoSalud)
      this.fincaEditForm.controls.tiempoUnidadCentroSalud.setValue(data.TiempoTotalEstablecimientoSalud);
    if (data.CentroEducativoId)
      this.fincaEditForm.controls.fCentroEducativo.setValue(data.CentroEducativoId);
    if (data.CentroEducativoNivel)
      this.fincaEditForm.controls.centroEducativo.setValue(data.CentroEducativoNivel.split('|').map(String));
    if (data.EstadoId) {
      this.fincaEditForm.controls.estado.setValue(data.EstadoId);
    }
    this.spinner.hide();
  }

  GetRequest(): any {
    const result = {
      ProductorFincaId: this.fincaEditForm.value.idProductorFinca ?? 0,
      ProductorId: this.fincaEditForm.value.idProductor ?? this.vCodProductor,
      Nombre: this.fincaEditForm.value.nombreFinca ?? '',
      Direccion: this.fincaEditForm.value.direccion ?? '',
      DepartamentoId: this.fincaEditForm.value.departamento ?? '',
      ProvinciaId: this.fincaEditForm.value.provincia ?? '',
      DistritoId: this.fincaEditForm.value.distrito ?? '',
      ZonaId: this.fincaEditForm.value.zona ? this.fincaEditForm.value.zona.toString() : '',
      Latitud: this.fincaEditForm.value.latitud ?? 0,
      Longuitud: this.fincaEditForm.value.longitud ?? 0,
      Altitud: this.fincaEditForm.value.altitud ?? 0,
      FuenteEnergiaId: this.fincaEditForm.value.fuenteEnergia ?? '',
      FuenteAguaId: this.fincaEditForm.value.fuenteAgua ?? '',
      InternetId: this.fincaEditForm.value.fInternet ?? '',
      SenialTelefonicaId: this.fincaEditForm.value.senialTelefonica ?? '',
      EstablecimientoSaludId: this.fincaEditForm.value.establecimientoSalud ?? '',
      CentroEducativoId: this.fincaEditForm.value.fCentroEducativo ?? '',
      CentroEducativoNivel: this.fincaEditForm.value.centroEducativo ? this.fincaEditForm.value.centroEducativo.join('|') : '',
      TiempoTotalEstablecimientoSalud: this.fincaEditForm.value.tiempoUnidadCentroSalud ?? 0,
      CantidadAnimalesMenores: this.fincaEditForm.value.nroAnimalesMenores ?? 0,
      MaterialVivienda: this.fincaEditForm.value.materialVivienda ?? '',
      Suelo: this.fincaEditForm.value.suelo ?? '',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      EstadoId: this.fincaEditForm.value.estado ?? ''
    };
    return result;
  }

  Save(): void {
    if (!this.fincaEditForm.invalid) {
      this.errorGeneral = { isError: false, msgError: '' };
      const form = this;
      if (this.vId > 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la actualización del productor finca?.`,
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
        }).then(function (result) {
          if (result.value) {
            form.Update();
          }
        });
      } else {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la creación del productor finca?.`,
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
        }).then(function (result) {
          if (result.value) {
            form.Create();
          }
        });
      }
    } else {
      this.errorGeneral = {
        isError: true,
        msgError: 'Por favor completar los campos OBLIGATORIOS.'
      };
    }
  }

  Create(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.productorFincaService.Create(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CORRECTO!', 'Productor finca creado correctamente!', () => {
            this.Cancel();
          });
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
      });
  }

  Update(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.productorFincaService.Update(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CORRECTO!', 'Productor finca actualizado correctamente!', () => {
            this.Cancel();
          });
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
      });
  }

  Cancel(): void {
    if (this.vCodProductor) {
      this.router.navigate([`/productor/administracion/productor/finca/list/${this.vCodProductor}`]);
    } else {
      this.router.navigate([`/productor/administracion/productor/finca/list/${this.fincaEditForm.value.idProductor}`]);
    }
  }

}
