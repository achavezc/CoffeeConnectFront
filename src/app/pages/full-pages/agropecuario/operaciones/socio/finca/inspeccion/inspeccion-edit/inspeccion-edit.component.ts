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
  selectedStandards = '';

  constructor(private fb: FormBuilder,
    private maestroServicio: MaestroService) {
    this.LoadStandards();
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
