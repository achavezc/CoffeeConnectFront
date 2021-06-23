import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';

import { MaestroService } from '../../../../../../../../services/maestro.service';
import { InspeccionInternaService } from '../../../../../../../../services/inspeccion-interna.service';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';
import { SocioFincaService } from '../../../../../../../../services/socio-finca.service';
import { host } from '../../../../../../../../shared/hosts/main.host';

@Component({
  selector: 'app-inspeccion-edit',
  templateUrl: './inspeccion-edit.component.html',
  styleUrls: ['./inspeccion-edit.component.scss']
})
export class InspeccionEditComponent implements OnInit {

  frmFincaInspeccionEdit: FormGroup;
  arrCoffeeVarieties = [];
  arrStandards = [];
  arrDocumentManagement = [];
  arrSocialWelfare = [];
  arrEcosystemConservation = [];
  arrIntegratedCropManagement = [];
  arrCriticalFor = [];
  arrCoffeePitches = [];
  arrSummaryNonConformities = [];
  arrSurveyNonConformities = [];
  selectedStandards = '';
  codeFincaPartner: any;
  codeProducer: any;
  codePartner: any;
  userSession: any;
  codeInternalInspection: any;
  msgErrorGenerico = 'Ha ocurrido un error interno.';
  fileName = '';
  listStatus = [];
  selectedStatus: any;
  isEdit = false;

  constructor(private fb: FormBuilder,
    private maestroServicio: MaestroService,
    private inspeccionInternaService: InspeccionInternaService,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private socioFincaService: SocioFincaService) {
    this.codeInternalInspection = this.route.snapshot.params['internalinspection'] ? parseInt(this.route.snapshot.params['internalinspection']) : 0;
    this.LoadCriticalFor();
    this.LoadCoffeeVarieties();
    this.LoadInspectionManagementSystemStandards();
    this.LoadSocialWelfare();
    this.LoadEcosystemConservation();
    this.LoadIntegratedCropManagement();
    if (this.codeInternalInspection > 0) {
      this.SearchById();
    } else if (this.codeInternalInspection <= 0) {
      this.LoadCoffeePitches();
      this.LoadSummaryNonConformities();
      this.LoadSurveyNonConformities();
    }
    this.LoadStandards();
  }

  ngOnInit(): void {
    this.codeFincaPartner = this.route.snapshot.params['fincapartner'] ? parseInt(this.route.snapshot.params['fincapartner']) : 0;
    this.codeProducer = this.route.snapshot.params['producer'] ? parseInt(this.route.snapshot.params['producer']) : 0;
    this.codePartner = this.route.snapshot.params['partner'] ? parseInt(this.route.snapshot.params['partner']) : 0;
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadStatus();
    this.frmFincaInspeccionEdit.controls.organization.setValue(this.userSession.Result.Data.RazonSocialEmpresa);
    this.SearchPartnerProducerByFincaPartnerId();
    if (this.codeInternalInspection > 0) {
      this.isEdit = true;
    } else if (this.codeInternalInspection <= 0) {
      this.isEdit = false;
    }
  }

  LoadForm(): void {
    this.frmFincaInspeccionEdit = this.fb.group({
      tokenNumber: [''],
      registrationDate: [],
      producer: [],
      codigo: [],
      numberDocument: [],
      status: [],
      organization: [],
      zone: [],
      department: [],
      province: [],
      district: [],
      internalInspector: [],
      inspectionDate: [],
      latitude: [],
      longitude: [],
      altitude: [],
      standards: this.fb.array([]),
      itemsComply: [0],
      itemsthatapply: [0],
      totalItemsComplyApply: [0],
      programExclusion: [false],
      suspensionTime: [false],
      countSuspensionTime: [''],
      approveWithoutConditions: [false],
      nonConformitiesObservations: [false],
      totalMonthsHarvest: [0],
      totalYearMonth: [0],
      totalAge: [0],
      totalArea: [0],
      totalParchmentHarvest: [0],
      totalEstimatedParchment: [0],
      file: [],
      fileName: [''],
      pathFile: ['']
    });
  }

  get f() {
    return this.frmFincaInspeccionEdit.controls;
  }

  LoadCoffeeVarieties(): void {
    this.maestroServicio.obtenerMaestros('InspeccionVariedadCafe').subscribe((res: any) => {
      if (res.Result.Success) {
        this.arrCoffeeVarieties = res.Result.Data;
      }
    });
  }

  LoadStandards(): void {
    this.maestroServicio.obtenerMaestros('InspeccionEstandares').subscribe((res: any) => {
      if (res.Result.Success) {
        this.arrStandards = res.Result.Data;
      }
    });
  }

  async LoadStatus() {
    const res = await this.maestroServicio.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listStatus = res.Result.Data;
      if (!this.isEdit) {
        this.frmFincaInspeccionEdit.controls.status.setValue('01');
        this.selectedStatus = '01';
      }
    }
  }

  LoadInspectionManagementSystemStandards(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasSistemaGerstion')
      .subscribe((res: any) => {
        if (res.Result.Success) {
          for (let i = 0; i < res.Result.Data.length; i++) {
            this.arrDocumentManagement.push({
              InspeccionInternaNormasId: 0,
              InspeccionInternaId: this.codeInternalInspection,
              ClaseTipoInspeccionInternaNormasId: res.Result.Data[i].IdCatalogoPadre.toString(),
              TipoInspeccionInternaNormasId: res.Result.Data[i].Codigo,
              CriticoPara: '',
              NoAplica: false,
              Si: false,
              No: false,
              Observaciones: '',
              Pregunta: res.Result.Data[i].Label
            });
          }
          this.CalculateComplimentsRowsThatApply();
        }
      });
  }

  LoadSocialWelfare(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasBienestarSocial')
      .subscribe((res: any) => {
        if (res.Result.Success) {
          for (let i = 0; i < res.Result.Data.length; i++) {
            this.arrSocialWelfare.push({
              InspeccionInternaNormasId: 0,
              InspeccionInternaId: this.codeInternalInspection,
              ClaseTipoInspeccionInternaNormasId: res.Result.Data[i].IdCatalogoPadre.toString(),
              TipoInspeccionInternaNormasId: res.Result.Data[i].Codigo,
              CriticoPara: '',
              NoAplica: false,
              Si: false,
              No: false,
              Observaciones: '',
              Pregunta: res.Result.Data[i].Label
            });
          }
          this.CalculateComplimentsRowsThatApply();
        }
      });
  }

  LoadEcosystemConservation(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasConservacionEcosistema')
      .subscribe((res: any) => {
        if (res.Result.Success) {
          for (let i = 0; i < res.Result.Data.length; i++) {
            this.arrEcosystemConservation.push({
              InspeccionInternaNormasId: 0,
              InspeccionInternaId: this.codeInternalInspection,
              ClaseTipoInspeccionInternaNormasId: res.Result.Data[i].IdCatalogoPadre.toString(),
              TipoInspeccionInternaNormasId: res.Result.Data[i].Codigo,
              CriticoPara: '',
              NoAplica: false,
              Si: false,
              No: false,
              Observaciones: '',
              Pregunta: res.Result.Data[i].Label
            });
          }
          this.CalculateComplimentsRowsThatApply();
        }
      });
  }

  LoadIntegratedCropManagement(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasManejoIntegradoCultivo')
      .subscribe((res: any) => {
        if (res.Result.Success) {
          for (let i = 0; i < res.Result.Data.length; i++) {
            this.arrIntegratedCropManagement.push({
              InspeccionInternaNormasId: 0,
              InspeccionInternaId: this.codeInternalInspection,
              ClaseTipoInspeccionInternaNormasId: res.Result.Data[i].IdCatalogoPadre.toString(),
              TipoInspeccionInternaNormasId: res.Result.Data[i].Codigo,
              CriticoPara: '',
              NoAplica: false,
              Si: false,
              No: false,
              Observaciones: '',
              Pregunta: res.Result.Data[i].Label
            });
          }
          this.CalculateComplimentsRowsThatApply();
        }
      });
  }

  LoadCriticalFor(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasCriticoPara')
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.arrCriticalFor = res.Result.Data;
        }
      });
  }

  ChangeStandards(event: any): void {
    const isArray: FormArray = this.frmFincaInspeccionEdit.get('standards') as FormArray;

    if (event.target.checked) {
      isArray.push(new FormControl(event.target.value));
    } else {
      let i: number = 0;
      isArray.controls.forEach((item: FormControl) => {
        if (item.value == event.target.value) {
          isArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }

  LoadCoffeePitches(rows: any = 0): void {
    for (let i = 0; i < (6 - rows); i++) {
      this.arrCoffeePitches.push({
        InspeccionInternaId: this.codeInternalInspection,
        NumeroLote: i + 1,
        VariedadCafeId: '',
        MesesCosecha: '',
        AnioMesSiembra: '',
        Edad: '',
        AreaActual: '',
        CosechaPergaminoAnioActual: '',
        CosechaPergaminoAnioAnterior: ''
      });
    }
  }

  UpdateValuesCoffeePitches(event: any, i: any, col: any): void {
    if (col === 'NumeroLote')
      this.arrCoffeePitches[i].NumeroLote = parseInt(event.target.value);
    else if (col == 'VariedadCafeId')
      this.arrCoffeePitches[i].VariedadCafeId = event.target.value;
    else if (col == 'MesesCosecha')
      this.arrCoffeePitches[i].MesesCosecha = event.target.value;
    else if (col == 'AnioMesSiembra')
      this.arrCoffeePitches[i].AnioMesSiembra = event.target.value;
    else if (col == 'Edad')
      this.arrCoffeePitches[i].Edad = event.target.value;
    else if (col == 'AreaActual')
      this.arrCoffeePitches[i].AreaActual = event.target.value;
    else if (col == 'CosechaPergaminoAnioActual')
      this.arrCoffeePitches[i].CosechaPergaminoAnioActual = event.target.value;
    else if (col == 'CosechaPergaminoAnioAnterior')
      this.arrCoffeePitches[i].CosechaPergaminoAnioAnterior = event.target.value;
    this.CalculateTotales();
  }

  UpdateValuesDocumentsManagement(event: any, i: any, col: any): void {
    if (col == 'criticopara')
      this.arrDocumentManagement[i].CriticoPara = event.target.value;
    else if (col == 'noaplica')
      this.arrDocumentManagement[i].NoAplica = event.target.checked;
    else if (col == 'SI')
      this.arrDocumentManagement[i].Si = event.target.checked;
    else if (col == 'NO')
      this.arrDocumentManagement[i].No = event.target.checked;
    else if (col == 'obs')
      this.arrDocumentManagement[i].Observaciones = event.target.value;
    this.CalculateComplimentsRowsThatApply();
  }

  UpdateValuesSocialWelfare(event: any, i: any, col: any): void {
    if (col == 'criticopara')
      this.arrSocialWelfare[i].CriticoPara = event.target.value;
    else if (col == 'noaplica')
      this.arrSocialWelfare[i].NoAplica = event.target.checked;
    else if (col == 'SI')
      this.arrSocialWelfare[i].Si = event.target.checked;
    else if (col == 'NO')
      this.arrSocialWelfare[i].No = event.target.checked;
    else if (col == 'obs')
      this.arrSocialWelfare[i].Observaciones = event.target.value;
    this.CalculateComplimentsRowsThatApply();
  }

  UpdateValuesEcosystemConservation(event: any, i: any, col: any): void {
    if (col == 'criticopara')
      this.arrEcosystemConservation[i].CriticoPara = event.target.value;
    else if (col == 'noaplica')
      this.arrEcosystemConservation[i].NoAplica = event.target.checked;
    else if (col == 'SI')
      this.arrEcosystemConservation[i].Si = event.target.checked;
    else if (col == 'NO')
      this.arrEcosystemConservation[i].No = event.target.checked;
    else if (col == 'obs')
      this.arrEcosystemConservation[i].Observaciones = event.target.value;
    this.CalculateComplimentsRowsThatApply();
  }

  UpdateValuesIntegratedCropManagement(event: any, i: any, col: any): void {
    if (col == 'criticopara')
      this.arrIntegratedCropManagement[i].CriticoPara = event.target.value;
    else if (col == 'noaplica')
      this.arrIntegratedCropManagement[i].NoAplica = event.target.checked;
    else if (col == 'SI')
      this.arrIntegratedCropManagement[i].Si = event.target.checked;
    else if (col == 'NO')
      this.arrIntegratedCropManagement[i].No = event.target.checked;
    else if (col == 'obs')
      this.arrIntegratedCropManagement[i].Observaciones = event.target.value;
    this.CalculateComplimentsRowsThatApply();
  }

  LoadSummaryNonConformities(rows: any = 0): void {
    for (let i = 0; i < (6 - rows); i++) {
      this.arrSummaryNonConformities.push({
        InspeccionInternaId: this.codeInternalInspection,
        NumeroItem: '',
        ManifiestoProductor: ''
      });
    }
  }

  UpdateValuesSummaryNonConformities(event: any, i: any, col: any): void {
    if (col === 'ni')
      this.arrSummaryNonConformities[i].NumeroItem = event.target.value;
    else if (col == 'mp')
      this.arrSummaryNonConformities[i].ManifiestoProductor = event.target.value;
  }

  LoadSurveyNonConformities(rows: any = 0): void {
    for (let i = 0; i < (4 - rows); i++) {
      this.arrSurveyNonConformities.push({
        InspeccionInternaId: this.codeInternalInspection,
        PuntoControl: '',
        NoConformidad: '',
        AccionCorrectiva: '',
        PlazoLevantamiento: '',
        Cumplio: false
      });
    }
  }

  UpdateValuesSurveyNonConformities(event: any, i: any, col: any): void {
    if (col === 'pc')
      this.arrSurveyNonConformities[i].PuntoControl = event.target.value;
    else if (col == 'nc')
      this.arrSurveyNonConformities[i].NoConformidad = event.target.value;
    else if (col == 'ac')
      this.arrSurveyNonConformities[i].AccionCorrectiva = event.target.value;
    else if (col == 'pl')
      this.arrSurveyNonConformities[i].PlazoLevantamiento = event.target.value;
    else if (col == 'cumplio')
      this.arrSurveyNonConformities[i].Cumplio = event.target.checked;
  }

  // CountRowsApply(e: any): void {
  //   let count = this.frmFincaInspeccionEdit.value.itemsthatapply;
  //   if (e.target.checked) {
  //     count = count + 1;
  //   } else {
  //     count = count - 1;
  //   }
  //   this.frmFincaInspeccionEdit.controls.itemsthatapply.setValue(count);
  // }

  // CountRowsYes(e: any): void {
  //   let count = this.frmFincaInspeccionEdit.value.itemsComply;
  //   if (e.target.checked) {
  //     count = count + 1;
  //   } else {
  //     count = count - 1;
  //   }
  //   this.frmFincaInspeccionEdit.controls.itemsComply.setValue(count);
  // }

  CountRowsItemsComply(e: any): void {
    let count = this.frmFincaInspeccionEdit.value.itemsComply;
    if (e.target.checked) {
      count = count + 1;
    } else {
      count = count - 1;
    }
    this.frmFincaInspeccionEdit.controls.itemsComply.setValue(count);
  }

  SearchPartnerProducerByFincaPartnerId(): void {
    this.socioFincaService.SearchPartnerProducerByFincaPartnerId({ SocioFincaId: this.codeFincaPartner })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.frmFincaInspeccionEdit.controls.producer.setValue(`${res.Result.Data.Nombres} ${res.Result.Data.Apellidos}`);
          this.frmFincaInspeccionEdit.controls.codigo.setValue(res.Result.Data.Numero);
          this.frmFincaInspeccionEdit.controls.numberDocument.setValue(res.Result.Data.NumeroDocumento);
          this.frmFincaInspeccionEdit.controls.status.setValue(res.Result.Data.EstadoId);
          this.frmFincaInspeccionEdit.controls.zone.setValue(res.Result.Data.Zona);
          this.frmFincaInspeccionEdit.controls.department.setValue(res.Result.Data.Departamento);
          this.frmFincaInspeccionEdit.controls.province.setValue(res.Result.Data.Provincia);
          this.frmFincaInspeccionEdit.controls.district.setValue(res.Result.Data.Distrito);
          // this.frmFincaInspeccionEdit.controls.internalInspector.setValue(res.Result.Data.);
          // this.frmFincaInspeccionEdit.controls.inspectionDate.setValue(res.Result.Data.);
          this.frmFincaInspeccionEdit.controls.latitude.setValue(res.Result.Data.Latitud);
          this.frmFincaInspeccionEdit.controls.longitude.setValue(res.Result.Data.Longuitud);
          this.frmFincaInspeccionEdit.controls.altitude.setValue(res.Result.Data.Altitud);
        }
      }, (err: any) => {
        console.log(err);
      });
  }

  GetRequest(): any {
    const form = this.frmFincaInspeccionEdit.value;
    this.arrCoffeePitches.forEach(x => {
      if (!x.VariedadCafeId) {
        x.VariedadCafeId = this.arrCoffeeVarieties[0].Codigo;
      }
    });

    const request = {
      InspeccionInternaId: this.codeInternalInspection,
      Numero: form.tokenNumber ? form.tokenNumber : '',
      SocioFincaId: this.codeFincaPartner,
      Certificaciones: form.standards ? form.standards.join('|') : '',
      ExclusionPrograma: form.programExclusion,
      SuspencionTiempo: form.suspensionTime,
      Inspector: form.internalInspector,
      FechaInspeccion: form.inspectionDate ? form.inspectionDate : null,
      DuracionSuspencionTiempo: form.countSuspensionTime ? form.countSuspensionTime : '',
      NoConformidadObservacionLevantada: form.nonConformitiesObservations,
      ApruebaSinCondicion: form.approveWithoutConditions,
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      EstadoId: form.status ? form.status : '01',
      Usuario: this.userSession.Result.Data.NombreUsuario,
      InspeccionInternaParcelaList: [...this.arrCoffeePitches],
      InspeccionInternaNormaList: [...this.arrDocumentManagement, ...this.arrSocialWelfare, ...this.arrEcosystemConservation, ...this.arrIntegratedCropManagement],
      InspeccionInternaLevantamientoNoConformidadList: [...this.arrSurveyNonConformities],
      InspeccionInternaNoConformidadList: [...this.arrSummaryNonConformities],
      NombreArchivo: form.fileName ? form.fileName : '',
      PathArchivo: form.pathFile ? form.pathFile : ''
    }
    return request;
  }

  Save(): void {
    if (!this.frmFincaInspeccionEdit.invalid) {
      const form = this;
      if (this.codeInternalInspection <= 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la creación de la inspección interna?.`,
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
          text: `¿Está seguro de continuar con la actualización?.`,
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
    const file = this.frmFincaInspeccionEdit.value.file;
    this.inspeccionInternaService.Create(file, request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMACIÓN', 'Registrado correctamente.', () => {
            this.Cancel();
          });
        } else {
          this.alertUtil.alertError('ERROR', res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError('ERROR', this.msgErrorGenerico);
      });
  }

  Update(): void {
    this.spinner.show();
    const request = this.GetRequest();
    const file = this.frmFincaInspeccionEdit.value.file;
    this.inspeccionInternaService.Update(file, request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMACIÓN', 'Actualizado correctamente.', () => {
            this.Cancel();
          });
        } else {
          this.alertUtil.alertError('ERROR', res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError('ERROR', this.msgErrorGenerico);
      });
  }

  SearchById(): void {
    this.spinner.show();
    this.inspeccionInternaService.SearchById({ InspeccionInternaId: this.codeInternalInspection })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.AutocompleteForm(res.Result.Data);
        } else {
          this.alertUtil.alertError('ERROR', res.Result.Message);
        }
      }, (err: any) => {
        this.alertUtil.alertError('ERROR', this.msgErrorGenerico);
        console.log(err);
        this.spinner.hide();
      });
  }

  async AutocompleteForm(data: any) {
    if (data) {
      this.frmFincaInspeccionEdit.controls.tokenNumber.setValue(data.Numero);
      this.frmFincaInspeccionEdit.controls.registrationDate.setValue(data.FechaRegistro.substring(0, 10));
      this.selectedStandards = data.Certificaciones;
      this.selectedStandards.split('|').forEach(x => this.ChangeStandards({ target: { value: x, checked: true } }));
      this.frmFincaInspeccionEdit.controls.programExclusion.setValue(data.ExclusionPrograma);
      this.frmFincaInspeccionEdit.controls.suspensionTime.setValue(data.SuspencionTiempo);
      this.frmFincaInspeccionEdit.controls.countSuspensionTime.setValue(data.DuracionSuspencionTiempo);
      this.fileName = data.NombreArchivo;
      this.frmFincaInspeccionEdit.controls.fileName.setValue(data.NombreArchivo);
      this.frmFincaInspeccionEdit.controls.pathFile.setValue(data.PathArchivo);
      if (data.EstadoId) {
        await this.LoadStatus();
        this.frmFincaInspeccionEdit.controls.status.setValue(data.EstadoId);
      }

      if (data.FechaInspeccion)
        this.frmFincaInspeccionEdit.controls.inspectionDate.setValue(data.FechaInspeccion.substring(0, 10));

      this.frmFincaInspeccionEdit.controls.internalInspector.setValue(data.Inspector);
      this.frmFincaInspeccionEdit.controls.approveWithoutConditions.setValue(data.ApruebaSinCondicion);
      this.frmFincaInspeccionEdit.controls.nonConformitiesObservations.setValue(data.NoConformidadObservacionLevantada);
      this.arrCoffeePitches = data.InspeccionInternaParcela;
      this.LoadCoffeePitches(this.arrCoffeePitches.length);
      this.arrSummaryNonConformities = data.InspeccionInternaNoConformidad;
      this.LoadSummaryNonConformities(this.arrSummaryNonConformities.length);
      this.arrSurveyNonConformities = data.InspeccionInternaLevantamientoNoConformidad;
      this.LoadSurveyNonConformities(this.arrSurveyNonConformities.length);

      for (let i = 0; i < data.InspeccionInternaNorma.length; i++) {
        for (let y = 0; y < this.arrDocumentManagement.length; y++) {
          if (this.arrDocumentManagement[y].ClaseTipoInspeccionInternaNormasId == data.InspeccionInternaNorma[i].ClaseTipoInspeccionInternaNormasId
            && this.arrDocumentManagement[y].TipoInspeccionInternaNormasId == data.InspeccionInternaNorma[i].TipoInspeccionInternaNormasId) {
            this.arrDocumentManagement[y].InspeccionInternaNormasId = data.InspeccionInternaNorma[i].InspeccionInternaNormasId;
            this.arrDocumentManagement[y].CriticoPara = data.InspeccionInternaNorma[i].CriticoPara;
            this.arrDocumentManagement[y].NoAplica = data.InspeccionInternaNorma[i].NoAplica;
            this.arrDocumentManagement[y].Si = data.InspeccionInternaNorma[i].Si;
            this.arrDocumentManagement[y].No = data.InspeccionInternaNorma[i].No;
            this.arrDocumentManagement[y].Observaciones = data.InspeccionInternaNorma[i].Observaciones;
            break;
          }
        }
      }

      for (let i = 0; i < data.InspeccionInternaNorma.length; i++) {
        for (let y = 0; y < this.arrSocialWelfare.length; y++) {
          if (this.arrSocialWelfare[y].ClaseTipoInspeccionInternaNormasId == data.InspeccionInternaNorma[i].ClaseTipoInspeccionInternaNormasId
            && this.arrSocialWelfare[y].TipoInspeccionInternaNormasId == data.InspeccionInternaNorma[i].TipoInspeccionInternaNormasId) {
            this.arrSocialWelfare[y].InspeccionInternaNormasId = data.InspeccionInternaNorma[i].InspeccionInternaNormasId;
            this.arrSocialWelfare[y].CriticoPara = data.InspeccionInternaNorma[i].CriticoPara;
            this.arrSocialWelfare[y].NoAplica = data.InspeccionInternaNorma[i].NoAplica;
            this.arrSocialWelfare[y].Si = data.InspeccionInternaNorma[i].Si;
            this.arrSocialWelfare[y].No = data.InspeccionInternaNorma[i].No;
            this.arrSocialWelfare[y].Observaciones = data.InspeccionInternaNorma[i].Observaciones;
            break;
          }
        }
      }

      for (let i = 0; i < data.InspeccionInternaNorma.length; i++) {
        for (let y = 0; y < this.arrEcosystemConservation.length; y++) {
          if (this.arrEcosystemConservation[y].ClaseTipoInspeccionInternaNormasId == data.InspeccionInternaNorma[i].ClaseTipoInspeccionInternaNormasId
            && this.arrEcosystemConservation[y].TipoInspeccionInternaNormasId == data.InspeccionInternaNorma[i].TipoInspeccionInternaNormasId) {
            this.arrEcosystemConservation[y].InspeccionInternaNormasId = data.InspeccionInternaNorma[i].InspeccionInternaNormasId;
            this.arrEcosystemConservation[y].CriticoPara = data.InspeccionInternaNorma[i].CriticoPara;
            this.arrEcosystemConservation[y].NoAplica = data.InspeccionInternaNorma[i].NoAplica;
            this.arrEcosystemConservation[y].Si = data.InspeccionInternaNorma[i].Si;
            this.arrEcosystemConservation[y].No = data.InspeccionInternaNorma[i].No;
            this.arrEcosystemConservation[y].Observaciones = data.InspeccionInternaNorma[i].Observaciones;
            break;
          }
        }
      }

      for (let i = 0; i < data.InspeccionInternaNorma.length; i++) {
        for (let y = 0; y < this.arrIntegratedCropManagement.length; y++) {
          if (this.arrIntegratedCropManagement[y].ClaseTipoInspeccionInternaNormasId == data.InspeccionInternaNorma[i].ClaseTipoInspeccionInternaNormasId
            && this.arrIntegratedCropManagement[y].TipoInspeccionInternaNormasId == data.InspeccionInternaNorma[i].TipoInspeccionInternaNormasId) {
            this.arrIntegratedCropManagement[y].InspeccionInternaNormasId = data.InspeccionInternaNorma[i].InspeccionInternaNormasId;
            this.arrIntegratedCropManagement[y].CriticoPara = data.InspeccionInternaNorma[i].CriticoPara;
            this.arrIntegratedCropManagement[y].NoAplica = data.InspeccionInternaNorma[i].NoAplica;
            this.arrIntegratedCropManagement[y].Si = data.InspeccionInternaNorma[i].Si;
            this.arrIntegratedCropManagement[y].No = data.InspeccionInternaNorma[i].No;
            this.arrIntegratedCropManagement[y].Observaciones = data.InspeccionInternaNorma[i].Observaciones;
            break;
          }
        }
      }
      // this.CalculateTotales();
      this.CalculateComplimentsRowsThatApply();
    }
    this.spinner.hide();
  }

  CalculateTotales(): void {
    /* let sumTotalMonthsHarvest = 0;
    let sumTotalYearMonth = 0;
    let sumTotalAge = 0;
    let sumTotalArea = 0;
    let sumTotalParchmentHarvest = 0;
    let sumTotalEstimatedParchment = 0;
    for (let i = 0; i < this.arrCoffeePitches.length; i++) {
      sumTotalMonthsHarvest += this.arrCoffeePitches[i].MesesCosecha ? parseFloat(this.arrCoffeePitches[i].MesesCosecha) : 0;
      sumTotalYearMonth += this.arrCoffeePitches[i].AnioMesSiembra ? parseFloat(this.arrCoffeePitches[i].AnioMesSiembra) : 0;
      sumTotalAge += this.arrCoffeePitches[i].Edad ? parseFloat(this.arrCoffeePitches[i].Edad) : 0;
      sumTotalArea += this.arrCoffeePitches[i].AreaActual ? parseFloat(this.arrCoffeePitches[i].AreaActual) : 0;
      sumTotalParchmentHarvest += this.arrCoffeePitches[i].CosechaPergaminoAnioAnterior ? parseFloat(this.arrCoffeePitches[i].CosechaPergaminoAnioAnterior) : 0;
      sumTotalEstimatedParchment += this.arrCoffeePitches[i].CosechaPergaminoAnioActual ? parseFloat(this.arrCoffeePitches[i].CosechaPergaminoAnioActual) : 0;
    }
    this.frmFincaInspeccionEdit.controls.totalMonthsHarvest.setValue(sumTotalMonthsHarvest);
    this.frmFincaInspeccionEdit.controls.totalYearMonth.setValue(sumTotalYearMonth);
    this.frmFincaInspeccionEdit.controls.totalAge.setValue(sumTotalAge);
    this.frmFincaInspeccionEdit.controls.totalArea.setValue(sumTotalArea);
    this.frmFincaInspeccionEdit.controls.totalParchmentHarvest.setValue(sumTotalParchmentHarvest);
    this.frmFincaInspeccionEdit.controls.totalEstimatedParchment.setValue(sumTotalEstimatedParchment); */
  }

  CalculateComplimentsRowsThatApply(): void {
    let compliments = this.arrDocumentManagement.filter(x => x.Si == true).length;
    let rowsThatApply = this.arrDocumentManagement.filter(x => x.NoAplica == true).length;
    rowsThatApply = rowsThatApply + this.arrSocialWelfare.filter(x => x.NoAplica == true).length;
    compliments = compliments + this.arrSocialWelfare.filter(x => x.Si == true).length;
    rowsThatApply = rowsThatApply + this.arrEcosystemConservation.filter(x => x.NoAplica == true).length;
    compliments = compliments + this.arrEcosystemConservation.filter(x => x.Si == true).length;
    rowsThatApply = rowsThatApply + this.arrIntegratedCropManagement.filter(x => x.NoAplica == true).length;
    compliments = compliments + this.arrIntegratedCropManagement.filter(x => x.Si == true).length;

    const total = this.arrDocumentManagement.length + this.arrSocialWelfare.length + this.arrEcosystemConservation.length + this.arrIntegratedCropManagement.length;
    const sumItemsComply = compliments + rowsThatApply;
    if (sumItemsComply > 0)
      this.frmFincaInspeccionEdit.controls.itemsComply.setValue(sumItemsComply);
    if (total > 0)
      this.frmFincaInspeccionEdit.controls.itemsthatapply.setValue(total);
    if (sumItemsComply > 0 && total > 0)
      this.frmFincaInspeccionEdit.controls.totalItemsComplyApply.setValue(((sumItemsComply * 100) / total).toFixed(2));
  }

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/inspeccion/list/${this.codePartner}/${this.codeProducer}/${this.codeFincaPartner}`])
  }

  fileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.frmFincaInspeccionEdit.patchValue({
        file: file
      });
      this.frmFincaInspeccionEdit.get('file').updateValueAndValidity();
    }
  }

  DownloadFile() {
    var rutaFile = this.frmFincaInspeccionEdit.value.pathFile;
    window.open(`${host}InspeccionInterna/DescargarArchivo?path=${rutaFile}`, '_blank');
  }
}
