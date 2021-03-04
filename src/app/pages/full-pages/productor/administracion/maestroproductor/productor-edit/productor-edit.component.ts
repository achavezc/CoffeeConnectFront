import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { ProductorService } from '../../../../../../services/productor.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';

@Component({
  selector: 'app-productor-edit',
  templateUrl: './productor-edit.component.html',
  styleUrls: ['./productor-edit.component.scss']
})
export class ProductorEditComponent implements OnInit {

  constructor(private maestroUtil: MaestroUtil,
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private productorService: ProductorService,
    private alertUtil: AlertUtil,
    private maestroService: MaestroService) { }

  productorEditForm: any;
  listEstados: Observable<any>;
  listDepartamentos: Observable<any>;
  listProvincias: Observable<any>;
  listTiposDocs: Observable<any>;
  listDistritos: Observable<any>;
  listZonas: Observable<any>;
  listEstadoCivil: Observable<any>;
  listReligion: Observable<any>;
  listGeneros: Observable<any>;
  listGradoEstudios: Observable<any>;
  listTiposDocsCyg: Observable<any>;
  listLugarNacimCyg: Observable<any>;
  listGradosEstudioCyg: Observable<any>;
  listIdiomas: Observable<any>;
  selectedEstado: any;
  selectedDepartamento: any;
  selectedProvincia: any;
  selectedTipoDoc: any;
  selectedDistrito: any;
  selectedZona: any;
  selectedEstadoCivil: any;
  selectedReligion: any;
  selectedGenero: any;
  selectedGradoEstudio: any;
  selectedTipoDocCyg: any;
  selectedLugarNacimCyg: any;
  selectedGradoEstudioCyg: any;
  selectedIdioma: string[] = [];
  vId: number;
  errGeneral = { isError: false, message: '' };
  msgErrorGenerico = 'Ha ocurrido un error. Por favor comunicarse con el área de sistemas.';

  get f() {
    return this.productorEditForm.controls;
  }

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.LoadDataInitial();
    this.addValidations();
  }

  LoadForm(): void {
    this.productorEditForm = this.fb.group({
      codProductor: ['', [Validators.maxLength(50)]],
      fecRegistro: ['', [Validators.required]],
      estado: [, [Validators.required]],
      tipoDocumento: [, [Validators.required]],
      nroDocumento: ['', [Validators.required, Validators.maxLength(20)]],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      nombres: ['', [Validators.maxLength(50)]],
      apellidos: ['', [Validators.maxLength(50)]],
      departamento: [, [Validators.required]],
      razonSocial: ['', [Validators.maxLength(200)]],
      provincia: [, [Validators.required]],
      telefonoFijo: ['', [Validators.maxLength(12)]],
      fecNacimiento: [],
      distrito: [, [Validators.required]],
      telefCelular: ['', [Validators.maxLength(12)]],
      lugarNacimiento: ['', [Validators.maxLength(50)]],
      zona: [, [Validators.required]],
      estadoCivil: [''],
      religion: [''],
      anioIngresoZona: [],
      genero: [],
      gradoEstudio: [],
      nroHijos: [],
      dialecto: ['', [Validators.maxLength(50)]],
      tipoDocumentoCyg: [],
      nroDocumentoCyg: ['', [Validators.maxLength(20)]],
      nombresCyg: ['', [Validators.maxLength(50)]],
      apellidosCyg: ['', [Validators.maxLength(50)]],
      lugarNacimientoCyg: ['', [Validators.maxLength(50)]],
      gradoEstudioCyg: [''],
      nroCelularCyg: [''],
      fecNacimientoCyg: [],
      idioma: []
    });
  }

  addValidations(): void {
    const nombres = this.productorEditForm.controls.nombres;
    const apellidos = this.productorEditForm.controls.apellidos;
    const razonSocial = this.productorEditForm.controls.razonSocial;
    const codProductor = this.productorEditForm.controls.codProductor;

    this.productorEditForm.controls.tipoDocumento.valueChanges.subscribe((td: any) => {
      if (td === '01') {
        nombres.setValidators(Validators.required);
        apellidos.setValidators(Validators.required);
        razonSocial.clearValidators();
      } else if (td === '02') {
        nombres.clearValidators();
        apellidos.clearValidators();
        razonSocial.setValidators(Validators.required);
      } else {
        nombres.clearValidators();
        apellidos.clearValidators();
        razonSocial.clearValidators();
      }
      nombres.updateValueAndValidity();
      apellidos.updateValueAndValidity();
      razonSocial.updateValueAndValidity();
    });

    this.productorEditForm.controls.codProductor.valueChanges.subscribe((cp: any) => {
      if (this.vId) {
        codProductor.setValidators(Validators.required);
      } else {
        codProductor.clearValidators();
      }
    });
    codProductor.updateValueAndValidity();
  }

  LoadCombos(): void {
    let form = this;
    this.LoadArrayEstados();
    this.maestroUtil.obtenerMaestros("TipoDocumento", function (res: any) {
      if (res.Result.Success) {
        form.listTiposDocs = res.Result.Data;
        form.listTiposDocsCyg = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("EstadoCivil", function (res: any) {
      if (res.Result.Success) {
        form.listEstadoCivil = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Religion", function (res: any) {
      if (res.Result.Success) {
        form.listReligion = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Genero", function (res: any) {
      if (res.Result.Success) {
        form.listGeneros = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("GradoEstudios", function (res: any) {
      if (res.Result.Success) {
        form.listGradoEstudios = res.Result.Data;
        form.listGradosEstudioCyg = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Idioma", function (res: any) {
      if (res.Result.Success) {
        form.listIdiomas = res.Result.Data;
      }
    });
    this.maestroUtil.GetDepartments('PE', function (res: any) {
      if (res.Result.Success) {
        form.listDepartamentos = res.Result.Data;
      }
    });
  }

  async LoadArrayEstados() {
    const res = await this.maestroService.obtenerMaestros("EstadoMaestro").toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      this.productorEditForm.controls.estado.setValue(res.Result.Data[0].Codigo);
    }
  }

  async LoadArrayProvinces() {
    const res = await this.maestroUtil.GetProvincesAsync(this.selectedDepartamento, 'PE');
    if (res.Result.Success) {
      this.listProvincias = res.Result.Data;
    }
  }

  async LoadArrayDistricts() {
    const res = await this.maestroUtil.GetDistrictsAsync(this.selectedDepartamento, this.selectedProvincia, 'PE');
    if (res.Result.Success) {
      this.listDistritos = res.Result.Data;
    }
  }

  async LoadArrayZones() {
    const res = await this.maestroUtil.GetZonasAsync(this.selectedDistrito);
    if (res.Result.Success) {
      this.listZonas = res.Result.Data;
    }
  }

  LoadDataInitial(): void {
    this.vId = this.route.snapshot.params.id ? parseInt(this.route.snapshot.params.id) : null;
    // this.productorEditForm.controls.fecNacimiento.setValue(this.dateUtil.currentDate());
    // this.productorEditForm.controls.fecNacimientoCyg.setValue(this.dateUtil.currentDate());
    if (!this.vId) {
      this.productorEditForm.controls.fecRegistro.setValue(this.dateUtil.currentDate());
    } else if (this.vId > 0) {
      this.SearchById();
    }
  }

  onChangeDepartament(event: any): void {
    const form = this;
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, function (res: any) {
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
      }
    });
  }

  onChangeProvince(event: any): void {
    const form = this;
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais, function (res: any) {
      if (res.Result.Success) {
        form.listDistritos = res.Result.Data;
      }
    });
  }

  onChangeDistrict(event: any): void {
    const form = this;
    this.maestroUtil.GetZonas(event.Codigo, function (res: any) {
      if (res.Result.Success) {
        form.listZonas = res.Result.Data;
      }
    });
  }

  Save(): void {
    const form = this;
    if (!this.productorEditForm.invalid) {
      if (!this.vId) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la creación del nuevo productor?.`,
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
      } else if (this.vId > 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de actualizar el productor ${this.productorEditForm.value.codProductor}?.`,
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
      }
    }
  }

  getRequestForm(): {} {
    const result = {
      ProductorId: !this.vId ? 0 : this.vId,
      Numero: this.productorEditForm.value.codProductor,
      NombreRazonSocial: this.productorEditForm.value.razonSocial ?? '',
      TipoDocumentoId: this.productorEditForm.value.tipoDocumento ?? '',
      NumeroDocumento: this.productorEditForm.value.nroDocumento ?? '',
      RazonSocial: this.productorEditForm.value.razonSocial ?? '',
      Nombres: this.productorEditForm.value.nombres ?? '',
      Apellidos: this.productorEditForm.value.apellidos ?? '',
      Direccion: this.productorEditForm.value.direccion ?? '',
      DepartamentoId: this.productorEditForm.value.departamento ?? '',
      ProvinciaId: this.productorEditForm.value.provincia ?? '',
      DistritoId: this.productorEditForm.value.distrito,
      ZonaId: this.productorEditForm.value.zona,
      NumeroTelefonoFijo: this.productorEditForm.value.telefonoFijo ?? '',
      NumeroTelefonoCelular: this.productorEditForm.value.telefCelular,
      CorreoElectronico: '',
      FechaNacimiento: this.productorEditForm.value.fecNacimiento ?? null,
      LugarNacimiento: this.productorEditForm.value.lugarNacimiento,
      EstadoCivilId: this.productorEditForm.value.estadoCivil ?? '',
      ReligionId: this.productorEditForm.value.religion ?? '',
      GeneroId: this.productorEditForm.value.genero ?? '',
      GradoEstudiosId: this.productorEditForm.value.gradoEstudio ?? '',
      CantidadHijos: this.productorEditForm.value.nroHijos ?? null,
      Idiomas: this.selectedIdioma.join('|') ?? '',
      Dialecto: this.productorEditForm.value.dialecto ?? '',
      AnioIngresoZona: this.productorEditForm.value.anioIngresoZona ?? null,
      TipoDocumentoIdConyuge: this.productorEditForm.value.tipoDocumentoCyg ?? '',
      NumeroDocumentoConyuge: this.productorEditForm.value.nroDocumentoCyg ?? '',
      NombresConyuge: this.productorEditForm.value.nombresCyg ?? '',
      ApellidosConyuge: this.productorEditForm.value.apellidosCyg ?? '',
      NumeroTelefonoCelularConyuge: this.productorEditForm.value.nroCelularCyg ?? '',
      FechaNacimientoConyuge: this.productorEditForm.value.fecNacimientoCyg ?? null,
      GradoEstudiosIdConyuge: this.productorEditForm.value.gradoEstudioCyg ?? '',
      LugarNacimientoConyuge: this.productorEditForm.value.lugarNacimientoCyg ?? '',
      Usuario: 'mruizb',
      EstadoId: this.productorEditForm.value.estado
    };

    return result;
  }

  Create(): void {
    const request = this.getRequestForm();
    this.productorService.Create(request)
      .subscribe((res: any) => {
        if (res.Result.Success && !res.Result.ErrCode) {
          this.productorEditForm.reset();
          this.alertUtil.alertOkCallback("Confirmación", "Registro completo!",
            () => {
              this.Cancel();
            });
        }
      }, (err: any) => {
        console.log(err);
      });
  }

  SearchById(): void {
    this.productorService.SearchById({ ProductorId: this.vId })
      .subscribe((res: any) => {
        if (res.Result.Success && !res.Result.ErrCode) {
          this.MapDataForm(res.Result.Data);
        } else {
          this.errGeneral = { isError: true, message: res.Result.Message };
        }
      }, (err: any) => {
        console.log(err);
        this.errGeneral = { isError: true, message: this.msgErrorGenerico };
      });
  }

  async MapDataForm(data: any) {
    this.productorEditForm.controls.codProductor.setValue(data.Numero);
    this.productorEditForm.controls.fecRegistro.setValue(data.FechaRegistro.substring(0, 10));
    this.productorEditForm.controls.estado.setValue(data.EstadoId);
    this.productorEditForm.controls.tipoDocumento.setValue(data.TipoDocumentoId);
    this.productorEditForm.controls.nroDocumento.setValue(data.NumeroDocumento);
    this.productorEditForm.controls.direccion.setValue(data.Direccion);
    this.productorEditForm.controls.nombres.setValue(data.Nombres);
    this.productorEditForm.controls.apellidos.setValue(data.Apellidos);
    this.productorEditForm.controls.departamento.setValue(data.DepartamentoId);
    await this.LoadArrayProvinces();
    this.productorEditForm.controls.razonSocial.setValue(data.RazonSocial);
    this.productorEditForm.controls.provincia.setValue(data.ProvinciaId);
    await this.LoadArrayDistricts();
    this.productorEditForm.controls.telefonoFijo.setValue(data.NumeroTelefonoFijo);
    this.productorEditForm.controls.fecNacimiento.setValue(data.FechaNacimiento.substring(0, 10));
    this.productorEditForm.controls.distrito.setValue(data.DistritoId);
    await this.LoadArrayZones();
    this.productorEditForm.controls.telefCelular.setValue(data.NumeroTelefonoCelular);
    this.productorEditForm.controls.lugarNacimiento.setValue(data.LugarNacimiento);
    this.productorEditForm.controls.zona.setValue(data.ZonaId);
    this.productorEditForm.controls.estadoCivil.setValue(data.EstadoCivilId);
    this.productorEditForm.controls.religion.setValue(data.ReligionId);
    this.productorEditForm.controls.anioIngresoZona.setValue(data.AnioIngresoZona);
    this.productorEditForm.controls.genero.setValue(data.GeneroId);
    this.productorEditForm.controls.gradoEstudio.setValue(data.GradoEstudiosId);
    this.productorEditForm.controls.nroHijos.setValue(data.CantidadHijos);
    this.productorEditForm.controls.dialecto.setValue(data.Dialecto);
    this.productorEditForm.controls.tipoDocumentoCyg.setValue(data.TipoDocumentoIdConyuge);
    this.productorEditForm.controls.nroDocumentoCyg.setValue(data.NumeroDocumentoConyuge);
    this.productorEditForm.controls.nombresCyg.setValue(data.NombresConyuge);
    this.productorEditForm.controls.apellidosCyg.setValue(data.ApellidosConyuge);
    this.productorEditForm.controls.lugarNacimientoCyg.setValue(data.LugarNacimientoConyuge);
    this.productorEditForm.controls.gradoEstudioCyg.setValue(data.GradoEstudiosIdConyuge);
    this.productorEditForm.controls.nroCelularCyg.setValue(data.NumeroTelefonoCelularConyuge);
    this.productorEditForm.controls.fecNacimientoCyg.setValue(data.FechaNacimientoConyuge.substring(0, 10));
    this.productorEditForm.controls.idioma.setValue(data.Idiomas.split('|').map(String));
  }

  Update(): void {
    const request = this.getRequestForm();
    this.productorService.Update(request)
      .subscribe((res: any) => {
        if (res.Result.Success && !res.Result.ErrCode) {
          this.productorEditForm.reset();
          this.alertUtil.alertOkCallback("Confirmación", "Actualización completa!", () => {
            this.Cancel();
          });
        } else {
          this.errGeneral = { isError: true, message: res.Result.Message };
        }
      }, (err: any) => {
        console.log(err);
        this.errGeneral = { isError: true, message: this.msgErrorGenerico };
      });
  }

  Cancel(): void {
    this.router.navigate(['/productor/administracion/productor/list']);
  }

}
