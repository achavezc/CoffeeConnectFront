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
  codeFincaPartner: number;
  objParams: any;
  vMsgErrGenerico = "Ha ocurrido un error interno.";
  vSessionUser: any;
  selected = [];
  rows = [];
  tempRows = [];
  @ViewChild(DatatableComponent) table: DatatableComponent;
  codePartner: Number;
  codeProducer: Number;

  ngOnInit(): void {
    this.codePartner = this.route.snapshot.params['partner'] ? parseInt(this.route.snapshot.params['partner']) : 0
    this.codeProducer = this.route.snapshot.params['producer'] ? parseInt(this.route.snapshot.params['producer']) : 0
    this.codeFincaPartner = this.route.snapshot.params['fincapartner'] ? parseInt(this.route.snapshot.params['fincapartner']) : 0
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.GetEstados();
    if (this.codeFincaPartner > 0) {
      this.SearchById();
    } else {
      this.GetFincas(this.codeProducer);
    }
    // this.route.queryParams.subscribe((params) => {
    //   this.objParams = params;
    //   this.LoadForm();
    //   if (params) {
    //     this.GetEstados();
    //     if (this.vId > 0) {
    //       this.SearchById();
    //     } else {
    //       this.GetFincas(parseInt(params.idProductor));
    //     }
    //   }
    // });
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

  async GetEstados() {
    this.listEstados = [];
    const res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      if (!this.codeFincaPartner || this.codeFincaPartner <= 0) {
        this.socioFincaEditForm.controls.estado.setValue('01');
      }
    }
  }

  async GetFincas(id: Number) {
    this.listFincas = [];
    const res = await this.productorFincaService.SearchProducerById({ ProductorId: id }).toPromise();
    if (res.Result.Success) {
      this.listFincas = res.Result.Data;
    }
  }

  SearchById(): void {
    this.spinner.show();
    this.socioFincaService.SearchById({ SocioFincaId: this.codeFincaPartner })
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
    if (data.EstadoId) {
      this.socioFincaEditForm.controls.estado.setValue(data.EstadoId);
    }
    this.rows = data.FincaEstimado;
    this.spinner.hide();
  }

  GetRequest(): any {
    return {
      SocioFincaId: this.codeFincaPartner ?? 0,
      SocioId: this.codePartner ?? 0,
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
      if (this.codeFincaPartner > 0) {
        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización del socio finca?.' , function (result) {
          if (result.isConfirmed) {
            form.Update();
          }
        }); 
      } else {

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro del socio finca?' , function (result) {
          if (result.isConfirmed) {
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
    this.socioFincaService.Update(request)
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
    // if (this.objParams.idSocio) {
    //   this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.objParams.idSocio}`],
    //     { queryParams: { idProductor: this.objParams.idProductor } });
    // } else {
    //   this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.socioFincaEditForm.value.idSocio}`],
    //     { queryParams: { idProductor: this.socioFincaEditForm.value.idProductor } });
    // }
    this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.codePartner}/${this.codeProducer}`]);
  }

  addRow(): void {
    this.rows = [...this.rows, { Anio: 0, Estimado: 0, ProductoId: '', Consumido: 0 }];
  }

  EliminarFila(index: any): void {
    this.rows.splice(index, 1);
    this.rows = [...this.rows];
  }

  UpdateValue(event: any, index: any, prop: any): void {
    if (prop === 'anio') {
      this.rows[index].Anio = parseFloat(event.target.value)
    } else if (prop === 'estimado') {
      this.rows[index].Estimado = parseFloat(event.target.value)
    }
  }
}
