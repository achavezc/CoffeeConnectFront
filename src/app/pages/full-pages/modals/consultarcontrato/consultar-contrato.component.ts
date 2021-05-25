import { Component, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';

import { DateUtil } from '../../../../services/util/date-util';
import { ContratoService } from '../../../../services/contrato.service';
import { MaestroUtil } from '../../../../services/util/maestro-util';

@Component({
  selector: 'app-consultar-contrato',
  templateUrl: './consultar-contrato.component.html',
  styleUrls: ['./consultar-contrato.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MConsultarContratoComponent implements OnInit {

  mContratoForm: FormGroup;
  mListProductos: any[];
  mListTipoProduccion: any[];
  mListCalidad: any[];
  mSelectedProducto: any;
  mSelectedTipoProduccion: any;
  mSelectedCalidad: any;
  mErrprGnral = { isError: false, msgError: '' };
  limitRef = 10;
  mSelected = [];
  rows = [];
  tempData = [];
  msgMdlMsgGenerico = "Ocurrio un error interno.";
  @Output() responseContrato = new EventEmitter<any[]>();
  @ViewChild(DatatableComponent) dgConsultaContratos: DatatableComponent;
  userSession: any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private dateUtil: DateUtil,
    private contratoService: ContratoService,
    private maestroUtil: MaestroUtil) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
  }

  LoadForm(): void {
    this.mContratoForm = this.fb.group({
      mNroContrato: [],
      mCodCliente: [],
      mFechaInicial: [, Validators.required],
      mFechaFinal: [, Validators.required],
      mDescCliente: [],
      mProducto: [],
      mTipoProduccion: [],
      mCalidad: []
    });

    this.mContratoForm.setValidators(this.comparisonValidatorMdlClientes())
    this.mContratoForm.controls.mFechaInicial.setValue(this.dateUtil.currentMonthAgo());
    this.mContratoForm.controls.mFechaFinal.setValue(this.dateUtil.currentDate());
    this.maestroUtil.obtenerMaestros('Producto', (res: any) => {
      if (res.Result.Success) {
        this.mListProductos = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('TipoProduccion', (res: any) => {
      if (res.Result.Success) {
        this.mListTipoProduccion = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('Calidad', (res: any) => {
      if (res.Result.Success) {
        this.mListCalidad = res.Result.Data;
      }
    });
  }

  get fm() {
    return this.mContratoForm.controls;
  }

  comparisonValidatorMdlClientes(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let finicial = group.controls['mFechaInicial'].value;
      let ffinal = group.controls['mFechaFinal'].value;

      if (!finicial && !ffinal) {
        this.mErrprGnral = { isError: true, msgError: 'Por favor ingresar por lo menos un filtro.' };
      }
      else {
        this.mErrprGnral = { isError: false, msgError: '' };
      }
      return;
    };
  }

  singleSelectCheck(row: any) {
    return this.mSelected.indexOf(row) === -1;
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
    this.dgConsultaContratos.offset = 0;
  }

  DblSelected(): void {
    this.responseContrato.emit(this.mSelected);
  }

  getRequest(): any {
    return {
      Numero: this.mContratoForm.value.mNroContrato ? this.mContratoForm.value.mNroContrato : '',
      NumeroCliente: this.mContratoForm.value.mCodCliente ? this.mContratoForm.value.mCodCliente : '',
      RazonSocial: this.mContratoForm.value.mDescCliente ? this.mContratoForm.value.mDescCliente : '',
      ProductoId: this.mContratoForm.value.mProducto ? this.mContratoForm.value.mProducto : '',
      TipoProduccionId: this.mContratoForm.value.mTipoProduccion ? this.mContratoForm.value.mTipoProduccion : '',
      CalidadId: '',
      EstadoId: '01',
      FechaInicio: this.mContratoForm.value.mFechaInicial ? this.mContratoForm.value.mFechaInicial : '',
      FechaFin: this.mContratoForm.value.mFechaFinal ? this.mContratoForm.value.mFechaFinal : '',
      EmpresaId: this.userSession.Result.Data.EmpresaId
    };
  }

  Buscar(): void {
    if (!this.mContratoForm.invalid) {
      this.spinner.show();
      const request = this.getRequest();
      this.contratoService.Search(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.mErrprGnral = { isError: false, msgError: '' };
          res.Result.Data.forEach((obj: any) => {
            obj.FechaEmbarqueString = this.dateUtil.formatDate(new Date(obj.FechaEmbarque));
          });
          this.rows = res.Result.Data;
          this.tempData = this.rows;
        } else {
          this.mErrprGnral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.mErrprGnral = { isError: true, msgError: this.msgMdlMsgGenerico };
      });
    } else {

    }
  }

  close() {
    this.modalService.dismissAll();
  }
}
