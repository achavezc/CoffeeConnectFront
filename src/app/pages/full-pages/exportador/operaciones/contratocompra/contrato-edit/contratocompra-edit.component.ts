import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { DateUtil } from '../../../../../../services/util/date-util';
import { ContratoService } from '../../../../../../services/contrato.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { host } from '../../../../../../shared/hosts/main.host';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-contratocompra-edit',
  templateUrl: './contratocompra-edit.component.html',
  styleUrls: ['./contratocompra-edit.component.scss']
})
export class ContratoCompraEditComponent implements OnInit {

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
    private httpClient: HttpClient,
    private authService : AuthService) { }

  contratoEditForm: FormGroup;
  listCondicionEmbarque = [];
  listEstadoPagoFactura = [];
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
  // listLaboratorios: any[];
  listCalculos = [];
  listEstadoSegMuestra = [];
  listEmpaques = [];
  listTipos = [];
  // listNavieras = [];
  listHarvestPeriod = [];
  listContractType = [];
  listInvoiceIn = [];
  listFixationState: [];
  selectedCondEmbarque: any;
  selectedEstadoPagoFactura: any;
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
  // selectedLaboratorio: any;
  selectedCalculo: any;
  // selectedEstadoSegMuestra: any;
  selectedEmpaque: any;
  selectedTipo: any;
  // selectedNaviera: any;
  selectedHarvestPeriod: any;
  selectedContractType: any;
  selectedInvoiceIn: any;
  selectedFixationState: any;
  vId: number;
  vSessionUser: any;
  private url = `${host}Contrato`;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  fileName = "";
  fechaRegistro: any;
  reqAsignacionContratoAcopio;
  estadoContrato: string;
  pesoNetoKilos;
  kilosNetosQQ_A;
  kilosNetosLB_B;
  precioUnitarioTotalA;
  precioUnitarioTotalB;
  precioUnitarioTotalC;
  totalFacturar1;
  totalFacturar2;
  totalFacturar3;
  tipoEmpresaId = '';
  readonly: boolean;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseFloat(this.route.snapshot.params['id']) : 0;
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
    this.tipoEmpresaId = this.vSessionUser.Result.Data.TipoEmpresaid;
    this.LoadForm();
    this.addValidations();
    this.LoadCombos();
    this.LoadDataInicial();
    if (this.vId > 0) {
      this.SearchById();
    } else if (this.vId <= 0) {
      this.fechaRegistro = this.dateUtil.currentDate();
    }
    this.reqAsignacionContratoAcopio = {
      contratoId: this.vId,
      pesoNetoKGOro: 0,
      pesoNetoQQ: 0,
      estadoContratoId: '',
      totalKGPergamino: 0,
      porcenRendimiento: 0,
      KGPergamino: 0,
      saldoKGPergamino: 0
    }
  }

  LoadForm(): void {
    this.contratoEditForm = this.fb.group({
      idContrato: [],
      razonSocial: [, Validators.required],
      direccionCabe: [, Validators.required],
      fechaRegistro: [],
      nroRucCabe: [, Validators.required],
      nroContrato: [, Validators.required],
      fechaContrato: [, Validators.required],
      productorId: [, Validators.required],
      ruc: [, Validators.required],
      cliente: [, Validators.required],
      floId: [, Validators.required],
      condicionEntrega: [, Validators.required],
      estadoPagoFactura: [],
      fechaPagoFactura:[],
      fechaEntrega: [, Validators.required],
      fechaFactura: [],
      pais: [],
      ciudad: [],
      producto: [, Validators.required],
      subProducto: [, Validators.required],
      moneda: [, Validators.required],
      precio: [, Validators.required],
      tipoProduccion: [],
      unidadMedida: [],
      certificadora: [],
      calidad: [, Validators.required],
      certificacion: [, Validators.required],
      grado: [],
      pesoSacoKG: [, Validators.required],
      cantidadDefectos: [, Validators.required],
      cantidadContenedores: [, Validators.required],
      responsableComercial: [, Validators.required],
      estado: [],
      file: new FormControl('', []),
      fileName: new FormControl('', []),
      pathFile: new FormControl('', []),
      calculo: [],
      empaque: [, Validators.required],
      tipo: [, Validators.required],
      totalSacos69Kg: [, Validators.required],
      observaciones: [],
      pesoKilos: [, Validators.required],
      contractWeight: [, Validators.required],
      harvestPeriod: [],
      contractType: [],
      invoiceIn: [],
      contractFixingDate: [],
      NetKilosQQ: [],
      NetKilosLB: [],
      FixationState: [],
      PriceLevelFixation: [],
      Differential2: [],
      PuTotalA: [],
      TotalBilling1: [],
      CreditNoteCommission: [],
      PUTotalB: [],
      TotalBilling2: [],
      ExpensesExpCosts: [],
      PUTotalC: [],
      TotalBilling3: [],
      numeroFactura: [],
      fechaEntregaProducto: [],
      nroContratoVenta: []
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
    this.GetCurrencies();
    this.GetMeasurementUnit();
    this.GetCalculations();
    this.GetPackaging();
    this.GetEstadoPagoFactura();
    this.GetQuality();
    this.GetProductionType();
    this.GetPackagingType();
    this.GetDegreePreparation();
    this.GetCertifiers();
    this.GetCertifications();
    this.GetHarvestPeriod();
    this.GetTypesContracts();
    this.GetInvoicesIn();
    this.GetFixationsStates();
    this.spinner.hide();
  }

  async GetHarvestPeriod() {
    this.listHarvestPeriod = [];
    const res = await this.maestroService.obtenerMaestros('PeriodoCosecha').toPromise();
    if (res.Result.Success) {
      this.listHarvestPeriod = res.Result.Data;
    }
  }

  async GetShipmentCondition() {
    this.listCondicionEmbarque = [];
    const res = await this.maestroService.obtenerMaestros('CondicionEmbarque').toPromise();
    if (res.Result.Success) {
      this.listCondicionEmbarque = res.Result.Data;
    }
  }

  async GetEstadoPagoFactura() {
    this.listEstadoPagoFactura = [];
    const res = await this.maestroService.obtenerMaestros('EstadoPagoFactura').toPromise();
    if (res.Result.Success) {
      this.listEstadoPagoFactura = res.Result.Data;
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

  // async GetLaboratorys() {
  //   const res = await this.maestroService.obtenerMaestros('Laboratorio').toPromise();
  //   if (res.Result.Success) {
  //     this.listLaboratorios = res.Result.Data;
  //   }
  // }

  // async GetStatusTrackingSamples() {
  //   const res = await this.maestroService.obtenerMaestros('EstadoMuestra').toPromise();
  //   if (res.Result.Success) {
  //     this.listEstadoSegMuestra = res.Result.Data;
  //   }
  // }

  // async GetShippingCompany() {
  //   const res = await this.maestroService.obtenerMaestros('Naviera').toPromise();
  //   if (res.Result.Success) {
  //     this.listNavieras = res.Result.Data;
  //   }
  // }

  async GetTypesContracts() {
    this.listContractType = [];
    const res = await this.maestroService.obtenerMaestros('TipoContrato').toPromise();
    if (res.Result.Success) {
      this.listContractType = res.Result.Data;
    }
  }

  async GetInvoicesIn() {
    this.listContractType = [];
    const res = await this.maestroService.obtenerMaestros('ContratoFacturarEn').toPromise();
    if (res.Result.Success) {
      this.listInvoiceIn = res.Result.Data;
    }
  }

  async GetFixationsStates() {
    this.listContractType = [];
    const res = await this.maestroService.obtenerMaestros('ContratoEstadoFijacion').toPromise();
    if (res.Result.Success) {
      this.listFixationState = res.Result.Data;
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

  ChangeProduct(event: any): void {
    this.GetSubProducts(event.Codigo);
  }

  async GetSubProducts(code: any) {
    const res = await this.maestroService.obtenerMaestros("SubProducto").toPromise();
    if (res.Result.Success) {
      this.listSubProductos = res.Result.Data.filter(x => x.Val1 == code);
    }
  }

  GetDataModalClientes(event: any): void {
    if (event[0].EmpresaProveedoraAcreedoraId)
      this.contratoEditForm.controls.productorId.setValue(event[0].EmpresaProveedoraAcreedoraId);
    if (event[0].Ruc)
      this.contratoEditForm.controls.ruc.setValue(event[0].Ruc);
    if (event[0].RazonSocial)
      this.contratoEditForm.controls.cliente.setValue(event[0].RazonSocial);
    if (event[0].FloId)
      this.contratoEditForm.controls.floId.setValue(event[0].FloId);
    this.modalService.dismissAll();
  }

  openModal(modalEmpresa: any): void {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  openModalLG(modal: any): void {
    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'lg', centered: true, scrollable: true });
  }

  GetRequest(): any {
    const form = this.contratoEditForm.value;
    return {
      ContratoCompraId: form.idContrato ? parseInt(form.idContrato) : 0,
      Numero: form.nroContrato ? form.nroContrato : '',
      ProductorId: form.idCliente ? parseInt(form.idCliente) : 0,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
      ContratoVentaId: form.nroContratoVenta ? form.nroContratoVenta : '',
      FloId: form.floId ? form.floId.toString() : '',
      CondicionEntregaId: form.condicionEntrega ? form.condicionEntrega : '',
      FechaEntrega: form.fechaEntrega ? form.fechaEntrega : '',
      FechaContrato: form.fechaContrato ? form.fechaContrato : '',
      FechaFacturacion : form.fechaPagoFactura? form.fechaPagoFactura: '',
      EstadoPagoFacturaId: form.estadoPagoFactura ? form.estadoPagoFactura : '',
      CalculoContratoId: form.calculo ? form.calculo : '',
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
      PesoEnContrato: form.contractWeight ? form.contractWeight : null,
      PesoKilos: this.pesoNetoKilos ? this.pesoNetoKilos : 0,
      PesoPorSaco: form.pesoSacoKG ? parseFloat(form.pesoSacoKG) : 0,
      PreparacionCantidadDefectos: form.cantidadDefectos ? parseFloat(form.cantidadDefectos) : 0,
      LaboratorioId: '',
      NumeroSeguimientoMuestra: '',
      EstadoMuestraId: '',
      // FechaEnvioMuestra: form.fecRecojoEnvioCurier ? form.fecRecojoEnvioCurier : null,
      FechaEnvioMuestra: null,
      // FechaRecepcionMuestra: form.fecRecepcionDestino ? form.fecRecepcionDestino : null,
      FechaRecepcionMuestra: null,
      ObservacionMuestra: form.observaciones ? form.observaciones : '',



      NumeroFactura: form.numeroFactura? form.numeroFactura : '',
      FechaFactura: form.fechaFactura ? form.fechaFactura : '',
      PaisDestinoId: form.pais ? form.pais : '',
      DepartamentoDestinoId: form.ciudad ? form.ciudad : '',
      PeriodosCosecha: form.harvestPeriod ? form.harvestPeriod : '',
      
      CantidadContenedores: form.cantidadContenedores ? parseFloat(form.cantidadContenedores) : 0,

      // LaboratorioId: form.laboratorio ? form.laboratorio : '',
      
      // NumeroSeguimientoMuestra: form.truckingNumber ? form.truckingNumber : '',
      
      // EstadoMuestraId: form.estadoSegMuestras ? form.estadoSegMuestras : '',
     
      // NavieraId: form.naviera ? form.naviera : '',
      NavieraId: '',
      NombreArchivo: form.fileName ? form.fileName : '',
      DescripcionArchivo: '',
      PathArchivo: form.pathFile ? form.pathFile : '',
      EmpaqueId: form.empaque ? form.empaque : '',
      TipoId: form.tipo ? form.tipo : '',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      EstadoId: form.estado ? form.estado : '01',
      FacturarEnId: form.invoiceIn ? form.invoiceIn : null,
      FechaFijacionContrato: form.contractFixingDate ? form.contractFixingDate : null,
      KilosNetosQQ: this.kilosNetosQQ_A ? this.kilosNetosQQ_A : 0,
      EstadoFijacionId: form.FixationState ? form.FixationState : null,
      KilosNetosLB: this.kilosNetosLB_B ? this.kilosNetosLB_B : 0,
      PrecioNivelFijacion: form.PriceLevelFixation ? form.PriceLevelFixation : 0,
      Diferencial: form.Differential2 ? form.Differential2 : 0,
      PUTotalA: this.precioUnitarioTotalA ? this.precioUnitarioTotalA : 0,
      PUTotalB: this.precioUnitarioTotalB ? this.precioUnitarioTotalB : 0,
      PUTotalC: this.precioUnitarioTotalC ? this.precioUnitarioTotalC : 0,
      NotaCreditoComision: form.CreditNoteCommission ? form.CreditNoteCommission : 0,
      GastosExpCostos: form.ExpensesExpCosts ? form.ExpensesExpCosts : 0,
      TotalFacturar1: this.totalFacturar1 ? this.totalFacturar1 : 0,
      TotalFacturar2: this.totalFacturar2 ? this.totalFacturar2 : 0,
      TotalFacturar3: this.totalFacturar3 ? this.totalFacturar3 : 0,
      TipoContratoId: form.contractType ? form.contractType : null
    }
  }

  Guardar(): void {
    if (!this.contratoEditForm.invalid) {
      const form = this;
      if (this.vId > 0) {

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la modificación del contrato?.`, function (result) {
          if (result.isConfirmed) {
            form.Update();
          }
        });

      } else if (this.vId <= 0) {

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la creación del nuevo contrato?.`, function (result) {
          if (result.isConfirmed) {
            form.Create();
          }
        });

      }
    }
  }

  onChangeEstadoFijacion(event: any)
  {
    const contractFixingDate = this.contratoEditForm.controls.contractFixingDate;
    if (event.Codigo == "02")
      {
       
        contractFixingDate.setValidators(Validators.required);
        contractFixingDate.updateValueAndValidity();
      }
      else
      {
        contractFixingDate.clearValidators();
        contractFixingDate.updateValueAndValidity();
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
          if (res.Result.ErrCode == '02') {
            this.alertUtil.alertError('Validación', 'Ya existe un Contrato con el mismo número.');

          } else {
            this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
              "Se registro correctamente el contrato.",
              () => {
                this.Cancelar();
              });
          }
        }
        else {

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
          if (res.Result.Data) {
            this.AutocompleteForm(res.Result.Data);
          } else {
            this.spinner.hide();
            this.alertUtil.alertWarningCallback('Advertencia', 'El contrato no existe.', () => {
              this.Cancelar();
            });
          }
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
        this.contratoEditForm.controls.ruc.setValue(data.NumeroCliente);
      if (data.Cliente)
        this.contratoEditForm.controls.cliente.setValue(data.Cliente);
      if (data.FloId)
        this.contratoEditForm.controls.floId.setValue(data.FloId);
      if (data.CondicionEmbarqueId) {
        await this.GetShipmentCondition();
        this.contratoEditForm.controls.condicionEntrega.setValue(data.CondicionEmbarqueId);
      }

      if (data.EstadoPagoFacturaId) {
        await this.GetEstadoPagoFactura();
        this.contratoEditForm.controls.estadoPagoFactura.setValue(data.EstadoPagoFacturaId);
      }

      if (data.FechaPagoFactura)
        this.contratoEditForm.controls.fechaPagoFactura.setValue(data.FechaPagoFactura.substring(0, 10));

      if (data.FechaEmbarque)
        this.contratoEditForm.controls.fechaEmbarque.setValue(data.FechaEmbarque.substring(0, 10));
      if (data.FechaContrato)
        this.contratoEditForm.controls.fechaContrato.setValue(data.FechaContrato.substring(0, 10));
      // if (data.FechaFacturacion)
      //   this.contratoEditForm.controls.fechaFactExp.setValue(data.FechaFacturacion.substring(0, 10));
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
        if (data.ProductoId)
          await this.GetSubProducts(data.ProductoId);
        this.contratoEditForm.controls.subProducto.setValue(data.SubProductoId);
      }
      if (data.PesoKilos) {
        this.contratoEditForm.controls.pesoKilos.setValue(data.PesoKilos.toFixed(2));
        this.reqAsignacionContratoAcopio.pesoNetoKGOro = data.PesoKilos;
        this.pesoNetoKilos = data.PesoKilos;
      }
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
      if (data.PeriodosCosecha) {
        await this.GetHarvestPeriod();
        this.contratoEditForm.controls.harvestPeriod.setValue(data.PeriodosCosecha);
      }

      if (data.UnidadMedicionId) {
        await this.GetMeasurementUnit();
        this.contratoEditForm.controls.unidadMedida.setValue(data.UnidadMedicionId);
      }

      this.contratoEditForm.controls.responsableComercial.setValue(data.UsuarioRegistro)

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

      if (data.CantidadContenedores)
        this.contratoEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);


      if (data.FechaRegistro) {
        this.contratoEditForm.controls.fechaRegistro.setValue(data.FechaRegistro.substring(0, 10));
        this.fechaRegistro = data.FechaRegistro.substring(0, 10);
      }
      if (data.EstadoId) {
        this.contratoEditForm.controls.estado.setValue(data.EstadoId);
        this.reqAsignacionContratoAcopio.estadoContratoId = data.EstadoId;
      }
      this.contratoEditForm.controls.fileName.setValue(data.NombreArchivo);
      this.contratoEditForm.controls.pathFile.setValue(data.PathArchivo);
      this.fileName = data.NombreArchivo
      // if (data.LaboratorioId) {
      //   await this.GetLaboratorys();
      //   this.contratoEditForm.controls.laboratorio.setValue(data.LaboratorioId);
      // }
      // if (data.FechaEnvioMuestra && data.FechaEnvioMuestra.substring(0, 10) != "0001-01-01")
      //   this.contratoEditForm.controls.fecRecojoEnvioCurier.setValue(data.FechaEnvioMuestra.substring(0, 10));

      // if (data.NumeroSeguimientoMuestra)
      //   this.contratoEditForm.controls.truckingNumber.setValue(data.NumeroSeguimientoMuestra);

      // if (data.EstadoMuestraId) {
      //   this.GetStatusTrackingSamples();
      //   this.contratoEditForm.controls.estadoSegMuestras.setValue(data.EstadoMuestraId);
      // }
      if (data.TotalSacos)
        this.contratoEditForm.controls.totalSacos69Kg.setValue(data.TotalSacos);
      // if (data.FechaRecepcionMuestra && data.FechaRecepcionMuestra.substring(0, 10) != "0001-01-01")
      //   this.contratoEditForm.controls.fecRecepcionDestino.setValue(data.FechaRecepcionMuestra.substring(0, 10));

      if (data.ObservacionMuestra)
        this.contratoEditForm.controls.observaciones.setValue(data.ObservacionMuestra);

      // if (data.NavieraId) {
      //   await this.GetShippingCompany();
      //   this.contratoEditForm.controls.naviera.setValue(data.NavieraId);
      // }
      if (data.PesoEnContrato)
        this.contratoEditForm.controls.contractWeight.setValue(data.PesoEnContrato);
      if (data.FacturarEnId)
        this.contratoEditForm.controls.invoiceIn.setValue(data.FacturarEnId);
      if (data.FechaFijacionContrato)
        this.contratoEditForm.controls.contractFixingDate.setValue(data.FechaFijacionContrato.substring(0, 10));
      if (data.KilosNetosQQ) {
        this.kilosNetosQQ_A = data.KilosNetosQQ;
        this.reqAsignacionContratoAcopio.pesoNetoQQ = data.KilosNetosQQ;
        this.contratoEditForm.controls.NetKilosQQ.setValue(data.KilosNetosQQ.toFixed(2));
      }
      if (data.KilosNetosLB) {
        this.kilosNetosLB_B = data.KilosNetosLB;
        this.contratoEditForm.controls.NetKilosLB.setValue(data.KilosNetosLB.toFixed(2));
      }
      if (data.EstadoFijacionId)
        this.contratoEditForm.controls.FixationState.setValue(data.EstadoFijacionId);
      if (data.PrecioNivelFijacion)
        this.contratoEditForm.controls.PriceLevelFixation.setValue(data.PrecioNivelFijacion);
      if (data.Diferencial != null)
        this.contratoEditForm.controls.Differential2.setValue(data.Diferencial);
      if (data.PUTotalA) {
        this.precioUnitarioTotalA = data.PUTotalA;
        this.contratoEditForm.controls.PuTotalA.setValue(data.PUTotalA.toFixed(2));
      }
      if (data.TotalFacturar1) {
        this.totalFacturar1 = data.TotalFacturar1;
        this.contratoEditForm.controls.TotalBilling1.setValue(data.TotalFacturar1.toFixed(2));
      }
      if (data.NotaCreditoComision != null && data.NotaCreditoComision != undefined)
        this.contratoEditForm.controls.CreditNoteCommission.setValue(data.NotaCreditoComision);
      if (data.PUTotalB) {
        this.precioUnitarioTotalB = data.PUTotalB;
        this.contratoEditForm.controls.PUTotalB.setValue(data.PUTotalB.toFixed(2));
      }
      if (data.TotalFacturar2) {
        this.totalFacturar2 = data.TotalFacturar2;
        this.contratoEditForm.controls.TotalBilling2.setValue(data.TotalFacturar2.toFixed(2));
      }
      if (data.GastosExpCostos)
        this.contratoEditForm.controls.ExpensesExpCosts.setValue(data.GastosExpCostos);
      if (data.PUTotalC) {
        this.precioUnitarioTotalC = data.PUTotalC;
        this.contratoEditForm.controls.PUTotalC.setValue(data.PUTotalC.toFixed(2));
      }
      if (data.TotalFacturar3) {
        this.totalFacturar3 = data.TotalFacturar3;
        this.contratoEditForm.controls.TotalBilling3.setValue(data.TotalFacturar3.toFixed(2));
      }
      if (data.KGPergaminoAsignacion)
        this.reqAsignacionContratoAcopio.KGPergamino = data.KGPergaminoAsignacion;
      if (data.PorcentajeRendimientoAsignacion)
        this.reqAsignacionContratoAcopio.porcenRendimiento = data.PorcentajeRendimientoAsignacion;
      if (data.TotalKGPergaminoAsignacion)
        this.reqAsignacionContratoAcopio.totalKGPergamino = data.TotalKGPergaminoAsignacion;
      if (data.SaldoPendienteKGPergaminoAsignacion)
        this.reqAsignacionContratoAcopio.pendienteKGPergamino = data.SaldoPendienteKGPergaminoAsignacion;
      if (data.TipoContratoId) {
        await this.GetTypesContracts();
        this.contratoEditForm.controls.contractType.setValue(data.TipoContratoId);
      }
      if (data.EstadoContrato)
        this.estadoContrato = data.EstadoContrato;
      this.spinner.hide();
    } else {
    }
    this.spinner.hide();
  }

  Descargar() {
    var nombreFile = this.contratoEditForm.value.fileName;
    var rutaFile = this.contratoEditForm.value.pathFile;
    window.open(this.url + '/DescargarArchivo?' + "path=" + rutaFile /*+ "&name=" + nombreFile*/, '_blank');
  }

  fileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.contratoEditForm.patchValue({
        file: file
      });
      this.contratoEditForm.get('file').updateValueAndValidity()
    }
  }
  Cancelar(): void {
    this.router.navigate(['/exportador/operaciones/contrato/list']);
  }

  CalculateNetWeightKilos() {
    let totalbags = this.contratoEditForm.value.totalSacos69Kg ? parseFloat(this.contratoEditForm.value.totalSacos69Kg) : 0;
    let sackweight = this.contratoEditForm.value.pesoSacoKG ? parseFloat(this.contratoEditForm.value.pesoSacoKG) : 0;
    let netweightkilos = totalbags * sackweight;
    let netkilosQQ = netweightkilos / 46;
    let netkilosLB = netweightkilos * 2.20462;
    if (netkilosLB > 0) {
      netkilosLB = parseFloat(netkilosLB.toFixed(2));
    }
    this.reqAsignacionContratoAcopio.pesoNetoKGOro = netweightkilos;
    this.kilosNetosLB_B = netkilosLB;
    this.kilosNetosQQ_A = netkilosQQ;
    this.reqAsignacionContratoAcopio.pesoNetoQQ = netkilosQQ;
    this.pesoNetoKilos = netweightkilos;
    this.contratoEditForm.controls.pesoKilos.setValue(netweightkilos.toFixed(2));
    this.contratoEditForm.controls.NetKilosQQ.setValue(netkilosQQ.toFixed(2));
    this.contratoEditForm.controls.NetKilosLB.setValue(netkilosLB.toFixed(2));
    this.ChangeFacturar();
  }

  CalculatePUTotalA() {
    let priceLevel = this.contratoEditForm.value.PriceLevelFixation ? parseFloat(this.contratoEditForm.value.PriceLevelFixation) : 0;
    let differential = this.contratoEditForm.value.Differential2 ? parseFloat(this.contratoEditForm.value.Differential2) : 0;
    let putotal = priceLevel + differential;
    this.precioUnitarioTotalA = putotal;
    this.contratoEditForm.controls.PuTotalA.setValue(putotal.toFixed(2));
    this.CalculatePUTotalB();
    this.CalculatePUTotalC();
    this.ChangeFacturar();
  }

  CalculatePUTotalB() {
    let putotalA = this.precioUnitarioTotalA ? this.precioUnitarioTotalA : 0;
    let creditComission = this.contratoEditForm.value.CreditNoteCommission ? parseFloat(this.contratoEditForm.value.CreditNoteCommission) : 0;
    let putotalB = putotalA + creditComission;
    this.precioUnitarioTotalB = putotalB;
    this.contratoEditForm.controls.PUTotalB.setValue(putotalB.toFixed(2));
    this.ChangeFacturar();
  }

  CalculatePUTotalC() {
    let putotalB = this.precioUnitarioTotalB ? this.precioUnitarioTotalB : 0;
    let expenses = this.contratoEditForm.value.ExpensesExpCosts ? parseFloat(this.contratoEditForm.value.ExpensesExpCosts) : 0;
    let putotal = putotalB + expenses;
    this.precioUnitarioTotalC = putotal;
    this.contratoEditForm.controls.PUTotalC.setValue(putotal.toFixed(2));
    this.ChangeFacturar();
  }

  CalculateTotalBilling1() {
    let kgnetoslb = this.kilosNetosLB_B ? this.kilosNetosLB_B : 0;
    let kgnetosqq = this.kilosNetosQQ_A ? this.kilosNetosQQ_A : 0;
    let putotal = this.precioUnitarioTotalA ? this.precioUnitarioTotalA : 0;
    let total = 0;
    if (this.contratoEditForm.value.invoiceIn === '01') {
      total = kgnetoslb * putotal;
    } else {
      total = kgnetosqq * putotal;
    }
    if (total) {
      this.totalFacturar1 = total;
      this.contratoEditForm.controls.TotalBilling1.setValue(total.toFixed(2));
    }
  }

  CalculateTotalBilling2() {
    let kgnetoslb = this.kilosNetosLB_B ? this.kilosNetosLB_B : 0;
    let kgnetosqq = this.kilosNetosQQ_A ? this.kilosNetosQQ_A : 0;
    let putotal = this.precioUnitarioTotalB ? this.precioUnitarioTotalB : 0;
    let total = 0;
    if (this.contratoEditForm.value.invoiceIn === '01') {
      total = kgnetoslb * putotal;
    } else {
      total = kgnetosqq * putotal;
    }
    if (total) {
      this.totalFacturar2 = total;
      this.contratoEditForm.controls.TotalBilling2.setValue(total.toFixed(2));
    }
  }

  CalculateTotalBilling3() {
    let kgnetoslb = this.kilosNetosLB_B ? this.kilosNetosLB_B : 0;
    let kgnetosqq = this.kilosNetosQQ_A ? this.kilosNetosQQ_A : 0;
    let putotal = this.precioUnitarioTotalC ? this.precioUnitarioTotalC : 0;
    let total = 0;
    if (this.contratoEditForm.value.invoiceIn === '01') {
      total = kgnetoslb * putotal;
    } else {
      total = kgnetosqq * putotal;
    }
    if (total) {
      this.totalFacturar3 = total;
      this.contratoEditForm.controls.TotalBilling3.setValue(total.toFixed(2));
    }
  }

  ChangeFacturar() {
    this.CalculateTotalBilling1();
    this.CalculateTotalBilling2();
    this.CalculateTotalBilling3();
  }

  UpdateForm(e) {
    this.contratoEditForm.controls.estado.setValue('02');
  }

  addValidations(): void {

    
    const CreditNoteCommission = this.contratoEditForm.controls.CreditNoteCommission;
    const ExpensesExpCosts = this.contratoEditForm.controls.ExpensesExpCosts;
    const PriceLevelFixation = this.contratoEditForm.controls.PriceLevelFixation;
    const PuTotalA = this.contratoEditForm.controls.PuTotalA;
    const PUTotalB = this.contratoEditForm.controls.PUTotalB;
    const PUTotalC = this.contratoEditForm.controls.PUTotalC;
    const Differential2 = this.contratoEditForm.controls.Differential2;
    const TotalBilling1 = this.contratoEditForm.controls.TotalBilling1;
    const TotalBilling2 = this.contratoEditForm.controls.TotalBilling2;
    const TotalBilling3 = this.contratoEditForm.controls.TotalBilling3;

    const FixationState = this.contratoEditForm.controls.FixationState;
    const InvoiceIn = this.contratoEditForm.controls.invoiceIn;

    // if (this.tipoEmpresaId == '01') //Cooperativa
    //  {
    
    CreditNoteCommission.setValidators(Validators.required);
    ExpensesExpCosts.setValidators(Validators.required);
    PriceLevelFixation.setValidators(Validators.required);
    PuTotalA.setValidators(Validators.required);
    PUTotalB.setValidators(Validators.required);
    PUTotalC.setValidators(Validators.required);
    Differential2.setValidators(Validators.required);
    TotalBilling1.setValidators(Validators.required);
    TotalBilling2.setValidators(Validators.required);
    TotalBilling3.setValidators(Validators.required);
    FixationState.setValidators(Validators.required);
    InvoiceIn.setValidators(Validators.required);

    // } else {
    //   contractFixingDate.clearValidators();
    //   CreditNoteCommission.clearValidators();
    //   ExpensesExpCosts.clearValidators();
    //   PriceLevelFixation.clearValidators();
    //   PuTotalA.clearValidators();
    //   PUTotalB.clearValidators();
    //   PUTotalC.clearValidators();
    //   Differential2.clearValidators();
    //   TotalBilling1.clearValidators();
    //   TotalBilling2.clearValidators();
    //   TotalBilling3.clearValidators();
    //   FixationState.clearValidators();
    //   InvoiceIn.clearValidators();
    // }

   
    CreditNoteCommission.updateValueAndValidity();
    ExpensesExpCosts.updateValueAndValidity();
    PriceLevelFixation.updateValueAndValidity();
    PuTotalA.updateValueAndValidity();
    PUTotalB.updateValueAndValidity();
    PUTotalC.updateValueAndValidity();
    Differential2.updateValueAndValidity();
    TotalBilling1.updateValueAndValidity();
    TotalBilling2.updateValueAndValidity();
    TotalBilling3.updateValueAndValidity();
    InvoiceIn.updateValueAndValidity();
    FixationState.updateValueAndValidity();

    const locFechaPagoFactura = this.contratoEditForm.controls.fechaPagoFactura;
    this.contratoEditForm.controls.estadoPagoFactura.valueChanges.subscribe((spf: any) => {
      if (spf === '01') {
        locFechaPagoFactura.setValidators(Validators.required);
      } else {
        locFechaPagoFactura.clearValidators();
      }
      locFechaPagoFactura.updateValueAndValidity();
    });
  }

  ChangeEstadoPagoFactura() {
    if (!this.contratoEditForm.value.estadoPagoFactura || this.contratoEditForm.value.estadoPagoFactura === '02') {
      this.contratoEditForm.controls.fechaPagoFactura.reset();
    }
  }

}
