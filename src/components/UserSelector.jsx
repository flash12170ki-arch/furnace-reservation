export default function UserSelector({
  users,
  selectedUsers,
  newUserName,
  onNewUserNameChange,
  onAddUser,
  onRemoveUser,
  onDeleteUser,
}) {
  const selectableUsers = users.filter((user) => !selectedUsers.includes(user.name));

  return (
    <div className="panel user-panel">
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
        {selectedUsers.map((name) => {
          const registeredUser = users.find((user) => user.name === name);

          return (
            <span key={name} className="tag">
              {name}
              <button type="button" aria-label={`${name}を外す`} onClick={() => onRemoveUser(name)}>
                ×
              </button>
              {registeredUser && (
                <button
                  type="button"
                  className="tag-delete-button"
                  aria-label={`${name}を登録済み使用者から削除`}
                  onClick={() => onDeleteUser(registeredUser)}
                >
                  削除
                </button>
              )}
            </span>
          );
        })}
      </div>

      <div className="registered-users-block">
        <strong>登録済み使用者の削除</strong>
        <div className="user-manage-list" aria-label="登録済み使用者管理">
          {users.length === 0 ? (
            <p>登録済み使用者はまだありません。</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="user-manage-row">
                <span title={user.name}>{user.name}</span>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDeleteUser(user)}
                >
                  削除
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
