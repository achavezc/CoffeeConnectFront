import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';

import { DateUtil } from '../../../../../../services/util/date-util';
import { LoteService } from '../../../../../../services/lote.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { host } from '../../../../../../shared/hosts/main.host';

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
    private dateUtil: DateUtil) { }

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

  ngOnInit(): void {
    this.vId = parseInt(this.route.snapshot.params['id']);
    if (this.vId && this.vId > 0) {
      this.LoadForm();
      // this.LoadCombos();
      this.SearchById();
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
      certificacion: [],
      almacen: ['', [Validators.required]],
      totalPesoNeto: [],
      promedioRendimiento: [],
      promedioHumedad: [],
      promedioPuntajeFinal: []
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
          res.Result.Data.forEach((x: any) => {
            x.FechaIngresoAlmacenString = this.dateUtil.formatDate(new Date(x.FechaIngresoAlmacen))
          });
          this.tempRows = res.Result.Data;
          this.rows = [...this.tempRows];
          this.AutocompleteForm(res);
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
    this.loteEditForm.controls.certificacion.setValue(row.Certificacion);
    this.loteEditForm.controls.producto.setValue(row.Producto);
    this.loteEditForm.controls.subproducto.setValue(row.SubProducto);
    if (row.AlmacenId && this.listAlmacenes.find(x => x.Codigo == row.AlmacenId)) {
      this.loteEditForm.controls.almacen.setValue(row.AlmacenId);
    }
    if (row.TotalKilosNetosPesado) {
      this.loteEditForm.controls.totalPesoNeto.setValue(row.TotalKilosNetosPesado);
    }
    if (row.PromedioRendimientoPorcentaje) {
      this.loteEditForm.controls.promedioRendimiento.setValue(row.PromedioRendimientoPorcentaje);
    }
    if (row.PromedioHumedadPorcentaje) {
      this.loteEditForm.controls.promedioHumedad.setValue(row.PromedioHumedadPorcentaje);
    }
    if (row.PromedioTotalAnalisisSensorial) {
      this.loteEditForm.controls.promedioPuntajeFinal.setValue(row.PromedioTotalAnalisisSensorial);
    }
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
    const request = {
      LoteId: this.vId,
      AlmacenId: this.selectedAlmacen,
      Usuario: 'mruizb'
    }
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
        // link.download = `EtiquetasLotes_${vDate}.pdf`
        link.target = "_blank";
        link.click();
        link.remove();
      }
    });
  }

  Cancel(): void {
    this.router.navigate(['/acopio/operaciones/lotes-list']);
  }
}
