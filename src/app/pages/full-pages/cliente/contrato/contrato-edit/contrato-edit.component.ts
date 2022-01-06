import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../../services/models/login';
import { ContratoService } from '../../../../../services/contrato.service';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { ContratoEditTraduccion } from '../../../../../services/translate/contrato/contrato-edit-translate';
import { TranslateService, TranslationChangeEvent, LangChangeEvent } from '@ngx-translate/core';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { EmpresaProveedoraService } from '../../../../../services/empresaproveedora.service';
import { MaestroService } from '../../../../../services/maestro.service';

@Component({
  selector: 'app-contrato-edit',
  templateUrl: './contrato-edit.component.html',
  styleUrls: ['./contrato-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContratoEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  contratoFormEdit: FormGroup;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";

  id: Number = 0;
  AduanaId: Number = 0;
  status: string = "";
  estado = "";
  numeroGuia: "";
  fechaRegistro: any;
  fechaPesado: any;
  responsable: "";
  login: ILogin;
  submittedEdit = false;
  ContratoEditTraduccion: ContratoEditTraduccion;
  dropdownListExp = [];
  dropdownListProd = [];
  selectedItemsExp = [];
  selectedItemsProd = [];
  dropdownSettings = {};
  rowsDetails = [];
  listEstadoEnvio = [];
  selectEstadoEnvio = [];
  tempData = [];
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;

  constructor(private modalService: NgbModal,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private contratoService: ContratoService,
    private translate: TranslateService,
    private dateUtil: DateUtil,
    private empresaProveedoraService: EmpresaProveedoraService,
    private maestroService: MaestroService) {

  }
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  ngOnInit(): void {
    this.ContratoEditTraduccion = new ContratoEditTraduccion();
    this.cargarForm();
    this.login = JSON.parse(localStorage.getItem("user"));
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.obtenerDetalle('');
        }
      }
      );

    this.translate.onLangChange.subscribe((event: TranslationChangeEvent) => {
      localStorage.setItem("language", event.lang);
      this.obtenerDetalle(event.lang);
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

  cargarForm() {
    this.contratoFormEdit = this.fb.group(
      {
        numeroContrato: new FormControl('', []),
        ruc: new FormControl('', []),
        agenciaAduanera: new FormControl('', []),
        clienteFinal: new FormControl('', []),
        floId: new FormControl('', []),
        exportador: new FormControl('', []),
        certificacionesExportador: new FormControl({value: '', disabled: true}, []),
        productor: new FormControl('', []),
        certificacionesProductor: new FormControl({value: '', disabled: true}, []),
        numeroContratoInterno: new FormControl('', []),
        mesEmbarque: new FormControl('', []),
        producto: new FormControl('', []),
        subproducto: new FormControl('', []),
        calidad: new FormControl('', []),
        empaque: new FormControl('', []),
        certificacion: new FormControl('', []),
        cantidadDefectos: new FormControl('', []),
        cantidad: new FormControl('', []),
        nroContenedores: new FormControl('', []),
        statusPago: new FormControl('', []),
        pesoxSaco: new FormControl('', []),
        fechaPagoFactura: new FormControl('', []),
        totalKilosNetos: new FormControl('', []),
        fechaEnvio: new FormControl('', []),
        fechaRecepcion: new FormControl('', []),
        estadoEnvio:  new FormControl({value: '', disabled: true},[]),
        courier: new FormControl('', []),
        trackingNumber: new FormControl('', []),
        observacion: new FormControl('', []),
        fechaEnvioDocumentos: new FormControl('', []),
        fechaLlegadaDocumentos: new FormControl('', []),
      });
      this.maestroService.obtenerMaestros("EstadoMuestra")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listEstadoEnvio = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
  }


  openModal(mdlListDocuments) {
    var x = this.AduanaId;
    this.modalService.open(mdlListDocuments, { size: 'xl', centered: true });
  }

  cancelar() {
    this.router.navigate(['/cliente/contrato/list']);
  }

  obtenerDetalle(lang: string) {
    var lenguaje = localStorage.getItem("language");
    lang = lang == '' ? (lenguaje == null ? this.translate.getDefaultLang() : lenguaje) : lang;
    this.spinner.show();
    this.contratoService.ConsultarTrackingContratoPorContratoId({ "ContratoId": this.id, "Idioma": lang })
      .subscribe(res => {
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
  cargarDataFormulario(data: any) {
    this.responsable = data.UsuarioRegistro;
    this.AduanaId = data.AduanaId;
    this.contratoFormEdit.controls["numeroContrato"].setValue(data.NumeroContrato);
    this.contratoFormEdit.controls["ruc"].setValue(data.RucEmpresaAgenciaAduanera);
    this.contratoFormEdit.controls["agenciaAduanera"].setValue(data.RazonSocialEmpresaAgenciaAduanera);
    this.contratoFormEdit.controls["clienteFinal"].setValue(data.RazonSocialCliente);
    this.contratoFormEdit.controls["floId"].setValue(data.FloId);
    this.contratoFormEdit.controls["exportador"].setValue(data.RazonSocialEmpresaExportadora);
    this.contratoFormEdit.controls["productor"].setValue(data.RazonSocialEmpresaProductora);
    this.contratoFormEdit.controls["numeroContratoInterno"].setValue(data.NumeroContratoInternoProductor);
    this.contratoFormEdit.controls['mesEmbarque'].setValue(formatDate(data.FechaEmbarque, 'MM-yyyy', 'en'));
    this.contratoFormEdit.controls["producto"].setValue(data.Producto);
    this.contratoFormEdit.controls["subproducto"].setValue(data.SubProducto);
    this.contratoFormEdit.controls["calidad"].setValue(data.Calidad);
    this.contratoFormEdit.controls["empaque"].setValue( data.Empaque + " - " + data.TipoEmpaque);
    this.contratoFormEdit.controls["certificacion"].setValue(data.TipoCertificacion);
    this.contratoFormEdit.controls["cantidadDefectos"].setValue(data.PreparacionCantidadDefectos);
    this.contratoFormEdit.controls["nroContenedores"].setValue(data.CantidadContenedores);
    this.contratoFormEdit.controls["pesoxSaco"].setValue(data.PesoPorSaco);
    this.contratoFormEdit.controls["totalKilosNetos"].setValue(data.PesoKilos);
    if (data.FechaPagoFactura)
      this.contratoFormEdit.get('fechaPagoFactura').setValue(data.FechaPagoFactura == null ? null : formatDate(data.FechaPagoFactura, 'dd/MM/yyyy', 'en'));
    this.contratoFormEdit.controls["cantidad"].setValue(data.TotalSacos);
    this.contratoFormEdit.controls["statusPago"].setValue(data.EstadoPagoFactura);
    if (data.FechaEnvioMuestra)
      this.contratoFormEdit.get('fechaEnvio').setValue(data.FechaEnvioMuestra == null ? null : formatDate(data.FechaEnvioMuestra, 'yyyy-MM-dd', 'en'));
    if (data.FechaRecepcionMuestra)
      this.contratoFormEdit.controls["fechaRecepcion"].setValue(data.FechaRecepcionMuestra == null ? null : formatDate(data.FechaRecepcionMuestra, 'yyyy-MM-dd', 'en'));
    this.contratoFormEdit.get('estadoEnvio').setValue(data.EstadoMuestraId);
    this.contratoFormEdit.get('courier').setValue(data.Courier);
    this.contratoFormEdit.get('trackingNumber').setValue(data.NumeroSeguimientoMuestra);
    this.contratoFormEdit.get('observacion').setValue(data.Observacion);
    if (data.FechaEnvioDocumentos)
    this.contratoFormEdit.get('fechaEnvioDocumentos').setValue(data.FechaEnvioDocumentos == null ? null : formatDate(data.FechaEnvioDocumentos, 'yyyy-MM-dd', 'en'));
   
  if (data.FechaLlegadaDocumentos)
    this.contratoFormEdit.get('fechaLlegadaDocumentos').setValue(data.FechaLlegadaDocumentos == null ? null : formatDate(data.FechaLlegadaDocumentos, 'yyyy-MM-dd', 'en'));
    this.rowsDetails = [...data.Cargamentos];
    

    data.Cargamentos.forEach((obj: any) => {
      obj.FechaZarpeNave = this.dateUtil.formatDate(obj.FechaZarpeNave);
      obj.FechaFacturacion =  this.dateUtil.formatDate(obj.FechaFacturacion);
      obj.FechaEstampado  =  this.dateUtil.formatDate(obj.FechaEstampado);
      obj.FechaSalidaPlanta =  this.dateUtil.formatDate(obj.FechaSalidaPlanta);
    });
    this.tempData = data.Cargamentos;
    this.rowsDetails = [...this.tempData];


  this.consultarCertificaciones(data.EmpresaProductoraId, 'Productor');
  this.consultarCertificaciones(data.EmpresaExportadoraId, 'Exportador');
  let selectarrayProd = [];
  let selectarrayExp = [];
  data.Certificaciones.forEach(x => {

    let object = { item_id: x.TipoCertificacionId + "-" + x.EmpresaProveedoraAcreedoraId, item_text: x.Certificacion + "-" + x.CodigoCertificacion }
    if (x.TipoId == '02') {
      selectarrayExp.push(object);
    }
    else if (x.TipoId == '01') {
      selectarrayProd.push(object);
    }
  });
  this.selectedItemsProd = selectarrayProd;
  this.selectedItemsExp = selectarrayExp;
   /* this.contratoFormEdit.controls["fechaContrato"].setValue(this.dateUtil.formatDate(new Date(data.FechaContrato)));
    this.contratoFormEdit.controls["cliente"].setValue(data.RazonSocialCliente);
    this.contratoFormEdit.controls["courier"].setValue(data.Courier);
    this.contratoFormEdit.controls["numeroTracking"].setValue(data.NumeroSeguimientoMuestra);
    this.contratoFormEdit.controls["estado"].setValue(data.EstadoMuestra);

    if (data.FechaEmbarque)
    {
      this.contratoFormEdit.controls["fechaEmbarque"].setValue(this.dateUtil.formatDate(new Date(data.FechaEmbarque)));
    }

    if (data.FechaEnvioDocumentos)
    {
      this.contratoFormEdit.controls["fechaEnvioDocumentos"].setValue(this.dateUtil.formatDate(new Date(data.FechaEnvioDocumentos)));
    }

    if (data.FechaLlegadaDocumentos)
    {
      this.contratoFormEdit.controls["fechaLlegadaDocumentos"].setValue(this.dateUtil.formatDate(new Date(data.FechaLlegadaDocumentos)));
    }

    
    this.contratoFormEdit.controls["exportador"].setValue(data.RazonSocialEmpresaExportadora);
    this.contratoFormEdit.controls["estadoPlanta"].setValue(data.EstadoSeguimiento);
    this.contratoFormEdit.controls["productor"].setValue(data.RazonSocialEmpresaProductora);
    this.contratoFormEdit.controls["producto"].setValue(data.Producto);
    this.contratoFormEdit.controls["calidad"].setValue(data.Calidad);
    this.contratoFormEdit.controls["cantidad"].setValue(data.TotalSacos);
    this.contratoFormEdit.controls["empaqueTipo"].setValue(data.Empaque + ' - ' + data.TipoEmpaque);
    this.contratoFormEdit.controls["grado"].setValue(data.Grado);
    this.contratoFormEdit.controls["pesoSaco"].setValue(data.PesoPorSaco);
    this.contratoFormEdit.controls["pesoNeto"].setValue(data.PesoKilos);*/
    this.spinner.hide();
  }

  consultarCertificaciones(id: number, tipo: string) {
    let request = { EmpresaProveedoraAcreedoraId: id }

    this.empresaProveedoraService.ConsultarCertificaciones(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            let arrayCertificaciones = [];
            res.Result.Data.Certificaciones.forEach(x => {
              let object = { item_id: x.TipoCertificacionId + "-" + x.EmpresaProveedoraAcreedoraId, item_text: x.Certificacion + "-" + x.CodigoCertificacion }
              arrayCertificaciones.push(object);

            });
            if (tipo == 'Exportador') {
              this.dropdownListExp = arrayCertificaciones;
            }
            else if (tipo == 'Productor') {
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
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }
}







