import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { MaestroService } from '../../../../../services/maestro.service';

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
    private maestroService: MaestroService) { 
      this.singleSelectCheck = this.singleSelectCheck.bind(this);
    }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.GetStatus();
  }

  LoadForm() {
    this.frmPrecioDiaRendimiento = this.fb.group({
      initialdate: [],
      finaldate: [],
      status: []
    });
  }

  get f() {
    return this.frmPrecioDiaRendimiento.controls;
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

  }
}
