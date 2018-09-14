import React from "react";
import dateFns from "date-fns";
import 'react-tippy/dist/tippy.css'
import { Tooltip } from 'react-tippy';

// Should be configured in the config file
const HEADER_DATE_FORMAT = "MMMM YYYY";

class Calendar extends React.Component {
  state = {
    currentMonth: new Date(),
    selectedDate: new Date(),

    form: { hourText: '', minuteText: '', eventNameText: '' },
    eventList: [],
    visual: {}
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

    const startDate = dateFns.startOfWeek(this.state.currentMonth);

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

  renderCells() {
    const {currentMonth, selectedDate} = this.state;
    const rows = this._buildCalendarRowsData(currentMonth, selectedDate);

    const rowsMarkup = rows.map((row, i) => {
      return (
        <div className="calendar-row" key={i}>
          {
            row.map( dayMeta => {
              const open = !!(this.state.visual.isToolTipOpen && dateFns.isSameDay(dayMeta.day, this.state.visual.day));
              return (
                <div className={`calendar-col calendar-col-center calendar-cell ${dayMeta.options.join(' ')}` }
                     key={dayMeta.day}
                     onClick={this.onDateClick(dayMeta.day)}
                >
                  <Tooltip
                    interactive
                    arrow
                    unmountHTMLWhenHide
                    position="bottom"
                    theme="light"
                    trigger="click"
                    open={open}
                    onRequestClose={() => {this.setIsOpen(false, dayMeta.day)}}
                    html={this.renderForm()}
                  >
                    <div className="calendar-cell-inner" onClick={() => {this.setIsOpen(true, dayMeta.day) }}><div>{dayMeta.formattedDate}</div></div>
                  </Tooltip>
                </div>
              )
            })
          }
        </div>
      )
    })

    return <div className="calendar-body">{rowsMarkup}</div>;
  }

  renderForm() {
    return (
      <form className="event-form" onSubmit={this.onFormSubmit}>
        <div className="event-form__row">
          <input className="event-form__row-item" type="text" name="hour" placeholder="Hour" onChange={this.onInputChange} value={this.state.form.hourText}/>
          <input className="event-form__row-item" type="text" name="minute" placeholder="Minute" onChange={this.onInputChange} value={this.state.form.minuteText}/>
        </div>

        <div className="event-form__row">
          <input className="event-form__row-item" type="text" name="eventName" placeholder="Event Name" value={this.state.form.eventNameText} onChange={this.onInputChange}/>
        </div>

        <div className="event-form__row">
          <div className="event-form__save-btn-wrapper">
            <button type="submit" className="event-form__row-item event-form__save-btn">Save</button>
          </div>
        </div>
      </form>
    )
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

  onInputChange = (e) => {
    const { type, checked, name, value: targetValue  } = e.target
    const value = type === 'checkbox' ? checked : targetValue;

    const previousFormState = this.state.form

    this.setState({
      form: {
        ...previousFormState,
        [`${name}Text`]: value
      }
    });
  };

  onFormSubmit = (e) => {
    e.preventDefault();
    /* '>=' is nessasary to add several events with the same hour-minute pair for a given day */
    /* with standard dateFns.isAfter, dateFns.isBefore would be mistake for this case */
    const earlierThan = (eventItem, list) => list.filter(li => li.day < eventItem.day)
    const laterThan = (eventItem, list) => list.filter(li => li.day >= eventItem.day)

    const {
      eventList: oldEventList,
      selectedDate,
      currentMonth: selectedMonth,
      form: {hourText, minuteText, eventNameText}
    } = this.state;

    const eventDate = new Date(
      dateFns.getYear(selectedMonth),
      dateFns.getMonth(selectedMonth),
      dateFns.getDate(selectedDate),
      parseInt(hourText, 10),
      parseInt(minuteText, 10),
    );

    // if (eventDate == 'Invalid Date') { return null };

    const newEventItem = {
      day: eventDate,
      eventName: eventNameText
    }
    const newEventList = [...earlierThan(newEventItem, oldEventList), newEventItem, ...laterThan(newEventItem, oldEventList)]

    this.setState({
      form: { hourText: '', minuteText: '', eventNameText: '' },
      eventList: newEventList,
      visual: { isToolTipOpen: false, day: eventDate }
    })
  }

  setIsOpen = (isOpen, day) => {
    this.setState({visual: { isToolTipOpen: isOpen, day: day }})
  }

  renderEventsList() {
    if (!this.state.eventList.length) { return null }

    const dateFormatter = (date) => dateFns.format(date, 'D MMMM YYYY HH-mm')

    const eventsListMarkup = this.state.eventList.map((eventItem, i) =>
      <li className="calendar-event-list__item" key={i}> { dateFormatter(eventItem.day) }: - { eventItem.eventName } </li>)

    return (
      <ul className="calendar-event-list">
        { eventsListMarkup }
      </ul>
    )
  }

  render() {
    return (
      <div className="calendar-container">
        <div className="calendar">
          {this.renderHeader()}
          {this.renderDays()}
          {this.renderCells()}
        </div>

        {this.renderEventsList()}
      </div>
    );
  }
}

export default Calendar;
