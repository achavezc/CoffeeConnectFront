import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { MaestroUtil } from '../../../../../services/util/maestro-util';

@Component({
  selector: 'app-preciodia-rendimiento',
  templateUrl: './preciodia-rendimiento.component.html',
  styleUrls: ['./preciodia-rendimiento.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreciodiaRendimientoComponent implements OnInit {

  frmPrecioDiaRendimiento: FormGroup;
  listCurrency: any[];
  selectedCurrency: any;
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  rowsDetails = [];
  isLoading = true;

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil) { }

  ngOnInit(): void {
    this.LoadForm();
    this.GetCurrencys();
  }

  LoadForm() {
    this.frmPrecioDiaRendimiento = this.fb.group({
      averageprice: [0],
      exchangerate: [0],
      currency: []
    });
  }

  get f() {
    return this.frmPrecioDiaRendimiento.controls;
  }

  GetCurrencys() {
    this.listCurrency = [];
    this.maestroUtil.obtenerMaestros('Moneda', (res) => {
      if (res.Result.Success) {
        this.listCurrency = res.Result.Data;
      }
    });
  }

  Save() {

  }
}
