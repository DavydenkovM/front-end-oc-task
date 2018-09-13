import React from "react";
import dateFns from "date-fns";

// Should be configured in the config file
const HEADER_DATE_FORMAT = "MMMM YYYY";

class Calendar extends React.Component {
  state = {
    currentMonth: new Date(),
    selectedDate: new Date()
  };

  renderHeader() {
    const [selectedMonth, selectedYear] = dateFns.format(this.state.currentMonth, HEADER_DATE_FORMAT).split(' ');

    return (
      <div className="calendar-header calendar-row">
        <div className="calendar-left-arrow calendar-col calendar-col-left">
          <div className="calendar-icon" onClick={this.prevMonth}>
            chevron_left
          </div>
        </div>
        <div className="calendar-header-date calendar-col calendar-col-center">
          <span>{selectedMonth}<br />{selectedYear}</span>
        </div>
        <div className="calendar-right-arrow calendar-col calendar-col-right" onClick={this.nextMonth}>
          <div className="calendar-icon">chevron_right</div>
        </div>
      </div>
    );
  }

  renderDays() {
    const dateFormat = "dddd";
    const days = [];

    let startDate = dateFns.startOfWeek(this.state.currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="calendar-col calendar-col-center" key={i}>
          {dateFns.format(dateFns.addDays(startDate, i), dateFormat).substring(0,2) }
        </div>
      );
    }

    return <div className="calendar-days calendar-row">{days}</div>;
  }

  // Helper function
  //
  // Returns the following data structure (month matrix):
  // [
  //   [{day: new Date(), formattedDate: '31', options: ['calendar-cell--disabled']}, {...}, {...} ],  -- First week
  //   [{day: new Date(), formattedDate: '6', options: ['calendar-cell--selected']}, {...}, {...} ],
  //   [{day: new Date(), formattedDate: '13', options: []}, {...}, {...} ],
  //   ...
  //   [{day: new Date(), formattedDate: '27', options: []}, {...}, {...} ],                           -- Last week
  // ]

  _buildCalendarRowsData = (month, selectedDate, dateFormat = "D") => {
    const monthStart = dateFns.startOfMonth(month);
    const monthEnd = dateFns.endOfMonth(monthStart);
    const startDate = dateFns.startOfWeek(monthStart);
    const endDate = dateFns.endOfWeek(monthEnd);
    const currentDate = new Date()

    const rows = [];

    const buildWeekRow = (day, weekRow) => {
      for (let i = 0; i < 7; i++) {
        let formattedDate = dateFns.format(day, dateFormat);

        let options = [];
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

  renderCells() {
    const {currentMonth, selectedDate} = this.state;
    let rows = this._buildCalendarRowsData(currentMonth, selectedDate);

    let rowsMarkup = rows.map((row, i) => {
      return (
        <div className="calendar-row" key={i}>
          {
            row.map( dayMeta => {
              return (
                <div className={`calendar-col calendar-col-center calendar-cell ${dayMeta.options.join(' ')}` }
                     key={dayMeta.day}
                     onClick={this.onDateClick(dayMeta.day)}
                >
                  <div className="calendar-cell-inner">{dayMeta.formattedDate}</div>
                </div>
              )
            })
          }
        </div>
      )
    })

    return <div className="calendar-body">{rowsMarkup}</div>;
  }

  onDateClick = day => () => {
    this.setState({
      selectedDate: day
    });
  };

  nextMonth = () => {
    this.setState({
      currentMonth: dateFns.addMonths(this.state.currentMonth, 1)
    });
  };

  prevMonth = () => {
    this.setState({
      currentMonth: dateFns.subMonths(this.state.currentMonth, 1)
    });
  };

  render() {
    return (
      <div className="calendar-container">
        <div className="calendar">
          {this.renderHeader()}
          {this.renderDays()}
          {this.renderCells()}
        </div>
      </div>
    );
  }
}

export default Calendar;
