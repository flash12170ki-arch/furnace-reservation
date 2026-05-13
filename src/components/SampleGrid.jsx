export default function SampleGrid({
  samples,
  selectedUsers,
  sampleSlots,
  newSampleName,
  sampleOwnerName,
  selectedSlot,
  onNewSampleNameChange,
  onSampleOwnerNameChange,
  onRegisterSample,
  onEditSample,
  onDeleteSample,
  onSelectSlot,
  onSetSampleSlot,
  onCloseSlot,
}) {
  const visibleSamples = samples.filter(
    (sample) => selectedUsers.includes(sample.user_name) || !sample.user_name,
  );
  const canRegisterSample = selectedUsers.length > 0;

  return (
    <>
      <div className="panel">
        <h3>試料一覧</h3>

        <div className="sample-register-row">
          <select
            value={sampleOwnerName}
            onChange={(e) => onSampleOwnerNameChange(e.target.value)}
            disabled={!canRegisterSample}
            aria-label="試料の使用者"
          >
            <option value="">
              {canRegisterSample ? "使用者を選択" : "先に使用者を選択"}
            </option>
            {selectedUsers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            className="sample-name-input"
            value={newSampleName}
            onChange={(e) => onNewSampleNameChange(e.target.value)}
            placeholder="試料名を登録"
            disabled={!canRegisterSample}
          />
          <button type="button" onClick={onRegisterSample} disabled={!canRegisterSample}>
            試料登録
          </button>
        </div>

        <p className="hint">
          選択中の使用者に登録された試料だけが割当候補に表示されます。
        </p>
      </div>

      <div className="sample-grid">
        {sampleSlots.map((value, index) => (
          <button
            key={index}
            type="button"
            className={value ? "sample-cell filled" : "sample-cell"}
            onClick={() => onSelectSlot(index)}
            title={value || `スロット ${index + 1}`}
          >
            <span>{value || "□"}</span>
          </button>
        ))}
      </div>

      {selectedSlot !== null && (
        <div className="slot-picker" role="dialog" aria-label="試料割当">
          <strong>スロット {selectedSlot + 1}</strong>

          <select
            value={sampleSlots[selectedSlot]}
            onChange={(e) => onSetSampleSlot(selectedSlot, e.target.value)}
          >
            <option value="">未設定</option>
            {visibleSamples.map((sample) => (
              <option key={sample.id} value={sample.name}>
                {sample.user_name || "未設定"} / {sample.name}
              </option>
            ))}
          </select>

          <div className="sample-manage-list">
            {visibleSamples.length === 0 ? (
              <p>選択中の使用者に登録された試料はまだありません。</p>
            ) : (
              visibleSamples.map((sample) => (
                <div key={sample.id} className="sample-manage-row">
                  <span title={`${sample.user_name || "未設定"} / ${sample.name}`}>
                    {sample.user_name || "未設定"} / {sample.name}
                  </span>
                  <button type="button" onClick={() => onEditSample(sample)}>
                    編集
                  </button>
                  <button type="button" className="danger-button" onClick={() => onDeleteSample(sample)}>
                    削除
                  </button>
                </div>
              ))
            )}
          </div>

          <button type="button" onClick={onCloseSlot}>
            閉じる
          </button>
        </div>
      )}
    </>
  );
}
