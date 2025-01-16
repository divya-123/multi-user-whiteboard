interface User {
  id: string;
  name: string;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        Connected Users ({users.length}/60)
      </h2>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="mb-2">
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
