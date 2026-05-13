import DatePicker from "./DatePicker";
import SampleGrid from "./SampleGrid";
import UserSelector from "./UserSelector";
import { ANNEAL_HOUR_OPTIONS, FURNACES, OXYGEN_PRESSURE_OPTIONS } from "../constants/furnace";
import { combineDateAndTime, toDateInputValue, toTimeInputValue } from "../utils/date";
import { cycleValue } from "../utils/reservation";

export default function FurnaceForm({
  form,
  users,
  samples,
  loading,
  newUserName,
  newSampleName,
  sampleOwnerName,
  selectedSlot,
  onSubmit,
  onUpdateForm,
  onResetForm,
  onRegisterUser,
  onRemoveUser,
  onNewUserNameChange,
  onRegisterSample,
  onNewSampleNameChange,
  onSampleOwnerNameChange,
  onEditSample,
  onDeleteSample,
  onSelectSlot,
  onSetSampleSlot,
  onCloseSlot,
}) {
  function applyCalcineSlot(slot) {
    const base = new Date(form.start_time);
    const start = new Date(base);
    const end = new Date(base);

    if (slot === "午前") {
      start.setHours(9, 0, 0, 0);
      end.setHours(12, 0, 0, 0);
    } else {
      start.setHours(15, 0, 0, 0);
      end.setHours(18, 0, 0, 0);
    }

    onUpdateForm({
      calcine_slot: slot,
      start_time: combineDateAndTime(toDateInputValue(start), toTimeInputValue(start)),
      end_time: combineDateAndTime(toDateInputValue(end), toTimeInputValue(end)),
    });
  }

  return (
    <section className="card">
      <div className="form-heading">
        <h2>{form.id ? "予約編集" : "新しい予約"}</h2>
        <button type="button" onClick={onResetForm}>
          新規予約
        </button>
      </div>

      <form onSubmit={onSubmit} className="form">
        <label>
          炉
          <select
            value={form.furnace}
            onChange={(e) => onUpdateForm({ furnace: e.target.value })}
          >
            {FURNACES.map((furnace) => (
              <option key={furnace} value={furnace}>
                {furnace}
              </option>
            ))}
          </select>
        </label>

        {form.furnace === "仮焼炉" && (
          <div className="field-block">
            <span className="label-title">仮焼炉の時間帯</span>
            <div className="button-row">
              <button
                type="button"
                className={form.calcine_slot === "午前" ? "choice active" : "choice"}
                onClick={() => applyCalcineSlot("午前")}
              >
                午前
              </button>
              <button
                type="button"
                className={form.calcine_slot === "午後" ? "choice active" : "choice"}
                onClick={() => applyCalcineSlot("午後")}
              >
                午後
              </button>
            </div>
          </div>
        )}

        <div className="date-pair">
          <DatePicker
            label="開始日時"
            value={form.start_time}
            furnace={form.furnace}
            onChange={(value) => onUpdateForm({ start_time: value })}
          />

          <DatePicker
            label="終了日時"
            value={form.end_time}
            furnace={form.furnace}
            onChange={(value) => onUpdateForm({ end_time: value })}
          />
        </div>

        <UserSelector
          users={users}
          selectedUsers={form.user_names}
          newUserName={newUserName}
          onNewUserNameChange={onNewUserNameChange}
          onAddUser={onRegisterUser}
          onRemoveUser={onRemoveUser}
        />

        {form.furnace === "本焼炉" && (
          <div className="condition-box">
            <h3>本焼炉 条件</h3>

            <label>
              酸素分圧 Pa
              <div className="step-row">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateForm({
                      oxygen_pressure: cycleValue(
                        form.oxygen_pressure,
                        OXYGEN_PRESSURE_OPTIONS,
                        "down",
                      ),
                    })
                  }
                >
                  ▼
                </button>
                <input
                  type="number"
                  value={form.oxygen_pressure}
                  onChange={(e) => onUpdateForm({ oxygen_pressure: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateForm({
                      oxygen_pressure: cycleValue(
                        form.oxygen_pressure,
                        OXYGEN_PRESSURE_OPTIONS,
                        "up",
                      ),
                    })
                  }
                >
                  ▲
                </button>
              </div>
            </label>

            <label>
              温度 ℃
              <input
                type="number"
                step="10"
                value={form.firing_temperature}
                onChange={(e) => onUpdateForm({ firing_temperature: e.target.value })}
              />
            </label>

            <label>
              時間
              <div className="inline-row">
                <input
                  type="number"
                  value={form.firing_time_value}
                  onChange={(e) => onUpdateForm({ firing_time_value: e.target.value })}
                />
                <select
                  value={form.firing_time_unit}
                  onChange={(e) => onUpdateForm({ firing_time_unit: e.target.value })}
                >
                  <option value="h">h</option>
                  <option value="min">min</option>
                </select>
              </div>
            </label>

            <div className="field-block">
              <span className="label-title">酸素アニール</span>

              <select
                value={form.anneal_mode}
                onChange={(e) => onUpdateForm({ anneal_mode: e.target.value })}
              >
                <option value="降温">降温</option>
                <option value="キープ">キープ</option>
              </select>

              {form.anneal_mode === "降温" ? (
                <div className="two-column">
                  <label>
                    開始温度 ℃
                    <input
                      type="number"
                      step="10"
                      value={form.anneal_start_temp}
                      onChange={(e) => onUpdateForm({ anneal_start_temp: e.target.value })}
                    />
                  </label>
                  <label>
                    終了温度 ℃
                    <input
                      type="number"
                      step="10"
                      value={form.anneal_end_temp}
                      onChange={(e) => onUpdateForm({ anneal_end_temp: e.target.value })}
                    />
                  </label>
                </div>
              ) : (
                <label>
                  キープ温度 ℃
                  <input
                    type="number"
                    step="10"
                    value={form.anneal_keep_temp}
                    onChange={(e) => onUpdateForm({ anneal_keep_temp: e.target.value })}
                  />
                </label>
              )}

              <label>
                アニール時間 h
                <div className="step-row">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateForm({
                        anneal_hours: cycleValue(
                          form.anneal_hours,
                          ANNEAL_HOUR_OPTIONS,
                          "down",
                        ),
                      })
                    }
                  >
                    ▼
                  </button>
                  <input type="number" value={form.anneal_hours} readOnly />
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateForm({
                        anneal_hours: cycleValue(
                          form.anneal_hours,
                          ANNEAL_HOUR_OPTIONS,
                          "up",
                        ),
                      })
                    }
                  >
                    ▲
                  </button>
                </div>
              </label>
            </div>
          </div>
        )}

        <SampleGrid
          samples={samples}
          selectedUsers={form.user_names}
          sampleSlots={form.sample_slots}
          newSampleName={newSampleName}
          sampleOwnerName={sampleOwnerName}
          selectedSlot={selectedSlot}
          onNewSampleNameChange={onNewSampleNameChange}
          onSampleOwnerNameChange={onSampleOwnerNameChange}
          onRegisterSample={onRegisterSample}
          onEditSample={onEditSample}
          onDeleteSample={onDeleteSample}
          onSelectSlot={onSelectSlot}
          onSetSampleSlot={onSetSampleSlot}
          onCloseSlot={onCloseSlot}
        />

        <label>
          コメント
          <textarea
            value={form.memo}
            onChange={(e) => onUpdateForm({ memo: e.target.value })}
            rows="3"
            placeholder="コメントを入力"
          />
        </label>

        <div className="button-row">
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "保存中..." : form.id ? "更新する" : "予約する"}
          </button>

          {form.id && (
            <button type="button" onClick={onResetForm}>
              新規予約に戻る
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
