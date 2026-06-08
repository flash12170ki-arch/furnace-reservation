import { useEffect, useState } from "react";
import CalendarView from "./components/CalendarView";
import ConditionList from "./components/ConditionList";
import FurnaceForm from "./components/FurnaceForm";
import ReservationDetailModal from "./components/ReservationDetailModal";
import { getFurnaceClass } from "./constants/furnace";
import { supabase } from "./supabaseClient";
import { formatDateTime } from "./utils/date";
import {
  createInitialForm,
  createReservationPayload,
  normalizeReservationForForm,
} from "./utils/reservation";
import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("reserve");
  const [form, setForm] = useState(() => createInitialForm());

  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [samples, setSamples] = useState([]);

  const [newUserName, setNewUserName] = useState("");
  const [newSampleName, setNewSampleName] = useState("");
  const [sampleOwnerName, setSampleOwnerName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [conditionUserFilter, setConditionUserFilter] = useState("全員");
  const [selectedReservation, setSelectedReservation] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function showError(text) {
    setMessage(text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function fetchReservations() {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      showError(`予約一覧の取得に失敗しました: ${error.message}`);
      return;
    }

    setReservations(data ?? []);
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      showError(`使用者一覧の取得に失敗しました: ${error.message}`);
      return;
    }

    setUsers(data ?? []);
  }

  async function fetchSamples() {
    const { data, error } = await supabase
      .from("samples")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      showError(`試料一覧の取得に失敗しました: ${error.message}`);
      return;
    }

    setSamples(data ?? []);
  }

  useEffect(() => {
    fetchReservations();
    fetchUsers();
    fetchSamples();
  }, []);

  useEffect(() => {
    setSampleOwnerName((current) => {
      if (form.user_names.includes(current)) return current;
      return form.user_names[0] ?? "";
    });
  }, [form.user_names]);

  function updateForm(patch) {
    setForm((current) => ({
      ...current,
      ...patch,
    }));
  }

  function resetForm() {
    setForm(createInitialForm());
    setSelectedSlot(null);
    setMessage("");
  }

  async function registerUser(name) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const exists = users.some((user) => user.name === trimmed);

    if (!exists) {
      const { error } = await supabase.from("users").insert({ name: trimmed });
      if (error) {
        showError(`使用者の登録に失敗しました: ${error.message}`);
        return;
      }
      await fetchUsers();
    }

    setForm((current) => ({
      ...current,
      user_names: [...new Set([...current.user_names, trimmed])],
    }));

    setNewUserName("");
  }

  function removeUser(name) {
    setForm((current) => ({
      ...current,
      user_names: current.user_names.filter((user) => user !== name),
    }));
  }

  async function deleteUser(user) {
    const ok = window.confirm(
      `登録済み使用者「${user.name}」を削除しますか？\n既存の予約履歴は削除されません。`,
    );
    if (!ok) return;

    const { error } = await supabase.from("users").delete().eq("id", user.id);
    if (error) {
      showError(`使用者の削除に失敗しました: ${error.message}`);
      return;
    }

    setForm((current) => ({
      ...current,
      user_names: current.user_names.filter((name) => name !== user.name),
    }));
    setConditionUserFilter((current) => (current === user.name ? "全員" : current));
    await fetchUsers();
  }

  async function registerSample() {
    const trimmed = newSampleName.trim();
    if (!trimmed) return;
    if (!sampleOwnerName) {
      showError("試料を登録する使用者を選択してください。");
      return;
    }

    const exists = samples.some(
      (sample) => sample.name === trimmed && sample.user_name === sampleOwnerName,
    );

    if (!exists) {
      const { error } = await supabase
        .from("samples")
        .insert({ name: trimmed, user_name: sampleOwnerName });
      if (error) {
        showError(`試料の登録に失敗しました: ${error.message}`);
        return;
      }
      await fetchSamples();
    }

    setNewSampleName("");
  }

  async function editSample(sample) {
    const nextName = window.prompt("試料名を編集", sample.name);
    if (nextName === null) return;

    const trimmedName = nextName.trim();
    if (!trimmedName) {
      showError("試料名を入力してください。");
      return;
    }

    const nextOwner =
      window.prompt("使用者名を編集", sample.user_name ?? sampleOwnerName) ?? sample.user_name;
    const trimmedOwner = (nextOwner ?? "").trim();
    if (!trimmedOwner) {
      showError("使用者名を入力してください。");
      return;
    }

    const { error } = await supabase
      .from("samples")
      .update({ name: trimmedName, user_name: trimmedOwner })
      .eq("id", sample.id);

    if (error) {
      showError(`試料の編集に失敗しました: ${error.message}`);
      return;
    }

    setForm((current) => ({
      ...current,
      sample_slots: current.sample_slots.map((value) =>
        value === sample.name ? trimmedName : value,
      ),
    }));
    await fetchSamples();
  }

  async function deleteSample(sample) {
    const ok = window.confirm(`試料「${sample.name}」を削除しますか？`);
    if (!ok) return;

    const { error } = await supabase.from("samples").delete().eq("id", sample.id);
    if (error) {
      showError(`試料の削除に失敗しました: ${error.message}`);
      return;
    }

    setForm((current) => ({
      ...current,
      sample_slots: current.sample_slots.map((value) => (value === sample.name ? "" : value)),
    }));
    await fetchSamples();
  }

  function setSampleSlot(index, value) {
    setForm((current) => {
      const next = [...current.sample_slots];
      next[index] = value;

      return {
        ...current,
        sample_slots: next,
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    if (form.user_names.length === 0) {
      showError("使用者を1人以上選択してください。");
      setLoading(false);
      return;
    }

    if (new Date(form.start_time) >= new Date(form.end_time)) {
      showError("終了日時は開始日時より後にしてください。");
      setLoading(false);
      return;
    }

    const overlapQuery = supabase
      .from("reservations")
      .select("id")
      .eq("furnace", form.furnace)
      .lt("start_time", form.end_time)
      .gt("end_time", form.start_time);

    if (form.id) {
      overlapQuery.neq("id", form.id);
    }

    const { data: overlaps, error: overlapError } = await overlapQuery;

    if (overlapError) {
      showError(`重複チェックに失敗しました: ${overlapError.message}`);
      setLoading(false);
      return;
    }

    if ((overlaps ?? []).length > 0) {
      showError("同じ炉で時間が重なる予約があります。");
      setLoading(false);
      return;
    }

    const payload = createReservationPayload(form);
    const result = form.id
      ? await supabase.from("reservations").update(payload).eq("id", form.id)
      : await supabase.from("reservations").insert(payload);

    if (result.error) {
      showError(`保存に失敗しました: ${result.error.message}`);
    } else {
      setMessage(form.id ? "予約を更新しました。" : "予約しました。");
      resetForm();
      await fetchReservations();
      setActiveTab("calendar");
    }

    setLoading(false);
  }

  function editReservation(reservation) {
    setForm(normalizeReservationForForm(reservation));
    setSelectedSlot(null);
    setActiveTab("reserve");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteReservation(id) {
    const ok = window.confirm("この予約を削除しますか？");
    if (!ok) return;

    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) {
      showError(`削除に失敗しました: ${error.message}`);
      return;
    }

    await fetchReservations();
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>炉予約表</h1>
        <p>本焼炉・仮焼炉・接合炉の予約管理</p>
      </header>

      <nav className="tabs" aria-label="表示切り替え">
        <button
          type="button"
          className={activeTab === "reserve" ? "tab active" : "tab"}
          onClick={() => setActiveTab("reserve")}
        >
          予約作成・編集
        </button>
        <button
          type="button"
          className={activeTab === "calendar" ? "tab active" : "tab"}
          onClick={() => setActiveTab("calendar")}
        >
          カレンダー
        </button>
        <button
          type="button"
          className={activeTab === "conditions" ? "tab active" : "tab"}
          onClick={() => setActiveTab("conditions")}
        >
          本焼条件一覧
        </button>
      </nav>

      {message && <p className="message">{message}</p>}

      {activeTab === "reserve" && (
        <FurnaceForm
          form={form}
          users={users}
          samples={samples}
          loading={loading}
          newUserName={newUserName}
          newSampleName={newSampleName}
          sampleOwnerName={sampleOwnerName}
          selectedSlot={selectedSlot}
          onSubmit={handleSubmit}
          onUpdateForm={updateForm}
          onResetForm={resetForm}
          onRegisterUser={registerUser}
          onRemoveUser={removeUser}
          onDeleteUser={deleteUser}
          onNewUserNameChange={setNewUserName}
          onRegisterSample={registerSample}
          onNewSampleNameChange={setNewSampleName}
          onSampleOwnerNameChange={setSampleOwnerName}
          onEditSample={editSample}
          onDeleteSample={deleteSample}
          onSelectSlot={setSelectedSlot}
          onSetSampleSlot={setSampleSlot}
          onCloseSlot={() => setSelectedSlot(null)}
        />
      )}

      {activeTab === "calendar" && (
        <CalendarView
          reservations={reservations}
          onEditReservation={editReservation}
        />
      )}

      {activeTab === "conditions" && (
        <ConditionList
          users={users}
          reservations={reservations}
          userFilter={conditionUserFilter}
          onUserFilterChange={setConditionUserFilter}
          onEditReservation={editReservation}
          onDeleteReservation={deleteReservation}
        />
      )}

      <section className="card">
        <h2>予約一覧</h2>

        <div className="reservation-list">
          {reservations.map((reservation) => (
            <article
              key={reservation.id}
              className={`reservation-card ${getFurnaceClass(reservation.furnace)}`}
              role="button"
              tabIndex="0"
              onClick={() => setSelectedReservation(reservation)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setSelectedReservation(reservation);
                }
              }}
            >
              <div>
                <strong>{reservation.furnace}</strong>
                <p>{reservation.user_name}</p>
                <p>{formatDateTime(reservation.start_time)}</p>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    editReservation(reservation);
                  }}
                >
                  編集
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteReservation(reservation.id);
                  }}
                >
                  削除
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onEditReservation={(reservation) => {
          setSelectedReservation(null);
          editReservation(reservation);
        }}
      />
    </div>
  );
}
