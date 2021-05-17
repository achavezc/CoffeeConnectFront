import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { Router } from "@angular/router"

import { AnalisisSensorialDefectoDetalleList } from '../../../../../../services/models/req-controlcalidad-actualizar'

@Component({
  selector: 'app-notaingresoalmacen-edit',
  templateUrl: './notaingresoalmacen-edit.component.html',
  styleUrls: ['./notaingresoalmacen-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})

export class NotaIngresoAlmacenEditComponent implements OnInit {
  esEdit = true;
  consultaNotaIngresoAlmacenFormEdit: FormGroup;
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
        if (Number(params.id)) {
          this.id = Number(params.id);
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
  async cargarDefectoSensorial() {
    var form = this;
    var res = await this.maestroService.obtenerMaestros("SensorialDefectos").toPromise();
    if (res.Result.Success) {
      form.listaSensorialDefectos = res.Result.Data;
      let group = {}
      form.listaSensorialDefectos.forEach(input_template => {
        group['checkboxSenDefectos%' + input_template.Codigo] = new FormControl('', []);
      })
      form.tableSensorialDefectos = new FormGroup(group);
    }
  }

  cargarForm() {
    this.consultaNotaIngresoAlmacenFormEdit = this.fb.group(
      {
        guiaremision: new FormControl('', []),
        fecharemision: new FormControl('', []),
        tipoProduccion: new FormControl('', []),
        codigoOrganizacion: new FormControl('', []),
        nombreOrganizacion: new FormControl('', []),
        producto: new FormControl('', []),
        direccion: new FormControl('', []),
        ruc: new FormControl('', []),
        subproducto: new FormControl('', []),
        departamento: new FormControl('', []),
        provincia: new FormControl('', []),
        distrito: new FormControl('', []),
        certificacion: new FormControl('', []),
        certificadora: new FormControl('', []),
        unidadMedidaDesc: new FormControl('', []),
        cantidad: new FormControl('', []),
        pesoBruto: new FormControl('', []),
        calidad: new FormControl('', []),
        tara: new FormControl('', []),
        grado: new FormControl('', []),
        kilosNetos: new FormControl('', []),
        cantidadDefectos: new FormControl('', []),
        rendimiento: new FormControl('', []),
        humedad: new FormControl('', [])

      });
  }

  get fedit() {
    return this.consultaNotaIngresoAlmacenFormEdit.controls;
  }

  obtenerDetalle() {
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
          this.spinner.hide();
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }

  async cargarDataFormulario(data: any) {
    await this.cargarDefectoSensorial();
    this.consultaNotaIngresoAlmacenFormEdit.controls["producto"].setValue(data.ProductoId);
    this.consultaNotaIngresoAlmacenFormEdit.controls["productoDesc"].setValue(data.Producto);
    this.consultaNotaIngresoAlmacenFormEdit.controls["subproducto"].setValue(data.SubProductoId);
    this.consultaNotaIngresoAlmacenFormEdit.controls["subproductoDesc"].setValue(data.SubProducto);

    this.consultaNotaIngresoAlmacenFormEdit.controls["guiaReferencia"].setValue(data.NumeroReferencia);
    this.numeroGuia = data.NumeroGuiaRecepcionMateriaPrima;
    this.numeroNota = data.Numero;
    this.usuario = data.UsuarioRegistro;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.consultaNotaIngresoAlmacenFormEdit.controls["provNombre"].setValue(data.NombreRazonSocial);
    this.consultaNotaIngresoAlmacenFormEdit.controls["provDocumento"].setValue(data.TipoDocumento + "-" + data.NumeroDocumento);


    this.consultaNotaIngresoAlmacenFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccionId);
    this.consultaNotaIngresoAlmacenFormEdit.controls["tipoProduccionDesc"].setValue(data.TipoProduccion);
    this.consultaNotaIngresoAlmacenFormEdit.controls["provTipoSocio"].setValue(data.TipoProvedorId);
    this.consultaNotaIngresoAlmacenFormEdit.controls["provTipoSocioDesc"].setValue(data.TipoProveedor);

    this.consultaNotaIngresoAlmacenFormEdit.controls["provCodigo"].setValue(data.CodigoSocio);
    this.consultaNotaIngresoAlmacenFormEdit.controls["provDepartamento"].setValue(data.Departamento);
    this.consultaNotaIngresoAlmacenFormEdit.controls["provProvincia"].setValue(data.Provincia);
    this.consultaNotaIngresoAlmacenFormEdit.controls["provDistrito"].setValue(data.Distrito);
    this.consultaNotaIngresoAlmacenFormEdit.controls["provZona"].setValue(data.Zona);
    this.consultaNotaIngresoAlmacenFormEdit.controls["provFinca"].setValue(data.Finca);
    this.consultaNotaIngresoAlmacenFormEdit.controls["fechaCosecha"].setValue(formatDate(data.FechaCosecha, 'yyyy-MM-dd', 'en'));
    this.consultaNotaIngresoAlmacenFormEdit.controls["unidadMedida"].setValue(data.UnidadMedidaIdPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls["unidadMedidaDesc"].setValue(data.UnidadMedida);
    this.consultaNotaIngresoAlmacenFormEdit.controls["cantidad"].setValue(data.CantidadPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls["kilosBruto"].setValue(data.KilosBrutosPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls["tara"].setValue(data.TaraPesado);
    this.fechaPesado = this.dateUtil.formatDate(new Date(data.FechaCosecha), "/");
    this.responsable = data.UsuarioPesado;
    this.consultaNotaIngresoAlmacenFormEdit.controls['tipoProveedorId'].setValue(data.TipoProvedorId);
    this.consultaNotaIngresoAlmacenFormEdit.controls['socioFincaId'].setValue(data.SocioFincaId);
    this.consultaNotaIngresoAlmacenFormEdit.controls['terceroFincaId'].setValue(data.TerceroFincaId);

    this.consultaNotaIngresoAlmacenFormEdit.controls['socioId'].setValue(data.SocioId);
    this.consultaNotaIngresoAlmacenFormEdit.controls['terceroId'].setValue(data.TerceroId);
    this.consultaNotaIngresoAlmacenFormEdit.controls['intermediarioId'].setValue(data.IntermediarioId);

    this.consultaNotaIngresoAlmacenFormEdit.controls["exportGramos"].setValue(data.ExportableGramosAnalisisFisico);
    if (data.ExportablePorcentajeAnalisisFisico != null) {
      this.consultaNotaIngresoAlmacenFormEdit.controls["exportPorcentaje"].setValue(data.ExportablePorcentajeAnalisisFisico + "%");
    }
    this.consultaNotaIngresoAlmacenFormEdit.controls["descarteGramos"].setValue(data.DescarteGramosAnalisisFisico);
    if (data.DescartePorcentajeAnalisisFisico != null) {
      this.consultaNotaIngresoAlmacenFormEdit.controls["descartePorcentaje"].setValue(data.DescartePorcentajeAnalisisFisico + "%");
    }
    this.consultaNotaIngresoAlmacenFormEdit.controls["cascarillaGramos"].setValue(data.CascarillaGramosAnalisisFisico);
    if (data.CascarillaPorcentajeAnalisisFisico != null) {
      this.consultaNotaIngresoAlmacenFormEdit.controls["cascarillaPorcentaje"].setValue(data.CascarillaPorcentajeAnalisisFisico + "%");
    }
    this.consultaNotaIngresoAlmacenFormEdit.controls["totalGramos"].setValue(data.TotalGramosAnalisisFisico);
    if (data.TotalPorcentajeAnalisisFisico != null) {
      this.consultaNotaIngresoAlmacenFormEdit.controls["totalPorcentaje"].setValue(data.TotalPorcentajeAnalisisFisico + "%");
    }
    this.consultaNotaIngresoAlmacenFormEdit.controls["humedad"].setValue(data.HumedadPorcentajeAnalisisFisico);
    this.consultaNotaIngresoAlmacenFormEdit.controls["puntajeFinal"].setValue(data.TotalAnalisisSensorial);
    this.consultaNotaIngresoAlmacenFormEdit.controls["almacen"].setValue(data.AlmacenId);


    var form = this;
    if (data.AnalisisSensorialDefectoDetalle != null) {
      let analisisSensorialDefectoDetalleList: AnalisisSensorialDefectoDetalleList[] = data.AnalisisSensorialDefectoDetalle;
      analisisSensorialDefectoDetalleList.forEach(function (value) {
        form.tableSensorialDefectos.controls["checkboxSenDefectos%" + value.DefectoDetalleId].setValue(value.Valor);
      });
    }

    this.spinner.hide();


  }


  guardar() {
    if (this.consultaNotaIngresoAlmacenFormEdit.invalid) {
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
  actualizarService() {

    this.notaIngresoAlmacenService.actualizar(Number(this.id), this.usuario, this.consultaNotaIngresoAlmacenFormEdit.controls["almacen"].value)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Ingreso Almacén Actualizado.', function (result) {
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
  cancelar() {
    this.router.navigate(['/operaciones/ingresoalmacen-list']);
  }
}