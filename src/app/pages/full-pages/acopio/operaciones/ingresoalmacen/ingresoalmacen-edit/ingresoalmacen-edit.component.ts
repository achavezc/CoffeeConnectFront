import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { NotaIngresoAlmacenService } from '../../../../../../services/nota-ingreso-almacen.service';
import { ILogin } from '../../../../../../services/models/login';
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { MaestroService } from '../../../../../../services/maestro.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import {Router} from "@angular/router"
@Component({
    selector: 'app-ingresoalmacen-edit',
    templateUrl: './ingresoalmacen-edit.component.html',
    styleUrls: ['./ingresoalmacen-edit.component.scss',  "/assets/sass/libs/datatables.scss"],
    encapsulation: ViewEncapsulation.None
  })

  export class IngresoAlmacenEditComponent implements OnInit {
    esEdit = true;
    consultaMateriaPrimaFormEdit: FormGroup;
    submittedEdit = false;
    login: ILogin;
    listaAlmacen: any[];
    selectAlmacen: any;
    id: Number = 0;
    errorGeneral: any = { isError: false, errorMessage: '' };
    mensajeErrorGenerico = "Ocurrio un error interno.";
    numeroGuia: "";
    fechaRegistro: any;
    fechaPesado: any;
    responsable: "";
    numeroNota: "";
    listaSensorialDefectos: any[];
    tableSensorialDefectos: FormGroup;
    usuario: "";

    constructor(
      private fb: FormBuilder,
      private spinner: NgxSpinnerService,
      private maestroUtil: MaestroUtil,
      private notaIngresoAlmacenService: NotaIngresoAlmacenService,
      private route: ActivatedRoute,
      private dateUtil: DateUtil,
      private maestroService: MaestroService,
      private alertUtil: AlertUtil,
      private router: Router,
        ) {
         
      }

      ngOnInit(): void {
        this.cargarForm();
        this.cargarcombos();
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

      cargarcombos() {
        var form = this;
        this.maestroUtil.obtenerMaestros("Almacen", function (res) {
          if (res.Result.Success) {
            form.listaAlmacen = res.Result.Data;
          }
        });
        
      }
      async cargarDefectoSensorial(){
        var form = this;
        var res = await this.maestroService.obtenerMaestros("SensorialDefectos").toPromise();
        if (res.Result.Success) {
          form.listaSensorialDefectos = res.Result.Data;
          let group={}  
          form.listaSensorialDefectos.forEach(input_template=>{
            group['checkboxSenDefectos%'+input_template.Codigo]=new FormControl('',[]);  
          })
          form.tableSensorialDefectos = new FormGroup(group);
        }
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
              producto:  ['', ],
              subproducto:['', ],
              tipoProduccion:['', ],
              provNombre: ['', ],
              provDocumento: ['', ],
              provTipoSocio: new FormControl({value: '', disabled: true},[]),
              provCodigo: ['', ],
              provDepartamento: ['', ],
              provProvincia: ['', ],
              provDistrito: ['', ],
              provZona: ['',],
              provFinca: ['',],
              fechaCosecha: ['', ],
              guiaReferencia:   new FormControl('', []),
              fechaPesado:  ['', ],
           
              unidadMedida: new FormControl('', []),
              cantidad: new FormControl('', []),
              kilosBruto: new FormControl('', []),
              tara: new FormControl('', []),
              observacionPesado: new FormControl('', []),
              exportGramos: new FormControl('', []),
              exportPorcentaje: new FormControl('', []),
              descarteGramos: new FormControl('', []),
              descartePorcentaje: new FormControl('', []),
              cascarillaGramos: new FormControl('', []),
              cascarillaPorcentaje: new FormControl('', []),
              totalGramos: new FormControl('', []),
              totalPorcentaje: new FormControl('', []),
              humedad: new FormControl('', []),
              ObservacionAnalisisFisico: new FormControl('', []),
              ObservacionRegTostado: new FormControl('', []),
              ObservacionAnalisisSensorial: new FormControl('', []),


              estado:  ['', ],
              socioFincaId:  ['', ],
              terceroFincaId:  ['', ],

              provTipoSocioDesc: ['',],
              productoDesc: ['',],
              subproductoDesc: ['',],
              tipoProduccionDesc: ['',],
              unidadMedidaDesc:['',],
              puntajeFinal: ['',],
              almacen:['',Validators.required]
    
            });
      }

      get fedit() {
        return this.consultaMateriaPrimaFormEdit.controls;
      }

      obtenerDetalle(){
        this.spinner.show();
        this.notaIngresoAlmacenService.obtenerDetalle(Number(this.id))
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

      async cargarDataFormulario(data: any){
        await this.cargarDefectoSensorial();
        this.consultaMateriaPrimaFormEdit.controls["producto"].setValue(data.ProductoId);
        this.consultaMateriaPrimaFormEdit.controls["productoDesc"].setValue(data.Producto);
        this.consultaMateriaPrimaFormEdit.controls["subproducto"].setValue(data.SubProductoId);
        this.consultaMateriaPrimaFormEdit.controls["subproductoDesc"].setValue(data.SubProducto);
      
        this.consultaMateriaPrimaFormEdit.controls["guiaReferencia"].setValue(data.NumeroReferencia);
        this.numeroGuia = data.NumeroGuiaRecepcionMateriaPrima;
        this.numeroNota = data.Numero;
        this.usuario = data.UsuarioRegistro;
        this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro),"/");
        this.consultaMateriaPrimaFormEdit.controls["provNombre"].setValue(data.NombreRazonSocial);
        this.consultaMateriaPrimaFormEdit.controls["provDocumento"].setValue(data.TipoDocumento + "-"+ data.NumeroDocumento);
    
        
        this.consultaMateriaPrimaFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccionId);
        this.consultaMateriaPrimaFormEdit.controls["tipoProduccionDesc"].setValue(data.TipoProduccion);
        this.consultaMateriaPrimaFormEdit.controls["provTipoSocio"].setValue(data.TipoProvedorId);
        this.consultaMateriaPrimaFormEdit.controls["provTipoSocioDesc"].setValue(data.TipoProveedor);

        this.consultaMateriaPrimaFormEdit.controls["provCodigo"].setValue(data.CodigoSocio);
        this.consultaMateriaPrimaFormEdit.controls["provDepartamento"].setValue(data.Departamento);
        this.consultaMateriaPrimaFormEdit.controls["provProvincia"].setValue(data.Provincia);
        this.consultaMateriaPrimaFormEdit.controls["provDistrito"].setValue(data.Distrito);
        this.consultaMateriaPrimaFormEdit.controls["provZona"].setValue(data.Zona);
        this.consultaMateriaPrimaFormEdit.controls["provFinca"].setValue(data.Finca);
        this.consultaMateriaPrimaFormEdit.controls["fechaCosecha"].setValue(formatDate(data.FechaCosecha, 'yyyy-MM-dd', 'en'));
        this.consultaMateriaPrimaFormEdit.controls["unidadMedida"].setValue(data.UnidadMedidaIdPesado);
        this.consultaMateriaPrimaFormEdit.controls["unidadMedidaDesc"].setValue(data.UnidadMedida);
        this.consultaMateriaPrimaFormEdit.controls["cantidad"].setValue(data.CantidadPesado);
        this.consultaMateriaPrimaFormEdit.controls["kilosBruto"].setValue(data.KilosBrutosPesado);
        this.consultaMateriaPrimaFormEdit.controls["tara"].setValue(data.TaraPesado);
        this.fechaPesado = this.dateUtil.formatDate(new Date(data.FechaCosecha),"/");
        this.responsable = data.UsuarioPesado;
        this.consultaMateriaPrimaFormEdit.controls['tipoProveedorId'].setValue(data.TipoProvedorId);
        this.consultaMateriaPrimaFormEdit.controls['socioFincaId'].setValue(data.SocioFincaId);
        this.consultaMateriaPrimaFormEdit.controls['terceroFincaId'].setValue(data.TerceroFincaId);
    
        this.consultaMateriaPrimaFormEdit.controls['socioId'].setValue(data.SocioId);
        this.consultaMateriaPrimaFormEdit.controls['terceroId'].setValue(data.TerceroId);
        this.consultaMateriaPrimaFormEdit.controls['intermediarioId'].setValue(data.IntermediarioId);
    
        this.consultaMateriaPrimaFormEdit.controls["exportGramos"].setValue(data.ExportableGramosAnalisisFisico);
        if(data.ExportablePorcentajeAnalisisFisico != null){
          this.consultaMateriaPrimaFormEdit.controls["exportPorcentaje"].setValue(data.ExportablePorcentajeAnalisisFisico + "%");
        }
        this.consultaMateriaPrimaFormEdit.controls["descarteGramos"].setValue(data.DescarteGramosAnalisisFisico);
        if(data.DescartePorcentajeAnalisisFisico != null){
          this.consultaMateriaPrimaFormEdit.controls["descartePorcentaje"].setValue(data.DescartePorcentajeAnalisisFisico + "%");
        }
        this.consultaMateriaPrimaFormEdit.controls["cascarillaGramos"].setValue(data.CascarillaGramosAnalisisFisico);
        if(data.CascarillaPorcentajeAnalisisFisico != null){
          this.consultaMateriaPrimaFormEdit.controls["cascarillaPorcentaje"].setValue(data.CascarillaPorcentajeAnalisisFisico + "%");
        }
        this.consultaMateriaPrimaFormEdit.controls["totalGramos"].setValue(data.TotalGramosAnalisisFisico);
        if(data.TotalPorcentajeAnalisisFisico != null){
          this.consultaMateriaPrimaFormEdit.controls["totalPorcentaje"].setValue(data.TotalPorcentajeAnalisisFisico + "%");
        }
        this.consultaMateriaPrimaFormEdit.controls["humedad"].setValue(data.HumedadPorcentajeAnalisisFisico);
        this.consultaMateriaPrimaFormEdit.controls["puntajeFinal"].setValue(data.TotalAnalisisSensorial);
        this.consultaMateriaPrimaFormEdit.controls["almacen"].setValue(data.AlmacenId);
        
      /*
        if (this.detalleMateriaPrima.AnalisisSensorialDefectoDetalle!= null)
          {
          let analisisSensorialDefectoDetalleList: AnalisisSensorialDefectoDetalleList[] = this.detalleMateriaPrima.AnalisisSensorialDefectoDetalle;
          analisisSensorialDefectoDetalleList.forEach(function (value) {
            form.tableSensorialDefectos.controls["checkboxSenDefectos%"+ value.DefectoDetalleId].setValue(value.Valor);  
          });
          }
          */
         this.tableSensorialDefectos.controls["checkboxSenDefectos%"+ "01"].setValue(1);  

        this.spinner.hide();
    
       
      }


      guardar(){
        if (this.consultaMateriaPrimaFormEdit.invalid) {
          this.submittedEdit = true;
          return;
        } else {
          this.spinner.show(undefined,
            {
              type: 'ball-triangle-path',
              size: 'medium',
              bdColor: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              fullScreen: true
            });
         
            this.actualizarService();
        
        }
      }
      actualizarService(){
        
        this.notaIngresoAlmacenService.actualizar(Number(this.id),this.usuario,this.consultaMateriaPrimaFormEdit.controls["almacen"].value)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              var form = this;
              this.alertUtil.alertOkCallback('Actualizado!', 'Ingreso Almacén Actualizado.',function(result){
                //if(result.isConfirmed){
                  form.router.navigate(['/operaciones/ingresoalmacen-list']);
                //}
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
        this.router.navigate(['/operaciones/ingresoalmacen-list']);
      }
  }