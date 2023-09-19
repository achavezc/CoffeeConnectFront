import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { SocioService } from '../../../../../../services/socio.service';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ProductorService } from '../../../../../../services/productor.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-socio-edit',
  templateUrl: './socio-edit.component.html',
  styleUrls: ['./socio-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SocioEditComponent implements OnInit {

  constructor(private maestroUtil: MaestroUtil,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private socioService: SocioService,
    private router: Router,
    private dateUtil: DateUtil,
    private modalService: NgbModal,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private productorService: ProductorService,
    private maestroService: MaestroService,
    private authService : AuthService) { }

  socioEditForm: any;
  listTiposDocs: [] = [];
  listDepartamentos: [] = [];
  listProvincias: [] = [];
  listDistritos: [] = [];
  listZonas: [] = [];
  listEstados: [] = [];
  selectedTipoDoc: any;
  selectedDepartamento: any;
  selectedProvincia: any;
  selectedDistrito: any;
  selectedZona: any;
  selectedEstado: any;
  vId: number;
  errorGeneral = { isError: false, errorMessage: '' };
  vMensajeErrorGenerico: string = 'Ha ocurrido un error interno.';
  errorGenerico = { isError: false, msgError: '' };

  modalProductorForm: FormGroup;
  listTiposDocumentos: [];
  selectedTipoDocumento: string;
  selectedProductor: any;
  public mLimitRef: number = 10;
  mRowsProductores: any[];
  mAllProductores: any[];
  mSelected: any[] = [];
  @ViewChild(DatatableComponent) mTblProductores: DatatableComponent;
  @ViewChild("modalBusqProductores", { static: false }) modalBusqProductores: TemplateRef<any>;
  vSessionUser: any;
  readonly: boolean;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.vId = this.route.snapshot.params['id'];
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    if (!this.vId) {
      // this.socioEditForm.controls.estado.setValue('01');
      this.socioEditForm.controls.fecRegistro.setValue(this.dateUtil.currentDate());
    } else {
      this.vId = parseInt(this.route.snapshot.params['id']);
      this.SearchById();
    }
    //this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  // [Validators.minLength(5), Validators.maxLength(25), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$'),Validators.required ]
  LoadForm(): void {
    this.socioEditForm = this.fb.group({
      idProductor: [],
      codSocio: [''],
      fecRegistro: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      productor: ['', [Validators.required]],
      tipoDocumento: [''],
      nroDocumento: [''],
      direccion: [''],
      nombreCompleto: [''],
      departamento: [''],
      razonSocial: [''],
      provincia: [''],
      telefonoFijo: [''],
      distrito: [''],
      telefCelular: [''],
      zona: ['']
    });
  }

  get f() {
    return this.socioEditForm.controls;
  }

  get mf() {
    return this.modalProductorForm.controls;
  }

  async LoadCombos() {
    await this.GetEstados();
    await this.GetTiposDocumentos();
    await this.GetDepartments();
  }

  async GetEstados() {
    const res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      if (!this.vId) {
        this.socioEditForm.controls.estado.setValue('01');
      }
    }
  }

  async GetTiposDocumentos() {
    const res = await this.maestroService.obtenerMaestros('TipoDocumento').toPromise();
    if (res.Result.Success) {
      this.listTiposDocs = res.Result.Data;
    }
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

  onChangeDepartament(event: any): void {
    const form = this;
    this.listProvincias = [];
    this.socioEditForm.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
      }
    });
  }

  onChangeProvince(event: any): void {
    const form = this;
    this.listDistritos = [];
    this.socioEditForm.controls.distrito.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        if (res.Result.Success) {
          form.listDistritos = res.Result.Data;
        }
      });
  }

  onChangeDistrito(event: any): void {
    this.listZonas = [];
    this.socioEditForm.controls.zona.reset();
    this.maestroUtil.GetZonas(event.Codigo, (res: any) => {
      if (res.Result.Success) {
        this.listZonas = res.Result.Data;
      }
    });
  }

  SearchProductor() {
    this.errorGenerico = { isError: false, msgError: '' };
    this.modalService.open(this.modalBusqProductores, { windowClass: 'dark-modal', size: 'xl', centered: true });
    this.LoadFormBusquedaProductores();
  }

  Save(): void {
    if (!this.socioEditForm.invalid) {
      this.errorGenerico = { isError: false, msgError: '' };
      const form = this;
      if (!this.vId) {

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la creación del nuevo socio?.' , function (result) {
          if (result.isConfirmed) {
            form.CreateSocio();
          }
        });

      } else {

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de modificar el socio ${this.socioEditForm.value.codSocio}?.` , function (result) {
          if (result.isConfirmed) {
            form.UpdateSocio();
          }
        });
      }
    } else {
      this.errorGenerico = { isError: true, msgError: 'Por favor completar todos los campos obligatorios.' };
    }
  }

  CreateSocio(): void {
    if (this.socioEditForm.value.idProductor && this.socioEditForm.value.idProductor > 0) {
      this.spinner.show();
      const request = {
        SocioId: 0,
        ProductorId: this.socioEditForm.value.idProductor,
        Usuario: this.vSessionUser.Result.Data.NombreUsuario,
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
        EstadoId: '01'
      }

      this.socioService.Create(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success && (!res.Result.ErrCode || res.Result.ErrCode === '00')) {
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
  }

  UpdateSocio(): void {
    if (this.socioEditForm.value.idProductor && this.socioEditForm.value.idProductor > 0) {
      this.spinner.show();
      const request = {
        SocioId: this.vId,
        ProductorId: this.socioEditForm.value.idProductor,
        Usuario: this.vSessionUser.Result.Data.NombreUsuario,
        EstadoId: this.socioEditForm.value.estado
      }

      this.socioService.Update(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success && (!res.Result.ErrCode || res.Result.ErrCode === '00')) {
            this.alertUtil.alertOkCallback("Actualizado!", "Se completo la actualización correctamente!", () => {
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
  }

  Cancel(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/list']);
  }

  LoadFormBusquedaProductores(): void {
    this.modalProductorForm = this.fb.group({
      mIdProductor: [],
      mCodProductor: [],
      mTipoDocumento: [],
      mNroDocumento: [],
      mNombRazonSocial: [],
      mFechaInicio: ['', [Validators.required]],
      mFechaFin: ['', [Validators.required]]
    });
    this.mRowsProductores = [];
    this.clearFiltersPopup();
    this.modalProductorForm.setValidators(this.comparisonValidator());
    this.addValidations();

    this.maestroUtil.obtenerMaestros("TipoDocumento", (res: any) => {
      if (res.Result.Success) {
        this.listTiposDocumentos = res.Result.Data;
      }
    });
  }

  clearFiltersPopup(): void {
    this.modalProductorForm.reset();
    this.listTiposDocumentos = [];
    this.selectedTipoDocumento = null;
    this.modalProductorForm.controls.mFechaInicio.setValue(this.dateUtil.currentMonthAgo());
    this.modalProductorForm.controls.mFechaFin.setValue(this.dateUtil.currentDate());
  }

  comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {

      if (!group.value.mFechaInicio || !group.value.mFechaFin) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  addValidations(): void {
    const nroDoc = this.modalProductorForm.controls.mNroDocumento;
    this.modalProductorForm.controls.mTipoDocumento.valueChanges.subscribe((res: any) => {
      if (res) {
        nroDoc.setValidators(Validators.required);
      } else {
        nroDoc.clearValidators();
      }
      nroDoc.updateValueAndValidity();
    });
  }

  ModalUpdateLimit(event: any): void {
    this.mLimitRef = event.target.value;
  }

  ModalFilterUpdate(event: any): void {
    const val = event.target.value.toLowerCase();
    const temp = this.mAllProductores.filter((d: any) => {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.mRowsProductores = temp;
    this.mTblProductores.offset = 0;
  }

  BuscarProductores(): void {
    if (this.modalProductorForm.invalid || this.errorGeneral.isError) {
      // this.submitted = true;
      return;
    } else {
      this.spinner.show();
      const request = {
        Numero: this.modalProductorForm.value.mCodProductor,
        NombreRazonSocial: this.modalProductorForm.value.mNombRazonSocial,
        TipoDocumentoId: this.modalProductorForm.value.mTipoDocumento ?? '',
        NumeroDocumento: this.modalProductorForm.value.mNroDocumento ? this.modalProductorForm.value.mNroDocumento.toString() : '',
        EstadoId: '01',
        FechaInicio: new Date(this.modalProductorForm.value.mFechaInicio),
        FechaFin: new Date(this.modalProductorForm.value.mFechaFin)
      };

      this.productorService.Search(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            this.errorGeneral = { isError: false, errorMessage: '' };
            res.Result.Data.forEach((obj: any) => {
              obj.FechaRegistroString = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
            });
            this.mRowsProductores = res.Result.Data;
            this.mAllProductores = this.mRowsProductores;
          } else {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          }
        },
          (err: any) => {
            console.error(err);
            this.spinner.hide();
            this.errorGeneral = { isError: true, errorMessage: this.vMensajeErrorGenerico };
          }
        );
    }
  }

  seleccionarProductor(): void {
    this.spinner.show();
    if (this.mSelected.length > 0) {
      const row = this.mSelected[0];
      this.MapFormCreateSocio(row);
    }

    this.modalService.dismissAll();
  }

  async MapFormCreateSocio(row: any) {
    if (row) {
      if (row.ProductorId) {
        this.socioEditForm.controls.idProductor.setValue(row.ProductorId);
      }
      this.socioEditForm.controls.estado.setValue(row.EstadoId);
      if (row.Numero) {
        this.socioEditForm.controls.productor.setValue(row.Numero);
      }
      if (row.TipoDocumentoId) {
        this.socioEditForm.controls.tipoDocumento.setValue(row.TipoDocumentoId);
      }
      if (row.NumeroDocumento) {
        this.socioEditForm.controls.nroDocumento.setValue(row.NumeroDocumento);
      }
      this.socioEditForm.controls.direccion.setValue(row.Direccion);
      if (row.TipoDocumentoId) {
        if (row.TipoDocumentoId == '01') {
          this.socioEditForm.controls.nombreCompleto.setValue(row.NombreRazonSocial);
        } else if (row.TipoDocumentoId == '02') {
          this.socioEditForm.controls.razonSocial.setValue(row.NombreRazonSocial);
        }
      }
      if (row.DepartamentoId) {
        await this.GetDepartments();
        this.socioEditForm.controls.departamento.setValue(row.DepartamentoId);
      }
      if (row.ProvinciaId) {
        await this.GetProvincias();
        this.socioEditForm.controls.provincia.setValue(row.ProvinciaId);
      }

      if (row.DistritoId) {
        await this.GetDistritos();
        this.socioEditForm.controls.distrito.setValue(row.DistritoId);
      }
      if (row.NumeroTelefonoCelular) {
        this.socioEditForm.controls.telefCelular.setValue(row.NumeroTelefonoCelular);
      }

      if (row.NumeroTelefonoFijo) {
        this.socioEditForm.controls.telefonoFijo.setValue(row.NumeroTelefonoFijo);
      }
      if (row.ZonaId) {
        await this.GetZonas();
        this.socioEditForm.controls.zona.setValue(row.ZonaId);
      }
    }
    this.spinner.hide();
  }

  SearchById(): void {
    this.spinner.show();
    this.socioService.SearchById(this.vId)
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.LoadFormUpdateSocio(res.Result.Data);
        } else {
          this.spinner.hide();
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      })
  }

  async LoadFormUpdateSocio(row: any) {
    if (row) {
      if (row.ProductorId) {
        this.socioEditForm.controls.idProductor.setValue(row.ProductorId);
      }
      this.socioEditForm.controls.codSocio.setValue(row.Codigo);
      if (row.FechaRegistro && row.FechaRegistro.substring(0, 10) != "0001-01-01") {
        this.socioEditForm.controls.fecRegistro.setValue(row.FechaRegistro.substring(0, 10));
      }
      await this.GetEstados();
      this.socioEditForm.controls.estado.setValue(row.EstadoId);
      if (row.NumeroProductor) {
        this.socioEditForm.controls.productor.setValue(row.NumeroProductor);
      }
      if (row.TipoDocumentoId) {
        this.socioEditForm.controls.tipoDocumento.setValue(row.TipoDocumentoId);
      }
      if (row.NumeroDocumento) {
        this.socioEditForm.controls.nroDocumento.setValue(row.NumeroDocumento);
      }
      if (row.Direccion) {
        this.socioEditForm.controls.direccion.setValue(row.Direccion);
      }
      if (row.TipoDocumentoId) {
        if (row.TipoDocumentoId == '01') {
          this.socioEditForm.controls.nombreCompleto.setValue(row.NombreRazonSocial);
        } else if (row.TipoDocumentoId == '02') {
          this.socioEditForm.controls.razonSocial.setValue(row.NombreRazonSocial);
        }
      }
      if (row.DepartamentoId) {
        await this.GetDepartments();
        this.socioEditForm.controls.departamento.setValue(row.DepartamentoId);
      }
      if (row.ProvinciaId) {
        await this.GetProvincias();
        this.socioEditForm.controls.provincia.setValue(row.ProvinciaId);
      }
      if (row.NumeroTelefonoFijo) {
        this.socioEditForm.controls.telefonoFijo.setValue(row.NumeroTelefonoFijo);
      }
      if (row.DistritoId) {
        await this.GetDistritos();
        this.socioEditForm.controls.distrito.setValue(row.DistritoId);
      }
      if (row.NumeroTelefonoCelular) {
        this.socioEditForm.controls.telefCelular.setValue(row.NumeroTelefonoCelular);
      }
      if (row.ZonaId) {
        await this.GetZonas();
        this.socioEditForm.controls.zona.setValue(row.ZonaId);
      }
    }
    this.spinner.hide();
  }
}
