import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orden-proceso',
  templateUrl: './orden-proceso.component.html',
  styleUrls: ['./orden-proceso.component.scss']
})
export class OrdenProcesoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router) { }

  ordenProcesoForm: FormGroup;
  listTiposProcesos = [];
  listEstados = [];
  selectedTipoProceso: any;
  selectedEstado: any;
  limitRef = 10;
  rows = [];
  selected = [];
  errorGeneral = { isError: false, msgError: '' };

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.ordenProcesoForm = this.fb.group({
      nroOrden: [],
      ruc: [],
      nroContrato: [],
      empProcesadora: [],
      fechaInicial: [],
      fechaFinal: [],
      codCliente: [],
      cliente: [],
      tipoProceso: [],
      estado: []
    });
  }

  get f() {
    return this.ordenProcesoForm.controls;
  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }

  Buscar(): void {

  }

  Nuevo(): void {
    this.router.navigate(['/exportador/operaciones/ordenproceso/create']);
  }

}
