import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MaestroService } from '../../../../services/maestro.service';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { EmpresaService } from '../../../../services/empresa.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../services/models/login';


@Component({
  selector: 'app-consultar-empresa',
  templateUrl: './consultar-empresa.component.html',
  styleUrls: ['./consultar-empresa.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MConsultarEmpresaComponent implements OnInit {
  @ViewChild('vform') validationForm: FormGroup;
  submittedE = false;
  listaClasificacion: any[];
  selectClasificacion: any;
  selectedEmpresa = [];
  errorEmpresa: any = { isError: false, errorMessage: '' };
  consultaEmpresas: FormGroup;
  private tempData = [];
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  filtrosEmpresaProv: any = {};
  mensajeErrorGenerico = "Ocurrio un error interno.";
  empresa: any[];
  login: ILogin;
  @Output() empresaEvent = new EventEmitter<any[]>();
  @ViewChild(DatatableComponent) tableEmpresa: DatatableComponent;

  constructor(private maestroService: MaestroService,
    private empresaService: EmpresaService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  
  singleSelectCheck(row: any) {
    return this.selectedEmpresa.indexOf(row) === -1;
  }
  ngOnInit(): void {
    this.cargarEmpresas();
    this.login = JSON.parse(localStorage.getItem("user"));
  }

  close() {
    this.modalService.dismissAll();
  }
  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.tableEmpresa.offset = 0;
  }
  buscar() {

    if (this.consultaEmpresas.invalid || this.errorEmpresa.isError) {
      this.submittedE = true;
      return;
    } else {
      this.submittedE = false;
      this.filtrosEmpresaProv.RazonSocial = this.consultaEmpresas.controls['rzsocial'].value;
      this.filtrosEmpresaProv.Ruc = this.consultaEmpresas.controls['ruc'].value;
      this.filtrosEmpresaProv.ClasificacionId = this.consultaEmpresas.controls['clasificacion'].value == null || this.consultaEmpresas.controls['clasificacion'].value == undefined ? "" : this.consultaEmpresas.controls['clasificacion'].value;
      this.filtrosEmpresaProv.EmpresaId = Number(this.login.Result.Data.EmpresaId);
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
              this.errorEmpresa = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorEmpresa = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            this.errorEmpresa = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.errorEmpresa = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  get fe() {
    return this.consultaEmpresas.controls
  }

  cargarEmpresas() {
    this.consultaEmpresas = new FormGroup(
      {
        ruc: new FormControl('', []),
        rzsocial: new FormControl('', []),
        clasificacion: new FormControl('', [])
      });
    this.consultaEmpresas.setValidators(this.comparisonValidatorEmpresa())
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

  public comparisonValidatorEmpresa(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let rzsocial = group.controls['rzsocial'].value;
      let ruc = group.controls['ruc'].value;
      if (rzsocial == "" && ruc == "") {
        this.errorEmpresa = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };

      }
      else {
        this.errorEmpresa = { isError: false, errorMessage: '' };

      }
      return;
    };
  }

  seleccionarEmpresa(e) {
    this.empresa = e;
    this.empresaEvent.emit(this.empresa)
  }
}


