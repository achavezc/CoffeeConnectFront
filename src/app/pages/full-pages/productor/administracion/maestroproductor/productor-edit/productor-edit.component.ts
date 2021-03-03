import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { ProductorService } from '../../../../../../services/productor.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';

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
    private alertUtil: AlertUtil) { }

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

  get f() {
    return this.productorEditForm.controls;
  }

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.LoadDataInitial();
    this.addValidations();
  }

  // Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$'), Validators.required
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
    // this.productorEditForm.setValidators(this.comparisonValidator());
  }

  // public comparisonValidator(): ValidatorFn {
  //   return (group: FormGroup): ValidationErrors => {
  //     if (group.value.tipoDocumento && !group.value.nombRazonSocial) {
  //       if (group.value.tipoDocumento === '01') {
  //         group.controls.nombres.setErrors({ isError: true, message: 'Es obligatorio!' });
  //         group.controls.apellidos.setErrors({ isError: true, message: 'Es obligatorio!' });

  //         // group.controls.apellidos.updateValueAndValidity();
  //         group.controls.razonSocial.clearValidators();
  //       } else if (group.value.tipoDocumento === '02') {

  //       }
  //       // this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar al menos un filtro.' };
  //       // group.controls['nombRazonSocial'].setErrors({ isError: true, message: 'Por favor ingresar una razón social.' });
  //     }
  //     return;
  //   };
  //   this.productorEditForm.controls.nombres.updateValueAndValidity();
  // }

  addValidations(): void {
    const nombres = this.productorEditForm.controls.nombres;
    const apellidos = this.productorEditForm.controls.apellidos;
    const razonSocial = this.productorEditForm.controls.razonSocial;

    this.productorEditForm.controls.tipoDocumento.valueChanges
      .subscribe((td: any) => {
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
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("EstadoMaestro", function (res: any) {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
        if (!form.vId) {
          form.selectedEstado = res.Result.Data[0].Codigo;
        }
      }
    });
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

  LoadDataInitial(): void {
    this.vId = this.route.snapshot.params['id'];
    // this.productorEditForm.controls.fecNacimiento.setValue(this.dateUtil.currentDate());
    // this.productorEditForm.controls.fecNacimientoCyg.setValue(this.dateUtil.currentDate());
    if (!this.vId) {
      this.productorEditForm.controls.fecRegistro.setValue(this.dateUtil.currentDate());
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
        this.Update();
      }
    }
  }

  Create(): void {
    const request = {
      ProductorId: 0,
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
    }

    this.productorService.Create(request)
      .subscribe((res: any) => {
        if (res.Result.Success && !res.Result.ErrCode) {
          this.productorEditForm.reset();
          this.alertUtil.alertOk("Confirmación", "Registro completo!");
        }
      }, (err: any) => {
        console.log(err);
      });
  }

  Update(): void {

  }

  Cancel(): void {
    this.router.navigate(['/productor/administracion/productor/list']);
  }

}
