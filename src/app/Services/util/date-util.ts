import { Injectable } from '@angular/core';
import { resultMemoize } from '@ngrx/store';
import { formatDate } from '@angular/common';

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

  formatDate(date: any, separator?: string): string {
    let result: string = "";
    if (date != null)
    {

     let date2 = new Date(date); 
    let d: number = date2.getDate();
    let m: string = '0' + (date2.getMonth() + 1).toString().slice(-2);
    let y: number = date2.getFullYear();
    if(m.length == 3){
      m = m.slice(1);
    }
    if (separator) {
      result = `${d}${separator}${m}${separator}${y}`;
    } else {
      result = `${d}/${m}/${y}`;
    }
  }

    return result;
  }
}
