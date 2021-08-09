import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';

import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { MaestroService } from '../../../../../services/maestro.service';
import { DateUtil } from '../../../../../services/util/date-util';
import { PrecioDiaRendimientoService } from '../../../../../services/precio-dia-rendimiento.service';

@Component({
  selector: 'app-preciodia-rendimiento',
  templateUrl: './preciodia-rendimiento.component.html',
  styleUrls: ['./preciodia-rendimiento.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreciodiaRendimientoComponent implements OnInit {

  frmPrecioDiaRendimiento: FormGroup;
  listStatus: any[];
  selectedStatus: any;
  @ViewChild(DatatableComponent) dtPreciosDiaRendimiento: DatatableComponent;
  limitRef = 10;
  rows = [];
  selected = [];
  tempData = [];
  userSession: any;
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private maestroService: MaestroService,
    private dateUtil: DateUtil,
    private precioDiaRendimientoService: PrecioDiaRendimientoService,
    private spinner: NgxSpinnerService,
    private router: Router) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.GetStatus();
  }

  LoadForm() {
    this.frmPrecioDiaRendimiento = this.fb.group({
      initialdate: [, Validators.required],
      finaldate: [, Validators.required],
      status: [, Validators.required]
    });

    this.frmPrecioDiaRendimiento.setValidators(this.comparisonValidator());

    this.frmPrecioDiaRendimiento.controls.finaldate.setValue(this.dateUtil.currentDate());
    this.frmPrecioDiaRendimiento.controls.initialdate.setValue(this.dateUtil.currentMonthAgo());
  }

  get f() {
    return this.frmPrecioDiaRendimiento.controls;
  }

  comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!group.value.initialdate || !group.value.finaldate) {
        this.errorGeneral = { isError: true, msgError: 'Por favor seleccionar ambas fechas.' };
      } else if (!group.value.status) {
        this.errorGeneral = { isError: true, msgError: 'Por favor seleccionar un estado.' };
      } else {
        this.errorGeneral = { isError: false, msgError: '' };
      }
      return;
    };
  }

  GetStatus() {
    this.listStatus = [];
    this.maestroUtil.obtenerMaestros('EstadoMaestro', (res) => {
      if (res.Result.Success) {
        this.listStatus = res.Result.Data;
      }
    });
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  updateLimit(event: any): void {
    this.limitRef = event.target.value;
  }

  filterUpdate(event: any): void {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.dtPreciosDiaRendimiento.offset = 0;
  }

  Buscar() {
    this.spinner.show();
    const request = {
      FechaInicio: this.frmPrecioDiaRendimiento.value.initialdate,
      FechaFin: this.frmPrecioDiaRendimiento.value.finaldate,
      EstadoId: this.frmPrecioDiaRendimiento.value.status
    };
    this.precioDiaRendimientoService.Consultar(request)
      .subscribe((res) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach((obj: any) => {
            obj.FechaRegistro = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
          });
          this.tempData = res.Result.Data;
          this.rows = this.tempData;
        } else {

        }
      }, (err) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  Nuevo() {
    this.router.navigate(['/exportador/operaciones/preciodiarendimiento/create']);
  }

  Anular() {

  }
}