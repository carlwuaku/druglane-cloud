
/**
 * get the date of the first sunday of the week
 * @param {number} weekNum the week number in the year
 * @param {number} year the current year
 * @returns  {Date} the date of the first day of the week
 */
export function getFirstDayOfWeek(weekNum: number, year: number): Date {
  let firstDay = new Date(year, 0, (1 + (weekNum - 1) * 7));
  while (firstDay.getDay() !== 0) {
    firstDay.setDate(firstDay.getDate() - 1);
  }
  return firstDay;
}

/**
 * add a number of days to a given date and return the
 * new date
 */
export function addDaystoDate(days: number, date: string): Date {
  let dat = new Date(date);
  dat.setDate(dat.getDate() + days);
  return dat;
}

/**
 * format the datetime and return the string without the T
 * e.g. 2022-11-15T04:05:00 -> 2022-11-15 04:05:00
 * @param {string} date the date
 * @returns {string}
 */
export function formatDateTime(date: string): string {
  return (new Date(date)).toISOString().slice(0, 19).replace("T", " ");

}

/**
 * format a date and return the string representation. timestamp = yyyy-mm-dd hh-ii-ss
 * timestamp_string = yyyymmddhhiiss
 * month = mm
 * default = yyyy-mm-dd
 * @param type string a format type. options are timestamp, timestamp_string, month, or empty string ''
 * @param date
 * @returns {string}
 */
export function getToday(type: 'timestamp' | 'timestamp_string' | 'month' | '' = '', date: string | Date | null = null): string {
  let today = new Date();
  if (date != null) {
    today = new Date(date);
  }

  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!

  let yyyy = today.getFullYear();
  let dd_string
  if (dd < 10) {
    dd_string = '0' + dd;
  }
  else {
    dd_string = dd.toString()
  }



  let mm_string
  if (mm < 10) {
    mm_string = '0' + mm;
  }
  else {
    mm_string = mm.toString()
  }
  let hrs = "", mins = "", secs = "";
  switch (type) {
    case "timestamp":
      hrs = padZero(today.getHours());
      mins = padZero(today.getMinutes());
      secs = padZero(today.getSeconds());
      return yyyy + '-' + mm_string + '-' + dd_string + ' ' + hrs + ':' + mins + ':' + secs;

    case "timestamp_string":
      hrs = padZero(today.getHours());
      mins = padZero(today.getMinutes());
      secs = padZero(today.getSeconds());
      return yyyy + '' + mm_string + '' + dd_string + '' + hrs + '' + mins + '' + secs;

    case "month":
      return mm_string;
    default:
      return yyyy + '-' + mm_string + '-' + dd_string;
  }



  // mm_string+'/'+dd_string+'/'+yyyy;
}

/**
 * add a zero to a month number up to 2 digits
 * @param m string the month number as a string or int
 * @returns string
 */
export function padZero(m: string | number): string {
  let str = m.toString();
  return str.padStart(2, "0");

}

/**
 * get the name of the month using the number
 * @param m the month number. January is 1, december is 12
 * @returns
 */
export function getMonthName(m: number): string {
  try {
    let monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    if (monthNames[m - 1] == undefined) {
      throw new Error("Number not found")
    }
    return monthNames[m - 1]
  } catch (error) {
    throw new Error("Number not found")
  }

}

/**
 * get the name of a day using the number
 * @param {number} d the day number. sunday is 0... saturday is 6
 * @returns {string}
 */
export function getDayName(d: number): string {
  try {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (days[d] == undefined) {
      throw new Error("Number not found")
    }
    return days[d]
  } catch (error) {
    throw new Error("Number not found")
  }
}

/**
 * get the list of month names
 * @returns {string[]}
 */
export function getMonths(): string[] {
  return ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
}

/**
 * get the list of days starting from sunday
 * @returns {string[]} the list of day names starting from Sunday
 */
export function getDays(): string[] {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}


/**
 * get the ordinal of a number. e.g. 1st, 2nd, 3rd, 4th
 * @param {number} d the day number
 * @returns {string}
 */
export function nth(d: number): string {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};


/**
 * get the list of days between 2 specified dates
 * @param {string|Date} startDate the start date - string or date
 * @param {string | Date} stopDate the end date - string or date
 * @returns {string[]}
 */
export function getDatesBetween(startDate: string | Date, stopDate: string | Date): string[] {
  let dateArray: string[] = [];
  let currentDate = typeof (startDate) == 'string' ? new Date(startDate) : startDate;
  let endDate = typeof (stopDate) == 'string' ? new Date(stopDate) : stopDate;
  while (currentDate <= endDate) {
    dateArray.push(getToday('', currentDate))
    currentDate = new Date(currentDate.getDate() + 1);
  }
  return dateArray;
}

/**
 * return the list of months from January to December as objects with id, name
 * @returns {Month[]}
 */
export function getMonthsObjects(): Month[] {
  let months: Month[] = []
  months.push({ id: "01", name: 'January' });
  months.push({ id: "02", name: 'February' });
  months.push({ id: "03", name: 'March' });
  months.push({ id: "04", name: 'April' });
  months.push({ id: "05", name: 'May' });
  months.push({ id: "06", name: 'June' });
  months.push({ id: "07", name: 'July' });
  months.push({ id: "08", name: 'August' });
  months.push({ id: "09", name: 'September' });
  months.push({ id: "10", name: 'October' });
  months.push({ id: "11", name: 'November' });
  months.push({ id: "12", name: 'December' });

  return months;
}




//remove the 0's from the month ids
/**
 * get the list of month objects but with no zero padding for the id
 * @returns {Month[]}
 */
export function getMonthsNoPad(): Month[] {
  let months: Month[] = []
  months.push({ id: "1", name: 'January' });
  months.push({ id: "2", name: 'February' });
  months.push({ id: "3", name: 'March' });
  months.push({ id: "4", name: 'April' });
  months.push({ id: "5", name: 'May' });
  months.push({ id: "6", name: 'June' });
  months.push({ id: "7", name: 'July' });
  months.push({ id: "8", name: 'August' });
  months.push({ id: "9", name: 'September' });
  months.push({ id: "10", name: 'October' });
  months.push({ id: "11", name: 'November' });
  months.push({ id: "12", name: 'December' });

  return months;
}

/**
 * get the number of years past from the given date
 * @param dateString the date of birth
 * @returns {number} the number of years up to today
 */
export function getAge(dateString: string): number {
  let today = new Date();
  let birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * get the day component of the ending date of the month
* @param monthNumber January = 1, December  = 12
 * @returns {Number}
 */
export function getLastDayOfMonth(monthNumber: number | string): number {
  let month = typeof (monthNumber) == 'string' ? parseInt(monthNumber) : monthNumber;
  let thirty_days = [9, 4, 6, 11];
  if (month == 2) {

    return 28;
  }
  else if (thirty_days.indexOf(month) != -1) {
    return 30;
  }
  else {
    return 31;
  }
}



/**
 * get the current year
 * @returns {number}
 */
export function getThisYear(): number {
  return new Date().getFullYear();


}


/**
 * check if date1 is before, after or same as date2. date2 defaults to current day
 * @param date1 the first date
 * @param date2 the second date
 * @returns {string} 'before'|'after'|'same'
 */
export function compareDates(date1: string | Date, date2?: string | Date): 'before' | 'after' | 'same' {
  let d1 = new Date(date1);
  let d2 = date2 == undefined ? new Date() : new Date(date2);


  if (d1 < d2) {
    return 'before';
  }
  else if (d1 > d2) {
    return 'after'
  }
  else {
    return 'same'
  }
}

/**
 * get the number of days, seconds, minutes between 2 dates
 * @param {string} date1 the date we're interested in
 * @param {string} date2 defaults to the current day
 * @param {string} format defaults to seconds. could be days, minutes, seconds
 * @returns {number} the number of {format}s between the dats
 */
export function timeBetweenDates(date1: string, date2: string = '', format = 'seconds'): number {
  let d1 = new Date(date1);
  let d2 = new Date();
  if (date2 != '') {
    d2 = new Date(date2);
  }
  switch (format) {
    case 'days':
      return (d1.getTime() - d2.getTime() / (1000 * 60 * 60 * 24))
    case 'minutes':
      return (d1.getTime() - d2.getTime() / (1000 * 60 * 60))
    case 'seconds':
    default:
      return (d1.getTime() - d2.getTime()) / 1000


  }

}


/**
 * format a date
 * @param today the date
 * @param type one of 'timestamp' | 'timestamp_string' | 'month' | ''
 * @returns {string}
 */
export function formatDate(today: string | Date, type: 'timestamp' | 'timestamp_string' | 'month' | '' = ''): string {
  return getToday(type, today)

}

/**
 * subtract a period from a date and return the new date
 * @param date a date to subtract from
 * @param period years,months, days,hours,minutes,seconds
 * @param duration the number of period to subtract
 * @returns {Date}
 */
export function subtractTimePeriod(date: string | Date,
  period: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds',
  duration: number): Date {
  date = typeof (date) == 'string' ? new Date(date) : date;
  switch (period) {
    case "years":
      return new Date(date.setFullYear(date.getFullYear() - duration))
    case "months":
      return new Date(date.setMonth(date.getMonth() - duration))
    case "hours":
      return new Date(date.setHours(date.getHours() - duration))
    case "minutes":
      return new Date(date.setMinutes(date.getMinutes() - duration))
    case "seconds":
      return new Date(date.setSeconds(date.getSeconds() - duration))
    case "days":
    default:
      return new Date(date.setDate(date.getDate() - duration))


  }

}


/**
 * subtract a period from a date and return the new date
 * @param date a date to add to
 * @param period years,months, days,hours,minutes,seconds
 * @param duration the number of period to subtract
 * @returns {Date}
 */
export function addTimePeriod(date: string | Date,
  period: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds',
  duration: number): Date {
  date = typeof (date) == 'string' ? new Date(date) : date;
  switch (period) {
    case "years":
      return new Date(date.setFullYear(date.getFullYear() - duration))
    case "months":
      return new Date(date.setMonth(date.getMonth() - duration))
    case "hours":
      return new Date(date.setHours(date.getHours() - duration))
    case "minutes":
      return new Date(date.setMinutes(date.getMinutes() - duration))
    case "seconds":
      return new Date(date.setSeconds(date.getSeconds() - duration))
    case "days":
    default:
      return new Date(date.setDate(date.getDate() - duration))


  }

}

/**
 * get the week number of the current date or provided date
 * @param _date optional
 */
export function getWeekNumber(_date?: string | Date): number {
  const currentDate = !_date ? new Date() : new Date(_date);
  Date.now()
  const oneJan = new Date(currentDate.getFullYear(), 0, 1);//1st jan for the year
  let numberOfDays = Math.floor((currentDate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil(numberOfDays / 7)
}


/**
 *   get the start and end dates
 * @param {String} quick_option
 * @returns {Object} {start_date, end_date}
 */
export function setDates(quick_option: string): startEndDates {
  const today = new Date();
  let this_week_number = getWeekNumber(today);
  let this_year = getThisYear();
  let last_year = this_year - 1;
  let this_month = today.getMonth();//0-11
  let last_month = this_month == 0 ? 12 : this_month - 1;
  let next_month = this_month == 11 ? 1 : this_month + 1;
  let start_date;
  let end_date;
  switch (quick_option) {
    case "all":
      start_date = formatDate(new Date(2015, 0, 1));
      end_date = getToday();
      break;
    case "today":
      start_date = getToday();
      end_date = getToday();
      break;
    case "yesterday":
      start_date = formatDate(addDaystoDate(-1, getToday()));
      end_date = formatDate(addDaystoDate(-1, getToday()));
      break;
    case "this_week":
      start_date = formatDate(getFirstDayOfWeek(this_week_number, this_year));
      end_date = formatDate(addDaystoDate(6, start_date));
      break;
    case "last_week":
      //because this can go into the previous year, we still get that for this week and add some days to it

      start_date = formatDate(addDaystoDate(-6, formatDate(getFirstDayOfWeek(this_week_number, this_year))));
      end_date = formatDate(addDaystoDate(6, start_date));
      break;
    case "next_week":
      start_date = formatDate(addDaystoDate(6, formatDate(getFirstDayOfWeek(this_week_number, this_year))));
      end_date = formatDate(addDaystoDate(6, start_date));
      break;
    case "this_month":
      start_date = formatDate(new Date(this_year, this_month, 1));
      end_date = formatDate(new Date(this_year, this_month, getLastDayOfMonth(this_month)));
      break;
    case "last_month":
      start_date = formatDate(new Date(new Date(this_year, this_month, 1).setMonth(this_month - 1)));
      end_date = formatDate(new Date(new Date(this_year, this_month, getLastDayOfMonth(last_month)).setMonth(this_month - 1)));
      break;
    case "next_month":

      start_date = formatDate(new Date(new Date(this_year, this_month, 1).setMonth(this_month + 1)));
      end_date = formatDate(new Date(new Date(this_year, this_month, getLastDayOfMonth(next_month)).setMonth(this_month + 1)));

      break;
    case "first_quarter":
      start_date = formatDate(new Date(this_year, 0, 1));
      end_date = formatDate(new Date(this_year, 2, 31));
      break;
    case "second_quarter":
      start_date = formatDate(new Date(this_year, 3, 1));
      end_date = formatDate(new Date(this_year, 5, 30));
      break;
    case "third_quarter":
      start_date = formatDate(new Date(this_year, 6, 1));
      end_date = formatDate(new Date(this_year, 8, 30));
      break;
    case "last_quarter":
      start_date = formatDate(new Date(this_year, 9, 1));
      end_date = formatDate(new Date(this_year, 11, 31));
      break;
    case "this_year":
      start_date = formatDate(new Date(this_year, 0, 1));
      end_date = formatDate(new Date(this_year, 11, 31));
      break;
    case "last_year":
      start_date = formatDate(new Date(last_year, 0, 1));
      end_date = formatDate(new Date(last_year, 11, 31));
      break;
    default:

      start_date = getToday();
      end_date = getToday();
      break;
  }

  return { "startDate": start_date, "endDate": end_date };

}
interface Month {
  id: string;
  name: string;
}

interface startEndDates {
  startDate: string | Date;
  endDate: string | Date;
}
