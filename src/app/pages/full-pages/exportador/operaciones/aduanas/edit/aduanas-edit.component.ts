import { Component, OnInit, ViewChild , ViewEncapsulation} from '@angular/core';
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
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-aduanas-edit',
  templateUrl: './aduanas-edit.component.html',
  styleUrls: ['./aduanas-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
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
  esEdit = false;
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
  dropdownListExp = [];
  dropdownListProd =[];
  selectedItemsExp = [];
  selectedItemsProd = [];
  dropdownSettings = {};
  popUp = true;
  isLoading = false;
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;


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
        courier: new FormControl('', []),
        certificacionesProductor: new FormControl('', [Validators.required]),
        certificacionesExportador: new FormControl('', [Validators.required]),
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
    if (this.selectProductor.length == 0 || this.selectExportador[0].EmpresaProveedoraAcreedoraId  != this.selectProductor[0].EmpresaProveedoraAcreedoraId)
    {
    this.aduanasFormEdit.get('exportador').setValue(this.selectExportador[0].RazonSocial);
    this.consultarCertificaciones(this.selectExportador[0].EmpresaProveedoraAcreedoraId, 'Exportador');
    }
    else
    {
      this.alertUtil.alertWarning("Oops...!", "La Empresa Exportadora debe ser diferente a la Empresa Productora");
    }
    this.modalService.dismissAll();
  }

  receiveMessageProductor($event) {
    this.selectProductor = $event
    if (this.selectProductor.length == 0 || this.selectExportador[0].EmpresaProveedoraAcreedoraId  != this.selectProductor[0].EmpresaProveedoraAcreedoraId)
    {
    this.aduanasFormEdit.get('productor').setValue(this.selectProductor[0].RazonSocial);
    this.consultarCertificaciones(this.selectProductor[0].EmpresaProveedoraAcreedoraId, 'Productor');
    }
    else
    {
      this.alertUtil.alertWarning("Oops...!", "La Empresa Productora debe ser diferente a la Empresa Exportadora");
    }
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

  consultarCertificaciones ( id : number , tipo : string)
  {
    let request = { EmpresaProveedoraAcreedoraId : id}
    
    this.empresaProveedoraService.ConsultarCertificaciones(request)
    .subscribe(res => {
      this.spinner.hide();
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          let arrayCertificaciones = [];
          res.Result.Data.Certificaciones.forEach(x => {
            let object = {  item_id: x.TipoCertificacionId +"-"+x.EmpresaProveedoraAcreedoraId , item_text: x.Certificacion + "-"+  x.CodigoCertificacion}
            arrayCertificaciones.push(object);
            
          });
          if (tipo == 'Exportador')
              {
                this.dropdownListExp = arrayCertificaciones;
              }
               else if (tipo == 'Productor')
              {
                this.dropdownListProd = arrayCertificaciones;
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
  obtenerDetalle()
  {
    this.spinner.show();
    let request = {AduanaId:Number(this.id) }
    this.aduanaService.ConsultarPorId(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
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
    this.selectEmpresa[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaAgenciaAduaneraId};
    this.selectExportador[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaExportadoraId};
    this.selectProductor[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaProductoraId};
    this.selectContrato[0] = { ContratoId: data.ContratoId}
    this.id = data.AduanaId;
    this.numero = data.Numero;
    this.estado = data.Estado;
    this.responsable = data.UsuarioRegistro;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.aduanasFormEdit.get('contrato').setValue(data.NumeroContrato);
    this.aduanasFormEdit.get('ruc').setValue(data.RucEmpresaAgenciaAduanera);
    this.aduanasFormEdit.get('agencia').setValue(data.RazonSocialEmpresaAgenciaAduanera);
    this.aduanasFormEdit.get('clientefinal').setValue(data.NumeroCliente);
    this.aduanasFormEdit.get('floid').setValue(data.FloId);
    this.aduanasFormEdit.get('exportador').setValue(data.RazonSocialEmpresaExportadora);
    this.aduanasFormEdit.get('productor').setValue(data.RazonSocialEmpresaProductora);
    this.consultarCertificaciones(data.EmpresaExportadoraId, 'Exportador');
    this.consultarCertificaciones(data.EmpresaProductoraId, 'Productor');
    this.aduanasFormEdit.get('fechaEmbarque').setValue( formatDate(data.FechaEmbarque, 'yyyy-MM-dd', 'en'));   
    this.aduanasFormEdit.get('fechaFac').setValue(formatDate(data.FechaFacturacion, 'yyyy-MM-dd', 'en'));
    this.aduanasFormEdit.get('marca').setValue(data.Marca);
    this.aduanasFormEdit.get('po').setValue(data.PO);
    this.aduanasFormEdit.get('producto').setValue(data.Producto);
    this.aduanasFormEdit.get('subproducto').setValue(data.SubProducto);
    this.aduanasFormEdit.get('calidad').setValue(data.Calidad);
    this.aduanasFormEdit.get('empaque').setValue(data.TipoEmpaque + "-"+ data.Empaque);
    this.aduanasFormEdit.get('cantidad').setValue(data.TotalSacos);
    this.aduanasFormEdit.get('pesoxsaco').setValue(data.PesoPorSaco); 
    this.aduanasFormEdit.get('totalkilosnetos').setValue(data.PesoKilos);
    this.aduanasFormEdit.get('laboratorio').setValue(data.LaboratorioId);
    this.aduanasFormEdit.get('fechaRecojo').setValue( formatDate(data.FechaEnvioMuestra, 'yyyy-MM-dd', 'en'));
    this.aduanasFormEdit.get('trackingNumber').setValue(data.NumeroSeguimientoMuestra);
    this.aduanasFormEdit.get('fechaRecepcion').setValue(formatDate(data.FechaRecepcionMuestra, 'yyyy-MM-dd', 'en'));
    this.aduanasFormEdit.get('estado').setValue(data.EstadoMuestraId);
    this.aduanasFormEdit.get('naviera').setValue(data.NavieraId);
    this.aduanasFormEdit.get('observacion').setValue(data.Observacion);
    this.aduanasFormEdit.get('courier').setValue(data.Courier);
    
    //let arrayNotaIngreso = [];
    //data.Detalle.forEach(x => {
     // let object = {  NumeroNotaIngreso: x.NroNotaIngresoPlanta, Cantidad: x.CantidadSacos, KilosNetos: x.KilosNetos, Lote: x.NumeroLote}
     //arrayNotaIngreso = [...arrayNotaIngreso, { NumeroNotaIngreso: x.NroNotaIngresoPlanta, Cantidad:  x.CantidadSacos, KilosNetos: x.KilosNetos, Lote: x.NumeroLote }];
     
    // });
    this.rows = data.Detalle;
    let selectarrayProd = [];
    let selectarrayExp = [];
    data.Certificaciones.forEach(x => {

            let object = {  item_id: x.TipoCertificacionId +"-"+x.EmpresaProveedoraAcreedoraId , item_text: x.Certificacion + "-"+  x.CodigoCertificacion}
            if (data.EmpresaExportadoraId == x.EmpresaProveedoraAcreedoraId)
              {
                selectarrayExp.push(object);
              }
            else  if (data.EmpresaProductoraId == x.EmpresaProveedoraAcreedoraId)
              {
                selectarrayProd.push(object);
              }            
    });
    this.selectedItemsProd = selectarrayProd;
    this.selectedItemsExp = selectarrayExp;


    
    
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
          detalle.NroNotaIngresoPlanta = x.NroNotaIngresoPlanta;
          detalle.CantidadSacos = x.CantidadSacos;
          detalle.KilosNetos = x.KilosNetos;
          detalle.NumeroLote = x.NumeroLote
          listDetalle.push(detalle);
        });
      
      this.selectedItemsExp.forEach( x =>
        {
          let certificacion : Certificaciones = new Certificaciones();
          certificacion.TipoCertificacionId = x.item_id.split("-")[0];
          certificacion.CodigoCertificacion = x.item_text.split("-")[1];
          certificacion.EmpresaProveedoraAcreedoraId = Number(x.item_id.split("-")[1]);
          listCertificaciones.push(certificacion);
        });
        this.selectedItemsProd.forEach( x =>
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
        this.aduanasFormEdit.get('courier').value,
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
            this.alertUtil.alertOkCallback('Actualizado!', 'Informacion Aduanas', function (result) {
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

    this.rows = [...this.rows, { NroNotaIngresoPlanta: '', CantidadSacos: 0, KilosNetos: 0, NumeroLote: '' }];
  }
  EliminarFila(index: any): void {
    this.rows.splice(index, 1);
    this.rows = [...this.rows];
  }
  UpdateValue(event: any, index: any, prop: any): void {
    if (prop === 'numeroNotaIngreso') {
      this.rows[index].NroNotaIngresoPlanta = event.target.value
    } else if (prop === 'cantidad') {
      this.rows[index].CantidadSacos = parseFloat(event.target.value)
    }else if (prop === 'kilosnetos') {
      this.rows[index].KilosNetos = parseFloat(event.target.value)
    }else if (prop === 'lote') {
      this.rows[index].NumeroLote = event.target.value
    }
  }
  openModalDocumentos(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }
  close() {
    this.modalService.dismissAll();
  }
}