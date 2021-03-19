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
import { Subject } from 'rxjs';
import { EmpresaService } from '../../../../../../services/empresa.service';
import { ReqNotaSalida } from '../../../../../../services/models/req-salidaalmacen-actualizar';
import { NotaSalidaAlmacenService } from '../../../../../../services/nota-salida-almacen.service';
import { runInThisContext } from 'vm';


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
  selectedE = [];
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
  ReqNotaSalida
  id: Number = 0;
  esEdit = false; //
  numero = "";
  fechaRegistro: any;
  almacen: "";
  fechaPesado: any;
  responsable: "";

  @ViewChild(DatatableComponent) tableEmpresa: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService, 
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService, private acopioService: AcopioService, private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private empresaService: EmpresaService,
    private notaSalidaAlmacenService:NotaSalidaAlmacenService
   
    ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  singleSelectCheck(row: any) {
    return this.selectedE.indexOf(row) === -1;
  }
 
  ngOnInit(): void {
    this.cargarForm();
    this.login = JSON.parse(localStorage.getItem("user"));
    this.route.queryParams
    .subscribe(params => {
      if( Number(params.id)){
        this.id =Number(params.id);
        this.esEdit = true;
        this.obtenerDetalle();
        
      }
    }
  );
  }

  obtenerDetalle(){
    this.spinner.show();
    this.notaSalidaAlmacenService.obtenerDetalle(Number(this.id))
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
        this.spinner.hide();
        console.log(err);
        this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
      }
    );  
  }

  cargarDataFormulario(data: any){
   
    this.notaSalidaFormEdit.controls["destinatario"].setValue(data.Destinatario);
    this.notaSalidaFormEdit.controls["ruc"].setValue(data.RucEmpresa);
    this.notaSalidaFormEdit.controls["dirPartida"].setValue(data.DireccionPartida);
    this.notaSalidaFormEdit.controls["dirDestino"].setValue(data.DireccionDestino);
    this.notaSalidaFormEdit.get('tagcalidad').get("propietario").setValue(data.Transportista);
    this.notaSalidaFormEdit.get('tagcalidad').get("domiciliado").setValue(data.DireccionTransportista);
    this.notaSalidaFormEdit.get('tagcalidad').get("ruc").setValue(data.RucTransportista);
    this.notaSalidaFormEdit.get('tagcalidad').get("conductor").setValue(data.Conductor);
    this.notaSalidaFormEdit.get('tagcalidad').get("brevete").setValue(data.LicenciaConductor);
    this.notaSalidaFormEdit.get('tagcalidad').get("codvehicular").setValue(data.TaraPesado);
    this.notaSalidaFormEdit.get('tagcalidad').get("marca").setValue(data.MarcaCarreta);
    this.notaSalidaFormEdit.get('tagcalidad').get("placa").setValue(data.PlacaCarreta);
    this.notaSalidaFormEdit.get('tagcalidad').get("numconstanciamtc").setValue(data.NumeroConstanciaMTC);
    this.notaSalidaFormEdit.get('tagcalidad').get("motivotranslado").setValue(data.MotivoTrasladoId);
    //this.notaSalidaFormEdit.get('tagcalidad').get("numreferencia").setValue(data.Observacion);
    this.notaSalidaFormEdit.get('tagcalidad').get("ObservacionAnalisisFisico").setValue(data.Observacion);
   
    this.numero = data.Numero; 
    
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro),"/");
    this.almacen = data.Almacen;
  
    this.responsable = data.UsuarioRegistro;

    this.spinner.hide();

   
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
          dirDestino:  ['', ],
          tagcalidad:this.fb.group({
            propietario: new FormControl('', []),
            domiciliado: new FormControl('', []),
            ruc: new FormControl('', []),
            conductor: new FormControl('', []),
            brevete: new FormControl('', []),
            codvehicular: new FormControl('', []),
            marca: new FormControl('', []),
            placa: new FormControl('', []),
            numconstanciamtc: new FormControl('', []),
            motivotranslado: new FormControl('', []),
            numreferencia: new FormControl('', []),
            ObservacionAnalisisFisico: new FormControl('', [])
            
          }),
        });

        
  }
 
openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'lg' });
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


  cancelar(){
    this.router.navigate(['/acopio/operaciones/notasalida-list']);
}
  seleccionarEmpresa(e) {
       
    this.notaSalidaFormEdit.get('destinatario').setValue(e[0].RazonSocial);
    this.notaSalidaFormEdit.get('ruc').setValue(e[0].Ruc);
    this.notaSalidaFormEdit.get('dirPartida').setValue("");
    this.notaSalidaFormEdit.get('dirDestino').setValue(e[0].Direccion + " - " + e[0].Distrito + " - " + e[0].Provincia +" - "+ e[0].Departamento);

    this.modalService.dismissAll();
  }
  
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
 guardar(){
    
    /*if (this.notaSalidaFormEdit.invalid) {
      this.submittedEdit = true;
      return;
    } else {


      let request = new ReqRegistrarPesado(
        this.notaSalidaFormEdit.control[].value,
      );
      
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
        
     
    }*/
  }
  
  registrarNotaSalidaService(request:ReqNotaSalida)
  {
    this.notaSalidaAlmacenService.Registrar(request)
    .subscribe(res => {
      this.spinner.hide();
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          var form = this;
          this.alertUtil.alertOkCallback('Registrado!', 'Nota Salida',function(result){
            if(result.isConfirmed){
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
  actualizarNotaSalidaService(request:ReqNotaSalida){
    this.notaSalidaAlmacenService.Actualizar(request)
    .subscribe(res => {
      this.spinner.hide();
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          var form = this;
          this.alertUtil.alertOkCallback('Actualizado!', 'Nota Salida',function(result){
            if(result.isConfirmed){
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

 /* actualizarService(request:ReqRegistrarPesado){
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
 */

}




