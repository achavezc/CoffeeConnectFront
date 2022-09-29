import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { ControlCalidadService } from '../../../../../../Services/control-calidad.service';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ReqRegistrarPesadoControlCalidad } from '../../../../../../services/models/req-registrar-controlcalidad';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { SocioFincaService } from './../../../../../../services/socio-finca.service';
import { PesadoCafeCalidadPlantaComponent } from './pesadocafe/pesadocafecalidadplanta.component';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-controlcalidad-edit',
  templateUrl: './controlcalidad-edit.component.html',
  styleUrls: ['./controlcalidad-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class ControlCalidadEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  esEdit = false;
  submitted = false;
  submittedEdit = false;
  closeResult: string;
  controlCalidadFormEdit: FormGroup;
  listaProducto: any[];
  listaSubProducto: any[];
  listaTipoProveedor: any[];
  listaTipoProduccion: any[];
  listaCertificacion: any[];
  listaCertificadora: any[];
  selectedCertificacion: any;
  selectedCertificadora: any;
  selectTipoSocio: any;
  selectTipoProveedor: any;
  selectTipoProduccion: any;
  NotaIngresoPlantaId :any;
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
  form: string = "controlcalidadplanta"
  btnGuardar = true;
  productoOroVerde = '02';
  estadoPesado = "01";
  estadoAnalizado = "02";
  estadoAnulado = "00";
  estadoEnviadoAlmacen = "03";
  PrdCafePergamino = "01";
  SubPrdSeco = "02";
 @ViewChild(PesadoCafeCalidadPlantaComponent) child;
  @ViewChild(DatatableComponent) tableProveedor: DatatableComponent;
  idPlantEntryNote = 0;
  readonly: boolean;
  popUp = true;
  msgErrorGenerico = 'Ocurrio un error interno.';

  constructor(private modalService: NgbModal,
    private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private notaIngresoService: NotaIngresoService,
    private ControlCalidadService:ControlCalidadService,
    private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private socioFinca: SocioFincaService,
    private authService : AuthService
  ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  ngOnInit(): void {
    this.cargarForm();
    this.cargarcombos();
   this.vSessionUser = JSON.parse(localStorage.getItem("user"));
    this.route.queryParams
      .subscribe(params => {
        this.status = params.status;
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
          this.obtenerDetalle()
        }
  // else { this.disabledControl = 'disabled'; }
      }
      );
   this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);;
  }

  cargarForm() {

    this.controlCalidadFormEdit = this.fb.group(
      {

        guiaremision: ['', Validators.required],
        fecharemision: ['', Validators.required],
        tipoProduccion: ['', Validators.required],
        codigoOrganizacion: ['',],
        nombreOrganizacion: ['',],
        producto: ['', Validators.required],
        direccion: ['',],
        rucOrganizacion: ['',],
        subproducto: ['', Validators.required],
        certificacion: ['', ],
        certificadora: ['', ],
        notaIngreso: ['', ],
        pesado: this.fb.group({
          motivo: new FormControl('', [Validators.required]),
          empaque: new FormControl('', [Validators.required]),
          tipo: new FormControl('', [Validators.required]),
          cantidad: new FormControl('', [Validators.required]),
          kilosBrutos: new FormControl('', [Validators.required]),
          pesoSaco: new FormControl('', []),
          calidad: new FormControl('', []),
          tara: new FormControl('', []),
          kilosNetos: new FormControl('', []),
          grado: new FormControl('', []),
          cantidadDefectos: new FormControl('', []),
          porcentajeRendimiento: new FormControl('', []),
          porcentajeHumedad: new FormControl('', []),
          transportista: new FormControl('', [Validators.required]),
          ruc: new FormControl('', [Validators.required]),
          placaVehiculo: new FormControl('', [Validators.required]),
          chofer: new FormControl('', [Validators.required]),
          numeroBrevete: new FormControl('', [Validators.required]),
          marca: new FormControl('', [Validators.required]),
          observacion: new FormControl('', [])
        })
      });
    this.desactivarControl("");

    this.controlCalidadFormEdit.get('pesado').disable();
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

  }

  changeSubProducto(e) {
    
    let filterProducto = e.Codigo;
    let subproducto = this.controlCalidadFormEdit.get('subproducto').value;
    this.validacionPorcentajeRend(filterProducto, subproducto);
    this.cargarSubProducto(filterProducto);
    this.desactivarControl(filterProducto);
  }

  imprimir(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}ControlCalidad/GenerarPDFControlCalidad?id=${this.id}&empresaId=${this.vSessionUser.Result.Data.EmpresaId}`;
    link.download = "GuiaRemision.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }
  desactivarControl(codigo) {
    if (codigo != this.productoOroVerde) {
      this.controlCalidadFormEdit.get("pesado").get("pesoSaco").setValue("");
      this.controlCalidadFormEdit.get("pesado").get("calidad").setValue([]);
      this.controlCalidadFormEdit.get("pesado").get("grado").setValue([]);
      this.controlCalidadFormEdit.get("pesado").get("cantidadDefectos").setValue("");
      this.controlCalidadFormEdit.get("pesado").get("pesoSaco").disable();
      this.controlCalidadFormEdit.get("pesado").get("calidad").disable();
      this.controlCalidadFormEdit.get("pesado").get("grado").disable();
      this.controlCalidadFormEdit.get("pesado").get("cantidadDefectos").disable();
    } else {
      this.controlCalidadFormEdit.get("pesado").get("pesoSaco").enable();
      this.controlCalidadFormEdit.get("pesado").get("calidad").enable();
      this.controlCalidadFormEdit.get("pesado").get("grado").enable();
      this.controlCalidadFormEdit.get("pesado").get("cantidadDefectos").enable();
    }
  }

  agregarNotaIngreso(e) {
    this.obtenerDetalleNotaIngreso(e[0].NotaIngresoPlantaId);

  }
  obtenerDetalleNotaIngreso(id) {
    this.spinner.show();
    this.notaIngresoService.ConsultarPorId(Number(id))
      .subscribe(res => {

        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data;
            if (this.detalle != null) {
              this.cargarDataFormulario(res.Result.Data);
              this.detalle.requestPesado = this.obtenerRequest();
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
      this.controlCalidadFormEdit.disable();

      //Calidad Editable
      //NotaCompra Editable
    } else if (estado == this.estadoAnalizado && usuarioAnalizado != usuarioLogueado) {
      //Cabecera ReadOnly
      //Pesado ReadOnly
      this.btnGuardar = false;
      this.controlCalidadFormEdit.disable();

      //Calidad ReadOnly
      //NotaCompra Editable
    } else if (estado == this.estadoAnulado || estado == this.estadoEnviadoAlmacen) {
      //Cabecera ReadOnly
      //Pesado ReadOnly
      this.btnGuardar = false;
      this.controlCalidadFormEdit.disable();

      //Calidad ReadOnly
      //NotaCompra ReadOnly
    }

  }

  validacionPorcentajeRend(producto, subproducto) {
    if (producto == this.PrdCafePergamino && subproducto != this.SubPrdSeco && subproducto != undefined) {
      this.controlCalidadFormEdit.get('pesado').get("porcentajeRendimiento").disable()
      this.controlCalidadFormEdit.get('pesado').get("porcentajeRendimiento").setValue("");
    }
    else {
      this.controlCalidadFormEdit.get('pesado').get("porcentajeRendimiento").enable();
    }
  }
  changeView(e) {
    let filterSubTipo = e.Codigo;
    let producto = this.controlCalidadFormEdit.get('producto').value;
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
    return this.controlCalidadFormEdit.controls;
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

  obtenerRequest()
  {
    return new ReqRegistrarPesadoControlCalidad(
      Number(this.id),
      this.NotaIngresoPlantaId,
      this.vSessionUser.Result.Data.EmpresaId,
      this.numeroNotaIngreso,
      this.controlCalidadFormEdit.controls["guiaremision"].value,
      this.controlCalidadFormEdit.controls["fecharemision"].value,
      this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId,
      this.controlCalidadFormEdit.controls["tipoProduccion"].value,
      this.controlCalidadFormEdit.controls["producto"].value,
      this.controlCalidadFormEdit.controls["subproducto"].value,
      this.controlCalidadFormEdit.controls["certificacion"].value ? this.controlCalidadFormEdit.controls["certificacion"].value.join('|') : '',
      this.controlCalidadFormEdit.controls["certificadora"].value ? this.controlCalidadFormEdit.controls["certificadora"].value : '',
      this.controlCalidadFormEdit.get('pesado').get("motivo").value,
      this.controlCalidadFormEdit.get('pesado').get("empaque").value,
      Number(this.controlCalidadFormEdit.get('pesado').get("kilosBrutos").value),
      Number(this.controlCalidadFormEdit.get('pesado').get("kilosNetos").value),
      Number(this.controlCalidadFormEdit.get('pesado').get("tara").value),
      this.controlCalidadFormEdit.get('pesado').get("calidad").value,
      this.controlCalidadFormEdit.get('pesado').get("grado").value,
      Number(this.controlCalidadFormEdit.get('pesado').get("cantidadDefectos").value),
      Number(this.controlCalidadFormEdit.get('pesado').get("pesoSaco").value),
      this.controlCalidadFormEdit.get('pesado').get("tipo").value,
      Number(this.controlCalidadFormEdit.get('pesado').get("cantidad").value),
      Number(this.controlCalidadFormEdit.get('pesado').get("porcentajeHumedad").value),
      Number(this.controlCalidadFormEdit.get('pesado').get("porcentajeRendimiento").value),
      this.controlCalidadFormEdit.get('pesado').get("ruc").value,
      this.controlCalidadFormEdit.get('pesado').get("transportista").value,
      this.controlCalidadFormEdit.get('pesado').get("placaVehiculo").value,
      this.controlCalidadFormEdit.get('pesado').get("chofer").value,
      this.controlCalidadFormEdit.get('pesado').get("numeroBrevete").value,
      this.controlCalidadFormEdit.get('pesado').get("observacion").value,
      "01",
      new Date(),
      this.vSessionUser.Result.Data.NombreUsuario,
      new Date(),
      this.controlCalidadFormEdit.controls["direccion"].value,
      this.controlCalidadFormEdit.get('pesado').get("marca").value,
      "",
      ""

    );
  }

  guardar() {

    const form = this;
    if (this.controlCalidadFormEdit.invalid) {
      this.submittedEdit = true;
      return;
    } else {
      if (this.controlCalidadFormEdit.get('pesado').get("calidad").value == null || this.controlCalidadFormEdit.get('pesado').get("calidad").value.length == 0) {
        this.controlCalidadFormEdit.get('pesado').get("calidad").setValue("");
      }
      if (this.controlCalidadFormEdit.get('pesado').get("grado").value == null || this.controlCalidadFormEdit.get('pesado').get("grado").value.length == 0) {
        this.controlCalidadFormEdit.get('pesado').get("grado").setValue("");
      }

      let request = new ReqRegistrarPesadoControlCalidad(
        Number(this.id),
        this.NotaIngresoPlantaId,
        this.vSessionUser.Result.Data.EmpresaId,
        this.numeroNotaIngreso,
        this.controlCalidadFormEdit.controls["guiaremision"].value,
        this.controlCalidadFormEdit.controls["fecharemision"].value,
        this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId,
        this.controlCalidadFormEdit.controls["tipoProduccion"].value,
        this.controlCalidadFormEdit.controls["producto"].value,
        this.controlCalidadFormEdit.controls["subproducto"].value,
        this.controlCalidadFormEdit.controls["certificacion"].value ? this.controlCalidadFormEdit.controls["certificacion"].value.join('|') : '',
        this.controlCalidadFormEdit.controls["certificadora"].value ? this.controlCalidadFormEdit.controls["certificadora"].value : '',
        this.controlCalidadFormEdit.get('pesado').get("motivo").value,
        this.controlCalidadFormEdit.get('pesado').get("empaque").value,
        Number(this.controlCalidadFormEdit.get('pesado').get("kilosBrutos").value),
        Number(this.controlCalidadFormEdit.get('pesado').get("kilosNetos").value),
        Number(this.controlCalidadFormEdit.get('pesado').get("tara").value),
        this.controlCalidadFormEdit.get('pesado').get("calidad").value,
        this.controlCalidadFormEdit.get('pesado').get("grado").value,
        Number(this.controlCalidadFormEdit.get('pesado').get("cantidadDefectos").value),
        Number(this.controlCalidadFormEdit.get('pesado').get("pesoSaco").value),
        this.controlCalidadFormEdit.get('pesado').get("tipo").value,
        Number(this.controlCalidadFormEdit.get('pesado').get("cantidad").value),
        Number(this.controlCalidadFormEdit.get('pesado').get("porcentajeHumedad").value),
        Number(this.controlCalidadFormEdit.get('pesado').get("porcentajeRendimiento").value),
        this.controlCalidadFormEdit.get('pesado').get("ruc").value,
        this.controlCalidadFormEdit.get('pesado').get("transportista").value,
        this.controlCalidadFormEdit.get('pesado').get("placaVehiculo").value,
        this.controlCalidadFormEdit.get('pesado').get("chofer").value,
        this.controlCalidadFormEdit.get('pesado').get("numeroBrevete").value,
        this.controlCalidadFormEdit.get('pesado').get("observacion").value,
        "01",
        new Date(),
        this.vSessionUser.Result.Data.NombreUsuario,
        new Date(),
        this.controlCalidadFormEdit.controls["direccion"].value,
        this.controlCalidadFormEdit.get('pesado').get("marca").value,
        "",
        ""

      );
    //  this.spinner.show(undefined,
      //  {
        //  type: 'ball-triangle-path',
         // size: 'medium',
         // bdColor: 'rgba(0, 0, 0, 0.8)',
         // color: '#fff',
         // fullScreen: true
        //});
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

  guardarService(request: any) {
    this.ControlCalidadService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Nota Ingreso Registrado.', function (result) {
              form.router.navigate(['/planta/operaciones/controlcalidad-list']);
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
    this.ControlCalidadService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Nota Ingreso Actualizado.', function (result) {
              form.router.navigate(['/planta/operaciones/controlcalidad-list']);
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
    this.router.navigate(['/planta/operaciones/controlcalidad-list']);
  }


  obtenerDetalle() {
    this.spinner.show();
    this.ControlCalidadService.ConsultarPorId(Number(this.id))
      .subscribe(res => {
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data;
            if (this.detalle != null) {
              this.cargarDataFormulario(res.Result.Data);
            } else {
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
    this.NotaIngresoPlantaId = data.NotaIngresoPlantaId;
    this.idPlantEntryNote = data.NotaIngresoPlantaId;
    this.numeroNotaIngreso = data.Numero;
    this.viewTagSeco = data.SubProductoId != "02" ? false : true;
    this.controlCalidadFormEdit.controls["guiaremision"].setValue(data.NumeroGuiaRemision);
    this.controlCalidadFormEdit.controls["fecharemision"].setValue(formatDate(data.FechaGuiaRemision, 'yyyy-MM-dd', 'en'));
    this.controlCalidadFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccionId);
    this.controlCalidadFormEdit.controls["codigoOrganizacion"].setValue(data.NumeroOrganizacion);
    this.controlCalidadFormEdit.controls["nombreOrganizacion"].setValue(data.RazonSocialOrganizacion);
    this.controlCalidadFormEdit.controls["producto"].setValue(data.ProductoId);
    this.controlCalidadFormEdit.controls["notaIngreso"].setValue("");
  
    this.controlCalidadFormEdit.controls["direccion"].setValue(data.DireccionOrganizacion);
    this.controlCalidadFormEdit.controls["rucOrganizacion"].setValue(data.RucOrganizacion);
    await this.cargarSubProducto(data.ProductoId);
    this.controlCalidadFormEdit.controls["subproducto"].setValue(data.SubProductoId);
    //this.notaIngredoFormEdit.controls["certificacion"].setValue(data.CertificacionId);
    this.controlCalidadFormEdit.controls.certificacion.setValue(data.CertificacionId.split('|').map(String));
    this.controlCalidadFormEdit.controls["certificadora"].setValue(data.EntidadCertificadoraId);
    this.controlCalidadFormEdit.get('pesado').get("motivo").setValue(data.MotivoIngresoId);
    this.controlCalidadFormEdit.get('pesado').get("empaque").setValue(data.EmpaqueId);
    this.controlCalidadFormEdit.get('pesado').get("tipo").setValue(data.TipoId);
    this.controlCalidadFormEdit.get('pesado').get("cantidad").setValue(data.Cantidad);
    this.controlCalidadFormEdit.get('pesado').get("kilosBrutos").setValue(data.KilosBrutos);
    this.controlCalidadFormEdit.get('pesado').get("pesoSaco").setValue(data.PesoPorSaco);
    this.controlCalidadFormEdit.get('pesado').get("calidad").setValue(data.CalidadId);
    this.controlCalidadFormEdit.get('pesado').get("tara").setValue(data.Tara);
    this.controlCalidadFormEdit.get('pesado').get("kilosNetos").setValue(data.KilosNetos);
    this.controlCalidadFormEdit.get('pesado').get("grado").setValue(data.GradoId);
    this.controlCalidadFormEdit.get('pesado').get("cantidadDefectos").setValue(data.CantidadDefectos);
    this.controlCalidadFormEdit.get('pesado').get("porcentajeRendimiento").setValue(data.RendimientoPorcentaje);
    this.controlCalidadFormEdit.get('pesado').get("porcentajeHumedad").setValue(data.HumedadPorcentaje);
    this.controlCalidadFormEdit.get('pesado').get("transportista").setValue(data.RazonEmpresaTransporte);
    this.controlCalidadFormEdit.get('pesado').get("ruc").setValue(data.RucEmpresaTransporte);
    this.controlCalidadFormEdit.get('pesado').get("placaVehiculo").setValue(data.PlacaTractorEmpresaTransporte);
    this.controlCalidadFormEdit.get('pesado').get("chofer").setValue(data.ConductorEmpresaTransporte);
    this.controlCalidadFormEdit.get('pesado').get("numeroBrevete").setValue(data.LicenciaConductorEmpresaTransporte);
    this.controlCalidadFormEdit.get('pesado').get("observacion").setValue(data.ObservacionPesado);
    this.controlCalidadFormEdit.get('pesado').get("marca").setValue(data.Marca);
    this.validacionPorcentajeRend(data.ProductoId,data.SubProductoId);
    this.estado = data.Estado
    this.numeroNotaIngreso = data.Numero;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.fechaPesado = this.dateUtil.formatDate(new Date(data.FechaPesado), "/");
    this.responsable = data.UsuarioPesado;
    this.selectOrganizacion[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaOrigenId };
    this.desactivarControles(data.EstadoId, data.UsuarioPesado, data.UsuarioCalidad);
    this.detalle.requestPesado = this.obtenerRequest();
    this.spinner.hide();
    this.modalService.dismissAll();
  }

  async consultarSocioFinca() {
    let request =
    {
      "SocioFincaId": Number(this.controlCalidadFormEdit.controls["socioFincaId"].value)
    }

    if (this.controlCalidadFormEdit.controls["producto"].value == "01" &&
      this.controlCalidadFormEdit.controls["subproducto"].value == "02" && this.controlCalidadFormEdit.controls["provCertificacion"].value != "") {
      this.socioFinca.SearchSocioFinca(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              if (res.Result.Data != null) {
                if (res.Result.Data.SaldoPendiente == 0) {
                  this.controlCalidadFormEdit.controls["tipoProduccion"].setValue("02");
                  this.controlCalidadFormEdit.controls["tipoProduccion"].disable();
                }
                else if (res.Result.Data.SaldoPendiente < this.controlCalidadFormEdit.get('pesado').get("kilosBruto").value) {
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
      this.controlCalidadFormEdit.controls['direccion'].setValue(`${this.selectOrganizacion[0].Direccion} - ${this.selectOrganizacion[0].Distrito} - ${this.selectOrganizacion[0].Provincia} - ${this.selectOrganizacion[0].Departamento}`);
      this.controlCalidadFormEdit.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.controlCalidadFormEdit.controls['rucOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
    }
    this.modalService.dismissAll();
  }




  Documents(): void {

  }
}