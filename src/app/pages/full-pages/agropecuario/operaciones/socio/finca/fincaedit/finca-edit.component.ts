import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

import { DateUtil } from '../../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import { SocioFincaService } from '../../../../../../../services/socio-finca.service';
import { ProductorFincaService } from '../../../../../../../services/productor-finca.service';
import { MaestroService } from '../../../../../../../services/maestro.service';

@Component({
  selector: 'app-finca-edit',
  templateUrl: './finca-edit.component.html',
  styleUrls: ['./finca-edit.component.scss']
})
export class FincaEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private router: Router,
    private socioFincaService: SocioFincaService,
    private route: ActivatedRoute,
    private maestroService: MaestroService,
    private productorFincaService: ProductorFincaService) { }

  socioFincaEditForm: FormGroup;
  listFincas: any[];
  listEstados: any[];
  selectedFinca: any;
  selectedEstado: any;
  vId: number;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseInt(this.route.snapshot.params['id']) : 0
    this.LoadForm();
    this.LoadCombos();
    if (this.vId > 0) {
      this.SearchById();
    } else {

    }
  }

  LoadForm(): void {
    this.socioFincaEditForm = this.fb.group({
      finca: [, [Validators.required]],
      viasAcceso: [''],
      distanciaKM: [],
      tiempoTotal: [],
      medioTransporte: [''],
      cultivo: [''],
      presipitacion: [''],
      nroPersonalCosecha: [],
      estado: ['', [Validators.required]]
    });
  }

  get f() {
    return this.socioFincaEditForm.controls;
  }

  LoadCombos(): void {
    this.GetEstados();
  }

  async GetEstados() {
    const res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      if (!this.vId || this.vId <= 0) {
        this.socioFincaEditForm.controls.estado.setValue('01');
      }
    }
  }

  SearchById(): void {
    this.spinner.show();
    this.socioFincaService.SearchById({ SocioFincaId: this.vId })
      .subscribe((res: any) => {
        this.AutocompleteDataForm(res.Result.Data);
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  async AutocompleteDataForm(data: any) {
    // this.socioFincaEditForm.controls.finca.setValue(data.);
    if (data.ViasAccesoCentroAcopio) {
      this.socioFincaEditForm.controls.viasAcceso.setValue(data.ViasAccesoCentroAcopio);
    }
    if (data.DistanciaKilometrosCentroAcopio) {
      this.socioFincaEditForm.controls.distanciaKM.setValue(data.DistanciaKilometrosCentroAcopio);
    }
    if (data.TiempoTotalFincaCentroAcopio) {
      this.socioFincaEditForm.controls.tiempoTotal.setValue(data.TiempoTotalFincaCentroAcopio);
    }
    if (data.MedioTransporte) {
      this.socioFincaEditForm.controls.medioTransporte.setValue(data.MedioTransporte);
    }
    if (data.Cultivo) {
      this.socioFincaEditForm.controls.cultivo.setValue(data.Cultivo);
    }
    if (data.Precipitacion) {
      this.socioFincaEditForm.controls.presipitacion.setValue(data.Precipitacion);
    }
    if (data.CantidadPersonalCosecha) {
      this.socioFincaEditForm.controls.nroPersonalCosecha.setValue(data.CantidadPersonalCosecha);
    }
    this.socioFincaEditForm.controls.estado.setValue(data.EstadoId);
  }

  GetRequest(): any {
    return {
      SocioFincaId: 0,
      SocioId: 0,
      ProductorFincaId: 0,
      ViasAccesoCentroAcopio: this.socioFincaEditForm.value.viasAcceso,
      DistanciaKilometrosCentroAcopio: this.socioFincaEditForm.value.distanciaKM ?? null,
      TiempoTotalFincaCentroAcopio: this.socioFincaEditForm.value.tiempoTotal ?? null,
      MedioTransporte: this.socioFincaEditForm.value.medioTransporte,
      Cultivo: this.socioFincaEditForm.value.cultivo,
      Precipitacion: this.socioFincaEditForm.value.presipitacion,
      CantidadPersonalCosecha: this.socioFincaEditForm.value.nroPersonalCosecha ?? null,
      Usuario: 'mruizb',
      EstadoId: this.socioFincaEditForm.value.estado
    }
  }

  Save(): void {
    if (!this.socioFincaEditForm.invalid) {
      const form = this;
      if (this.vId > 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la actualización del socio finca?.`,
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
        }).then(function (result) {
          if (result.value) {
            form.Update();
          }
        });
      } else {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con el registro del socio finca?.`,
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
        }).then(function (result) {
          if (result.value) {
            form.Create();
          }
        });
      }
    }
  }

  Create(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.socioFincaService.Create(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se registro correctamente el socio finca.",
            () => {
              this.Cancel();
            });
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  Update(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.socioFincaService.Create(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se actualizo correctamente el socio finca.",
            () => {
              this.Cancel();
            });
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  Cancel(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/list']);
  }
}
