import dateFns from 'date-fns';
import React from 'react';

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

export default Week;
