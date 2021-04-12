import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { DateUtil } from '../../../../../../services/util/date-util';

@Component({
  selector: 'app-contrato-edit',
  templateUrl: './contrato-edit.component.html',
  styleUrls: ['./contrato-edit.component.scss']
})
export class ContratoEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private maestroService: MaestroService,
    private spinner: NgxSpinnerService,
    private dateUtil: DateUtil) { }

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
  vId: number;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.contratoEditForm.controls.fechaContrato.setValue(this.dateUtil.currentDate());
    this.contratoEditForm.controls.fechaEmbarque.setValue(this.dateUtil.currentDate());
    this.contratoEditForm.controls.fechaFactExp.setValue(this.dateUtil.currentDate());
  }

  LoadForm(): void {
    this.contratoEditForm = this.fb.group({
      razonSocial: [, Validators.required],
      direccionCabe: [, Validators.required],
      fecha: [, Validators.required],
      nroRucCabe: [, Validators.required],
      nroContrato: [, Validators.required],
      fechaContrato: [, Validators.required],
      codCliente: [, Validators.required],
      cliente: [, Validators.required],
      floId: [, Validators.required],
      condicionEmbarque: [, Validators.required],
      fechaEmbarque: [, Validators.required],
      fechaFactExp: [, Validators.required],
      pais: [, Validators.required],
      ciudad: [, Validators.required],
      producto: [, Validators.required],
      moneda: [, Validators.required],
      precio: [, Validators.required],
      tipoProduccion: [, Validators.required],
      unidadMedida: [, Validators.required],
      certificadora: [, Validators.required],
      sacosBulk: [, Validators.required],
      calidad: [, Validators.required],
      certificacion: [, Validators.required],
      cantidad: [, Validators.required],
      grado: [, Validators.required],
      pesoSacoKG: [, Validators.required],
      cantidadDefectos: [, Validators.required],
      cargaContrato: [, Validators.required],
      responsableComercial: [, Validators.required]
    });
  }

  get f() {
    return this.contratoEditForm.controls;
  }

  LoadCombos(): void {
    this.GetCondicionEmbarque();
    this.GetPais();
    this.GetCiudad();
    this.GetProductos();
    this.GetMonedas();
    this.GetTipoProduccion();
    this.GetUnidadMedida();
    this.GetCertificadora();
    this.GetSacosBulk();
    this.GetCalidad();
    this.GetCertificacion();
    this.GetGradoPreparacion();
  }

  async GetCondicionEmbarque() {
    this.spinner.show();
    this.listCondicionEmbarque = [];
    const res = await this.maestroService.obtenerMaestros('CondicionEmbarque').toPromise();
    if (res.Result.Success) {
      this.listCondicionEmbarque = res.Result.Data;
      this.spinner.hide();
    }
  }

  async GetPais() {
    this.listPaises = [];
    const res = await this.maestroService.ConsultarPaisAsync().toPromise()
    if (res.Result.Success) {
      this.listPaises = res.Result.Data;
    }
  }

  async GetCiudad() {
    this.listCiudades = [];
    const res = await this.maestroUtil.GetDepartmentsAsync(this.selectedPais);
    if (res.Result.Success) {
      this.listCiudades = res.Result.Data;
    }
  }

  async GetProductos() {
    this.listProductos = [];
    const res = await this.maestroService.obtenerMaestros('Producto').toPromise();
    if (res.Result.Success) {
      this.listProductos = res.Result.Data;
    }
  }

  async GetMonedas() {
    this.listMonedas = [];
    const res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMonedas = res.Result.Data;
    }
  }

  async GetTipoProduccion() {
    this.listTipoProduccion = [];
    const res = await this.maestroService.obtenerMaestros('TipoProduccion').toPromise();
    if (res.Result.Success) {
      this.listTipoProduccion = res.Result.Data;
    }
  }

  async GetUnidadMedida() {
    this.listUniMedida = [];
    const res = await this.maestroService.obtenerMaestros('UnidadMedicion').toPromise();
    if (res.Result.Success) {
      this.listUniMedida = res.Result.Data;
    }
  }

  async GetCertificadora() {
    this.listCertificadora = [];
    const res = await this.maestroService.obtenerMaestros('EntidadCertificadora').toPromise();
    if (res.Result.Success) {
      this.listCertificadora = res.Result.Data;
    }
  }

  async GetSacosBulk() {
    this.listSacosBulk = [];
    const res = await this.maestroService.obtenerMaestros('UnidadMedida').toPromise();
    if (res.Result.Success) {
      this.listSacosBulk = res.Result.Data;
    }
  }

  async GetCalidad() {
    this.listCalidad = [];
    const res = await this.maestroService.obtenerMaestros('Calidad').toPromise();
    if (res.Result.Success) {
      this.listCalidad = res.Result.Data;
    }
  }

  async GetCertificacion() {
    this.listCertificacion = [];
    const res = await this.maestroService.obtenerMaestros('TipoCertificacion').toPromise();
    if (res.Result.Success) {
      this.listCertificacion = res.Result.Data;
    }
  }

  async GetGradoPreparacion() {
    this.listGrado = [];
    const res = await this.maestroService.obtenerMaestros('GradoEstudios').toPromise();
    if (res.Result.Success) {
      this.listGrado = res.Result.Data;
    }
  }

}
