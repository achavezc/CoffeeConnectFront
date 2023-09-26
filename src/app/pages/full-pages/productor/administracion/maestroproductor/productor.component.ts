import { Component, OnInit, ViewChild, ViewEncapsulation , EventEmitter, Output} from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { ProductorService } from '../../../../../services/productor.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../shared/util/excel.service';
import {AuthService} from './../../../../../services/auth.service';

@Component({
  selector: 'app-productor',
  templateUrl: './productor.component.html',
  styleUrls: ['./productor.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProductorComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private productorService: ProductorService,
    private router: Router,
    private modalService: NgbModal,
    private excelService: ExcelService,
    private authService : AuthService) {
  }

  productorForm: FormGroup;
  listTiposDocumentos: [] = [];
  listEstados: [] = [];
  selectedTipoDocumento: any;
  selectedEstado: any;
  submitted: boolean = false;
  error: any = { isError: false, errorMessage: '' };
  @ViewChild(DatatableComponent) table: DatatableComponent;
  limitRef = 10;
  rows = [];
  tempData = [];
  selected = [];
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico: string = "Ocurrio un error interno.";
  errorFecha: any = { isError: false, errorMessage: '' };
  @Output()
  nameProductor = new EventEmitter<String>();
  readonly: boolean;
  vSessionUser: any;

  ngOnInit(): void {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    this.productorForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.productorForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    ////this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.productorForm = this.fb.group({
      codProductor: ['', [Validators.minLength(5), Validators.maxLength(25), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      tipoDocumento: [],
      nroDocumento: ['', [Validators.maxLength(25), Validators.pattern('^[0-9]+$')]],
      nombRazonSocial: [''],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      estado: [, [Validators.required]]
    });
    this.productorForm.setValidators(this.comparisonValidator());
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("EstadoMaestro", (res: any) => {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoDocumento", (res: any) => {
      if (res.Result.Success) {
        form.listTiposDocumentos = res.Result.Data;
      }
    });
  }

  get f() {
    return this.productorForm.controls;
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!group.value.fechaInicio || !group.value.fechaFin) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else if (!group.value.estado) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un estado.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.productorForm.value.fechaInicio);
    let vEndDate = new Date(this.productorForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.productorForm.value.fechaInicio.setErrors({ isError: true });
    } //else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      //this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      //this.productorForm.value.fechaFin.setErrors({ isError: true });
    //}
    else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  updateLimit(limit: any) {
    this.limitRef = limit.target.value;
  }

  filterUpdate(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  onSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  Buscar(): void {
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

  New(): void {
    this.router.navigate(['/productor/administracion/productor/create']);
  }

  GoFormListFinca(): void {
    if (this.selected && this.selected.length > 0) {
      this.router.navigate([`/productor/administracion/productor/finca/list/${this.selected[0].ProductorId}`, {title:this.selected[0].NombreRazonSocial}]);
    }
  //  this.nameProductor.emit(this.selected[0].NombreRazonSocial);

  }

  OpenModal(modal: any): void {
    this.modalService.open(modal, { size: 'xl', centered: true });
  }

  Export(): void {
    this.spinner.show();
    const request = {
      Numero: this.productorForm.value.codProductor,
      NombreRazonSocial: this.productorForm.value.nombRazonSocial,
      TipoDocumentoId: this.productorForm.value.tipoDocumento ?? '',
      NumeroDocumento: this.productorForm.value.nroDocumento,
      EstadoId: this.productorForm.value.estado ?? '',
      FechaInicio: new Date(this.productorForm.value.fechaInicio),
      FechaFin: new Date(this.productorForm.value.fechaFin)
    };

    this.productorService.Search(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (!res.Result.ErrCode) {
            const vArrHeaderExcel: HeaderExcel[] = [
              new HeaderExcel("Código", "center"),
              new HeaderExcel("Tipo Documento", "center"),
              new HeaderExcel("Número Documento", "center"),
              new HeaderExcel("Nombre o Razón Social"),
              new HeaderExcel("Departamento"),
              new HeaderExcel("Provincia"),
              new HeaderExcel("Distrito"),
              new HeaderExcel("Zona"),
              new HeaderExcel("Fecha Registro", "center", "dd/mm/yyyy"),
              new HeaderExcel("Estado")
            ];

            let vArrData: any[] = [];
            for (let i = 0; i < res.Result.Data.length; i++) {
              vArrData.push([
                res.Result.Data[i].Numero,
                res.Result.Data[i].TipoDocumento,
                res.Result.Data[i].NumeroDocumento,
                res.Result.Data[i].NombreRazonSocial,
                res.Result.Data[i].Departamento,
                res.Result.Data[i].Provincia,
                res.Result.Data[i].Distrito,
                res.Result.Data[i].Zona,
                new Date(res.Result.Data[i].FechaRegistro),
                res.Result.Data[i].Estado
              ]);
            }
            this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Productores');
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
