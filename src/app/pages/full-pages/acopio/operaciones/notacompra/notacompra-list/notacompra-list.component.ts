import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { NotaCompraService } from '../../../../../../services/nota-compra.service';
import { ReqNotaCompraConsultar } from '../../../../../../services/models/req-notacompra-consulta';

@Component({
  selector: 'app-notacompra-list',
  templateUrl: './notacompra-list.component.html',
  styleUrls: ['./notacompra-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotacompraListComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private notaCompraService: NotaCompraService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  consultaNotaCompraForm: any;
  selectedTypeDocument: any;
  selectedState: any;
  selectedType: any;
  listStates: Observable<any[]>;
  listTypeDocuments: Observable<any[]>;
  listTypes: Observable<any[]>;
  submitted: boolean = false;
  error: any = { isError: false, errorMessage: '' };
  @ViewChild(DatatableComponent) table: DatatableComponent;
  limitRef = 10;
  rows = [];
  tempData = [];
  ColumnMode = ColumnMode;
  selected = [];
  errorGeneral: any = { isError: false, errorMessage: '' };

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
  }

  LoadForm(): void {
    this.consultaNotaCompraForm = this.fb.group({
      nroGuiaRecepcion: ['', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      tipoDocumento: [''],
      numeroDocumento: [''],
      nroNotaCompra: [''],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      estado: [''],
      nombreRazonSocial: [''],
      codigoSocio: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      tipo: ['']
    });
    // this.consultaNotaCompraForm.setValidators();
  }

  LoadCombos(): void {
    var form = this;
    this.maestroUtil.obtenerMaestros("EstadoGuiaRecepcion", function (res) {
      if (res.Result.Success) {
        form.listStates = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoDocumento", function (res) {
      if (res.Result.Success) {
        form.listTypeDocuments = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoNotaCompra", function (res) {
      if (res.Result.Success) {
        form.listTypes = res.Result.Data;
      }
    });
  }

  get f() {
    return this.consultaNotaCompraForm.value;
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.consultaNotaCompraForm.value.fechaInicio);
    let vEndDate = new Date(this.consultaNotaCompraForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.consultaNotaCompraForm.value.fechaInicio.setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.consultaNotaCompraForm.value.fechaFin.setErrors({ isError: true })
    }
    else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  Buscar(): void {
    if (this.consultaNotaCompraForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      let request = new ReqNotaCompraConsultar(this.consultaNotaCompraForm.value.nroNotaCompra,
        this.consultaNotaCompraForm.value.nroGuiaRecepcion,
        this.consultaNotaCompraForm.value.nombreRazonSocial,
        this.consultaNotaCompraForm.value.tipoDocumento,
        this.consultaNotaCompraForm.value.numeroDocumento,
        this.consultaNotaCompraForm.value.codigoSocio,
        this.consultaNotaCompraForm.value.estado,
        this.consultaNotaCompraForm.value.tipo,
        new Date(this.consultaNotaCompraForm.value.fechaInicio),
        new Date(this.consultaNotaCompraForm.value.fechaFin), 1);

      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });

      this.notaCompraService.Consultar(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              let vFecha: Date;
              res.Result.Data.forEach((obj: any) => {
                vFecha = new Date(obj.FechaRegistro);
                obj.FechaRegistroCadena = vFecha.getUTCDate() + "/" + vFecha.getUTCMonth() + 1 + "/" + vFecha.getUTCFullYear();
              });
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
            } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
              // this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
            } else {
              // this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            // this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            // this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  Anular() {

  }

  Exportar() {

  }

}
