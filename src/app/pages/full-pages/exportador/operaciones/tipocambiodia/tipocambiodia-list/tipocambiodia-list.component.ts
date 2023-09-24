import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { TipoCambioDiaService } from '../../../../../../services/tipocambiodia.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import swal from 'sweetalert2';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-tipocambiodia',
  templateUrl: './tipocambiodia-list.component.html',
  styleUrls: ['./tipocambiodia-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TipoCambioDiaComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private preciodia: TipoCambioDiaService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private alertUtil: AlertUtil,
    private authService : AuthService) { }

  preciosdiaform: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent; 
  listEstado: [] = [];  
  selectedEstado: any;  
  selected = [];
  limitRef: number = 10;
  vSessionUser: any;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  submitted = false;
  readonly: boolean;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.preciosdiaform.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.preciosdiaform.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    ////this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.preciosdiaform = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],      
      estado: ['', Validators.required]
    });
  }

  get f() {
    return this.preciosdiaform.controls;
  }

  LoadCombos(): void {
   
    this.GetListEstado();

  }

  
  

  async GetListEstado() {
    let res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstado = res.Result.Data;
    }
  }

  compareTwoDates() {
    var anioFechaInicio = new Date(this.preciosdiaform.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.preciosdiaform.controls['fechaFin'].value).getFullYear()

    if (new Date(this.preciosdiaform.controls['fechaFin'].value) < new Date(this.preciosdiaform.controls['fechaInicio'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.preciosdiaform.controls['fechaFin'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.preciosdiaform.controls['fechaFin'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  compareFechas() {
    var anioFechaInicio = new Date(this.preciosdiaform.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.preciosdiaform.controls['fechaFin'].value).getFullYear()
    if (new Date(this.preciosdiaform.controls['fechaInicio'].value) > new Date(this.preciosdiaform.controls['fechaFin'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
      this.preciosdiaform.controls['fechaInicio'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.preciosdiaform.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }
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

  getRequest(): any {
    return {     
      EstadoId: this.preciosdiaform.value.estado ?? '',
      FechaInicio: this.preciosdiaform.value.fechaInicio ?? '',
      FechaFin: this.preciosdiaform.value.fechaFin ?? '',
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId
    };
  }

  Search(): void {
    if (!this.preciosdiaform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.preciodia.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach(x => {
            x.FechaRegistro = this.dateUtil.formatDate(new Date(x.FechaRegistro));
            x.Fecha = this.dateUtil.formatDate(new Date(x.Fecha));
          });
          this.tempData = res.Result.Data;
          this.rows = [...this.tempData];
          this.errorGeneral = { isError: false, msgError: '' };
        } else {
          this.errorGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      });
    } else {

    }
  }

  Buscar(): void {
    this.Search();
  }

  Nuevo(): void {
    this.router.navigate(['/exportador/operaciones/tipocambiodia/create']);
  }


  Anular() {
    const form = this;
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de continuar con la anulación?.`,
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
    }).then((result) => {
      form.CancelRow();
    });
  }

  CancelRow() {
    if (this.selected) {
      this.spinner.show();
      const request = {
        PrecioDiaRendimientoId: this.selected[0].PrecioDiaRendimientoId,
        Usuario: this.vSessionUser.Result.Data.NombreUsuario
      };

      this.preciodia.Cancel(request)
        .subscribe((res) => {
          this.spinner.hide();
          if (res.Result.Success) {
            this.alertUtil.alertOkCallback('CONFIRMACIÓN', 'Anulado correctamente.',
              () => {
                this.Buscar();
              });
          } else {
            this.alertUtil.alertError('ERROR', res.Result.Message);
          }
        }, (err) => {
          console.log(err);
          this.spinner.hide();
        });
    }
  }

}
