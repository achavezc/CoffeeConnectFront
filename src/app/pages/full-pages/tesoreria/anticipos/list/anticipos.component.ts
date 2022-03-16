import { Component, OnInit, ViewEncapsulation, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DateUtil } from '../../../../../services/util/date-util';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { AnticipoService } from '../../../../../services/anticipio.service';
import { AlertUtil } from '../../../../../services/util/alert-util';
import {AuthService} from '../../../../../services/auth.service';

@Component({
  selector: 'app-anticipos',
  templateUrl: './anticipos.component.html',
  styleUrls: ['./anticipos.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnticiposComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil,
    private anticipoService: AnticipoService,
    private router: Router,
    private alertUtil: AlertUtil,
    private modalService: NgbModal,
    private authService : AuthService) { }

  anticipoForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  listEstado: any[];
  listTipoDocumento: any[];
  selectedEstado: any;
  selectedTipoDocumento: any;
  selected = [];
  limitRef = 10;
  rows = [];
  estadoPendienteLiquidar = "01";
  estadoLiquidado = "02";

  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  userSession: any;
  submitted = false;
  @Output() agregarContratoEvent = new EventEmitter<any>();
  mensajeErrorGenerico = "Ocurrio un error interno.";
  popUpNotaCompra = true;
  readonly: boolean;
  popUp = true;

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    this.anticipoForm.controls['fechaInicial'].setValue(this.dateUtil.currentMonthAgo());
    this.anticipoForm.controls['fechaFinal'].setValue(this.dateUtil.currentDate());
    this.readonly= this.authService.esReadOnly(this.userSession.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.anticipoForm = this.fb.group({

      nroRecibo: [],
      tipoDocumento: [],
      fechaInicial: [, Validators.required],
      fechaFinal: [, Validators.required],
      ruc: [],
      razonSocial: [],
      estado: [, Validators.required],
      numeroNotaIngreso: []
    });
  }

  get f() {
    return this.anticipoForm.controls;
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
    this.table.offset = 0;
  }

  onSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  LoadCombos(): void {
    const form = this;
    
    this.maestroUtil.obtenerMaestros('EstadoAnticipo', (res: any) => {
      if (res.Result.Success) {
        form.listEstado = res.Result.Data;
        form.anticipoForm.controls['estado'].setValue("01");
      }
    });
  }


  anular() {
    if (this.selected.length > 0) {
      if (this.selected[0].EstadoId == this.estadoPendienteLiquidar) {
        var form = this;
        swal.fire({
          title: '¿Estas seguro?',
          text: "¿Estas seguro de anular el Anticipo?",
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
        }).then(function (result) {
          if (result.value) {
            form.anularAdelanto();
          }
        });
      }
      else {
        this.alertUtil.alertError("Error", "Solo se puede anular anticipos por Liquidar.")
      }
    }
  }

  anularAdelanto() {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.anticipoService.Anular(this.selected[0].AnticipoId, this.userSession.Result.Data.NombreUsuario)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Anulado!', 'Adelanto Anulado.');
            this.Search();

          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.alertUtil.alertError('Error', res.Result.Message);
          } else {
            this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
          }
        } else {
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      );
  }
  openModal(modalNotaIngreso) {

    if (this.selected.length > 0) {
      if (this.selected[0].EstadoId == this.estadoPendienteLiquidar) {
        this.modalService.open(modalNotaIngreso, { windowClass: 'dark-modal', size: 'xl' });
      }
      else {

        this.alertUtil.alertError("Error", "Solo se puede asociar adelantos por Liquidar.")
      }
    }


    // this.cargarLotes();
    // this.clear();
    // this.consultaLotes.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    // this.consultaLotes.controls['fechaFinal'].setValue(this.dateUtil.currentDate());

  }
  getRequestAsociar(idNotaCompra) {
    var objId = [{ "Id": 0 }];
    objId[0].Id = idNotaCompra;
    return {
      AnticipoId: this.selected[0].Anticipo,
      Usuario: this.userSession.Result.Data.NombreUsuario,
      NotasIngresoPlantaId: objId
    };
  }
  
  agregarNotaIngreso(e) {
    var request = this.getRequestAsociar(e[0].NotaCompraId);
    this.anticipoService.Asociar(request).subscribe((res: any) => {
      this.modalService.dismissAll();
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          this.alertUtil.alertOk('Asociado!', 'Adelanto Asociado.');
          this.Search();

        } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
          this.alertUtil.alertError('Error', res.Result.Message);
        } else {
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      } else {
        this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
      }
    }, (err: any) => {
      this.modalService.dismissAll();
      console.log(err);
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });


  }
  getRequest(): any {
    return {
      Numero: this.anticipoForm.value.nroRecibo ? this.anticipoForm.value.nroRecibo : '',
      NumeroNotaIngresoPlanta: this.anticipoForm.value.numeroNotaIngreso ? this.anticipoForm.value.numeroNotaIngreso : '',
      RazonSocialProveedor: this.anticipoForm.value.razonSocial ? this.anticipoForm.value.razonSocial : '',
      RucProveedor: this.anticipoForm.value.ruc ? this.anticipoForm.value.ruc : '',
      EstadoId: this.anticipoForm.value.estado ? this.anticipoForm.value.estado : '',
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      FechaInicio: this.anticipoForm.value.fechaInicial ? this.anticipoForm.value.fechaInicial : '',
      FechaFin: this.anticipoForm.value.fechaFinal ? this.anticipoForm.value.fechaFinal : ''
    };
  }

  Buscar(): void {
    this.Search();
  }

  Search(xls = false): void {
    if (this.anticipoForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      this.spinner.show();
      const request = this.getRequest();
      this.anticipoService.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorGeneral = { isError: false, msgError: '' };
          res.Result.Data.forEach((obj: any) => {
            obj.FechaPago = this.dateUtil.formatDate(new Date(obj.FechaPago));
          });
          this.rows = res.Result.Data;
          this.tempData = this.rows;

        } else {
          this.errorGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      });
    }
  }

  nuevo() {
    this.router.navigate(['/tesoreria/anticipo/edit']);
  }

  Export() {
    const form = this;
    swal.fire({
      title: '¿Estas seguro?',
      text: "¿Estas seguro de exportar todos los datos?",
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
    }).then(function (result) {
      if (result.value) {
        form.ExportRows();
      }
    });
  }

  ExportRows() {
    const request = this.getRequest();
    this.anticipoService.Consultar(request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.errorGeneral = { isError: false, msgError: '' };
        const vArrHeaderExcel: HeaderExcel[] = [
          new HeaderExcel("Número Recibo", "center"),
          new HeaderExcel("Nota Ingreso", "center"),
          new HeaderExcel("Ruc", "center"),
          new HeaderExcel("Razón Social"),
          new HeaderExcel("Fecha Pago", "center", "dd/mm/yyyy"),
          new HeaderExcel("Moneda", "center"),
          new HeaderExcel("Importe", "right"),
          new HeaderExcel("Estado")
        ];

        let vArrData: any[] = [];
        for (let i = 0; i < res.Result.Data.length; i++) {
          vArrData.push([
            res.Result.Data[i].Numero,
            res.Result.Data[i].NumeroNotaIngresoPlanta,
            res.Result.Data[i].RucProveedor,
            res.Result.Data[i].RazonSocialProveedor,
            new Date(res.Result.Data[i].FechaPago),
            res.Result.Data[i].Moneda,
            res.Result.Data[i].Monto,
            res.Result.Data[i].Estado
          ]);
        }
        this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Adelanto');
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });
  }

}
