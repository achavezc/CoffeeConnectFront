import { Injectable } from '@angular/core';
import swal from 'sweetalert2';


@Injectable()
export class AlertUtil {
 
  constructor(){  }

  alertError(title:String, mensaje:any){
    swal.fire({
      icon: "error",
      title: title,
      text: mensaje,
      customClass: {
        confirmButton: 'btn btn-error'
      },
    })
  }

  alertOk(title:String, mensaje:any){
    swal.fire({
      icon: "success",
      title: title,
      text: mensaje,
      customClass: {
        confirmButton: 'btn btn-success'
      },
    })
  }
}