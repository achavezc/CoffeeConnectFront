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
  listCurrency: any[];
  selectedCurrency: any;
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  rowsDetails = [];
  isLoading = true;
  userSession: any;

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private maestroService: MaestroService) { }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.GetCurrencys();
    this.CheckPricesDaysPerformance();
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

  CheckPricesDaysPerformance() {
    const request = { EmpresaId: this.userSession.Result.Data.EmpresaId };
    this.maestroService.CheckPriceDayPerformance(request)
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.frmPrecioDiaRendimiento.controls.averageprice.setValue(res.Result.Data[0].PrecioPromedioContrato);
          this.frmPrecioDiaRendimiento.controls.exchangerate.setValue(res.Result.Data[0].TipoCambio);
          this.frmPrecioDiaRendimiento.controls.currency.setValue(res.Result.Data[0].MonedaId);
          this.rowsDetails = res.Result.Data;
        } else {

        }
      }, (err) => {
        console.log(err);
      })
  }

  Save() {

  }
}
