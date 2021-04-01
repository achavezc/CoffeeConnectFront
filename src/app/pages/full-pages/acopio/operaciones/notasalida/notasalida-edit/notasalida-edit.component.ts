
import { Component, OnInit, ViewEncapsulation, Input,ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../../../services/models/login';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { EmpresaService } from '../../../../../../services/empresa.service';
import { ReqNotaSalida, NotaSalidaAlmacenDetalleDTO } from '../../../../../../services/models/req-salidaalmacen-actualizar';
import { NotaSalidaAlmacenService } from '../../../../../../services/nota-salida-almacen.service';
import { TagNotaSalidaEditComponent } from '../notasalida-edit/notasalida/tag-notasalida.component'
import { host } from '../../../../../../shared/hosts/main.host';

@Component({
  selector: 'app-notasalidad-edit',
  templateUrl: './notasalida-edit.component.html',
  styleUrls: ['./notasalida-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class NotaSalidaEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  @ViewChild(TagNotaSalidaEditComponent) child;
  selectClasificacion: any;
  consultaEmpresas: FormGroup;
  submitted = false;
  submittedE = false;
  submittedEdit = false;
  closeResult: string;
  notaSalidaFormEdit: FormGroup;
  errorGeneral: any = { isError: false, errorMessage: '' };
  errorEmpresa: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  selectedE = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  filtrosEmpresaProv: any= {};
  listaClasificacion = [];
  listaAlmacen: any[];
  numero = "";
  esEdit = false;
  selectAlmacen: any;
  ReqNotaSalida;
  id: Number = 0;
  fechaRegistro: any;
  almacen: "";
  fechaPesado: any;
  responsable: "";
  form: string = "notasalida";
  detalle: any;
  disabledControl: string = '';
  @ViewChild(DatatableComponent) tableEmpresa: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private empresaService: EmpresaService,
    private notaSalidaAlmacenService: NotaSalidaAlmacenService

  ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  singleSelectCheck(row: any) {
    return this.selectedE.indexOf(row) === -1;
  }

  seleccionarTipoAlmacen()
  {
    this.child.selectAlmacenLote = this.selectAlmacen;
  }

  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.cargarForm();
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
          this.obtenerDetalle();
        }
        else {
          this.disabledControl = 'disabled';
        }
      }
      );
  }

  obtenerDetalle() {
    this.spinner.show();
    this.notaSalidaAlmacenService.obtenerDetalle(Number(this.id))
      .subscribe(res => {

        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data;
            this.cargarDataFormulario(res.Result.Data);
            this.child.cargarDatos(res.Result.Data.DetalleLotes)
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

  cargarDataFormulario(data: any) {

    this.notaSalidaFormEdit.controls["destinatario"].setValue(data.Destinatario);
    this.notaSalidaFormEdit.controls["ruc"].setValue(data.RucEmpresa);
    this.notaSalidaFormEdit.controls["dirPartida"].setValue(data.DireccionPartida);
    this.notaSalidaFormEdit.controls["dirDestino"].setValue(data.DireccionDestino);
    this.notaSalidaFormEdit.controls["almacen"].setValue(data.AlmacenId);
    this.notaSalidaFormEdit.get('tagcalidad').get("propietario").setValue(data.Transportista);
    this.notaSalidaFormEdit.get('tagcalidad').get("domiciliado").setValue(data.DireccionTransportista);
    this.notaSalidaFormEdit.get('tagcalidad').get("ruc").setValue(data.RucTransportista);
    this.notaSalidaFormEdit.get('tagcalidad').get("conductor").setValue(data.Conductor);
    this.notaSalidaFormEdit.get('tagcalidad').get("brevete").setValue(data.LicenciaConductor);
    this.notaSalidaFormEdit.get('tagcalidad').get("codvehicular").setValue(data.ConfiguracionVehicular);
    this.notaSalidaFormEdit.get('tagcalidad').get("marca").setValue(data.MarcaTractor);
    this.notaSalidaFormEdit.get('tagcalidad').get("placa").setValue(data.PlacaTractor);
    this.notaSalidaFormEdit.get('tagcalidad').get("numconstanciamtc").setValue(data.NumeroConstanciaMTC);
    this.notaSalidaFormEdit.get('tagcalidad').get("motivotranslado").setValue(data.MotivoTrasladoId);
    this.notaSalidaFormEdit.get('tagcalidad').get("numreferencia").setValue(data.Observacion);
    this.notaSalidaFormEdit.get('tagcalidad').get("observacion").setValue(data.Observacion);
    let objectDestino: any = {};
    objectDestino.EmpresaProveedoraAcreedoraId = data.EmpresaIdDestino;
    this.selectedE.push(objectDestino);
    let objectTransporte: any = {};
    objectTransporte.EmpresaTransporteId = data.EmpresaTransporteId;
    objectTransporte.TransporteId = data.TransporteId;
    objectTransporte.NumeroConstanciaMTC = data.NumeroConstanciaMTC;
    objectTransporte.MarcaTractorId = data.MarcaTractorId;
    objectTransporte.PlacaTractor = data.PlacaTractor;
    objectTransporte.MarcaCarretaId = data.MarcaCarretaId;
    objectTransporte.PlacaCarreta = data.PlacaCarreta;
    objectTransporte.Conductor = data.Conductor;
    objectTransporte.Licencia = data.Licencia;
    this.child.selectedT.push(objectTransporte);
    this.numero = data.Numero;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.almacen = data.Almacen;
    this.responsable = data.UsuarioRegistro;
    this.spinner.hide();   
  } 


  get fns() {
    return this.notaSalidaFormEdit.controls;
  }
  cargarForm() 
  {
      this.notaSalidaFormEdit =this.fb.group(
        {
          numNotaSalida:  new FormControl('', []),
          almacen: new FormControl('', [Validators.required]),
          destinatario: ['',[Validators.required] ],
          ruc:   new FormControl('', []),
          dirPartida:  [this.login.Result.Data.DireccionEmpresa, []],
          dirDestino:   new FormControl('', []),
          tagcalidad:this.fb.group({
            propietario: new FormControl('', [Validators.required]),
            domiciliado: new FormControl('', []),
            ruc: new FormControl('', []),
            conductor: new FormControl('', []),
            brevete: new FormControl('', []),
            codvehicular: new FormControl('', []),
            marca: new FormControl('', []),
            placa: new FormControl('', []),
            numconstanciamtc: new FormControl('', []),
            motivotranslado: new FormControl('', [Validators.required]),
            numreferencia: new FormControl('', []),
            observacion: new FormControl('', [])
          }),
        });
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
  }

  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarEmpresas();
    this.clearModalEmpresa();

  }

  clearModalEmpresa() {

    this.selectClasificacion = [];
    this.consultaEmpresas.controls['ruc'].reset;
    this.consultaEmpresas.controls['rzsocial'].reset;
    this.rows = [];
  }


  cargarEmpresas() {
    this.consultaEmpresas = new FormGroup(
      {
        ruc: new FormControl('', []),
        rzsocial: new FormControl('', []),
        clasificacion: new FormControl('', [])
      });
    this.consultaEmpresas.setValidators(this.comparisonValidatorEmpresa())
    this.maestroService.obtenerMaestros("ClasificacionEmpresaProveedoraAcreedora")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaClasificacion = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

  }

  public comparisonValidatorEmpresa(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let rzsocial = group.controls['rzsocial'].value;
      let ruc = group.controls['ruc'].value;
      if (rzsocial == "" && ruc == "") {
        this.errorEmpresa = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };

      }
      else {
        this.errorEmpresa = { isError: false, errorMessage: '' };

      }
      return;
    };
  }
  get fe() {
    return this.consultaEmpresas.controls
  }
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.tableEmpresa.offset = 0;
  }

  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }
  get f() {
    return this.consultaEmpresas.controls
  }
  get fedit() {
    return this.notaSalidaFormEdit.controls;
  }


  cancelar() {
    this.router.navigate(['/acopio/operaciones/notasalida-list']);
  }
  seleccionarEmpresa(e) {

    this.notaSalidaFormEdit.get('destinatario').setValue(e[0].RazonSocial);
    this.notaSalidaFormEdit.get('ruc').setValue(e[0].Ruc);
    this.notaSalidaFormEdit.get('dirDestino').setValue(e[0].Direccion + " - " + e[0].Distrito + " - " + e[0].Provincia + " - " + e[0].Departamento);

    this.modalService.dismissAll();
  }

  buscar() {

    if (this.consultaEmpresas.invalid || this.errorEmpresa.isError) {
      this.submittedE = true;
      return;
    } else {
      this.submittedE = false;
      this.filtrosEmpresaProv.RazonSocial = this.consultaEmpresas.controls['rzsocial'].value;
      this.filtrosEmpresaProv.Ruc = this.consultaEmpresas.controls['ruc'].value;
      this.filtrosEmpresaProv.ClasificacionId = this.consultaEmpresas.controls['clasificacion'].value.length == 0 ? "" : this.consultaEmpresas.controls['clasificacion'].value;
      this.filtrosEmpresaProv.EmpresaId = 1;
      this.filtrosEmpresaProv.EstadoId = "01";
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'large',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.empresaService.ConsultarEmpresaProv(this.filtrosEmpresaProv)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
            } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
              this.errorEmpresa = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorEmpresa = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            this.errorEmpresa = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.errorEmpresa = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }
  guardar() {
    if (this.child.listaLotesDetalleId.length == 0) { this.errorGeneral = { isError: true, errorMessage: 'Seleccionar Lote' }; }
    else {
      this.errorGeneral = { isError: false, errorMessage: '' };
    }
    if (this.notaSalidaFormEdit.invalid || this.errorGeneral.isError) {

      this.submittedEdit = true;
      return;
    } else {
      this.submittedEdit = false;

      let list: NotaSalidaAlmacenDetalleDTO[] = [];
      this.child.listaLotesDetalleId.forEach(x => {
        if (list.length != 0) {
          if ((list.filter(y => y.LoteId == x.LoteId)).length == 0) {
            let object = new NotaSalidaAlmacenDetalleDTO(x.LoteId);
            list.push(object)
          }
        } else {
          let object = new NotaSalidaAlmacenDetalleDTO(x.LoteId);
          list.push(object)
        }
      }
      );
      let request = new ReqNotaSalida(
        Number(this.id),
        Number(this.login.Result.Data.EmpresaId),
        this.notaSalidaFormEdit.get("almacen").value,
        this.numero,
        this.notaSalidaFormEdit.get('tagcalidad').get("motivotranslado").value,
        this.notaSalidaFormEdit.get('tagcalidad').get("numreferencia").value,
        Number(this.selectedE[0].EmpresaProveedoraAcreedoraId),
        Number(this.child.selectedT[0].EmpresaTransporteId),
        Number(this.child.selectedT[0].TransporteId),
        this.child.selectedT[0].NumeroConstanciaMTC,
        this.child.selectedT[0].MarcaTractorId,
        this.child.selectedT[0].PlacaTractor,
        this.child.selectedT[0].MarcaCarretaId,
        this.child.selectedT[0].PlacaCarreta,
        this.child.selectedT[0].Conductor,
        this.child.selectedT[0].Licencia,
        this.notaSalidaFormEdit.get('tagcalidad').get("observacion").value,
        this.child.totales.Total,
        this.child.totales.TotalKilos,
        this.child.totales.PorcentRendimiento,
        null,
        this.login.Result.Data.NombreUsuario,
        list,
        this.child.totales.CantidadTotal
      );
      let json = JSON.stringify(request);
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      if (this.esEdit && this.id != 0) {
        this.actualizarNotaSalidaService(request);
      } else {
        this.registrarNotaSalidaService(request);
      }


    }
  }

  registrarNotaSalidaService(request: ReqNotaSalida) {
    this.notaSalidaAlmacenService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Nota Salida', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/operaciones/notasalida-list']);
              }
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
  actualizarNotaSalidaService(request: ReqNotaSalida) {
    this.notaSalidaAlmacenService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Nota Salida', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/operaciones/notasalida-list']);
              }
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

  imprimir(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaSalidaAlmacen/GenerarPDFGuiaRemision?id=${1}`;
    link.download = "GuiaRemision.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }
}
