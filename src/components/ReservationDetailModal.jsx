import { formatDateTime } from "../utils/date";

export default function ReservationDetailModal({
  reservation,
  onClose,
  onEditReservation,
}) {
  if (!reservation) return null;

  return (
    <div className="calendar-popover-backdrop" onClick={onClose}>
      <article className="calendar-popover" onClick={(event) => event.stopPropagation()}>
        <div className="calendar-popover-header">
          <div>
            <strong>{reservation.furnace}</strong>
            <span>{reservation.user_name}</span>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <dl className="calendar-popover-details">
          <div>
            <dt>開始</dt>
            <dd>{formatDateTime(reservation.start_time)}</dd>
          </div>
          <div>
            <dt>終了</dt>
            <dd>{formatDateTime(reservation.end_time)}</dd>
          </div>
          {reservation.furnace === "仮焼炉" && (
            <div>
              <dt>時間帯</dt>
              <dd>{reservation.calcine_slot ?? "-"}</dd>
            </div>
          )}
          {reservation.furnace === "本焼炉" && (
            <>
              <div>
                <dt>酸素分圧</dt>
                <dd>{reservation.oxygen_pressure ?? "-"} Pa</dd>
              </div>
              <div>
                <dt>温度</dt>
                <dd>{reservation.firing_temperature ?? "-"} ℃</dd>
              </div>
              <div>
                <dt>時間</dt>
                <dd>
                  {reservation.firing_time_value ?? "-"}
                  {reservation.firing_time_unit ?? ""}
                </dd>
              </div>
              <div>
                <dt>アニール</dt>
                <dd>{reservation.anneal_mode ?? "-"}</dd>
              </div>
            </>
          )}
        </dl>

        {reservation.sample_slots?.some(Boolean) && (
          <div className="calendar-popover-samples">
            {reservation.sample_slots.filter(Boolean).map((sample, index) => (
              <span key={`${sample}-${index}`} title={sample}>
                {sample}
              </span>
            ))}
          </div>
        )}

        {reservation.memo && <p className="calendar-popover-memo">{reservation.memo}</p>}

        <button type="button" className="primary-button" onClick={() => onEditReservation(reservation)}>
          編集
        </button>
      </article>
    </div>
  );
}
