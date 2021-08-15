import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

import { MaestroService } from '../../../../../../services/maestro.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { PrecioDiaRendimientoService } from '../../../../../../services/precio-dia-rendimiento.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { DateUtil } from '../../../../../../services/util/date-util';

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
  idPriceDayPerformance;
  messageGeneric = 'Ha ocurrido un error interno.';
  errorGeneral = { isError: false, msgError: '' };

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private maestroService: MaestroService,
    private precioDiaRendimientoService: PrecioDiaRendimientoService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtil: DateUtil) { }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.idPriceDayPerformance = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    this.LoadForm();
    if (this.idPriceDayPerformance > 0) {
      this.GetPriceDayPerformanceById();
    } else if (this.idPriceDayPerformance == 0) {
      this.CheckPricesDaysPerformance();
    }
  }

  async LoadForm() {
    this.frmPrecioDiaRendimientoEdit = this.fb.group({
      averageprice: [0],
      exchangerate: [0],
      currency: [],
      datecurrent: []
    });
    await this.GetCurrencys();
    this.frmPrecioDiaRendimientoEdit.controls.datecurrent.setValue(this.dateUtil.currentDate());
    this.frmPrecioDiaRendimientoEdit.controls.currency.setValue(this.userSession.Result.Data.MonedaId);
  }

  get f() {
    return this.frmPrecioDiaRendimientoEdit.controls;
  }

  async GetCurrencys() {
    this.listCurrency = [];
    const res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listCurrency = res.Result.Data;
    }
  }

  CheckPricesDaysPerformance() {
    this.spinner.show();
    const request = { EmpresaId: this.userSession.Result.Data.EmpresaId };
    this.precioDiaRendimientoService.CheckPricePerformance(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.frmPrecioDiaRendimientoEdit.controls.averageprice.setValue(res.Result.Data.PrecioPromedioContrato);
          this.frmPrecioDiaRendimientoEdit.controls.exchangerate.setValue(res.Result.Data.TipoCambio);
          // this.frmPrecioDiaRendimientoEdit.controls.currency.setValue(res.Result.Data[0].MonedaId);
          this.rowsDetails = res.Result.Data.CalculoPrecioDiaRendimiento;
        } else {
          this.alertUtil.alertError('ERROR!', res.Result.Message);
        }
      }, (err) => {
        console.log(err);
        this.spinner.hide();
      })
  }

  Save() {
    const form = this;
    if (this.idPriceDayPerformance == 0) {
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
    } else if (this.idPriceDayPerformance > 0) {
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
          form.Update();
        }
      });
    }
  }

  GetRequest() {
    const request = {
      PrecioDiaRendimientoId: this.idPriceDayPerformance,
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      MonedaId: this.frmPrecioDiaRendimientoEdit.value.currency,
      TipoCambio: this.frmPrecioDiaRendimientoEdit.value.exchangerate,
      PrecioPromedioContrato: this.frmPrecioDiaRendimientoEdit.value.averageprice,
      Rendimientos: this.rowsDetails,
      UsuarioRegistro: this.userSession.Result.Data.NombreUsuario,
      FechaRegistro: null
    };
    return request;
  }

  Insert() {
    this.spinner.show();
    this.precioDiaRendimientoService.Register(this.GetRequest())
      .subscribe((res) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMADO', 'Se guardarón los datos correctamente.', () => {
            this.Cancel();
          });
        } else {
          this.alertUtil.alertError('ERROR!', res.Result.Message);
        }
      }, (err) => {
        this.spinner.hide();
        console.log(err);
        this.errorGeneral = { isError: true, msgError: this.messageGeneric };
      });
  }

  Update() {
    this.spinner.show();
    this.precioDiaRendimientoService.UpdatePriceDayPerformance(this.GetRequest())
      .subscribe((res) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMADO', 'Se actualizarón los datos correctamente.', () => {
            this.Cancel();
          });
        } else {
          this.alertUtil.alertError('ERROR!', res.Result.Message);
        }
      }, (err) => {
        this.spinner.hide();
        console.log(err);
        this.errorGeneral = { isError: true, msgError: this.messageGeneric };
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

  Cancel() {
    this.router.navigate(['/exportador/operaciones/preciodiarendimiento/list']);
  }

  GetPriceDayPerformanceById() {
    this.spinner.show();
    const request = { PrecioDiaRendimientoId: this.idPriceDayPerformance };
    this.precioDiaRendimientoService.CheckPriceDayPerformanceById(request)
      .subscribe((res) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.frmPrecioDiaRendimientoEdit.controls.averageprice.setValue(res.Result.Data.PrecioPromedioContrato);
          this.frmPrecioDiaRendimientoEdit.controls.exchangerate.setValue(res.Result.Data.TipoCambio);
          this.frmPrecioDiaRendimientoEdit.controls.currency.setValue(res.Result.Data.MonedaId);
          this.rowsDetails = res.Result.Data.PrecioDiaRendimientoDetalle;
        } else {
          this.alertUtil.alertError('ERROR', res.Result.Message);
        }
      }, (err) => {
        console.log(err);
        this.errorGeneral = { isError: true, msgError: this.messageGeneric };
        this.spinner.hide();
      });
  }
}
