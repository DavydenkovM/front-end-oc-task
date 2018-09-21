import React from "react";
import dateFns from "date-fns";

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

export default Header;
