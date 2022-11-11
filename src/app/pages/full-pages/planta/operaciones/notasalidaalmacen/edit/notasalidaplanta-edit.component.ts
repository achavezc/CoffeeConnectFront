import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import {AuthService} from './../../../../../../services/auth.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
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
  selectedEmpresa = [];
  listaCampania:any[];
  listaConcepto:any[];
  selectedCampania:any;
  selectedConcepto:any;
  popupModel;
  esRechazo = false;
  vSessionUser: any;
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  filtrosEmpresaProv: any = {};
  listaClasificacion = [];
  //listaAlmacen: any[];
  numero = "";
  esEdit = false;
  selectAlmacen: any;
  ReqNotaSalida;
  id: Number = 0;
  fechaRegistro: any;
  //almacen: "";
  responsable: "";
  empresa: any;
  readonly: boolean;

  


  @ViewChild(DatatableComponent) tableEmpresa: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private notaSalidaAlmacenPlantaService: NotaSalidaAlmacenPlantaService,
    private authService : AuthService

  ) {

  }

  /* seleccionarTipoAlmacen() {
    this.child.selectAlmacenLote = this.selectAlmacen;
  } */

  ngOnInit(): void {
    this.vSessionUser = JSON.parse(localStorage.getItem("user"));
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
      this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  obtenerDetalle() {
    this.spinner.show();
    this.notaSalidaAlmacenPlantaService.obtenerDetalle(Number(this.id))
      .subscribe(res => {
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.cargarDataFormulario(res.Result.Data);
            this.child.cargarDatos(res.Result.Data.Detalle);
            //this.selectAlmacen = res.Result.Data.AlmacenId;
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
    if (data)
     {
      
      //debugger

      this.notaSalidaFormEdit.controls["destinatario"].setValue(data.Destinatario);
      this.notaSalidaFormEdit.controls["campania"].setValue(data.CodigoCampania);
      this.notaSalidaFormEdit.controls["concepto"].setValue(data.CodigoTipoConcepto);
      this.notaSalidaFormEdit.controls["ruc"].setValue(data.RucEmpresa);
      this.notaSalidaFormEdit.controls["dirPartida"].setValue(data.DireccionPartida);
      this.notaSalidaFormEdit.controls["dirDestino"].setValue(data.DireccionDestino);
      //this.notaSalidaFormEdit.controls["almacen"].setValue(data.AlmacenId);
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
      this.notaSalidaFormEdit.get('tagcalidad').get("numReferencia").setValue(data.MotivoSalidaReferencia);
      let objectDestino: any = {};
      objectDestino.EmpresaProveedoraAcreedoraId = data.EmpresaIdDestino;
      this.selectedEmpresa.push(objectDestino);
      let objectTransporte: any = {};
      objectTransporte.EmpresaTransporteId = data.EmpresaTransporteId;
      objectTransporte.TransporteId = data.TransporteId;
      objectTransporte.NumeroConstanciaMTC = data.NumeroConstanciaMTC;
      objectTransporte.MarcaTractorId = data.MarcaTractorId;
      objectTransporte.PlacaTractor = data.PlacaTractor;
      objectTransporte.MarcaCarretaId = data.MarcaCarretaId;
      objectTransporte.PlacaCarreta = data.PlacaCarreta;
      objectTransporte.Conductor = data.Conductor;
      objectTransporte.Licencia = data.LicenciaConductor;
      this.child.selectedTransportista.push(objectTransporte);
      this.numero = data.Numero;
      this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
      //this.almacen = data.Almacen;
      this.responsable = data.UsuarioRegistro;

      if(data.MotivoSalidaId=='03')
      {
        
        this.child.tagNotadeSalida.controls["motivoSalida"].disable();
        this.child.tagNotadeSalida.controls["numReferencia"].disable();

        this.esRechazo = true;        
      }


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
        
        //almacen: new FormControl('', [Validators.required]),
        campania: new FormControl('', [Validators.required]),
        concepto: new FormControl('', [Validators.required]),
        destinatario: ['', [Validators.required]],
        ruc: new FormControl('', []),
        dirPartida: [this.vSessionUser.Result.Data.DireccionEmpresa, []],
        dirDestino: new FormControl('', []),
        tagcalidad: this.fb.group({
          propietario: new FormControl('', []),
          domiciliado: new FormControl('', []),
          ruc: new FormControl('', []),
          conductor: new FormControl('', []),
          brevete: new FormControl('', []),
          codvehicular: new FormControl('', []),
          marca: new FormControl('', []),
          placa: new FormControl('', []),
          numconstanciamtc: new FormControl('', []),
          motivoSalida: new FormControl('', [Validators.required]),
          numReferencia: new FormControl('', []),
          observacion: new FormControl('', [])
        }),
      });
    /* this.maestroService.obtenerMaestros("AlmacenPlanta")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaAlmacen = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      ); */


      this.cargaCampania();
      this.cargaConceptos();
  }

  async cargaCampania() {

    var data = await this.maestroService.ConsultarCampanias("02").toPromise();
    if (data.Result.Success) {
      this.listaCampania = data.Result.Data;
    }

  }
    async cargaConceptos() {

    var data = await this.maestroService.ConsultarConceptos("02").toPromise();
    if (data.Result.Success) {
      this.listaConcepto = data.Result.Data;
    }

  }

  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl' });

  }

  get fedit() {
    return this.notaSalidaFormEdit.controls;
  }

  cancelar() {
    this.router.navigate(['/planta/operaciones/notasalidaplanta-list']);
  }

  guardar() 
  {
    //debugger
    const form = this;
    if (this.child.listaNotaIngreso.length == 0) { this.errorGeneral = { isError: true, errorMessage: 'Seleccione una Nota de Ingreso' }; }
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
          let object = new NotaSalidaAlmacenPlantaDetalleDTO(x.NotaIngresoProductoTerminadoAlmacenPlantaId,x.Cantidad,x.KilosNetos,x.KilosBrutos);
          TotalKilosBrutos = TotalKilosBrutos + x.KilosBrutos;
          TotalKilosNetos = TotalKilosNetos + x.KilosNetos;
          Totaltara = Totaltara + x.Tara;
          Totalcantidad = Totalcantidad + x.Cantidad;
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

      

      var EmpresaProveedoraAcreedoraId = this.selectedEmpresa[0].EmpresaProveedoraAcreedoraId;
      var EmpresaTransporteId = this.child.selectedTransportista[0].EmpresaTransporteId;
      var TransporteId = this.child.selectedTransportista[0].TransporteId;
      var NumeroConstanciaMTC = this.child.selectedTransportista[0].NumeroConstanciaMTC;
      var MarcaTractorId = this.child.selectedTransportista[0].MarcaTractorId;
      var PlacaTractor = this.child.selectedTransportista[0].PlacaTractor;
      var MarcaCarretaId = this.child.selectedTransportista[0].MarcaCarretaId;
      var PlacaCarreta = this.child.selectedTransportista[0].PlacaCarreta;
      var Conductor = this.child.selectedTransportista[0].Conductor;
      var Licencia = this.child.selectedTransportista[0].Licencia;
      var campania = this.notaSalidaFormEdit.controls['campania'].value;
      var concepto = this.notaSalidaFormEdit.controls["concepto"].value;


      let request = new ReqNotaSalidaPlanta(
        Number(this.id),
        Number(this.vSessionUser.Result.Data.EmpresaId),
        "",
        this.numero,
        this.notaSalidaFormEdit.get('tagcalidad').get("motivoSalida").value,
        this.notaSalidaFormEdit.get('tagcalidad').get("numReferencia").value,
        EmpresaProveedoraAcreedoraId,
        EmpresaTransporteId,
        TransporteId,
        NumeroConstanciaMTC,
         MarcaTractorId,
         PlacaTractor,
        MarcaCarretaId,
        PlacaCarreta,
        Conductor,
        Licencia,
        this.notaSalidaFormEdit.get('tagcalidad').get("observacion").value,
        TotalKilosBrutos,
        TotalKilosNetos,
        Totaltara,
        Totalcantidad,
        "01",
        campania,
        concepto,
        this.vSessionUser.Result.Data.NombreUsuario,
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
        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.' , function (result) {
          if (result.isConfirmed) {
            form.actualizarNotaSalidaService(request);
          }
        });   
        
      } else {

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.' , function (result) {
          if (result.isConfirmed) {
            form.registrarNotaSalidaService(request);
          }
        });          
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

  imprimirGuiaRemision(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaSalidaAlmacen/GenerarPDFGuiaRemision?id=${this.id}`;
    link.download = "GuiaRemision.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }
  imprimir(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaSalidaAlmacenPlanta/GenerarPDFNotaSalida?id=${this.id}&empresaId=${this.vSessionUser.Result.Data.EmpresaId}`;
    link.download = "NotaSalidaGuiaRemisionSalida.pdf"
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


  GetEmpresa($event) {
    this.selectedEmpresa = $event
    this.notaSalidaFormEdit.get('destinatario').setValue(this.selectedEmpresa[0].RazonSocial);
    this.notaSalidaFormEdit.get('ruc').setValue(this.selectedEmpresa[0].Ruc);
    this.notaSalidaFormEdit.get('dirDestino').setValue(this.selectedEmpresa[0].Direccion + " - " + this.selectedEmpresa[0].Distrito + " - " + this.selectedEmpresa[0].Provincia + " - " + this.selectedEmpresa[0].Departamento);
    this.modalService.dismissAll();
  }
}
