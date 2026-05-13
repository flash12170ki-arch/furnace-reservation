import { useState } from "react";
import {
  combineDateAndTime,
  formatDate,
  toDateInputValue,
  toTimeInputValue,
} from "../utils/date";

export default function DatePicker({ label, value, onChange, furnace }) {
  const current = value ? new Date(value) : new Date();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(current);

  const dateText = toDateInputValue(current);
  const timeText = toTimeInputValue(current);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - firstDay.getDay());

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    return d;
  });

  function selectDate(day) {
    onChange(combineDateAndTime(toDateInputValue(day), timeText));
    setOpen(false);
  }

  function changeTime(time) {
    onChange(combineDateAndTime(dateText, time));
  }

  function shift(direction) {
    const d = new Date(value);

    if (furnace === "本焼炉") {
      d.setDate(d.getDate() + direction);
    } else {
      d.setHours(d.getHours() + direction);
    }

    onChange(combineDateAndTime(toDateInputValue(d), toTimeInputValue(d)));
    setViewDate(d);
  }

  return (
    <div className="date-picker-block">
      <span className="label-title">{label}</span>

      <div className="date-row">
        <button
          type="button"
          className="icon-button"
          aria-label={`${label}を戻す`}
          onClick={() => shift(-1)}
        >
          ‹
        </button>

        <button
          type="button"
          className="date-display-button"
          onClick={() => setOpen((v) => !v)}
        >
          {formatDate(value)}
        </button>

        <input
          type="time"
          value={timeText}
          onChange={(e) => changeTime(e.target.value)}
        />

        <button
          type="button"
          className="icon-button"
          aria-label={`${label}を進める`}
          onClick={() => shift(1)}
        >
          ›
        </button>
      </div>

      {open && (
        <div className="date-popover">
          <div className="date-popover-header">
            <button
              type="button"
              className="month-button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
            >
              ‹
            </button>

            <strong>
              {year}年{month + 1}月
            </strong>

            <button
              type="button"
              className="month-button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
            >
              ›
            </button>
          </div>

          <div className="date-week">
            <span>日</span>
            <span>月</span>
            <span>火</span>
            <span>水</span>
            <span>木</span>
            <span>金</span>
            <span>土</span>
          </div>

          <div className="date-grid">
            {days.map((day) => {
              const sameMonth = day.getMonth() === month;
              const selected = toDateInputValue(day) === dateText;
              const today = toDateInputValue(day) === toDateInputValue(new Date());

              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  className={selected ? "date-cell selected" : "date-cell"}
                  data-muted={!sameMonth}
                  data-today={today}
                  onClick={() => selectDate(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
