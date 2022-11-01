import { Component, OnInit, ViewEncapsulation, ViewChild} from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators  } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';
import { LiquidacionProcesoPlantaService } from '../../../../../../services/liquidacionproceso-planta.service';
import { DateUtil } from '../../../../../../services/util/date-util';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { host } from '../../../../../../shared/hosts/main.host';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-liquidacionproceso',
  templateUrl: './liquidacionproceso-list.component.html',
  styleUrls: ['./liquidacionproceso-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LiquidacionProcesoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router,
    private liquidacionProcesoPlantaService: LiquidacionProcesoPlantaService,
    private excelService: ExcelService,
    private spinner: NgxSpinnerService,
    private dateUtil: DateUtil,
    private maestroUtil: MaestroUtil,
    private authService : AuthService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  liquidacionProcesoForm: FormGroup;
  @ViewChild(DatatableComponent) tblOrdenProceso: DatatableComponent;
  listTipoProceso = [];
  listEstados = [];
  selectedTipoProceso: any;
  selectedEstado: any;
  limitRef = 10;
  rows = [];
  selected = [];
  tempData = [];
  vSessionUser: any;
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  readonly: boolean;

  ngOnInit(): void {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.liquidacionProcesoForm.controls.fechaFinal.setValue(this.dateUtil.currentDate());
    this.liquidacionProcesoForm.controls.fechaInicial.setValue(this.dateUtil.currentMonthAgo());
    this.LoadCombos();
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.liquidacionProcesoForm = this.fb.group({
        nroLiquidacion: new FormControl('', []),        
        ruc: new FormControl('', []),
        fechaInicial: new FormControl('', []),
        fechaFinal: new FormControl('', []),
        organizacion: new FormControl('', []),
        estado: new FormControl('', []),
        tipoProceso: new FormControl('', [])
    });
  }

  get f() {
    return this.liquidacionProcesoForm.controls;
  }

  LoadCombos(): void {
    this.maestroUtil.obtenerMaestros('EstadoLiquidacionProcesoPlanta', (res: any) => {
      if (res.Result.Success) {
        this.listEstados = res.Result.Data;
      }
    }); 

    this.maestroUtil.obtenerMaestros('TipoProcesoPlanta', (res: any) => {
      if (res.Result.Success) {
        this.listTipoProceso = res.Result.Data;
      }
    }); 
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  updateLimit(event: any): void {
    this.limitRef = event.target.value;
  }

  filterUpdate(event: any): void {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.tblOrdenProceso.offset = 0;
  }

  getRequest(): any {
    const form = this.liquidacionProcesoForm.value;
    return {
      Numero: form.nroLiquidacion ? form.nroLiquidacion : '',
      RucOrganizacion: form.ruc ? form.ruc : '',    
      RazonSocialOrganizacion: form.organizacion ? form.organizacion:'',
      FechaInicio: this.liquidacionProcesoForm.value.fechaInicial,
      FechaFin: this.liquidacionProcesoForm.value.fechaFinal ,
      TipoProcesoId: form.tipoProceso ? form.tipoProceso : '',
      EstadoId: form.estado ? form.estado : '',
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId
    };
  }

  Buscar(xls?: any): void {
    if (!this.liquidacionProcesoForm.invalid && !this.errorGeneral.isError)
     {
      this.spinner.show();
      const request = this.getRequest();
      let json = JSON.stringify(request);
      this.liquidacionProcesoPlantaService.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorGeneral = { isError: false, msgError: '' };
          if (!xls) {
            res.Result.Data.forEach((obj: any) => {
              obj.FechaRegistroString = this.dateUtil.formatDate(obj.FechaRegistro);
              obj.FechaOrdenProcesoString = this.dateUtil.formatDate(obj.FechaOrdenProceso);
            });
            this.rows = res.Result.Data;
            this.tempData = this.rows;
          } else {
            const vArrHeaderExcel = [
              new HeaderExcel("N° ORDEN", "center"),              
              new HeaderExcel("CÓDIGO", "center"),
              new HeaderExcel("CLIENTE"),
              new HeaderExcel("RUC", "center"),
              new HeaderExcel("EMPRESA PROCESADORA"),
              new HeaderExcel("TIPO PROCESO"),
              new HeaderExcel("FECHA ORDEN PROCESO", "center", 'yyyy-MM-dd'),
              new HeaderExcel("FECHA REGISTRO", "center", 'yyyy-MM-dd'),
              new HeaderExcel("Estado", "center")
            ];

            let vArrData: any[] = [];
            this.tempData.forEach((x: any) => vArrData.push([x.Numero, 
            x.NumeroCliente, x.Cliente, x.Ruc, x.RazonSocialEmpresaProcesadora,
            x.TipoProceso,x.FechaOrdenProceso, x.FechaRegistro, x.Estado]));
            this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Contratos');
          }
        } else {
          this.errorGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      });
    } else {

    }
  }

  Nuevo(): void {
    this.router.navigate(['/planta/operaciones/liquidacionproceso-edit']);
  }

  

  Export(): void {
    this.Buscar(true);
  }

  Print(): void {
    const form = this;
    swal.fire({
      title: '¿Estas Seguro?',
      text: `¿Está seguro de realizar la impresión?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2F8BE6',
      cancelButtonColor: '#F55252',
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ml-1'
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        let link = document.createElement('a');
        document.body.appendChild(link);
        link.href = `${host}OrdenProceso/Imprimir?id=${form.selected[0].OrdenProcesoId}`;
        link.target = "_blank";
        link.click();
        link.remove();
      }
    });
  }

}
