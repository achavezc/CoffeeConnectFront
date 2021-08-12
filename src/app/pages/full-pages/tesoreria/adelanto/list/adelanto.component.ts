import { Component, OnInit, ViewEncapsulation, ViewChild,Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from '@angular/router';
import swal from 'sweetalert2';

import { DateUtil } from '../../../../../services/util/date-util';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { AdelantoService } from '../../../../../services/adelanto.service';
import { AlertUtil } from '../../../../../services/util/alert-util';

@Component({
  selector: 'app-adelanto',
  templateUrl: './adelanto.component.html',
  styleUrls: ['./adelanto.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AdelantoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil,
    private adelantoService: AdelantoService,
    private router: Router,
    private alertUtil: AlertUtil) { }

    adelantoForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  listEstado: any[];
  listTipoDocumento: any[];
  selectedEstado: any;
  selectedTipoDocumento: any;
  selected = [];
  limitRef = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  userSession: any;
  submitted = false;
  @Input() popUp = false;
  @Output() agregarContratoEvent = new EventEmitter<any>();
  mensajeErrorGenerico = "Ocurrio un error interno.";

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    this.adelantoForm.controls['fechaInicial'].setValue(this.dateUtil.currentMonthAgo());
    this.adelantoForm.controls['fechaFinal'].setValue(this.dateUtil.currentDate());
   
  }

  LoadForm(): void {
    this.adelantoForm = this.fb.group({
      nroRecibo: [],
      tipoDocumento: [],
      fechaInicial: [, Validators.required],
      fechaFinal: [, Validators.required],
      codigoSocio: [],
      numeroDocumento: [],
      razonSocial: [],
      estado: [, Validators.required],
      numeroNotaCompra: []
    });
  }

  get f() {
    return this.adelantoForm.controls;
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
    this.maestroUtil.obtenerMaestros('TipoDocumento', (res: any) => {
      if (res.Result.Success) {
        form.listTipoDocumento = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('EstadoMaestro', (res: any) => {
      if (res.Result.Success) {
        form.listEstado = res.Result.Data;
      }
    });
  }

  
  anular() {
    if (this.selected.length > 0) {
        var form = this;
        swal.fire({
          title: '¿Estas seguro?',
          text: "¿Estas seguro de anular la guia?",
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
    this.adelantoService.Anular(this.selected[0].AdelantoId, this.userSession.Result.Data.NombreUsuario)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Anulado!', 'Adelanto Anulada.');
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
  asociar(){
    this.alertUtil.alertOk('Asociado!', 'Adelanto Asociado.');
  }

  getRequest(): any {
    return {
      Numero: this.adelantoForm.value.nroRecibo ? this.adelantoForm.value.nroRecibo : '',
      NumeroNotaCompra: this.adelantoForm.value.numeroNotaCompra ? this.adelantoForm.value.numeroNotaCompra : '',
      CodigoSocio: this.adelantoForm.value.codigoSocio ? this.adelantoForm.value.codigoSocio : '',
      NombreRazonSocial: this.adelantoForm.value.razonSocial ? this.adelantoForm.value.razonSocial : '',
      TipoDocumentoId: this.adelantoForm.value.tipoDocumento ? this.adelantoForm.value.tipoDocumento : '',
      NumeroDocumento: this.adelantoForm.value.numeroDocumento ? this.adelantoForm.value.numeroDocumento : '',
      EstadoId: this.adelantoForm.value.estado ? this.adelantoForm.value.estado : '',
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      FechaInicio: this.adelantoForm.value.fechaInicial ? this.adelantoForm.value.fechaInicial : '',
      FechaFin: this.adelantoForm.value.fechaFinal ? this.adelantoForm.value.fechaFinal : ''
    };
  }

  Buscar(): void {
    this.Search();
  }

  Search(xls = false): void {
    if (this.adelantoForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      this.spinner.show();
      const request = this.getRequest();
      this.adelantoService.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorGeneral = { isError: false, msgError: '' };
            res.Result.Data.forEach((obj: any) => {
              obj.FechaPagoString = this.dateUtil.formatDate(new Date(obj.FechaPago));
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
    this.router.navigate(['/tesoreria/adelanto/edit']);
  }
 
}
