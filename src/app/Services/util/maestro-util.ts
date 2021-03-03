import { MaestroService } from '../maestro.service';
import { Injectable } from '@angular/core';

@Injectable()
export class MaestroUtil {

  constructor(private maestroService: MaestroService) { }

  obtenerMaestros(codigoTabla: string, callback) {
    this.maestroService.obtenerMaestros(codigoTabla)
      .subscribe(res => {
        callback(res)
      },
        err => {
          console.error(err);
        }
      );
  }

  GetDepartments(pCodigoPais?: string, callback?: Function): void {
    const request = { CodigoPais: pCodigoPais }
    this.maestroService.ConsultarDepartamento(request)
      .subscribe((res: any) => callback(res), (err: any) => console.log(err))
  }

  GetDepartmentsAsync(pCodigoPais?: string) {
    const request = { CodigoPais: pCodigoPais }
    return this.maestroService.ConsultarDepartamento(request).toPromise();
  }

  GetProvinces(pCodDepartamento: string, pCodPais?: string, callback?: Function): void {
    const request = {
      CodigoDepartamento: pCodDepartamento,
      CodigoPais: pCodPais
    }
    this.maestroService.ConsultarProvincia(request)
      .subscribe((res: any) => callback(res), (err: any) => console.log(err))
  }

  GetProvincesAsync(pCodDepartamento: string, pCodPais?: string) {
    const request = {
      CodigoDepartamento: pCodDepartamento,
      CodigoPais: pCodPais
    }
    return this.maestroService.ConsultarProvincia(request).toPromise();
  }

  GetDistricts(pCodDepartamento: string, pCodProvincia: string, pCodPais?: string, callback?: Function): void {
    const request = {
      CodigoDepartamento: pCodDepartamento,
      CodigoProvincia: pCodProvincia,
      CodigoPais: pCodPais
    }
    this.maestroService.ConsultarDistrito(request)
      .subscribe((res: any) => callback(res), (err: any) => console.log(err))
  }

  GetDistrictsAsync(pCodDepartamento: string, pCodProvincia: string, pCodPais?: string) {
    const request = {
      CodigoDepartamento: pCodDepartamento,
      CodigoProvincia: pCodProvincia,
      CodigoPais: pCodPais
    }
    return this.maestroService.ConsultarDistrito(request).toPromise();
  }

  GetZonas(pCodigoDistrito: string, callback?: Function): void {
    const request = {
      CodigoDistrito: pCodigoDistrito
    }
    this.maestroService.ConsultarZona(request)
      .subscribe((res: any) => callback(res), (err: any) => console.log(err))
  }

  GetZonasAsync(pCodigoDistrito: string) {
    const request = {
      CodigoDistrito: pCodigoDistrito
    }
    return this.maestroService.ConsultarZona(request).toPromise();
  }

}
