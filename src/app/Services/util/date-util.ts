import { Injectable } from '@angular/core';


@Injectable()
export class DateUtil {
 
  constructor(){  }


  currentDate() {
    const currentDate = new Date();
    return currentDate.toISOString().substring(0, 10);
  }

  currentMonthAgo() {
    let now = new Date();
    let monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);
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
 
}
