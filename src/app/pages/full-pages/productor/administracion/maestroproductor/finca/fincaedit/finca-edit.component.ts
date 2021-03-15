import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { MaestroService } from '../../../../../../../services/maestro.service';

@Component({
  selector: 'app-finca-edit',
  templateUrl: './finca-edit.component.html',
  styleUrls: ['./finca-edit.component.scss']
})
export class FincaEditComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private maestroService: MaestroService) { }

  fincaEditForm: any;
  listDepartamentos: any[];
  listProvincias: any[];
  listFuentesEnergia: any[];
  listDistritos: any[];
  listFuentesAgua: any[];
  listZonas: any[];
  listInternet: any[];
  listSenialTelefonica: any[];
  listEstableSalud: any[];
  listFlagsCentroEducativo: any[];
  listCentrosEducativos: any[];
  listEstados: any[];
  selectedDepartamento: any;
  selectedProvincia: any;
  selectedFuenteEnergia: any;
  selectedDistrito: any;
  selectedFuenteAgua: any;
  selectedZona: any;
  selectedInternet: any;
  selectedSenialTelefonica: any;
  selectedEstableSalud: any;
  selectedFlagCentroEdu: any;
  selectedCentroEdu: any;
  selectedEstado: any;
  vId: number;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseInt(this.route.snapshot.params['id']) : 0
    this.LoadForm();
    this.LoadCombos();
    if (this.vId > 0) {

    } else {
      this.fincaEditForm.controls.estado.setValue('01');
    }
  }

  LoadForm(): void {
    this.fincaEditForm = this.fb.group({
      nombreFinca: ['', [Validators.required]],
      latitud: [],
      direccion: ['', [Validators.required]],
      longitud: [],
      departamento: ['', [Validators.required]],
      altitud: [],
      provincia: ['', [Validators.required]],
      fuenteEnergia: [],
      distrito: ['', [Validators.required]],
      fuenteAgua: [],
      zona: ['', [Validators.required]],
      nroAnimalesMenores: [],
      materialVivienda: [],
      fInternet: [],
      suelo: [],
      senialTelefonica: [],
      establecimientoSalud: [],
      tiempoUnidadCentroSalud: [],
      fCentroEducativo: [],
      centroEducativo: [],
      estado: ['', [Validators.required]]
    });
  }

  get f() {
    return this.fincaEditForm.controls;
  }

  async GetDepartments() {
    this.listDepartamentos = [];
    const res: any = await this.maestroUtil.GetDepartmentsAsync('PE');
    if (res.Result.Success) {
      this.listDepartamentos = res.Result.Data;
    }
  }

  async GetProvincias() {
    this.listProvincias = [];
    const res: any = await this.maestroUtil.GetProvincesAsync(this.selectedDepartamento, 'PE');
    if (res.Result.Success) {
      this.listProvincias = res.Result.Data;
    }
  }

  async GetDistritos() {
    this.listDistritos = [];
    const res: any = await this.maestroUtil.GetDistrictsAsync(this.selectedDepartamento, this.selectedProvincia, 'PE');
    if (res.Result.Success) {
      this.listDistritos = res.Result.Data;
    }
  }

  async LoadCombos() {
    let res: any = {};
    this.GetDepartments();
    res = await this.maestroService.obtenerMaestros('CentroEducativoNivel').toPromise();
    if (res.Result.Success) {
      this.listCentrosEducativos = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
    }
  }

  onChangeDepartament(event: any): void {
    const form = this;
    this.listProvincias = [];
    this.fincaEditForm.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
      }
    });
  }

  onChangeProvince(event: any): void {
    const form = this;
    this.listDistritos = [];
    this.fincaEditForm.controls.distrito.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        if (res.Result.Success) {
          form.listDistritos = res.Result.Data;
        }
      });
  }

  onChangeDistrito(event: any): void {
    this.listZonas = [];
    this.fincaEditForm.controls.zona.reset();
    this.maestroUtil.GetZonas(event.Codigo, (res: any) => {
      if (res.Result.Success) {
        this.listZonas = res.Result.Data;
      }
    });
  }

  Save(): void {

  }

  Cancel(): void {

  }

}
