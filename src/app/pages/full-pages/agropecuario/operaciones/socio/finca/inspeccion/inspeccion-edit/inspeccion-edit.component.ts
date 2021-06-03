import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MaestroService } from '../../../../../../../../services/maestro.service';

@Component({
  selector: 'app-inspeccion-edit',
  templateUrl: './inspeccion-edit.component.html',
  styleUrls: ['./inspeccion-edit.component.scss']
})
export class InspeccionEditComponent implements OnInit {

  frmFincaInspeccionEdit: FormGroup;
  arrStandards = [];
  arrInspectionManagementSystemStandards = [];
  arrSocialWelfare = [];
  arrEcosystemConservation = [];
  arrIntegratedCropManagement = [];
  arrCriticalFor = [];
  selectedStandards = '';

  constructor(private fb: FormBuilder,
    private maestroServicio: MaestroService) {
    this.LoadStandards();
    this.LoadInspectionManagementSystemStandards();
    this.LoadSocialWelfare();
    this.LoadEcosystemConservation();
    this.LoadIntegratedCropManagement();
    this.LoadCriticalFor();
  }

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.frmFincaInspeccionEdit = this.fb.group({
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
      standards: this.fb.array([])
    });
  }

  get f() {
    return this.frmFincaInspeccionEdit.controls;
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
}
