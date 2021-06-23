import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";

import { MaestroService } from '../../../../../../../../services/maestro.service';
import { DiagnosticoService } from '../../../../../../../../services/diagnostico.service';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';
import { SocioFincaService } from '../../../../../../../../services/socio-finca.service';
import { host } from '../../../../../../../../shared/hosts/main.host';

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
  fileName = '';

  constructor(private fb: FormBuilder,
    private maestroService: MaestroService,
    private router: Router,
    private route: ActivatedRoute,
    private diagnosticoService: DiagnosticoService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private socioFincaService: SocioFincaService) {
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
    this.SearchPartnerProducerByFincaPartnerId();
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
      coffeeProductionFieldArea: [''],
      fieldGrowth: [''],
      forestField: [''],
      purmaField: [''],
      breadCarryField: [''],
      countryHouse: [''],
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
      questions1: [''],
      other: [''],
      question2: [],
      store: [''],
      transport: [''],
      agricultureIncome: [''],
      responsable: [],
      technical: [],
      file: [],
      fileName: [],
      pathFile: []
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
        NumeroLote: i + 1,
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
      this.arrDataFields[i].Variedad = e.target.value;
    else if (col == 'E')
      this.arrDataFields[i].Edad = e.target.value;
    else if (col == 'CM')
      this.arrDataFields[i].CosechaMeses = e.target.value;
    else if (col == 'CPAANT')
      this.arrDataFields[i].CosechaPergaminoAnioAnterior = e.target.value;
    else if (col == 'CPAACT')
      this.arrDataFields[i].CosechaPergaminoAnioActual = e.target.value;
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
      AreaCafeEnProduccion: form.coffeeProductionFieldArea ? form.coffeeProductionFieldArea : '',
      Crecimiento: form.fieldGrowth ? form.fieldGrowth : '',
      Bosque: form.forestField ? form.forestField : '',
      Purma: form.purmaField ? form.purmaField : '',
      PanLlevar: form.breadCarryField ? form.breadCarryField : '',
      Vivienda: form.countryHouse ? form.countryHouse : '',
      IngresoPromedioMensual: form.questions1 ? form.questions1 : '',
      IngresoAgricultura: form.agricultureIncome ? form.agricultureIncome : '',
      IngresoBodega: form.store ? form.store : '',
      IngresoTransporte: form.transport ? form.transport : '',
      IngresoOtro: form.other ? form.other : '',
      PrestamoEntidades: form.question2 ? form.question2 : '',
      EstadoId: '01',
      Usuario: this.userSession.Result.Data.NombreUsuario,
      DiagnosticoCostoProduccionList: this.arrProductionCost,
      DiagnosticoDatosCampoList: this.arrDataFields,
      DiagnosticoInfraestructuraList: this.arrInfrastructureTitles,
      NombreArchivo: form.fileName ? form.fileName : '',
      PathArchivo: form.pathFile ? form.pathFile : ''
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
    const file = this.frmFincaDiagnosticoEdit.value.file;
    this.diagnosticoService.Create(file, request)
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
    const file = this.frmFincaDiagnosticoEdit.value.file;
    this.diagnosticoService.Update(file, request)
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
          this.spinner.hide();
          this.alertUtil.alertError('ERROR!', res.Result.Message);
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
      this.fileName = data.NombreArchivo;
      this.frmFincaDiagnosticoEdit.controls.fileName.setValue(data.NombreArchivo);
      this.frmFincaDiagnosticoEdit.controls.pathFile.setValue(data.PathArchivo);

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

  SearchPartnerProducerByFincaPartnerId(): void {
    this.socioFincaService.SearchPartnerProducerByFincaPartnerId({ SocioFincaId: this.codeFincaPartner })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          // this.frmFincaDiagnosticoEdit.controls.organization.setValue(res.Result.Data.);
          this.frmFincaDiagnosticoEdit.controls.surnamesFirstnames.setValue(`${res.Result.Data.Apellidos} ${res.Result.Data.Nombres}`);
          this.frmFincaDiagnosticoEdit.controls.documentNumber.setValue(res.Result.Data.NumeroDocumento);
          this.frmFincaDiagnosticoEdit.controls.cellPhoneNumber.setValue(res.Result.Data.NumeroTelefonoCelular);
          // this.frmFincaDiagnosticoEdit.controls.age.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.language.setValue(res.Result.Data.);
          this.frmFincaDiagnosticoEdit.controls.numberChildren.setValue(res.Result.Data.CantidadHijos);
          this.frmFincaDiagnosticoEdit.controls.gender.setValue(res.Result.Data.Genero);
          this.frmFincaDiagnosticoEdit.controls.degreeStudies.setValue(res.Result.Data.GradoEstudios);
          this.frmFincaDiagnosticoEdit.controls.birthPlace.setValue(res.Result.Data.LugarNacimiento);
          this.frmFincaDiagnosticoEdit.controls.yearEntryZone.setValue(res.Result.Data.AnioIngresoZona);
          this.frmFincaDiagnosticoEdit.controls.religion.setValue(res.Result.Data.Religion);
          this.frmFincaDiagnosticoEdit.controls.civilStatus.setValue(res.Result.Data.EstadoCivil);
          this.frmFincaDiagnosticoEdit.controls.surnameNamesSpouse.setValue(`${res.Result.Data.ApellidosConyuge} ${res.Result.Data.NombresConyuge}`);
          this.frmFincaDiagnosticoEdit.controls.degreeStudiesSpouse.setValue(res.Result.Data.GradoEstudiosConyuge);
          this.frmFincaDiagnosticoEdit.controls.placeBirthSpouse.setValue(res.Result.Data.LugarNacimientoConyuge);
          this.frmFincaDiagnosticoEdit.controls.documentNumberSpouse.setValue(res.Result.Data.NumeroDocumentoConyuge);
          this.frmFincaDiagnosticoEdit.controls.cellPhoneNumberSpouse.setValue(res.Result.Data.NumeroTelefonoCelularConyuge);
          // this.frmFincaDiagnosticoEdit.controls.ageSpouse.setValue(res.Result.Data.);
          this.frmFincaDiagnosticoEdit.controls.department.setValue(res.Result.Data.Departamento);
          this.frmFincaDiagnosticoEdit.controls.latitude.setValue(res.Result.Data.Latitud);
          this.frmFincaDiagnosticoEdit.controls.province.setValue(res.Result.Data.Provincia);
          this.frmFincaDiagnosticoEdit.controls.longitude.setValue(res.Result.Data.Longuitud);
          this.frmFincaDiagnosticoEdit.controls.district.setValue(res.Result.Data.Distrito);
          this.frmFincaDiagnosticoEdit.controls.altitude.setValue(res.Result.Data.Altitud);
          this.frmFincaDiagnosticoEdit.controls.zone.setValue(res.Result.Data.Zona);
          // this.frmFincaDiagnosticoEdit.controls.crop.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.fund.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.precipitation.setValue(res.Result.Data.);
          this.frmFincaDiagnosticoEdit.controls.powerSource.setValue(res.Result.Data.FuenteEnergia);
          // this.frmFincaDiagnosticoEdit.controls.personalNumberHarvest.setValue(res.Result.Data.);
          this.frmFincaDiagnosticoEdit.controls.waterSource.setValue(res.Result.Data.FuenteAgua);
          this.frmFincaDiagnosticoEdit.controls.numberSmallerAnimals.setValue(res.Result.Data.CantidadAnimalesMenores);
          // this.frmFincaDiagnosticoEdit.controls.internet.setValue(res.Result.Data.);
          this.frmFincaDiagnosticoEdit.controls.housingMaterial.setValue(res.Result.Data.MaterialVivienda);
          // this.frmFincaDiagnosticoEdit.controls.phoneSignal.setValue(res.Result.Data.);
          this.frmFincaDiagnosticoEdit.controls.ground.setValue(res.Result.Data.Suelo);
          // this.frmFincaDiagnosticoEdit.controls.healthEstablishment.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.timeUnitHealthCenter.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.school.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.accessRoadsCollectionCenterProductiveUnit.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.distanceKilometers.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.totalTime.setValue(res.Result.Data.);
          // this.frmFincaDiagnosticoEdit.controls.transportationWay.setValue(res.Result.Data.);
        }
      }, (err: any) => {
        console.log(err);
      });
  }

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/diagnostico/list/${this.codePartner}/${this.codeProducer}/${this.codeFincaPartner}`]);
  }

  fileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.frmFincaDiagnosticoEdit.patchValue({
        file: file
      });
      this.frmFincaDiagnosticoEdit.get('file').updateValueAndValidity()
    }
  }

  DownloadFile(): void {
    var rutaFile = this.frmFincaDiagnosticoEdit.value.pathFile;
    window.open(`${host}Diagnostico/DescargarArchivo?path=${rutaFile}`, '_blank');
  }

}
