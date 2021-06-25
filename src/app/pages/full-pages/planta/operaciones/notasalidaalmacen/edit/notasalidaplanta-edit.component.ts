import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../../../services/models/login';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { EmpresaService } from '../../../../../../services/empresa.service';
import { ReqNotaSalidaPlanta, NotaSalidaAlmacenPlantaDetalleDTO } from '../../../../../../services/models/req-salidaalmaceplanta';
import { TagNotaSalidaPlantaEditComponent } from './tags/notasalidaplanta-tag.component';
import { host } from '../../../../../../shared/hosts/main.host';
import { NotaSalidaAlmacenPlantaService } from '../../../../../../services/nota-salida-almacen-planta.service';

@Component({
  selector: 'app-notasalidaplanta-edit',
  templateUrl: './notasalidaplanta-edit.component.html',
  styleUrls: ['./notasalidaplanta-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotaSalidaPlantaEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  @ViewChild(TagNotaSalidaPlantaEditComponent) child;
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
  selectOrganizacion = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  filtrosEmpresaProv: any = {};
  listaClasificacion = [];
  listaAlmacen: any[];
  numero = "";
  esEdit = false;
  selectAlmacen: any;
  ReqNotaSalida;
  id: Number = 0;
  fechaRegistro: any;
  almacen: "";
  responsable: "";
  empresa: any;


  @ViewChild(DatatableComponent) tableEmpresa: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private empresaService: EmpresaService,
    private notaSalidaAlmacenPlantaService: NotaSalidaAlmacenPlantaService

  ) {

  }

  seleccionarTipoAlmacen() {
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
      }
      );
  }

  obtenerDetalle() {
    this.spinner.show();
    this.notaSalidaAlmacenPlantaService.obtenerDetalle(Number(this.id))
      .subscribe(res => {
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.cargarDataFormulario(res.Result.Data);
            this.child.cargarDatos(res.Result.Data.Detalle);
            this.selectAlmacen = res.Result.Data.AlmacenId;
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
    if (data) {
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
      this.notaSalidaFormEdit.get('tagcalidad').get("motivoSalida").setValue(data.MotivoSalidaId);
      this.notaSalidaFormEdit.get('tagcalidad').get("observacion").setValue(data.Observacion);
      let objectDestino: any = {};
      objectDestino.OrganizacionId = data.EmpresaIdDestino;
      this.selectOrganizacion.push(objectDestino);
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
    } else {
      this.alertUtil.alertOkCallback('ADVERTENCIA', 'No existe la nota de salida de planta.', () => {
        this.spinner.hide();
        this.cancelar();
      });
    }
  }

  get fns() {
    return this.notaSalidaFormEdit.controls;
  }

  cargarForm() {
    this.notaSalidaFormEdit = this.fb.group(
      {
        numNotaSalida: new FormControl('', []),
        almacen: new FormControl('', [Validators.required]),
        destinatario: ['', [Validators.required]],
        ruc: new FormControl('', []),
        dirPartida: [this.login.Result.Data.DireccionEmpresa, []],
        dirDestino: new FormControl('', []),
        tagcalidad: this.fb.group({
          propietario: new FormControl('', [Validators.required]),
          domiciliado: new FormControl('', []),
          ruc: new FormControl('', []),
          conductor: new FormControl('', []),
          brevete: new FormControl('', []),
          codvehicular: new FormControl('', []),
          marca: new FormControl('', []),
          placa: new FormControl('', []),
          numconstanciamtc: new FormControl('', []),
          motivoSalida: new FormControl('', [Validators.required]),
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

  }

  get fedit() {
    return this.notaSalidaFormEdit.controls;
  }

  cancelar() {
    this.router.navigate(['/planta/operaciones/notasalidaplanta-list']);
  }

  guardar() {
    if (this.child.listaNotaIngreso.length == 0) { this.errorGeneral = { isError: true, errorMessage: 'Seleccionar Lote' }; }
    else {
      this.errorGeneral = { isError: false, errorMessage: '' };
    }
    if (this.notaSalidaFormEdit.invalid || this.errorGeneral.isError) {

      this.submittedEdit = true;
      return;
    } else {
      this.submittedEdit = false;
      var TotalKilosBrutos = 0;
      var TotalKilosNetos = 0;
      var Totaltara = 0;
      var Totalcantidad = 0;
      let list: NotaSalidaAlmacenPlantaDetalleDTO[] = [];
      if (this.child.listaNotaIngreso.length != 0) {
        this.child.listaNotaIngreso.forEach(x => {
          let object = new NotaSalidaAlmacenPlantaDetalleDTO(x.NotaIngresoAlmacenPlantaId);
          TotalKilosBrutos = TotalKilosBrutos + x.KilosBrutosPesado;
          TotalKilosNetos = TotalKilosNetos + x.KilosNetosPesado;
          Totaltara = Totaltara + x.TaraPesado;
          Totalcantidad = Totalcantidad + x.CantidadPesado;
          list.push(object)
        });
      }
      /*this.child.listaNotaIngreso.forEach(x => {
        if (list.length != 0) {
          if ((list.filter(y => y.NotaIngresoAlmacenPlantaId == x.NotaIngresoAlmacenPlantaId)).length == 0) {
            let object = new NotaSalidaAlmacenPlantaDetalleDTO(x.NotaIngresoAlmacenPlantaId);
            TotalKilosBrutos = TotalKilosBrutos + x.KilosBrutos;
            TotalKilosNetos = TotalKilosNetos + x.KilosNetos;
            Totaltara = Totaltara + x.Tara;
            list.push(object)
          }
        } else {
          let object = new NotaSalidaAlmacenPlantaDetalleDTO(x.NotaIngresoAlmacenPlantaId);
          TotalKilosBrutos = x.KilosBrutos;
            TotalKilosNetos = TotalKilosNetos + x.KilosNetos;
            Totaltara = Totaltara + x.Tara;
          list.push(object)
        }
      }
      );*/
      let request = new ReqNotaSalidaPlanta(
        Number(this.id),
        Number(this.login.Result.Data.EmpresaId),
        this.notaSalidaFormEdit.get("almacen").value,
        this.numero,
        this.notaSalidaFormEdit.get('tagcalidad').get("motivoSalida").value,
        "",
        Number(this.selectOrganizacion[0].OrganizacionId),
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
        TotalKilosBrutos,
        TotalKilosNetos,
        Totaltara,
        this.child.listaNotaIngreso[0].CantidadPesado,
        "01",
        this.login.Result.Data.NombreUsuario,
        list

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

  registrarNotaSalidaService(request: ReqNotaSalidaPlanta) {
    this.notaSalidaAlmacenPlantaService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Nota Salida', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/planta/operaciones/notasalidaplanta-list']);
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

  actualizarNotaSalidaService(request: ReqNotaSalidaPlanta) {
    this.notaSalidaAlmacenPlantaService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Nota Salida', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/planta/operaciones/notasalidaplanta-list']);
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
    link.href = `${host}NotaSalidaAlmacen/GenerarPDFGuiaRemision?id=${this.id}`;
    link.download = "GuiaRemision.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

  ListaProductores(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaSalidaAlmacen/GenerarPDFListaProductores?id=${this.id}`;
    link.download = "ListaProductoresGR.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

  RegistroSeguridad(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaSalidaAlmacen/GenerarPDFRegistroSeguridad?id=${this.id}`;
    link.download = "ListaProductoresGR.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

  GetDataEmpresa(event: any): void {
    this.selectOrganizacion = event;
    if (this.selectOrganizacion[0]) {
      this.notaSalidaFormEdit.controls["destinatario"].setValue(this.selectOrganizacion[0].RazonSocial);
      this.notaSalidaFormEdit.controls["ruc"].setValue(this.selectOrganizacion[0].Ruc);
      this.notaSalidaFormEdit.controls["dirDestino"].setValue(`${this.selectOrganizacion[0].Direccion} - ${this.selectOrganizacion[0].Distrito} - ${this.selectOrganizacion[0].Provincia} - ${this.selectOrganizacion[0].Departamento}`);

    }
    this.modalService.dismissAll();
  }
}
