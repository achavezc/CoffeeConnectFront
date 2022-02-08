import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import {AuthService} from './../../../../../../services/auth.service';
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
  readonly: boolean;

  constructor(private fb: FormBuilder,
    private maestroService: MaestroService,
    private precioDiaRendimientoService: PrecioDiaRendimientoService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtil: DateUtil,
    private authService : AuthService) { }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.idPriceDayPerformance = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    this.readonly= this.authService.esReadOnly(this.userSession.Result.Data.OpcionesEscritura);
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
    if (this.rowsDetails.filter(x => !x.Valor1 || !x.Valor2).length <= 0) {
    //if (this.rowsDetails.filter(x => !x.Valor1).length <= 0) {  
    if (this.idPriceDayPerformance == 0) {

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con el registro?.` , function (result) {
          if (result.isConfirmed) {
            form.Insert();
          }
        });

      } else if (this.idPriceDayPerformance > 0) {

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la actuailizacion?.` , function (result) {
          if (result.isConfirmed) {
            form.Update();
          }
        });
      }
    } else {
      this.alertUtil.alertWarning('VALIDACIÓN', 'Las columnas "Valor 1" y "Valor 2" de todas las filas son obligatorias.');
      //this.alertUtil.alertWarning('VALIDACIÓN', 'Las columnas "Valor 1" de todas las filas son obligatorias.');
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
    if (prop === 'v1'){
      for(var x = i ; x <this.rowsDetails.length; x++) { 
        if (x == i )
        {
          this.rowsDetails[x].Valor1 = Number(e.target.value);
        }
        else {
        var z = Number(this.rowsDetails[ x - 1].Valor1);
        this.rowsDetails[x].Valor1 = Number((z + 0.1).toFixed(2));
        }
     }
  }
    else if (prop === 'v2')
    {
      for(var x = i ; x <this.rowsDetails.length; x++) { 
        if (x == i )
        {
          this.rowsDetails[x].Valor2 = Number(e.target.value);
        }
        else {
        var z = Number(this.rowsDetails[x - 1].Valor2);
        this.rowsDetails[x].Valor2 =  Number((z + 0.1).toFixed(2));
        }
    }
  }
    else if (prop === 'v3')
      {
        for(var x = i ; x <this.rowsDetails.length; x++) { 
          if (x == i )
          {
            this.rowsDetails[x].Valor3 = Number(e.target.value);
          }
          else {
          var z = Number(this.rowsDetails[x - 1].Valor3);
          this.rowsDetails[x].Valor3 =  Number((z + 0.1).toFixed(2));
          }
      }
      }
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
