import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import swal from 'sweetalert2';

import { MaestroService } from '../../../../../../services/maestro.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { PrecioDiaRendimientoService } from '../../../../../../services/precio-dia-rendimiento.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';

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
    private maestroService: MaestroService,
    private precioDiaRendimientoService: PrecioDiaRendimientoService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil) { }

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
    const form = this;
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de continuar con el registro?.`,
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
    }).then((result) => {
      if (result.value) {
        form.Insert();
      }
    });
  }

  Insert() {
    this.spinner.show();
    const request = {
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      MonedaId: this.frmPrecioDiaRendimientoEdit.value.currency,
      TipoCambio: this.frmPrecioDiaRendimientoEdit.value.exchangerate,
      PrecioPromedioContrato: this.frmPrecioDiaRendimientoEdit.value.averageprice,
      Rendimientos: this.rowsDetails,
      UsuarioRegistro: this.userSession.Result.Data.NombreUsuario,
      FechaRegistro: null
    };

    this.precioDiaRendimientoService.Registrar(request)
      .subscribe((res) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOk('CONFIRMADO', 'Se guardarón los datos correctamente.');
        } else {
          this.alertUtil.alertOk('ERROR!', res.Result.Message);
        }
      }, (err) => {
        this.spinner.hide();
        console.log(err);
      });
  }

  UpdatesValuesResults(e: any, i: any, prop: any): void {
    if (prop === 'v1')
      this.rowsDetails[i].Valor1 = parseFloat(e.target.value)
    else if (prop === 'v2')
      this.rowsDetails[i].Valor2 = parseFloat(e.target.value)
    else if (prop === 'v3')
      this.rowsDetails[i].Valor3 = parseFloat(e.target.value)

  }
}
