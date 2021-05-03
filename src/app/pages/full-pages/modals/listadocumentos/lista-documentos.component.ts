import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { FincaFotoGeoreferenciadaService } from '../../../../services/finca-foto-georeferenciada.service';
import { FincaDocumentoAdjuntoService } from '../../../../services/finca-documento-adjunto.service';
import { host } from '../../../../shared/hosts/main.host';
import { AlertUtil } from '../../../../services/util/alert-util';
import { SocioDocumentoService } from '../../../../services/socio-documento.service';

@Component({
  selector: 'app-lista-documentos',
  templateUrl: './lista-documentos.component.html',
  styleUrls: ['./lista-documentos.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MListaDocumentosComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  listaDocumentosForm: FormGroup;
  agregarArchivoForm: FormGroup;
  public rows = [];
  public limitRef = 10;
  selected = [];
  mensajeErrorGenerico = "Ocurrio un error interno.";
  errorGeneral: any = { isError: false, errorMessage: '' };
  errorAddFiles: any = { isError: false, errorMessage: '' };
  @Input() codeForm: any;
  @Input() code: any;
  titleModal: any;
  subTitleModal: any;
  @ViewChild(DatatableComponent) tblListDocuments: DatatableComponent;
  userSession: any;
  idFincaFotoGeoreferenciada = 0;
  idFincaDocumentoAdjunto = 0;
  idSocioDocumento = 0;
  fileName = '';

  constructor(private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private fotoGeoreferenciadaService: FincaFotoGeoreferenciadaService,
    private documentoAdjuntoService: FincaDocumentoAdjuntoService,
    private fb: FormBuilder,
    private httpClient: HttpClient,
    private alertUtil: AlertUtil,
    private socioDocumentoService: SocioDocumentoService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    if (this.codeForm === 'frmMdlListaFotosGeoreferenciadas') {
      this.titleModal = 'CARGA DE FOTOS GEOREFERENCIADAS';
      this.subTitleModal = 'LISTA DE DOCUMENTOS';
    } else if (this.codeForm === 'frmMdlAttachments') {
      this.titleModal = 'CARGA DE OTROS DOCUMENTOS';
      this.subTitleModal = 'LISTA DE DOCUMENTOS';
    } else if (this.codeForm === 'frmMdlSocioDocuments') {
      this.titleModal = 'CARGA DE DOCUMENTOS DEL SOCIO';
      this.subTitleModal = 'LISTA DE FINCAS DEL PROVEEDOR - DOCUMENTOS SOCIO';
    }
    this.LoadFormAddFiles();
    this.LoadFiles();
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  CloseModal() {
    this.modalService.dismissAll();
  }

  openModal(modal: any) {
    this.agregarArchivoForm.reset();
    this.fileName = '';
    this.idFincaFotoGeoreferenciada = 0;
    this.idFincaDocumentoAdjunto = 0;
    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'lg', centered: true });
  }

  openModalEdit(modal: any): void {
    if (this.selected && this.selected.length > 0) {
      const data = this.selected[0];
      this.errorGeneral = { isError: false, errorMessage: "" };
      if (data.FincaFotoGeoreferenciadaId) {
        this.idFincaFotoGeoreferenciada = data.FincaFotoGeoreferenciadaId;
      } else if (data.FincaDocumentoAdjuntoId) {
        this.idFincaDocumentoAdjunto = data.FincaDocumentoAdjuntoId;
      } else if (data.SocioDocumentoId){
        this.idSocioDocumento = data.SocioDocumentoId;
      }
      this.agregarArchivoForm.controls.estado.setValue(data.EstadoId);
      this.agregarArchivoForm.controls.fileName.setValue(data.Nombre);
      this.agregarArchivoForm.controls.pathFile.setValue(data.Path);
      this.agregarArchivoForm.controls.descripcion.setValue(data.Descripcion);
      this.fileName = data.Nombre

      this.modalService.open(modal, { windowClass: 'dark-modal', size: 'lg', centered: true });

    } else {
      this.errorGeneral = { isError: true, errorMessage: "Por favor seleccionar un elemento del listado." };
    }
  }

  modalResponse(event) {
    this.modalService.dismissAll();
  }

  LoadFiles(): void {
    if (this.codeForm === 'frmMdlListaFotosGeoreferenciadas') {
      this.GetPhotosGeoreferenced();
    } else if (this.codeForm === 'frmMdlAttachments') {
      this.GetAttachments();
    } else if (this.codeForm === 'frmMdlSocioDocuments') {
      this.GetDocumentsPartner();
    }
  }

  GetPhotosGeoreferenced(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, errorMessage: '' };
    this.fotoGeoreferenciadaService.SearchByFincaId({ FincaId: this.code }).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.rows = res.Result.Data;
      } else {
        this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
    });
  }

  GetAttachments(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, errorMessage: '' };
    this.documentoAdjuntoService.SearchByFincaId({ FincaId: this.code }).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.rows = res.Result.Data;
      } else {
        this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
    });
  }

  GetDocumentsPartner(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, errorMessage: '' };
    this.socioDocumentoService.SearchByPartnetId({ SocioId: this.code }).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.rows = res.Result.Data;
      } else {
        this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
    });
  }

  LoadFormAddFiles(): void {
    this.agregarArchivoForm = this.fb.group({
      descripcion: ['', Validators.required],
      file: [''],
      fileName: [''],
      pathFile: [''],
      estado: ['']
    });
    this.agregarArchivoForm.setValidators(this.addValidations());
  }

  get fm() {
    return this.agregarArchivoForm.controls;
  }

  addValidations(): ValidatorFn {
    const form = this;
    return (group: FormGroup): ValidationErrors => {

      if (!group.value.descripcion || (!group.value.file && !form.fileName)) {
        this.errorAddFiles = { isError: true, errorMessage: 'Por favor ingresar ambos valores.' };
      } else {
        this.errorAddFiles = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  fileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.agregarArchivoForm.patchValue({
        file: event.target.files[0]
      });
      this.agregarArchivoForm.get('file').updateValueAndValidity()
    }
  }

  Descargar(data?: any): void {
    let nombreFile = '';
    let rutaFile = ''
    if (data) {
      nombreFile = data.Nombre;
      rutaFile = data.Path;
    } else {
      nombreFile = this.agregarArchivoForm.value.fileName;
      rutaFile = this.agregarArchivoForm.value.pathFile;
    }

    if (this.codeForm === 'frmMdlListaFotosGeoreferenciadas') {
      let link = document.createElement('a');
      document.body.appendChild(link);
      link.href = `${host}FincaFotoGeoreferenciada/DescargarArchivo?path=${rutaFile}&name=${nombreFile}`;
      link.target = "_blank";
      link.click();
      link.remove();
    } else if (this.codeForm === 'frmMdlAttachments') {
      let link = document.createElement('a');
      document.body.appendChild(link);
      link.href = `${host}FincaFotoGeoreferenciada/DescargarArchivo?path=${rutaFile}&name=${nombreFile}`;
      link.target = "_blank";
      link.click();
      link.remove();
    } else if (this.codeForm === 'frmMdlSocioDocuments') {
      let link = document.createElement('a');
      document.body.appendChild(link);
      link.href = `${host}SocioDocumento/DescargarArchivo?path=${rutaFile}&name=${nombreFile}`;
      link.target = "_blank";
      link.click();
      link.remove();
    }
  }

  SaveFile(): void {
    if (!this.agregarArchivoForm.invalid) {
      if (this.idFincaFotoGeoreferenciada > 0 || this.idFincaDocumentoAdjunto > 0 || this.idSocioDocumento > 0) {
        this.UpdateFile();
      } else if (this.idFincaFotoGeoreferenciada <= 0 || this.idFincaDocumentoAdjunto <= 0 || this.idSocioDocumento <= 0) {
        this.CreateFile();
      }
    }
  }

  GetRequestPhoto(): any {
    return {
      FincaFotoGeoreferenciadaId: Number(this.idFincaFotoGeoreferenciada),
      FincaId: Number(this.code),
      Nombre: this.agregarArchivoForm.value.fileName,
      Descripcion: this.agregarArchivoForm.value.descripcion,
      Path: this.agregarArchivoForm.value.pathFile,
      Usuario: this.userSession.Result.Data.NombreUsuario,
      EstadoId: "01"
    }
  }

  GetRequestDocument(): any {
    return {
      FincaDocumentoAdjuntoId: Number(this.idFincaDocumentoAdjunto),
      FincaId: Number(this.code),
      Nombre: this.agregarArchivoForm.value.fileName,
      Descripcion: this.agregarArchivoForm.value.descripcion,
      Path: this.agregarArchivoForm.value.pathFile,
      Usuario: this.userSession.Result.Data.NombreUsuario,
      EstadoId: "01"
    }
  }

  GetRequestPartnetDocument(): any {
    return {
      SocioDocumentoId: Number(this.idSocioDocumento),
      SocioId: Number(this.code),
      Nombre: this.agregarArchivoForm.value.fileName,
      Descripcion: this.agregarArchivoForm.value.descripcion,
      Path: this.agregarArchivoForm.value.pathFile,
      Usuario: this.userSession.Result.Data.NombreUsuario,
      EstadoId: "01"
    }
  }

  CreateFile(): void {
    if (this.agregarArchivoForm.value.fileName || this.agregarArchivoForm.value.file) {
      this.spinner.show();
      let url = '';
      let request = {};
      if (this.codeForm === 'frmMdlListaFotosGeoreferenciadas') {
        url = `${host}FincaFotoGeoreferenciada`;
        request = this.GetRequestPhoto();
      } else if (this.codeForm === 'frmMdlAttachments') {
        url = `${host}FincaDocumentoAdjunto`;
        request = this.GetRequestDocument();
      } else if (this.codeForm === 'frmMdlSocioDocuments') {
        url = `${host}SocioDocumento`;
        request = this.GetRequestPartnetDocument();
      }

      const formData = new FormData();
      formData.append('file', this.agregarArchivoForm.get('file').value);
      formData.append('request', JSON.stringify(request));
      const headers = new HttpHeaders();
      headers.append('enctype', 'multipart/form-data');
      this.httpClient
        .post(url + '/Registrar', formData, { headers })
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
              "Se registro correctamente el documento.",
              () => {
                this.LoadFiles();
                this.CancelModalAddFiles();
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
  }

  UpdateFile(): void {
    if (this.agregarArchivoForm.value.fileName || this.agregarArchivoForm.value.file) {
      this.spinner.show();
      let url = '';
      let request = {};
      if (this.codeForm === 'frmMdlListaFotosGeoreferenciadas') {
        url = `${host}FincaFotoGeoreferenciada`;
        request = this.GetRequestPhoto();
      } else if (this.codeForm === 'frmMdlAttachments') {
        url = `${host}FincaDocumentoAdjunto`;
        request = this.GetRequestDocument();
      } else if (this.codeForm === 'frmMdlSocioDocuments') {
        url = `${host}SocioDocumento`;
        request = this.GetRequestPartnetDocument();
      }

      const formData = new FormData();
      formData.append('file', this.agregarArchivoForm.get('file').value);
      formData.append('request', JSON.stringify(request));
      const headers = new HttpHeaders();
      headers.append('enctype', 'multipart/form-data');
      this.httpClient
        .post(url + '/Actualizar', formData, { headers })
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
              "Se actualizó correctamente el documento.",
              () => {
                this.LoadFiles();
                this.CancelModalAddFiles();
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
  }

  CancelModalAddFiles(): void {
    const btnCancel = document.getElementById('btnCancel');
    btnCancel.click();
  }

}
