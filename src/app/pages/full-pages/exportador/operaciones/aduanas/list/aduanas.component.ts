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
    private router: Router) {
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

  ngOnInit(): void {
    this.LoadForm();
   
    this.aduanasForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.aduanasForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
  }

 async LoadForm() {
    this.aduanasForm = this.fb.group({
      numeroContrato: [''],
      codigo: [''],
      ruc: [''],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      estado: [ '' , [Validators.required]], //{ value: '', disabled: true }
      agenciaAduanera: ['',[Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      clienteFinal: ['',[Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]]
    });
    this.aduanasForm.setValidators(this.comparisonValidator());
  await  this.LoadCombos();
  }

  async LoadCombos() {
    let form = this;
    this.maestroUtil.obtenerMaestros("EstadoAduana", function (res) {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
        form.aduanasForm.controls.estado.setValue('01');
        form.aduanasForm.controls.estado.disable();
       
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
      } else if (!group.value.estado) {
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
        RucEmpresaExportadora: this.aduanasForm.value.ruc,
        RazonSocial: this.aduanasForm.value.razonSocial,
        FechaInicio: new Date(this.aduanasForm.value.fechaInicio),
        FechaFin: new Date(this.aduanasForm.value.fechaFin),
        RazonSocialEmpresaExportadora:  this.aduanasForm.value.agenciaAduanera,
        RazonSocialCliente: this.aduanasForm.value.clienteFinal,
        
        EstadoId: this.aduanasForm.value.estado ?? '',
       
        EmpresaId: 1
      };

      this.spinner.show();

      this.aduanaService.Consultar(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              res.Result.Data.forEach((obj: any) => {
                obj.FechaEmbarque = this.dateUtil.formatDate(new Date(obj.FechaEmbarque));
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

 

  Nuevo() {
    this.router.navigate(['exportador/operaciones/aduanas/edit']);
  }

}
