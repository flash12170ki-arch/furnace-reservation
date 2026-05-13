import { useMemo, useState } from "react";
import { getFurnaceClass } from "../constants/furnace";
import {
  formatMonthTitle,
  formatTime,
  getMonthDays,
  isSameDay,
  toDateInputValue,
} from "../utils/date";

export default function CalendarView({ reservations, onEditReservation }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const days = useMemo(() => getMonthDays(viewDate), [viewDate]);
  const viewMonth = viewDate.getMonth();

  function moveMonth(amount) {
    setViewDate((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() + amount, 1);
      return next;
    });
  }

  function goToday() {
    setViewDate(new Date());
  }

  return (
    <section className="card">
      <div className="calendar-heading">
        <h2>カレンダー</h2>
        <div className="calendar-controls">
          <button type="button" onClick={() => moveMonth(-1)}>
            前月
          </button>
          <strong>{formatMonthTitle(viewDate)}</strong>
          <button type="button" onClick={() => moveMonth(1)}>
            翌月
          </button>
          <button type="button" onClick={goToday}>
            今日
          </button>
        </div>
      </div>

      <div className="calendar-week">
        <span>日</span>
        <span>月</span>
        <span>火</span>
        <span>水</span>
        <span>木</span>
        <span>金</span>
        <span>土</span>
      </div>

      <div className="calendar">
        {days.map((day) => {
          const dayReservations = reservations.filter((reservation) =>
            isSameDay(reservation.start_time, day),
          );
          const isCurrentMonth = day.getMonth() === viewMonth;
          const isToday = toDateInputValue(day) === toDateInputValue(new Date());

          return (
            <div
              key={day.toISOString()}
              className="calendar-day"
              data-muted={!isCurrentMonth}
              data-today={isToday}
            >
              <div className="calendar-date">{day.getDate()}</div>

              <div className="calendar-items">
                {dayReservations.map((reservation) => (
                  <button
                    key={reservation.id}
                    type="button"
                    className={`calendar-item ${getFurnaceClass(reservation.furnace)}`}
                    onClick={() => onEditReservation(reservation)}
                  >
                    <strong>{reservation.furnace}</strong>
                    <span className="calendar-user">{reservation.user_name}</span>
                    <span>
                      {formatTime(reservation.start_time)}-{formatTime(reservation.end_time)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
