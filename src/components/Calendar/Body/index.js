import React from "react";
import cn from "classnames";
import getCalendarRowsData from '../../../lib/getCalendarRowsData.js'
import { Tooltip } from 'react-tippy';

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

export default Body;
