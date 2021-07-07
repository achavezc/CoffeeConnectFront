import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ILogin } from '../../../../../../services/models/login';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MaestroService } from '../../../../../../services/maestro.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { ReqOrdenServicio } from './../../../../../../services/models/req-ordenservicio-registrar';
import { OrdenservicioControlcalidadService } from './../../../../../../services/ordenservicio-controlcalidad.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';

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
  viewTagSeco: boolean = null;
  listaEstado: any[];
  selectEstado: any;
  submittedEdit = false;
  submitted = false;
  detalle: any;
  disabledControl: string = '';
  form: string = "ordenServicio";
  numero: any = "";
  fechaRegistro: any;
  listaNaviera: any[];
  selectedtNaviera: any;
  esEdit: true;
  listaLaboratorios: any[];
  listaTipoDocumento: any[];
  selectedTipoDocumento: any;
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
    private empresaProveedoraService : EmpresaProveedoraService) {
  }
  cargarForm() {
    this.aduanasFormEdit = this.fb.group(
      {
        contrato: ['', [Validators.required]],
        ruc: ['', [Validators.required]],
        agencia: ['', []],
        clientefinal: new FormControl('', []),
        floid: new FormControl('', []),
        exportador: new FormControl('', []),
        productor: new FormControl('', []),
        fechaEmbarque: new FormControl('', []),
        fechaFac: new FormControl('', []),
        po: new FormControl('', []),
        producto: new FormControl('', []),
        subproducto: new FormControl('', []),
        calidad: new FormControl('', []),
        empaque: new FormControl('', []),
        cantidad: new FormControl('', []),
        pesoxsaco: new FormControl('', []),
        totalkilosnetos: new FormControl('', []),
        laboratorio: ['', [Validators.required]],
        fechaRecojo: new FormControl('', []),
        trackingNumber: new FormControl('', []),
        fechaRecepcion: new FormControl('', []),
        observacion: new FormControl('', []),
        certificaciones: new FormControl('', []),
        marca: new FormControl('', [])
      });

    this.maestroService.obtenerMaestros("EstadoOrdenServicioControlCalidad")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaEstado = res.Result.Data;
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

  receiveSubProducto($event) {
    this.viewTagSeco = $event;
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
      });

     /* this.dropdownList = [
        { item_id: 1, item_text: 'Mumbai' },
        { item_id: 2, item_text: 'Bangaluru' },
        { item_id: 3, item_text: 'Pune' },
        { item_id: 4, item_text: 'Navsari' },
        { item_id: 5, item_text: 'New Delhi' }
      ];*/
     /* this.selectedItems = [
        { item_id: 3, item_text: 'Pune' },
        { item_id: 4, item_text: 'Navsari' }
      ];*/
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'item_id',
        textField: 'item_text',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 3,
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
            let object = {item_id: x.TipoCertificacionId +"-"+ x.CodigoCertificacion, item_text: x.Certificacion + " - "+  x.CodigoCertificacion}
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
    this.ordenservicioControlcalidadService.ConsultarPorId(Number(this.id))
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
    this.viewTagSeco = data.SubProductoId != "02" ? false : true;
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
      let request = new ReqOrdenServicio(
        Number(this.id),
        Number(this.login.Result.Data.EmpresaId),
        this.selectEmpresa[0].EmpresaProveedoraAcreedoraId,
        this.numero,
        this.aduanasFormEdit.get('tagordenservicio').get("unidadmedida").value,
        Number(this.aduanasFormEdit.get('tagordenservicio').get("cantidad").value),
        this.aduanasFormEdit.get('tagordenservicio').get("producto").value,
        this.aduanasFormEdit.get('tagordenservicio').get("subproducto").value,
        this.aduanasFormEdit.get('tagordenservicio').get("tipoProduccion").value,
        Number(this.aduanasFormEdit.get('tagordenservicio').get("rendimiento").value),
        this.login.Result.Data.NombreUsuario
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


  registrarNotaSalidaService(request: ReqOrdenServicio) {
    this.ordenservicioControlcalidadService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Orden de Servicio', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['operaciones/orderservicio-controlcalidadexterna-list']);
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
  actualizarNotaSalidaService(request: ReqOrdenServicio) {
   this.ordenservicioControlcalidadService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Orden de Servicio', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/operaciones/orderservicio-controlcalidadexterna-list']);
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

    this.router.navigate(['/acopio/operaciones/orderservicio-controlcalidadexterna-list']);
  }
  addRow(): void {
    this.rows = [...this.rows, { Anio: 0, Estimado: 0, ProductoId: '', Consumido: 0 }];
  }
  EliminarFila(index: any): void {
    this.rows.splice(index, 1);
    this.rows = [...this.rows];
  }
  UpdateValue(event: any, index: any, prop: any): void {
    if (prop === 'anio') {
      this.rows[index].Anio = parseFloat(event.target.value)
    } else if (prop === 'estimado') {
      this.rows[index].Estimado = parseFloat(event.target.value)
    }
  }

  close() {
    this.modalService.dismissAll();
  }
}