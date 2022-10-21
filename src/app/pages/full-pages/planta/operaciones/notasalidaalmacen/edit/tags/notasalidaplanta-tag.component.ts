import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, ControlContainer } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../../../../services/models/login';
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import { DateUtil } from '../../../../../../../services/util/date-util';
import { LoteService } from '../../../../../../../services/lote.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-tagNotasalidaPlanta',
  templateUrl: './notasalidaplanta-tag.component.html',
  styleUrls: ['./notasalidaplanta-tag.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class TagNotaSalidaPlantaEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  @Input() submittedEdit;
  @Input() selectAlmacen;
  errorMessage: any;
  listaAlmacen: any[];
  listaEstado: any[];
  selectAlmacenLote: any;
  consultaLotes: FormGroup;
  selectEstado: any[];
  listaProducto: any[];
  listaSubProducto: any[];
  selectProducto: any;
  selectSubProducto: any;
  selectedTipoDocumento: any;
  listaTipoDocumento: any[];
  listaMotivoTranslado: any[];
  selectedMotivoSalida: any;
  submitted = false;
  submittedT = false;
  closeResult: string;
  tagNotadeSalida: FormGroup;
  notaSalidaFormEdit : FormGroup;
  errorGeneral: any = { isError: false, errorMessage: '' };
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  selected = [];
  selectedT = [];
  selectLoteDetalle = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  private tempDataLoteDetalle = [];
  public rows = [];
  public rowsLotesDetalle = []
  private tempDataNotaIngreso = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  public limitRefT = 10;
  filtrosLotes: any = {};
  filtrosLotesID: any = {};
  listaNotaIngreso = [];
  valueMotivoSalidaTransf = '02';
  estadoAnalizado = '02';
  esEdit = false;
  popUp = true;
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

  cargarDatos(detalle: any) {
    detalle.forEach(x => {
      let object: any = {};
      object.NotaSalidaAlmacenPlantaDetalleId = x.NotaSalidaAlmacenPlantaDetalleId
      object.NotaSalidaAlmacenPlantaId = x.NotaSalidaAlmacenPlantaId
      object.NotaIngresoAlmacenPlantaId = x.NotaIngresoAlmacenPlantaId
      object.EmpaqueId = x.EmpaqueId 
      object.Empaque = x.Empaque
      object.TipoId = x.TipoId 
      object.TipoEmpaque = x.TipoEmpaque 
      object.Producto = x.Producto
      object.SubProducto = x.SubProducto
      object.Cantidad = x.Cantidad
      object.PesoKilosBrutos = x.PesoKilosBrutos
      object.PesoKilosNetos = x.PesoKilosNetos
      object.Tara = x.Tara

      this.listaNotaIngreso.push(object);
    });
    this.tempDataLoteDetalle = this.listaNotaIngreso;
    this.rowsLotesDetalle = [...this.tempDataLoteDetalle];
  }

  openModal(modalLotes) {
    if (this.selectAlmacen == '' || this.selectAlmacen == undefined)
    {
      this.alertUtil.alertWarning('', 'Debe seleccionar Tipo Almacen');
      
    }
    else{
      this.modalService.open(modalLotes, { windowClass: 'dark-modal', size: 'xl' });    
      this.cargarLotes();
      this.clear();
      this.consultaLotes.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
      this.consultaLotes.controls['fechaFinal'].setValue(this.dateUtil.currentDate());
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

  openModalTransportista(modalTransportista) {
    this.modalService.open(modalTransportista, { windowClass: 'dark-modal', size: 'xl' });

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

  cargarformTagNotaSalida() {
    this.maestroService.obtenerMaestros("MotivoSalidaPlanta")
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
    this.maestroService.obtenerMaestros("AlmacenPlanta")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaAlmacen = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
    this.maestroService.obtenerMaestros("ProductoPlanta")
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

    var data = await this.maestroService.obtenerMaestros("SubProductoPlanta").toPromise();
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
 
  get f() {
    return this.consultaLotes.controls;
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

  seleccionarTransportista($event) {
    this.selectedT = $event;
    this.tagNotadeSalida.get('propietario').setValue(this.selectedT[0].RazonSocial);
    this.tagNotadeSalida.get('domiciliado').setValue(this.selectedT[0].Direccion);
    this.tagNotadeSalida.get('ruc').setValue(this.selectedT[0].Ruc);
    this.tagNotadeSalida.get('conductor').setValue(this.selectedT[0].Conductor);
    this.tagNotadeSalida.get('brevete').setValue(this.selectedT[0].Licencia);
    this.tagNotadeSalida.get('codvehicular').setValue(this.selectedT[0].ConfiguracionVehicular);
    this.tagNotadeSalida.get('marca').setValue(this.selectedT[0].MarcaTractor);
    this.tagNotadeSalida.get('placa').setValue(this.selectedT[0].PlacaTractor);
    this.tagNotadeSalida.get('numconstanciamtc').setValue(this.selectedT[0].NumeroConstanciaMTC);
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
              res.Result.Data.forEach(x => {
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

  agregarNotaIngreso(e) {

    var listFilter=[];
      listFilter = this.listaNotaIngreso.filter(x => x.NotaIngresoAlmacenPlantaId == e[0].NotaIngresoAlmacenPlantaId);
      if (listFilter.length == 0)
      {
        this.filtrosLotesID.LoteId = Number(e[0].LoteId);
        let object: any = {};
        object.NotaIngresoAlmacenPlantaId = e[0].NotaIngresoAlmacenPlantaId
        object.NumeroNotaIngresoAlmacenPlanta = e[0].NumeroIngresoPlanta
        object.Producto = e[0].Producto
        object.SubProducto = e[0].SubProducto
        object.Calidad = e[0].Calidad
        object.Grado = e[0].Grado 
        object.CantidadDefectos = e[0].CantidadDefectos 
        object.CantidadPesado = e[0].CantidadPesado
        object.KilosBrutosPesado = e[0].KilosBrutosPesado
        object.TaraPesado = e[0].TaraPesado
        object.KilosNetosPesado = e[0].KilosNetosPesado
        object.CantidadPesado = e[0].CantidadPesado
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

}