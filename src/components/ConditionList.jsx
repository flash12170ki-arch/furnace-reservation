import { formatDateTime } from "../utils/date";

export default function ConditionList({
  users,
  reservations,
  userFilter,
  onUserFilterChange,
  onEditReservation,
  onDeleteReservation,
}) {
  const filteredConditions = reservations
    .filter((reservation) => reservation.furnace === "本焼炉")
    .filter((reservation) => {
      if (userFilter === "全員") return true;
      const names = reservation.user_names ?? [];
      return names.includes(userFilter);
    });

  return (
    <section className="card">
      <div className="section-heading">
        <h2>本焼条件一覧</h2>
        <label className="filter-label">
          使用者
          <select value={userFilter} onChange={(e) => onUserFilterChange(e.target.value)}>
            <option value="全員">全員</option>
            {users.map((user) => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="condition-list">
        {filteredConditions.map((reservation) => (
          <article key={reservation.id} className="condition-card">
            <div>
              <strong>{reservation.user_name}</strong>
              <span>{formatDateTime(reservation.start_time)}</span>
            </div>

            <dl>
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
              <div>
                <dt>範囲</dt>
                <dd>
                  {reservation.anneal_mode === "キープ"
                    ? `${reservation.anneal_keep_temp ?? "-"} ℃`
                    : `${reservation.anneal_start_temp ?? "-"} → ${
                        reservation.anneal_end_temp ?? "-"
                      } ℃`}
                </dd>
              </div>
              <div>
                <dt>時間</dt>
                <dd>{reservation.anneal_hours ?? "-"} h</dd>
              </div>
            </dl>

            {reservation.sample_slots?.some(Boolean) && (
              <div className="condition-samples" aria-label="割当試料">
                {reservation.sample_slots.filter(Boolean).slice(0, 12).map((sample, index) => (
                  <span key={`${sample}-${index}`} title={sample}>
                    {sample}
                  </span>
                ))}
              </div>
            )}

            <div className="condition-actions">
              <button type="button" onClick={() => onEditReservation(reservation)}>
                編集
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={() => onDeleteReservation(reservation.id)}
              >
                削除
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
