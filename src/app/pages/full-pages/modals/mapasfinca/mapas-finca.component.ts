import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgbModal,ModalDismissReasons,NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MaestroService } from '../../../../services/maestro.service';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MapaFincaService } from '../../../../services/mapafinca.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../services/models/login';
import { AlertUtil } from '../../../../services/util/alert-util';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { host } from '../../../../shared/hosts/main.host';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import swal from 'sweetalert2';

@Component({
  selector: 'app-mapas-finca',
  templateUrl: './mapas-finca.component.html',
  styleUrls: ['./mapas-finca.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapasFincaComponent implements OnInit {
  modalReference: NgbModalRef;
  private url = `${host}FincaMapa`;
  @ViewChild('vform') validationForm: FormGroup;
  submittedE = false;
  mapasFincaForm: FormGroup;
  mapaFileForm: FormGroup;
  submitted = false;
  private tempData = [];
  public rows = [];
  selected = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  errorGeneral: any = { isError: false, errorMessage: '' };
  FincaMapaId = 0;
  @Input() FincaId: any;
  @Output() empresaEvent = new EventEmitter<any[]>();
  @ViewChild(DatatableComponent) tableEmpresa: DatatableComponent;
  fileName = "";
  closeResult: string;

  constructor(
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private alertUtil: AlertUtil,
    private httpClient: HttpClient,
    private mapaFincaService: MapaFincaService
  ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }
  ngOnInit(): void {
    this.cargarForm();
    this.cargarFiles()
  }

  close() {
    this.modalService.dismissAll();
  }


  cargarForm() {
    this.mapaFileForm = new FormGroup(
      {
        estado: new FormControl('', []),
        file: new FormControl('', []),
        fileName: new FormControl('', []),
        pathFile: new FormControl('', []),
        descripcion: new FormControl('', [Validators.required])
      })

  }

  cargarFiles() {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.mapaFincaService.ConsultarPorFincaId({ "FincaId": this.FincaId })
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {

            this.tempData = res.Result.Data;
            this.rows = [...this.tempData];
            this.selected = [];
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

  get fe() {
    return this.mapasFincaForm.controls
  }
  get f() {
    return this.mapaFileForm.controls
  }

  fileChange(event) {

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.mapaFileForm.patchValue({
        file: file
      });
      this.mapaFileForm.get('file').updateValueAndValidity()

    }

  }

  onSubmit() {
    if (!this.mapaFileForm.invalid) {
      
      this.submittedE = false;
      if (this.FincaMapaId > 0) {
        this.actualizarDocumento();
      } else {
        if(this.mapaFileForm.get('file').value){
          this.guardarDocumento();
          this.errorGeneral = {
            isError: false,
            msgError: ''
          };
        }else {
          this.submittedE = true;
          this.errorGeneral = {
            isError: true,
            msgError: 'Se debe agregar un archivo.'
          };
          return;
        }
      }

    } else {
      this.submittedE = true;
      return;
    }
  }

  openModal(customContent) {
    this.FincaMapaId = 0;
    this.fileName = "";
    this.modalReference = this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'lg',centered: true });

  }

  openModalEditar(customContent) {
    if (this.selected.length > 0) {
      this.FincaMapaId = this.selected[0].FincaMapaId;
      this.errorGeneral = { isError: false, errorMessage: "" };


      this.mapaFileForm.controls.estado.setValue(this.selected[0].EstadoId);
      this.mapaFileForm.controls.fileName.setValue(this.selected[0].Nombre);
      this.mapaFileForm.controls.pathFile.setValue(this.selected[0].Path);
      this.mapaFileForm.controls.descripcion.setValue(this.selected[0].Descripcion);
      this.fileName = this.selected[0].Nombre

      this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'lg',centered: true });

    } else {
      this.errorGeneral = { isError: true, errorMessage: "Selecciones un elemento del listado" };
    }

  }

  Descargar() {
    var nombreFile = this.mapaFileForm.value.fileName;
    var rutaFile = this.mapaFileForm.value.pathFile;
    window.open(this.url + '/DescargarArchivo?'+ "path=" + rutaFile  /*+ "&name=" + nombreFile*/, '_blank');

  }
  DescargarDetalle(row) {
    var nombreFile = row.Nombre;
    var rutaFile = row.Path;
    window.open(this.url + '/DescargarArchivo?' + "path=" + rutaFile /*+ "&name=" + nombreFile*/, '_blank');

  }

  guardarDocumento() {
    this.spinner.show();
    const request = this.GetRequest();
    const formData = new FormData();
    formData.append('file', this.mapaFileForm.get('file').value);
    formData.append('request', JSON.stringify(request));
    const headers = new HttpHeaders();
    headers.append('enctype', 'multipart/form-data');
    this.httpClient
      .post(this.url + '/Registrar', formData, { headers })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se registro correctamente el documento.",
            () => {
              this.cancelarDocumento();
            });
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.mensajeErrorGenerico);
      });
  }
  actualizarDocumento() {
    this.spinner.show();
    const request = this.GetRequest();
    const formData = new FormData();
    formData.append('file', this.mapaFileForm.get('file').value);
    formData.append('request', JSON.stringify(request));
    const headers = new HttpHeaders();
    headers.append('enctype', 'multipart/form-data');
    this.httpClient
      .post(this.url + '/Actualizar', formData, { headers })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se actualizó correctamente el documento.",
            () => {
              this.cancelarDocumento();
            });
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.mensajeErrorGenerico);
      });
  }


  GetRequest(): any {
    return {
      FincaMapaId: Number(this.FincaMapaId),
      FincaId: Number(this.FincaId),
      Nombre: this.mapaFileForm.value.fileName,
      Descripcion: this.mapaFileForm.value.descripcion,
      Path: this.mapaFileForm.value.pathFile,
      Usuario: 'mruizb',
      EstadoId: "01"//this.mapaFileForm.value.estado
    }
  }

  cancelarDocumento() {
    
    this.cargarFiles();
    //this.modalService.dismissAll("Cross click Adjunto");
   // this.activeModal.dismiss();
   this.modalReference.close();
  }
  eliminar() {

    if (this.selected && this.selected.length > 0) {
      const data = this.selected[0];
      var form = this;
      swal.fire({
        title: '¿Estas seguro?',
        text: "¿Estas seguro de eliminar el documento?",
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
            form.eliminarMapa(data.FincaMapaId)
        }
      });
      
    } else {
      this.errorGeneral = { isError: true, errorMessage: "Por favor seleccionar un elemento del listado." };
    }
  }
  eliminarMapa(id: any){
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.mapaFincaService.Eliminar(id)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Eliminado!', 'Documento Eliminado.');
            this.cargarFiles();
          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.alertUtil.alertError('Error', res.Result.Message);
          } else {
            this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
          }
        } else {
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      );
  }


}


