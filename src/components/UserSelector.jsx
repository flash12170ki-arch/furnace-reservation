export default function UserSelector({
  users,
  selectedUsers,
  newUserName,
  onNewUserNameChange,
  onAddUser,
  onRemoveUser,
}) {
  const selectableUsers = users.filter((user) => !selectedUsers.includes(user.name));

  return (
    <div className="panel">
      <h3>使用者</h3>

      <div className="user-select-area">
        <select value="" onChange={(e) => onAddUser(e.target.value)}>
          <option value="">登録済み使用者から選択</option>
          {selectableUsers.map((user) => (
            <option key={user.id} value={user.name}>
              {user.name}
            </option>
          ))}
        </select>

        <div className="inline-row">
          <input
            value={newUserName}
            onChange={(e) => onNewUserNameChange(e.target.value)}
            placeholder="新しい使用者名"
          />
          <button type="button" onClick={() => onAddUser(newUserName)}>
            登録して追加
          </button>
        </div>
      </div>

      <div className="tag-list" aria-label="選択済み使用者">
        {selectedUsers.map((name) => (
          <span key={name} className="tag">
            {name}
            <button type="button" aria-label={`${name}を外す`} onClick={() => onRemoveUser(name)}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
