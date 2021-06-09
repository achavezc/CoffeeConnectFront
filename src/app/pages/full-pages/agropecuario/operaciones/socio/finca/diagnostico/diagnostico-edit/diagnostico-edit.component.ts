import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";

import { MaestroService } from '../../../../../../../../services/maestro.service';
import { DiagnosticoService } from '../../../../../../../../services/diagnostico.service';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';

@Component({
  selector: 'app-diagnostico-edit',
  templateUrl: './diagnostico-edit.component.html',
  styleUrls: ['./diagnostico-edit.component.scss']
})
export class DiagnosticoEditComponent implements OnInit {

  frmFincaDiagnosticoEdit: FormGroup;
  arrInfrastructureTitles = [];
  arrInfrastructureValues = [];
  arrDataFields = [];
  arrProductionCost = [];
  codePartner: Number;
  codeProducer: Number;
  codeFincaPartner: Number;
  userSession: any;
  codeDiagnostic: Number;

  constructor(private fb: FormBuilder,
    private maestroService: MaestroService,
    private router: Router,
    private route: ActivatedRoute,
    private diagnosticoService: DiagnosticoService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil) {
    this.codeDiagnostic = this.route.snapshot.params['diagnostic'] ? parseInt(this.route.snapshot.params['diagnostic']) : 0;
    this.LoadInfrastructureTitles();
    this.LoadInfrastructureValues();
    this.LoadDataFields();
    this.LoadProductionCost();
    if (this.codeDiagnostic > 0) {
      this.SearchById();
    }
  }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.codePartner = this.route.snapshot.params['partner'] ? parseInt(this.route.snapshot.params['partner']) : 0;
    this.codeProducer = this.route.snapshot.params['producer'] ? parseInt(this.route.snapshot.params['producer']) : 0;
    this.codeFincaPartner = this.route.snapshot.params['fincapartner'] ? parseInt(this.route.snapshot.params['fincapartner']) : 0;
    this.LoadForm();
  }

  LoadForm(): void {
    this.frmFincaDiagnosticoEdit = this.fb.group({
      tokenNumber: [''],
      registrationDate: [''],
      organization: [''],
      surnamesFirstnames: [''],
      documentNumber: [''],
      cellPhoneNumber: [''],
      age: [''],
      language: [''],
      numberChildren: [],
      gender: [],
      degreeStudies: [''],
      birthPlace: [''],
      yearEntryZone: [],
      religion: [],
      civilStatus: [],
      surnameNamesSpouse: [''],
      degreeStudiesSpouse: [],
      placeBirthSpouse: [],
      documentNumberSpouse: [''],
      cellPhoneNumberSpouse: [],
      ageSpouse: [''],
      department: [''],
      latitude: [''],
      province: [''],
      longitude: [],
      district: [''],
      altitude: [],
      zone: [''],
      crop: [''],
      fund: [''],
      precipitation: [],
      powerSource: [],
      personalNumberHarvest: [],
      waterSource: [],
      numberSmallerAnimals: [],
      internet: [],
      housingMaterial: [],
      phoneSignal: [],
      ground: [],
      healthEstablishment: [],
      school: [],
      timeUnitHealthCenter: [],
      accessRoadsCollectionCenterProductiveUnit: [],
      distanceKilometers: [],
      totalTime: [],
      transportationWay: [],
      observationsDetails: [],
      totalFieldArea: [],
      coffeeProductionFieldArea: [],
      fieldGrowth: [],
      forestField: [],
      purmaField: [],
      breadCarryField: [],
      countryHouse: [],
      totalHectares: [0],
      totalVariety: [0],
      totalAge: [0],
      totalHarvestMonths: [0],
      totalHarvestPreviousYear: [0],
      totalHarvestCurrentYear: [0],
      observationsField: [],
      totalHectaresProduction: [0],
      totalCostProduction: [0],
      totalCostTotalProduction: [0],
      questions1: [],
      other: [],
      question2: [],
      store: [],
      transport: [],
      agricultureIncome: [],
      responsable: [],
      technical: []
    });
  }

  get f() {
    return this.frmFincaDiagnosticoEdit.controls;
  }

  LoadInfrastructureTitles(): void {
    this.maestroService.obtenerMaestros('DiagnosticoInfraestructuraTitulo')
      .subscribe((res: any) => {
        if (res.Result.Success) {
          for (let i = 0; i < res.Result.Data.length; i++) {
            this.arrInfrastructureTitles.push({
              ClaseEstadoInfraestructuraId: res.Result.Data[i].Codigo,
              DiagnosticoId: this.codeDiagnostic,
              DiagnosticoInfraestructuraId: 0,
              EstadoInfraestructuraId: '',
              Observaciones: '',
              Text: res.Result.Data[i].Label
            });
          }
        }
      });
  }

  LoadInfrastructureValues(): void {
    this.maestroService.obtenerMaestros('DiagnosticoInfraestructuraValor')
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.arrInfrastructureValues = res.Result.Data;
        }
      });
  }

  ChangeInfraStatus(e: any, i: any): void {
    this.arrInfrastructureTitles[i].EstadoInfraestructuraId = e.target.value;
  }

  MapInfraProductiveUnit(e: any, i: any): void {
    this.arrInfrastructureTitles[i].Observaciones = e.target.value;
  }

  LoadDataFields(): void {
    for (let i = 0; i < 6; i++) {
      this.arrDataFields.push({
        CosechaMeses: 0,
        CosechaPergaminoAnioActual: 0,
        CosechaPergaminoAnioAnterior: 0,
        DiagnosticoDatosCampoId: 0,
        DiagnosticoId: this.codeDiagnostic,
        Edad: 0,
        Hectarea: 0,
        NumeroLote: 0,
        Variedad: 0
      });
    }
  }

  MapDataFields(e, i, col): void {
    if (col == 'NL')
      this.arrDataFields[i].NumeroLote = parseFloat(e.target.value);
    else if (col == 'H')
      this.arrDataFields[i].Hectarea = parseFloat(e.target.value);
    else if (col == 'V')
      this.arrDataFields[i].Variedad = parseFloat(e.target.value);
    else if (col == 'E')
      this.arrDataFields[i].Edad = parseFloat(e.target.value);
    else if (col == 'CM')
      this.arrDataFields[i].CosechaMeses = parseFloat(e.target.value);
    else if (col == 'CPAANT')
      this.arrDataFields[i].CosechaPergaminoAnioAnterior = parseFloat(e.target.value);
    else if (col == 'CPAACT')
      this.arrDataFields[i].CosechaPergaminoAnioActual = parseFloat(e.target.value);
    this.SumDataFields();
  }

  SumDataFields(): void {
    let sumHectareas = 0;
    let sumVariedades = 0;
    let sumEdades = 0;
    let sumCosechMeses = 0;
    let sumAnioAnterior = 0;
    let sumAnioActual = 0;
    for (let i = 0; i < this.arrDataFields.length; i++) {
      sumHectareas += this.arrDataFields[i].Hectarea;
      sumVariedades += this.arrDataFields[i].Variedad;
      sumEdades += this.arrDataFields[i].Edad;
      sumCosechMeses += this.arrDataFields[i].CosechaMeses;
      sumAnioAnterior += this.arrDataFields[i].CosechaPergaminoAnioAnterior;
      sumAnioActual += this.arrDataFields[i].CosechaPergaminoAnioActual;
    }
    this.frmFincaDiagnosticoEdit.controls.totalHectares.setValue(sumHectareas);
    this.frmFincaDiagnosticoEdit.controls.totalVariety.setValue(sumVariedades);
    this.frmFincaDiagnosticoEdit.controls.totalAge.setValue(sumEdades);
    this.frmFincaDiagnosticoEdit.controls.totalHarvestMonths.setValue(sumCosechMeses);
    this.frmFincaDiagnosticoEdit.controls.totalHarvestPreviousYear.setValue(sumAnioAnterior);
    this.frmFincaDiagnosticoEdit.controls.totalHarvestCurrentYear.setValue(sumAnioActual);
  }

  LoadProductionCost(): void {
    this.maestroService.obtenerMaestros('DiagnosticoCostoProduccionTitulo')
      .subscribe((res: any) => {
        if (res.Result.Success) {
          for (let i = 0; i < res.Result.Data.length; i++) {
            this.arrProductionCost.push({
              ActividadId: res.Result.Data[i].Codigo,
              CostoHectarea: 0,
              CostoTotal: 0,
              DiagnosticoCostoProduccionId: 0,
              DiagnosticoId: this.codeDiagnostic,
              Hectarea: 0,
              Observaciones: '',
              Text: res.Result.Data[i].Label
            });
          }
        }
      });
  }

  MapDataCostProduction(e, i, col): void {
    if (col == 'h')
      this.arrProductionCost[i].Hectarea = parseFloat(e.target.value);
    else if (col == 'ch')
      this.arrProductionCost[i].CostoHectarea = parseFloat(e.target.value);
    else if (col == 'ct')
      this.arrProductionCost[i].CostoTotal = parseFloat(e.target.value);
    else if (col == 'o')
      this.arrProductionCost[i].Observaciones = e.target.value;
    this.SumDataCostProduction();
  }

  SumDataCostProduction(): void {
    let sumHectareas = 0;
    let sumCostHectareas = 0;
    let sumCostTotal = 0;
    for (let i = 0; i < this.arrProductionCost.length; i++) {
      sumHectareas += this.arrProductionCost[i].Hectarea;
      sumCostHectareas += this.arrProductionCost[i].CostoHectarea;
      sumCostTotal += this.arrProductionCost[i].CostoTotal;
    }
    this.frmFincaDiagnosticoEdit.controls.totalHectaresProduction.setValue(sumHectareas);
    this.frmFincaDiagnosticoEdit.controls.totalCostProduction.setValue(sumCostHectareas);
    this.frmFincaDiagnosticoEdit.controls.totalCostTotalProduction.setValue(sumCostTotal);
  }

  GetRequest(): any {
    const form = this.frmFincaDiagnosticoEdit.value;
    const request = {
      DiagnosticoId: this.codeDiagnostic,
      Numero: form.tokenNumber ? form.tokenNumber : '',
      SocioFincaId: this.codeFincaPartner,
      ObservacionInfraestructura: form.observationsDetails ? form.observationsDetails : '',
      ObservacionDatosCampo: form.observationsField ? form.observationsField : '',
      Responsable: form.responsable ? form.responsable : '',
      TecnicoCampo: form.technical ? form.technical : '',
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      AreaTotal: form.totalFieldArea ? form.totalFieldArea : 0,
      AreaCafeEnProduccion: form.coffeeProductionFieldArea ? form.coffeeProductionFieldArea : 0,
      Crecimiento: form.fieldGrowth ? form.fieldGrowth : 0,
      Bosque: form.forestField ? form.forestField : 0,
      Purma: form.purmaField ? form.purmaField : 0,
      PanLlevar: form.breadCarryField ? form.breadCarryField : 0,
      Vivienda: form.countryHouse ? form.countryHouse : 0,
      IngresoPromedioMensual: form.questions1 ? form.questions1 : 0,
      IngresoAgricultura: form.agricultureIncome ? form.agricultureIncome : 0,
      IngresoBodega: form.store ? form.store : 0,
      IngresoTransporte: form.transport ? form.transport : 0,
      IngresoOtro: form.other ? form.other : 0,
      PrestamoEntidades: form.question2 ? form.question2 : '',
      EstadoId: '01',
      Usuario: this.userSession.Result.Data.NombreUsuario,
      DiagnosticoCostoProduccionList: this.arrProductionCost,
      DiagnosticoDatosCampoList: this.arrDataFields,
      DiagnosticoInfraestructuraList: this.arrInfrastructureTitles,
    }
    return request;
  }

  Save(): void {
    if (!this.frmFincaDiagnosticoEdit.invalid) {
      const form = this;
      if (this.codeDiagnostic <= 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la creación del diagnostico?.`,
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
          if (result.value) {
            form.Create();
          }
        });
      } else {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la actualización del diagnostico?.`,
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
          if (result.value) {
            form.Update();
          }
        });
      }
    }
  }

  Create(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.diagnosticoService.Create(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMADO!', 'Se registro correctamente.', () => {
            this.Cancel();
          });
        } else {

        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  Update(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.diagnosticoService.Update(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMADO!', 'Se actualizo correctamente.', () => {
            this.Cancel();
          });
        } else {

        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  SearchById(): void {
    this.spinner.show();
    this.diagnosticoService.SearchById({ DiagnosticoId: this.codeDiagnostic })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.MapDataEdition(res.Result.Data);
        } else {

        }
      }, (err: any) => {
        this.spinner.hide();
      });
  }

  MapDataEdition(data: any): void {
    if (data) {
      this.frmFincaDiagnosticoEdit.controls.coffeeProductionFieldArea.setValue(data.AreaCafeEnProduccion);
      this.frmFincaDiagnosticoEdit.controls.totalFieldArea.setValue(data.AreaTotal);
      this.frmFincaDiagnosticoEdit.controls.forestField.setValue(data.Bosque);
      this.frmFincaDiagnosticoEdit.controls.fieldGrowth.setValue(data.Crecimiento);
      this.frmFincaDiagnosticoEdit.controls.registrationDate.setValue(data.FechaRegistro.substring(0, 10));
      this.frmFincaDiagnosticoEdit.controls.agricultureIncome.setValue(data.IngresoAgricultura);
      this.frmFincaDiagnosticoEdit.controls.store.setValue(data.IngresoBodega);
      this.frmFincaDiagnosticoEdit.controls.other.setValue(data.IngresoOtro);
      this.frmFincaDiagnosticoEdit.controls.questions1.setValue(data.IngresoPromedioMensual);
      this.frmFincaDiagnosticoEdit.controls.transport.setValue(data.IngresoTransporte);
      this.frmFincaDiagnosticoEdit.controls.tokenNumber.setValue(data.Numero);
      this.frmFincaDiagnosticoEdit.controls.observationsField.setValue(data.ObservacionDatosCampo);
      this.frmFincaDiagnosticoEdit.controls.observationsDetails.setValue(data.ObservacionInfraestructura);
      this.frmFincaDiagnosticoEdit.controls.breadCarryField.setValue(data.PanLlevar);
      this.frmFincaDiagnosticoEdit.controls.question2.setValue(data.PrestamoEntidades);
      this.frmFincaDiagnosticoEdit.controls.purmaField.setValue(data.Purma);
      this.frmFincaDiagnosticoEdit.controls.responsable.setValue(data.Responsable);
      this.frmFincaDiagnosticoEdit.controls.technical.setValue(data.TecnicoCampo);
      this.frmFincaDiagnosticoEdit.controls.countryHouse.setValue(data.Vivienda);

      if (data.DiagnosticoInfraestructura) {
        for (let i = 0; i < data.DiagnosticoInfraestructura.length; i++) {
          for (let j = 0; j < this.arrInfrastructureTitles.length; j++) {
            if (this.arrInfrastructureTitles[j].ClaseEstadoInfraestructuraId == data.DiagnosticoInfraestructura[i].ClaseEstadoInfraestructuraId) {
              this.arrInfrastructureTitles[j].DiagnosticoInfraestructuraId = data.DiagnosticoInfraestructura[i].DiagnosticoInfraestructuraId;
              this.arrInfrastructureTitles[j].EstadoInfraestructuraId = data.DiagnosticoInfraestructura[i].EstadoInfraestructuraId;
              this.arrInfrastructureTitles[j].Observaciones = data.DiagnosticoInfraestructura[i].Observaciones;
              break;
            }
          }
        }
      }

      if (data.DiagnosticoDatosCampo) {
        for (let i = 0; i < data.DiagnosticoDatosCampo.length; i++) {
          this.arrDataFields[i].CosechaMeses = data.DiagnosticoDatosCampo[i].CosechaMeses;
          this.arrDataFields[i].CosechaPergaminoAnioActual = data.DiagnosticoDatosCampo[i].CosechaPergaminoAnioActual;
          this.arrDataFields[i].CosechaPergaminoAnioAnterior = data.DiagnosticoDatosCampo[i].CosechaPergaminoAnioAnterior;
          this.arrDataFields[i].DiagnosticoDatosCampoId = data.DiagnosticoDatosCampo[i].DiagnosticoDatosCampoId;
          this.arrDataFields[i].Edad = data.DiagnosticoDatosCampo[i].Edad;
          this.arrDataFields[i].Hectarea = data.DiagnosticoDatosCampo[i].Hectarea;
          this.arrDataFields[i].NumeroLote = data.DiagnosticoDatosCampo[i].NumeroLote;
          this.arrDataFields[i].Variedad = data.DiagnosticoDatosCampo[i].Variedad;
        }
        this.SumDataFields();
      }

      if (data.DiagnosticoCostoProduccion) {
        for (let i = 0; i < data.DiagnosticoCostoProduccion.length; i++) {
          for (let j = 0; j < this.arrProductionCost.length; j++) {
            if (this.arrProductionCost[j].ActividadId == data.DiagnosticoCostoProduccion[i].ActividadId) {
              this.arrProductionCost[j].CostoHectarea = data.DiagnosticoCostoProduccion[i].CostoHectarea;
              this.arrProductionCost[j].CostoTotal = data.DiagnosticoCostoProduccion[i].CostoTotal;
              this.arrProductionCost[j].DiagnosticoCostoProduccionId = data.DiagnosticoCostoProduccion[i].DiagnosticoCostoProduccionId;
              this.arrProductionCost[j].Hectarea = data.DiagnosticoCostoProduccion[i].Hectarea;
              this.arrProductionCost[j].Observaciones = data.DiagnosticoCostoProduccion[i].Observaciones;
              break;
            }
          }
        }
        this.SumDataCostProduction();
      }
    }
    this.spinner.hide();
  }

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/diagnostico/list/${this.codePartner}/${this.codeProducer}/${this.codeFincaPartner}`]);
  }

}
