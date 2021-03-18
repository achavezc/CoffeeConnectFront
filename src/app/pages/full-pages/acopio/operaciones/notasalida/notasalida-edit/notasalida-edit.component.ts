import { Component, OnInit, ViewEncapsulation, Input,Output,EventEmitter , ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { AcopioService } from '../../../../../../services/acopio.service';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ReqRegistrarPesado } from '../../../../../../services/models/req-registrar-pesado';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { EmpresaService } from '../../../../../../services/empresa.service';


export class table 
  {
    
  }
@Component({
  selector: 'app-notasalidad-edit',
  templateUrl: './notasalida-edit.component.html',
  styleUrls: ['./notasalida-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotaSalidaEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;

  
  selectClasificacion: any;
  consultaEmpresas: FormGroup;
  
  submitted = false;
  submittedEdit = false;
  closeResult: string;
  notaSalidaFormEdit: FormGroup;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  selected = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  detalleMateriaPrima: any;
  eventsSubject: Subject<void> = new Subject<void>();
  eventosSubject: Subject<void> = new Subject<void>();
  filtrosEmpresaProv: any= {};
  listaClasificacion = [];

  esEdit = false; //

  //@ViewChild(DatatableComponent) tableLotes: DatatableComponent;
  
  @ViewChild(DatatableComponent) tableClasificacion: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService, 
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService, private acopioService: AcopioService, private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private empresaService: EmpresaService
   
    ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }
 
  ngOnInit(): void {
    this.cargarForm();
    this.login = JSON.parse(localStorage.getItem("user"));
  }

  emitEventToChild() {
    this.eventsSubject.next();
    this.eventosSubject.next();
  }
 
  
  cargarForm() {
      this.notaSalidaFormEdit =this.fb.group(
        {
          numNotaSalida: ['', ],
          destinatario: ['', ],
          ruc:  ['', ],
          dirPartida:  ['', ],
          dirDestino:  ['', ]
        });
  }
 
openModal(modalLotes) {
    this.modalService.open(modalLotes, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarEmpresas();
    this.clear();
    
  }

  clear() {

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

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
   // this.tableLotes.offset = 0;
  }
  
  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }
  get f() {
    return this.consultaEmpresas.controls;
  }
  get fedit() {
    return this.notaSalidaFormEdit.controls;
  }
 /* public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const tipoDocumento = group.controls['tipoDocumento'];
      const numeroDocumento = group.controls['numeroDocumento'];
      const socio = group.controls['socio'];
      const rzsocial = group.controls['rzsocial'];
      if ( numeroDocumento.value == "" && numeroDocumento.value == "" && socio.value == "" && rzsocial.value == "") {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese por lo menos un campo' };

      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      if (numeroDocumento.value != "" && (tipoDocumento.value == "" || tipoDocumento.value == undefined) ) {

        this.errorGeneral = { isError: true, errorMessage: 'Seleccione un tipo documento' };

      } else if (numeroDocumento.value == "" && (tipoDocumento.value != "" && tipoDocumento.value != undefined)) {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese un numero documento' };

      }
      return;
    };
  }*/

  /*seleccionarProveedor(e) {
    this.consultaMateriaPrimaFormEdit.controls['provFinca'].disable();
    
    this.consultaMateriaPrimaFormEdit.get('provNombre').setValue(e[0].NombreRazonSocial);
    this.consultaMateriaPrimaFormEdit.get('provDocumento').setValue(e[0].TipoDocumento+ "-" + e[0].NumeroDocumento);
    this.consultaMateriaPrimaFormEdit.get('provTipoSocio').setValue(e[0].TipoProveedorId);
    this.consultaMateriaPrimaFormEdit.get('provCodigo').setValue(e[0].CodigoSocio);
    this.consultaMateriaPrimaFormEdit.get('provDepartamento').setValue(e[0].Departamento);
    this.consultaMateriaPrimaFormEdit.get('provProvincia').setValue(e[0].Provincia);
    this.consultaMateriaPrimaFormEdit.get('provDistrito').setValue(e[0].Distrito);
    this.consultaMateriaPrimaFormEdit.get('provZona').setValue(e[0].Zona);
    this.consultaMateriaPrimaFormEdit.get('provFinca').setValue(e[0].Finca);

    this.consultaMateriaPrimaFormEdit.controls['tipoProveedorId'].setValue(e[0].TipoProveedorId);
    this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(null);
    this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(null);
    this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(null);
    this.consultaMateriaPrimaFormEdit.controls['terceroFincaId'].setValue(null);

    if(e[0].TipoProveedorId == this.tipoSocio){
      this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(e[0].ProveedorId);
      this.consultaMateriaPrimaFormEdit.controls['socioFincaId'].setValue(e[0].FincaId);

    }else if(e[0].TipoProveedorId == this.tipoTercero){
      this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(e[0].ProveedorId);
      this.consultaMateriaPrimaFormEdit.controls['terceroFincaId'].setValue(e[0].FincaId);
    }else if(e[0].TipoProveedorId == this.tipoIntermediario){
      this.consultaMateriaPrimaFormEdit.controls['provFinca'].enable();
      this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(e[0].ProveedorId);
    }
    

    this.modalService.dismissAll();
  }*/
  
 buscar() {
    
    if (this.consultaEmpresas.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      this.filtrosEmpresaProv.RazonSocial = this.consultaEmpresas.controls['rzsocial'].value;
      this.filtrosEmpresaProv.Ruc = this.consultaEmpresas.controls['ruc'].value;
      this.filtrosEmpresaProv.ClasificacionId = this.consultaEmpresas.controls['clasificacion'].value;
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
 /* guardar(){
    
    if (this.consultaMateriaPrimaFormEdit.invalid) {
      this.submittedEdit = true;
      return;
    } else {
      var socioId= null;
      if(Number(this.consultaMateriaPrimaFormEdit.controls["socioId"].value) !=0){
        socioId = Number(this.consultaMateriaPrimaFormEdit.controls["socioId"].value);
      }
      var terceroId= null;
      if(Number(this.consultaMateriaPrimaFormEdit.controls["terceroId"].value) !=0){
        terceroId = Number(this.consultaMateriaPrimaFormEdit.controls["terceroId"].value);
      }
      var intermediarioId= null;
      if(Number(this.consultaMateriaPrimaFormEdit.controls["intermediarioId"].value) !=0){
        intermediarioId = Number(this.consultaMateriaPrimaFormEdit.controls["intermediarioId"].value);
      }

      var socioFincaId= null;
      if(Number(this.consultaMateriaPrimaFormEdit.controls["socioFincaId"].value) !=0){
        socioFincaId = Number(this.consultaMateriaPrimaFormEdit.controls["socioFincaId"].value);
      }
      var terceroFincaId= null;
      if(Number(this.consultaMateriaPrimaFormEdit.controls["terceroFincaId"].value) !=0){
        terceroFincaId = Number(this.consultaMateriaPrimaFormEdit.controls["terceroFincaId"].value);
      }
      var intermediarioFinca= null;
      if(Number(this.consultaMateriaPrimaFormEdit.controls["provFinca"].value) !=0){
        intermediarioFinca = this.consultaMateriaPrimaFormEdit.controls["provFinca"].value;
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
        "mruizb",
        this.consultaMateriaPrimaFormEdit.get('pesado').get("unidadMedida").value,
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("cantidad").value),
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("kilosBruto").value),
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("tara").value),
        this.consultaMateriaPrimaFormEdit.get('pesado').get("observacionPesado").value,
        socioFincaId,
        terceroFincaId,
        intermediarioFinca,
      );
       this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
        if(this.esEdit && this.id!=0){
          this.actualizarService(request);
        }else{
          this.guardarService(request);
        }
        
     
    }
  }
  
  guardarService(request:ReqRegistrarPesado){
    this.acopioService.registrarPesado(request)
    .subscribe(res => {
      this.spinner.hide();
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          var form = this;
          this.alertUtil.alertOkCallback('Registrado!', 'Guia Registrada.',function(result){
            if(result.isConfirmed){
              form.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
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

  actualizarService(request:ReqRegistrarPesado){
    this.acopioService.actualizarPesado(request)
    .subscribe(res => {
      this.spinner.hide();
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          var form = this;
          this.alertUtil.alertOkCallback('Actualizado!', 'Guia Actualizada.',function(result){
            if(result.isConfirmed){
              form.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
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


  cancelar(){
      this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
  }

  obtenerDetalle(){
    this.acopioService.obtenerDetalle(Number(this.id))
    .subscribe(res => {
      
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          this.detalleMateriaPrima = res.Result.Data;
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
        console.log(err);
        this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
      }
    );  
  }
  async cargarDataFormulario(data: any){
    this.consultaMateriaPrimaFormEdit.controls["producto"].setValue(data.ProductoId);
    await this.cargarSubProducto(data.ProductoId);
    this.consultaMateriaPrimaFormEdit.controls["subproducto"].setValue(data.SubProductoId);
    this.viewTagSeco = data.SubProductoId != "02"? false: true;
    this.estado = data.Estado
    this.consultaMateriaPrimaFormEdit.controls["guiaReferencia"].setValue(data.NumeroReferencia);
    this.numeroGuia = data.Numero;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro),"/");
    this.consultaMateriaPrimaFormEdit.controls["provNombre"].setValue(data.NombreRazonSocial);
    this.consultaMateriaPrimaFormEdit.controls["provDocumento"].setValue(data.TipoDocumento + "-"+ data.NumeroDocumento);
    this.cargarTipoProveedor();
    await this.cargarTipoProveedor();
    this.consultaMateriaPrimaFormEdit.controls["provTipoSocio"].setValue(data.TipoProvedorId);
    this.consultaMateriaPrimaFormEdit.controls["provCodigo"].setValue(data.CodigoSocio);
    this.consultaMateriaPrimaFormEdit.controls["provDepartamento"].setValue(data.Departamento);
    this.consultaMateriaPrimaFormEdit.controls["provProvincia"].setValue(data.Provincia);
    this.consultaMateriaPrimaFormEdit.controls["provDistrito"].setValue(data.Distrito);
    this.consultaMateriaPrimaFormEdit.controls["provZona"].setValue(data.Zona);
    this.consultaMateriaPrimaFormEdit.controls["provFinca"].setValue(data.Finca);
    
    this.consultaMateriaPrimaFormEdit.controls["fechaCosecha"].setValue(formatDate(data.FechaPesado, 'yyyy-MM-dd', 'en'));
    this.consultaMateriaPrimaFormEdit.get('pesado').get("unidadMedida").setValue(data.UnidadMedidaIdPesado);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("cantidad").setValue(data.CantidadPesado);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("kilosBruto").setValue(data.KilosBrutosPesado);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("tara").setValue(data.TaraPesado);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("observacionPesado").setValue(data.ObservacionPesado);
    this.fechaPesado = this.dateUtil.formatDate(new Date(data.FechaPesado),"/");
    this.responsable = data.UsuarioPesado;
    this.consultaMateriaPrimaFormEdit.controls['tipoProveedorId'].setValue(data.TipoProvedorId);
    this.consultaMateriaPrimaFormEdit.controls['socioFincaId'].setValue(data.SocioFincaId);
    this.consultaMateriaPrimaFormEdit.controls['terceroFincaId'].setValue(data.TerceroFincaId);

    this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(data.SocioId);
    this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(data.TerceroId);
    this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(data.IntermediarioId);

    this.consultaMateriaPrimaFormEdit.get('pesado').get("exportGramos").setValue(data.ExportableGramosAnalisisFisico);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("exportPorcentaje").setValue(data.ExportablePorcentajeAnalisisFisico + "%");
    this.consultaMateriaPrimaFormEdit.get('pesado').get("descarteGramos").setValue(data.DescarteGramosAnalisisFisico);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("descartePorcentaje").setValue(data.DescartePorcentajeAnalisisFisico + "%");
    this.consultaMateriaPrimaFormEdit.get('pesado').get("cascarillaGramos").setValue(data.CascarillaGramosAnalisisFisico);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("cascarillaPorcentaje").setValue(data.CascarillaPorcentajeAnalisisFisico + "%");
    this.consultaMateriaPrimaFormEdit.get('pesado').get("totalGramos").setValue(data.TotalGramosAnalisisFisico);
    this.consultaMateriaPrimaFormEdit.get('pesado').get("totalPorcentaje").setValue(data.TotalPorcentajeAnalisisFisico + "%");
    this.consultaMateriaPrimaFormEdit.get('pesado').get("ObservacionAnalisisFisico").setValue(data.ObservacionAnalisisFisico);

   
  }*/

}




