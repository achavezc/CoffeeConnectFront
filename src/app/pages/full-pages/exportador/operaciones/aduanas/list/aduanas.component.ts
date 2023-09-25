import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';
import { Router } from "@angular/router"
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { AduanaService } from '../../../../../../services/aduanas.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { formatDate } from '@angular/common';
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-aduanas',
  templateUrl: './aduanas.component.html',
  styleUrls: ['./aduanas.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AduanasComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private aduanaService: AduanaService,
    private router: Router,
    private modalService: NgbModal,
    private excelService: ExcelService,
    private authService : AuthService) {
  }

  aduanasForm: FormGroup;
  listEstados: [] = [];
  selectedEstado: any;
  submitted: boolean = false;
  error: any = { isError: false, errorMessage: '' };
  @ViewChild(DatatableComponent) table: DatatableComponent;
  limitRef = 10;
  rows = [];
  tempData = [];
  selected = [];
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico: string = "Ocurrio un error interno.";
  errorFecha: any = { isError: false, errorMessage: '' };
  vSessionUser: any;
  estadoActivo = '01';
  selectExportador: any[] = [];
  selectProductor: any[] = [];
  selectContrato: any[] = [];
  selectEmpresa: any[] = [];
  popUp = true;
  readonly: boolean;

  ngOnInit(): void {
    this.LoadForm();
    this.aduanasForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.aduanasForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    ////this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  close() {
    this.modalService.dismissAll();
  }
  async LoadForm() {
    this.aduanasForm = this.fb.group({
      numeroContrato: [''],
      ruc: [''],
      codigo: [''],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      agenciaAduanera: ['', []],
      clienteFinal: ['', []],
      exportador: [''],
      productor: ['']
    });
    this.aduanasForm.setValidators(this.comparisonValidator());
    await this.LoadCombos();
  }

  receiveMessage($event) {
    this.selectEmpresa = $event
    this.aduanasForm.get('agenciaAduanera').setValue(this.selectEmpresa[0].RazonSocial);
    this.aduanasForm.get('ruc').setValue(this.selectEmpresa[0].Ruc);
    this.modalService.dismissAll();
  }

  receiveMessageContrato($event) {
    this.selectContrato = $event;
    this.aduanasForm.get('clienteFinal').setValue(this.selectContrato[0].Cliente);
    this.modalService.dismissAll();
  }

  receiveMessageExportador($event) {
    this.selectExportador = $event
    this.aduanasForm.get('exportador').setValue(this.selectExportador[0].RazonSocial);
    this.modalService.dismissAll();
  }

  receiveMessageProductor($event) {
    this.selectProductor = $event
    this.aduanasForm.get('productor').setValue(this.selectProductor[0].RazonSocial);
    this.modalService.dismissAll();
  }

  async LoadCombos() {
    let form = this;
    this.maestroUtil.obtenerMaestros("EstadoAduana", function (res) {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
      }
    });



  }

  get f() {
    return this.aduanasForm.controls;
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!group.value.fechaInicio || !group.value.fechaFin) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else if (!group.controls["estado"].value) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un estado.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }



  compareTwoDates(): void {
    let vBeginDate = new Date(this.aduanasForm.value.fechaInicio);
    let vEndDate = new Date(this.aduanasForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.aduanasForm.value.fechaInicio.setErrors({ isError: true });
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.aduanasForm.value.fechaFin.setErrors({ isError: true });
    }
    else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

  filterUpdate(event) {
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
  exportar(): void {
    this.spinner.show();
    const form = this;
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de exportar la información mostrada?`,
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
        form.Buscar(true);
        form.spinner.hide();
      }
    });
  }
  Buscar(xls = false): void {
    if (this.aduanasForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      let request = {
        Numero: this.aduanasForm.value.codigo,
        NumeroContrato: this.aduanasForm.value.numeroContrato,
        RazonSocialCliente: this.aduanasForm.value.clienteFinal,
        RazonSocialEmpresaAgenciaAduanera: this.aduanasForm.value.agenciaAduanera,
        RucEmpresaAgenciaAduanera: this.aduanasForm.value.ruc,
        RazonSocialEmpresaExportadora: this.aduanasForm.value.exportador,
        RazonSocialEmpresaProductora: this.aduanasForm.value.productor,
        FechaInicio: new Date(this.aduanasForm.value.fechaInicio),
        FechaFin: new Date(this.aduanasForm.value.fechaFin),
        EstadoId: this.aduanasForm.controls["estado"].value ?? '',
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId
      };

      this.spinner.show();

      this.aduanaService.Consultar(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              if (!xls) {
              res.Result.Data.forEach((obj: any) => {
                obj.MesEmbarque = obj.FechaEmbarque == null ? null : formatDate(obj.FechaEmbarque, 'MM/yyyy', 'en');
                obj.FechaEmbarque =this.dateUtil.formatDate(obj.FechaEmbarque);
                obj.EmpaqueTipo = obj.Empaque + '-' + obj.TipoEmpaque;
                obj.FechaEnvioMuestra = this.dateUtil.formatDate(obj.FechaEnvioMuestra);
                obj.FechaRecepcionMuestra = this.dateUtil.formatDate(obj.FechaRecepcionMuestra);
                obj.FechaZarpeNave = this.dateUtil.formatDate(obj.FechaZarpeNave);
                obj.FechaEnvioDocumentos = this.dateUtil.formatDate(obj.FechaEnvioDocumentos);
                obj.FechaLlegadaDocumentos =  this.dateUtil.formatDate(obj.FechaLlegadaDocumentos);
                obj.FechaPagoFactura =  this.dateUtil.formatDate(obj.FechaPagoFactura);
                obj.FechaEstampado = this.dateUtil.formatDate(obj.FechaEstampado);
              });
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
            }
            else
            {
              const vArrHeaderExcel = [
                new HeaderExcel("Numero", "center"),
                new HeaderExcel("N° Contrato"),
                new HeaderExcel("Estado", "center"),
                new HeaderExcel("RUC Ag. Aduanera"),
                new HeaderExcel("Ag. Aduanas"),
                new HeaderExcel("Exportador"),
                new HeaderExcel("Cliente Final", "center"),
                new HeaderExcel("Productor"),
                new HeaderExcel("Contrato Interno (Productor)"),
                new HeaderExcel("Mes de Embarque"),
                new HeaderExcel("Certificacion"),
                new HeaderExcel("Calidad"),
                new HeaderExcel("Cantidad de Defectos"),
                new HeaderExcel("Nro. de Contenedor"),
                new HeaderExcel("Cantidad"),
                new HeaderExcel("Empaque/Tipo"),
                new HeaderExcel("Fecha Envio Muestras"),
                new HeaderExcel("Estado de Envio"),
                new HeaderExcel("Fecha Recepcion en Destino"),
                new HeaderExcel("Fecha Estampado"),
                // new HeaderExcel("Fecha de Embarque Planta"),
                new HeaderExcel("Fecha Zarpe Nave"),
                new HeaderExcel("Puerto"),
                new HeaderExcel("Status Embarque"),
                new HeaderExcel("Fec. Envio Documentos"),
                new HeaderExcel("Fec. Llegada Documentos"),
                new HeaderExcel("Status Pago Factura"),
                new HeaderExcel("Fec. Pago Factura")
              ];
  
              let vArrData: any[] = [];
              this.tempData.forEach((x: any) => vArrData.push([
                x.Numero, 
                x.NumeroContrato, 
                x.Estado, 
                x.RucEmpresaAgenciaAduanera, 
                x.RazonSocialEmpresaAgenciaAduanera, 
                x.RazonSocialEmpresaExportadora,
                x.RazonSocialCliente,
                x.RazonSocialEmpresaProductora,
                x.NumeroContratoInternoProductor,
                x.MesEmbarque,
                x.TipoCertificacion,
                x.Calidad,
                x.PreparacionCantidadDefectos,
                x.NumeroContenedores,
                x.TotalSacos,
                x.EmpaqueTipo,
                x.FechaEnvioMuestra,
                x.EstadoMuestra,
                x.FechaRecepcionMuestra,
                x.FechaEstampado,
                // x.FechaEmbarque,
                x.FechaZarpeNave,
                x.Puerto,
                x.EstadoSeguimientoDescripcion,
                x.FechaEnvioDocumentos,
                x.FechaLlegadaDocumentos,
                x.EstadoPagoFactura,
                x.FechaPagoFactura
              
              ]));
              this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Aduanas');

            }
            } else if (res.Result.Message && res.Result.ErrCode) {
              this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }
  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { size: 'xl', centered: true });

  }




  Nuevo() {
    this.router.navigate(['exportador/operaciones/aduanas/edit']);
  }

}
