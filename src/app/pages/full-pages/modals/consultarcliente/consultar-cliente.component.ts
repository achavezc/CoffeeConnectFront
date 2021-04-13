import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";

import { MaestroUtil } from '../../../../services/util/maestro-util';
import { ClienteService } from '../../../../services/cliente.service';

@Component({
  selector: 'app-consultar-cliente',
  templateUrl: './consultar-cliente.component.html',
  styleUrls: ['./consultar-cliente.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MConsultarClienteComponent implements OnInit {

  constructor(private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private maestroUtil: MaestroUtil,
    private clienteService: ClienteService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  @ViewChild('vform') validationForm: FormGroup;
  mdlClienteForm: FormGroup;
  listMdlTipoCliente = [];
  listMdlPais = [];
  listMdlEstados = [];
  selMdlTipoCliente: any;
  selMdlPais: any;
  selMdlEstado: any;
  public rows = [];
  private tempData = [];
  public limitRef = 10;
  selected: any;
  errorMdlGeneral = { isError: false, msgError: '' };
  msgMdlMsgGenerico = "Ocurrio un error interno.";
  @Output() responseCliente = new EventEmitter<any[]>();
  @ViewChild(DatatableComponent) dgModalCLientes: DatatableComponent;

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.mdlClienteForm = new FormGroup({
      mcodCliente: new FormControl('', []),
      mruc: new FormControl('', []),
      mfechaInicial: new FormControl('', [Validators.required]),
      mfechaFinal: new FormControl('', [Validators.required]),
      mdescCliente: new FormControl('', []),
      mtipoCliente: new FormControl('', []),
      mpais: new FormControl(null, []),
      mestado: new FormControl('', [Validators.required])
    });
    this.mdlClienteForm.setValidators(this.comparisonValidatorMdlClientes())
    this.maestroUtil.obtenerMaestros('EstadoMaestro', (res: any) => {
      if (res.Result.Success) {
        this.listMdlEstados = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('TipoCliente', (res: any) => {
      if (res.Result.Success) {
        this.listMdlTipoCliente = res.Result.Data;
      }
    });
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
      let estado = group.controls['estado'].value;

      if (!finicial && !ffinal && !estado) {
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
    return this.selected.indexOf(row) === -1;
  }

  DblSelected(event: any): void {
    // this.responseCliente.emit(this.empresa)
  }

  getRequest(): any {
    return {
      Numero: this.mdlClienteForm.value.codCliente ?? '',
      RazonSocial: this.mdlClienteForm.value.descCliente ?? '',
      TipoClienteId: this.mdlClienteForm.value.tipoCliente ?? '',
      Ruc: this.mdlClienteForm.value.ruc ?? '',
      EstadoId: this.mdlClienteForm.value.estado ?? '',
      PaisId: this.mdlClienteForm.value.pais ?? 0,
      FechaInicio: this.mdlClienteForm.value.fechaInicial ?? '',
      FechaFin: this.mdlClienteForm.value.fechaFinal ?? ''
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
