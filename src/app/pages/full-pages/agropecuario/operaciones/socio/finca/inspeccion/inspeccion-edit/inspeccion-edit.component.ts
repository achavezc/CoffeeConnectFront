import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';

import { MaestroService } from '../../../../../../../../services/maestro.service';
import { InspeccionInternaService } from '../../../../../../../../services/inspeccion-interna.service';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';

@Component({
  selector: 'app-inspeccion-edit',
  templateUrl: './inspeccion-edit.component.html',
  styleUrls: ['./inspeccion-edit.component.scss']
})
export class InspeccionEditComponent implements OnInit {

  frmFincaInspeccionEdit: FormGroup;
  arrCoffeeVarieties = [];
  arrStandards = [];
  arrInspectionManagementSystemStandards = [];
  arrSocialWelfare = [];
  arrEcosystemConservation = [];
  arrIntegratedCropManagement = [];
  arrCriticalFor = [];
  arrCoffeePitches = [];
  // arrValidationConformityStandards = [];
  selectedStandards = '';
  codeFincaPartner: any;

  constructor(private fb: FormBuilder,
    private maestroServicio: MaestroService,
    private inspeccionInternaService: InspeccionInternaService,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute) {
    this.LoadCoffeeVarieties();
    this.LoadCoffeePitches();
    this.LoadStandards();
    this.LoadInspectionManagementSystemStandards();
    this.LoadSocialWelfare();
    this.LoadEcosystemConservation();
    this.LoadIntegratedCropManagement();
    this.LoadCriticalFor();
  }

  ngOnInit(): void {
    this.codeFincaPartner = this.route.snapshot.params['fincapartner'] ? parseInt(this.route.snapshot.params['fincapartner']) : 0
    this.LoadForm();
  }

  LoadForm(): void {
    this.frmFincaInspeccionEdit = this.fb.group({
      tokenNumber: [],
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
      arrPlots: this.fb.array([])
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

  LoadInspectionManagementSystemStandards(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasSistemaGerstion').subscribe((res: any) => {
      if (res.Result.Success) {
        this.arrInspectionManagementSystemStandards = res.Result.Data;
      }
    });
  }

  LoadSocialWelfare(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasBienestarSocial').subscribe((res: any) => {
      if (res.Result.Success) {
        this.arrSocialWelfare = res.Result.Data;
      }
    });
  }

  LoadEcosystemConservation(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasConservacionEcosistema').subscribe((res: any) => {
      if (res.Result.Success) {
        this.arrEcosystemConservation = res.Result.Data;
      }
    });
  }

  LoadIntegratedCropManagement(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasManejoIntegradoCultivo').subscribe((res: any) => {
      if (res.Result.Success) {
        this.arrIntegratedCropManagement = res.Result.Data;
      }
    });
  }

  LoadCriticalFor(): void {
    this.maestroServicio.obtenerMaestros('InspeccionNormasCriticoPara').subscribe((res: any) => {
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

  // NumberRowsPlots(i: Number): any {
  //   return new Array(i);
  // }

  LoadCoffeePitches(): void {
    for (let i = 0; i < 6; i++) {
      this.arrCoffeePitches.push({
        InspeccionInternaId: 0,
        NumeroLote: 0,
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
  }

  GetRequest(): any {
    const request = {
      InspeccionInternaId: 0,
      Numero: '',
      SocioFincaId: 0,
      Certificaciones: '',
      ExclusionPrograma: true,
      SuspencionTiempo: true,
      DuracionSuspencionTiempo: '',
      NoConformidadObservacionLevantada: true,
      ApruebaSinCondicion: true,
      EmpresaId: 0,
      EstadoId: '',
      Usuario: '',
      InspeccionInternaParcelaList: [],
      InspeccionInternaNormaList: [],
      InspeccionInternaLevantamientoNoConformidadList: [],
      InspeccionInternaNoConformidadList: []
    }
    return request;
  }

  Save(): void {
    if (!this.frmFincaInspeccionEdit.invalid) {
      const form = this;
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
    }
  }

  Create(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.inspeccionInternaService.Create(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {

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
    this.inspeccionInternaService.Update(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {

        } else {

        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca`])
  }
}
