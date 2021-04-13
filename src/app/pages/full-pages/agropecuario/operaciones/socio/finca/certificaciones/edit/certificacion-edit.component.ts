import { Component, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { CertificacionService } from '../../../../../../../../services/certificacion.service';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';
import { MaestroUtil } from '../../../../../../../../services/util/maestro-util';
import { Observable } from 'rxjs';
import {HttpClient, HttpParams, HttpRequest, HttpEvent,HttpHeaders } from '@angular/common/http';
//import { FileUploader } from 'ng2-file-upload';
import swal from 'sweetalert2';


const URL = 'http://localhost:5000/api/SocioFincaCertificacion/Registrar';
@Component({
  selector: 'app-certificacion-edit',
  templateUrl: './certificacion-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./certificacion-edit.component.scss']
})

export class CertificacionEditComponent implements OnInit {

  SERVER_URL = "http://localhost:5000/api/SocioFincaCertificacion/Registrar";
  hasBaseDropZoneOver = false;
  hasAnotherDropZoneOver = false;
  certificacionEditForm: FormGroup;
  submitted = false;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  listaTipoCertificacion: Observable<any[]>;
  listaEntidadCertificadora: Observable<any[]>;
  selectedTipoCertificacion: any;
  selectedEntidadCertificadora: any;
  SocioFincaId = 0;
  SocioFincaCertificacionId = 0;
  objParams: any;

/*   uploader: FileUploader = new FileUploader({
    url: URL,
    isHTML5: true
  });
 */
  
  constructor(private spinner: NgxSpinnerService,
    private maestroUtil: MaestroUtil,
    private certificacionService: CertificacionService,
    private alertUtil : AlertUtil,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {

  }
  ngOnInit(): void {
    this.cargarForm();
    this.route.queryParams.subscribe((params) => {
      this.objParams = params;
      if (params) {
        this.SocioFincaId = params.SocioFincaId;
        this.cargarcombos();
      }
    });

    //this.initializeUploader();

  }

/* 
  initializeUploader() {
    this.uploader = new FileUploader({
      url: URL,
      isHTML5: true
    });

    this.uploader.onAfterAddingFile = (file) => {file.withCredentials = false; };
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        var dd = response;
      }
    };
  }
 */
  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("TipoCertificacion", function (res) {
      if (res.Result.Success) {
        form.listaTipoCertificacion = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("EntidadCertificadora", function (res) {
      if (res.Result.Success) {
        form.listaEntidadCertificadora = res.Result.Data;
      }
    });
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
      })
  }

  // Angular2 File Upload
  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  fileOverAnother(e: any): void {
    this.hasAnotherDropZoneOver = e;
  }
  

  onSubmit() {
    if (!this.certificacionEditForm.invalid) {
      const form = this;
/*       if (this.vId > 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la actualización del socio finca?.`,
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
      } else { */
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
      //}
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
     .post(this.SERVER_URL, formData, { headers })
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

    
    /*
    this.certificacionService.Create(request)
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
      });}*/
      
  }
  Update(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.certificacionService.Create(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se actualizo correctamente el socio finca.",
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
      //this.certificacionEditForm.get('profile').setValue(file);
      this.certificacionEditForm.patchValue({
        file: file
      });
      this.certificacionEditForm.get('file').updateValueAndValidity()
      
    }

  }


  
  GetRequest(): any {
    return {
      SocioFincaCertificacionId: this.SocioFincaCertificacionId ?? 0,
      SocioFincaId: Number(this.SocioFincaId),
      EntidadCertificadoraId: this.certificacionEditForm.value.entidadCertificadora,
      TipoCertificacionId: this.certificacionEditForm.value.tipoCertificacion,
      FechaCaducidad: new Date(this.certificacionEditForm.value.fechaExpiracion) ?? null,
      NombreArchivo: "",
      DescripcionArchivo: "",
      PathArchivo: "",
      Usuario: 'mruizb',
      EstadoId: "01"//his.certificacionEditForm.value.estado
    }
  }

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/certificaciones`], { queryParams: { SocioFincaId: this.SocioFincaId}});
  }

}