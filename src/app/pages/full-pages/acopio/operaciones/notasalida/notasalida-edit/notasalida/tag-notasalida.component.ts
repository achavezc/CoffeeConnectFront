import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, ControlContainer } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../../../../services/models/login';
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import { DateUtil } from '../../../../../../../services/util/date-util';
import { LoteService } from '../../../../../../../services/lote.service';
import { TransportistaService } from '../../../../../../../services/transportista.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-tagNotasalida',
  templateUrl: './tag-notasalida.component.html',
  styleUrls: ['./tag-notasalida.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class TagNotaSalidaEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  @Input() submittedEdit;
  @Input() selectAlmacen;
  errorMessage: any;
  listaAlmacen: any[];
  listaEstado: any[];
  selectAlmacenLote: any;
  consultaLotes: FormGroup;
  consultaTransportistas: FormGroup;
  selectEstado: any[];
  listaProducto: any[];
  listaSubProducto: any[];
  selectProducto: any;
  selectSubProducto: any;
  selectedTipoDocumento: any;
  listaTipoDocumento: any[];
  listaMotivoTranslado: any[];
  selectedMotivoTranslado: any;
  visibleNumReferencia = false;
  submitted = false;
  submittedT = false;
  closeResult: string;
  tagNotadeSalida: FormGroup;
  notaSalidaFormEdit : FormGroup;
  errorGeneral: any = { isError: false, errorMessage: '' };
  error: any = { isError: false, errorMessage: '' };
  errorTransportista: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  selected = [];
  selectedT = [];
  selectLoteDetalle = [];
  public rowsT = [];
  private tempDataT = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  private tempDataLoteDetalle = [];
  public rows = [];
  public rowsLotesDetalle = []
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  public limitRefT = 10;
  filtrosLotes: any = {};
  filtrosLotesID: any = {};
  filtrosTransportista: any = {};
  listaLotesDetalleId = [];
  valueMotivoSalidaTransf = '02';
  estadoAnalizado = '02';
  esEdit = false;
  @Input() eventsNs: Observable<any>;

  @ViewChild(DatatableComponent) tableLotes: DatatableComponent;
  @ViewChild(DatatableComponent) tableTranspotistas: DatatableComponent;
  @ViewChild(DatatableComponent) tableLotesDetalle: DatatableComponent;
  @ViewChild(DatatableComponent) tableLotesTotal: DatatableComponent;


  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private dateUtil: DateUtil,
    private loteService: LoteService,
    private transportistaService: TransportistaService,
    private controlContainer: ControlContainer
  ) { }


  ngOnInit(): void {

    this.cargarformTagNotaSalida();
    this.tagNotadeSalida = <FormGroup>this.controlContainer.control;
    this.notaSalidaFormEdit =  <FormGroup>this.controlContainer.control;
    this.login = JSON.parse(localStorage.getItem("user"));
    this.eventsNs.subscribe({
      next: (data) => this.cargarDatos(data)

    });
  }

  cargarDatos(detalleLotes: any) {
    detalleLotes.forEach(x => {
      let object: any = {};
      object.Numero = x.NumeroLote,
        object.Producto = x.Producto
        object.SubProductoId = x.SubProductoId
      object.UnidadMedida = x.UnidadMedida
      object.CantidadPesado = x.Cantidad
      object.RendimientoPorcentaje = x.RendimientoPorcentaje
      object.KilosBrutos = x.TotalKilosBrutosPesado
      object.LoteId = x.LoteId
      object.HumedadPorcentaje = x.HumedadPorcentajeAnalisisFisico
      this.listaLotesDetalleId.push(object);

    });
    this.tempDataLoteDetalle = this.listaLotesDetalleId;
    this.rowsLotesDetalle = [...this.tempDataLoteDetalle];
  }

  changeMotivo(e) {
    if (e.Codigo == this.valueMotivoSalidaTransf) {

      this.visibleNumReferencia = true;
    }
    else {
      this.visibleNumReferencia = false;
    }
  }
  openModal(modalLotes) {
    if (this.selectAlmacen == '' || this.selectAlmacen == undefined)
    {
      this.alertUtil.alertWarning('', 'Debe seleccionar Tipo Almacen');
      
    }
    else{

      this.modalService.open(modalLotes, { windowClass: 'dark-modal', size: 'lg' });    
      this.cargarLotes();
      this.clear();
      this.consultaLotes.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
      this.consultaLotes.controls['fechaFinal'].setValue(this.dateUtil.currentDate());
    }
   
  }

  eliminarLote(select) {
    let form = this;
    this.alertUtil.alertSiNoCallback('Está seguro?', 'El lote ' + select[0].Numero + ' se eliminará de su lista.', function (result) {
      if (result.isConfirmed) {
        form.listaLotesDetalleId = form.listaLotesDetalleId.filter(x => x.LoteId != select[0].LoteId)
        form.tempDataLoteDetalle = form.listaLotesDetalleId;
        form.rowsLotesDetalle = [...form.tempDataLoteDetalle];
        form.selectLoteDetalle = [];
      }
    }
    );

  }
  openModalTransportista(modalTransportista) {
    this.modalService.open(modalTransportista, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarTransportista();
    //this.clear();
  }

  clear() {
    this.consultaLotes.controls['numeroLote'].reset;
    this.consultaLotes.controls['fechaInicio'].reset;
    this.consultaLotes.controls['fechaFinal'].reset;
    this.selectProducto = [];
    this.selectSubProducto = [];
    this.selectedTipoDocumento = [];
    this.consultaLotes.controls['numeroDocumento'].reset;
    this.consultaLotes.controls['socio'].reset;
    this.consultaLotes.controls['rzsocial'].reset;
    this.selectEstado = [];
    this.rows = [];
  }


  cargarTransportista() {
    this.consultaTransportistas = new FormGroup(
      {
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(20)]),
        ruc: new FormControl('', [Validators.minLength(8), Validators.maxLength(20)])
      }
    );
    this.consultaTransportistas.setValidators(this.comparisonValidatorTransportista())
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

  cargarformTagNotaSalida() {
    this.maestroService.obtenerMaestros("MotivoSalida")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaMotivoTranslado = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
  }

  cargarLotes() {
    
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'large',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.consultaLotes = new FormGroup(
      {
        almacen: new FormControl({ value: '', disabled: true }, []),
        numeroLote: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        fechaInicio: new FormControl('', [Validators.required]),
        fechaFinal: new FormControl('', [Validators.required]),
        producto: new FormControl('', [Validators.required]),
        subproducto: new FormControl('', []),
        tipoDocumento: new FormControl('', []),
        numeroDocumento: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        socio: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)])
      });
    this.consultaLotes.setValidators(this.comparisonValidator())

    this.maestroService.obtenerMaestros("TipoDocumento")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaTipoDocumento = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
    this.maestroService.obtenerMaestros("Almacen")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaAlmacen = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
    this.maestroService.obtenerMaestros("Producto")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaProducto = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

    this.selectAlmacenLote = this.selectAlmacen;
    this.spinner.hide();
  }
  changeSubProducto(e) {
    let filterProducto = e.Codigo;
    this.cargarSubProducto(filterProducto);

  }

  async cargarSubProducto(codigo: any) {

    var data = await this.maestroService.obtenerMaestros("SubProducto").toPromise();
    if (data.Result.Success) {
      this.listaSubProducto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }

  }
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.tableLotes.offset = 0;
  }

  filterUpdateT(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempDataT.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rowsT = temp;
    this.tableTranspotistas.offset = 0;
  }
  compareTwoDates(): void {
    let vBeginDate = new Date(this.consultaLotes.value.fechaInicio);
    let vEndDate = new Date(this.consultaLotes.value.fechaFinal);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio.' };
      this.consultaLotes.value.fechaInicio.setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'Por favor el Rango de fechas no puede ser mayor a 2 años.' };
      this.consultaLotes.value.fechaFin.setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }
  updateLimitT(limit) {
    this.limitRefT = limit.target.value;
  }
  get f() {
    return this.consultaLotes.controls;
  }
  get fT() {
    return this.consultaTransportistas.controls;
  }
  get fedit() {
    return this.tagNotadeSalida.controls;
  }
  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let fechaInicio = group.controls['fechaInicio'].value;
      let fechaFinal = group.controls['fechaFinal'].value;
      let nroDocumento = group.controls['numeroDocumento'].value;
      let tipoDocumento = group.controls['tipoDocumento'].value;
      let vProduct = group.controls['producto'].value;

      if (fechaInicio == "" && fechaFinal == "" && (vProduct.value == "" || vProduct == undefined)) {
        this.error = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };
      }
      else if (!vProduct) {
        this.error = { isError: true, errorMessage: 'Por favor seleccionar un producto.' };
      } else {
        this.error = { isError: false, errorMessage: '' };
      }
      if (nroDocumento != "" && (tipoDocumento == "" || tipoDocumento == undefined)) {

        this.error = { isError: true, errorMessage: 'Seleccione un tipo documento' };

      } else if (nroDocumento == "" && (tipoDocumento != "" && tipoDocumento != undefined)) {

        this.error = { isError: true, errorMessage: 'Ingrese un numero documento' };
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
      this.filtrosTransportista.EmpresaId = 1;
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
  seleccionarTransportista(e) {

    this.tagNotadeSalida.get('propietario').setValue(e[0].RazonSocial);
    this.tagNotadeSalida.get('domiciliado').setValue(e[0].Direccion);
    this.tagNotadeSalida.get('ruc').setValue(e[0].Ruc);
    this.tagNotadeSalida.get('conductor').setValue(e[0].Conductor);
    this.tagNotadeSalida.get('brevete').setValue(e[0].Licencia);
    this.tagNotadeSalida.get('codvehicular').setValue(e[0].ConfiguracionVehicular);
    this.tagNotadeSalida.get('marca').setValue(e[0].MarcaTractor);
    this.tagNotadeSalida.get('placa').setValue(e[0].PlacaTractor);
    this.tagNotadeSalida.get('numconstanciamtc').setValue(e[0].NumeroConstanciaMTC);

    this.modalService.dismissAll();
  }
  buscar() {
    if (this.consultaLotes.invalid || this.error.isError) {
      this.submitted = true;
      return;
    } else {
      this.selected = [];
      this.submitted = false;
      this.filtrosLotes.AlmacenId = this.consultaLotes.controls['almacen'].value.length == 0 ? "" : this.consultaLotes.controls['almacen'].value;
      this.filtrosLotes.NombreRazonSocial = this.consultaLotes.controls['rzsocial'].value;
      this.filtrosLotes.TipoDocumentoId = this.consultaLotes.controls['tipoDocumento'].value.length == 0 ? "" : this.consultaLotes.controls['tipoDocumento'].value;
      this.filtrosLotes.NumeroDocumento = this.consultaLotes.controls['numeroDocumento'].value;
      this.filtrosLotes.Numero = this.consultaLotes.controls['numeroLote'].value;
      this.filtrosLotes.FechaInicio = this.consultaLotes.controls['fechaInicio'].value;
      this.filtrosLotes.FechaFin = this.consultaLotes.controls['fechaFinal'].value;
      this.filtrosLotes.EstadoId = this.estadoAnalizado;
      this.filtrosLotes.ProductoId = this.consultaLotes.controls['producto'].value == null || this.consultaLotes.controls['producto'].value.length == 0 ? "" : this.consultaLotes.controls['producto'].value;
      this.filtrosLotes.SubProductoId = this.consultaLotes.controls['subproducto'].value == null || this.consultaLotes.controls['subproducto'].value.length == 0 ? "" : this.consultaLotes.controls['subproducto'].value;
      this.filtrosLotes.CodigoSocio = this.consultaLotes.controls['socio'].value;
      this.filtrosLotes.EmpresaId = this.login.Result.Data.EmpresaId;
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'large',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.loteService.Consultar(this.filtrosLotes)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              res.Result.Data.array.forEach(x => {
                x.FechaRegistro = this.dateUtil.formatDate(new Date(x.FechaRegistro));
              });
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
            } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
              this.error = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.error = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            this.error = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.error = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  agregar(e) {
    if (this.listaLotesDetalleId.length == 0) {
      
        this.filtrosLotesID.LoteId = Number(e[0].LoteId);
        let object: any = {};
        object.Producto = e[0].Producto
        object.UnidadMedida = e[0].UnidadMedida 
        object.CantidadPesado = e[0].Cantidad 
        object.Numero = e[0].Numero
        object.LoteId = e[0].LoteId
         object.SubProductoId = e[0].SubProductoId 
        object.HumedadPorcentaje = e[0].HumedadPorcentajeAnalisisFisico
        object.RendimientoPorcentaje = e[0].RendimientoPorcentaje
        object.KilosBrutos = e[0].TotalKilosBrutosPesado
        this.listaLotesDetalleId.push(object);
        this.tempDataLoteDetalle = this.listaLotesDetalleId;
        this.rowsLotesDetalle = [...this.tempDataLoteDetalle];
        this.modalService.dismissAll();     

    }
    else {
      this.alertUtil.alertWarning("Oops...!","Solo puede Agregar 1 Lote");
    }
  }

}




