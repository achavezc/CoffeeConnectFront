import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { NotaIngresoAlmacenPlantaService } from '../../../../../../services/nota-ingreso-almacen-planta-service';
import { ILogin } from '../../../../../../services/models/login';
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { MaestroService } from '../../../../../../services/maestro.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { Router } from "@angular/router";
import swal from 'sweetalert2';

@Component({
  selector: 'app-notaingresoalmacen-edit',
  templateUrl: './notaingresoalmacen-edit.component.html',
  styleUrls: ['./notaingresoalmacen-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})

export class NotaIngresoAlmacenEditComponent implements OnInit {
  consultaNotaIngresoAlmacenFormEdit: FormGroup;
  submittedEdit = false;
  login: ILogin;
  listaAlmacen: any[];
  selectAlmacen: any;
  id: Number = 0;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  fechaRegistro: any;
  responsable: "";
  numeroNota: "";
  viewCafeP: Boolean = false;
  codigoCafeP= "01";
  usuario="";

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private maestroUtil: MaestroUtil,
    private notaIngresoAlmacenPlantaService: NotaIngresoAlmacenPlantaService,
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
          this.obtenerDetalle();

        }
      }
      );
  }

  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("AlmacenPlanta", function (res) {
      if (res.Result.Success) {
        form.listaAlmacen = res.Result.Data;
      }
    });

  }
 

  cargarForm() {
    this.consultaNotaIngresoAlmacenFormEdit = this.fb.group(
      {
        almacen: new FormControl('', [ Validators.required]),
        guiaremision: new FormControl({ value: '', disabled: true }, []),
        fecharemision: new FormControl({ value: '', disabled: true }, []),
        tipoProduccion: new FormControl({ value: '', disabled: true }, []),
        codigoOrganizacion: new FormControl({ value: '', disabled: true }, []),
        nombreOrganizacion: new FormControl({ value: '', disabled: true }, []),
        producto: new FormControl({ value: '', disabled: true }, []),
        direccion: new FormControl({ value: '', disabled: true }, []),
        rucOrganizacion: new FormControl({ value: '', disabled: true }, []),
        razonSocialOrganizacion:  new FormControl({ value: '', disabled: true }, []),
        subproducto: new FormControl({ value: '', disabled: true }, []),
        certificacion: new FormControl({ value: '', disabled: true }, []),
        certificadora: new FormControl({ value: '', disabled: true }, []),
        unidadMedidaDesc: new FormControl({ value: '', disabled: true }, []),
        cantidad: new FormControl({ value: '', disabled: true }, []),
        pesoBruto: new FormControl({ value: '', disabled: true }, []),
        calidad: new FormControl({ value: '', disabled: true }, []),
        tara: new FormControl({ value: '', disabled: true }, []),
        grado: new FormControl({ value: '', disabled: true }, []),
        kilosNetos: new FormControl({ value: '', disabled: true }, []),
        cantidadDefectos: new FormControl({ value: '', disabled: true }, []),
        rendimiento: new FormControl({ value: '', disabled: true }, []),
        humedad: new FormControl({ value: '', disabled: true }, []),
        exportGramos: new FormControl({ value: '', disabled: true }, []),
        exportPorcentaje: new FormControl({ value: '', disabled: true }, []),
        descarteGramos: new FormControl({ value: '', disabled: true }, []),
        descartePorcentaje: new FormControl({ value: '', disabled: true }, []),
        cascarillaGramos: new FormControl({ value: '', disabled: true }, []),
        cascarillaPorcentaje: new FormControl({ value: '', disabled: true }, []),
        totalGramos: new FormControl({ value: '', disabled: true }, []),
        totalPorcentaje: new FormControl({ value: '', disabled: true }, []),
        humedadAnalsisFisico: new FormControl({ value: '', disabled: true }, []),
        puntajeFinal: new FormControl({ value: '', disabled: true }, []),
        pesoxSaco: new FormControl({ value: '', disabled: true }, [])

      });
  }

  get fedit() {
    return this.consultaNotaIngresoAlmacenFormEdit.controls;
  }

  obtenerDetalle() {
    this.spinner.show();
    this.notaIngresoAlmacenPlantaService.obtenerDetalle(Number(this.id))
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
    
    this.numeroNota = data.NumeroNotaIngresoAlmacen;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.responsable = data.UsuarioRegistro;
    this.usuario = data.UsuarioRegistro;
    this.consultaNotaIngresoAlmacenFormEdit.controls["almacen"].setValue(data.AlmacenId);
    this.consultaNotaIngresoAlmacenFormEdit.controls["guiaremision"].setValue(data.NumeroGuiaRemision);
    this.consultaNotaIngresoAlmacenFormEdit.controls["fecharemision"].setValue(formatDate(data.FechaGuiaRemision, 'yyyy-MM-dd', 'en'));
    this.consultaNotaIngresoAlmacenFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccion);
    this.consultaNotaIngresoAlmacenFormEdit.controls["rucOrganizacion"].setValue(data.RucOrganizacion);
    this.consultaNotaIngresoAlmacenFormEdit.controls["razonSocialOrganizacion"].setValue(data.RazonSocialOrganizacion);
    this.consultaNotaIngresoAlmacenFormEdit.controls["producto"].setValue(data.Producto);
    this.consultaNotaIngresoAlmacenFormEdit.controls["direccion"].setValue(data.Direccion);
    this.consultaNotaIngresoAlmacenFormEdit.controls["subproducto"].setValue(data.SubProducto);
    this.consultaNotaIngresoAlmacenFormEdit.controls["certificacion"].setValue(data.Certificacion);
    this.consultaNotaIngresoAlmacenFormEdit.controls["certificadora"].setValue(data.Certificadora);
    this.consultaNotaIngresoAlmacenFormEdit.controls["unidadMedidaDesc"].setValue(data.UnidadMedida);
    this.consultaNotaIngresoAlmacenFormEdit.controls["cantidad"].setValue(data.CantidadPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls["pesoBruto"].setValue(data.KilosBrutosPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls["calidad"].setValue(data.Calidad);
    this.consultaNotaIngresoAlmacenFormEdit.controls["tara"].setValue(data.TaraPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['grado'].setValue(data.Grado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['kilosNetos'].setValue(data.KilosNetosPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['cantidadDefectos'].setValue(data.CantidadDefectos);
    this.consultaNotaIngresoAlmacenFormEdit.controls['rendimiento'].setValue(data.RendimientoPorcentajePesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['humedad'].setValue(data.HumedadPorcentajePesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['pesoxSaco'].setValue(data.PesoPorSaco);
    this.login.Result.Data.DireccionEmpresa = data.RazonSocialOrganizacion;
    this.login.Result.Data.RucEmpresa = data.RucOrganizacion;
    
    if (data.ProductoId == this.codigoCafeP)
    {
      this.viewCafeP = true;
      this.consultaNotaIngresoAlmacenFormEdit.controls['exportGramos'].setValue(data.ExportableGramosAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['exportPorcentaje'].setValue(data.ExportablePorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['descarteGramos'].setValue(data.DescarteGramosAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['descartePorcentaje'].setValue(data.DescartePorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['cascarillaGramos'].setValue(data.CascarillaGramosAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['cascarillaPorcentaje'].setValue(data.CascarillaPorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['totalGramos'].setValue(data.TotalGramosAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['totalPorcentaje'].setValue(data.TotalPorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['humedadAnalsisFisico'].setValue(data.HumedadPorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['puntajeFinal'].setValue(data.TotalAnalisisSensorial);
    }
    this.spinner.hide();
  }


  guardar() {
    const form = this;
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

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.' , function (result) {
          if (result.isConfirmed) {
            form.actualizarService();
          }
        });     
    }
  }
  actualizarService() {

    this.notaIngresoAlmacenPlantaService.actualizar(Number(this.id), this.usuario, this.consultaNotaIngresoAlmacenFormEdit.controls["almacen"].value)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Ingreso Almacén Actualizado.', function (result) {
              //if(result.isConfirmed){
              form.router.navigate(['/planta/operaciones/notaingresoalmacen-list']);
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
    this.router.navigate(['/planta/operaciones/notaingresoalmacen-list']);
  }
}