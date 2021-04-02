import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { DateUtil } from '../../../../services/util/date-util';

@Component({
  selector: 'app-contrato',
  templateUrl: './contrato.component.html',
  styleUrls: ['./contrato.component.scss']
})
export class ContratoComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil) { }

  contratoForm: FormGroup;
  listProductos: any[];
  listTipoProduccion: any[];
  listCalidad: any[];
  listEstados: any[];
  selectedProducto: any;
  selectedTipoProduccion: any;
  selectedCalidad: any;
  selectedEstado: any;
  selected: any;
  limitRef: number = 10;
  rows: [];
  errorGeneral = { isError: false, msgError: '' };

  ngOnInit(): void {
    this.LoadForm();
    this.contratoForm.controls['fechaInicial'].setValue(this.dateUtil.currentDate());
    this.contratoForm.controls['fechaFinal'].setValue(this.dateUtil.currentMonthAgo());
  }

  LoadForm(): void {
    this.contratoForm = this.fb.group({
      nroContrato: [],
      codCliente: [],
      fechaInicial: [, Validators.required],
      fechaFinal: [, Validators.required],
      descCliente: [],
      producto: [],
      tipoProduccion: [],
      calidad: [],
      estado: []
    });
  }

  get f() {
    return this.contratoForm.controls;
  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }
}
