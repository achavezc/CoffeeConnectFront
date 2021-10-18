import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors , FormControl} from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from "@angular/router"
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../services/util/alert-util';
import{KardexProcesoService} from '../../../../../services/kardex-proceso.service'
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-kardex-proceso',
  templateUrl: './kardex-proceso.component.html',
  styleUrls: ['./kardex-proceso.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class KardexProcesoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private kardexProcesoService: KardexProcesoService,
    private alertUtil: AlertUtil,
    private modalService: NgbModal,
    private router: Router,
    private excelService: ExcelService) { }

  kardexProcesoForm: any;
  listPlantaProceso: [];
  listTipoDocumentoInterno: [];
  listEstados: [];
  listTipoOperacion = [];
  listCalidad = [];
  listCertificado = [];

  selectedPlantaProceso: any;
  selectedTipoDocumentoInterno: any;
  selectedEstado: any;
  selectedTipoOperacion: any;
  selectedCalidad: any;
  selectedCertificado: any;
  selectContrato: any[] = [];

  error: any = { isError: false, errorMessage: '' };
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico: string = "Ocurrio un error interno.";
  errorFecha: any = { isError: false, errorMessage: '' };
  rows: any[] = [];
  tempData = [];
  submitted: boolean = false;
  limitRef = 10;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  selected = [];
  vSessionUser: any;
  popUp = true;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.kardexProcesoForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.kardexProcesoForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
  }

  get f() {
    return this.kardexProcesoForm.controls;
  }


  LoadForm(): void {
    this.kardexProcesoForm = this.fb.group({
      nroContrato: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
      cliente: new FormControl('', []),
      plantaProceso: new FormControl('', []),
      fechaInicio:  new FormControl('', [Validators.required]), 
      fechaFin:  new FormControl('', [Validators.required]), 
      tipoDocumentoInterno:  new FormControl('', []), 
      estado: new FormControl('', [Validators.required]), 
      tipoOperacion: new FormControl('', []),
      calidad: new FormControl('', []),
      certificado: new FormControl('', [])
      
    });
    this.kardexProcesoForm.setValidators(this.comparisonValidator());
  }

  comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!group.value.fechaInicio || !group.value.fechaFin) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else if (!group.value.estado) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un estado.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  LoadCombos() {
    let form = this;
   
   this.maestroUtil.obtenerMaestros("PlantaProcesoAlmacenKardexProceso", function (res) {
      if (res.Result.Success) {
        form.listPlantaProceso = res.Result.Data;
      }
    });
 this.maestroUtil.obtenerMaestros("TipoDocumentoInternoKardexProceso", function (res) {
      if (res.Result.Success) {
        form.listTipoDocumentoInterno = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoOperacionKardexProceso", function (res) {
      if (res.Result.Success) {
        form.listTipoOperacion = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("EstadoKardexProceso", function (res) {
      if (res.Result.Success) {
        form.listTipoOperacion = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Calidad", function (res) {
      if (res.Result.Success) {
        form.listCalidad = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoCertificacion", function (res) {
      if (res.Result.Success) {
        form.listCertificado = res.Result.Data;
      }
    });
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.kardexProcesoForm.value.fechaInicio);
    let vEndDate = new Date(this.kardexProcesoForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio.' };
      this.kardexProcesoForm.value.fechaInicio.setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'Por favor el Rango de fechas no puede ser mayor a 2 años.' };
      this.kardexProcesoForm.value.fechaFin.setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  updateLimit(limit: any) {
    this.limitRef = limit.target.value;
  }

  filterUpdate(event: any) {
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

  Buscar(): void {
    if (this.kardexProcesoForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.selected = [];
      this.submitted = false;
      const request = {
        NumeroContrato: this.kardexProcesoForm.value.nroContrato,
        NumeroCliente: this.kardexProcesoForm.value.cliente,
        PlantaProcesoAlmacenId: this.kardexProcesoForm.value.plantaProceso,
        TipoDocumentoInternoId: this.kardexProcesoForm.value.tipoDocumentoInterno,
        TipoOperacionId : this.kardexProcesoForm.value.tipoOperacion,
        CalidadId: this.kardexProcesoForm.value.calidad,
        TipoCertificacionId: this.kardexProcesoForm.value.certificado,
        EstadoId: this.kardexProcesoForm.value.estado,
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
        FechaInicio: this.kardexProcesoForm.value.fechaInicio,
        FechaFin: this.kardexProcesoForm.value.fechaFin,
      }

      this.spinner.show();

      this.kardexProcesoService.Consultar(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
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
  close() {
    this.modalService.dismissAll();
  }

  nuevo() {
    this.router.navigate(['/operaciones/kardexProcesoEdit']);
  }
  receiveMessageContrato($event) {
    this.selectContrato = $event;
    this.kardexProcesoForm.get('cliente').setValue(this.selectContrato[0].Cliente);
    this.kardexProcesoForm.get('nroContrato').setValue(this.selectContrato[0].Numero);

    
    this.modalService.dismissAll();
  }
  Export(): void {
    this.spinner.show();
    const request = {
      Numero: this.kardexProcesoForm.value.nroNotaSalida,
      EmpresaIdDestino: this.kardexProcesoForm.value.destinatario ?? null,
      EmpresaTransporteId: this.kardexProcesoForm.value.transportista ?? null,
      AlmacenId: this.kardexProcesoForm.value.almacen ?? '',
      MotivoTrasladoId: this.kardexProcesoForm.value.motivo ?? '',
      FechaInicio: this.kardexProcesoForm.value.fechaInicio,
      FechaFin: this.kardexProcesoForm.value.fechaFin,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId
    }

    this.kardexProcesoService.Consultar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (!res.Result.ErrCode) {
            const vArrHeaderExcel: HeaderExcel[] = [
              new HeaderExcel("Nota Salida", "center"),
              new HeaderExcel("Almacén"),
              new HeaderExcel("Destinatario"),
              new HeaderExcel("Motivo"),
              new HeaderExcel("Transportista"),
              new HeaderExcel("Cant. Lotes", "right"),
              new HeaderExcel("Total Peso Bruto KGS", "right"),
              new HeaderExcel("Estado")
            ];
            let vArrData: any[] = [];
            for (let i = 0; i < res.Result.Data.length; i++) {
              vArrData.push([
                res.Result.Data[i].Numero,
                res.Result.Data[i].Almacen,
                res.Result.Data[i].Destinatario,
                res.Result.Data[i].Motivo,
                res.Result.Data[i].Transportista,
                res.Result.Data[i].CantidadLotes,
                res.Result.Data[i].PesoKilosBrutos,
                res.Result.Data[i].Estado
              ]);
            }
            this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'DatosNotaSalida');
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
