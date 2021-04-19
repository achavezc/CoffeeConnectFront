import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup,FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import {HttpClient,HttpHeaders } from '@angular/common/http';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { DateUtil } from '../../../../../../services/util/date-util';
import { ContratoService } from '../../../../../../services/contrato.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { host } from '../../../../../../shared/hosts/main.host';

@Component({
  selector: 'app-contrato-edit',
  templateUrl: './contrato-edit.component.html',
  styleUrls: ['./contrato-edit.component.scss']
})
export class ContratoEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private maestroService: MaestroService,
    private spinner: NgxSpinnerService,
    private dateUtil: DateUtil,
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private contratoService: ContratoService,
    private alertUtil: AlertUtil,
    private httpClient: HttpClient) { }

  contratoEditForm: FormGroup;
  listCondicionEmbarque = [];
  listPaises = [];
  listCiudades = [];
  listProductos = [];
  listMonedas = [];
  listTipoProduccion = [];
  listUniMedida = [];
  listCertificadora = [];
  listSacosBulk = [];
  listCalidad = [];
  listCertificacion = [];
  listGrado = [];
  selectedCondEmbarque: any;
  selectedPais: any;
  selectedCiudad: any;
  selectedProducto: any;
  selectedMoneda: any;
  selectedTipoProduccion: any;
  selectedUniMedida: any;
  selectedCertificadora: any;
  selectedSacoBulk: any;
  selectedCalidad: any;
  selectedCertificacion: any;
  selectedGrado: any;
  vId: number;
  vSessionUser: any;
  private url = `${host}Contrato`;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  fileName = "";

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseFloat(this.route.snapshot.params['id']) : 0;
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    this.LoadDataInicial();
    this.contratoEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);
    if (this.vId > 0) {
      this.SearchById();
    } else if (this.vId <= 0) {
      this.contratoEditForm.controls.fechaContrato.setValue(this.dateUtil.currentDate());
      this.contratoEditForm.controls.fechaEmbarque.setValue(this.dateUtil.currentDate());
      this.contratoEditForm.controls.fechaFactExp.setValue(this.dateUtil.currentDate());
    }
  }

  LoadForm(): void {
    this.contratoEditForm = this.fb.group({
      idContrato: [],
      razonSocial: [, Validators.required],
      direccionCabe: [, Validators.required],
      fecha: [],
      nroRucCabe: [, Validators.required],
      nroContrato: [],
      fechaContrato: [, Validators.required],
      idCliente: [],
      codCliente: [, Validators.required],
      cliente: [, Validators.required],
      floId: [, Validators.required],
      condicionEmbarque: [, Validators.required],
      fechaEmbarque: [, Validators.required],
      fechaFactExp: [, Validators.required],
      pais: [, Validators.required],
      ciudad: [, Validators.required],
      producto: [, Validators.required],
      moneda: [, Validators.required],
      precio: [, Validators.required],
      tipoProduccion: [, Validators.required],
      unidadMedida: [, Validators.required],
      certificadora: [, Validators.required],
      sacosBulk: [, Validators.required],
      calidad: [, Validators.required],
      certificacion: [, Validators.required],
      cantidad: [, Validators.required],
      grado: [, Validators.required],
      pesoSacoKG: [, Validators.required],
      cantidadDefectos: [, Validators.required],
      cargaContrato: [],
      responsableComercial: [, Validators.required],
      sujetoAprobMuestra: [],
      muestraEnviadaCliente: [],
      muestraAnalisisGlifosato: [],
      estado: [],
      file: new FormControl('', []),
        fileName: new FormControl('', []),
        pathFile: new FormControl('', [])
    });
  }

  get f() {
    return this.contratoEditForm.controls;
  }

  LoadDataInicial(): void {
    if (this.vSessionUser && this.vSessionUser.Result && this.vSessionUser.Result.Data) {
      const session = this.vSessionUser.Result.Data;
      this.contratoEditForm.controls.razonSocial.setValue(session.RazonSocialEmpresa);
      this.contratoEditForm.controls.direccionCabe.setValue(session.DireccionEmpresa);
      this.contratoEditForm.controls.nroRucCabe.setValue(session.RucEmpresa);
    }
  }

  LoadCombos(): void {
    this.GetCondicionEmbarque();
    this.GetPais();
    this.GetCiudad();
    this.GetProductos();
    this.GetMonedas();
    this.GetTipoProduccion();
    this.GetUnidadMedida();
    this.GetCertificadora();
    this.GetSacosBulk();
    this.GetCalidad();
    this.GetCertificacion();
    this.GetGradoPreparacion();
  }

  async GetCondicionEmbarque() {
    this.listCondicionEmbarque = [];
    const res = await this.maestroService.obtenerMaestros('CondicionEmbarque').toPromise();
    if (res.Result.Success) {
      this.listCondicionEmbarque = res.Result.Data;
    }
  }

  async GetPais() {
    this.listPaises = [];
    const res = await this.maestroService.ConsultarPaisAsync().toPromise()
    if (res.Result.Success) {
      this.listPaises = res.Result.Data;
    }
  }

  async GetCiudad() {
    this.listCiudades = [];
    const res = await this.maestroUtil.GetDepartmentsAsync(this.selectedPais);
    if (res.Result.Success) {
      this.listCiudades = res.Result.Data;
    }
  }

  async GetProductos() {
    this.listProductos = [];
    const res = await this.maestroService.obtenerMaestros('Producto').toPromise();
    if (res.Result.Success) {
      this.listProductos = res.Result.Data;
    }
  }

  async GetMonedas() {
    this.listMonedas = [];
    const res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMonedas = res.Result.Data;
    }
  }

  async GetTipoProduccion() {
    this.listTipoProduccion = [];
    const res = await this.maestroService.obtenerMaestros('TipoProduccion').toPromise();
    if (res.Result.Success) {
      this.listTipoProduccion = res.Result.Data;
    }
  }

  async GetUnidadMedida() {
    this.listUniMedida = [];
    const res = await this.maestroService.obtenerMaestros('UnidadMedicion').toPromise();
    if (res.Result.Success) {
      this.listUniMedida = res.Result.Data;
    }
  }

  async GetCertificadora() {
    this.listCertificadora = [];
    const res = await this.maestroService.obtenerMaestros('EntidadCertificadora').toPromise();
    if (res.Result.Success) {
      this.listCertificadora = res.Result.Data;
    }
  }

  async GetSacosBulk() {
    this.listSacosBulk = [];
    const res = await this.maestroService.obtenerMaestros('UnidadMedida').toPromise();
    if (res.Result.Success) {
      this.listSacosBulk = res.Result.Data;
    }
  }

  async GetCalidad() {
    this.listCalidad = [];
    const res = await this.maestroService.obtenerMaestros('Calidad').toPromise();
    if (res.Result.Success) {
      this.listCalidad = res.Result.Data;
    }
  }

  async GetCertificacion() {
    this.listCertificacion = [];
    const res = await this.maestroService.obtenerMaestros('TipoCertificacion').toPromise();
    if (res.Result.Success) {
      this.listCertificacion = res.Result.Data;
    }
  }

  async GetGradoPreparacion() {
    this.listGrado = [];
    const res = await this.maestroService.obtenerMaestros('Grado').toPromise();
    if (res.Result.Success) {
      this.listGrado = res.Result.Data;
    }
  }

  onChangePais(event: any): void {
    const form = this;
    this.listCiudades = [];
    this.contratoEditForm.controls.ciudad.reset();
    this.maestroUtil.GetDepartments(event.Codigo, (res: any) => {
      if (res.Result.Success) {
        form.listCiudades = res.Result.Data;
      }
    });
  }

  GetDataModalClientes(event: any): void {
    this.contratoEditForm.controls.idCliente.setValue(event[0].ClienteId);
    this.contratoEditForm.controls.codCliente.setValue(event[0].Numero);
    this.contratoEditForm.controls.cliente.setValue(event[0].RazonSocial);
    this.modalService.dismissAll();
  }

  openModal(modalEmpresa: any): void {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  GetRequest(): any {
    return {
      ContratoId: this.contratoEditForm.value.idContrato ? parseInt(this.contratoEditForm.value.idContrato) : 0,
      Numero: this.contratoEditForm.value.nroContrato ? this.contratoEditForm.value.nroContrato : '',
      ClienteId: this.contratoEditForm.value.idCliente ? parseInt(this.contratoEditForm.value.idCliente) : 0,
      FloId: this.contratoEditForm.value.floId ? this.contratoEditForm.value.floId.toString() : '',
      CondicionEmbarqueId: this.contratoEditForm.value.condicionEmbarque ? this.contratoEditForm.value.condicionEmbarque : '',
      FechaEmbarque: this.contratoEditForm.value.fechaEmbarque ? this.contratoEditForm.value.fechaEmbarque : '',
      FechaContrato: this.contratoEditForm.value.fechaContrato ? this.contratoEditForm.value.fechaContrato : '',
      FechaFacturacion: this.contratoEditForm.value.fechaFactExp ? this.contratoEditForm.value.fechaFactExp : '',
      PaisDestinoId: this.contratoEditForm.value.pais ? this.contratoEditForm.value.pais : '',
      DepartamentoDestinoId: this.contratoEditForm.value.ciudad ? this.contratoEditForm.value.ciudad : '',
      ProductoId: this.contratoEditForm.value.producto ? this.contratoEditForm.value.producto : '',
      TipoProduccionId: this.contratoEditForm.value.tipoProduccion ? this.contratoEditForm.value.tipoProduccion : '',
      MonedadId: this.contratoEditForm.value.moneda ? this.contratoEditForm.value.moneda : '',
      Monto: this.contratoEditForm.value.precio ? parseFloat(this.contratoEditForm.value.precio) : 0,
      UnidadMedicionId: this.contratoEditForm.value.unidadMedida ? this.contratoEditForm.value.unidadMedida : '',
      UnidadMedidaId: this.contratoEditForm.value.sacosBulk ? this.contratoEditForm.value.sacosBulk : '',
      EntidadCertificadoraId: this.contratoEditForm.value.certificadora ? this.contratoEditForm.value.certificadora : '',
      TipoCertificacionId: this.contratoEditForm.value.certificacion ? this.contratoEditForm.value.certificacion.join('|') : '',
      CalidadId: this.contratoEditForm.value.calidad ? this.contratoEditForm.value.calidad : '',
      GradoId: this.contratoEditForm.value.grado ? this.contratoEditForm.value.grado : '',
      CantidadPorSaco: this.contratoEditForm.value.cantidad ? parseFloat(this.contratoEditForm.value.cantidad) : 0,
      PesoPorSaco: this.contratoEditForm.value.pesoSacoKG ? parseFloat(this.contratoEditForm.value.pesoSacoKG) : 0,
      PreparacionCantidadDefectos: this.contratoEditForm.value.cantidadDefectos ? parseFloat(this.contratoEditForm.value.cantidadDefectos) : 0,
      RequiereAprobacionMuestra: this.contratoEditForm.value.sujetoAprobMuestra ? this.contratoEditForm.value.sujetoAprobMuestra : false,
      MuestraEnviadaCliente: this.contratoEditForm.value.muestraEnviadaCliente ? this.contratoEditForm.value.muestraEnviadaCliente : false,
      MuestraEnviadaAnalisisGlifosato: this.contratoEditForm.value.muestraAnalisisGlifosato ? this.contratoEditForm.value.muestraAnalisisGlifosato : false,
      NombreArchivo: '',
      PathArchivo: '',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      EstadoId: '01',
      CalculoContratoId: '',
      DescripcionArchivo:  ''
    }
  }

  Guardar(): void {
    if (!this.contratoEditForm.invalid) {
      const form = this;
      if (this.vId > 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la modificación del contrato?.`,
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
      } else if (this.vId <= 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la creación del nuevo contrato?.`,
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
      }
    }
  }

  Create(): void {
    this.spinner.show();
    const request = this.GetRequest();
    const formData = new FormData();
    formData.append('file', this.contratoEditForm.get('file').value);
    formData.append('request',  JSON.stringify(request));
    const headers = new HttpHeaders();
    headers.append('enctype', 'multipart/form-data');
    this.httpClient
     .post(this.url + '/Registrar', formData, { headers })
     .subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
          "Se registro correctamente el contrato.",
          () => {
            this.Cancelar();
          });
      } else {
        this.alertUtil.alertError("ERROR!", res.Result.Message);
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.alertUtil.alertError("ERROR!", this.mensajeErrorGenerico);
    });
  }

  Update(): void {
    this.spinner.show();
    const request = this.GetRequest();
    const formData = new FormData();
    formData.append('file', this.contratoEditForm.get('file').value);
    formData.append('request',  JSON.stringify(request));
    const headers = new HttpHeaders();
    headers.append('enctype', 'multipart/form-data');
    this.httpClient
     .post(this.url + '/Actualizar', formData, { headers })
     .subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
          "Se actualizo correctamente la certificacion.",
          () => {
            this.Cancelar();
          });
      } else {
        this.alertUtil.alertError("ERROR!", res.Result.Message);
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.alertUtil.alertError("ERROR!", this.mensajeErrorGenerico);
    });
  }

  SearchById(): void {
    this.spinner.show();
    this.contratoService.SearchById({ ContratoId: this.vId })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.AutocompleteForm(res.Result.Data);
        }
      }, (err: any) => {
        console.log(err);
      });
  }

  async AutocompleteForm(data: any) {
    if (data) {
      if (data.ContratoId) {
        this.contratoEditForm.controls.idContrato.setValue(data.ContratoId);
      }
      if (data.Numero) {
        this.contratoEditForm.controls.nroContrato.setValue(data.Numero);
      }
      if (data.ClienteId) {
        this.contratoEditForm.controls.idCliente.setValue(data.ClienteId);
      }
      if (data.NumeroCliente) {
        this.contratoEditForm.controls.codCliente.setValue(data.NumeroCliente);
      }
      if (data.Cliente) {
        this.contratoEditForm.controls.cliente.setValue(data.Cliente);
      }
      if (data.FloId) {
        this.contratoEditForm.controls.floId.setValue(data.FloId);
      }
      if (data.CondicionEmbarqueId) {
        await this.GetCondicionEmbarque();
        this.contratoEditForm.controls.condicionEmbarque.setValue(data.CondicionEmbarqueId);
      }
      if (data.FechaEmbarque) {
        this.contratoEditForm.controls.fechaEmbarque.setValue(data.FechaEmbarque.substring(0, 10));
      }
      if (data.FechaContrato) {
        this.contratoEditForm.controls.fechaContrato.setValue(data.FechaContrato.substring(0, 10));
      }
      if (data.FechaFacturacion) {
        this.contratoEditForm.controls.fechaFactExp.setValue(data.FechaFacturacion.substring(0, 10));
      }
      if (data.PaisDestinoId) {
        await this.GetPais();
        this.contratoEditForm.controls.pais.setValue(data.PaisDestinoId);
        this.onChangePais({ Codigo: this.selectedPais })
      }
      if (data.DepartamentoDestinoId) {
        await this.GetCiudad();
        this.contratoEditForm.controls.ciudad.setValue(data.DepartamentoDestinoId);
      }
      if (data.ProductoId) {
        await this.GetProductos();
        this.contratoEditForm.controls.producto.setValue(data.ProductoId);
      }
      if (data.TipoProduccionId) {
        await this.GetTipoProduccion();
        this.contratoEditForm.controls.tipoProduccion.setValue(data.TipoProduccionId);
      }
      if (data.MonedadId) {
        await this.GetMonedas();
        this.contratoEditForm.controls.moneda.setValue(data.MonedadId);
      }
      if (data.Monto) {
        this.contratoEditForm.controls.precio.setValue(data.Monto);
      }
      if (data.UnidadMedicionId) {
        await this.GetUnidadMedida();
        this.contratoEditForm.controls.unidadMedida.setValue(data.UnidadMedicionId);
      }
      if (data.UnidadMedidaId) {
        await this.GetSacosBulk();
        this.contratoEditForm.controls.sacosBulk.setValue(data.UnidadMedidaId);
      }
      if (data.EntidadCertificadoraId) {
        await this.GetCertificadora();
        this.contratoEditForm.controls.certificadora.setValue(data.EntidadCertificadoraId);
      }
      if (data.TipoCertificacionId) {
        await this.GetCertificacion();
        this.contratoEditForm.controls.certificacion.setValue(data.TipoCertificacionId.split('|').map(String));
      }
      if (data.CalidadId) {
        await this.GetCalidad();
        this.contratoEditForm.controls.calidad.setValue(data.CalidadId);
      }
      if (data.GradoId) {
        await this.GetGradoPreparacion();
        this.contratoEditForm.controls.grado.setValue(data.GradoId);
      }
      if (data.CantidadPorSaco) {
        this.contratoEditForm.controls.cantidad.setValue(data.CantidadPorSaco);
      }
      if (data.PesoPorSaco) {
        this.contratoEditForm.controls.pesoSacoKG.setValue(data.PesoPorSaco);
      }
      if (data.PreparacionCantidadDefectos) {
        this.contratoEditForm.controls.cantidadDefectos.setValue(data.PreparacionCantidadDefectos);
      }
      if (data.RequiereAprobacionMuestra) {
        this.contratoEditForm.controls.sujetoAprobMuestra.setValue(data.RequiereAprobacionMuestra);
      }
      if (data.MuestraEnviadaCliente) {
        this.contratoEditForm.controls.muestraEnviadaCliente.setValue(data.MuestraEnviadaCliente);
      }
      if (data.MuestraEnviadaAnalisisGlifosato) {
        this.contratoEditForm.controls.muestraAnalisisGlifosato.setValue(data.MuestraEnviadaAnalisisGlifosato);
      }
      // this.contratoEditForm.controls..setValue(data.NombreArchivo);
      // this.contratoEditForm.controls..setValue(data.PathArchivo);
      if (data.FechaRegistro) {
        this.contratoEditForm.controls.fecha.setValue(data.FechaRegistro.substring(0, 10));
      }
      // this.contratoEditForm.controls..setValue(data.UsuarioRegistro);
      // this.contratoEditForm.controls..setValue(data.FechaUltimaActualizacion);
      // this.contratoEditForm.controls..setValue(data.UsuarioUltimaActualizacion);
      if (data.EstadoId) {
        this.contratoEditForm.controls.estado.setValue(data.EstadoId);
      }
      this.contratoEditForm.controls.fileName.setValue(data.NombreArchivo);
      this.contratoEditForm.controls.pathFile.setValue(data.PathArchivo);
      this.fileName =  data.NombreArchivo
      this.spinner.hide();
    }
    this.spinner.hide();
  }
  Descargar() {
    var nombreFile = this.contratoEditForm.value.fileName;
    var rutaFile = this.contratoEditForm.value.pathFile;
    window.open(this.url+'/DescargarArchivo?' + "path=" + rutaFile + "&name=" + nombreFile , '_blank');
    
  }
  fileChange(event) {

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      //this.certificacionEditForm.get('profile').setValue(file);
      this.contratoEditForm.patchValue({
        file: file
      });
      this.contratoEditForm.get('file').updateValueAndValidity()

    }

  }
  Cancelar(): void {
    this.router.navigate(['/exportador/operaciones/contrato/list']);
  }

}
