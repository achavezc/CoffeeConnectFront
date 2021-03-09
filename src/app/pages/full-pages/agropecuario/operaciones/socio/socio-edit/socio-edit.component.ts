import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from "ngx-spinner";

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { SocioService } from '../../../../../../services/socio.service';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ProductorService } from '../../../../../../services/productor.service';
// import { MConsultarProductorComponent } from '../../../../modals/consultarproductor/m-consultar-productor.component';

@Component({
  selector: 'app-socio-edit',
  templateUrl: './socio-edit.component.html',
  styleUrls: ['./socio-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SocioEditComponent implements OnInit {

  @ViewChild("modalBusqProductores", { static: false }) modalBusqProductores: TemplateRef<any>;

  constructor(private maestroUtil: MaestroUtil,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private socioService: SocioService,
    private router: Router,
    private dateUtil: DateUtil,
    private modalService: NgbModal,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private productorService: ProductorService) { }

  socioEditForm: any;
  listTiposDocs: [] = [];
  listDepartamentos: [] = [];
  listProvincias: [] = [];
  listDistritos: [] = [];
  listZonas: [] = [];
  selectedTipoDoc: any;
  selectedDepartamento: any;
  selectedProvincia: any;
  selectedDistrito: any;
  selectedZona: any;
  vId: number;

  modalProductorForm: FormGroup;
  listTiposDocumentos: [];
  selectedTipoDocumento: string;
  selectedProductor: any;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.vId = this.route.snapshot.params['id'];
    if (!this.vId) {
      this.socioEditForm.controls.estado.setValue('01');
      this.socioEditForm.controls.fecRegistro.setValue(this.dateUtil.currentDate());
    } else {
      this.vId = parseInt(this.route.snapshot.params['id']);
    }
  }

  // [Validators.minLength(5), Validators.maxLength(25), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$'),Validators.required ]
  LoadForm(): void {
    this.socioEditForm = this.fb.group({
      codSocio: [''],
      fecRegistro: [''],
      estado: [''],
      productor: [''],
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

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("TipoDocumento", (res: any) => {
      if (res.Result.Success) {
        form.listTiposDocs = res.Result.Data;
      }
    });
    this.GetDepartments();
  }

  async GetDepartments() {
    const res: any = await this.maestroUtil.GetDepartmentsAsync('PE');
    if (res.Result.Success) {
      this.listDepartamentos = res.Result.Data;
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

  SearchProductor() {
    this.modalService.open(this.modalBusqProductores, { windowClass: 'dark-modal', size: 'lg' });

    // this.modalService.open(content, {
    //   scrollable: true,
    //   windowClass: 'dark-modal',
    //   size: 'xl',
    //   centered: true
    // });

    this.LoadFormBusquedaProductores();
    // const modalRef = this.modalService.open(MConsultarProductorComponent, {
    //   scrollable: true,
    //   windowClass: 'dark-modal',
    //   size: 'xl',
    //   centered: true
    // });
    // // windowClass: 'myCustomModalClass',
    // // keyboard: false,
    //   // backdrop: 'static'

    // let data = {
    //   prop1: 'Some Data',
    //   prop2: 'From Parent Component',
    //   prop3: 'This Can be anything'
    // }

    // modalRef.componentInstance.fromParent = data;
    // modalRef.result.then((result) => {
    //   console.log(result);
    // }, (reason) => {
    //   console.log(reason);
    // });
  }

  Save(): void {
    if (!this.socioEditForm.invalid) {
      if (!this.vId) {
        this.CreateSocio();
      } else {
        this.UpdateSocio();
      }
    }
  }

  CreateSocio(): void {
    this.spinner.show();
    const request = {
      SocioId: null,
      ProductorId: this.socioEditForm.value,
      Usuario: 'mruizb',
      EstadoId: null
    }

    this.socioService.Create(request)
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

  UpdateSocio(): void {
    this.spinner.show();
    const request = {
      SocioId: null,
      ProductorId: this.socioEditForm.value,
      Usuario: 'mruizb',
      EstadoId: null
    }

    this.socioService.Update(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
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

  Cancel(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/list']);
  }

  LoadFormBusquedaProductores(): void {
    this.modalProductorForm = this.fb.group({
      mCodProductor: [],
      mTipoDocumento: [],
      mNroDocumento: [],
      mNombRazonSocial: [],
      mFechaInicio: [],
      mFechaFin: []
    });
  }

  BuscarProductores(): void {
    if (this.productorForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      let request = {
        Numero: this.productorForm.value.codProductor,
        NombreRazonSocial: this.productorForm.value.nombRazonSocial,
        TipoDocumentoId: this.productorForm.value.tipoDocumento ?? '',
        NumeroDocumento: this.productorForm.value.nroDocumento,
        EstadoId: this.productorForm.value.estado ?? '',
        FechaInicio: new Date(this.productorForm.value.fechaInicio),
        FechaFin: new Date(this.productorForm.value.fechaFin)
      };

      this.spinner.show();

      this.productorService.Search(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              res.Result.Data.forEach((obj: any) => {
                obj.FechaRegistroString = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
              });
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
            } else if (res.Result.Message && res.Result.ErrCode) {
              this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }

  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
