import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';

import { ClienteService } from '../../../../../../services/cliente.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';

@Component({
  selector: 'app-cliente-edit',
  templateUrl: './cliente-edit.component.html',
  styleUrls: ['./cliente-edit.component.scss']
})
export class ClienteEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private clienteService: ClienteService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private maestroService: MaestroService,
    private maestroUtil: MaestroUtil) { }

  clienteEditForm: FormGroup;
  listTiposClientes: [] = [];
  listPaises: [];
  listDepartamentos: [];
  listProvincias: [];
  listDistritos: [];
  listCiudades: [];
  selectedTipoCliente: string;
  selectedPais: string;
  selectedDepartamento: string;
  selectedProvincia: string;
  selectedDistrito: string;
  selectedCiudad: any;
  vId: number;
  vSessionUser: any;
  errorGeneral = { isError: false, msgError: '' };
  vMsgErrorGenerico = 'Ocurrio un error interno.';

  ngOnInit(): void {
    this.LoadForm();
    // this.LoadCombos();
    // this.vId = this.route.snapshot.params['id'] ? parseFloat(this.route.snapshot.params['id']) : 0;
    // this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    // if (this.vId > 0) {

    // } else {
    //   this.LoadDataInicial();
    // }
  }

  LoadForm(): void {
    this.clienteEditForm = this.fb.group({
      idCliente: [],
      razonSocial: [, Validators.required],
      direccionCabe: [, Validators.required],
      fecha: [],
      nroRucCabe: [, Validators.required],
      tipoCliente: [, Validators.required],
      codCliente: [],
      cliente: [],
      nroRuc: [],
      telefono: [],
      email: [],
      direccion: [, Validators.required],
      pais: [, Validators.required],
      departamento: [],
      provincia: [],
      distrito: [],
      ciudad: [],
      descGerente: [],
      idGerente: [],
      descPresidente: [],
      idPresidente: [],
      responsableComercial: []
    });
  }

  get f() {
    return this.clienteEditForm.controls;
  }

  LoadDataInicial(): void {
    if (this.vSessionUser && this.vSessionUser.Result && this.vSessionUser.Result.Data) {
      const session = this.vSessionUser.Result.Data;
      this.clienteEditForm.controls.razonSocial.setValue(session.RazonSocialEmpresa);
      this.clienteEditForm.controls.direccionCabe.setValue(session.DireccionEmpresa);
      this.clienteEditForm.controls.nroRucCabe.setValue(session.RucEmpresa);
    }
  }

  LoadCombos(): void {
    this.GetTiposClientes();
    this.GetDepartamentos();
  }

  // async GetPaises() {
  //   const res = await 
  // }

  async GetTiposClientes() {
    const res: any = await this.maestroService.obtenerMaestros('TipoCliente').toPromise();
    if (res.Result.Success) {
      this.listTiposClientes = res.Result.Data;
    }
  }

  async GetDepartamentos() {
    const res: any = await this.maestroUtil.GetDepartmentsAsync('PE');
    if (res.Result.Success) {
      this.listDepartamentos = res.Result.Data;
    }
  }

  onChangeDepartament(event: any): void {
    const form = this;
    this.listProvincias = [];
    this.clienteEditForm.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
      }
    });
  }

  async GetProvincias() {
    this.listProvincias = [];
    const res: any = await this.maestroUtil.GetProvincesAsync(this.selectedDepartamento, 'PE');
    if (res.Result.Success) {
      this.listProvincias = res.Result.Data;
    }
  }

  onChangeProvince(event: any): void {
    const form = this;
    this.listDistritos = [];
    this.clienteEditForm.controls.distrito.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        if (res.Result.Success) {
          form.listDistritos = res.Result.Data;
        }
      });
  }

  async GetDistritos() {
    this.listDistritos = [];
    const res: any = await this.maestroUtil.GetDistrictsAsync(this.selectedDepartamento, this.selectedProvincia, 'PE');
    if (res.Result.Success) {
      this.listDistritos = res.Result.Data;
    }
  }

  Save(): void {
    if (!this.clienteEditForm.invalid && !this.errorGeneral.isError) {
      const form = this;
      if (this.vId <= 0) {
        //CREAR
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la creación del nuevo cliente?.`,
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
        }).then((result) => {
          if (result.value) {
            form.CreateClient();
          }
        });
      } else {
        //MODIFICAR
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la actualización del cliente?.`,
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
        }).then((result) => {
          if (result.value) {
            form.UpdateClient();
          }
        });
      }
    }
  }

  GetRequest(): any {
    return {
      ClienteId: this.clienteEditForm.value.idCliente ?? 0,
      Numero: this.clienteEditForm.value.codCliente ?? '',
      TipoClienteId: this.clienteEditForm.value.tipoCliente ?? '',
      Ruc: this.clienteEditForm.value.nroRuc ?? '',
      RazonSocial: this.clienteEditForm.value.cliente ?? '',
      Direccion: this.clienteEditForm.value.direccion ?? '',
      PaisId: this.clienteEditForm.value.pais ?? 0,
      DepartamentoId: this.clienteEditForm.value.departamento ?? '',
      ProvinciaId: this.clienteEditForm.value.provincia ?? '',
      DistritoId: this.clienteEditForm.value.distrito ?? '',
      NumeroTelefono: this.clienteEditForm.value.telefono.toString() ?? '',
      CorreoElectronico: this.clienteEditForm.value.email ?? '',
      GerenteGeneral: this.clienteEditForm.value.descGerente ?? '',
      GerenteGeneralNumero: this.clienteEditForm.value.idGerente.toString() ?? '',
      Presidente: this.clienteEditForm.value.descPresidente ?? '',
      PresidenteNumero: this.clienteEditForm.value.idPresidente.toString() ?? '',
      Usuario: 'mruizb',
      EstadoId: ''
    }
  }

  CreateClient(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.clienteService.Create(request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.errorGeneral = { isError: false, msgError: '' };
        this.alertUtil.alertOkCallback('Confirmación!', 'Cliente creado correctamente.', () => {
          this.Cancel();
        });
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
      this.errorGeneral = { isError: true, msgError: this.vMsgErrorGenerico };
    })
  }

  UpdateClient(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.clienteService.Update(request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.errorGeneral = { isError: false, msgError: '' };
        this.alertUtil.alertOkCallback('Confirmación!', 'Cliente actualizado correctamente.', () => {
          this.Cancel();
        });
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
      this.errorGeneral = { isError: true, msgError: this.vMsgErrorGenerico };
    })
  }

  Cancel(): void {
    this.router.navigate(['/exportador/operaciones/cliente/list']);
  }
}
