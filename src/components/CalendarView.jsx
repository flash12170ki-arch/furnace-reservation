import { useMemo, useState } from "react";
import { getFurnaceClass } from "../constants/furnace";
import {
  formatDateTime,
  formatMonthTitle,
  formatTime,
  getMonthDays,
  isSameDay,
  toDateInputValue,
} from "../utils/date";

export default function CalendarView({
  reservations,
  onEditReservation,
  onDeleteReservation,
  onCreateReservationOnDate,
}) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedReservation, setSelectedReservation] = useState(null);
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

      <div className="calendar-scroll">
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
                role="button"
                tabIndex="0"
                onClick={() => onCreateReservationOnDate(day)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    onCreateReservationOnDate(day);
                  }
                }}
              >
                <div className="calendar-date">{day.getDate()}</div>

                <div className="calendar-items">
                  {dayReservations.map((reservation) => (
                    <button
                      key={reservation.id}
                      type="button"
                    className={`calendar-item ${getFurnaceClass(reservation.furnace)}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedReservation(reservation);
                      }}
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
      </div>

      {selectedReservation && (
        <div className="calendar-popover-backdrop" onClick={() => setSelectedReservation(null)}>
          <article className="calendar-popover" onClick={(event) => event.stopPropagation()}>
            <div className="calendar-popover-header">
              <div>
                <strong>{selectedReservation.furnace}</strong>
                <span>{selectedReservation.user_name}</span>
              </div>
              <button type="button" onClick={() => setSelectedReservation(null)}>
                ×
              </button>
            </div>

            <dl className="calendar-popover-details">
              <div>
                <dt>開始</dt>
                <dd>{formatDateTime(selectedReservation.start_time)}</dd>
              </div>
              <div>
                <dt>終了</dt>
                <dd>{formatDateTime(selectedReservation.end_time)}</dd>
              </div>
              {selectedReservation.furnace === "仮焼炉" && (
                <div>
                  <dt>時間帯</dt>
                  <dd>{selectedReservation.calcine_slot ?? "-"}</dd>
                </div>
              )}
              {selectedReservation.furnace === "本焼炉" && (
                <>
                  <div>
                    <dt>酸素分圧</dt>
                    <dd>{selectedReservation.oxygen_pressure ?? "-"} Pa</dd>
                  </div>
                  <div>
                    <dt>温度</dt>
                    <dd>{selectedReservation.firing_temperature ?? "-"} ℃</dd>
                  </div>
                  <div>
                    <dt>時間</dt>
                    <dd>
                      {selectedReservation.firing_time_value ?? "-"}
                      {selectedReservation.firing_time_unit ?? ""}
                    </dd>
                  </div>
                  <div>
                    <dt>アニール</dt>
                    <dd>{selectedReservation.anneal_mode ?? "-"}</dd>
                  </div>
                </>
              )}
            </dl>

            {selectedReservation.sample_slots?.some(Boolean) && (
              <div className="calendar-popover-samples">
                {selectedReservation.sample_slots.filter(Boolean).map((sample, index) => (
                  <span key={`${sample}-${index}`} title={sample}>
                    {sample}
                  </span>
                ))}
              </div>
            )}

            {selectedReservation.memo && (
              <p className="calendar-popover-memo">{selectedReservation.memo}</p>
            )}

            <div className="calendar-popover-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => onEditReservation(selectedReservation)}
              >
                編集
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={async () => {
                  const reservation = selectedReservation;
                  setSelectedReservation(null);
                  await onDeleteReservation(reservation.id);
                }}
              >
                予約削除
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
