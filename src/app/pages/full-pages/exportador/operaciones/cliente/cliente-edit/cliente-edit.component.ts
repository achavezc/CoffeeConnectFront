import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cliente-edit',
  templateUrl: './cliente-edit.component.html',
  styleUrls: ['./cliente-edit.component.scss']
})
export class ClienteEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router) { }

  clienteEditForm: FormGroup;
  listPaises: any[];
  listDepartamentos: any[];
  listProvincias: any[];
  listDistritos: any[];
  listCiudades: any[];
  selectedPais: any;
  selectedDepartamento: any;
  selectedProvincia: any;
  selectedDistrito: any;
  selectedCiudad: any;

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.clienteEditForm = this.fb.group({
      razonSocial: [],
      direccionCabe: [],
      fecha: [],
      nroRucCabe: [],
      tipoCliente: [],
      codCliente: [],
      cliente: [],
      nroRuc: [],
      telefono: [],
      email: [],
      direccion: [],
      pais: [],
      departamento: [],
      provincia: [],
      distrito: [],
      ciudad: [],
      descGerente: [],
      idGerente: [],
      descPresidente: [],
      idPresidente: []
    });
  }

  get f() {
    return this.clienteEditForm.controls;
  }

  Cancel(): void {
    this.router.navigate(['/exportador/operaciones/cliente/list']);
  }
}
