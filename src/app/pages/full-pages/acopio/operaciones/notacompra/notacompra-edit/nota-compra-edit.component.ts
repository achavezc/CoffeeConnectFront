import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';

import { NotaCompraService } from '../../../../../../services/nota-compra.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';

@Component({
  selector: 'app-nota-compra-edit',
  templateUrl: './nota-compra-edit.component.html',
  styleUrls: ['./nota-compra-edit.component.scss']
})
export class NotaCompraEditComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private notaCompraService: NotaCompraService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private alertUtil: AlertUtil) { }

  notaCompraEditForm: any;
  listEstados: [];
  listTipos: [];
  listProductos: [];
  listSubTipos: [];
  listUnidadMedida: [];
  listMonedas: [];
  listTipoProduccion: [];
  selectedEstado: any;
  selectedTipo: any;
  selectedProducto: any;
  selectedSubTipo: any;
  selectedUnidadMedida: any;
  selectedMoneda: any;
  selectedProduccion: any;
  vId: number;
  vUserSession: any;
  vMensajeGenerico = "Ha ocurrido un error interno.";
  CodigoSubProducto = "";
  precioDia = 0;
  login: ILogin;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'];
    if (this.vId) {
      this.vId = parseInt(this.route.snapshot.params['id']);
      this.vUserSession = JSON.parse(localStorage.getItem('user'));
      this.LoadForm();
      this.SearchById();
    } else {
      this.router.navigate['/acopio/operaciones/notasdecompra-list'];
    }
  }

  LoadForm(): void {
    this.notaCompraEditForm = this.fb.group({
      idGuiaRecepcion: [],
      nombre: [],
      nroNotaCompra: [],
      direccion: [],
      fecha: [],
      ruc: [],
      estado: [],
      nombreProveedor: [],
      departamento: [],
      docIdentidad: [],
      provincia: [],
      tipo: [],
      distrito: [],
      codigo: [],
      zona: [],
      finca: [],
      tipoDP: [],
      fechaCosecha: [],
      subTipo: [],
      tipoProduccion: [],
      unidadMedida: [],
      exportableAT: [],
      cantidadPC: [],
      descarteAT: [],
      kilosBrutosPC: [],
      cascarillaAT: [],
      taraPC: [],
      totalAT: [],
      kilosNetosPC: [],
      dsctoHumedadPC: [],
      humedadAT: [],
      kilosNetosDescontarPC: [],
      kiloNetoPagarPC: [],
      monedaAT: [],
      qqKgPC: [],
      precioDiaAT: [],
      precioGuardadoAT: [],
      precioPagadoAT: [],
      importeAT: [],
      observacionNotaCompra: []
    });
  }

  async LoadCombos() {
    let res: any;
    res = await this.maestroService.obtenerMaestros('EstadoNotaCompra').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
    }
    res = await this.maestroService.obtenerMaestros('TipoProveedor').toPromise();
    if (res.Result.Success) {
      this.listTipos = res.Result.Data;
    }
    res = await this.maestroService.obtenerMaestros('Producto').toPromise();
    if (res.Result.Success) {
      this.listProductos = res.Result.Data;
    }
    res = await this.maestroService.obtenerMaestros('SubProducto').toPromise();
    if (res.Result.Success) {
      this.listSubTipos = res.Result.Data;
    }
    res = await this.maestroService.obtenerMaestros('TipoNotaCompra').toPromise();
    if (res.Result.Success) {

    }
    res = await this.maestroService.obtenerMaestros('UnidadMedida').toPromise();
    if (res.Result.Success) {
      this.listUnidadMedida = res.Result.Data;
    }
    res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMonedas = res.Result.Data;
    }
    res = await this.maestroService.obtenerMaestros('TipoProduccion').toPromise();
    if (res.Result.Success) {
      this.listTipoProduccion = res.Result.Data;
    }
  }

  SearchById(): void {
    this.spinner.show();
    this.notaCompraService.SearchById({ NotaCompraId: this.vId })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.AutocompleteForm(res.Result.Data);
        } else {
          this.spinner.hide();
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
      });
  }

  async cargarPrecioDia() {
    let res: any;
  
    var req = {
      SubProductoId: this.CodigoSubProducto,
      EmpresaId: this.login.Result.Data.EmpresaId
    }
    res = await this.maestroService.ConsultarProductoPrecioDia(req).toPromise();
    if (res.Result.Success) {
      if(res.Result.Data.length > 0){
        this.precioDia = res.Result.Data[0].PrecioDia;
      }
      
    }
    
  }

  async AutocompleteForm(data: any) {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.CodigoSubProducto = data.SubProductoId;
    await this.cargarPrecioDia();
    await this.LoadCombos();
    this.notaCompraEditForm.controls.idGuiaRecepcion.setValue(data.GuiaRecepcionMateriaPrimaId);
    this.notaCompraEditForm.controls.nombre.setValue(data.RazonSocial);
    this.notaCompraEditForm.controls.nroNotaCompra.setValue(data.Numero);
    this.notaCompraEditForm.controls.direccion.setValue(data.Direccion);
    if (data.FechaRegistro && data.FechaRegistro.substring(0, 10) != "0001-01-01") {
      this.notaCompraEditForm.controls.fecha.setValue(data.FechaRegistro.substring(0, 10));
    }
    this.notaCompraEditForm.controls.ruc.setValue(data.Ruc);
    if (data.EstadoId) {
      this.notaCompraEditForm.controls.estado.setValue(data.EstadoId);
    }
    this.notaCompraEditForm.controls.nombreProveedor.setValue(data.NombreRazonSocial);
    this.notaCompraEditForm.controls.departamento.setValue(data.Departamento);
    if (data.NumeroDocumento || data.TipoDocumento) {
      this.notaCompraEditForm.controls.docIdentidad.setValue(`${data.TipoDocumento} - ${data.NumeroDocumento}`);
    }
    this.notaCompraEditForm.controls.provincia.setValue(data.Provincia);
    this.notaCompraEditForm.controls.tipo.setValue(data.TipoId);
    this.notaCompraEditForm.controls.distrito.setValue(data.Distrito);
    this.notaCompraEditForm.controls.codigo.setValue(data.CodigoSocio);
    this.notaCompraEditForm.controls.zona.setValue(data.Zona);
    if (data.Finca) {
      this.notaCompraEditForm.controls.finca.setValue(data.Finca);
    }
    this.notaCompraEditForm.controls.tipoDP.setValue(data.ProductoId);
    if (data.FechaCosecha && data.FechaCosecha.substring(0, 10) != "0001-01-01") {
      this.notaCompraEditForm.controls.fechaCosecha.setValue(data.FechaCosecha.substring(0, 10));
    }
    this.notaCompraEditForm.controls.subTipo.setValue(data.SubProductoId);
    if (data.TipoProduccionId) {
      this.notaCompraEditForm.controls.tipoProduccion.setValue(data.TipoProduccionId);
    }
    this.notaCompraEditForm.controls.unidadMedida.setValue(data.UnidadMedidaIdPesado);
    this.notaCompraEditForm.controls.exportableAT.setValue(data.ExportableGramosAnalisisFisico);
    this.notaCompraEditForm.controls.cantidadPC.setValue(data.CantidadPesado);
    this.notaCompraEditForm.controls.descarteAT.setValue(data.DescarteGramosAnalisisFisico);
    this.notaCompraEditForm.controls.kilosBrutosPC.setValue(data.KilosBrutosPesado);
    this.notaCompraEditForm.controls.cascarillaAT.setValue(data.CascarillaGramosAnalisisFisico);
    this.notaCompraEditForm.controls.taraPC.setValue(data.TaraPesado);
    this.notaCompraEditForm.controls.totalAT.setValue(data.TotalGramosAnalisisFisico);
    this.notaCompraEditForm.controls.kilosNetosPC.setValue(data.KilosNetosPesado);
    this.notaCompraEditForm.controls.dsctoHumedadPC.setValue(data.DescuentoPorHumedad);
    this.notaCompraEditForm.controls.humedadAT.setValue(`${data.HumedadPorcentajeAnalisisFisico}%`);
    this.notaCompraEditForm.controls.kilosNetosDescontarPC.setValue(data.KilosNetosDescontar);
    this.notaCompraEditForm.controls.kiloNetoPagarPC.setValue(data.KilosNetosPagar);
    this.notaCompraEditForm.controls.monedaAT.setValue(data.MonedaId);
    this.notaCompraEditForm.controls.qqKgPC.setValue(data.QQ55);
    this.notaCompraEditForm.controls.precioGuardadoAT.setValue(data.PrecioGuardado);
    this.notaCompraEditForm.controls.precioPagadoAT.setValue(data.PrecioPagado);
    this.notaCompraEditForm.controls.importeAT.setValue(data.Importe);

    /*
    if (this.vUserSession && this.vUserSession.Result && this.vUserSession.Result.Data
      && this.vUserSession.Result.Data.ProductoPreciosDia && this.vUserSession.Result.Data.ProductoPreciosDia.length > 0) {
      const precioDia = this.vUserSession.Result.Data.ProductoPreciosDia
        .find((x: any) => x.ProductoId == data.ProductoId && x.SubProductoId == data.SubProductoId);
      if (precioDia) {
        this.notaCompraEditForm.controls.precioDiaAT.setValue(precioDia.PrecioDia);
        if (precioDia.PrecioDia > data.PrecioGuardado) {
          this.notaCompraEditForm.controls.precioPagadoAT.setValue(precioDia.PrecioDia);
        } else {
          this.notaCompraEditForm.controls.precioPagadoAT.setValue(data.PrecioGuardado);
        }
      }
    }
    */
    
    this.notaCompraEditForm.controls.precioDiaAT.setValue(this.precioDia);
    if (this.precioDia > data.PrecioGuardado) {
      this.notaCompraEditForm.controls.precioPagadoAT.setValue(this.precioDia);
    } else {
      this.notaCompraEditForm.controls.precioPagadoAT.setValue(data.PrecioGuardado);
    }
    

    this.notaCompraEditForm.controls.observacionNotaCompra.setValue(data.Observaciones);
    this.spinner.hide();
  }

  Liquidar(): void {
    if (this.selectedEstado == '01') {
      const form = this;
      swal.fire({
        title: 'Confirmación',
        text: `¿Estas seguro de liquidar la nota de compra?`,
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
          form.ProcesarLiquidacion();
        }
      });
    }
  }

  ProcesarLiquidacion(): void {
    this.spinner.show();
    const request = {
      NotaCompraId: this.vId,
      Usuario: this.vUserSession.Result.Data.NombreUsuario,
      MonedaId: this.notaCompraEditForm.value.monedaAT,
      PrecioPagado: this.notaCompraEditForm.value.precioPagadoAT,
      Importe: this.notaCompraEditForm.value.importeAT
    }

    this.notaCompraService.Liquidar(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("Correcto!", "Se ha liquidado de manera correcta!", () => {
            this.Cancel();
          });
        } else {
          this.alertUtil.alertError("Error!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("Error!", this.vMensajeGenerico);
      });
  }

  Print(): void {
    if (this.selectedEstado == '02') {
      let link = document.createElement('a');
      document.body.appendChild(link);
      link.href = `${host}NotaCompra/GenerarPDF?id=${this.notaCompraEditForm.value.idGuiaRecepcion}`;
      link.download = "NotaCompra.pdf"
      link.target = "_blank";
      link.click();
      link.remove();
    }
  }

  Cancel(): void {
    this.router.navigate(['/acopio/operaciones/notasdecompra-list']);
  }

}
