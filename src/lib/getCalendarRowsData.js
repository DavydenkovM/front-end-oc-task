import dateFns from 'date-fns'

// Helper function
//
// Returns the following data structure (month matrix):
// [
//   [{day: new Date(), formattedDate: '31', options: ['calendar-cell--disabled']}, {...}, {...} ],  -- First week of the month
//   [{day: new Date(), formattedDate: '6', options: ['calendar-cell--selected']}, {...}, {...} ],
//   [{day: new Date(), formattedDate: '13', options: []}, {...}, {...} ],
//   ...
//   [{day: new Date(), formattedDate: '27', options: []}, {...}, {...} ],                           -- Last week of the month
// ]

const getCalendarRowsData = (month, selectedDate, dateFormat = "D") => {
  const monthStart = dateFns.startOfMonth(month);
  const monthEnd = dateFns.endOfMonth(monthStart);
  const startDate = dateFns.startOfWeek(monthStart);
  const endDate = dateFns.endOfWeek(monthEnd);
  const currentDate = new Date()

  const rows = [];

  const buildWeekRow = (day, weekRow) => {
    for (let i = 0; i < 7; i++) {
      const formattedDate = dateFns.format(day, dateFormat);

      const options = [];
      if (!dateFns.isSameMonth(day, monthStart)) { options.push('calendar-cell--disabled') }
      if (dateFns.isSameDay(day, selectedDate)) { options.push('calendar-cell--selected') }
      if (dateFns.isSameDay(day, currentDate)) { options.push('calendar-cell--current') }

      weekRow.push( {day: dateFns.parse(day), formattedDate: formattedDate, options: options} )

      day = dateFns.addDays(day, 1);
    }

    return [day, weekRow];
  }

  let weekRow;
  let day = startDate;

  while (day <= endDate) {
    [day, weekRow] = buildWeekRow(day, [])
    rows.push(weekRow);
  }

  return rows;
}

export default getCalendarRowsData;
