import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router, ActivatedRoute } from '@angular/router';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { SocioService } from '../../../../../../services/socio.service';
import { SocioFincaService } from '../../../../../../services/socio-finca.service';
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../../shared/util/excel.service';

@Component({
  selector: 'app-finca',
  templateUrl: './finca.component.html',
  styleUrls: ['./finca.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FincaComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private socioService: SocioService,
    private router: Router,
    private socioFincaService: SocioFincaService,
    private route: ActivatedRoute,
    private excelService: ExcelService) { }

  fincaSocioForm: FormGroup;
  limitRef = 10;
  rows = [];
  codePartner: number;
  tempRows = [];
  // objParams: any;
  vMsgErrGenerico = "Ha ocurrido un error interno.";
  selected = [];
  @ViewChild(DatatableComponent) table: DatatableComponent;
  codeProducer: any;

  ngOnInit(): void {
    this.codePartner = this.route.snapshot.params['partner'] ? parseInt(this.route.snapshot.params['partner']) : 0
    this.codeProducer = this.route.snapshot.params['producer'] ? parseInt(this.route.snapshot.params['producer']) : 0
    if (this.codePartner) {
      this.LoadForm();
      this.SearchSocioById();
    }
    // this.route.queryParams.subscribe((params) => {
    //   if (params) {
    //     this.LoadForm();
    //     if (this.codePartner > 0) {
    //       this.objParams = params;
    //       this.SearchSocioById();
    //     }
    //   }
    // });
  }

  LoadForm(): void {
    this.fincaSocioForm = this.fb.group({
      idProductorFinca: [],
      codSocio: [],
      nombreRazonSocial: []
    });
  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }
  onSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  SearchSocioById(): void {
    this.spinner.show();
    this.socioFincaService.SearchSocioById({ SocioId: this.codePartner })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.tempRows = res.Result.Data;
          this.rows = this.tempRows;
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }

  New(): void {
    // this.router.navigate(['/agropecuario/operaciones/socio/finca/create'], { queryParams: { idProductor: this.objParams.idProductor, idSocio: this.codePartner } });
    this.router.navigate(['/agropecuario/operaciones/socio/finca/create'], { queryParams: { idProductor: this.codeProducer, idSocio: this.codePartner } });
  }

  Certifications(): void {
    if (this.selected && this.selected.length > 0) {

      this.router.navigate([`/agropecuario/operaciones/socio/finca/certificaciones`],
        {
          queryParams:
          {
            SocioFincaId: this.selected[0].SocioFincaId,
            ProductorId: this.selected[0].ProductorId,
            SocioId: this.selected[0].SocioId
          }
        }
      );
    }
  }


  Inspections(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/inspeccion/list/${this.codePartner}/${this.codePartner}/${this.selected[0].SocioFincaId}`]);
  }

  Diagnosis(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/diagnostico/list/${this.codePartner}/${this.codePartner}/${this.selected[0].SocioFincaId}`]);
  }

  Export(): void {
    this.spinner.show();
    this.socioFincaService.SearchSocioById({ SocioId: this.codePartner })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          const vArrHeaderExcel: HeaderExcel[] = [
            new HeaderExcel("Nombre"),
            new HeaderExcel("Departamento"),
            new HeaderExcel("Provincia"),
            new HeaderExcel("Distrito"),
            new HeaderExcel("Zona"),
            new HeaderExcel("Estado")
          ];

          let vArrData: any[] = [];
          for (let i = 0; i < res.Result.Data.length; i++) {
            vArrData.push([
              res.Result.Data[i].Nombre,
              res.Result.Data[i].Departamento,
              res.Result.Data[i].Provincia,
              res.Result.Data[i].Distrito,
              res.Result.Data[i].Zona,
              res.Result.Data[i].Estado
            ]);
          }
          this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Socio_Fincas');
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }

  Cancel(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/list']);
  }

}
