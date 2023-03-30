import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ReqRegistrarPesadoNotaIngreso } from '../../../../../../services/models/req-registrar-notaingreso';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { SocioFincaService } from './../../../../../../services/socio-finca.service';
import { PesadoCafePlantaComponent } from './pesadocafe/pesadocafeplanta.component';
import {AuthService} from './../../../../../../services/auth.service';
import { TransportistaService } from './../../../../../../services/transportista.service';

@Component({
  selector: 'app-notaingreso-edit',
  templateUrl: './notaingreso-edit.component.html',
  styleUrls: ['./notaingreso-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class NotaIngresoEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  @ViewChild(DatatableComponent) tableTranspotistas: DatatableComponent;
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  esEdit = false;
  consultaTransportistas: FormGroup;
  submitted = false;
  submittedEdit = false;
  closeResult: string;
  notaIngredoFormEdit: FormGroup;
  listaProducto: any[];
  //nuevas variables
 
  
  //nuevas variables
  listaSubProducto: any[];
  listaTipoProveedor: any[];
  listaTipoProduccion: any[];
  listaCertificacion: any[];
  listaCertificadora: any[];
  //nuevas variables 
  listaCampania:any[];
  listaConcepto:any[];
  selectedCampania:any;
  selectedConcepto:any;
  //nuevas variables
  selectedCertificacion: any;
  selectedCertificadora: any;
  selectTipoSocio: any;
  selectTipoProveedor: any;
  selectTipoProduccion: any;
  selectedEstado: any;
  selectProducto: any;
  selectSubProducto: any;
  selectedTipoDocumento: any;
  selectOrganizacion = [];
  listSub: any[];
  selected = [];
  popupModel;
  vSessionUser: any;
  errorGeneral: any = { isError: false, errorMessage: '' };
  errorGrilla: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  listTipoSocio: any[];
  listaTipoDocumento: any[];
  tipoSocio = "01";
  tipoTercero = "02";
  tipoIntermediario = "03";
  tipoProduccionConvencional = "02";
  id: Number = 0;
  status: string = "";
  estado = "";
  numeroNotaIngreso: "";
  fechaRegistro: any;
  fechaPesado: any;
  responsable: "";
  disabledControl: string = '';
  disabledNota: string = '';
  viewTagSeco: boolean = false;
  detalle: any;
  unidadMedidaPesado: any;
  form: string = "notaingresoplanta"
  btnGuardar = true;
  productoOroVerde = '02';
  estadoPesado = "01";
  estadoAnalizado = "02";
  estadoAnulado = "00";
  estadoEnviadoAlmacen = "03";
  PrdCafePergamino = "01";
  SubPrdSeco = "02";
  @ViewChild(PesadoCafePlantaComponent) child;
  @ViewChild(DatatableComponent) tableProveedor: DatatableComponent;
  idPlantEntryNote = 0;
  readonly: boolean;
  flagOcultarPesado = false;
  flagOcultarExportable = false;
  rowsDetails = [];
  login: ILogin;
  listaDetalleEmpaque: any[];
  formControlEmpaque: FormGroup;
  selectedDetalleEmpaque: any[] = [];
  listaDetalleTipoEmpaque: any[];
  formControlTipoEmpaque: FormGroup;
  selectedDetalleTipoEmpaque: any[] = [];
  listaDetalleSubProducto: any[];
  formControlSubProducto: FormGroup;
  selectedDetalleSubProducto: any[] = [];
  listaMotivo: any[];
  selectedMotivoo: any
  CodigoSacao = "01";
  CodigoTipoYute = "01";
  kilos = 7;
  tara = 0.2;
  taraYute = 0.7
  submittedT = false;
  errorTransportista: any = { isError: false, errorMessage: '' };
  selectedT = [];
  filtrosTransportista: any = {};
  public rowsT = [];
  private tempDataT = [];
  public limitRefT = 10;
  public ColumnMode = ColumnMode; 
  constructor(private modalService: NgbModal,
    private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private notaIngresoService: NotaIngresoService,
    private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private socioFinca: SocioFincaService,
    private authService : AuthService,
    private transportistaService: TransportistaService
  ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  ngOnInit(): void {
    this.cargarForm();
    this.cargarcombos();
    this.login = JSON.parse(localStorage.getItem("user"));
    this.vSessionUser = JSON.parse(localStorage.getItem("user"));
    this.route.queryParams
      .subscribe(params => {
        this.status = params.status;
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
          this.obtenerDetalle()
        }
        else { this.disabledControl = 'disabled'; }
      }
      );
      this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  cargarForm() {

    this.notaIngredoFormEdit = this.fb.group(
      {

        guiaremision: ['',],
        fecharemision: ['',],
        tipoProduccion: ['', Validators.required],
        codigoOrganizacion: ['',],
        nombreOrganizacion: ['',Validators.required],
        producto: ['', Validators.required],
        direccion: ['',Validators.required],
        rucOrganizacion: ['',Validators.required],
        subproducto: ['', Validators.required],

        certificacion: ['', ],
        certificadora: ['', ],
        campania:['', Validators.required],
        concepto:['', Validators.required],
        motivo:['',],

        transportista: new FormControl('', []),
        ruc: new FormControl('', []),
        placaVehiculo: new FormControl('', []),
        chofer: new FormControl('', []),
        numeroBrevete: new FormControl('', []),
        marca: new FormControl('', []),
        observacion: new FormControl('', []),

        pesado: this.fb.group({
          motivo: new FormControl('', [Validators.required]),
          empaque: new FormControl('', [Validators.required]),
          tipo: new FormControl('', [Validators.required]),
          cantidad: new FormControl('', [Validators.required]),
          kilosBrutos: new FormControl('', [Validators.required]),
          pesoSaco: new FormControl('', []),
          calidad: new FormControl('', []),
          tara: new FormControl('', [Validators.required]),
          kilosNetos: new FormControl('', [Validators.required]),
          grado: new FormControl('', []),
          cantidadDefectos: new FormControl('', []),
          porcentajeRendimiento: new FormControl('', []),
          porcentajeHumedad: new FormControl('', [Validators.required]),
          transportista: new FormControl('', []),
          ruc: new FormControl('', []),
          placaVehiculo: new FormControl('', []),
          chofer: new FormControl('', []),
          numeroBrevete: new FormControl('', []),
          marca: new FormControl('', []),
          observacion: new FormControl('', [])
        })
      });
    this.desactivarControl("");
  }
  seleccionarTransportista(e) {
    this.notaIngredoFormEdit.controls.transportista.setValue(e[0].RazonSocial);
    this.notaIngredoFormEdit.controls.ruc.setValue(e[0].Ruc);
    this.notaIngredoFormEdit.controls.placaVehiculo.setValue(e[0].PlacaTractor);
    this.notaIngredoFormEdit.controls.chofer.setValue(e[0].Conductor);
    this.notaIngredoFormEdit.controls.numeroBrevete.setValue(e[0].Licencia);
    this.notaIngredoFormEdit.controls.marca.setValue(e[0].MarcaTractor);

    /*
    this.tagNotadeSalida.get('propietario').setValue(e[0].RazonSocial);
    this.tagNotadeSalida.get('domiciliado').setValue(e[0].Direccion);
    this.tagNotadeSalida.get('ruc').setValue(e[0].Ruc);
    this.tagNotadeSalida.get('conductor').setValue(e[0].Conductor);
    this.tagNotadeSalida.get('brevete').setValue(e[0].Licencia);
    this.tagNotadeSalida.get('codvehicular').setValue(e[0].ConfiguracionVehicular);
    this.tagNotadeSalida.get('marca').setValue(e[0].MarcaTractor);
    this.tagNotadeSalida.get('placa').setValue(e[0].PlacaTractor);
    this.tagNotadeSalida.get('numconstanciamtc').setValue(e[0].NumeroConstanciaMTC);
    */
    this.modalService.dismissAll();
  }
  openModal(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("ProductoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaProducto = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoProduccionPlanta", function (res) {
      if (res.Result.Success) {
        form.listaTipoProduccion = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("TipoCertificacionPlanta", function (res) {
      if (res.Result.Success) {
        form.listaCertificacion = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("EntidadCertificadoraPlanta", function (res) {
      if (res.Result.Success) {
        form.listaCertificadora = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("Empaque", function (res) {
      if (res.Result.Success) {
        form.listaDetalleEmpaque = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoEmpaque", function (res) {
      if (res.Result.Success) {
        form.listaDetalleTipoEmpaque = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("SubProductoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaDetalleSubProducto = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("MotivoIngresoPlanta", function (res) {
      if (res.Result.Success) {
        //form.listaMotivo = res.Result.Data.filter(x => x.Codigo != '04');
        let result = [];
        result = res.Result.Data.filter(x => x.Val1  == 'S');
        form.listaMotivo = result;
      }
    });
    
    this.cargaCampania();
   // this.cargaConceptos();

  }
  async cargarEmpaque() {
    var data = await this.maestroService.obtenerMaestros("Empaque").toPromise();
    if (data.Result.Success) {
      this.listaDetalleEmpaque = data.Result.Data;
    }
  }

  formEmpaques(data: any) {
    let groupsEmpaque = {}
    data.Detalle.forEach(obj => {
      groupsEmpaque[obj.NotaIngresoPlantaDetalleId + 'empaque'] = new FormControl('', []);
      groupsEmpaque[obj.NotaIngresoPlantaDetalleId + 'tipoempaque'] = new FormControl('', []);
      groupsEmpaque[obj.NotaIngresoPlantaDetalleId + 'subproducto'] = new FormControl('', []);
    });
   this.formControlEmpaque = new FormGroup(groupsEmpaque);
  }
  formTipoEmpaque(data: any) {
    let groupsTipoEmpaque = {}
    data.Detalle.forEach(obj => {
      groupsTipoEmpaque[obj.NotaIngresoPlantaDetalleId + 'tipoempaque'] = new FormControl('', []);

    });
   this.formControlTipoEmpaque = new FormGroup(groupsTipoEmpaque);
  }
  formSubProducto(data: any) {
    let groupsSubProducto = {}
    data.Detalle.forEach(obj => {
      groupsSubProducto[obj.NotaIngresoPlantaDetalleId + 'subproducto'] = new FormControl('', []);

    });
   this.formControlSubProducto= new FormGroup(groupsSubProducto);
  }

  async cargaCampania() {
    var data = await this.maestroService.ConsultarCampanias("01").toPromise();
    if (data.Result.Success) {
      this.listaCampania = data.Result.Data;
    }
  }

  GetListConceptos(event: any): void {
    this.cargaConceptos(event.Codigo);
  }
    async cargaConceptos(codigo: any) {

    var data = await this.maestroService.ConsultarConceptos("01").toPromise();
    if (data.Result.Success) {
     // this.listaConcepto = data.Result.Data;
     this.listaConcepto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }

  }

  ocultarSubProducto(filterProducto)
    {
      
    let subproducto = this.notaIngredoFormEdit.get('subproducto').value;
    this.validacionPorcentajeRend(filterProducto, subproducto);
    this.cargarSubProducto(filterProducto);
    this.desactivarControl(filterProducto);
    if(filterProducto == '02') //Exportable
    {
      //OCULTAR PESADO
      this.flagOcultarPesado = false;
      this.flagOcultarExportable = true;
      //this.notaIngredoFormEdit.get("pesado").reset();
      this.notaIngredoFormEdit.get("pesado").disable();
      this.notaIngredoFormEdit.controls["subproducto"].disable();
      //this.notaIngredoFormEdit.get('guiaremision').setValidators([]);
      //this.notaIngredoFormEdit.get('guiaremision').updateValueAndValidity();
      
      //this.notaIngredoFormEdit.get('fecharemision').setValidators([]);
      //this.notaIngredoFormEdit.get('fecharemision').updateValueAndValidity();

      this.notaIngredoFormEdit.get('motivo').setValidators([Validators.required]);
      this.notaIngredoFormEdit.get('motivo').updateValueAndValidity();

    }else{
       //MOSTRAR PESADO
       //this.notaIngredoFormEdit.get('guiaremision').setValidators([Validators.required]);
       //this.notaIngredoFormEdit.get('guiaremision').updateValueAndValidity();

       //this.notaIngredoFormEdit.get('fecharemision').setValidators([Validators.required]);
       //this.notaIngredoFormEdit.get('fecharemision').updateValueAndValidity();

       this.notaIngredoFormEdit.get("pesado").enable();
       this.notaIngredoFormEdit.get('motivo').setValidators([]);
       this.notaIngredoFormEdit.get('motivo').updateValueAndValidity();

       this.flagOcultarPesado = true;
       this.flagOcultarExportable = false;
       this.rowsDetails = [];
       this.notaIngredoFormEdit.controls["subproducto"].enable();
    }
    }
  
  changeSubProducto(e) 
  {
    this.ocultarSubProducto(e.Codigo);  

  }
  async addRowDetail() {
    
    this.rowsDetails = [...this.rowsDetails, {
      NotaIngresoPlantaDetalleId: 0,
      NotaIngresoPlantaId: 0,
      EmpaqueId: '',
      TipoId: '',
      SubProductoId:'',
      KilosBrutos: 0,
      KilosNetos: 0,
      Tara: 0
    }];
  }
  DeleteRowDetail(index: any): void {
    this.rowsDetails.splice(index, 1);
    this.rowsDetails = [...this.rowsDetails];
  }
  filterUpdateT(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempDataT.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rowsT = temp;
    this.tableTranspotistas.offset = 0;
  }

  UpdateValuesGridDetails(event: any, index: any, prop: any,  row: any): void {
    var x = row;
    if (prop === 'Cantidad'){
      this.rowsDetails[index].Cantidad = parseFloat(event.target.value);
      this.calcularTara( this.rowsDetails[index].Cantidad, this.rowsDetails[index].EmpaqueId, this.rowsDetails[index].TipoId, this.rowsDetails[index].KilosBrutos,index );
    }
    else if (prop == 'EmpaqueId'){
      this.rowsDetails[index].EmpaqueId = event.Codigo;
      this.calcularTara( this.rowsDetails[index].Cantidad, this.rowsDetails[index].EmpaqueId, this.rowsDetails[index].TipoId, this.rowsDetails[index].KilosBrutos,index );
    }
    else if (prop == 'TipoId'){
      this.rowsDetails[index].TipoId = event.Codigo;
      this.calcularTara( this.rowsDetails[index].Cantidad, this.rowsDetails[index].EmpaqueId, this.rowsDetails[index].TipoId, this.rowsDetails[index].KilosBrutos,index );
    }else if (prop == 'SubProductoId'){
      this.rowsDetails[index].SubProductoId = event.Codigo;
    }
    else if (prop == 'KilosBrutos'){
      this.rowsDetails[index].KilosBrutos = parseFloat(event.target.value);
      this.calcularTara( this.rowsDetails[index].Cantidad, this.rowsDetails[index].EmpaqueId, this.rowsDetails[index].TipoId, this.rowsDetails[index].KilosBrutos,index );
    }
  }
  calcularTara(cantidad, empaque, tipo,kilosBrutos,index) {
  
    var valor = 0;
    if (empaque == this.CodigoSacao && tipo == this.CodigoTipoYute) {
      var valor = cantidad * this.taraYute;
    } else if (empaque == this.CodigoSacao && tipo != this.CodigoTipoYute) {
      var valor = cantidad * this.tara;
    }


    var tara = Math.round((valor + Number.EPSILON) * 100) / 100
    //this.pesadoFormGroup.controls['tara'].setValue(tara);
    this.rowsDetails[index].Tara = tara
    this.calcularKilosNetos(tara,kilosBrutos,index);
  }
  calcularKilosNetos(tara, kilosBrutos,index){
 
    var valor = kilosBrutos - tara;
    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.rowsDetails[index].KilosNetos = valorRounded
    //this.pesadoFormGroup.controls['kilosNetos'].setValue(valorRounded);
  }


  imprimir(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaIngresoPlanta/GenerarPDFNotaIngreso?id=${this.id}&empresaId=${this.vSessionUser.Result.Data.EmpresaId}`;
    link.download = "GuiaRemision.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }
  desactivarControl(codigo) {
    if (codigo != this.productoOroVerde) {
      //this.notaIngredoFormEdit.get("pesado").get("pesoSaco").setValue("");
      this.notaIngredoFormEdit.get("pesado").get("calidad").setValue([]);
      this.notaIngredoFormEdit.get("pesado").get("grado").setValue([]);
      this.notaIngredoFormEdit.get("pesado").get("cantidadDefectos").setValue("");
      //this.notaIngredoFormEdit.get("pesado").get("pesoSaco").disable();
      this.notaIngredoFormEdit.get("pesado").get("calidad").disable();
      this.notaIngredoFormEdit.get("pesado").get("grado").disable();
      this.notaIngredoFormEdit.get("pesado").get("cantidadDefectos").disable();
    } else {
      //this.notaIngredoFormEdit.get("pesado").get("pesoSaco").enable();
      this.notaIngredoFormEdit.get("pesado").get("calidad").enable();
      this.notaIngredoFormEdit.get("pesado").get("grado").enable();
      this.notaIngredoFormEdit.get("pesado").get("cantidadDefectos").enable();
    }
  }

  desactivarControles(estado: string, usuarioPesado: string, usuarioAnalizado: string) {
    var usuarioLogueado = this.vSessionUser.Result.Data.NombreUsuario
    if (estado == this.estadoPesado && usuarioPesado == usuarioLogueado) {
      //Cabecera Editable
      //Pesado Editable
      //Calidad Editable
      //NotaCompra ReadOnly

    } else if (estado == this.estadoPesado && usuarioPesado != usuarioLogueado) {
      //Cabecera ReadOnly
      //Pesado ReadOnly
      this.btnGuardar = false;


      //Calidad Editable
      //NotaCompra ReadOnly
    } else if (estado == this.estadoAnalizado && usuarioAnalizado == usuarioLogueado) {
      //Cabecera ReadOnly
      //Pesado ReadOnly
      this.btnGuardar = false;
      this.notaIngredoFormEdit.disable();

      //Calidad Editable
      //NotaCompra Editable
    } else if (estado == this.estadoAnalizado && usuarioAnalizado != usuarioLogueado) {
      //Cabecera ReadOnly
      //Pesado ReadOnly
      this.btnGuardar = false;
      this.notaIngredoFormEdit.disable();

      //Calidad ReadOnly
      //NotaCompra Editable
    } else if (estado == this.estadoAnulado || estado == this.estadoEnviadoAlmacen) {
      //Cabecera ReadOnly
      //Pesado ReadOnly
      this.btnGuardar = false;
      this.notaIngredoFormEdit.disable();

      //Calidad ReadOnly
      //NotaCompra ReadOnly
    }

  }

  validacionPorcentajeRend(producto, subproducto) {
    if (producto == this.PrdCafePergamino && subproducto != this.SubPrdSeco && subproducto != undefined) {
      this.notaIngredoFormEdit.get('pesado').get("porcentajeRendimiento").disable()
      this.notaIngredoFormEdit.get('pesado').get("porcentajeRendimiento").setValue("");
    }
    else {
      this.notaIngredoFormEdit.get('pesado').get("porcentajeRendimiento").enable();
    }
  }
  changeView(e) {
    let filterSubTipo = e.Codigo;
    let producto = this.notaIngredoFormEdit.get('producto').value;
    this.validacionPorcentajeRend(producto, filterSubTipo);
    if (filterSubTipo == "02") {
      this.viewTagSeco = true;
    }
    else {
      this.viewTagSeco = false;
    }
  }

  async cargarSubProducto(codigo: any) {
    var data = await this.maestroService.obtenerMaestros("SubProductoPlanta").toPromise();
    if (data.Result.Success) {
      this.listaSubProducto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }
  }

  get fedit() {
    return this.notaIngredoFormEdit.controls;
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const tipoproveedor = group.controls['tipoproveedor'];
      const tipoDocumento = group.controls['tipoDocumento'];
      const numeroDocumento = group.controls['numeroDocumento'];
      const socio = group.controls['socio'];
      const rzsocial = group.controls['rzsocial'];
      if ((tipoproveedor.value != "" && tipoproveedor.value != undefined) && numeroDocumento.value == ""
        && numeroDocumento.value == "" && socio.value == "" && rzsocial.value == "") {
        this.errorGeneral = { isError: true, errorMessage: 'Ingrese por lo menos un campo' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      if (numeroDocumento.value != "" && (tipoDocumento.value == "" || tipoDocumento.value == undefined)
        && (tipoproveedor.value != "" || tipoproveedor.value != undefined)) {
        this.errorGeneral = { isError: true, errorMessage: 'Seleccione un tipo documento' };
      } else if (numeroDocumento.value == "" && (tipoDocumento.value != "" && tipoDocumento.value != undefined)
        && (tipoproveedor.value != "" || tipoproveedor.value != undefined)) {
        this.errorGeneral = { isError: true, errorMessage: 'Ingrese un numero documento' };
      }
      return;
    };
  }

  ExportPDF(id: number): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaCompra/GenerarPDF?id=${id === undefined ? 1 : id}`;
    link.download = "NotaCompra.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

  guardar() {

    debugger
    const form = this;
    if( this.notaIngredoFormEdit.controls["producto"].value == '02'){
      if(this.rowsDetails.length == 0){
        this.errorGrilla = { isError: true, errorMessage: 'Ingrese por lo menos un campo' };
      }else{
        this.errorGrilla = { isError: false, errorMessage: '' };
      }
      
    }else{
      this.errorGrilla = { isError: false, errorMessage: '' };
    }
    if (this.notaIngredoFormEdit.invalid) {
      this.submittedEdit = true;
      return;
    } else {
      
      if (this.notaIngredoFormEdit.get('pesado').get("calidad").value == null || this.notaIngredoFormEdit.get('pesado').get("calidad").value.length == 0) {
        this.notaIngredoFormEdit.get('pesado').get("calidad").setValue("");
      }
      if (this.notaIngredoFormEdit.get('pesado').get("grado").value == null || this.notaIngredoFormEdit.get('pesado').get("grado").value.length == 0) {
        this.notaIngredoFormEdit.get('pesado').get("grado").setValue("");
      }

      var FechaGuiaRemision;
      if(this.notaIngredoFormEdit.controls["producto"].value != '02')
      {
        FechaGuiaRemision=this.notaIngredoFormEdit.controls["fecharemision"].value
      }
    
      
      let request = new ReqRegistrarPesadoNotaIngreso(
        Number(this.id),
        this.vSessionUser.Result.Data.EmpresaId,
        this.notaIngredoFormEdit.controls["guiaremision"].value,
        this.notaIngredoFormEdit.controls["guiaremision"].value,
        FechaGuiaRemision,
        this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId,
        this.notaIngredoFormEdit.controls["tipoProduccion"].value,
        this.notaIngredoFormEdit.controls["producto"].value,
        this.notaIngredoFormEdit.controls["subproducto"].value,
        this.notaIngredoFormEdit.controls["certificacion"].value ? this.notaIngredoFormEdit.controls["certificacion"].value.join('|') : '',
        this.notaIngredoFormEdit.controls["certificadora"].value ? this.notaIngredoFormEdit.controls["certificadora"].value : '',
        this.notaIngredoFormEdit.get('pesado').get("motivo").value ?  this.notaIngredoFormEdit.get('pesado').get("motivo").value : this.notaIngredoFormEdit.controls["motivo"].value,
        this.notaIngredoFormEdit.get('pesado').get("empaque").value,
        Number(this.notaIngredoFormEdit.get('pesado').get("kilosBrutos").value),
        Number(this.notaIngredoFormEdit.get('pesado').get("kilosNetos").value),
        Number(this.notaIngredoFormEdit.get('pesado').get("tara").value),
        this.notaIngredoFormEdit.get('pesado').get("calidad").value,
        this.notaIngredoFormEdit.get('pesado').get("grado").value,
        Number(this.notaIngredoFormEdit.get('pesado').get("cantidadDefectos").value),
        //Number(this.notaIngredoFormEdit.get('pesado').get("pesoSaco").value),
        0,
        this.notaIngredoFormEdit.get('pesado').get("tipo").value,
        Number(this.notaIngredoFormEdit.get('pesado').get("cantidad").value),
        Number(this.notaIngredoFormEdit.get('pesado').get("porcentajeHumedad").value),
        Number(this.notaIngredoFormEdit.get('pesado').get("porcentajeRendimiento").value),

        this.notaIngredoFormEdit.get('pesado').get("ruc").value  ?  this.notaIngredoFormEdit.get('pesado').get("ruc").value : this.notaIngredoFormEdit.controls["ruc"].value ,
        this.notaIngredoFormEdit.get('pesado').get("transportista").value ?  this.notaIngredoFormEdit.get('pesado').get("transportista").value : this.notaIngredoFormEdit.controls["transportista"].value,
        this.notaIngredoFormEdit.get('pesado').get("placaVehiculo").value ?  this.notaIngredoFormEdit.get('pesado').get("placaVehiculo").value : this.notaIngredoFormEdit.controls["placaVehiculo"].value,
        this.notaIngredoFormEdit.get('pesado').get("chofer").value ?  this.notaIngredoFormEdit.get('pesado').get("chofer").value : this.notaIngredoFormEdit.controls["chofer"].value,
        this.notaIngredoFormEdit.get('pesado').get("numeroBrevete").value ?  this.notaIngredoFormEdit.get('pesado').get("numeroBrevete").value : this.notaIngredoFormEdit.controls["numeroBrevete"].value,
        this.notaIngredoFormEdit.get('pesado').get("observacion").value ?  this.notaIngredoFormEdit.get('pesado').get("observacion").value : this.notaIngredoFormEdit.controls["observacion"].value,
        "01",
        new Date(),
        this.vSessionUser.Result.Data.NombreUsuario,
        new Date(),
        this.notaIngredoFormEdit.controls["direccion"].value,
        this.notaIngredoFormEdit.get('pesado').get("marca").value,
        //////
        this.notaIngredoFormEdit.controls["campania"].value,
        this.notaIngredoFormEdit.controls["concepto"].value,
        this.rowsDetails
        ////
      );
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      if (this.esEdit && this.id != 0) {
        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la actualización?.` , function (result) {
          if (result.isConfirmed) {
            form.actualizarService(request);
          }
        });
       
      } else {

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con el registro?.` , function (result) {
          if (result.isConfirmed) {
            form.guardarService(request);
          }
        });
       
      }
    }
  }
  openModalTransportista(modalTransportista) {
    //this.modalService.open(modalTransportista, { windowClass: 'dark-modal',  size: 'xl' });
    this.modalService.open(modalTransportista, { size: 'xl', centered: true });
    this.cargarTransportista();
    //this.clear();
  }
  cargarTransportista() {
    this.consultaTransportistas = new FormGroup(
      {
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)]),
        ruc: new FormControl('', [Validators.minLength(8), Validators.maxLength(20)])
      }
    );
    this.consultaTransportistas.setValidators(this.comparisonValidatorTransportista())
  }
  get fT() {
    return this.consultaTransportistas.controls;
  }
  
  public comparisonValidatorTransportista(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let rzsocial = group.controls['rzsocial'].value;
      let ruc = group.controls['ruc'].value;
      if (rzsocial == "" && ruc == "") {
        this.errorTransportista = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };
      }
      else {
        this.errorTransportista = { isError: false, errorMessage: '' };
      }
      return;
    };
  }
  buscarTransportista() {

    if (this.consultaTransportistas.invalid || this.errorTransportista.isError) {
      this.submittedT = true;
      return;
    } else {
      this.selectedT = [];
      this.submittedT = false;
      this.filtrosTransportista.RazonSocial = this.consultaTransportistas.controls['rzsocial'].value;
      this.filtrosTransportista.Ruc = this.consultaTransportistas.controls['ruc'].value;
      this.filtrosTransportista.EmpresaId = this.login.Result.Data.EmpresaId;
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'large',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.transportistaService.Consultar(this.filtrosTransportista)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              this.tempDataT = res.Result.Data;
              this.rowsT = [...this.tempDataT];
            } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
              this.errorTransportista = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorTransportista = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            this.errorTransportista = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.errorTransportista = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }

  };

  guardarService(request: any)
   {
    debugger
    this.notaIngresoService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Nota Ingreso Registrado.', function (result) {
              form.router.navigate(['/planta/operaciones/notaingreso-list']);
            }
            );
          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } else {
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }

  actualizarService(request: any) {
    this.notaIngresoService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Nota Ingreso Actualizado.', function (result) {
              form.router.navigate(['/planta/operaciones/notaingreso-list']);
            }
            );

          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } else {
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }

  cancelar() {
    this.router.navigate(['/planta/operaciones/notaingreso-list']);
  }

  obtenerDetalle() {
    this.spinner.show();
    this.notaIngresoService.ConsultarPorId(Number(this.id))
      .subscribe(res => {
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data.Detalle;
            this.cargarDataFormulario(res.Result.Data);

            

            if (res.Result.Data != null) 
            {
              this.formEmpaques(res.Result.Data);
             // this.formTipoEmpaque(res.Result.Data);
             // this.formSubProducto(res.Result.Data);
              
            }
            else 
             {
              this.spinner.hide();
            } 
          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } else {
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }

  async cargarDataFormulario(data: any) {
    await this.cargarEmpaque();
    this.idPlantEntryNote = data.NotaIngresoPlantaId;
    this.viewTagSeco = data.SubProductoId != "02" ? false : true;
    this.notaIngredoFormEdit.controls["guiaremision"].setValue(data.NumeroGuiaRemision);
    
    if(data.FechaGuiaRemision!=null)
    {
      this.notaIngredoFormEdit.controls["fecharemision"].setValue(formatDate(data.FechaGuiaRemision, 'yyyy-MM-dd', 'en'));
    }

    this.notaIngredoFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccionId);
    this.notaIngredoFormEdit.controls["codigoOrganizacion"].setValue(data.NumeroOrganizacion);
    this.notaIngredoFormEdit.controls["nombreOrganizacion"].setValue(data.RazonSocialOrganizacion);
    this.notaIngredoFormEdit.controls["producto"].setValue(data.ProductoId);


    this.ocultarSubProducto(data.ProductoId);

    if(data.ProductoId == '02')
    {
      

      var form = this;

      this.maestroUtil.obtenerMaestros("SubProductoPlanta", function (res) {
        if (res.Result.Success) 
        {
          debugger

          
          let groupsSubProducto = {}
          data.Detalle.forEach(obj => {
            groupsSubProducto[obj.NotaIngresoPlantaDetalleId + 'subproducto'] = new FormControl('', []);

          });
          form.formControlSubProducto= new FormGroup(groupsSubProducto);
              
            
            


          form.listaDetalleSubProducto = res.Result.Data.filter(obj => obj.Val1 == data.ProductoId);

          data.Detalle.forEach(obj => {

            form.selectedDetalleEmpaque[obj.NotaIngresoPlantaDetalleId] = obj.EmpaqueId;
            form.selectedDetalleTipoEmpaque[obj.NotaIngresoPlantaDetalleId] = obj.TipoId;
            form.selectedDetalleSubProducto[obj.NotaIngresoPlantaDetalleId] = obj.SubProductoId;
        });
        form.rowsDetails = [...data.Detalle]
         
        }
      });
  }

    /* if(data.ProductoId == '02'){
      //OCULTAR PESADO
      this.flagOcultarPesado = false;
      this.flagOcultarExportable = true;
      //this.notaIngredoFormEdit.get("pesado").reset();
      this.notaIngredoFormEdit.get("pesado").disable();


    }else{
       //MOSTRAR PESADO
       this.flagOcultarPesado = true;
       this.flagOcultarExportable = false;
       this.rowsDetails = [];
       this.notaIngredoFormEdit.get("pesado").enable();
    } */

    this.notaIngredoFormEdit.controls["campania"].setValue(data.CodigoCampania);
   // this.notaIngredoFormEdit.controls["concepto"].setValue(data.CodigoTipoConcepto);
   await this.cargaConceptos(data.CodigoCampania);
   this.notaIngredoFormEdit.controls["concepto"].setValue(data.CodigoTipoConcepto);
    this.notaIngredoFormEdit.controls["direccion"].setValue(data.DireccionOrganizacion);
    this.notaIngredoFormEdit.controls["rucOrganizacion"].setValue(data.RucOrganizacion);
    await this.cargarSubProducto(data.ProductoId);
    this.notaIngredoFormEdit.controls["subproducto"].setValue(data.SubProductoId);
    //this.notaIngredoFormEdit.controls["certificacion"].setValue(data.CertificacionId);
    this.notaIngredoFormEdit.controls.certificacion.setValue(data.CertificacionId.split('|').map(String));
    this.notaIngredoFormEdit.controls["certificadora"].setValue(data.EntidadCertificadoraId);
    this.notaIngredoFormEdit.get('pesado').get("motivo").setValue(data.MotivoIngresoId);
    this.notaIngredoFormEdit.get('pesado').get("empaque").setValue(data.EmpaqueId);
    this.notaIngredoFormEdit.get('pesado').get("tipo").setValue(data.TipoId);
    this.notaIngredoFormEdit.get('pesado').get("cantidad").setValue(data.Cantidad);
    this.notaIngredoFormEdit.get('pesado').get("kilosBrutos").setValue(data.KilosBrutos);
    //this.notaIngredoFormEdit.get('pesado').get("pesoSaco").setValue(data.PesoPorSaco);
    this.notaIngredoFormEdit.get('pesado').get("calidad").setValue(data.CalidadId);
    this.notaIngredoFormEdit.get('pesado').get("tara").setValue(data.Tara);
    this.notaIngredoFormEdit.get('pesado').get("kilosNetos").setValue(data.KilosNetos);
    this.notaIngredoFormEdit.get('pesado').get("grado").setValue(data.GradoId);
    this.notaIngredoFormEdit.get('pesado').get("cantidadDefectos").setValue(data.CantidadDefectos);
    this.notaIngredoFormEdit.get('pesado').get("porcentajeRendimiento").setValue(data.RendimientoPorcentaje);
    this.notaIngredoFormEdit.get('pesado').get("porcentajeHumedad").setValue(data.HumedadPorcentaje);
    this.notaIngredoFormEdit.get('pesado').get("transportista").setValue(data.RazonEmpresaTransporte);
    this.notaIngredoFormEdit.get('pesado').get("ruc").setValue(data.RucEmpresaTransporte);
    this.notaIngredoFormEdit.get('pesado').get("placaVehiculo").setValue(data.PlacaTractorEmpresaTransporte);
    this.notaIngredoFormEdit.get('pesado').get("chofer").setValue(data.ConductorEmpresaTransporte);
    this.notaIngredoFormEdit.get('pesado').get("numeroBrevete").setValue(data.LicenciaConductorEmpresaTransporte);
    this.notaIngredoFormEdit.get('pesado').get("observacion").setValue(data.ObservacionPesado);
    this.notaIngredoFormEdit.get('pesado').get("marca").setValue(data.Marca);

    this.notaIngredoFormEdit.controls["motivo"].setValue(data.MotivoIngresoId);

    this.notaIngredoFormEdit.controls["transportista"].setValue(data.RazonEmpresaTransporte);
    this.notaIngredoFormEdit.controls["ruc"].setValue(data.RucEmpresaTransporte);
    this.notaIngredoFormEdit.controls["placaVehiculo"].setValue(data.PlacaTractorEmpresaTransporte);
    this.notaIngredoFormEdit.controls["chofer"].setValue(data.ConductorEmpresaTransporte);
    this.notaIngredoFormEdit.controls["numeroBrevete"].setValue(data.LicenciaConductorEmpresaTransporte);
    this.notaIngredoFormEdit.controls["observacion"].setValue(data.ObservacionPesado);
    this.notaIngredoFormEdit.controls["marca"].setValue(data.Marca);

    this.validacionPorcentajeRend(data.ProductoId,data.SubProductoId);
    this.estado = data.Estado
    this.numeroNotaIngreso = data.Numero;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.fechaPesado = this.dateUtil.formatDate(new Date(data.FechaPesado), "/");
    this.responsable = data.UsuarioPesado;
    this.selectOrganizacion[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaOrigenId };
    this.desactivarControles(data.EstadoId, data.UsuarioPesado, data.UsuarioCalidad);

    
   
    this.spinner.hide();
  }

  async consultarSocioFinca() {
    let request =
    {
      "SocioFincaId": Number(this.notaIngredoFormEdit.controls["socioFincaId"].value)
    }

    if (this.notaIngredoFormEdit.controls["producto"].value == "01" &&
      this.notaIngredoFormEdit.controls["subproducto"].value == "02" && this.notaIngredoFormEdit.controls["provCertificacion"].value != "") {
      this.socioFinca.SearchSocioFinca(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              if (res.Result.Data != null) {
                if (res.Result.Data.SaldoPendiente == 0) {
                  this.notaIngredoFormEdit.controls["tipoProduccion"].setValue("02");
                  this.notaIngredoFormEdit.controls["tipoProduccion"].disable();
                }
                else if (res.Result.Data.SaldoPendiente < this.notaIngredoFormEdit.get('pesado').get("kilosBruto").value) {
                  this.alertUtil.alertWarning('Oops!', 'Solo puede ingresar ' + res.Result.Data.SaldoPendiente + ' Kilos Brutos');
                  this.btnGuardar = false;
                }
                else {
                  this.btnGuardar = true;
                }
              }
              else if (res.Result.Data == null) {
                this.alertUtil.alertWarning('Oops!', 'La finca no tiene registrado los estimados para el año actual');
                this.btnGuardar = false;
              }

            } else {
              this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          }
        },
          err => {
            this.spinner.hide();
            console.log(err);
            this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  GetDataEmpresa(event: any): void {
    this.selectOrganizacion = event;
    if (this.selectOrganizacion[0]) {
      //this.notaIngredoFormEdit.controls['codigoOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.notaIngredoFormEdit.controls['direccion'].setValue(`${this.selectOrganizacion[0].Direccion} - ${this.selectOrganizacion[0].Distrito} - ${this.selectOrganizacion[0].Provincia} - ${this.selectOrganizacion[0].Departamento}`);
      this.notaIngredoFormEdit.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.notaIngredoFormEdit.controls['rucOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
    }
    this.modalService.dismissAll();
  }




  Documents(): void {

  }
}
