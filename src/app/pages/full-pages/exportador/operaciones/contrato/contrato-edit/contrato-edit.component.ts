import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-contrato-edit',
  templateUrl: './contrato-edit.component.html',
  styleUrls: ['./contrato-edit.component.scss']
})
export class ContratoEditComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  contratoEditForm: FormGroup;
  listCondicionEmbarque = [];
  listPaises = [];
  listCiudades = [];
  listProductos = [];
  listMonedas = [];
  listTipoProduccion = [];
  listUniMedida = [];
  listCertificadora = [];
  listSacosBulk = [];
  listCalidad = [];
  listCertificacion = [];
  listGrado = [];
  selectedCondEmbarque: any;
  selectedPais: any;
  selectedCiudad: any;
  selectedProducto: any;
  selectedMoneda: any;
  selectedTipoProduccion: any;
  selectedUniMedida: any;
  selectedCertificadora: any;
  selectedSacoBulk: any;
  selectedCalidad: any;
  selectedCertificacion: any;
  selectedGrado: any;

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.contratoEditForm = this.fb.group({
      razonSocial: [],
      direccionCabe: [],
      fecha: [],
      nroRucCabe: [],
      nroContrato: [],
      fechaContrato: [],
      codCliente: [],
      cliente: [],
      floId: [],
      condicionEmbarque: [],
      fechaEmbarque: [],
      fechaFactExp: [],
      pais: [],
      ciudad: [],
      producto: [],
      moneda: [],
      precio: [],
      tipoProduccion: [],
      unidadMedida: [],
      certificadora: [],
      sacosBulk: [],
      calidad: [],
      certificacion: [],
      cantidad: [],
      grado: [],
      pesoSacoKG: [],
      cantidadDefectos: [],
      cargaContrato: [],
      responsableComercial: []
    });
  }

  get f() {
    return this.contratoEditForm.controls;
  }

}
