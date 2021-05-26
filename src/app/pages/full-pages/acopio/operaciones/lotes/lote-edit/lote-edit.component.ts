import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DateUtil } from '../../../../../../services/util/date-util';
import { LoteService } from '../../../../../../services/lote.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { host } from '../../../../../../shared/hosts/main.host';
import { DetalleLoteComponent } from '../lote-edit/detalleLote/detalleLote.component';
import { ReqActualizarLote, IdsAccion } from '../../../../../../services/models/req-actualizar-lote';


@Component({
  selector: 'app-lote-edit',
  templateUrl: './lote-edit.component.html',
  styleUrls: ['./lote-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoteEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loteService: LoteService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private alert: AlertUtil,
    private dateUtil: DateUtil,
    private modalService: NgbModal) { }

  loteEditForm: any;
  listAlmacenes: any[];
  selectedAlmacen: any;
  limitRef: number = 10;
  rows: any[] = [];
  tempRows: any[];
  selected: any;
  vId: number;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  errorGeneral = { isError: false, msgError: '' };
  listEtiquetasLotes: any[];
  vSessionUser: any;
  viewTagSeco: Boolean;
  disabledControl: string = '';
  detalle: any;
  form: string = "lote"
  @ViewChild(DetalleLoteComponent) child;
  KilosNetos: any;

  ngOnInit(): void {
    this.vId = parseInt(this.route.snapshot.params['id']);
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    if (this.vId && this.vId > 0) {
      this.LoadForm();
      // this.LoadCombos();
      this.SearchById();
    }
    else {
      this.disabledControl = 'disabled';
    }
  }

  LoadForm(): void {
    this.loteEditForm = this.fb.group({
      razonSocial: [],
      nroLote: [],
      direccion: [],
      fecha: [],
      ruc: [],
      producto: [],
      subproducto: [],
      tipoProduccion:[],
      certificacion: [],
      almacen: ['', [Validators.required]],
      totalPesoNeto: [],
      promedioRendimiento: [],
      promedioHumedad: [],
      promedioPuntajeFinal: [],
      detalleLote: this.fb.group({
        unidadMedida: new FormControl('', []),
        totalSacos: new FormControl('', []),
        totalKilosNetosPesado: new FormControl('', []),
        totalKilosBrutosPesado: new FormControl('', []),
        promedioRendimiento: new FormControl('', []),
        promedioHumedad: new FormControl('', []),
        promedioPuntajeFinal: new FormControl('', []),

      }),
      idContrato: [],
      contrato: [],
      cliente: [],
      unidadMedida: [],
      cantidad: [],
      kilosNetos: [],
      kilosPendientes: []
    });
  }
  get f() {
    return this.loteEditForm.controls;
  }

  LoadCombos(): void {
    this.GetAlmacenes();
  }

  async GetAlmacenes() {
    const form = this;
    const res = await this.maestroService.obtenerMaestros('Almacen').toPromise();
    if (res.Result.Success) {
      form.listAlmacenes = res.Result.Data;
    }
  }

  updateLimit(limit: any) {
    this.limitRef = limit.target.value;
  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempRows.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  SearchById(): void {
    this.spinner.show();
    this.loteService.SearchDetailsById({ LoteId: this.vId })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.detalle = res.Result.Data;
          res.Result.Data.listaDetalle.forEach((x: any) => {
            x.FechaIngresoAlmacenString = this.dateUtil.formatDate(new Date(x.FechaIngresoAlmacen))
          });
          this.tempRows = res.Result.Data.listaDetalle;
          this.rows = [...this.tempRows];
          this.AutocompleteForm(res.Result.Data);
        }
      }, (err: any) => {
        this.spinner.hide();
      });
  }

  async AutocompleteForm(row: any) {
    await this.GetAlmacenes();
    this.loteEditForm.controls.razonSocial.setValue(row.RazonSocial);
    this.loteEditForm.controls.nroLote.setValue(row.Numero);
    this.loteEditForm.controls.direccion.setValue(row.Direccion);
    
    if (row.FechaRegistro && row.FechaRegistro.substring(0, 10) != "0001-01-01") {
      this.loteEditForm.controls.fecha.setValue(row.FechaRegistro.substring(0, 10));
    }
    this.loteEditForm.controls.ruc.setValue(row.Ruc);
    if (row.TipoCertificacion != null) {
      this.loteEditForm.controls.certificacion.setValue(row.TipoCertificacion);
    }
    this.loteEditForm.controls.producto.setValue(row.Producto);
    this.loteEditForm.controls.subproducto.setValue(row.SubProducto);
    this.loteEditForm.controls.tipoProduccion.setValue(row.TipoProduccion);
    if (row.SubProductoId == "02") {
      this.viewTagSeco = true;
    }
    else {
      this.viewTagSeco = false;
    }
    if (row.AlmacenId && this.listAlmacenes.find(x => x.Codigo == row.AlmacenId)) {
      this.loteEditForm.controls.almacen.setValue(row.AlmacenId);
    }
    this.loteEditForm.controls.detalleLote.controls.unidadMedida.setValue(row.UnidadMedida);
    this.loteEditForm.controls.detalleLote.controls.totalSacos.setValue(row.Cantidad);
    this.loteEditForm.controls.detalleLote.controls.totalKilosNetosPesado.setValue(row.TotalKilosNetosPesado);
    this.loteEditForm.controls.detalleLote.controls.totalKilosBrutosPesado.setValue(row.TotalKilosBrutosPesado);
    this.loteEditForm.controls.detalleLote.controls.promedioRendimiento.setValue(row.RendimientoPorcentaje);
    this.loteEditForm.controls.detalleLote.controls.promedioHumedad.setValue(row.HumedadPorcentajeAnalisisFisico);
    this.loteEditForm.controls.detalleLote.controls.promedioPuntajeFinal.setValue(row.TotalAnalisisSensorial);
    if(row.ContratoId)
    {
      this.loteEditForm.controls.idContrato.setValue(row.ContratoId);
      this.loteEditForm.controls.cliente.setValue(row.Cliente);
      this.loteEditForm.controls.cantidad.setValue(row.TotalSacos);
      this.loteEditForm.controls.unidadMedida.setValue(row.Empaque);
      this.loteEditForm.controls.kilosNetos.setValue(row.PesoKilos);
      this.loteEditForm.controls.contrato.setValue(row.NumeroContrato); 
      this.KilosNetos = row.PesoKilos;
      this.calculoKilosPendiente();     
    }
    this.child.cargarDatos(row);
    this.spinner.hide();
  }

  Save(): void {
    if (!this.loteEditForm.invalid) {
      this.errorGeneral = { isError: false, msgError: '' };
      const form = this;
      swal.fire({
        title: '¿Estas Seguro?',
        text: `¿Está seguro de actualizar el lote "${this.loteEditForm.value.nroLote}"?`,
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
          form.UpdateLote();
        }
      });
    } else {
      this.errorGeneral = { isError: true, msgError: 'Por favor completar los campos OBLIGATORIOS!' };
    }
  }

  UpdateLote(): void {
    this.spinner.show();
    let listAccion: IdsAccion[] = [];
    let idContrato: any = null;
    if (this.child.detalleLotes.length > 0) {
      this.child.detalleLotes.forEach(x => {
        if (x.Accion == 'N') {
          let object = new IdsAccion();
          object.Accion = x.Accion;
          object.Id = x.NotaIngresoAlmacenId;

          listAccion.push(object);
        }
        else if (x.Accion == 'E') {
          let object = new IdsAccion();
          object.Accion = x.Accion;
          object.Id = x.LoteDetalleId
          listAccion.push(object);
        }
      });
    }
    if (this.loteEditForm.controls.idContrato.value != null) {
      idContrato = this.loteEditForm.controls.idContrato.value;
    }
    const request = new ReqActualizarLote(
      this.vId,
      this.selectedAlmacen,
      this.vSessionUser.Result.Data.NombreUsuario,
      this.loteEditForm.controls.detalleLote.controls.totalSacos.value,

      this.loteEditForm.controls.detalleLote.controls.totalKilosNetosPesado.value,
      this.loteEditForm.controls.detalleLote.controls.totalKilosBrutosPesado.value,
      listAccion,
      idContrato,
    )

    this.loteService.Update(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alert.alertOkCallback("Actualizado!", "Actualizado correctamente!", () => {
            this.Cancel();
          });
        }
      }, (err: any) => {
        this.spinner.hide();
      });
  }

  Print(): void {
    const form = this;
    swal.fire({
      title: '¿Estas Seguro?',
      text: `¿Está seguro de realizar la impresión?`,
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
        let link = document.createElement('a');
        document.body.appendChild(link);
        link.href = `${host}lote/GenerarPDFEtiquetasLote?id=${form.vId}`;
        link.target = "_blank";
        link.click();
        link.remove();
      }
    });
  }

  Cancel(): void {
    this.router.navigate(['/acopio/operaciones/lotes-list']);
  }

  OpenModal(modal: any): void {
    this.modalService.open(modal, { size: 'xl', centered: true })
  }

  GetDataMdlContrato(event: any): void {
    if (event) {
      const data = event[0];
      if (data.ContratoId) {
        this.loteEditForm.controls.idContrato.setValue(data.ContratoId);
      }
      if (data.Numero) {
        this.loteEditForm.controls.contrato.setValue(data.Numero);
      }
      if (data.Cliente) {
        this.loteEditForm.controls.cliente.setValue(data.Cliente);
      }
      this.loteEditForm.controls.cantidad.setValue(data.TotalSacos);
      if (data.Empaque) {
        this.loteEditForm.controls.unidadMedida.setValue(data.Empaque);
      }
      this.loteEditForm.controls.kilosNetos.setValue(data.PesoKilos);

      this.KilosNetos = data.PesoKilos;
      this.calculoKilosPendiente();
    }
    this.modalService.dismissAll();
  }

  calculoKilosPendiente() {
    if (this.loteEditForm.controls.idContrato.value != null) {
      this.loteEditForm.controls.kilosPendientes.setValue(this.KilosNetos - this.loteEditForm.controls.detalleLote.controls.totalKilosNetosPesado.value);
    }
  }

}
