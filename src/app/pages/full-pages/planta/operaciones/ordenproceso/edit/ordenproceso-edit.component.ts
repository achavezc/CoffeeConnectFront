
import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, ValidatorFn, ControlContainer } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { OrdenProcesoService } from '../../../../../../services/orden-proceso.service';
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { host } from '../../../../../../shared/hosts/main.host';
import { formatDate } from '@angular/common';
import {AuthService} from './../../../../../../services/auth.service';

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
    private ordenProcesoServicePlanta: OrdenProcesoServicePlanta,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private notaIngresoService: NotaIngresoService,
    private authService : AuthService) { }


  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  ordenProcesoEditForm: FormGroup;
  listEstado = [];
  listTipoProcesos = [];
  listTipoProduccion = [];
  listCertificacion = [];
  listProducto = [];
  listCertificadora = [];
  listSubProducto = [];
  listEmpaque = [];
  listTipo = [];
  listProductoTerminado = [];
  listSubProductoTerminado = [];
  listCalidad = [];
  listGrado = [];
  selectedGrado: any;
  selectedCalidad: any;
  selectedProductoTerminado: any;
  selectedSubProductoTerminado: any;
  selectedTipo: any;
  selectedEmpaque: any;
  selectedSubProducto: any;
  selectedCertificadora: any;
  selectedProducto: any;
  selectedTipoProduccion: any;
  selectedCertificacion: any;
  selectOrganizacion = [];
  selectedEstado: any;
  selectedTipoProceso: any;
  vSessionUser: any;
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
  detalle: any;
  readonly: boolean;


  ngOnInit(): void {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.codeProcessOrder = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    this.LoadForm();
    this.ordenProcesoEditForm.controls.razonSocialCabe.setValue(this.vSessionUser.Result.Data.RazonSocialEmpresa);
    this.ordenProcesoEditForm.controls.direccionCabe.setValue(this.vSessionUser.Result.Data.DireccionEmpresa);
    this.ordenProcesoEditForm.controls.nroRucCabe.setValue(this.vSessionUser.Result.Data.RucEmpresa);
    this.ordenProcesoEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);
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
      // this.addRowDetail();
    } else if (this.codeProcessOrder > 0) {
      this.SearchByid();
    }
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.ordenProcesoEditForm);
  }

  agregarOrdenProceso(e) {
    this.ordenProcesoEditForm.controls.ordenProcesoComercial.setValue(e[0].Numero);
    this.ordenProcesoEditForm.controls.idOrdenProcesoComercial.setValue(e[0].OrdenProcesoId);
    this.ordenProcesoEditForm.controls.rucOrganizacion.setValue(e[0].RucEmpresaProcesadora);
    this.ordenProcesoEditForm.controls.nombreOrganizacion.setValue(e[0].RazonSocialEmpresaProcesadora);
    this.SearchByidOrdenProceso(e[0].OrdenProcesoId);

  }

  SearchByidOrdenProceso(id: any): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.ordenProcesoService.SearchById(id).subscribe((res) => {
      if (res.Result.Success) {
        if (res.Result.Data) {
          var data = res.Result.Data;
          this.autocompleteOrdenProcesoComercial(data);

        }

      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
        this.modalService.dismissAll();
        this.spinner.hide();
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      this.modalService.dismissAll();
    });

  }

  SearchByidOrdenProcesoNumero(id: any): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.ordenProcesoService.SearchById(id).subscribe((res) => {
      if (res.Result.Success) {
        if (res.Result.Data) {
          var data = res.Result.Data;
          this.ordenProcesoEditForm.controls.ordenProcesoComercial.setValue(data.Numero);
          this.ordenProcesoEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
          this.ordenProcesoEditForm.controls.rucOrganizacion.setValue(data.Ruc);
          this.ordenProcesoEditForm.controls.nombreOrganizacion.setValue(data.RazonSocial);
        }

      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
        this.modalService.dismissAll();
        this.spinner.hide();
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      this.modalService.dismissAll();
    });

  }
  async autocompleteOrdenProcesoComercial(data) {

    await this.cargarSubProducto(data.ProductoId);
    await this.cargarSubProductoTerminado(data.ProductoId);
    await this.GetCertificacion();
    await this.GetCertificadora();
    this.ordenProcesoEditForm.controls.ordenProcesoComercial.setValue(data.Numero);
    this.ordenProcesoEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
    this.ordenProcesoEditForm.controls.rucOrganizacion.setValue(data.Ruc);
    this.ordenProcesoEditForm.controls.nombreOrganizacion.setValue(data.RazonSocial);

    this.ordenProcesoEditForm.controls.tipoProceso.setValue(data.TipoProcesoId);
    this.ordenProcesoEditForm.controls.tipoProduccion.setValue(data.TipoProduccionId);
    
    //this.ordenProcesoEditForm.controls.certificacion.setValue(data.TipoCertificacionId);
    //this.ordenProcesoEditForm.controls["certificacion"].setValue(data.TipoCertificacionId);
    this.ordenProcesoEditForm.controls.certificacion.setValue(data.TipoCertificacionId.split('|').map(String));
    this.ordenProcesoEditForm.controls.producto.setValue(data.ProductoId);
    this.ordenProcesoEditForm.controls["certificadora"].setValue(data.EntidadCertificadoraId);

    //this.ordenProcesoEditForm.controls.certificadora.setValue(data.EntidadCertificadoraId);
    this.ordenProcesoEditForm.controls.subProducto.setValue(data.SubProductoId);
    this.ordenProcesoEditForm.controls.organizacionId.setValue(data.EmpresaProcesadoraId);


    this.ordenProcesoEditForm.controls.empaque.setValue(data.EmpaqueId);
    this.ordenProcesoEditForm.controls.tipo.setValue(data.TipoId);
    this.ordenProcesoEditForm.controls.productoTerminado.setValue(data.ProductoId);
    this.ordenProcesoEditForm.controls.cantidad.setValue(data.TotalSacos);
    this.ordenProcesoEditForm.controls.subProductoTerminado.setValue(data.SubProductoId);
    this.ordenProcesoEditForm.controls.pesoSaco.setValue(data.PesoPorSaco);
    this.ordenProcesoEditForm.controls.calidad.setValue(data.CalidadId);
    this.ordenProcesoEditForm.controls.totalKilosBrutos.setValue(data.PesoKilos);
    this.ordenProcesoEditForm.controls.grado.setValue(data.GradoId);
    this.ordenProcesoEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);
    this.ordenProcesoEditForm.controls.cantidadDefectos.setValue(data.PreparacionCantidadDefectos);

    this.ordenProcesoEditForm.controls.empaque.disable();
    this.ordenProcesoEditForm.controls.tipo.disable();
    this.ordenProcesoEditForm.controls.productoTerminado.disable();
    this.ordenProcesoEditForm.controls.cantidad.disable();
    this.ordenProcesoEditForm.controls.subProductoTerminado.disable();
    this.ordenProcesoEditForm.controls.pesoSaco.disable();
    this.ordenProcesoEditForm.controls.calidad.disable();
    this.ordenProcesoEditForm.controls.totalKilosBrutos.disable();
    this.ordenProcesoEditForm.controls.grado.disable();
    this.ordenProcesoEditForm.controls.cantidadContenedores.disable();
    this.ordenProcesoEditForm.controls.cantidadDefectos.disable();

    this.ordenProcesoEditForm.controls.tipoProceso.disable();
    this.ordenProcesoEditForm.controls.rucOrganizacion.disable();
    this.ordenProcesoEditForm.controls.nombreOrganizacion.disable();
    this.ordenProcesoEditForm.controls.tipoProduccion.disable();
    this.ordenProcesoEditForm.controls.certificacion.disable();
    this.ordenProcesoEditForm.controls.producto.disable();
    this.ordenProcesoEditForm.controls.certificadora.disable();
    this.ordenProcesoEditForm.controls.subProducto.disable();
    this.spinner.hide();
    this.modalService.dismissAll();
  }
  LoadForm(): void {
    this.ordenProcesoEditForm = this.fb.group({
      idOrdenProceso: [],
      organizacionId: [],
      razonSocialCabe: ['',],
      nroOrden: [],
      direccionCabe: ['',],
      fechaCabe: ['',],
      nroRucCabe: ['',],
      idContrato: ['',],
      nroContrato: ['',],
      idCliente: ['',],
      codCliente: ['',],
      cliente: ['',],
      idDestino: ['',],
      destino: ['',],
      fecFinProcesoPlanta: [],
      tipoProduccion: ['', Validators.required],
      certificacion: ['', Validators.required],
      porcenRendimiento: ['',],
      producto: ['', Validators.required],
      cantidad: ['', Validators.required],
      calidad: ['', Validators.required],
      grado: ['', Validators.required],
      cantidadDefectos: ['', Validators.required],
      cantidadContenedores: ['', Validators.required],
      responsableComercial: [],
      file: [],
      tipoProceso: ['', Validators.required],
      subProducto: ['', Validators.required],
      observaciones: [''],
      pathFile: [],
      estado: ['', Validators.required],
      ordenProcesoComercial: [],
      idOrdenProcesoComercial: [],
      rucOrganizacion: ['', Validators.required],
      nombreOrganizacion: [],
      certificadora: ['', ],
      empaque: ['', Validators.required],
      tipo: ['', Validators.required],
      productoTerminado: [],
      subProductoTerminado: ['', Validators.required],
      pesoSaco: ['', Validators.required],
      totalKilosBrutos: ['', Validators.required],
      fechaInicio: [],
      fechaFin: []

    });
    this.ordenProcesoEditForm.controls.estado.disable();
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
      this.listCertificacion = res.Result.Data;
    }
  }
  async GetProducto() {
    const res = await this.maestroService.obtenerMaestros('ProductoPlanta').toPromise();
    if (res.Result.Success) {
      this.listProducto = res.Result.Data;
    }
  }
  async GetCertificadora() {
    const res = await this.maestroService.obtenerMaestros('EntidadCertificadoraPlanta').toPromise();
    if (res.Result.Success) {
      this.listCertificadora = res.Result.Data;
    }
  }

  async GetEmpaque() {
    const res = await this.maestroService.obtenerMaestros('Empaque').toPromise();
    if (res.Result.Success) {
      this.listEmpaque = res.Result.Data;
    }
  }
  async GetTipo() {
    const res = await this.maestroService.obtenerMaestros('TipoEmpaque').toPromise();
    if (res.Result.Success) {
      this.listTipo = res.Result.Data;
    }
  }
  async GetCalidad() {
    const res = await this.maestroService.obtenerMaestros('Calidad').toPromise();
    if (res.Result.Success) {
      this.listCalidad = res.Result.Data;
    }
  }
  async GetGrado() {
    const res = await this.maestroService.obtenerMaestros('Grado').toPromise();
    if (res.Result.Success) {
      this.listGrado = res.Result.Data;
    }
  }
  async GetProductoTerminado() {
    const res = await this.maestroService.obtenerMaestros('ProductoPlanta').toPromise();
    if (res.Result.Success) {
      this.listProductoTerminado = res.Result.Data;
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

  // GetDataEmpresa(event: any): void {
  //   const obj = event[0];
  //   if (obj) {
  //     this.ordenProcesoEditForm.controls.codigoOrganizacion.setValue(obj.Codigo);
  //     this.ordenProcesoEditForm.controls.nombreOrganizacion.setValue(obj.RazonSocial);
  //   }
  //   this.modalService.dismissAll();
  // }

  GetDataEmpresa(event: any): void {
    this.selectOrganizacion = event;
    if (this.selectOrganizacion[0]) {
      //this.notaIngredoFormEdit.controls['codigoOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.ordenProcesoEditForm.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.ordenProcesoEditForm.controls['rucOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.ordenProcesoEditForm.controls['organizacionId'].setValue(this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId);
    }
    this.modalService.dismissAll();
  }



  openModal(modal: any): void {
    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl' });
    //this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  GetRequest(): any {
    const form = this.ordenProcesoEditForm.value;

    const request = {
      OrdenProcesoPlantaId: this.codeProcessOrder ? this.codeProcessOrder : 0,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
      OrganizacionId: form.organizacionId ? form.organizacionId : 0,
      TipoProcesoId: this.ordenProcesoEditForm.controls["tipoProceso"].value ? this.ordenProcesoEditForm.controls["tipoProceso"].value : '',
      OrdenProcesoId: form.idOrdenProcesoComercial ? form.idOrdenProcesoComercial : null,
      TipoCertificacionId: this.ordenProcesoEditForm.controls["certificacion"].value ? this.ordenProcesoEditForm.controls["certificacion"].value.join('|') : '',
      EntidadCertificadoraId: this.ordenProcesoEditForm.controls["certificadora"].value ? this.ordenProcesoEditForm.controls["certificadora"].value : 0,
      ProductoId: this.ordenProcesoEditForm.controls["producto"].value ? this.ordenProcesoEditForm.controls["producto"].value : 0,
      SubProductoId: this.ordenProcesoEditForm.controls["subProducto"].value ? this.ordenProcesoEditForm.controls["subProducto"].value : 0,
      ProductoIdTerminado: this.ordenProcesoEditForm.controls["productoTerminado"].value ? this.ordenProcesoEditForm.controls["productoTerminado"].value : 0,
      SubProductoIdTerminado: this.ordenProcesoEditForm.controls["subProductoTerminado"].value ? this.ordenProcesoEditForm.controls["subProductoTerminado"].value : 0,
      TipoProduccionId: this.ordenProcesoEditForm.controls["tipoProduccion"].value ? this.ordenProcesoEditForm.controls["tipoProduccion"].value : 0,
      EmpaqueId: this.ordenProcesoEditForm.controls["empaque"].value ? this.ordenProcesoEditForm.controls["empaque"].value : 0,
      TipoId: this.ordenProcesoEditForm.controls["tipo"].value ? this.ordenProcesoEditForm.controls["tipo"].value : 0,
      CalidadId: this.ordenProcesoEditForm.controls["calidad"].value ? this.ordenProcesoEditForm.controls["calidad"].value : 0,
      GradoId: this.ordenProcesoEditForm.controls["grado"].value ? this.ordenProcesoEditForm.controls["grado"].value : 0,
      TotalSacos: this.ordenProcesoEditForm.controls["cantidad"].value ? this.ordenProcesoEditForm.controls["cantidad"].value : 0,
      PesoPorSaco: this.ordenProcesoEditForm.controls["pesoSaco"].value ? this.ordenProcesoEditForm.controls["pesoSaco"].value : 0,
      PesoKilos:  this.ordenProcesoEditForm.controls["totalKilosBrutos"].value ? this.ordenProcesoEditForm.controls["totalKilosBrutos"].value : 0,
      CantidadContenedores: this.ordenProcesoEditForm.controls["cantidadContenedores"].value ? this.ordenProcesoEditForm.controls["cantidadContenedores"].value : 0,
      CantidadDefectos: this.ordenProcesoEditForm.controls["cantidadDefectos"].value ? this.ordenProcesoEditForm.controls["cantidadDefectos"].value : 0,
      FechaInicioProceso: form.fechaInicio ? form.fechaInicio : null,
      FechaFinProceso: form.fechaFin ? form.fechaFin : null,
      Observacion: form.observaciones ? form.observaciones : '',
      EstadoId: '01',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      OrdenProcesoPlantaDetalle: this.rowsDetails.filter(x => x.NotaIngresoPlantaId)
    }
    let json = JSON.stringify(request);
    return request;

    
  }

  Save(): void {
    if (!this.ordenProcesoEditForm.invalid) {
      if (this.ValidateDataDetails() > 0) {
        const form = this;
        if (this.codeProcessOrder <= 0) {

          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.' , function (result) {
            if (result.isConfirmed) {
              form.Create();
            }
          });   
        } else if (this.codeProcessOrder > 0) {

          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.' , function (result) {
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
    const file = this.ordenProcesoEditForm.value.file;
    this.ordenProcesoServicePlanta.Create(file, request).subscribe((res: any) => {
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
    this.ordenProcesoServicePlanta.Update(file, request).subscribe((res: any) => {
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
    this.ordenProcesoServicePlanta.ConsultarPorId(this.codeProcessOrder).subscribe((res) => {
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
      //this.SearchByidOrdenProcesoNumero(data.OrdenProcesoId);
      this.ordenProcesoEditForm.controls.ordenProcesoComercial.setValue(data.NumeroOrdenProcesoComercial);
      this.ordenProcesoEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
      this.ordenProcesoEditForm.controls.rucOrganizacion.setValue(data.RucOrganizacion);
      this.ordenProcesoEditForm.controls.nombreOrganizacion.setValue(data.RazonSocialOrganizacion); 
      let empaque_tipo = '';
      if (data.EstadoId)
        this.ordenProcesoEditForm.controls.estado.setValue(data.EstadoId);
      if (data.OrdenProcesoId)
      this.codeProcessOrder = data.OrdenProcesoId
        this.ordenProcesoEditForm.controls.idOrdenProceso.setValue(data.OrdenProcesoId);
      if (data.Numero)
        this.ordenProcesoEditForm.controls.nroOrden.setValue(data.Numero);
      if (data.FechaRegistro) {
        this.ordenProcesoEditForm.controls.fechaCabe.setValue(data.FechaRegistro.substring(0, 10));
      }
      await this.cargarSubProducto(data.ProductoId);
      await this.cargarSubProductoTerminado(data.ProductoId);

      //this.ordenProcesoEditForm.controls.ordenProcesoComercial.setValue(data.Numero);
      //this.ordenProcesoEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
      //this.ordenProcesoEditForm.controls.rucOrganizacion.setValue(data.Ruc);
      //this.ordenProcesoEditForm.controls.nombreOrganizacion.setValue(data.RazonSocial);
      this.ordenProcesoEditForm.controls.tipoProceso.setValue(data.TipoProcesoId);
      this.ordenProcesoEditForm.controls.tipoProduccion.setValue(data.TipoProduccionId);
      this.ordenProcesoEditForm.controls.producto.setValue(data.ProductoId);
      this.ordenProcesoEditForm.controls.certificadora.setValue(data.EntidadCertificadoraId);
      this.ordenProcesoEditForm.controls.subProducto.setValue(data.SubProductoId);
      this.ordenProcesoEditForm.controls.organizacionId.setValue(data.OrganizacionId);


      this.ordenProcesoEditForm.controls.empaque.setValue(data.EmpaqueId);
      this.ordenProcesoEditForm.controls.tipo.setValue(data.TipoId);
      this.ordenProcesoEditForm.controls.productoTerminado.setValue(data.ProductoId);
      this.ordenProcesoEditForm.controls.cantidad.setValue(data.TotalSacos);
      this.ordenProcesoEditForm.controls.subProductoTerminado.setValue(data.SubProductoId);
      this.ordenProcesoEditForm.controls.calidad.setValue(data.CalidadId);
      this.ordenProcesoEditForm.controls.grado.setValue(data.GradoId);
     /*  this.ordenProcesoEditForm.controls.pesoSaco.setValue(data.PesoPorSaco);
     
      this.ordenProcesoEditForm.controls.totalKilosBrutos.setValue(data.PesoKilos);
      
      this.ordenProcesoEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);
      this.ordenProcesoEditForm.controls.cantidadDefectos.setValue(data.PreparacionCantidadDefectos);
 */

      if (data.TipoCertificacionId) {
        await this.GetCertificacion();
        this.ordenProcesoEditForm.controls.certificacion.setValue(data.TipoCertificacionId.split('|').map(String));
      }

      if (data.TipoProcesoId) {
        await this.GetTipoProcesos();
        this.ordenProcesoEditForm.controls.tipoProceso.setValue(data.TipoProcesoId);
      }
      
      this.ordenProcesoEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);
      this.ordenProcesoEditForm.controls.cantidadDefectos.setValue(data.CantidadDefectos);
      this.ordenProcesoEditForm.controls.pesoSaco.setValue(data.PesoPorSaco);
      this.ordenProcesoEditForm.controls.cantidad.setValue(data.TotalSacos);
      this.ordenProcesoEditForm.controls.totalKilosBrutos.setValue(data.PesoKilos);
      this.ordenProcesoEditForm.controls.fechaInicio.setValue(data.FechaInicioProceso == null ? "" : formatDate(data.FechaInicioProceso, 'yyyy-MM-dd', 'en'));
      this.ordenProcesoEditForm.controls.fechaFin.setValue(data.FechaFinProceso == null ? "" :formatDate(data.FechaFinProceso, 'yyyy-MM-dd', 'en'));
      


      
      if (data.Observacion)
        this.ordenProcesoEditForm.controls.observaciones.setValue(data.Observacion);
      //data.detalle.forEach(x => x.FechaNotaIngresoPlanta = x.FechaNotaIngresoPlanta.substring(0, 10));
      if (data.NombreArchivo)
        this.fileName = data.NombreArchivo;
      if (data.PathArchivo)
        this.ordenProcesoEditForm.controls.pathFile.setValue(data.PathArchivo);
      //this.rowsDetails = data.detalle;
      this.cargarDatos(data.detalle);
      //this.tempDataLoteDetalle = this.listaNotaIngreso;
      //this.rowsLotesDetalle = [...this.tempDataLoteDetalle];

      this.selectOrganizacion[0] = { EmpresaProveedoraAcreedoraId: data.OrganizacionId };
      
    }
    this.spinner.hide();
  }

  addRowDetail(): void {
    this.rowsDetails = [...this.rowsDetails, {
      OrdenProcesoPlantaId: 0,
      OrdenProcesoPlantaDetalleId: 0,
      NotaIngresoPlantaId: 0,
      NroNotaIngresoPlanta: '',
      FechaNotaIngresoPlanta: '',
      RendimientoPorcentaje: 0,
      HumedadPorcentaje: 0,
      CantidadSacos: 0,
      CantidadPesado:0,
      KilosExportables:0,
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
    if (prop === 'CantidadPesado')
      this.rowsDetails[index].CantidadPesado =  parseFloat(event.target.value);
    else if (prop === 'KilosExportables')
      this.rowsDetails[index].KilosExportables = parseFloat(event.target.value);
      
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
    /*  result = this.rowsLotesDetalle.filter(x => !x.NotaIngresoPlantaId
       || !x.FechaRegistro || !x.RendimientoPorcentaje
       || !x.HumedadPorcentaje)
  */
    result = this.rowsDetails.filter(x => x.NotaIngresoPlantaId)
    return result.length;
  }

  Cancel(): void {
    this.router.navigate(['/planta/operaciones/ordenproceso-list']);
  }

  compareFechas() {
    /*
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
    */
  }

  compareTwoDates() {
    /*
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
    */
  }

  cargarDatos(detalle: any) {
    detalle.forEach(data => {
      let object: any = {};
      object.NotaIngresoPlantaId = data.NotaIngresoPlantaId

      object.NumeroIngresoPlanta = data.NumeroNotaIngresoPlanta
      object.FechaRegistro = this.dateUtil.formatDate(data.FechaNotaIngresoPlanta)
      object.RendimientoPorcentaje = data.RendimientoPorcentaje
      object.HumedadPorcentaje = data.HumedadPorcentaje

      object.PorcentajeExportable = data.PorcentajeExportable
      object.PorcentajeDescarte = data.PorcentajeDescarte
      object.PorcentajeCascarilla = data.PorcentajeCascarilla
      if(data.PorcentajeExportable){
        object.KilosExportables = Number(data.KilosNetos * data.PorcentajeExportable);
      }else{
        object.KilosExportables = Number(0);
      }
      //if(data.KilosExportables){
       // var valorRounded = Math.round(( Number(object.KilosExportables / 69) + Number.EPSILON) * 100) / 100
        object.SacosCalculo = data.SacosCalculo;
      //}else{
      //  object.SacosCalculo = Number(0);
      //}
     
      object.CantidadPesado = data.Cantidad
      object.KilosBrutosPesado = data.KilosBrutos
      object.TaraPesado = data.Tara
      object.KilosNetosPesado = data.KilosNetos
      this.listaNotaIngreso.push(object);
    });    
    this.tempDataLoteDetalle = this.listaNotaIngreso;
    this.rowsDetails = [...this.tempDataLoteDetalle];
  }
  agregarNotaIngreso(e) {
    this.obtenerDetalleNotaIngreso(e[0].NotaIngresoPlantaId);
    /*
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
      }}*/
  }

  obtenerDetalleNotaIngreso(id) {
    this.spinner.show();
    this.notaIngresoService.ConsultarPorId(Number(id))
      .subscribe(res => {

        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data;
            if (this.detalle != null) {
              this.agregarNotaIngresoGrilla(res.Result.Data);
            } else {
              this.spinner.hide();
              this.modalService.dismissAll();
            }
          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.errorGeneral = { isError: true, msgError: res.Result.Message };
            this.modalService.dismissAll();
          } else {
            this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
            this.modalService.dismissAll();
          }
        } else {
          this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
          this.modalService.dismissAll();
        }
      },
        err => {
          this.spinner.hide();
          this.modalService.dismissAll();
          console.log(err);
          this.errorGeneral = { isError: false, msgError: this.msgErrorGenerico };
        }
      );
  }

  agregarNotaIngresoGrilla(data) {
    var listFilter = [];
    listFilter = this.listaNotaIngreso.filter(x => x.NotaIngresoPlantaId == data.NotaIngresoPlantaId);
    if (listFilter.length == 0) {
      this.filtrosLotesID.NotaIngresoPlantaId = Number(data.NotaIngresoPlantaId);
      let object: any = {};
      object.OrdenProcesoPlantaId = this.codeProcessOrder;
      object.OrdenProcesoPlantaDetalleId = 0;
      object.NotaIngresoPlantaId = data.NotaIngresoPlantaId;
      object.NumeroGuiaRemision = data.NumeroGuiaRemision
      object.NumeroIngresoPlanta = data.Numero;
      object.FechaRegistroFinal = data.FechaRegistro;
      object.FechaRegistro = this.dateUtil.formatDate(data.FechaRegistro);
      object.RendimientoPorcentaje = data.RendimientoPorcentaje;
      object.HumedadPorcentaje = data.HumedadPorcentaje;

      object.PorcentajeExportable = data.ExportablePorcentajeAnalisisFisico;
      object.PorcentajeDescarte = data.DescartePorcentajeAnalisisFisico;
      object.PorcentajeCascarilla = data.CascarillaPorcentajeAnalisisFisico;
      object.KilosExportables = Number(data.KilosNetos * data.ExportablePorcentajeAnalisisFisico);
      var valorRounded = Math.round(( Number(object.KilosExportables / 69) + Number.EPSILON) * 100) / 100
      object.SacosCalculo = valorRounded;
      object.CantidadPesado = data.Cantidad;
      object.KilosBrutosPesado = data.KilosBrutos;
      object.TaraPesado = data.Tara;
      object.KilosNetosPesado = data.KilosNetos;
      this.listaNotaIngreso.push(object);
      this.tempDataLoteDetalle = this.listaNotaIngreso;
      this.rowsDetails = [...this.tempDataLoteDetalle];
      this.spinner.hide();
      this.modalService.dismissAll();
   
    }
    else {
      this.alertUtil.alertWarning("Oops...!", "Ya ha sido agregado la Nota de Ingreso N° " + listFilter[0].Numero + ".");
      this.spinner.hide();
    }
  }

  eliminarLote(select) {
    let form = this;
    this.alertUtil.alertSiNoCallback('Está seguro?', 'La NI ' + select[0].NotaIngresoPlantaId + ' se eliminará de su lista.', function (result) {
      if (result.isConfirmed) {
        form.listaNotaIngreso = form.listaNotaIngreso.filter(x => x.NotaIngresoPlantaId != select[0].NotaIngresoPlantaId)
        form.tempDataLoteDetalle  = form.listaNotaIngreso;
        form.rowsDetails  = [...form.tempDataLoteDetalle];
        form.selectLoteDetalle = [];
      }
    }
    );
  }
}

