import React from "react";
import dateFns from "date-fns";
import cn from "classnames";
import SimpleStorage from "react-simple-storage";
import { Tooltip } from 'react-tippy';

import 'react-tippy/dist/tippy.css'

import getCalendarRowsData from './lib/getCalendarRowsData.js'


const Header = (props) => {
  const HEADER_DATE_FORMAT = "MMMM YYYY";

  const [selectedMonth, selectedYear] = dateFns.format(props.currentMonth, HEADER_DATE_FORMAT).split(' ');

  return (
    <div className="calendar-header calendar-row">
      <div className="calendar-left-arrow calendar-col calendar-col-left" onClick={props.prevMonth}>
        <div className="calendar-icon">
          chevron_left
        </div>
      </div>
      <div className="calendar-header-date calendar-col calendar-col-center">
        <span>{selectedMonth}<br />{selectedYear}</span>
      </div>
      <div className="calendar-right-arrow calendar-col calendar-col-right" onClick={props.nextMonth}>
        <div className="calendar-icon">chevron_right</div>
      </div>
    </div>
  );
}

const Week = (props) => {
  const dateFormat = "dddd";
  const days = [];

  const day = new Date();
  const startDate = dateFns.startOfWeek(day);

  for (let i = 0; i < 7; i++) {
    days.push(
      <div className="calendar-col calendar-col-center" key={i}>
        {dateFns.format(dateFns.addDays(startDate, i), dateFormat).substring(0, 2)}
      </div>
    );
  }

  return <div className="calendar-days calendar-row">{days}</div>;
}

const Form = ({onFormSubmit, onInputChange, formState}) => {
  return (
    <form className="event-form" onSubmit={onFormSubmit}>
      <div className="event-form__row">
        <input
          className="event-form__row-item"
          type="text" name="hour"
          placeholder="Hour"
          onChange={onInputChange}
          value={formState.hourText}
        />
        <input
          className="event-form__row-item"
          type="text" name="minute"
          placeholder="Minute"
          onChange={onInputChange}
          value={formState.minuteText}/>
      </div>

      <div className="event-form__row">
        <input
          className="event-form__row-item"
          type="text" name="eventName"
          placeholder="Event Name"
          onChange={onInputChange}
          value={formState.eventNameText}
        />
      </div>

      <div className="event-form__row">
        <div className="event-form__save-btn-wrapper">
          <button
            type="submit"
            className={cn("event-form__row-item", "event-form__save-btn", `${!formState.isFormInputValid && 'event-form__save-btn--disabled'}`)}
            disabled={!formState.isFormInputValid}
          >
            Save
          </button>
        </div>
      </div>
    </form>
  )
}

const Body = ({currentMonth, selectedDate, setTooltipState, isTooltipOpen, onDayClick, enableGrid, children}) => {
  const rows = getCalendarRowsData(currentMonth, selectedDate);

  const renderCell = (dayMeta) => {
    return (
      <div
        className={cn("calendar-col", "calendar-col-center", "calendar-cell", `${enableGrid && 'calendar-cell--with-grid'}`, ...dayMeta.options)}
        key={dayMeta.day}
        onClick={onDayClick(dayMeta.day)}
      >
        <Tooltip
          interactive
          arrow
          unmountHTMLWhenHide
          position="bottom"
          theme="light"
          trigger="click"
          open={isTooltipOpen(dayMeta)}
          onRequestClose={setTooltipState(false, dayMeta.day)}
          html={children}
        >
          <div
            className="calendar-cell-inner"
            onClick={setTooltipState(true, dayMeta.day)}
          >
            <div>{dayMeta.formattedDate}</div>
          </div>
        </Tooltip>
      </div>
    )
  }

  const rowsMarkup = rows.map((row, i) => {
    return (
      <div className={cn("calendar-row", `${enableGrid && 'calendar-row--with-grid'}`)} key={i}>
        { row.map(dayMeta => renderCell(dayMeta, isTooltipOpen)) }
      </div>
    )
  })

  return <div className="calendar-body">{rowsMarkup}</div>;
}

const EventsList = ({eventsListState}) => {
  if (!eventsListState.length) { return null }

  const dateFormatter = (date) => dateFns.format(date, 'D MMMM YYYY HH-mm')

  const eventsListMarkup = eventsListState.map((eventItem, i) =>
    <li className="calendar-event-list__item" key={i}> { dateFormatter(eventItem.day) }: - { eventItem.eventName } </li>)

  return (
    <ul className="calendar-col calendar-event-list">
      { eventsListMarkup }
    </ul>
  )
}

class Calendar extends React.Component {
  static initialState = {
    currentMonth: new Date(),
    selectedDate: new Date(),

    form: { hourText: '', minuteText: '', eventNameText: '', isFormInputValid: false },
    eventsList: [],
    visual: { isTooltipOpen: false, day: null, enableGrid: false }
  };

  constructor(props) {
    super(props)
    this.state = Calendar.initialState;
  }

  static Header = Header;
  static Week = Week;
  static Body = Body;
  static Form = Form;
  static EventsList = EventsList;

  onDayClick = day => () => {
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

    if (
      (name === 'minute' && !value.match(/^[0-5]?[0-9]?$/)) ||
      (name === 'hour' && !value.match(/^([01]?[0-9]?|2?[0-3]?)$/))
    ) {
      this.setState({
        form: {
          ...previousFormState,
        }
      })

      return;
    }

    const newFormState = {...previousFormState, [`${name}Text`]: value};
    const isFormInputValid = (newFormState.hourText && newFormState.minuteText && newFormState.eventNameText) ? true : false;

    this.setState({
      form: {
        ...newFormState,
        isFormInputValid: isFormInputValid
      }
    });
  };

  onFormSubmit = (e) => {
    e.preventDefault();
    /* '>=' is nessasary to add several events with the same hour-minute pair for a given day */
    /* with standard dateFns.isAfter, dateFns.isBefore would be mistake for this case */
    /* Also we should ensure that after deserialization Date string was converted into correct instance of a Date (see simple-storage) */
    /* https://github.com/ryanjyost/react-simple-storage/blob/master/src/index.js#L83 */
    const earlierThan = (eventItem, list) => list.filter(li => dateFns.parse(li.day) < eventItem.day)
    const laterThan = (eventItem, list) => list.filter(li => dateFns.parse(li.day) >= eventItem.day)

    const {
      eventsList: oldEventsList,
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

    const newEventItem = {
      day: eventDate,
      eventName: eventNameText
    }
    const newEventsList = [...earlierThan(newEventItem, oldEventsList), newEventItem, ...laterThan(newEventItem, oldEventsList)]

    const previousVisualState = this.state.visual;

    this.setState({
      form: { hourText: '', minuteText: '', eventNameText: '' },
      eventsList: newEventsList,
      visual: { ...previousVisualState, isTooltipOpen: false, day: eventDate }
    })
  }

  setTooltipState = (isOpen, day) => () => {
    const previousVisualState = this.state.visual;
    this.setState({visual: { ...previousVisualState, isTooltipOpen: isOpen, day: day }})
  }

  flushState = (e) => {
    e.preventDefault();

    this.setState(Calendar.initialState);
  }

  toggleGrid = (e) => {
    e.preventDefault();

    const previousVisualState = this.state.visual;
    this.setState({visual: { ...previousVisualState, enableGrid: !previousVisualState.enableGrid }});
  }

  render() {
    const {
      currentMonth,
      selectedDate,
      visual: visualState,
      form: formState,
      eventsList
    } = this.state;

    return (
      <div className="calendar-container">
        <SimpleStorage parent={this} />

        <div className="calendar">
          <Calendar.Header
            currentMonth={currentMonth}
            prevMonth={this.prevMonth}
            nextMonth={this.nextMonth}
          />
          <Calendar.Week />
          <Calendar.Body
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onDayClick={this.onDayClick}
            enableGrid={visualState.enableGrid}
            isTooltipOpen={(dayMeta) => !!(visualState.isTooltipOpen && dateFns.isSameDay(dayMeta.day, visualState.day))}
            setTooltipState={this.setTooltipState}
          >
            <Calendar.Form
              onFormSubmit={this.onFormSubmit}
              onInputChange={this.onInputChange}
              formState={formState}
            />
          </Calendar.Body>
        </div>

        <div className="calendar-row">
          <Calendar.EventsList
            eventsListState={eventsList}
          />
          <ul className="calendar-controls calendar-col calendar-col-right">
            <li className="flush-state-link" onClick={this.flushState}>Flush State</li>
            <li className="toggle-grid-link" onClick={this.toggleGrid}>Toggle Grid</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Calendar;
