import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute, Router } from '@angular/router';

import { DateUtil } from '../../../../../../../services/util/date-util';
import { InspeccionInternaService } from '../../../../../../../services/inspeccion-interna.service';

@Component({
  selector: 'app-inspeccion',
  templateUrl: './inspeccion.component.html',
  styleUrls: ['./inspeccion.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InspeccionComponent implements OnInit {

  socioFincaInspeccionForm: FormGroup;
  listEstados: any[];
  selectedEstado: any;
  errorGeneral = { isError: false, errorMessage: '' };
  selected = [];
  rows = [];
  limitRef = 10;
  msgErrGenerico = "Ha ocurrido un error interno.";
  userSession: any;

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private inspeccionInternaService: InspeccionInternaService,
    private spinner: NgxSpinnerService,
    private router: Router) { }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.socioFincaInspeccionForm.controls.fechaInicio.setValue(this.dateUtil.currentMonthAgo());
    this.socioFincaInspeccionForm.controls.fechaFinal.setValue(this.dateUtil.currentDate());
  }

  LoadForm() {
    this.socioFincaInspeccionForm = this.fb.group({
      nroFicha: ['', Validators.required],
      fechaInicio: [, Validators.required],
      fechaFinal: [, Validators.required],
      estado: []
    });
  }

  get f() {
    return this.socioFincaInspeccionForm.controls;
  }

  GetRequestSearch(): any {
    const request = {
      Numero: this.socioFincaInspeccionForm.value.nroFicha,
      EstadoId: this.socioFincaInspeccionForm.value.estado,
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      FechaInicio: this.socioFincaInspeccionForm.value.fechaInicio,
      FechaFin: this.socioFincaInspeccionForm.value.fechaFinal
    }
    return request;
  }

  Buscar() {
    if (!this.socioFincaInspeccionForm.invalid) {
      this.spinner.show();
      this.errorGeneral = { isError: false, errorMessage: '' };
      const request = this.GetRequestSearch();
      this.inspeccionInternaService.Search(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            res.Result.Data.forEach((obj: any) => {
              obj.FechaRegistroString = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
            });
            this.rows = res.Result.Data;
          } else {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          }
        }, (err: any) => {
          console.log(err);
          this.errorGeneral = { isError: true, errorMessage: this.msgErrGenerico };
          this.spinner.hide();
        });
    }
  }

  onSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  updateLimit(event: any) {

  }

  filterUpdate(event: any) {

  }

  New() {
    this.router.navigate([`/socio/finca/inspeccion/create`]);
  }

  Cancel() {

  }
}
