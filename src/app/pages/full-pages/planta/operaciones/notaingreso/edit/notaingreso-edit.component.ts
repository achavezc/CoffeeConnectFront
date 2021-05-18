
import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ReqRegistrarPesadoNotaIngreso } from '../../../../../../services/models/req-registrar-notaingreso';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { SocioFincaService } from './../../../../../../services/socio-finca.service';
import {PesadoCafePlantaComponent} from './pesadocafe/pesadocafeplanta.component';



@Component({
  selector: 'app-notaingreso-edit',
  templateUrl: './notaingreso-edit.component.html',
  styleUrls: ['./notaingreso-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class NotaIngresoEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  esEdit = false;
  submitted = false;
  submittedEdit = false;
  closeResult: string;
  notaIngredoFormEdit: FormGroup;
  listaProducto: any[];
  listaSubProducto: any[];
  listaTipoProveedor: any[];
  listaTipoProduccion: any[];
  listaCertificacion: any[];
  listaCertificadora: any[];
  selectedCertificacion: any;
  selectedCertificadora: any;

  selectTipoSocio: any;
  selectTipoProveedor: any;
  selectTipoProduccion: any;
  selectedEstado: any;
  selectProducto: any;
  selectSubProducto: any;
  selectedTipoDocumento: any;
  selectOrganizacion = [];
  listSub: any[];
  selected = [];
  popupModel;
  login: ILogin;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  listTipoSocio: any[];
  listaTipoDocumento: any[];
  tipoSocio = "01";
  tipoTercero = "02";
  tipoIntermediario = "03";
  tipoProduccionConvencional = "02";
  id: Number = 0;
  status: string = "";
  estado = "";
  numeroNotaIngreso: "";
  fechaRegistro: any;
  fechaPesado: any;
  responsable: "";
  disabledControl: string = '';
  disabledNota: string = '';
  viewTagSeco: boolean = false;
  detalle: any;
  unidadMedidaPesado: any;
  form: string = "materiaprima"
  btnGuardar = true;
  @ViewChild(PesadoCafePlantaComponent) child;

  @ViewChild(DatatableComponent) tableProveedor: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService, private notaIngresoService: NotaIngresoService, private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
   private socioFinca : SocioFincaService
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
        this.status = params.status;
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
          /* this.obtenerDetalle();
          if (this.status == "01") {
            this.disabledNota = 'disabled';
          } */
        }
        else {
          /* this.disabledNota = 'disabled';
          this.disabledControl = 'disabled'; */
        }
      }
      );
  }

  cargarForm() {
    let x = this.selectSubProducto;
    this.notaIngredoFormEdit = this.fb.group(
      {
       
        guiaremision: ['',],
        fecharemision: ['',],
        tipoProduccion: ['',],
        codigoOrganizacion: ['',],
        nombreOrganizacion: ['',],
        producto: ['',],
        direccion: ['',],
        ruc: ['',],
        subproducto: ['',],
        certificacion: ['',],
        certificadora: ['',],
        pesado: this.fb.group({
          empaque: new FormControl('', []),
          tipo: new FormControl('', []),
          cantidad: new FormControl('', []),
          pesoSaco: new FormControl('', []),
          calidad: new FormControl('', []),
          tara: new FormControl('', []),
          kilosNetos: new FormControl('', []),
          cantidadDefectos: new FormControl('', []),
          porcentajeRendimiento: new FormControl('', []),
          porcentajeHumedad: new FormControl('', []),
          transportista: new FormControl('', []),
          ruc: new FormControl('', []),
          placaVehiculo: new FormControl('', []),
          chofer: new FormControl('', []),
          numeroBrevete: new FormControl('', []),
          observacion: new FormControl('', [])
        })
      });
  }

  openModal(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'xl' });
  }

  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("ProductoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaProducto = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoProduccionPlanta", function (res) {
      if (res.Result.Success) {
        form.listaTipoProduccion = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("TipoCertificacionPlanta", function (res) {
      if (res.Result.Success) {
        form.listaCertificacion = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("EntidadCertificadoraPlanta", function (res) {
      if (res.Result.Success) {
        form.listaCertificadora = res.Result.Data;
      }
    });

  }

  changeSubProducto(e) {
    let filterProducto = e.Codigo;
    this.cargarSubProducto(filterProducto);
  }

  changeView(e) {
    let filterSubTipo = e.Codigo;
    if (filterSubTipo == "02") {
      this.viewTagSeco = true;
    }
    else {
      this.viewTagSeco = false;
    }
  }

  async cargarSubProducto(codigo: any) {

    var data = await this.maestroService.obtenerMaestros("SubProductoPlanta").toPromise();
    if (data.Result.Success) {
      this.listaSubProducto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }

  }
 
  async cargarTipoProveedor() {

    var data = await this.maestroService.obtenerMaestros("TipoProveedor").toPromise();
    if (data.Result.Success) {
      this.listaTipoProveedor = data.Result.Data;
      this.listTipoSocio = this.listaTipoProveedor;
    }
  }
  async cargarTipoProduccion() {

    var data = await this.maestroService.obtenerMaestros("TipoProduccion").toPromise();
    if (data.Result.Success) {
      this.listaTipoProduccion = data.Result.Data;
    }
  }


  get fedit() {
    return this.notaIngredoFormEdit.controls;
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

  ExportPDF(id: number): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaCompra/GenerarPDF?id=${id === undefined ? 1 : id}`;
    link.download = "NotaCompra.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }
  guardar() {

    if (this.notaIngredoFormEdit.invalid) {
      this.submittedEdit = true;
      return;
    } else {
      
      let request = new ReqRegistrarPesadoNotaIngreso(
       0,
       1,
       this.notaIngredoFormEdit.controls["guiaremision"].value,
       this.notaIngredoFormEdit.controls["guiaremision"].value,
       this.notaIngredoFormEdit.controls["fecharemision"].value,
       1,
       this.notaIngredoFormEdit.controls["tipoProduccion"].value,
       this.notaIngredoFormEdit.controls["producto"].value,
       this.notaIngredoFormEdit.controls["subproducto"].value,
       this.notaIngredoFormEdit.controls["certificacion"].value,
       this.notaIngredoFormEdit.controls["certificadora"].value,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null,
       null
      );
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      if (this.esEdit && this.id != 0) {
        this.actualizarService(request);
      } else {
        this.guardarService(request);
      }


    }
  }

  guardarService(request: any) {
    this.notaIngresoService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Nota Ingreso Registrado.', function (result) {
              form.router.navigate(['/planta/operaciones/notaingreso-list']);
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

  actualizarService(request: any) {
    this.notaIngresoService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Nota Ingreso Actualizado.', function (result) {
              form.router.navigate(['/planta/operaciones/notaingreso-list']);
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
    this.router.navigate(['/planta/operaciones/notaingreso-list']);
  }

  obtenerDetalle() {
    this.spinner.show();
    this.notaIngresoService.ConsultarPorId(Number(this.id))
      .subscribe(res => {

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
    //this.child.obtenerDetalle();
  }
  async cargarDataFormulario(data: any) {
    await this.cargarTipoProduccion();
    this.notaIngredoFormEdit.controls["producto"].setValue(data.ProductoId);
    await this.cargarSubProducto(data.ProductoId);
    this.notaIngredoFormEdit.controls["subproducto"].setValue(data.SubProductoId);
    this.viewTagSeco = data.SubProductoId != "02" ? false : true;
    this.estado = data.Estado
    this.notaIngredoFormEdit.controls["guiaReferencia"].setValue(data.NumeroReferencia);
    this.numeroNotaIngreso = data.Numero;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.notaIngredoFormEdit.controls["provNombre"].setValue(data.NombreRazonSocial);
    this.notaIngredoFormEdit.controls["provDocumento"].setValue(data.TipoDocumento + "-" + data.NumeroDocumento);


    this.notaIngredoFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccionId);
    this.cargarTipoProveedor();
    await this.cargarTipoProveedor();
    this.notaIngredoFormEdit.controls["provTipoSocio"].setValue(data.TipoProvedorId);
    this.notaIngredoFormEdit.controls["provCodigo"].setValue(data.CodigoSocio);
    this.notaIngredoFormEdit.controls["provDepartamento"].setValue(data.Departamento);
    this.notaIngredoFormEdit.controls["provProvincia"].setValue(data.Provincia);
    this.notaIngredoFormEdit.controls["provDistrito"].setValue(data.Distrito);
    this.notaIngredoFormEdit.controls["provCertificacion"].setValue(data.SocioFincaCertificacion);
    this.notaIngredoFormEdit.controls["provZona"].setValue(data.Zona);
    this.notaIngredoFormEdit.controls["provFinca"].setValue(data.Finca);
    //this.notaIngredoFormEdit.controls["fechaCosecha"].setValue(this.dateUtil.formatDate(new Date(data.FechaPesado),"/"));
    this.notaIngredoFormEdit.controls["fechaCosecha"].setValue(formatDate(data.FechaPesado, 'yyyy-MM-dd', 'en'));
    this.notaIngredoFormEdit.get('pesado').get("unidadMedida").setValue(data.UnidadMedidaIdPesado);
    this.notaIngredoFormEdit.get('pesado').get("cantidad").setValue(data.CantidadPesado);
    this.notaIngredoFormEdit.get('pesado').get("kilosBruto").setValue(data.KilosBrutosPesado);
    this.notaIngredoFormEdit.get('pesado').get("tara").setValue(data.TaraPesado);
    this.notaIngredoFormEdit.get('pesado').get("observacionPesado").setValue(data.ObservacionPesado);
    this.fechaPesado = this.dateUtil.formatDate(new Date(data.FechaPesado), "/");
    this.responsable = data.UsuarioPesado;
    this.notaIngredoFormEdit.controls['tipoProveedorId'].setValue(data.TipoProvedorId);
    this.notaIngredoFormEdit.controls['socioFincaId'].setValue(data.SocioFincaId);
    this.notaIngredoFormEdit.controls['terceroFincaId'].setValue(data.TerceroFincaId);

    this.notaIngredoFormEdit.controls['socioId'].setValue(data.SocioId);
    this.notaIngredoFormEdit.controls['terceroId'].setValue(data.TerceroId);
    this.notaIngredoFormEdit.controls['intermediarioId'].setValue(data.IntermediarioId);

    this.notaIngredoFormEdit.get('pesado').get("exportGramos").setValue(data.ExportableGramosAnalisisFisico);
    if (data.ExportablePorcentajeAnalisisFisico != null) {
      this.notaIngredoFormEdit.get('pesado').get("exportPorcentaje").setValue(data.ExportablePorcentajeAnalisisFisico + "%");
    }
    this.notaIngredoFormEdit.get('pesado').get("descarteGramos").setValue(data.DescarteGramosAnalisisFisico);
    if (data.DescartePorcentajeAnalisisFisico != null) {
      this.notaIngredoFormEdit.get('pesado').get("descartePorcentaje").setValue(data.DescartePorcentajeAnalisisFisico + "%");
    }
    this.notaIngredoFormEdit.get('pesado').get("cascarillaGramos").setValue(data.CascarillaGramosAnalisisFisico);
    if (data.CascarillaPorcentajeAnalisisFisico != null) {
      this.notaIngredoFormEdit.get('pesado').get("cascarillaPorcentaje").setValue(data.CascarillaPorcentajeAnalisisFisico + "%");
    }
    this.notaIngredoFormEdit.get('pesado').get("totalGramos").setValue(data.TotalGramosAnalisisFisico);
    if (data.TotalPorcentajeAnalisisFisico != null) {
      this.notaIngredoFormEdit.get('pesado').get("totalPorcentaje").setValue(data.TotalPorcentajeAnalisisFisico + "%");
    }
    this.notaIngredoFormEdit.get('pesado').get("ObservacionAnalisisFisico").setValue(data.ObservacionAnalisisFisico);

    this.unidadMedidaPesado = data.UnidadMedidaIdPesado;
    this.spinner.hide();


  }
  
  async consultarSocioFinca() {
    let request =
    {
      "SocioFincaId": Number(this.notaIngredoFormEdit.controls["socioFincaId"].value)
    }

   if ( this.notaIngredoFormEdit.controls["producto"].value == "01" &&
   this.notaIngredoFormEdit.controls["subproducto"].value == "02" && this.notaIngredoFormEdit.controls["provCertificacion"].value != "")
   {
   this.socioFinca.SearchSocioFinca(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            if ( res.Result.Data != null )
            {
              if (res.Result.Data.SaldoPendiente == 0)
              {
                this.notaIngredoFormEdit.controls["tipoProduccion"].setValue("02"); 
                this.notaIngredoFormEdit.controls["tipoProduccion"].disable();
              }
              else if (res.Result.Data.SaldoPendiente < this.notaIngredoFormEdit.get('pesado').get("kilosBruto").value)
              {
                this.alertUtil.alertWarning('Oops!', 'Solo puede ingresar ' + res.Result.Data.SaldoPendiente + ' Kilos Brutos');
                this.btnGuardar = false;
              }
              else{
                this.btnGuardar = true;
              }
            }
            else if (res.Result.Data == null )
            {
              this.alertUtil.alertWarning('Oops!', 'La finca no tiene registrado los estimados para el año actual');
              this.btnGuardar = false;
            }
            
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } },
          err => {
            this.spinner.hide();
            console.log(err);
            this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  GetDataEmpresa(event: any): void {
    this.selectOrganizacion = event;
    if (this.selectOrganizacion[0]) {
      this.notaIngredoFormEdit.controls['codigoOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.notaIngredoFormEdit.controls['direccion'].setValue(`${this.selectOrganizacion[0].Direccion} - ${this.selectOrganizacion[0].Distrito} - ${this.selectOrganizacion[0].Provincia} - ${this.selectOrganizacion[0].Departamento}`);
      this.notaIngredoFormEdit.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.notaIngredoFormEdit.controls['ruc'].setValue(this.selectOrganizacion[0].Ruc);
    }
    this.modalService.dismissAll();
  }

}





