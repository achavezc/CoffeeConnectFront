import { Injectable } from '@angular/core';
import { resultMemoize } from '@ngrx/store';

@Injectable()
export class DateUtil {

  constructor() { }

  currentDate() {
    const currentDate = new Date();
    return currentDate.toISOString().substring(0, 10);
  }

  currentMonthAgo() {
    let now = new Date();
    let monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 12);
    return monthAgo.toISOString().substring(0, 10);
  }

  restarAnio(startYear, endYear) {
    var years = [];
    startYear = startYear || 1980;
    while (startYear <= endYear) {
      years.push(startYear++);
    }
    return years.length;
  }

  formatDate(date: Date, separator?: string): string {
    let result: string;
    let d: number = date.getDate();
    let m: string = '0' + (date.getMonth() + 1).toString().slice(-2);
    let y: number = date.getFullYear();
    if(m.length == 3){
      m = m.slice(1);
    }
    if (separator) {
      result = `${d}${separator}${m}${separator}${y}`;
    } else {
      result = `${d}/${m}/${y}`;
    }

    return result;
  }

}
