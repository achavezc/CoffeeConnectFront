import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MaestroService } from '../../../../services/maestro.service';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { OrganizacionService } from '../../../../services/organizacion.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../services/models/login';


@Component({
  selector: 'app-consultar-organizacion',
  templateUrl: './consultar-organizacion.component.html',
  styleUrls: ['./consultar-organizacion.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MConsultarOrganizacionComponent implements OnInit {
  @ViewChild('vform') validationForm: FormGroup;
  submittedE = false;
  listaClasificacion: any[];
  selectClasificacion: any;
  selectedOrganizacion = [];
  errorEmpresa: any = { isError: false, errorMessage: '' };
  consultaOrganizacion: FormGroup;
  private tempData = [];
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  filtrosEmpresaProv: any = {};
  mensajeErrorGenerico = "Ocurrio un error interno.";
  empresa: any[];
  login: ILogin;
  @Output() empresaEvent = new EventEmitter<any[]>();
  @ViewChild(DatatableComponent) tableOrganizacion: DatatableComponent;

  constructor(private maestroService: MaestroService,
    private organizacionService: OrganizacionService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  singleSelectCheck(row: any) {
    return this.selectedOrganizacion.indexOf(row) === -1;
  }
  ngOnInit(): void {
    this.cargarOrganizacion();
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
    this.tableOrganizacion.offset = 0;
  }
  buscar() {

    if (this.consultaOrganizacion.invalid || this.errorEmpresa.isError) {
      this.submittedE = true;
      return;
    } else {
      this.submittedE = false;
      this.filtrosEmpresaProv.RazonSocial = this.consultaOrganizacion.controls['rzsocial'].value;
      this.filtrosEmpresaProv.CodigoOrganizacion = this.consultaOrganizacion.controls['codigo'].value;
      this.filtrosEmpresaProv.Ruc = this.consultaOrganizacion.controls['ruc'].value;
      this.filtrosEmpresaProv.ClasificacionId = this.consultaOrganizacion.controls['clasificacion'].value == null || this.consultaOrganizacion.controls['clasificacion'].value == undefined ? "" : this.consultaOrganizacion.controls['clasificacion'].value;
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
      this.organizacionService.Consultar(this.filtrosEmpresaProv)
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
    return this.consultaOrganizacion.controls
  }

  cargarOrganizacion() {
    this.consultaOrganizacion = new FormGroup(
      {
        ruc: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        clasificacion: new FormControl('', []),
        codigo: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')])
      });
    this.consultaOrganizacion.setValidators(this.comparisonValidatorOrganizacion())
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

  public comparisonValidatorOrganizacion(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let rzsocial = group.controls['rzsocial'].value;
      let ruc = group.controls['ruc'].value;
      let codigo = group.controls['codigo'].value;
      if (rzsocial == "" && ruc == "" && codigo == "") {
        this.errorEmpresa = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };

      }
      else {
        this.errorEmpresa = { isError: false, errorMessage: '' };

      }
      return;
    };
  }

 /* seleccionarOrganizacion(e) {
    this.empresa = e;
    var x = this.selectedOrganizacion;
    this.empresaEvent.emit(this.empresa)
  }*/

  seleccionarOrganizacion(): void {
    this.empresaEvent.emit(this.selectedOrganizacion);
  }
}


