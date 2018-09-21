import React from "react";
import dateFns from "date-fns";
import SimpleStorage from "react-simple-storage";

import Header from './Header';
import Week from './Week';
import Body from './Body';
import Form from './Form';
import EventsList from './EventsList';

import './index.css';
import 'react-tippy/dist/tippy.css';

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
