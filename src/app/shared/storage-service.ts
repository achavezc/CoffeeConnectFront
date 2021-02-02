import {Injectable} from '@angular/core';
import * as SecureLS from 'secure-ls';
import * as moment from 'moment';
import {
  ARR_CAMPANHAS,
  ARR_MOVIMIENTOS,
  CAMPANHAS_RAW,
  EECC,
  EMAIL,
  FECHA_NACIMIENTO,
  IP_ADDRESS,
  LAST_UPDATE,
  NAVIGATORS,
  NOMBRE_COMPLETO,
  NUMERO_DOCUMENTO,
  PRIMER_APELLIDO,
  PRIMER_NOMBRE,
  PRODUCTS,
  RESUMEN_CUENTA,
  SEGUNDO_APELLIDO,
  SEGUNDO_NOMBRE,
  SEXO,
  TARJETA,
  TELEFONO,
  TIPO_DOCUMENTO
} from './constants/storage-keys';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class StorageService {
  ls: any;
  private nombreSubject = new Subject<string>();

  constructor() {
    this.ls = new SecureLS({encodingType: 'Base64', isCompression: false});
  }

  clear() {
    this.ls.removeAll();
    localStorage.clear();
  }

  setLastUpdate() {
    let lastUpdate = moment().format('[Última actualización] DD/MM/YYYY [a las] hh:mm a');
    this.ls.set(LAST_UPDATE, lastUpdate);
  }

  getLastUpdate() {
    return this.ls.get(LAST_UPDATE);
  }

  setMovimientos(movimientos) {
    this.ls.set(ARR_MOVIMIENTOS, JSON.stringify(movimientos));
    this.setLastUpdate();
  }

  getMovimientos() {
    let arrMovimientos = [];
    try {
      arrMovimientos = JSON.parse(this.ls.get(ARR_MOVIMIENTOS));
    } catch (err) {

    }

    return arrMovimientos;
  }

  setEECC(eecc) {
    this.ls.set(EECC, JSON.stringify(eecc));
    this.setLastUpdate();
  }

  getEECC() {
    let arrEecc = [];
    try {
      arrEecc = JSON.parse(this.ls.get(EECC));
    } catch (err) {
    }

    return arrEecc;
  }

  setCampanhasRaw(campanhas) {
    this.ls.set(CAMPANHAS_RAW, JSON.stringify(campanhas));
    this.setLastUpdate();
  }

  getCampanhasRaw() {
    let campanhas = [];
    try {
      campanhas = JSON.parse(this.ls.get(CAMPANHAS_RAW));
    } catch (e) {
    }
    return campanhas;
  }

  setCampanhas(campanhas) {
    this.ls.set(ARR_CAMPANHAS, JSON.stringify(campanhas));
    this.setLastUpdate();
  }

  getCampanhas() {
    let arrCampanhas = [];
    try {
      arrCampanhas = JSON.parse(this.ls.get(ARR_CAMPANHAS));
    } catch (err) {
    }

    return arrCampanhas;
  }

  setNavigators(navigators) {
    this.ls.set(NAVIGATORS, JSON.stringify(navigators));
    this.setLastUpdate();
  }

  getNavigators() {
    let navigators = null;
    try {
      navigators = JSON.parse(this.ls.get(NAVIGATORS));
    } catch (err) {
    }

    return navigators;
  }

  setProducts(products) {
    this.ls.set(PRODUCTS, JSON.stringify(products));
    this.setLastUpdate();
  }

  getProducts() {
    let products = [];
    try {
      products = JSON.parse(this.ls.get(PRODUCTS));
    } catch (err) {
    }

    return products;
  }

  // Nuevos Atributos CTS
  // - BEGIN -
  setFechaNacimiento(fecha) {
    this.ls.set(FECHA_NACIMIENTO, fecha);
    this.setLastUpdate();
  }

  getFechaNacimiento() {
    return this.ls.get(FECHA_NACIMIENTO);
  }

  setPrimerNombre(primerNombre) {
    this.ls.set(PRIMER_NOMBRE, primerNombre);
    this.setLastUpdate();
  }

  getPrimerNombre() {
    return this.ls.get(PRIMER_NOMBRE);
  }

  setSegundoNombre(segundoNombre) {
    this.ls.set(SEGUNDO_NOMBRE, segundoNombre);
    this.setLastUpdate();
  }

  getSegundoNombre() {
    return this.ls.get(SEGUNDO_NOMBRE);
  }

  setPrimerApellido(primerApellido) {
    this.ls.set(PRIMER_APELLIDO, primerApellido);
    this.setLastUpdate();
  }

  getPrimerApellido() {
    return this.ls.get(PRIMER_APELLIDO);
  }

  setSegundoApellido(segundoApellido) {
    this.ls.set(SEGUNDO_APELLIDO, segundoApellido);
    this.setLastUpdate();
  }

  getSegundoApellido() {
    return this.ls.get(SEGUNDO_APELLIDO);
  }

  // - END -
  setNombre() {
    const nombre = `${this.getPrimerNombre()}${this.getSegundoNombre() && this.getSegundoNombre().trim() ? ' ' + this.getSegundoNombre() : ''} ${this.getPrimerApellido()} ${this.getSegundoApellido()}`;
    this.ls.set(NOMBRE_COMPLETO, nombre);
    this.nombreSubject.next(nombre);
  }

  getNombre() {
    return `${this.getPrimerNombre()}${this.getSegundoNombre() && this.getSegundoNombre().trim() ? ' ' + this.getSegundoNombre() : ''} ${this.getPrimerApellido()} ${this.getSegundoApellido()}`;
  }

  getNombreObs(): Observable<string> {
    return this.nombreSubject.asObservable();
  }

  setDocumento(documento) {
    this.ls.set(NUMERO_DOCUMENTO, documento);
  }

  getDocumento() {
    return this.ls.get(NUMERO_DOCUMENTO);
  }

  setResumenCuenta(resumenCuenta) {
    this.ls.set(RESUMEN_CUENTA, JSON.stringify(resumenCuenta));
  }

  getResumenCuenta() {
    let resumenCuenta = null;
    try {
      resumenCuenta = JSON.parse(this.ls.get(RESUMEN_CUENTA));
    } catch (err) {
    }

    return resumenCuenta;
  }

  setSexo(sexo) {
    this.ls.set(SEXO, sexo);
  }

  getSexo() {
    return this.ls.get(SEXO);
  }

  setTarjeta(tarjeta) {
    this.ls.set(TARJETA, tarjeta);
  }

  getTarjeta() {
    return this.ls.get(TARJETA);
  }

  setTelefono(telefono) {
    this.ls.set(TELEFONO, telefono);
  }

  getTelefono() {
    return this.ls.get(TELEFONO);
  }

  setTipoDocumento(tipoDocumento) {
    this.ls.set(TIPO_DOCUMENTO, tipoDocumento);
  }

  getTipoDocumento() {
    return this.ls.get(TIPO_DOCUMENTO);
  }

  removeToken() {
    localStorage.removeItem('token');
    this.setLastUpdate();
  }

  setToken(token) {
    localStorage.setItem('token', token);
    this.setLastUpdate();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setEmail(email) {
    this.ls.set(EMAIL, email);
    this.setLastUpdate();
  }

  getEmail() {
    return this.ls.get(EMAIL);
  }

  setSolicitudOptionStep(optionStep) {
    localStorage.setItem('optionStep', optionStep);
  }

  getSolicitudOptionStep() {
    return localStorage.getItem('optionStep');
  }

  setIpAddress(ipAddress: string) {
    this.ls.set(IP_ADDRESS, ipAddress);
  }

  getIpAddress(): string {
    return this.ls.get(IP_ADDRESS);
  }
}
