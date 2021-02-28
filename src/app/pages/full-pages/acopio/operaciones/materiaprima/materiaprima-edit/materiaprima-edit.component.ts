import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { AcopioService, FiltrosProveedor } from '../../../../../../services/acopio.service';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ReqRegistrarPesado } from '../../../../../../services/models/req-registrar-pesado';
import {Router} from "@angular/router"
import { ActivatedRoute } from '@angular/router';

export class table 
  {
    
  }
@Component({
  selector: 'app-materiaprima-list',
  templateUrl: './materiaprima-edit.component.html',
  styleUrls: ['./materiaprima-edit.component.scss',  "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class MateriaPrimaEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  esEdit = false;
  submitted = false;
  submittedEdit = false;
  closeResult: string;
  consultaMateriaPrimaFormEdit: FormGroup;
  consultaProveedor: FormGroup;
  listaProducto: any[];
  listaSubProducto: any[];
  listaTipoProveedor: any[];
  selectTipoProveedor: any;
  selectTipoSocio: any;
  selectedEstado: any;
  selectProducto: any;
  selectSubProducto: any;
  selectedTipoDocumento: any;
  listSub: any[];
  selected = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  listTipoSocio: any[];
  listaTipoDocumento: any[];
  tipoSocio = "01";
  tipoTercero = "02";
  tipoIntermediario = "03";
  id: "";
  visible = false;
  
  

  @ViewChild(DatatableComponent) tableProveedor: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService, private filtrosProveedor: FiltrosProveedor,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService, private acopioService: AcopioService, private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute
    ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }
  ngOnInit(): void {
    this.cargarForm();
    this.cargarcombos();
    this.login = JSON.parse(localStorage.getItem("user"));
    this.route.queryParams
    .subscribe(params => {
      this.id = params.id;
      if(this.id){
        this.esEdit = true;
        this.obtenerDetalle();
      }
    }
  );
  }

  cargarForm() {
      this.consultaMateriaPrimaFormEdit =this.fb.group(
        {
          tipoProveedorId: ['', ],
          socioId:  ['', ],
          terceroId:  ['', ],
          intermediarioId:  ['', ],
          numGuia:  ['', ],
          numReferencia:  ['', ],
          producto:  ['', Validators.required],
          subproducto:['', Validators.required],
          provNombre: ['', Validators.required],
          provDocumento: ['', Validators.required],
          provTipoSocio: new FormControl({value: '', disabled: true},[Validators.required]),
          provCodigo: ['', Validators.required],
          provDepartamento: ['', Validators.required],
          provProvincia: ['', Validators.required],
          provDistrito: ['', Validators.required],
          provZona: ['', Validators.required],
          fechaCosecha: ['', Validators.required],
          guiaReferencia:   new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
          fechaPesado:  ['', ],
          pesado: this.fb.group({
            unidadMedida: new FormControl('', [Validators.required]),
            cantidad: new FormControl('', [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
            kilosBruto: new FormControl('', [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
            tara: new FormControl('', []),
            observacionPesado: new FormControl('', [])
          })
        });
  }
  /*open(content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
}*/
  openModal(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarProveedor();
    this.clear();
    
  }

  clear() {
    this.consultaProveedor.controls['numeroDocumento'].reset;
    this.consultaProveedor.controls['socio'].reset;
    this.consultaProveedor.controls['rzsocial'].reset;
    this.selectTipoProveedor = [];
    this.selectedTipoDocumento = [];
    this.rows = [];
  }

  /*private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
          return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
          return 'by clicking on a backdrop';
      } else {
          return `with: ${reason}`;
      }
  }*/

  cargarcombos() {
    this.maestroService.obtenerMaestros("Producto")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaProducto = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

  }
  changeSubProducto(e) {
    let filterProducto = e.Codigo;

    this.maestroService.obtenerMaestros("SubProducto")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaSubProducto = res.Result.Data.filter(obj => obj.Val1 == filterProducto);
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
    this.tableProveedor.offset = 0;
  }
  
  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }
  cargarProveedor() {
    this.consultaProveedor = new FormGroup(
      {
        tipoproveedor: new FormControl('', [Validators.required]),
        tipoDocumento: new FormControl('', []),
        numeroDocumento: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        socio: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        rzsocial: new FormControl('', [])
      });
    this.consultaProveedor.setValidators(this.comparisonValidator())

    this.maestroService.obtenerMaestros("TipoDocumento")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaTipoDocumento = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
    this.maestroService.obtenerMaestros("TipoProveedor")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaTipoProveedor = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
  }
  get f() {
    return this.consultaProveedor.controls;
  }
  get fedit() {
    return this.consultaMateriaPrimaFormEdit.controls;
  }
  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const tipoproveedor = group.controls['tipoproveedor'];
      const tipoDocumento = group.controls['tipoDocumento'];
      const numeroDocumento = group.controls['numeroDocumento'];
      const socio = group.controls['socio'];
      const rzsocial = group.controls['rzsocial'];
      if ((tipoproveedor.value != "" && tipoproveedor.value != undefined) && numeroDocumento.value == "" && numeroDocumento.value == "" && socio.value == "" && rzsocial.value == "") {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese por lo menos un campo' };

      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      if (numeroDocumento.value != "" && (tipoDocumento.value == "" || tipoDocumento.value == undefined) && (tipoproveedor.value != "" || tipoproveedor.value != undefined)) {

        this.errorGeneral = { isError: true, errorMessage: 'Seleccione un tipo documento' };

      } else if (numeroDocumento.value == "" && (tipoDocumento.value != "" && tipoDocumento.value != undefined) && (tipoproveedor.value != "" || tipoproveedor.value != undefined)) {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese un numero documento' };

      }
      return;
    };
  }

  seleccionarProveedor(e) {
    this.listTipoSocio = this.listaTipoProveedor;
    this.consultaMateriaPrimaFormEdit.get('provNombre').setValue(e[0].NombreRazonSocial);
    this.consultaMateriaPrimaFormEdit.get('provDocumento').setValue(e[0].TipoDocumento+ "-" + e[0].NumeroDocumento);
    this.consultaMateriaPrimaFormEdit.get('provTipoSocio').setValue(e[0].TipoProveedorId);
    this.consultaMateriaPrimaFormEdit.get('provCodigo').setValue(e[0].CodigoSocio);
    this.consultaMateriaPrimaFormEdit.get('provDepartamento').setValue(e[0].Departamento);
    this.consultaMateriaPrimaFormEdit.get('provProvincia').setValue(e[0].Provincia);
    this.consultaMateriaPrimaFormEdit.get('provDistrito').setValue(e[0].Distrito);
    this.consultaMateriaPrimaFormEdit.get('provZona').setValue(e[0].Zona);

    this.consultaMateriaPrimaFormEdit.controls['tipoProveedorId'].setValue(e[0].TipoProveedorId);
    this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(null);
    this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(null);
    this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(null);
    if(e[0].TipoProveedorId == this.tipoSocio){
      this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(e[0].ProveedorId);
    }else if(e[0].TipoProveedorId == this.tipoTercero){
      this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(e[0].ProveedorId);
    }else if(e[0].TipoProveedorId == this.tipoIntermediario){
      this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(e[0].ProveedorId);
    }
    

    this.modalService.dismissAll();
  }
  
  buscar() {
    let columns =[];
    if (this.consultaProveedor.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      this.filtrosProveedor.TipoProveedorId = this.consultaProveedor.controls['tipoproveedor'].value;
      this.filtrosProveedor.NombreRazonSocial = this.consultaProveedor.controls['rzsocial'].value;
      if(this.consultaProveedor.controls['tipoDocumento'].value.length == 0){
        this.filtrosProveedor.TipoDocumentoId = "";
      }else{
        this.filtrosProveedor.TipoDocumentoId = this.consultaProveedor.controls['tipoDocumento'].value;
      }
      this.filtrosProveedor.NumeroDocumento = this.consultaProveedor.controls['numeroDocumento'].value;
      this.filtrosProveedor.CodigoSocio = this.consultaProveedor.controls['socio'].value;
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'large',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.acopioService.consultarProveedor(this.filtrosProveedor)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {

              //data
              /*let array = [];
              
              for(let key in res.Result.Data)
              {
              res.Result.Data[key].visible = false;

              }*/
              //
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
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
  guardar(){
    
    if (this.consultaMateriaPrimaFormEdit.invalid) {
      this.submittedEdit = true;
      return;
    } else {
      let request = new ReqRegistrarPesado(
        0,
        1,
        this.consultaMateriaPrimaFormEdit.controls["tipoProveedorId"].value,
        this.consultaMateriaPrimaFormEdit.controls["socioId"].value,
        this.consultaMateriaPrimaFormEdit.controls["terceroId"].value,
        this.consultaMateriaPrimaFormEdit.controls["intermediarioId"].value,
        this.consultaMateriaPrimaFormEdit.controls["producto"].value,
        this.consultaMateriaPrimaFormEdit.controls["subproducto"].value,
        this.consultaMateriaPrimaFormEdit.controls["guiaReferencia"].value,
        this.consultaMateriaPrimaFormEdit.controls["fechaCosecha"].value,
        "mruizb",
        this.consultaMateriaPrimaFormEdit.get('pesado').get("unidadMedida").value,
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("cantidad").value),
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("kilosBruto").value),
        Number(this.consultaMateriaPrimaFormEdit.get('pesado').get("tara").value),
        this.consultaMateriaPrimaFormEdit.get('pesado').get("observacionPesado").value
      );
       this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.acopioService.registrarPesado(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              this.alertUtil.alertOk('Registrado!', 'Guia Registrada.');
              this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list'])
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
  }

  cancelar(){
    this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list'])
  }
  changeSubTipoProducto(e) {
    let filterSubTipo = e.Codigo;
    if (filterSubTipo == "02")
    {
      //selectSubProducto ==
    }
    else
    {

    }
  }

  obtenerDetalle(){
    this.acopioService.obtenerDetalle(Number(this.id))
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
        console.log(err);
        this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
      }
    );  
  }

  cargarDataFormulario(data: any){

    this.consultaMateriaPrimaFormEdit.controls["producto"].setValue("01");
    
    this.consultaMateriaPrimaFormEdit.controls["subproducto"].setValue("01");
  }
}

