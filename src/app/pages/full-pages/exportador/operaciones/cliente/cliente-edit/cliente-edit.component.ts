import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
  selectedPais: any;
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
    this.addValidations();
    this.LoadCombos();
    this.vId = this.route.snapshot.params['id'] ? parseFloat(this.route.snapshot.params['id']) : 0;
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadDataInicial();
    if (this.vId > 0) {
      this.ConsultarPorId();
    } else {
      this.clienteEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);
    }
  }

  LoadForm(): void {
    this.clienteEditForm = this.fb.group({
      idCliente: [0],
      razonSocial: ['', Validators.required],
      direccionCabe: ['', Validators.required],
      fecha: [''],
      nroRucCabe: ['', Validators.required],
      tipoCliente: ['', Validators.required],
      codCliente: [''],
      cliente: [''],
      nroRuc: [0],
      telefono: [0],
      email: [''],
      direccion: ['', Validators.required],
      pais: [, Validators.required],
      departamento: [''],
      provincia: [''],
      distrito: [''],
      ciudad: [''],
      descGerente: [''],
      idGerente: [0],
      descPresidente: [''],
      idPresidente: [0],
      responsableComercial: [''],
      floId: [, Validators.required]
    });
    this.clienteEditForm.setValidators(this.comparisonValidator());
  }

  get f() {
    return this.clienteEditForm.controls;
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {

      if (this.vId > 0 && !group.value.fecha) {
        this.errorGeneral = { isError: true, msgError: 'Por favor ingresar una fecha.' };
      } else if (group.value.descGerente && !group.value.idGerente) {
        this.errorGeneral = { isError: true, msgError: 'Por favor ingresar el ID del gerente.' };
      } else if (group.value.descPresidente && !group.value.idPresidente) {
        this.errorGeneral = { isError: true, msgError: 'Por favor ingresar el ID del presidente.' };
      } else {
        this.errorGeneral = { isError: false, msgError: '' };
      }
      return;
    };
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
    this.GetPaises();
    this.GetTiposClientes();
  }

  addValidations(): void {
    const departamento = this.clienteEditForm.controls.departamento;
    const provincia = this.clienteEditForm.controls.provincia;
    const distrito = this.clienteEditForm.controls.distrito;
    const ciudad = this.clienteEditForm.controls.ciudad;
    const nroRuc = this.clienteEditForm.controls.nroRuc;

    this.clienteEditForm.controls.tipoCliente.valueChanges.subscribe((tc: any) => {
      if (tc === '01') {
        departamento.setValidators(Validators.required);
        provincia.setValidators(Validators.required);
        distrito.setValidators(Validators.required);
        nroRuc.setValidators(Validators.required);
        ciudad.clearValidators();
      } else if (tc === '02') {
        departamento.clearValidators();
        provincia.clearValidators();
        distrito.clearValidators();
        nroRuc.clearValidators();
        ciudad.setValidators(Validators.required);
      } else {
        departamento.clearValidators();
        provincia.clearValidators();
        distrito.clearValidators();
        ciudad.clearValidators();
        nroRuc.clearValidators();
      }
      departamento.updateValueAndValidity();
      provincia.updateValueAndValidity();
      distrito.updateValueAndValidity();
      ciudad.updateValueAndValidity();
      nroRuc.updateValueAndValidity();
    });
  }

  onChangeTipoCliente(event: any): void {
    if (event.Codigo == '01') {
      // this.clienteEditForm.controls.pais.setValue(this.vSessionUser.Result.Data.Pais);
      this.clienteEditForm.controls.pais.setValue('PE');
      this.onChangePais({ Codigo: this.selectedPais });
    } else {
      this.clienteEditForm.controls.pais.reset();
    }
  }

  async GetPaises() {
    const res: any = await this.maestroService.ConsultarPaisAsync().toPromise();
    if (res.Result.Success) {
      this.listPaises = res.Result.Data;
    }
  }

  onChangePais(event: any): void {
    this.spinner.show();
    const form = this;
    this.listDepartamentos = [];
    this.clienteEditForm.controls.departamento.reset();
    this.maestroUtil.GetDepartments(event.Codigo, (res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        form.listDepartamentos = res.Result.Data;
        form.listCiudades = res.Result.Data;
      }
    });
  }

  async GetTiposClientes() {
    this.spinner.show();
    const res: any = await this.maestroService.obtenerMaestros('TipoCliente').toPromise();
    if (res.Result.Success) {
      this.listTiposClientes = res.Result.Data;
    }
    this.spinner.hide();
  }

  async GetDepartamentos() {
    const res: any = await this.maestroUtil.GetDepartmentsAsync(this.clienteEditForm.value.pais);
    if (res.Result.Success) {
      this.listDepartamentos = res.Result.Data;
      this.listCiudades = res.Result.Data;
    }
  }

  onChangeDepartament(event: any): void {
    this.spinner.show();
    const form = this;
    this.listProvincias = [];
    this.clienteEditForm.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      this.spinner.hide();
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
    this.spinner.show();
    const form = this;
    this.listDistritos = [];
    this.clienteEditForm.controls.distrito.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        this.spinner.hide();
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
      this.errorGeneral = { isError: false, msgError: '' };
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
    } else {
      this.errorGeneral = { isError: true, msgError: 'Por favor completar los campos OBLIGATORIOS.' };
    }
  }

  GetRequest(): any {
    try {

      
      return {
        ClienteId: this.clienteEditForm.value.idCliente ? this.clienteEditForm.value.idCliente : 0,
        Numero: this.clienteEditForm.value.codCliente ? this.clienteEditForm.value.codCliente : '',
        TipoClienteId: this.clienteEditForm.value.tipoCliente ? this.clienteEditForm.value.tipoCliente : '',
        Ruc: this.clienteEditForm.value.nroRuc ? this.clienteEditForm.value.nroRuc.toString() : '',
        RazonSocial: this.clienteEditForm.value.cliente ? this.clienteEditForm.value.cliente : '',
        Direccion: this.clienteEditForm.value.direccion ? this.clienteEditForm.value.direccion : '',
        PaisId: this.clienteEditForm.value.pais ? this.clienteEditForm.value.pais : 0,
              
        //DepartamentoId: this.clienteEditForm.value.departamento ? this.clienteEditForm.value.departamento : this.clienteEditForm.value.ciudad ? this.clienteEditForm.value.ciudad : '',
        
        DepartamentoId:this.clienteEditForm.value.tipoCliente == '01' ? this.clienteEditForm.value.departamento : this.clienteEditForm.value.ciudad ? this.clienteEditForm.value.ciudad : '',

        //DepartamentoId: this.clienteEditForm.value.tipoCliente = '01' ? this.clienteEditForm.value.departamento : (this.clienteEditForm.value.ciudad ? this.clienteEditForm.value.ciudad : '',
        
        
        ProvinciaId: this.clienteEditForm.value.provincia ? this.clienteEditForm.value.provincia : '',
        DistritoId: this.clienteEditForm.value.distrito ? this.clienteEditForm.value.distrito : '',
        NumeroTelefono: this.clienteEditForm.value.telefono ? this.clienteEditForm.value.telefono.toString() : '',
        CorreoElectronico: this.clienteEditForm.value.email ? this.clienteEditForm.value.email : '',
        GerenteGeneral: this.clienteEditForm.value.descGerente ? this.clienteEditForm.value.descGerente : '',
        GerenteGeneralNumero: this.clienteEditForm.value.idGerente ? this.clienteEditForm.value.idGerente.toString() : '',
        Presidente: this.clienteEditForm.value.descPresidente ? this.clienteEditForm.value.descPresidente : '',
        PresidenteNumero: this.clienteEditForm.value.idPresidente ? this.clienteEditForm.value.idPresidente.toString() : '',
        Usuario: this.vSessionUser.Result.Data.NombreUsuario,
        EstadoId: '01',
        FloId: this.clienteEditForm.value.floId ? this.clienteEditForm.value.floId : '',
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId
      }
    }
    catch (ex) {
      console.log(ex);
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
        this.alertUtil.alertError('ERROR!', res.Result.Message);
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
        this.alertUtil.alertError('ERROR!', res.Result.Message);
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
      this.errorGeneral = { isError: true, msgError: this.vMsgErrorGenerico };
    })
  }

  ConsultarPorId(): void {
    this.spinner.show();
    this.clienteService.SearchById({ ClienteId: this.vId }).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.CompletarFormulario(res.Result.Data);
      } else {
        this.spinner.hide();
      }
    }, (err: any) => {
      this.spinner.hide();
    })
  }

  async CompletarFormulario(data: any) {
    if (data.ClienteId) {
      this.clienteEditForm.controls.idCliente.setValue(data.ClienteId);
    }
    if (data.FechaRegistro) {
      this.clienteEditForm.controls.fecha.setValue(data.FechaRegistro.substring(0, 10));
    }
    if (data.TipoClienteId) {
      await this.GetTiposClientes();
      this.clienteEditForm.controls.tipoCliente.setValue(data.TipoClienteId);
    }
    if (data.Numero) {
      this.clienteEditForm.controls.codCliente.setValue(data.Numero);
    }
    if (data.RazonSocial) {
      this.clienteEditForm.controls.cliente.setValue(data.RazonSocial);
    }
    if (data.Ruc) {
      this.clienteEditForm.controls.nroRuc.setValue(data.Ruc);
    }
    if (data.NumeroTelefono) {
      this.clienteEditForm.controls.telefono.setValue(data.NumeroTelefono);
    }
    if (data.CorreoElectronico) {
      this.clienteEditForm.controls.email.setValue(data.CorreoElectronico);
    }
    if (data.Direccion) {
      this.clienteEditForm.controls.direccion.setValue(data.Direccion);
    }
    if (data.PaisId) {
      await this.GetPaises();
      this.clienteEditForm.controls.pais.setValue(data.PaisId);
      this.onChangePais({ Codigo: this.selectedPais });
    }
    if (data.DepartamentoId) {
      this.clienteEditForm.controls.departamento.setValue(data.DepartamentoId);
      this.clienteEditForm.controls.ciudad.setValue(data.DepartamentoId);
    }
    if (data.ProvinciaId) {
      await this.GetProvincias();
      this.clienteEditForm.controls.provincia.setValue(data.ProvinciaId);
    }
    if (data.DistritoId) {
      await this.GetDistritos();
      this.clienteEditForm.controls.distrito.setValue(data.DistritoId);
    }
    if (data.GerenteGeneral) {
      this.clienteEditForm.controls.descGerente.setValue(data.GerenteGeneral);
    }
    if (data.GerenteGeneralNumero) {
      this.clienteEditForm.controls.idGerente.setValue(data.GerenteGeneralNumero);
    }
    if (data.Presidente) {
      this.clienteEditForm.controls.descPresidente.setValue(data.Presidente);
    }
    if (data.PresidenteNumero) {
      this.clienteEditForm.controls.idPresidente.setValue(data.PresidenteNumero);
    }

    if (data.UsuarioRegistro) {
      this.clienteEditForm.controls.responsableComercial.setValue(data.UsuarioRegistro);
    }

    


    if (data.FloId)
      this.clienteEditForm.controls.floId.setValue(data.FloId);
    this.spinner.hide();
  }

  Cancel(): void {
    this.router.navigate(['/exportador/operaciones/cliente/list']);
  }
}
