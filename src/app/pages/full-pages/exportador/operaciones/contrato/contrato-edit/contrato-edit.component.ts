import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  listSubProductos = [];
  listMonedas = [];
  listTipoProduccion = [];
  listUniMedida = [];
  listCertificadora = [];
  listSacosBulk = [];
  listCalidad = [];
  listCertificacion = [];
  listGrado = [];
  listLaboratorios: any[];
  listCalculos = [];
  listEstadoSegMuestra = [];
  listEmpaques = [];
  listTipos = [];
  listNavieras = [];
  selectedCondEmbarque: any;
  selectedPais: any;
  selectedCiudad: any;
  selectedProducto: any;
  selectedSubProducto: any;
  selectedMoneda: any;
  selectedTipoProduccion: any;
  selectedUniMedida: any;
  selectedCertificadora: any;
  selectedSacoBulk: any;
  selectedCalidad: any;
  selectedCertificacion: any;
  selectedGrado: any;
  selectedLaboratorio: any;
  selectedCalculo: any;
  selectedEstadoSegMuestra: any;
  selectedEmpaque: any;
  selectedTipo: any;
  selectedNaviera: any;
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
    if (this.vId > 0) {
      this.SearchById();
    } else if (this.vId <= 0) {
      this.contratoEditForm.controls.fechaRegistro.setValue(this.dateUtil.currentDate());
      // this.contratoEditForm.controls.fechaContrato.setValue(this.dateUtil.currentDate());
      // this.contratoEditForm.controls.fechaEmbarque.setValue(this.dateUtil.currentDate());
      // this.contratoEditForm.controls.fechaFactExp.setValue(this.dateUtil.currentDate());
    }
  }

  LoadForm(): void {
    this.contratoEditForm = this.fb.group({
      idContrato: [],
      razonSocial: [, Validators.required],
      direccionCabe: [, Validators.required],
      fechaRegistro: [],
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
      subProducto: [],
      moneda: [, Validators.required],
      precio: [, Validators.required],
      tipoProduccion: [, Validators.required],
      unidadMedida: [, Validators.required],
      certificadora: [, Validators.required],
      calidad: [, Validators.required],
      certificacion: [, Validators.required],
      grado: [, Validators.required],
      pesoSacoKG: [, Validators.required],
      cantidadDefectos: [, Validators.required],
      responsableComercial: [, Validators.required],
      estado: [],
      file: new FormControl('', []),
      fileName: new FormControl('', []),
      pathFile: new FormControl('', []),
      laboratorio: [],
      calculo: [],
      fecRecojoEnvioCurier: [],
      truckingNumber: [],
      estadoSegMuestras: [],
      fecRecepcionDestino: [],
      empaque: [],
      tipo: [],
      totalSacos69Kg: [],
      naviera: [],
      observaciones: [],
      pesoKilos: []
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
      this.contratoEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);
    }
  }

  LoadCombos(): void {
    this.spinner.show();
    this.GetShipmentCondition();
    this.GetCountries();
    this.GetCities();
    this.GetProducts();
    this.GetByProducts();
    this.GetCurrencies();
    this.GetMeasurementUnit();
    this.GetCalculations();
    this.GetPackaging();
    this.GetQuality();
    this.GetProductionType();
    this.GetPackagingType();
    this.GetDegreePreparation();
    this.GetCertifiers();
    this.GetCertifications();
    this.GetLaboratorys();
    this.GetStatusTrackingSamples();
    this.GetShippingCompany();
    this.spinner.hide();
  }

  async GetShipmentCondition() {
    this.listCondicionEmbarque = [];
    const res = await this.maestroService.obtenerMaestros('CondicionEmbarque').toPromise();
    if (res.Result.Success) {
      this.listCondicionEmbarque = res.Result.Data;
    }
  }

  async GetCountries() {
    this.listPaises = [];
    const res = await this.maestroService.ConsultarPaisAsync().toPromise()
    if (res.Result.Success) {
      this.listPaises = res.Result.Data;
    }
  }

  async GetCities() {
    this.listCiudades = [];
    const res = await this.maestroUtil.GetDepartmentsAsync(this.selectedPais);
    if (res.Result.Success) {
      this.listCiudades = res.Result.Data;
    }
  }

  async GetProducts() {
    this.listProductos = [];
    const res = await this.maestroService.obtenerMaestros('Producto').toPromise();
    if (res.Result.Success) {
      this.listProductos = res.Result.Data;
    }
  }

  async GetByProducts() {
    this.listSubProductos = [];
    const res = await this.maestroService.obtenerMaestros('SubProducto').toPromise();
    if (res.Result.Success) {
      this.listSubProductos = res.Result.Data;
    }
  }

  async GetCurrencies() {
    this.listMonedas = [];
    const res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMonedas = res.Result.Data;
    }
  }

  async GetMeasurementUnit() {
    this.listUniMedida = [];
    const res = await this.maestroService.obtenerMaestros('UnidadMedicion').toPromise();
    if (res.Result.Success) {
      this.listUniMedida = res.Result.Data;
    }
  }

  async GetCalculations() {
    this.listCalculos = [];
    const res = await this.maestroService.obtenerMaestros('CalculoContrato').toPromise();
    if (res.Result.Success) {
      this.listCalculos = res.Result.Data;
    }
  }

  async GetPackaging() {
    this.listEmpaques = [];
    const res = await this.maestroService.obtenerMaestros('Empaque').toPromise();
    if (res.Result.Success) {
      this.listEmpaques = res.Result.Data;
    }
  }

  async GetQuality() {
    this.listCalidad = [];
    const res = await this.maestroService.obtenerMaestros('Calidad').toPromise();
    if (res.Result.Success) {
      this.listCalidad = res.Result.Data;
    }
  }

  async GetProductionType() {
    this.listTipoProduccion = [];
    const res = await this.maestroService.obtenerMaestros('TipoProduccion').toPromise();
    if (res.Result.Success) {
      this.listTipoProduccion = res.Result.Data;
    }
  }

  async GetPackagingType() {
    this.listTipos = [];
    const res = await this.maestroService.obtenerMaestros('TipoEmpaque').toPromise();
    if (res.Result.Success) {
      this.listTipos = res.Result.Data;
    }
  }

  async GetDegreePreparation() {
    this.listGrado = [];
    const res = await this.maestroService.obtenerMaestros('Grado').toPromise();
    if (res.Result.Success) {
      this.listGrado = res.Result.Data;
    }
  }

  async GetCertifiers() {
    this.listCertificadora = [];
    const res = await this.maestroService.obtenerMaestros('EntidadCertificadora').toPromise();
    if (res.Result.Success) {
      this.listCertificadora = res.Result.Data;
    }
  }

  async GetCertifications() {
    this.listCertificacion = [];
    const res = await this.maestroService.obtenerMaestros('TipoCertificacion').toPromise();
    if (res.Result.Success) {
      this.listCertificacion = res.Result.Data;
    }
  }

  async GetLaboratorys() {
    const res = await this.maestroService.obtenerMaestros('Laboratorio').toPromise();
    if (res.Result.Success) {
      this.listLaboratorios = res.Result.Data;
    }
  }

  async GetStatusTrackingSamples() {
    const res = await this.maestroService.obtenerMaestros('EstadoMuestra').toPromise();
    if (res.Result.Success) {
      this.listEstadoSegMuestra = res.Result.Data;
    }
  }

  async GetShippingCompany() {
    const res = await this.maestroService.obtenerMaestros('Naviera').toPromise();
    if (res.Result.Success) {
      this.listNavieras = res.Result.Data;
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
    const form = this.contratoEditForm.value;
    return {
      ContratoId: form.idContrato ? parseInt(form.idContrato) : 0,
      Numero: form.nroContrato ? form.nroContrato : '',
      ClienteId: form.idCliente ? parseInt(form.idCliente) : 0,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
      FloId: form.floId ? form.floId.toString() : '',
      CondicionEmbarqueId: form.condicionEmbarque ? form.condicionEmbarque : '',
      FechaEmbarque: form.fechaEmbarque ? form.fechaEmbarque : '',
      FechaContrato: form.fechaContrato ? form.fechaContrato : '',
      FechaFacturacion: form.fechaFactExp ? form.fechaFactExp : '',
      PaisDestinoId: form.pais ? form.pais : '',
      CalculoContratoId: form.calculo ? form.calculo : '',
      DepartamentoDestinoId: form.ciudad ? form.ciudad : '',
      ProductoId: form.producto ? form.producto : '',
      SubProductoId: form.subProducto ? form.subProducto : '',
      TipoProduccionId: form.tipoProduccion ? form.tipoProduccion : '',
      MonedadId: form.moneda ? form.moneda : '',
      Monto: form.precio ? parseFloat(form.precio) : 0,
      UnidadMedicionId: form.unidadMedida ? form.unidadMedida : '',
      EntidadCertificadoraId: form.certificadora ? form.certificadora : '',
      TipoCertificacionId: form.certificacion ? form.certificacion.join('|') : '',
      CalidadId: form.calidad ? form.calidad : '',
      GradoId: form.grado ? form.grado : '',
      TotalSacos: form.totalSacos69Kg ? form.totalSacos69Kg : 0,
      Peso: form.pesoKilos ? form.pesoKilos : 0,
      PesoPorSaco: form.pesoSacoKG ? parseFloat(form.pesoSacoKG) : 0,
      PreparacionCantidadDefectos: form.cantidadDefectos ? parseFloat(form.cantidadDefectos) : 0,
      LaboratorioId: form.laboratorio ? form.laboratorio : '',
      NumeroSeguimientoMuestra: form.truckingNumber ? form.truckingNumber : '',
      EstadoMuestraId: form.estadoSegMuestras ? form.estadoSegMuestras : '',
      FechaEnvioMuestra: form.fecRecojoEnvioCurier ? form.fecRecojoEnvioCurier : null,
      FechaRecepcionMuestra: form.fecRecepcionDestino ? form.fecRecepcionDestino : null,
      ObservacionMuestra: form.observaciones ? form.observaciones : '',
      NavieraId: form.naviera ? form.naviera : '',
      NombreArchivo: '',
      DescripcionArchivo: '',
      PathArchivo: '',
      EmpaqueId: form.empaque ? form.empaque : '',
      TipoId: form.tipo ? form.tipo : '',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      EstadoId: '01'
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
    formData.append('request', JSON.stringify(request));
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
    formData.append('request', JSON.stringify(request));
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
      if (data.ContratoId)
        this.contratoEditForm.controls.idContrato.setValue(data.ContratoId);
      if (data.Numero)
        this.contratoEditForm.controls.nroContrato.setValue(data.Numero);
      if (data.ClienteId)
        this.contratoEditForm.controls.idCliente.setValue(data.ClienteId);
      if (data.NumeroCliente)
        this.contratoEditForm.controls.codCliente.setValue(data.NumeroCliente);
      if (data.Cliente)
        this.contratoEditForm.controls.cliente.setValue(data.Cliente);
      if (data.FloId)
        this.contratoEditForm.controls.floId.setValue(data.FloId);
      if (data.CondicionEmbarqueId) {
        await this.GetShipmentCondition();
        this.contratoEditForm.controls.condicionEmbarque.setValue(data.CondicionEmbarqueId);
      }
      if (data.FechaEmbarque)
        this.contratoEditForm.controls.fechaEmbarque.setValue(data.FechaEmbarque.substring(0, 10));
      if (data.FechaContrato)
        this.contratoEditForm.controls.fechaContrato.setValue(data.FechaContrato.substring(0, 10));
      if (data.FechaFacturacion)
        this.contratoEditForm.controls.fechaFactExp.setValue(data.FechaFacturacion.substring(0, 10));
      if (data.PaisDestinoId) {
        await this.GetCountries();
        this.contratoEditForm.controls.pais.setValue(data.PaisDestinoId);
        this.onChangePais({ Codigo: this.selectedPais })
      }
      if (data.DepartamentoDestinoId) {
        await this.GetCities();
        this.contratoEditForm.controls.ciudad.setValue(data.DepartamentoDestinoId);
      }
      if (data.ProductoId) {
        await this.GetProducts();
        this.contratoEditForm.controls.producto.setValue(data.ProductoId);
      }
      if (data.SubProductoId) {
        await this.GetByProducts();
        this.contratoEditForm.controls.subProducto.setValue(data.SubProductoId);
      }
      if (data.PesoKilos)
        this.contratoEditForm.controls.pesoKilos.setValue(data.PesoKilos);
      if (data.TipoProduccionId) {
        await this.GetProductionType();
        this.contratoEditForm.controls.tipoProduccion.setValue(data.TipoProduccionId);
      }
      if (data.MonedadId) {
        await this.GetCurrencies();
        this.contratoEditForm.controls.moneda.setValue(data.MonedadId);
      }
      if (data.Monto)
        this.contratoEditForm.controls.precio.setValue(data.Monto);
      if (data.UnidadMedicionId) {
        await this.GetMeasurementUnit();
        this.contratoEditForm.controls.unidadMedida.setValue(data.UnidadMedicionId);
      }
      if (data.CalculoContratoId) {
        await this.GetCalculations();
        this.contratoEditForm.controls.calculo.setValue(data.CalculoContratoId);
      }
      if (data.EntidadCertificadoraId) {
        await this.GetCertifiers();
        this.contratoEditForm.controls.certificadora.setValue(data.EntidadCertificadoraId);
      }
      if (data.EmpaqueId) {
        await this.GetPackaging();
        this.contratoEditForm.controls.empaque.setValue(data.EmpaqueId);
      }
      if (data.TipoId) {
        await this.GetPackagingType();
        this.contratoEditForm.controls.tipo.setValue(data.TipoId);
      }
      if (data.TipoCertificacionId) {
        await this.GetCertifications();
        this.contratoEditForm.controls.certificacion.setValue(data.TipoCertificacionId.split('|').map(String));
      }
      if (data.CalidadId) {
        await this.GetQuality();
        this.contratoEditForm.controls.calidad.setValue(data.CalidadId);
      }
      if (data.GradoId) {
        await this.GetDegreePreparation();
        this.contratoEditForm.controls.grado.setValue(data.GradoId);
      }
      if (data.PesoPorSaco)
        this.contratoEditForm.controls.pesoSacoKG.setValue(data.PesoPorSaco);
      if (data.PreparacionCantidadDefectos)
        this.contratoEditForm.controls.cantidadDefectos.setValue(data.PreparacionCantidadDefectos);
      if (data.FechaRegistro)
        this.contratoEditForm.controls.fechaRegistro.setValue(data.FechaRegistro.substring(0, 10));
      if (data.EstadoId)
        this.contratoEditForm.controls.estado.setValue(data.EstadoId);
      this.contratoEditForm.controls.fileName.setValue(data.NombreArchivo);
      this.contratoEditForm.controls.pathFile.setValue(data.PathArchivo);
      this.fileName = data.NombreArchivo
      if (data.LaboratorioId) {
        await this.GetLaboratorys();
        this.contratoEditForm.controls.laboratorio.setValue(data.LaboratorioId);
      }
      if (data.FechaEnvioMuestra && data.FechaEnvioMuestra.substring(0, 10) != "0001-01-01")
        this.contratoEditForm.controls.fecRecojoEnvioCurier.setValue(data.FechaEnvioMuestra.substring(0, 10));

      if (data.NumeroSeguimientoMuestra)
        this.contratoEditForm.controls.truckingNumber.setValue(data.NumeroSeguimientoMuestra);

      if (data.EstadoMuestraId) {
        this.GetStatusTrackingSamples();
        this.contratoEditForm.controls.estadoSegMuestras.setValue(data.EstadoMuestraId);
      }
      if (data.TotalSacos)
        this.contratoEditForm.controls.totalSacos69Kg.setValue(data.TotalSacos);
      if (data.FechaRecepcionMuestra && data.FechaRecepcionMuestra.substring(0, 10) != "0001-01-01")
        this.contratoEditForm.controls.fecRecepcionDestino.setValue(data.FechaRecepcionMuestra.substring(0, 10));

      if (data.ObservacionMuestra)
        this.contratoEditForm.controls.observaciones.setValue(data.ObservacionMuestra);

      if (data.NavieraId) {
        await this.GetShippingCompany();
        this.contratoEditForm.controls.naviera.setValue(data.NavieraId);
      }
      this.spinner.hide();
    } else {
    }
    this.spinner.hide();
  }

  Descargar() {
    var nombreFile = this.contratoEditForm.value.fileName;
    var rutaFile = this.contratoEditForm.value.pathFile;
    window.open(this.url + '/DescargarArchivo?' + "path=" + rutaFile + "&name=" + nombreFile, '_blank');
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
