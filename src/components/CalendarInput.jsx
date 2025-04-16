
import React, { forwardRef } from "react";
import iconCalendar from "../assets/calendar.png";


const CalendarInput = forwardRef(({ value, onClick, placeholder }, ref) => {
  return (
    <div className="icon-input" onClick={onClick} ref={ref}>
      <div className="icon-block">
        <img src={iconCalendar} alt="Calendar Icon" />
      </div>
      {/* readOnly text field so user types can't conflict with the datepicker */}
      <input
        type="text"
        readOnly
        placeholder={placeholder || "mm/dd/yyyy"}
        value={value || ""}
        style={{ cursor: "pointer" }}
      />
    </div>
  );
});

export default CalendarInput;
