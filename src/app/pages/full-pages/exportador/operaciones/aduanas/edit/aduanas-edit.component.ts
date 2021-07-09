import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ILogin } from '../../../../../../services/models/login';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MaestroService } from '../../../../../../services/maestro.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { Certificaciones, ReqAduanas, Detalle } from './../../../../../../services/models/req-aduanas-registrar';
import { OrdenservicioControlcalidadService } from './../../../../../../services/ordenservicio-controlcalidad.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AduanaService } from '../../../../../../services/aduanas.service';
import {EmpresaProveedoraService} from '../../../../../../services/empresaproveedora.service';


@Component({
  selector: 'app-aduanas-edit',
  templateUrl: './aduanas-edit.component.html',
  styleUrls: ['./aduanas-edit.component.scss', "/assets/sass/libs/datatables.scss"]
})
export class AduanasEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  login: ILogin;
  aduanasFormEdit: FormGroup;
  listaEstado: any[];
  selectEstado: any;
  submittedEdit = false;
  submitted = false;
  detalle: any;
  numero: any = "";
  fechaRegistro: any;
  listaNaviera: any[];
  selectedtNaviera: any;
  esEdit: true;
  listaLaboratorios: any[];
  selectLaboratorio: any;
  rows = [];
  errorGeneral: any = { isError: false, errorMessage: '' };
  selectEmpresa: any[] =[];
  selectExportador: any[] =[];
  selectProductor: any[] =[];
  selectContrato: any[] =[];
  responsable: "";
  id: Number = 0;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  estado: any;
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  popUp = true;
  arrayCertificaciones : any[] = [];

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private modalService: NgbModal,
    private router: Router,
   private ordenservicioControlcalidadService: OrdenservicioControlcalidadService,
    private alertUtil: AlertUtil,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private empresaProveedoraService : EmpresaProveedoraService,
    private aduanaService: AduanaService) {
  }
  cargarForm() {
    this.aduanasFormEdit = this.fb.group(
      {
        contrato: ['', [Validators.required]],
        ruc: new FormControl('', [Validators.required]),
        agencia: new FormControl('', [Validators.required]),
        clientefinal: new FormControl('', []),
        floid: new FormControl('', []),
        exportador: new FormControl('',  [Validators.required]),
        productor: new FormControl('',  [Validators.required]),
        fechaEmbarque: new FormControl('', [Validators.required]),
        fechaFac: new FormControl('', [Validators.required]),
        po: new FormControl('', [Validators.required]),
        producto: new FormControl('', []),
        subproducto: new FormControl('', []),
        calidad: new FormControl('', []),
        empaque: new FormControl('', []),
        cantidad: new FormControl('', []),
        pesoxsaco: new FormControl('', []),
        totalkilosnetos: new FormControl('', []),
        laboratorio: new FormControl('', [Validators.required]),
        fechaRecojo: new FormControl('', [Validators.required]),
        trackingNumber: new FormControl('', [Validators.required]),
        fechaRecepcion: new FormControl('', [Validators.required]),
        observacion: new FormControl('', []),
        certificaciones: new FormControl('', [Validators.required]),
        marca: new FormControl('', [Validators.required]),
        estado: new FormControl('', [Validators.required]),
        naviera: new FormControl('', [Validators.required])
      });

    this.maestroService.obtenerMaestros("EstadoAduana")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaEstado = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

      this.maestroService.obtenerMaestros("Naviera")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaNaviera = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

      this.maestroService.obtenerMaestros("Laboratorio")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaLaboratorios = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

      
      
  }

  receiveMessage($event) {
    this.selectEmpresa = $event    
    this.aduanasFormEdit.get('ruc').setValue(this.selectEmpresa[0].Ruc);
    this.aduanasFormEdit.get('agencia').setValue(this.selectEmpresa[0].RazonSocial);
    this.modalService.dismissAll();
  }

  receiveMessageExportador($event) {
    this.selectExportador = $event
    this.aduanasFormEdit.get('exportador').setValue(this.selectExportador[0].RazonSocial);
    this.consultarCertificaciones(this.selectExportador[0].EmpresaProveedoraAcreedoraId);
    this.modalService.dismissAll();
  }

  receiveMessageProductor($event) {
    this.selectProductor = $event
    this.aduanasFormEdit.get('productor').setValue(this.selectProductor[0].RazonSocial);
    this.consultarCertificaciones(this.selectExportador[0].EmpresaProveedoraAcreedoraId);
    this.modalService.dismissAll();
  }

  receiveMessageContrato($event)
  {
    this.selectContrato = $event;
    this.aduanasFormEdit.get('contrato').setValue(this.selectContrato[0].Numero);
    this.aduanasFormEdit.get('producto').setValue(this.selectContrato[0].Producto);
    this.aduanasFormEdit.get('subproducto').setValue(this.selectContrato[0].SubProducto);
    this.aduanasFormEdit.get('calidad').setValue(this.selectContrato[0].Calidad);
    this.aduanasFormEdit.get('empaque').setValue(this.selectContrato[0].Empaque + " - " + this.selectContrato[0].TipoEmpaque);
    this.aduanasFormEdit.get('cantidad').setValue(this.selectContrato[0].Empaque);
    this.aduanasFormEdit.get('pesoxsaco').setValue(this.selectContrato[0].PesoPorSaco);
    this.aduanasFormEdit.get('totalkilosnetos').setValue(this.selectContrato[0].PesoKilos);
    this.aduanasFormEdit.get('clientefinal').setValue(this.selectContrato[0].Cliente);
    this.aduanasFormEdit.get('floid').setValue(this.selectContrato[0].Cliente);
    
    this.modalService.dismissAll();
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
        
      });

    
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 100,
        allowSearchFilter: true
      };
  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl' });

  }

  consultarCertificaciones ( id : number)
  {
    let request = { EmpresaProveedoraAcreedoraId : id}
    
    this.empresaProveedoraService.ConsultarCertificaciones(request)
    .subscribe(res => {
      this.spinner.hide();
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          res.Result.Data.Certificaciones.forEach(x => {
            let object = {  item_id: x.TipoCertificacionId +"-"+x.EmpresaProveedoraAcreedoraId , item_text: x.Certificacion + "-"+  x.CodigoCertificacion}
            this.arrayCertificaciones.push(object);
          });
          this.dropdownList = this.arrayCertificaciones;
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
  obtenerDetalle()
  {
    this.spinner.show();
    let request = {AduanaId:Number(this.id) }
    this.aduanaService.ConsultarPorId(request)
      .subscribe(res => {
        this.spinner.hide();
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
  }
  async cargarDataFormulario(data: any)
  {
    this.selectEmpresa[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaProcesadoraId};
    this.numero = data.Numero;
    this.estado = data.Estado;
    this.responsable = data.UsuarioRegistro;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.aduanasFormEdit.get('destinatario').setValue(data.RazonSocialEmpresaProcesadora);
    this.aduanasFormEdit.get('ruc').setValue(data.RucEmpresaProcesadora);
    this.aduanasFormEdit.get('dirDestino').setValue(data.DireccionEmpresaProcesadora);
    this.aduanasFormEdit.get('tagordenservicio').get('producto').setValue(data.ProductoId);
    this.aduanasFormEdit.get('tagordenservicio').get('subproducto').setValue(data.SubProductoId);
    this.aduanasFormEdit.get('tagordenservicio').get('tipoProduccion').setValue(data.TipoProduccionId);
    this.aduanasFormEdit.get('tagordenservicio').get('rendimiento').setValue(data.RendimientoEsperadoPorcentaje);
    this.aduanasFormEdit.get('tagordenservicio').get('unidadmedida').setValue(data.UnidadMedidaId);
    this.aduanasFormEdit.get('tagordenservicio').get('cantidad').setValue(data.CantidadPesado);
    
  }

  

  get fedit() {
    return this.aduanasFormEdit.controls;
  }

  guardar() {
    if (this.aduanasFormEdit.invalid || this.errorGeneral.isError) {

      this.submittedEdit = true;
      return;
    }
    else {
      this.submittedEdit = false;
      let listCertificaciones: Certificaciones[] = [];
      let listDetalle: Detalle[] = [];
      this.rows.forEach(x=>
        {
          let detalle : Detalle = new Detalle();
          detalle.NroNotaIngresoPlanta = x.NumeroNotaIngreso;
          detalle.CantidadSacos = x.Cantidad;
          detalle.KilosNetos = x.KilosNetos;
          detalle.NumeroLote = x.Lote
          listDetalle.push(detalle);
        });
      
      this.selectedItems.forEach( x =>
        {
          let certificacion : Certificaciones = new Certificaciones();
          certificacion.TipoCertificacionId = x.item_id.split("-")[0];
          certificacion.CodigoCertificacion = x.item_text.split("-")[1];
          certificacion.EmpresaProveedoraAcreedoraId = Number(x.item_id.split("-")[1]);
          listCertificaciones.push(certificacion);
        });
      
      let request = new ReqAduanas(
        Number(this.id),
        Number (this.selectContrato[0].ContratoId),
        Number (this.selectExportador[0].EmpresaProveedoraAcreedoraId),
        Number (this.selectProductor[0].EmpresaProveedoraAcreedoraId),
        this.login.Result.Data.EmpresaId,
        this.numero,
        this.aduanasFormEdit.get('marca').value,
        this.aduanasFormEdit.get('po').value,
        this.aduanasFormEdit.get('laboratorio').value,
        this.aduanasFormEdit.get('fechaRecojo').value,
        this.aduanasFormEdit.get('trackingNumber').value,
        this.aduanasFormEdit.get('estado').value,
        this.aduanasFormEdit.get('fechaRecepcion').value,
        this.aduanasFormEdit.get('naviera').value,
        this.aduanasFormEdit.get('observacion').value,
        listCertificaciones,
        this.aduanasFormEdit.get('fechaEmbarque').value,
        this.aduanasFormEdit.get('fechaFac').value,
        this.login.Result.Data.NombreUsuario,
        Number (this.selectEmpresa[0].EmpresaProveedoraAcreedoraId),
        listDetalle
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
        this.actualizar(request);
      } else {
        this.registrar(request);
      }
    }

  }


  registrar(request: ReqAduanas) {
    this.aduanaService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Informacion Aduanas', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['operaciones/aduanas/list']);
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
  actualizar(request: ReqAduanas) {
   this.aduanaService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Orden de Servicio', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/operaciones/aduanas/list']);
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
  cancelar() {

    this.router.navigate(['/exportador/operaciones/aduanas/list']);
  }
  addRow(): void {
    this.rows = [...this.rows, { NumeroNotaIngreso: '', Cantidad: 0, KilosNetos: 0, Lote: '' }];
  }
  EliminarFila(index: any): void {
    this.rows.splice(index, 1);
    this.rows = [...this.rows];
  }
  UpdateValue(event: any, index: any, prop: any): void {
    if (prop === 'numeroNotaIngreso') {
      this.rows[index].NumeroNotaIngreso = event.target.value
    } else if (prop === 'cantidad') {
      this.rows[index].Cantidad = parseFloat(event.target.value)
    }else if (prop === 'kilosnetos') {
      this.rows[index].KilosNetos = parseFloat(event.target.value)
    }else if (prop === 'lote') {
      this.rows[index].Lote = event.target.value
    }
  }

  close() {
    this.modalService.dismissAll();
  }
}