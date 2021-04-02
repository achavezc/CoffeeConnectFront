import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { DateUtil } from '../../../../services/util/date-util';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss']
})
export class ClienteComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil) { }

  clienteForm: FormGroup;
  listTipoCliente: any[];
  listPais: any[];
  listEstados: any[];
  selectedTipoCliente: any;
  selectedPais: any;
  selectedEstado: any;
  selected: any;
  limitRef: number = 10;
  rows: [];
  errorGeneral = { isError: false, msgError: '' };

  ngOnInit(): void {
    this.LoadForm();
    this.clienteForm.controls['fechaInicial'].setValue(this.dateUtil.currentDate());
    this.clienteForm.controls['fechaFinal'].setValue(this.dateUtil.currentMonthAgo());
  }

  LoadForm(): void {
    this.clienteForm = this.fb.group({
      codCliente: [],
      ruc: [],
      fechaInicial: [, Validators.required],
      fechaFinal: [, Validators.required],
      descCliente: [],
      tipoCliente: [],
      pais: [],
      estado: []
    });
  }

  get f() {
    return this.clienteForm.controls;
  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }
}
