import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
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
  styleUrls: ['./finca-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
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
  objParams: any;
  vMsgErrGenerico = "Ha ocurrido un error interno.";
  vSessionUser: any;
  selected = [];
  rows = [];
  tempRows = [];
  @ViewChild(DatatableComponent) table: DatatableComponent;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseInt(this.route.snapshot.params['id']) : 0
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.route.queryParams.subscribe((params) => {
      this.objParams = params;
      this.LoadForm();
      if (params) {
        this.GetEstados();
        if (this.vId > 0) {
          this.SearchById();
        } else {
          this.GetFincas(parseInt(params.idProductor));
        }
      }
    });
  }

  LoadForm(): void {
    this.socioFincaEditForm = this.fb.group({
      idSocio: [],
      idProductor: [],
      idSocioFinca: [],
      finca: [, [Validators.required]],
      viasAcceso: [''],
      distanciaKM: [],
      tiempoTotal: [],
      medioTransporte: [''],
      cultivo: [''],
      precipitacion: [''],
      nroPersonalCosecha: [],
      estado: ['', [Validators.required]]
    });
  }

  get f() {
    return this.socioFincaEditForm.controls;
  }

  // LoadCombos(): void {
  //   this.GetEstados();
  //   this.GetFincas();
  // }

  async GetEstados() {
    this.listEstados = [];
    const res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      if (!this.vId || this.vId <= 0) {
        this.socioFincaEditForm.controls.estado.setValue('01');
      }
    }
  }

  async GetFincas(id: number) {
    this.listFincas = [];
    const res = await this.productorFincaService.SearchProducerById({ ProductorId: id }).toPromise();
    if (res.Result.Success) {
      this.listFincas = res.Result.Data;
    }
  }

  SearchById(): void {
    this.spinner.show();
    this.socioFincaService.SearchById({ SocioFincaId: this.vId })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.AutocompleteDataForm(res.Result.Data);
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }

  async AutocompleteDataForm(data: any) {
    this.socioFincaEditForm.controls.idSocio.setValue(data.SocioId);
    this.socioFincaEditForm.controls.idProductor.setValue(data.ProductorId);
    await this.GetFincas(data.ProductorId);
    this.socioFincaEditForm.controls.finca.setValue(data.ProductorFincaId);
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
      this.socioFincaEditForm.controls.precipitacion.setValue(data.Precipitacion);
    }
    if (data.CantidadPersonalCosecha) {
      this.socioFincaEditForm.controls.nroPersonalCosecha.setValue(data.CantidadPersonalCosecha);
    }
    await this.GetEstados();
    this.socioFincaEditForm.controls.estado.setValue(data.EstadoId);
    this.spinner.hide();
  }

  GetRequest(): any {
    return {
      SocioFincaId: this.vId ?? 0,
      SocioId: this.objParams.idSocio ? parseInt(this.objParams.idSocio) : this.socioFincaEditForm.value.idSocio ? parseInt(this.socioFincaEditForm.value.idSocio) : 0,
      ProductorFincaId: this.socioFincaEditForm.value.finca,
      ViasAccesoCentroAcopio: this.socioFincaEditForm.value.viasAcceso,
      DistanciaKilometrosCentroAcopio: this.socioFincaEditForm.value.distanciaKM ?? null,
      TiempoTotalFincaCentroAcopio: this.socioFincaEditForm.value.tiempoTotal ?? null,
      MedioTransporte: this.socioFincaEditForm.value.medioTransporte,
      Cultivo: this.socioFincaEditForm.value.cultivo,
      Precipitacion: this.socioFincaEditForm.value.precipitacion,
      CantidadPersonalCosecha: this.socioFincaEditForm.value.nroPersonalCosecha ?? null,
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      EstadoId: this.socioFincaEditForm.value.estado,
      FincaEstimado: this.rows.filter(x => x.Anio != 0 && x.Estimado != 0)
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
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
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
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }

  Cancel(): void {
    if (this.objParams.idSocio) {
      this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.objParams.idSocio}`],
        { queryParams: { idProductor: this.objParams.idProductor } });
    } else {
      this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.socioFincaEditForm.value.idSocio}`],
        { queryParams: { idProductor: this.socioFincaEditForm.value.idProductor } });
    }
  }

  addRow(): void {
    // let rows = [...this.rows];
    // rows.splice(row.$$index, 1);
    this.rows = [...this.rows, { Anio: 0, Estimado: 0 }];
  }

  EliminarFila(index: any): void {
    this.rows.splice(index, 1);
    this.rows = [...this.rows];
  }

  UpdateValue(event, index, prop): void {
    if (prop === 'anio') {
      this.rows[index].Anio = parseFloat(event.target.value)
    } else if (prop === 'estimado') {
      this.rows[index].Estimado = parseFloat(event.target.value)
    }
  }
}
