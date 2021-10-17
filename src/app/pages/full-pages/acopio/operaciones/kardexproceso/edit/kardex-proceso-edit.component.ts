import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators , FormControl} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from '@swimlane/ngx-datatable';

import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { OrdenProcesoService } from '../../../../../../services/orden-proceso.service';
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';

@Component({
  selector: 'app-kardex-proceso-edit',
  templateUrl: './kardex-proceso-edit.component.html',
  styleUrls: ['./kardex-proceso-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class KardexProcesoEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private ordenProcesoService: OrdenProcesoService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil) { }

  kardexProcesoEditForm: FormGroup;
  codeProcessOrder: Number;
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  rowsDetails = [];
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  isLoading = false;
  fileName = "";
  listaCertificado = [];
  listaPlantaProceso = [];
  listaTipoDocumento = [];
  listaTipoOperacion = [];
  listaCalidad = [];
  selectedCertificado: any;
  selectedPlantaProceso: any;
  selectedTipoOperacion: any;
  selectedTipoDocumento: any;
  selectedCalidad: any;
  submittedEdit = false;
  login: ILogin;
  esEdit: true;
  estado: any;
  fechaRegistro: any;
  numero: any = "";
  
  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.codeProcessOrder = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    this.LoadForm();
    this.LoadCombos();
    if (this.codeProcessOrder <= 0) {
      this.kardexProcesoEditForm.controls.fechaCabe.setValue(this.dateUtil.currentDate());
      this.kardexProcesoEditForm.controls.fecFinProcesoPlanta.setValue(this.dateUtil.currentDate());
      // this.addRowDetail();
    } else if (this.codeProcessOrder > 0) {
      this.SearchByid();
    }
  }

  LoadForm(): void {
    this.kardexProcesoEditForm = this.fb.group({
      certificado: new FormControl('', []),
      fechaRegistro: new FormControl('', [Validators.required]),
      plantaProceso: new FormControl('', [Validators.required]),
      tipoDocumento: new FormControl('', []),
      tipoOperacion: new FormControl('', [Validators.required]),
      nroComprobanteInterno: new FormControl('', []),
      nroGuiaRemision: new FormControl('', []),
      nroContrato: new FormControl('', []),
      codCliente:new FormControl('', [Validators.required]),
      cliente: new FormControl('', [Validators.required]),
      fechaFactura: new FormControl('', []),
      nroFactura: new FormControl('', []),
      kgIngresados: new FormControl('', []),
      nroSacosIngresados: new FormControl('', []),
      qqIngresados: new FormControl('', []),
      precioUnitarioCp: new FormControl('', []),
      totalCp: new FormControl('', []),
      nroSacosDespachados: new FormControl('', []),
      kgDespachados: new FormControl('', []),
      qqDespachados: new FormControl('', []),
      precioUnitario: new FormControl('', []),
      totalVenta: new FormControl('', []),
      calidad: new FormControl('', [])
      
    });
  }

  get f() {
    return this.kardexProcesoEditForm.controls;
  }

  LoadCombos() {
    this.GetPlantaProceso();
    this.GetTipoOperacion();
    this.GetTipoDocumentoInterno();
    this.GetCertificado();
    this.GetCalidad();
}
  async GetPlantaProceso() {
    const res = await this.maestroService.obtenerMaestros('PlantaProcesoAlmacenKardexProceso').toPromise();
    if (res.Result.Success) {
     this.listaPlantaProceso = res.Result.Data;
    }

  }
  async GetTipoOperacion() {
    const res = await this.maestroService.obtenerMaestros('TipoOperacionKardexProceso').toPromise();
    if (res.Result.Success) {
      this.listaTipoOperacion = res.Result.Data;
    }
  }
  async GetTipoDocumentoInterno() {
    const res = await this.maestroService.obtenerMaestros('TipoDocumentoInternoKardexProceso').toPromise();
    if (res.Result.Success) {
      this.listaTipoDocumento = res.Result.Data;
    }
  }
  async GetCertificado() {
    const res = await this.maestroService.obtenerMaestros('Certificado').toPromise();
    if (res.Result.Success) {
      this.listaCertificado = res.Result.Data;
    }
  }
  async GetCalidad() {
    const res = await this.maestroService.obtenerMaestros('Calidad').toPromise();
    if (res.Result.Success) {
      this.listaCalidad = res.Result.Data;
    }
  }
  GetDataModal(event: any): void {
    const obj = event[0];
    if (obj) {
      this.AutocompleteDataContrato(obj);
    }
    this.modalService.dismissAll();
  }
  
  async AutocompleteDataContrato(obj: any) {
    this.LoadCombos();
    let empaque_Tipo = '';
    if (obj.ContratoId)
      this.kardexProcesoEditForm.controls.idContrato.setValue(obj.ContratoId);

    if (obj.Numero)
      this.kardexProcesoEditForm.controls.nroContrato.setValue(obj.Numero);

    if (obj.ClienteId)
      this.kardexProcesoEditForm.controls.idCliente.setValue(obj.ClienteId);

    if (obj.NumeroCliente)
      this.kardexProcesoEditForm.controls.codCliente.setValue(obj.NumeroCliente);

    if (obj.Cliente)
      this.kardexProcesoEditForm.controls.cliente.setValue(obj.Cliente);

    if (obj.TipoProduccion)
      this.kardexProcesoEditForm.controls.tipoProduccion.setValue(obj.TipoProduccion);

    if (obj.TipoCertificacionId)
     // await this.GetCertificacion();
      //this.kardexProcesoEditForm.controls.certificacion.setValue(obj.TipoCertificacion);
      this.kardexProcesoEditForm.controls.certificacion.setValue(obj.TipoCertificacionId.split('|').map(String));

    if (obj.Empaque)
      empaque_Tipo = obj.Empaque;
    if (empaque_Tipo)
      empaque_Tipo = empaque_Tipo + ' - '
    if (obj.TipoEmpaque)
      empaque_Tipo = empaque_Tipo + obj.TipoEmpaque;
    if (empaque_Tipo)
      this.kardexProcesoEditForm.controls.empaqueTipo.setValue(empaque_Tipo);

    if (obj.TotalSacos)
      this.kardexProcesoEditForm.controls.cantidad.setValue(obj.TotalSacos);

    if (obj.PesoPorSaco)
      this.kardexProcesoEditForm.controls.pesoSacoKG.setValue(obj.PesoPorSaco);

    if (obj.PesoKilos)
      this.kardexProcesoEditForm.controls.totalKilosNetos.setValue(obj.PesoKilos);

      if (obj.CantidadContenedores)
      this.kardexProcesoEditForm.controls.cantContenedores.setValue(obj.CantidadContenedores);

    if (obj.Producto)
      this.kardexProcesoEditForm.controls.producto.setValue(obj.Producto);

    if (obj.SubProducto)
      this.kardexProcesoEditForm.controls.subProducto.setValue(obj.SubProducto);

    if (obj.Calidad)
      this.kardexProcesoEditForm.controls.calidad.setValue(obj.Calidad);

    if (obj.Grado)
      this.kardexProcesoEditForm.controls.grado.setValue(obj.Grado);

    if (obj.PreparacionCantidadDefectos)
      this.kardexProcesoEditForm.controls.cantidadDefectos.setValue(obj.PreparacionCantidadDefectos);
  }

  GetDataEmpresa(event: any): void {
    const obj = event[0];
    if (obj) {
      this.kardexProcesoEditForm.controls.idDestino.setValue(obj.EmpresaProveedoraAcreedoraId);
      this.kardexProcesoEditForm.controls.destino.setValue(`${obj.Direccion} - ${obj.Distrito} - ${obj.Provincia} - ${obj.Departamento}`);
    }
    this.modalService.dismissAll();
  }

  openModal(modalEmpresa: any): void {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  GetRequest(): any {
    const form = this.kardexProcesoEditForm.value;
    if (this.codeProcessOrder > 0) {
      this.rowsDetails.forEach(x => { x.OrdenProcesoId = this.codeProcessOrder; })
    }
    const request = {
      OrdenProcesoId: form.idOrdenProceso ? form.idOrdenProceso : 0,
      EmpresaId: this.login.Result.Data.EmpresaId,
      EmpresaProcesadoraId: form.idDestino ? form.idDestino : 0,
      TipoProcesoId: form.tipoProceso ? form.tipoProceso : '',
      ContratoId: form.idContrato ? form.idContrato : 0,
      Numero: form.nroOrden ? form.nroOrden : '',
      Observacion: form.observaciones ? form.observaciones : '',
      RendimientoEsperadoPorcentaje: form.porcenRendimiento ? form.porcenRendimiento : 0,
      FechaFinProceso: form.fecFinProcesoPlanta ? form.fecFinProcesoPlanta : '',
      CantidadContenedores: form.cantContenedores ? form.cantContenedores : 0,
      EstadoId: '01',
      UsuarioRegistro: this.login.Result.Data.NombreUsuario,
      OrdenProcesoDetalle: this.rowsDetails.filter(x => x.NroNotaIngresoPlanta
        && x.FechaNotaIngresoPlanta && x.RendimientoPorcentaje
        && x.HumedadPorcentaje && x.CantidadSacos && x.KilosBrutos
        && x.Tara && x.KilosNetos),
      NombreArchivo: form.fileName ? form.fileName : '',
      PathArchivo: form.pathFile ? form.pathFile : ''
    }
    return request;
  }

  Save(): void {
    if (!this.kardexProcesoEditForm.invalid) {
      if (this.ValidateDataDetails() <= 0) {
        const form = this;
        if (this.codeProcessOrder <= 0) {
          this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con el registro?.` , function (result) {
            if (result.isConfirmed) {
              form.Create();
            }
          });

        } else if (this.codeProcessOrder > 0) {

          this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la actualización?.` , function (result) {
            if (result.isConfirmed) {
              form.Update();
            }
          });
        }
      } else {
        this.alertUtil.alertWarning('ADVERTENCIA!', 'No pueden existir datos vacios en el detalle, por favor corregir.');
      }
    }
  }

  Create(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    const request = this.GetRequest();
    const file = this.kardexProcesoEditForm.value.file;
    this.ordenProcesoService.Create(file, request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback('CONFIRMACIÓN!', 'Se registro exitosamente.', () => {
          this.Cancel();
        });
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });
  }

  Update(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    const request = this.GetRequest();
    const file = this.kardexProcesoEditForm.value.file;
    this.ordenProcesoService.Update(file, request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback('CONFIRMACIÓN!', 'Se actualizo exitosamente.', () => {
          this.Cancel();
        });
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });
  }

  fileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.kardexProcesoEditForm.patchValue({ file: file });
    }
    this.kardexProcesoEditForm.get('file').updateValueAndValidity();
  }

  SearchByid(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.ordenProcesoService.SearchById(this.codeProcessOrder).subscribe((res) => {
      if (res.Result.Success) {
        this.AutocompleteFormEdit(res.Result.Data);
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });
  }

  async AutocompleteFormEdit(data: any) {
    if (data) {
      let empaque_tipo = '';
      if (data.OrdenProcesoId)
        this.kardexProcesoEditForm.controls.idOrdenProceso.setValue(data.OrdenProcesoId);
      if (data.Numero)
        this.kardexProcesoEditForm.controls.nroOrden.setValue(data.Numero);
      if (data.FechaRegistro)
        this.kardexProcesoEditForm.controls.fechaCabe.setValue(data.FechaRegistro.substring(0, 10));
      if (data.ContratoId)
        this.kardexProcesoEditForm.controls.idContrato.setValue(data.ContratoId);
      if (data.NumeroContrato)
        this.kardexProcesoEditForm.controls.nroContrato.setValue(data.NumeroContrato);
      if (data.ClienteId)
        this.kardexProcesoEditForm.controls.idCliente.setValue(data.ClienteId);
      if (data.NumeroCliente)
        this.kardexProcesoEditForm.controls.codCliente.setValue(data.NumeroCliente);
      if (data.RazonSocialCliente)
        this.kardexProcesoEditForm.controls.cliente.setValue(data.RazonSocialCliente);
      if (data.EmpresaProcesadoraId)
        this.kardexProcesoEditForm.controls.idDestino.setValue(data.EmpresaProcesadoraId);
      if (data.Direccion)
        this.kardexProcesoEditForm.controls.destino.setValue(data.Direccion);
      if (data.TipoProduccion)
        this.kardexProcesoEditForm.controls.tipoProduccion.setValue(data.TipoProduccion);
      if (data.TipoCertificacionId)
       // await this.GetCertificacion();
        //this.kardexProcesoEditForm.controls.certificacion.setValue(obj.TipoCertificacion);
        this.kardexProcesoEditForm.controls.certificacion.setValue(data.TipoCertificacionId.split('|').map(String));
      if (data.FechaFinProceso)
        this.kardexProcesoEditForm.controls.fecFinProcesoPlanta.setValue(data.FechaFinProceso.substring(0, 10));
      if (data.TipoProcesoId) {
        //await this.GetTipoProcesos();
        this.kardexProcesoEditForm.controls.tipoProceso.setValue(data.TipoProcesoId);
      }
      if (data.RendimientoEsperadoPorcentaje)
        this.kardexProcesoEditForm.controls.porcenRendimiento.setValue(data.RendimientoEsperadoPorcentaje);
      if (data.Empaque)
        empaque_tipo = data.Empaque;
      if (empaque_tipo)
        empaque_tipo = empaque_tipo + ' - '
      if (data.TipoEmpaque)
        empaque_tipo = empaque_tipo + data.TipoEmpaque
      if (empaque_tipo)
        this.kardexProcesoEditForm.controls.empaqueTipo.setValue(empaque_tipo);
      if (data.TotalSacos)
        this.kardexProcesoEditForm.controls.cantidad.setValue(data.TotalSacos);
      if (data.PesoPorSaco)
        this.kardexProcesoEditForm.controls.pesoSacoKG.setValue(data.PesoPorSaco);
      if (data.PesoKilos)
        this.kardexProcesoEditForm.controls.totalKilosNetos.setValue(data.PesoKilos);
      if (data.CantidadContenedores)
        this.kardexProcesoEditForm.controls.cantContenedores.setValue(data.CantidadContenedores);
      if (data.Producto)
        this.kardexProcesoEditForm.controls.producto.setValue(data.Producto);
      if (data.SubProducto)
        this.kardexProcesoEditForm.controls.subProducto.setValue(data.SubProducto);
      if (data.Calidad)
        this.kardexProcesoEditForm.controls.calidad.setValue(data.Calidad);
      if (data.Grado)
        this.kardexProcesoEditForm.controls.grado.setValue(data.Grado);
      if (data.PreparacionCantidadDefectos)
        this.kardexProcesoEditForm.controls.cantidadDefectos.setValue(data.PreparacionCantidadDefectos);
      if (data.Observacion)
        this.kardexProcesoEditForm.controls.observaciones.setValue(data.Observacion);
      data.detalle.forEach(x => x.FechaNotaIngresoPlanta = x.FechaNotaIngresoPlanta.substring(0, 10));
      if (data.NombreArchivo) {
        this.fileName = data.NombreArchivo;
        this.kardexProcesoEditForm.controls.fileName.setValue(data.NombreArchivo);
      }
      if (data.PathArchivo)
        this.kardexProcesoEditForm.controls.pathFile.setValue(data.PathArchivo);
      this.rowsDetails = data.detalle;
    }
    this.spinner.hide();
  }

  addRowDetail(): void {
    this.rowsDetails = [...this.rowsDetails, {
      OrdenProcesoId: 0,
      OrdenProcesoDetalleId: 0,
      NroNotaIngresoPlanta: '',
      FechaNotaIngresoPlanta: '',
      RendimientoPorcentaje: 0,
      HumedadPorcentaje: 0,
      CantidadSacos: 0,
      KilosBrutos: 0,
      Tara: 0,
      KilosNetos: 0
    }];
  }

  DeleteRowDetail(index: any): void {
    this.rowsDetails.splice(index, 1);
    this.rowsDetails = [...this.rowsDetails];
  }

  UpdateValuesGridDetails(event: any, index: any, prop: any): void {
    if (prop === 'nroNotaIP')
      this.rowsDetails[index].NroNotaIngresoPlanta = event.target.value;
    else if (prop === 'fecNotaIP')
      this.rowsDetails[index].FechaNotaIngresoPlanta = event.target.value;
    else if (prop === 'rendimiento')
      this.rowsDetails[index].RendimientoPorcentaje = parseFloat(event.target.value)
    else if (prop === 'humedad')
      this.rowsDetails[index].HumedadPorcentaje = parseFloat(event.target.value)
    else if (prop === 'cantSacos')
      this.rowsDetails[index].CantidadSacos = parseFloat(event.target.value)
    else if (prop === 'klBrutos')
      this.rowsDetails[index].KilosBrutos = parseFloat(event.target.value)
    else if (prop === 'tara')
      this.rowsDetails[index].Tara = parseFloat(event.target.value)
    else if (prop === 'klNetos')
      this.rowsDetails[index].KilosNetos = parseFloat(event.target.value)
  }

  Print(): void {
    const form = this;
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de continuar con impresión?.`,
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
        let link = document.createElement('a');
        document.body.appendChild(link);
        link.href = `${host}OrdenProceso/Imprimir?id=${form.codeProcessOrder}`;
        link.target = "_blank";
        link.click();
        link.remove();
      }
    });
  }

  Descargar(): void {
    const rutaFile = this.kardexProcesoEditForm.value.pathFile;
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}OrdenProceso/DescargarArchivo?path=${rutaFile}`;
    link.target = "_blank";
    link.click();
    link.remove();
  }

  ValidateDataDetails(): number {
    let result = [];
    result = this.rowsDetails.filter(x => !x.NroNotaIngresoPlanta
      || !x.FechaNotaIngresoPlanta || !x.RendimientoPorcentaje
      || !x.HumedadPorcentaje || !x.CantidadSacos || !x.KilosBrutos
      || !x.Tara || !x.KilosNetos)

    return result.length;
  }

  Cancel(): void {
    this.router.navigate(['/exportador/operaciones/ordenproceso/list']);
  }
}
