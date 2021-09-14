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
    private modalService: NgbModal) {
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

  ngOnInit(): void {
    this.LoadForm();
    this.aduanasForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.aduanasForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
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

  Buscar(): void {
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
              res.Result.Data.forEach((obj: any) => {
                obj.MesEmbarque = formatDate(obj.FechaEmbarque, 'MM/yyyy', 'en');
                obj.FechaEmbarque = this.dateUtil.formatDate(new Date(obj.FechaEmbarque));
                obj.EmpaqueTipo = obj.Empaque + '-' + obj.TipoEmpaque;
                obj.FechaEnvioMuestra = formatDate(obj.FechaEnvioMuestra, 'yyyy-MM-dd', 'en');
                obj.FechaRecepcionMuestra = formatDate(obj.FechaRecepcionMuestra, 'yyyy-MM-dd', 'en');
                obj.FechaRecepcionMuestra = formatDate(obj.FechaEstampado, 'yyyy-MM-dd', 'en');
                obj.FechaEmbarque = formatDate(obj.FechaEmbarque, 'yyyy-MM-dd', 'en');
                obj.FechaZarpeNave = formatDate(obj.FechaZarpeNave, 'yyyy-MM-dd', 'en');
                obj.FechaEnvioDocumentos = formatDate(obj.FechaEnvioDocumentos, 'yyyy-MM-dd', 'en');
                obj.FechaLlegadaDocumentos = formatDate(obj.FechaLlegadaDocumentos, 'yyyy-MM-dd', 'en');
                obj.FechaPagoFactura = formatDate(obj.FechaPagoFactura, 'yyyy-MM-dd', 'en');
                obj.FechaEstampado = formatDate(obj.FechaEstampado, 'yyyy-MM-dd', 'en');
              });
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




  Nuevo() {
    this.router.navigate(['exportador/operaciones/aduanas/edit']);
  }

}
