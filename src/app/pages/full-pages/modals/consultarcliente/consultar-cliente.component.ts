import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";

import { MaestroUtil } from '../../../../services/util/maestro-util';
import { DateUtil } from '../../../../services/util/date-util';
import { ClienteService } from '../../../../services/cliente.service';

@Component({
  selector: 'app-consultar-cliente',
  templateUrl: './consultar-cliente.component.html',
  styleUrls: ['./consultar-cliente.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MConsultarClienteComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  mdlClienteForm: FormGroup;
  listMdlTipoCliente: any[];
  listMdlPais: any[];
  selMdlTipoCliente: any;
  selMdlPais: any;
  public rows = [];
  private tempData = [];
  public limitRef = 10;
  public ColumnMode = ColumnMode;
  selectedClientes = [];
  errorMdlGeneral = { isError: false, msgError: '' };
  msgMdlMsgGenerico = "Ocurrio un error interno.";
  @Output() responseCliente = new EventEmitter<any[]>();
  @ViewChild(DatatableComponent) dgModalCLientes: DatatableComponent;

  constructor(private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private maestroUtil: MaestroUtil,
    private clienteService: ClienteService,
    private dateUtil: DateUtil,
    private fb: FormBuilder) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.mdlClienteForm = this.fb.group({
      mcodCliente: [],
      mruc: [],
      mfechaInicial: ['', [Validators.required]],
      mfechaFinal: [, [Validators.required]],
      mdescCliente: [],
      mtipoCliente: [],
      mpais: []
    });

    this.mdlClienteForm.controls.mfechaInicial.setValue(this.dateUtil.currentMonthAgo());
    this.mdlClienteForm.controls.mfechaFinal.setValue(this.dateUtil.currentDate());
    this.mdlClienteForm.setValidators(this.comparisonValidatorMdlClientes())

    this.listMdlTipoCliente = [];
    this.maestroUtil.obtenerMaestros('TipoCliente', (res: any) => {
      if (res.Result.Success) {
        this.listMdlTipoCliente = res.Result.Data;
      }
    });
    this.listMdlPais = [];
    this.maestroUtil.GetPais((res: any) => {
      if (res.Result.Success) {
        this.listMdlPais = res.Result.Data;
      }
    });
  }

  get fm() {
    return this.mdlClienteForm.controls;
  }

  public comparisonValidatorMdlClientes(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let finicial = group.controls['fechaInicial'].value;
      let ffinal = group.controls['fechaFinal'].value;

      if (!finicial && !ffinal) {
        this.errorMdlGeneral = { isError: true, msgError: 'Por favor ingresar por lo menos un filtro.' };
      }
      else {
        this.errorMdlGeneral = { isError: false, msgError: '' };
      }
      return;
    };
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
    this.dgModalCLientes.offset = 0;
  }

  singleSelectCheck(row: any) {
    return this.selectedClientes.indexOf(row) === -1;
  }

  DblSelected(event: any): void {
    this.responseCliente.emit(event);
  }

  getRequest(): any {
    return {
      Numero: this.mdlClienteForm.value.mcodCliente ?? '',
      RazonSocial: this.mdlClienteForm.value.mdescCliente ?? '',
      TipoClienteId: this.mdlClienteForm.value.mtipoCliente ?? '',
      Ruc: this.mdlClienteForm.value.mruc ?? '',
      EstadoId: this.mdlClienteForm.value.mestado ?? '',
      PaisId: this.mdlClienteForm.value.mpais ?? 0,
      FechaInicio: this.mdlClienteForm.value.mfechaInicial ?? '',
      FechaFin: this.mdlClienteForm.value.mfechaFinal ?? ''
    };
  }

  Buscar(): void {
    if (!this.mdlClienteForm.invalid && !this.errorMdlGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.clienteService.Search(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorMdlGeneral = { isError: false, msgError: '' };
          this.rows = res.Result.Data;
          this.tempData = this.rows;
        } else {
          this.errorMdlGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.errorMdlGeneral = { isError: true, msgError: this.msgMdlMsgGenerico };
      });
    }
  }

  close() {
    this.modalService.dismissAll();
  }

}
