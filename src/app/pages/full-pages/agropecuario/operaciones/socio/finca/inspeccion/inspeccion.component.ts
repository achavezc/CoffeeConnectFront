import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DateUtil } from '../../../../../../../services/util/date-util';

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
  selected: any[];
  rows: any[];
  limitRef = 10;

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil) { }

  ngOnInit(): void {
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

  Buscar() {

  }

  onSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  updateLimit(event: any) {

  }

  filterUpdate(event: any) {

  }

  Nuevo() {

  }

  Cancel() {

  }
}
