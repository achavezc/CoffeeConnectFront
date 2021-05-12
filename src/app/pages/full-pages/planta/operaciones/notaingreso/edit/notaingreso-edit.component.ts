
import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { AcopioService, FiltrosProveedor } from '../../../../../../services/acopio.service';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ReqRegistrarPesado } from '../../../../../../services/models/req-registrar-pesado';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
//import { ControlCalidadComponent } from '../materiaprima-edit/controlCalidad/seco/controlCalidad.component';
import { SocioFincaService } from './../../../../../../services/socio-finca.service';
//import {PesadoCafeComponent} from '../materiaprima-edit/pesadoCafe/pesadoCafe.component';



@Component({
  selector: 'app-notaingreso-edit',
  templateUrl: './notaingreso-edit.component.html',
  styleUrls: ['./notaingreso-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class NotaIngresoEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  esEdit = false;
  submitted = false;
  submittedEdit = false;
  closeResult: string;
  consultaMateriaPrimaFormEdit: FormGroup;
  consultaProveedor: FormGroup;
  listaProducto: any[];
  listaSubProducto: any[];
  listaTipoProveedor: any[];
  listaTipoProduccion: any[];
  selectTipoSocio: any;
  selectTipoProveedor: any;
  selectTipoProduccion: any;
  selectedEstado: any;
  selectProducto: any;
  selectSubProducto: any;
  selectedTipoDocumento: any;
  listSub: any[];
  selected = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  errorGeneral: any = { isError: false, errorMessage: '' };
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
  numeroGuia: "";
  fechaRegistro: any;
  fechaPesado: any;
  responsable: "";
  disabledControl: string = '';
  disabledNota: string = '';
  viewTagSeco: boolean = false;
  detalle: any;
  unidadMedidaPesado: any;
  form: string = "materiaprima"
  btnGuardar = true;
  //@ViewChild(PesadoCafeComponent) child;

  @ViewChild(DatatableComponent) tableProveedor: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService, private filtrosProveedor: FiltrosProveedor,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService, private acopioService: AcopioService, private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
   private socioFinca : SocioFincaService
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
    this.route.queryParams
      .subscribe(params => {
        this.status = params.status;
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
         // this.obtenerDetalle();
          if (this.status == "01") {
            this.disabledNota = 'disabled';
          }
        }
        else {
          this.disabledNota = 'disabled';
          this.disabledControl = 'disabled';
        }
      }
      );
  }

  cargarForm() {
    let x = this.selectSubProducto;
    this.consultaMateriaPrimaFormEdit = this.fb.group(
      {
        tipoProveedorId: ['',],
        socioId: ['',],
        terceroId: ['',],
        intermediarioId: ['',],
        numGuia: ['',],
        numReferencia: ['',],
        producto: ['', Validators.required],
        subproducto: ['', Validators.required],
        tipoProduccion: ['', Validators.required],
        provNombre: ['', Validators.required],
        provDocumento: ['', Validators.required],
        provTipoSocio: new FormControl({ value: '', disabled: true }, [Validators.required]),
        provCodigo: ['',],
        provDepartamento: ['', Validators.required],
        provProvincia: ['', Validators.required],
        provDistrito: ['', Validators.required],
        provZona: ['', Validators.required],
        provFinca: ['',],
        provCertificacion: ['',],
        fechaCosecha: ['', Validators.required],
        guiaReferencia: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        fechaPesado: ['',],
        pesado: this.fb.group({
          unidadMedida: new FormControl('', [Validators.required]),
          //cantidad: new FormControl('', [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          //kilosBruto: new FormControl('', [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
          cantidad: new FormControl('', [Validators.required]),
          kilosBruto: new FormControl('', [Validators.required]),
          tara: new FormControl('', []),
          observacionPesado: new FormControl('', []),
          exportGramos: new FormControl('', []),
          exportPorcentaje: new FormControl('', []),
          descarteGramos: new FormControl('', []),
          descartePorcentaje: new FormControl('', []),
          cascarillaGramos: new FormControl('', []),
          cascarillaPorcentaje: new FormControl('', []),
          totalGramos: new FormControl('', []),
          totalPorcentaje: new FormControl('', []),
          humedad: new FormControl('', []),
          ObservacionAnalisisFisico: new FormControl('', []),
          ObservacionRegTostado: new FormControl('', []),
          ObservacionAnalisisSensorial: new FormControl('', [])
        }),
        estado: ['',],
        socioFincaId: ['',],
        terceroFincaId: ['',]

      });
  }

  openModal(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarProveedor();
    this.clear();

  }

  clear() {
    this.consultaProveedor.controls['numeroDocumento'].reset;
    this.consultaProveedor.controls['socio'].reset;
    this.consultaProveedor.controls['rzsocial'].reset;
    this.selectTipoProveedor = [];
    this.selectedTipoDocumento = [];
    this.rows = [];
  }
  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("Producto", function (res) {
      if (res.Result.Success) {
        form.listaProducto = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoProduccion", function (res) {
      if (res.Result.Success) {
        form.listaTipoProduccion = res.Result.Data;
      }
    });

  }
  changeSubProducto(e) {
    let filterProducto = e.Codigo;
    this.cargarSubProducto(filterProducto);
    this.cleanKilosBrutos();
  }

  changeView(e) {
    let filterSubTipo = e.Codigo;
    if (filterSubTipo == "02") {
      this.viewTagSeco = true;
    }
    else {
      this.viewTagSeco = false;
    }
    this.cleanKilosBrutos();
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
    this.tableProveedor.offset = 0;
  }

  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }
  cargarProveedor() {
    this.consultaProveedor = new FormGroup(
      {
        tipoproveedor: new FormControl('', [Validators.required]),
        tipoDocumento: new FormControl('', []),
        numeroDocumento: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        socio: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        rzsocial: new FormControl('', [])
      });
    this.consultaProveedor.setValidators(this.comparisonValidator())

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
    this.cargarTipoProveedor();

  }

  async cargarTipoProveedor() {

    var data = await this.maestroService.obtenerMaestros("TipoProveedor").toPromise();
    if (data.Result.Success) {
      this.listaTipoProveedor = data.Result.Data;
      this.listTipoSocio = this.listaTipoProveedor;
    }
  }
  async cargarTipoProduccion() {

    var data = await this.maestroService.obtenerMaestros("TipoProduccion").toPromise();
    if (data.Result.Success) {
      this.listaTipoProduccion = data.Result.Data;
    }
  }

  get f() {
    return this.consultaProveedor.controls;
  }
  get fedit() {
    return this.consultaMateriaPrimaFormEdit.controls;
  }
  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const tipoproveedor = group.controls['tipoproveedor'];
      const tipoDocumento = group.controls['tipoDocumento'];
      const numeroDocumento = group.controls['numeroDocumento'];
      const socio = group.controls['socio'];
      const rzsocial = group.controls['rzsocial'];
      if ((tipoproveedor.value != "" && tipoproveedor.value != undefined) && numeroDocumento.value == "" && numeroDocumento.value == "" && socio.value == "" && rzsocial.value == "") {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese por lo menos un campo' };

      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      if (numeroDocumento.value != "" && (tipoDocumento.value == "" || tipoDocumento.value == undefined) && (tipoproveedor.value != "" || tipoproveedor.value != undefined)) {

        this.errorGeneral = { isError: true, errorMessage: 'Seleccione un tipo documento' };

      } else if (numeroDocumento.value == "" && (tipoDocumento.value != "" && tipoDocumento.value != undefined) && (tipoproveedor.value != "" || tipoproveedor.value != undefined)) {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese un numero documento' };

      }
      return;
    };
  }

  seleccionarProveedor(e) {
    this.consultaMateriaPrimaFormEdit.controls['provFinca'].disable();
    this.listTipoSocio = this.listaTipoProveedor;
    this.consultaMateriaPrimaFormEdit.get('provNombre').setValue(e[0].NombreRazonSocial);
    this.consultaMateriaPrimaFormEdit.get('provDocumento').setValue(e[0].TipoDocumento + "-" + e[0].NumeroDocumento);
    this.consultaMateriaPrimaFormEdit.get('provTipoSocio').setValue(e[0].TipoProveedorId);
    this.consultaMateriaPrimaFormEdit.get('provCodigo').setValue(e[0].CodigoSocio);
    this.consultaMateriaPrimaFormEdit.get('provDepartamento').setValue(e[0].Departamento);
    this.consultaMateriaPrimaFormEdit.get('provProvincia').setValue(e[0].Provincia);
    this.consultaMateriaPrimaFormEdit.get('provDistrito').setValue(e[0].Distrito);
    this.consultaMateriaPrimaFormEdit.get('provZona').setValue(e[0].Zona);
    this.consultaMateriaPrimaFormEdit.get('provFinca').setValue(e[0].Finca);
    this.consultaMateriaPrimaFormEdit.get('provCertificacion').setValue(e[0].Certificacion);

    this.consultaMateriaPrimaFormEdit.controls['tipoProveedorId'].setValue(e[0].TipoProveedorId);
    this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(null);
    this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(null);
    this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(null);
    this.consultaMateriaPrimaFormEdit.controls['terceroFincaId'].setValue(null);

    if (e[0].Certificacion == "") {
      this.selectTipoProduccion = this.tipoProduccionConvencional;
      this.consultaMateriaPrimaFormEdit.controls.tipoProduccion.disable();
    }
    else {
      this.selectTipoProduccion = [];
      this.consultaMateriaPrimaFormEdit.controls.tipoProduccion.enable();
    }
    if (e[0].TipoProveedorId == this.tipoSocio) {
      this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(e[0].ProveedorId);
      this.consultaMateriaPrimaFormEdit.controls['socioFincaId'].setValue(e[0].FincaId);

    } else if (e[0].TipoProveedorId == this.tipoTercero) {
      this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(e[0].ProveedorId);
      this.consultaMateriaPrimaFormEdit.controls['terceroFincaId'].setValue(e[0].FincaId);
    } else if (e[0].TipoProveedorId == this.tipoIntermediario) {
      this.consultaMateriaPrimaFormEdit.controls['provFinca'].enable();
      this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(e[0].ProveedorId);
    }

    this.cleanKilosBrutos();
    this.modalService.dismissAll();
  }

  buscar() {
    let columns = [];
    if (this.consultaProveedor.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      this.filtrosProveedor.TipoProveedorId = this.consultaProveedor.controls['tipoproveedor'].value;
      this.filtrosProveedor.NombreRazonSocial = this.consultaProveedor.controls['rzsocial'].value;
      if (this.consultaProveedor.controls['tipoDocumento'].value.length == 0) {
        this.filtrosProveedor.TipoDocumentoId = "";
      } else {
        this.filtrosProveedor.TipoDocumentoId = this.consultaProveedor.controls['tipoDocumento'].value;
      }
      this.filtrosProveedor.NumeroDocumento = this.consultaProveedor.controls['numeroDocumento'].value;
      this.filtrosProveedor.CodigoSocio = this.consultaProveedor.controls['socio'].value;
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'large',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.acopioService.consultarProveedor(this.filtrosProveedor)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {

              //data
              /*let array = [];
              
              for(let key in res.Result.Data)
              {
              res.Result.Data[key].visible = false;

              }*/
              //
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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

    if (this.consultaMateriaPrimaFormEdit.invalid) {
      this.submittedEdit = true;
      return;
    } else {
      var socioId = null;
      if (Number(this.consultaMateriaPrimaFormEdit.controls["socioId"].value) != 0) {
        socioId = Number(this.consultaMateriaPrimaFormEdit.controls["socioId"].value);
      }
      var terceroId = null;
      if (Number(this.consultaMateriaPrimaFormEdit.controls["terceroId"].value) != 0) {
        terceroId = Number(this.consultaMateriaPrimaFormEdit.controls["terceroId"].value);
      }
      var intermediarioId = null;
      if (Number(this.consultaMateriaPrimaFormEdit.controls["intermediarioId"].value) != 0) {
        intermediarioId = Number(this.consultaMateriaPrimaFormEdit.controls["intermediarioId"].value);
      }

      var socioFincaId = null;
      if (Number(this.consultaMateriaPrimaFormEdit.controls["socioFincaId"].value) != 0) {
        socioFincaId = Number(this.consultaMateriaPrimaFormEdit.controls["socioFincaId"].value);
      }
      var terceroFincaId = null;
      if (Number(this.consultaMateriaPrimaFormEdit.controls["terceroFincaId"].value) != 0) {
        terceroFincaId = Number(this.consultaMateriaPrimaFormEdit.controls["terceroFincaId"].value);
      }
      var intermediarioFinca = null;
      if (Number(this.consultaMateriaPrimaFormEdit.controls["provFinca"].value) != 0) {
        intermediarioFinca = this.consultaMateriaPrimaFormEdit.controls["provFinca"].value;
      }

      var SocioFincaCertificacion = null;
      if (Number(this.consultaMateriaPrimaFormEdit.controls["provCertificacion"].value) != 0) {
        SocioFincaCertificacion = this.consultaMateriaPrimaFormEdit.controls["provCertificacion"].value;
      }

      let request = new ReqRegistrarPesado(
        Number(this.id),
        1,
        this.consultaMateriaPrimaFormEdit.controls["tipoProveedorId"].value,
        socioId,
        terceroId,
        intermediarioId,
        this.consultaMateriaPrimaFormEdit.controls["producto"].value,
        this.consultaMateriaPrimaFormEdit.controls["subproducto"].value,
        this.consultaMateriaPrimaFormEdit.controls["guiaReferencia"].value,
        this.consultaMateriaPrimaFormEdit.controls["fechaCosecha"].value,
        this.login.Result.Data.NombreUsuario,
        this.consultaMateriaPrimaFormEdit.get('pesado').get("unidadMedida").value,
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("cantidad").value),
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("kilosBruto").value),
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("tara").value),
        this.consultaMateriaPrimaFormEdit.get('pesado').get("observacionPesado").value,
        socioFincaId,
        terceroFincaId,
        intermediarioFinca,
        this.consultaMateriaPrimaFormEdit.controls["tipoProduccion"].value,
        SocioFincaCertificacion
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
        this.actualizarService(request);
      } else {
        this.guardarService(request);
      }


    }
  }

  guardarService(request: ReqRegistrarPesado) {
    this.acopioService.registrarPesado(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Guia Registrada.', function (result) {
              //if(result.isConfirmed){
              form.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
              //}
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

  actualizarService(request: ReqRegistrarPesado) {
    this.acopioService.actualizarPesado(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Guia Actualizada.', function (result) {
              //if(result.isConfirmed){
              form.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
              //}
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
    this.router.navigate(['/operaciones/notaingreso-list']);
  }

  obtenerDetalle() {
    this.spinner.show();
    this.acopioService.obtenerDetalle(Number(this.id))
      .subscribe(res => {

        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data;
            this.cargarDataFormulario(res.Result.Data);
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
    //this.child.obtenerDetalle();
  }
  async cargarDataFormulario(data: any) {
    await this.cargarTipoProduccion();
    this.consultaMateriaPrimaFormEdit.controls["producto"].setValue(data.ProductoId);
    await this.cargarSubProducto(data.ProductoId);
    this.consultaMateriaPrimaFormEdit.controls["subproducto"].setValue(data.SubProductoId);
    this.viewTagSeco = data.SubProductoId != "02" ? false : true;
    this.estado = data.Estado
    this.consultaMateriaPrimaFormEdit.controls["guiaReferencia"].setValue(data.NumeroReferencia);
    this.numeroGuia = data.Numero;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.consultaMateriaPrimaFormEdit.controls["provNombre"].setValue(data.NombreRazonSocial);
    this.consultaMateriaPrimaFormEdit.controls["provDocumento"].setValue(data.TipoDocumento + "-" + data.NumeroDocumento);


    this.consultaMateriaPrimaFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccionId);
    this.cargarTipoProveedor();
    await this.cargarTipoProveedor();
    this.consultaMateriaPrimaFormEdit.controls["provTipoSocio"].setValue(data.TipoProvedorId);
    this.consultaMateriaPrimaFormEdit.controls["provCodigo"].setValue(data.CodigoSocio);
    this.consultaMateriaPrimaFormEdit.controls["provDepartamento"].setValue(data.Departamento);
    this.consultaMateriaPrimaFormEdit.controls["provProvincia"].setValue(data.Provincia);
    this.consultaMateriaPrimaFormEdit.controls["provDistrito"].setValue(data.Distrito);
    this.consultaMateriaPrimaFormEdit.controls["provCertificacion"].setValue(data.SocioFincaCertificacion);
    this.consultaMateriaPrimaFormEdit.controls["provZona"].setValue(data.Zona);
    this.consultaMateriaPrimaFormEdit.controls["provFinca"].setValue(data.Finca);
    //this.consultaMateriaPrimaFormEdit.controls["fechaCosecha"].setValue(this.dateUtil.formatDate(new Date(data.FechaPesado),"/"));
    this.consultaMateriaPrimaFormEdit.controls["fechaCosecha"].setValue(formatDate(data.FechaPesado, 'yyyy-MM-dd', 'en'));
    this.consultaMateriaPrimaFormEdit.get('pesado').get("unidadMedida").setValue(data.UnidadMedidaIdPesado);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("cantidad").setValue(data.CantidadPesado);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("kilosBruto").setValue(data.KilosBrutosPesado);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("tara").setValue(data.TaraPesado);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("observacionPesado").setValue(data.ObservacionPesado);
    this.fechaPesado = this.dateUtil.formatDate(new Date(data.FechaPesado), "/");
    this.responsable = data.UsuarioPesado;
    this.consultaMateriaPrimaFormEdit.controls['tipoProveedorId'].setValue(data.TipoProvedorId);
    this.consultaMateriaPrimaFormEdit.controls['socioFincaId'].setValue(data.SocioFincaId);
    this.consultaMateriaPrimaFormEdit.controls['terceroFincaId'].setValue(data.TerceroFincaId);

    this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(data.SocioId);
    this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(data.TerceroId);
    this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(data.IntermediarioId);

    this.consultaMateriaPrimaFormEdit.get('pesado').get("exportGramos").setValue(data.ExportableGramosAnalisisFisico);
    if (data.ExportablePorcentajeAnalisisFisico != null) {
      this.consultaMateriaPrimaFormEdit.get('pesado').get("exportPorcentaje").setValue(data.ExportablePorcentajeAnalisisFisico + "%");
    }
    this.consultaMateriaPrimaFormEdit.get('pesado').get("descarteGramos").setValue(data.DescarteGramosAnalisisFisico);
    if (data.DescartePorcentajeAnalisisFisico != null) {
      this.consultaMateriaPrimaFormEdit.get('pesado').get("descartePorcentaje").setValue(data.DescartePorcentajeAnalisisFisico + "%");
    }
    this.consultaMateriaPrimaFormEdit.get('pesado').get("cascarillaGramos").setValue(data.CascarillaGramosAnalisisFisico);
    if (data.CascarillaPorcentajeAnalisisFisico != null) {
      this.consultaMateriaPrimaFormEdit.get('pesado').get("cascarillaPorcentaje").setValue(data.CascarillaPorcentajeAnalisisFisico + "%");
    }
    this.consultaMateriaPrimaFormEdit.get('pesado').get("totalGramos").setValue(data.TotalGramosAnalisisFisico);
    if (data.TotalPorcentajeAnalisisFisico != null) {
      this.consultaMateriaPrimaFormEdit.get('pesado').get("totalPorcentaje").setValue(data.TotalPorcentajeAnalisisFisico + "%");
    }
    this.consultaMateriaPrimaFormEdit.get('pesado').get("ObservacionAnalisisFisico").setValue(data.ObservacionAnalisisFisico);

    this.unidadMedidaPesado = data.UnidadMedidaIdPesado;
    this.spinner.hide();


  }
  

  async consultarSocioFinca() {
    let request =
    {
      "SocioFincaId": Number(this.consultaMateriaPrimaFormEdit.controls["socioFincaId"].value)
    }

   if ( this.consultaMateriaPrimaFormEdit.controls["producto"].value == "01" &&
   this.consultaMateriaPrimaFormEdit.controls["subproducto"].value == "02" && this.consultaMateriaPrimaFormEdit.controls["provCertificacion"].value != "")
   {
   this.socioFinca.SearchSocioFinca(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            if ( res.Result.Data != null )
            {
              if (res.Result.Data.SaldoPendiente == 0)
              {
                this.consultaMateriaPrimaFormEdit.controls["tipoProduccion"].setValue("02"); 
                this.consultaMateriaPrimaFormEdit.controls["tipoProduccion"].disable();
              }
              else if (res.Result.Data.SaldoPendiente < this.consultaMateriaPrimaFormEdit.get('pesado').get("kilosBruto").value)
              {
                this.alertUtil.alertWarning('Oops!', 'Solo puede ingresar ' + res.Result.Data.SaldoPendiente + ' Kilos Brutos');
                this.btnGuardar = false;
              }
              else{
                this.btnGuardar = true;
              }
            }
            else if (res.Result.Data == null )
            {
              this.alertUtil.alertWarning('Oops!', 'La finca no tiene registrado los estimados para el año actual');
              this.btnGuardar = false;
            }
            
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } },
          err => {
            this.spinner.hide();
            console.log(err);
            this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

async cleanKilosBrutos()
 {
  //this.child.cleanKilosBrutos();
 }

}





