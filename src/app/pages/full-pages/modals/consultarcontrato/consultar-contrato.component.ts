import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';

import { DateUtil } from '../../../../services/util/date-util';
import { ContratoService } from '../../../../services/contrato.service';

@Component({
  selector: 'app-consultar-contrato',
  templateUrl: './consultar-contrato.component.html',
  styleUrls: ['./consultar-contrato.component.scss']
})
export class MConsultarContratoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private dateUtil: DateUtil,
    private contratoService: ContratoService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  mContratoForm: FormGroup;
  mListProductos = [];
  mListTipoProduccion = [];
  mSelectedProducto: any;
  mSelectedTipoProduccion: any;
  mErrprGnral = { isError: false, msgError: '' };
  limitRef = 10;
  mSelected = [];
  rows = [];
  tempData = [];
  msgMdlMsgGenerico = "Ocurrio un error interno.";
  @Output() responseContrato = new EventEmitter<any[]>();
  @ViewChild(DatatableComponent) dgConsultaContratos: DatatableComponent;

  ngOnInit(): void {
    this.LoadForm();
    this.mContratoForm.controls.mFechaInicial.setValue(this.dateUtil.currentMonthAgo());
    this.mContratoForm.controls.mFechaFinal.setValue(this.dateUtil.currentDate());
  }

  LoadForm(): void {
    this.mContratoForm = this.fb.group({
      mNroContrato: [],
      mCodCliente: [],
      mFechaInicial: [],
      mFechaFinal: [],
      mDescCliente: [],
      mProducto: [],
      mTipoProduccion: []
    });
    this.mContratoForm.setValidators(this.comparisonValidatorMdlClientes())
  }

  get f() {
    return this.mContratoForm.controls;
  }

  comparisonValidatorMdlClientes(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let finicial = group.controls['fechaInicial'].value;
      let ffinal = group.controls['fechaFinal'].value;

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
      Numero: this.mContratoForm.value.nroContrato ? this.mContratoForm.value.nroContrato : '',
      NumeroCliente: this.mContratoForm.value.codCliente ? this.mContratoForm.value.codCliente : '',
      RazonSocial: this.mContratoForm.value.descCliente ? this.mContratoForm.value.descCliente : '',
      ProductoId: this.mContratoForm.value.producto ? this.mContratoForm.value.producto : '',
      TipoProduccionId: this.mContratoForm.value.tipoProduccion ? this.mContratoForm.value.tipoProduccion : '',
      CalidadId: '',
      EstadoId: '01',
      FechaInicio: this.mContratoForm.value.fechaInicial ? this.mContratoForm.value.fechaInicial : '',
      FechaFin: this.mContratoForm.value.fechaFinal ? this.mContratoForm.value.fechaFinal : ''
    };
  }

  Buscar(): void {
    if (!this.mContratoForm.invalid && !this.mErrprGnral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.contratoService.Search(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.mErrprGnral = { isError: false, msgError: '' };
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
