
import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, ControlContainer } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { OrdenProcesoService } from '../../../../../../services/orden-proceso.service';
import { EmpresaService } from '../../../../../../services/empresa.service';
import { ContratoService } from '../../../../../../services/contrato.service';
import { host } from '../../../../../../shared/hosts/main.host';

@Component({
  selector: 'app-ordenproceso-edit',
  templateUrl: './ordenproceso-edit.component.html',
  styleUrls: ['./ordenproceso-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrdenProcesoEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private ordenProcesoService: OrdenProcesoService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private empresaService: EmpresaService,
    private contratoService: ContratoService) { }


  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  ordenProcesoEditForm: FormGroup;
  listEstado = [];
  listTipoProcesos = [];
  listTipoProduccion = [];
  listCertificacion = [];
  listProducto = [];
  listCertificadora= [];
  listSubProducto = [];
  listEmpaque = [];
  listTipo = [];
  listProductoTerminado = [];
  listSubProductoTerminado  = [];
  listCalidad = [];
  listGrado = [];
  selectedGrado : any;
  selectedCalidad : any;
  selectedProductoTerminado : any;
  selectedSubProductoTerminado : any;
  selectedTipo : any;
  selectedEmpaque : any;
  selectedSubProducto : any;
  selectedCertificadora: any;
  selectedProducto : any;
  selectedTipoProduccion: any;
  selectedCertificacion: any;
  selectedEstado: any;
  selectedTipoProceso: any;
  userSession: any;
  codeProcessOrder: Number;
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  rowsDetails = [];
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  @ViewChild(DatatableComponent) tableLotesDetalle: DatatableComponent;
  isLoading = false;
  fileName = "";
  popUp = true;
  public rowsLotesDetalle = [];
  selectLoteDetalle = [];
  public ColumnMode = ColumnMode;
  listaNotaIngreso = [];
  private tempDataLoteDetalle = [];
  filtrosLotesID: any = {};



  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.codeProcessOrder = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    this.LoadForm();
    this.ordenProcesoEditForm.controls.razonSocialCabe.setValue(this.userSession.Result.Data.RazonSocialEmpresa);
    this.ordenProcesoEditForm.controls.direccionCabe.setValue(this.userSession.Result.Data.DireccionEmpresa);
    this.ordenProcesoEditForm.controls.nroRucCabe.setValue(this.userSession.Result.Data.RucEmpresa);
    this.ordenProcesoEditForm.controls.responsableComercial.setValue(this.userSession.Result.Data.NombreCompletoUsuario);
    this.GetTipoProcesos();
    this.GetEstado();
    this.GetTipoProduccion();
    this.GetCertificacion();
    this.GetProducto();
    this.GetCertificadora();
    this.GetEmpaque();
    this.GetTipo();
    this.GetProductoTerminado();
    this.GetCalidad();
    this.GetGrado();
    if (this.codeProcessOrder <= 0) {
      this.ordenProcesoEditForm.controls.fechaCabe.setValue(this.dateUtil.currentDate());
      this.ordenProcesoEditForm.controls.fecFinProcesoPlanta.setValue(this.dateUtil.currentDate());
      this.addRowDetail();
    } else if (this.codeProcessOrder > 0) {
      this.SearchByid();
    }
  }

  agregarOrdenProceso(e) {
    this.ordenProcesoEditForm.controls.ordenProcesoComercial.setValue(e[0].Numero);
    this.ordenProcesoEditForm.controls.idOrdenProcesoComercial.setValue(e[0].OrdenProcesoId);
    this.modalService.dismissAll();     
  }
  LoadForm(): void {
    this.ordenProcesoEditForm = this.fb.group({
      idOrdenProceso: [],
      razonSocialCabe: [, Validators.required],
      nroOrden: [],
      direccionCabe: [, Validators.required],
      fechaCabe: [, Validators.required],
      nroRucCabe: [, Validators.required],
      idContrato: [, Validators.required],
      nroContrato: [, Validators.required],
      idCliente: [, Validators.required],
      codCliente: [, Validators.required],
      cliente: [, Validators.required],
      idDestino: [, Validators.required],
      destino: [, Validators.required],
      fecFinProcesoPlanta: [],
      tipoProduccion: [],
      certificacion: [],
      porcenRendimiento: [, Validators.required],
      producto: [],
      cantidad: [],
      calidad: [],
      grado: [],
      cantidadDefectos: [],
      cantidadContenedores: [, Validators.required],
      responsableComercial: [],
      file: [],
      tipoProceso: [, Validators.required],
      subProducto: [],
      observaciones: [],
      pathFile: [],
      estado: [],
      ordenProcesoComercial: [],
      idOrdenProcesoComercial: [],
      codigoOrganizacion: [],
      nombreOrganizacion:[],
      certificadora: [],
      empaque: [],
      tipo: [],
      productoTerminando: [],
      subProductoTerminado: [],
      pesoSaco : [],
      totalKilosBrutos: [],
      fechaInicio: [],
      fechaFin: []

    });
  }

  get f() {
    return this.ordenProcesoEditForm.controls;
  }

  async GetTipoProcesos() {
    const res = await this.maestroService.obtenerMaestros('TipoProceso').toPromise();
    if (res.Result.Success) {
      this.listTipoProcesos = res.Result.Data;
    }
  }
  async GetEstado() {
    const res = await this.maestroService.obtenerMaestros('EstadoOrdenProceso').toPromise();
    if (res.Result.Success) {
      this.listEstado = res.Result.Data;
    }
  }

  async GetTipoProduccion() {
    const res = await this.maestroService.obtenerMaestros('TipoProduccionPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoProduccion = res.Result.Data;
    }
  }
  async GetCertificacion() {
    const res = await this.maestroService.obtenerMaestros('TipoCertificacionPlanta').toPromise();
    if (res.Result.Success) {
      this.listCertificacion= res.Result.Data;
    }
  }
  async GetProducto() {
    const res = await this.maestroService.obtenerMaestros('ProductoPlanta').toPromise();
    if (res.Result.Success) {
      this.listProducto= res.Result.Data;
    }
  }
  async GetCertificadora() {
    const res = await this.maestroService.obtenerMaestros('EntidadCertificadoraPlanta').toPromise();
    if (res.Result.Success) {
      this.listCertificadora= res.Result.Data;
    }
  }

  async GetEmpaque() {
    const res = await this.maestroService.obtenerMaestros('Empaque').toPromise();
    if (res.Result.Success) {
      this.listEmpaque= res.Result.Data;
    }
  }
  async GetTipo() {
    const res = await this.maestroService.obtenerMaestros('TipoEmpaque').toPromise();
    if (res.Result.Success) {
      this.listTipo= res.Result.Data;
    }
  }
  async GetCalidad() {
    const res = await this.maestroService.obtenerMaestros('Calidad').toPromise();
    if (res.Result.Success) {
      this.listCalidad= res.Result.Data;
    }
  }
  async GetGrado() {
    const res = await this.maestroService.obtenerMaestros('Grado').toPromise();
    if (res.Result.Success) {
      this.listGrado= res.Result.Data;
    }
  }
  async GetProductoTerminado() {
    const res = await this.maestroService.obtenerMaestros('ProductoPlanta').toPromise();
    if (res.Result.Success) {
      this.listProductoTerminado= res.Result.Data;
    }
  }
  async cargarSubProductoTerminado(codigo: any) {
    var data = await this.maestroService.obtenerMaestros("SubProductoPlanta").toPromise();
    if (data.Result.Success) {
      this.listSubProductoTerminado = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }
  }
  changeSubProductoTerminado(e) {
    let filterProducto = e.Codigo;
    this.cargarSubProductoTerminado(filterProducto);
  }
  changeSubProducto(e) {
    let filterProducto = e.Codigo;
    this.cargarSubProducto(filterProducto);
  }
  async cargarSubProducto(codigo: any) {
    var data = await this.maestroService.obtenerMaestros("SubProductoPlanta").toPromise();
    if (data.Result.Success) {
      this.listSubProducto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }
  }

  GetDataModal(event: any): void {
    /*
    const obj = event[0];
    if (obj) {
      this.AutocompleteDataContrato(obj);
    }
    */
    this.modalService.dismissAll();
  }

  async AutocompleteDataContrato(obj: any) {
    let empaque_Tipo = '';
    if (obj.ContratoId)
      this.ordenProcesoEditForm.controls.idContrato.setValue(obj.ContratoId);

    if (obj.Numero)
      this.ordenProcesoEditForm.controls.nroContrato.setValue(obj.Numero);

    if (obj.ClienteId)
      this.ordenProcesoEditForm.controls.idCliente.setValue(obj.ClienteId);

    if (obj.NumeroCliente)
      this.ordenProcesoEditForm.controls.codCliente.setValue(obj.NumeroCliente);

    if (obj.Cliente)
      this.ordenProcesoEditForm.controls.cliente.setValue(obj.Cliente);

    if (obj.TipoProduccion)
      this.ordenProcesoEditForm.controls.tipoProduccion.setValue(obj.TipoProduccion);

    if (obj.TipoCertificacion)
      this.ordenProcesoEditForm.controls.certificacion.setValue(obj.TipoCertificacion);

    if (obj.Empaque)
      empaque_Tipo = obj.Empaque;
    if (empaque_Tipo)
      empaque_Tipo = empaque_Tipo + ' - '
    if (obj.TipoEmpaque)
      empaque_Tipo = empaque_Tipo + obj.TipoEmpaque;
    if (empaque_Tipo)
      this.ordenProcesoEditForm.controls.empaqueTipo.setValue(empaque_Tipo);

    if (obj.TotalSacos)
      this.ordenProcesoEditForm.controls.cantidad.setValue(obj.TotalSacos);

    if (obj.PesoPorSaco)
      this.ordenProcesoEditForm.controls.pesoSacoKG.setValue(obj.PesoPorSaco);

    if (obj.PesoKilos)
      this.ordenProcesoEditForm.controls.totalKilosNetos.setValue(obj.PesoKilos);

    if (obj.Producto)
      this.ordenProcesoEditForm.controls.producto.setValue(obj.Producto);

    if (obj.SubProducto)
      this.ordenProcesoEditForm.controls.subProducto.setValue(obj.SubProducto);

    if (obj.Calidad)
      this.ordenProcesoEditForm.controls.calidad.setValue(obj.Calidad);

    if (obj.Grado)
      this.ordenProcesoEditForm.controls.grado.setValue(obj.Grado);

    if (obj.PreparacionCantidadDefectos)
      this.ordenProcesoEditForm.controls.cantidadDefectos.setValue(obj.PreparacionCantidadDefectos);
  }

  GetDataEmpresa(event: any): void {
    const obj = event[0];
    if (obj) {
      this.ordenProcesoEditForm.controls.codigoOrganizacion.setValue(obj.Codigo);
      this.ordenProcesoEditForm.controls.nombreOrganizacion.setValue(obj.RazonSocial);
    }
    this.modalService.dismissAll();
  }

  openModal(modal: any): void {
    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl' });    
    //this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  GetRequest(): any {
    const form = this.ordenProcesoEditForm.value;
    if (this.codeProcessOrder > 0) {
      this.rowsDetails.forEach(x => { x.OrdenProcesoId = this.codeProcessOrder; })
    }
    const request = {
      OrdenProcesoId: form.idOrdenProceso ? form.idOrdenProceso : 0,
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      EmpresaProcesadoraId: form.idDestino ? form.idDestino : 0,
      TipoProcesoId: form.tipoProceso ? form.tipoProceso : '',
      ContratoId: form.idContrato ? form.idContrato : 0,
      Numero: form.nroOrden ? form.nroOrden : '',
      Observacion: form.observaciones ? form.observaciones : '',
      RendimientoEsperadoPorcentaje: form.porcenRendimiento ? form.porcenRendimiento : 0,
      FechaFinProceso: form.fecFinProcesoPlanta ? form.fecFinProcesoPlanta : '',
      CantidadContenedores: form.cantContenedores ? form.cantContenedores : 0,
      EstadoId: '01',
      UsuarioRegistro: this.userSession.Result.Data.NombreUsuario,
      OrdenProcesoDetalle: this.rowsDetails.filter(x => x.NroNotaIngresoPlanta
        && x.FechaNotaIngresoPlanta && x.RendimientoPorcentaje
        && x.HumedadPorcentaje && x.CantidadSacos && x.KilosBrutos
        && x.Tara && x.KilosNetos)
    }
    return request;
  }

  Save(): void {
    if (!this.ordenProcesoEditForm.invalid) {
      if (this.ValidateDataDetails() <= 0) {
        const form = this;
        if (this.codeProcessOrder <= 0) {
          swal.fire({
            title: 'Confirmación',
            text: `¿Está seguro de continuar con el registro?.`,
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
        } else if (this.codeProcessOrder > 0) {
          swal.fire({
            title: 'Confirmación',
            text: `¿Está seguro de continuar con la actualización?.`,
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
    const file = this.ordenProcesoEditForm.value.file;
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
    const file = this.ordenProcesoEditForm.value.file;
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
      this.ordenProcesoEditForm.patchValue({ file: file });
    }
    this.ordenProcesoEditForm.get('file').updateValueAndValidity();
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
        this.ordenProcesoEditForm.controls.idOrdenProceso.setValue(data.OrdenProcesoId);
      if (data.Numero)
        this.ordenProcesoEditForm.controls.nroOrden.setValue(data.Numero);
      if (data.FechaRegistro)
        this.ordenProcesoEditForm.controls.fechaCabe.setValue(data.FechaRegistro.substring(0, 10));
      if (data.ContratoId)
        this.ordenProcesoEditForm.controls.idContrato.setValue(data.ContratoId);
      if (data.NumeroContrato)
        this.ordenProcesoEditForm.controls.nroContrato.setValue(data.NumeroContrato);
      if (data.ClienteId)
        this.ordenProcesoEditForm.controls.idCliente.setValue(data.ClienteId);
      if (data.NumeroCliente)
        this.ordenProcesoEditForm.controls.codCliente.setValue(data.NumeroCliente);
      if (data.RazonSocialCliente)
        this.ordenProcesoEditForm.controls.cliente.setValue(data.RazonSocialCliente);
      if (data.EmpresaProcesadoraId)
        this.ordenProcesoEditForm.controls.idDestino.setValue(data.EmpresaProcesadoraId);
      if (data.Direccion)
        this.ordenProcesoEditForm.controls.destino.setValue(data.Direccion);
      if (data.TipoProduccion)
        this.ordenProcesoEditForm.controls.tipoProduccion.setValue(data.TipoProduccion);
      if (data.Certificacion)
        this.ordenProcesoEditForm.controls.certificacion.setValue(data.Certificacion);
      if (data.FechaFinProceso)
        this.ordenProcesoEditForm.controls.fecFinProcesoPlanta.setValue(data.FechaFinProceso.substring(0, 10));
      if (data.TipoProcesoId) {
        await this.GetTipoProcesos();
        this.ordenProcesoEditForm.controls.tipoProceso.setValue(data.TipoProcesoId);
      }
      if (data.RendimientoEsperadoPorcentaje)
        this.ordenProcesoEditForm.controls.porcenRendimiento.setValue(data.RendimientoEsperadoPorcentaje);
      if (data.Empaque)
        empaque_tipo = data.Empaque;
      if (empaque_tipo)
        empaque_tipo = empaque_tipo + ' - '
      if (data.TipoEmpaque)
        empaque_tipo = empaque_tipo + data.TipoEmpaque
      if (empaque_tipo)
        this.ordenProcesoEditForm.controls.empaqueTipo.setValue(empaque_tipo);
      if (data.TotalSacos)
        this.ordenProcesoEditForm.controls.cantidad.setValue(data.TotalSacos);
      if (data.PesoPorSaco)
        this.ordenProcesoEditForm.controls.pesoSacoKG.setValue(data.PesoPorSaco);
      if (data.PesoKilos)
        this.ordenProcesoEditForm.controls.totalKilosNetos.setValue(data.PesoKilos);
      if (data.CantidadContenedores)
        this.ordenProcesoEditForm.controls.cantContenedores.setValue(data.CantidadContenedores);
      if (data.Producto)
        this.ordenProcesoEditForm.controls.producto.setValue(data.Producto);
      if (data.SubProducto)
        this.ordenProcesoEditForm.controls.subProducto.setValue(data.SubProducto);
      if (data.Calidad)
        this.ordenProcesoEditForm.controls.calidad.setValue(data.Calidad);
      if (data.Grado)
        this.ordenProcesoEditForm.controls.grado.setValue(data.Grado);
      if (data.PreparacionCantidadDefectos)
        this.ordenProcesoEditForm.controls.cantidadDefectos.setValue(data.PreparacionCantidadDefectos);
      if (data.Observacion)
        this.ordenProcesoEditForm.controls.observaciones.setValue(data.Observacion);
      data.detalle.forEach(x => x.FechaNotaIngresoPlanta = x.FechaNotaIngresoPlanta.substring(0, 10));
      if (data.NombreArchivo)
        this.fileName = data.NombreArchivo;
      if (data.PathArchivo)
        this.ordenProcesoEditForm.controls.pathFile.setValue(data.PathArchivo);
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
    const rutaFile = this.ordenProcesoEditForm.value.pathFile;
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
    this.router.navigate(['/planta/operaciones/ordenproceso-list']);
  }

  compareFechas() {
    var anioFechaInicio = new Date(this.ordenProcesoEditForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.ordenProcesoEditForm.controls['fechaFin'].value).getFullYear()
    if (new Date(this.ordenProcesoEditForm.controls['fechaInicio'].value) > new Date(this.ordenProcesoEditForm.controls['fechaFin'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
      this.ordenProcesoEditForm.controls['fechaInicio'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.ordenProcesoEditForm.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }
  }
  
  compareTwoDates() {
    var anioFechaInicio = new Date(this.ordenProcesoEditForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.ordenProcesoEditForm.controls['fechaFin'].value).getFullYear()

    if (new Date(this.ordenProcesoEditForm.controls['fechaFin'].value) < new Date(this.ordenProcesoEditForm.controls['fechaInicio'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.ordenProcesoEditForm.controls['fechaFin'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.ordenProcesoEditForm.controls['fechaFin'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }
  
  cargarDatos(detalle: any) {
    detalle.forEach(x => {
      let object: any = {};
      object.NotaIngresoAlmacenPlantaId = x.NotaIngresoAlmacenPlantaId
      object.NumeroIngresoPlanta = x.NumeroNotaIngresoAlmacenPlanta
      object.Numero = x.NumeroNotaIngreso 
      object.FechaRegistro = this.dateUtil.formatDate(new Date(x.FechaRegistro), "/")
      object.RendimientoPorcentaje = x.RendimientoPorcentaje 
      object.HumedadPorcentaje = x.HumedadPorcentaje 
      object.CantidadPesado = x.CantidadPesado
      object.KilosBrutosPesado = x.KilosBrutosPesado
      object.TaraPesado = x.TaraPesado
      object.KilosNetosPesado = x.KilosNetosPesado
      this.listaNotaIngreso.push(object);
    });
    this.tempDataLoteDetalle = this.listaNotaIngreso;
    this.rowsLotesDetalle = [...this.tempDataLoteDetalle];
  }
  agregarNotaIngreso(e) {

    var listFilter=[];
      listFilter = this.listaNotaIngreso.filter(x => x.NotaIngresoPlantaId == e[0].NotaIngresoPlantaId);
      if (listFilter.length == 0)
      {
        this.filtrosLotesID.NotaIngresoPlantaId = Number(e[0].NotaIngresoPlantaId);
        let object: any = {};
        object.NotaIngresoPlantaId = e[0].NotaIngresoPlantaId
        object.NumeroGuiaRemision = e[0].NumeroGuiaRemision
        object.NumeroIngresoPlanta = e[0].Numero 
        object.FechaRegistro = this.dateUtil.formatDate(new Date(e[0].FechaRegistro), "/")
        object.RendimientoPorcentaje = "";// e[0].RendimientoPorcentaje 
        object.HumedadPorcentaje=  "";//e[0].HumedadPorcentajeAnalisisFisico
         object.CantidadPesado =  "";//e[0].CantidadPesado 
        object.KilosBrutosPesado =  "";//e[0].KilosBrutosPesado
        object.TaraPesado =  "";//e[0].TaraPesado
        object.KilosNetosPesado = "";//e[0].KilosNetosPesado
        this.listaNotaIngreso.push(object);
        this.tempDataLoteDetalle = this.listaNotaIngreso;
        this.rowsLotesDetalle = [...this.tempDataLoteDetalle];
        this.modalService.dismissAll();     
      }
      else 
      {
        this.alertUtil.alertWarning("Oops...!","Ya ha sido agregado la Nota de Ingreso N° " + listFilter[0].NumeroNotaIngresoAlmacenPlanta + ".");
      }
  }


  eliminarLote(select) {
    let form = this;
    this.alertUtil.alertSiNoCallback('Está seguro?', 'El lote ' + select[0].NumeroIngresoPlanta + ' se eliminará de su lista.', function (result) {
      if (result.isConfirmed) {
        form.listaNotaIngreso = form.listaNotaIngreso.filter(x => x.NotaIngresoAlmacenPlantaId != select[0].NotaIngresoAlmacenPlantaId)
        form.tempDataLoteDetalle = form.listaNotaIngreso;
        form.rowsLotesDetalle = [...form.tempDataLoteDetalle];
        form.selectLoteDetalle = [];
      }
    }
    );
  }
}

