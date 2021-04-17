import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { CertificacionService } from '../../../../../../../../services/certificacion.service';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';
import { MaestroUtil } from '../../../../../../../../services/util/maestro-util';
import {HttpClient,HttpHeaders } from '@angular/common/http';
import { MaestroService } from '../../../../../../../../services/maestro.service';
//import { FileUploader } from 'ng2-file-upload';
import swal from 'sweetalert2';
import { formatDate } from '@angular/common';
import { host } from '../../../../../../../../shared/hosts/main.host';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Component({
  selector: 'app-certificacion-edit',
  templateUrl: './certificacion-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./certificacion-edit.component.scss']
})



export class CertificacionEditComponent implements OnInit {
  private url = `${host}SocioFincaCertificacion`;
  hasBaseDropZoneOver = false;
  hasAnotherDropZoneOver = false;
  certificacionEditForm: FormGroup;
  submitted = false;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  listaTipoCertificacion: any[];
  listaEntidadCertificadora: any[];
  selectedTipoCertificacion: any;
  selectedEntidadCertificadora: any;
  SocioFincaId = 0;
  SocioFincaCertificacionId = 0;
  objParams: any;
  fileName = "";

 
  
  constructor(private spinner: NgxSpinnerService,
    private maestroUtil: MaestroUtil,
    private certificacionService: CertificacionService,
    private alertUtil : AlertUtil,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private maestroService: MaestroService
  ) {

  }
  ngOnInit(): void {
    this.cargarForm();
    this.route.queryParams.subscribe((params) => {
      this.objParams = params;
      if (params) {
        if(params.SocioFincaId){
          this.SocioFincaId = params.SocioFincaId;
        }
        if(params.SocioFincaCertificacionId){
          this.SocioFincaCertificacionId = params.SocioFincaCertificacionId;
          this.SearchById();
        }
        this.cargarcombos();
      }
    });
  }
  cargarcombos() {
   this.GetEntidadCertificadora();
   this.GetTipoCertificacion();
  }

  async GetTipoCertificacion() {
    this.listaTipoCertificacion = [];
    const res = await this.maestroService.obtenerMaestros('TipoCertificacion').toPromise();
    if (res.Result.Success) {
      this.listaTipoCertificacion = res.Result.Data;
    }
  }
  async GetEntidadCertificadora() {
    this.listaEntidadCertificadora = [];
    const res = await this.maestroService.obtenerMaestros('EntidadCertificadora').toPromise();
    if (res.Result.Success) {
      this.listaEntidadCertificadora = res.Result.Data;
    }
  }


  get f() {
    return this.certificacionEditForm.controls;
  }
  cargarForm() {
    this.certificacionEditForm = new FormGroup(
      {
        tipoCertificacion: new FormControl('', [Validators.required]),
        fechaEmision: new FormControl('', [Validators.required]),
        fechaExpiracion: new FormControl('', [Validators.required]),
        entidadCertificadora: new FormControl('', [Validators.required]),
        estado: new FormControl('', []),
        file: new FormControl('', []),
        fileName: new FormControl('', []),
        pathFile: new FormControl('', [])
      })

      this.certificacionEditForm.controls.estado.setValue("01");
      this.certificacionEditForm.controls.estado.disable();
  }

  SearchById(): void {
    this.spinner.show();
    this.certificacionService.SearchById(Number(this.SocioFincaCertificacionId))
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.AutocompleteDataForm(res.Result.Data);
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.mensajeErrorGenerico);
      });
  }

  async AutocompleteDataForm(data: any) {
    this.certificacionEditForm.controls.estado.enable();
    await this.GetTipoCertificacion();
    await this.GetEntidadCertificadora();
    this.certificacionEditForm.controls.tipoCertificacion.setValue(data.TipoCertificacionId);
    this.certificacionEditForm.controls.entidadCertificadora.setValue(data.EntidadCertificadoraId);
    this.certificacionEditForm.controls.fechaEmision.setValue(formatDate(data.FechaCaducidad, 'yyyy-MM-dd', 'en'));
    this.certificacionEditForm.controls.fechaExpiracion.setValue(formatDate(data.FechaCaducidad, 'yyyy-MM-dd', 'en'));

    this.certificacionEditForm.controls.fileName.setValue(data.NombreArchivo);
    this.certificacionEditForm.controls.pathFile.setValue(data.PathArchivo);
    this.fileName =  data.NombreArchivo
    this.spinner.hide();
  }


  onSubmit() {
    if (!this.certificacionEditForm.invalid) {
      this.submitted = false;
      const form = this;
       if (this.SocioFincaCertificacionId > 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la actualización de certificacion?.`,
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
            form.Update();
          }
        });
      } else { 
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con el registro de certificacion?.`,
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
            form.Create();
          }
        });
      }
    }else{
      this.submitted = true;
      return;
    }
  }

  Create(): void {
    this.spinner.show();
    const request = this.GetRequest();
    const formData = new FormData();
    formData.append('file', this.certificacionEditForm.get('file').value);
    formData.append('request',  JSON.stringify(request));
    const headers = new HttpHeaders();
    headers.append('enctype', 'multipart/form-data');
    this.httpClient
     .post(this.url + '/Registrar', formData, { headers })
     .subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
          "Se registro correctamente la certificacion.",
          () => {
            this.Cancel();
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

  Update(): void {
    this.spinner.show();
    const request = this.GetRequest();
    const formData = new FormData();
    formData.append('file', this.certificacionEditForm.get('file').value);
    formData.append('request',  JSON.stringify(request));
    const headers = new HttpHeaders();
    headers.append('enctype', 'multipart/form-data');
    this.httpClient
     .post(this.url + '/Actualizar', formData, { headers })
     .subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
          "Se actualizo correctamente la certificacion.",
          () => {
            this.Cancel();
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
  fileChange(event) {
    
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.certificacionEditForm.patchValue({
        file: file
      });
      this.certificacionEditForm.get('file').updateValueAndValidity()
      
    }

  }

  Descargar() {
    var nombreFile = this.certificacionEditForm.value.fileName;
    var rutaFile = this.certificacionEditForm.value.pathFile;
    window.open(this.url+'/DescargarArchivo?' + "path=" + rutaFile + "&name=" + nombreFile , '_blank');
    /*
    this.certificacionService.DescargarArchivo(nombreFile,rutaFile)
    .subscribe((res: any) => {
      saveAs(res, nombreFile);
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.alertUtil.alertError("ERROR!", this.mensajeErrorGenerico);
    });
    */

    /*
    var nombreFile = this.certificacionEditForm.value.fileName;
    var rutaFile = this.certificacionEditForm.value.pathFile;
   
    const res = await this.certificacionService.DescargarArchivo(nombreFile,rutaFile).toPromise();
    
    if (res.Result.Success) {
       var obj = {};
       obj = res;
       const data: Blob = new Blob([res.Result.Data.archivoBytes], { type: EXCEL_TYPE });
       FileSaver.saveAs(data, `${nombreFile}`);
    }
    */
    
  }
  
  GetRequest(): any {
    return {
      SocioFincaCertificacionId:  Number(this.SocioFincaCertificacionId),
      SocioFincaId: Number(this.SocioFincaId),
      EntidadCertificadoraId: this.certificacionEditForm.value.entidadCertificadora,
      TipoCertificacionId: this.certificacionEditForm.value.tipoCertificacion,
      FechaCaducidad: new Date(this.certificacionEditForm.value.fechaExpiracion) ?? null,
      NombreArchivo:  this.certificacionEditForm.value.fileName,
      DescripcionArchivo:  "",
      PathArchivo: this.certificacionEditForm.value.pathFile,
      Usuario: 'mruizb',
      EstadoId: this.certificacionEditForm.get('estado').value
    }
  }

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/certificaciones`], { queryParams: { SocioFincaId: this.SocioFincaId}});
  }

}