import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { MaestroService } from '../../../../../../services/maestro.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';

@Component({
  selector: 'app-precio-dia-rendimiento-edit',
  templateUrl: './precio-dia-rendimiento-edit.component.html',
  styleUrls: ['./precio-dia-rendimiento-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrecioDiaRendimientoEditComponent implements OnInit {

  frmPrecioDiaRendimientoEdit: FormGroup;
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
    this.frmPrecioDiaRendimientoEdit = this.fb.group({
      averageprice: [0],
      exchangerate: [0],
      currency: []
    });
  }

  get f() {
    return this.frmPrecioDiaRendimientoEdit.controls;
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
          this.frmPrecioDiaRendimientoEdit.controls.averageprice.setValue(res.Result.Data[0].PrecioPromedioContrato);
          this.frmPrecioDiaRendimientoEdit.controls.exchangerate.setValue(res.Result.Data[0].TipoCambio);
          this.frmPrecioDiaRendimientoEdit.controls.currency.setValue(res.Result.Data[0].MonedaId);
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
