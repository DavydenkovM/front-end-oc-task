import dateFns from "date-fns";
import React from "react";

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

export default EventsList;
