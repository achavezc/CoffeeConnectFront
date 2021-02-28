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

  GetProvinces(pCodDepartamento: string, pCodPais?: string, callback?: Function): void {
    const request = {
      CodigoDepartamento: pCodDepartamento,
      CodigoPais: pCodPais
    }
    this.maestroService.ConsultarProvincia(request)
      .subscribe((res: any) => callback(res), (err: any) => console.log(err))
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

}
