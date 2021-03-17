import { Component, OnInit, ViewEncapsulation, Input,Output,EventEmitter , ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { AcopioService } from '../../../../../../../services/acopio.service';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../../services/models/login';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import { ReqRegistrarPesado } from '../../../../../../../services/models/req-registrar-pesado';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { LoteService } from '../../../../../../../services/lote.service';
import {TransportistaService } from '../../../../../../../services/transportista.service';
import { forEach } from 'core-js/core/array';



@Component({
  selector: 'app-tagNotasalida',
  templateUrl: './tag-notasalida.component.html',
  styleUrls: ['./tag-notasalida.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TagNotaSalidaEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  listaAlmacen: any[];
  listaEstado: any[];
  selectAlmacen: any;
  consultaLotes: FormGroup;
  consultaTransportistas: FormGroup;
  selectEstado: any[];
  listaProducto: any[];
  listaSubProducto: any[];
  selectProducto: any;
  selectSubProducto: any;
  selectedTipoDocumento: any;
  listaTipoDocumento: any[];
  submitted = false;
  submittedEdit = false;
  closeResult: string;
  notaSalidaFormEdit: FormGroup;
  errorGeneral: any = { isError: false, errorMessage: '' };
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  selected = [];
  selectedT = [];
  public rowsT = [];
  private tempDataT = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  private tempDataLoteDetalle = [];
  private tempDataLoteTotal = [];
  public rows = [];
  public rowsLotesTotal = [];
  public rowsLotesDetalle = []
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  public limitRefT = 10;
  detalleMateriaPrima: any;
  eventsSubject: Subject<void> = new Subject<void>();
  eventosSubject: Subject<void> = new Subject<void>();
  filtrosLotes: any = {};
  filtrosLotesID: any = {};
  filtrosTransportista: any = {};
  listaLotesDetalleId = [];
  

  esEdit = false; //

  @ViewChild(DatatableComponent) tableLotes: DatatableComponent;
  @ViewChild(DatatableComponent) tableTranspotistas: DatatableComponent;
  @ViewChild(DatatableComponent) tableLotesDetalle: DatatableComponent;
  @ViewChild(DatatableComponent) tableLotesTotal: DatatableComponent;
  
 
  constructor(private modalService: NgbModal, private maestroService: MaestroService, 
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService, private acopioService: AcopioService, private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private loteService: LoteService,
    private transportistaService:TransportistaService
   
    ) {
  
  }
 
 
  ngOnInit(): void {
  
  
  }


  openModal(modalLotes) {
    this.modalService.open(modalLotes, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarLotes();
    this.clear();
    
  }

  openModalTransportista(modalTransportista)
  {
    this.modalService.open(modalTransportista, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarTransportista();
    //this.clear();
  }

  clear() {

    this.selectAlmacen = [];
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

 
  cargarTransportista()
  {
    this.consultaTransportistas = new FormGroup(
      {
        rzsocial: new FormControl('', []),
        ruc: new FormControl('', [])
      }
    );
  }
 
  cargarLotes() {
    this.consultaLotes = new FormGroup(
      {
        almacen: new FormControl('', []),
        numeroLote: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        fechaInicio: new FormControl('', [Validators.required]),
        fechaFinal:new FormControl('', [Validators.required]),
        producto: new FormControl('', []),
        subproducto: new FormControl('', []),
        tipoDocumento: new FormControl('', []),
        numeroDocumento: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        socio: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)]),
        estado: new FormControl('', [])
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
      this.maestroService.obtenerMaestros("EstadoLote")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaEstado = res.Result.Data;
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
  }
  changeSubProducto(e) {
    let filterProducto = e.Codigo;
    this.cargarSubProducto(filterProducto);
   
  }

  async cargarSubProducto(codigo:any){
    
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
  get fedit() {
    return this.notaSalidaFormEdit.controls;
  }
  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let nroLote = group.controls['numeroLote'];
      let nroDocumento = group.controls['numeroDocumento'];
      let tipoDocumento = group.controls['tipoDocumento'];
      let codigoSocio = group.controls['socio'];
      let nombre = group.controls['rzsocial'];
      let vProduct = group.controls['producto'];
      let vByProduct = group.controls['subProducto'];
      if (!nroLote && !nroDocumento && !codigoSocio && !nombre && !tipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };
      } else if (nroDocumento && !tipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un tipo documento.' };
      } else if (!nroDocumento && tipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar un numero documento.' };
      } else if (vByProduct && !vProduct) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un producto.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }
 
  buscarTransportista()
  {

     if (this.consultaTransportistas.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.selectedT = [];
      this.submitted = false;
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
            console.error(err);
            this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  
  };
  buscar() {
    let columns =[];
    if (this.consultaLotes.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.selected = [];
      this.submitted = false;
      this.filtrosLotes.AlmacenId = this.consultaLotes.controls['almacen'].value.length == 0 ? "": this.consultaLotes.controls['almacen'].value ;
      this.filtrosLotes.NombreRazonSocial = this.consultaLotes.controls['rzsocial'].value;
      this.filtrosLotes.TipoDocumentoId = this.consultaLotes.controls['tipoDocumento'].value.length == 0 ? "": this.consultaLotes.controls['tipoDocumento'].value;
      this.filtrosLotes.NumeroDocumento = this.consultaLotes.controls['numeroDocumento'].value;
      this.filtrosLotes.Numero = this.consultaLotes.controls['numeroLote'].value;
      this.filtrosLotes.FechaInicio = this.consultaLotes.controls['fechaInicio'].value;
      this.filtrosLotes.FechaFin = this.consultaLotes.controls['fechaFinal'].value;
      this.filtrosLotes.EstadoId = this.consultaLotes.controls['estado'].value.length == 0 ? "" : this.consultaLotes.controls['estado'].value ;
      this.filtrosLotes.ProductoId = this.consultaLotes.controls['producto'].value.length ==  0 ? "" : this.consultaLotes.controls['producto'].value ;
      this.filtrosLotes.SubProductoId = this.consultaLotes.controls['subproducto'].value.length == 0 ? "":  this.consultaLotes.controls['subproducto'].value ;
      this.filtrosLotes.CodigoSocio = this.consultaLotes.controls['socio'].value;
      this.filtrosLotes.EmpresaId = 1;
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
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
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
            console.error(err);
            this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  agregar (e)
  {
    this.filtrosLotesID.LoteId = Number(e[0].LoteId);
    
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'large',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.loteService.ConsultarDetallePorLoteId(this.filtrosLotesID)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {

            if (res.Result.Data)
            {
              res.Result.Data.forEach(x=>{
                let object : any = {};                
                object.Producto = x.Producto
                object.UnidadMedida = x.UnidadMedida
                object.CantidadPesado = x.CantidadPesado
                object.RendimientoPorcentaje = x.RendimientoPorcentaje
                object.KilosNetosPesado = x.KilosNetosPesado
                object.Numero = e[0].Numero
                this.listaLotesDetalleId.push(object);
              })
              
            this.tempDataLoteDetalle = this.listaLotesDetalleId;
            this.rowsLotesDetalle = [...this.tempDataLoteDetalle];
            this.calcularTotales();
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
          console.error(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }
  
  calcularTotales()
  {
    let Total = 0;
    let RendimientoPorcentaje = 0;
    let CantidadPesado = 0;
    let KilosNetosPesado = 0;
    this.rowsLotesDetalle.forEach(x=>{
      Total += 1;
      RendimientoPorcentaje += x.RendimientoPorcentaje;
      CantidadPesado += x.CantidadPesado;
      KilosNetosPesado += x.KilosNetosPesado;
      
    });
    let totales:any = {};
    totales.Total = Total;
    totales.PorcentRendimiento = RendimientoPorcentaje/Total;
    totales.CantidadTotal =CantidadPesado;
    totales.TotalKilos = KilosNetosPesado;
    let array : any[] = [];
    array.push(totales);
    this.tempDataLoteTotal = array;
    this.rowsLotesTotal = [...array];
  }
}




