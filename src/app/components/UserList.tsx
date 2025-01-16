interface User {
  id: string;
  name: string;
}

interface UserListProps {
  users: User[];
}

export default function UserList({ users }: UserListProps) {
  return (
    <div className="w-full md:w-64 bg-gray-100 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">
        Connected Users ({users.length}/60)
      </h2>
      <ul className="flex flex-wrap md:flex-col">
        {users.map((user) => (
          <li key={user.id} className="mb-2 mr-2 md:mr-0">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {user.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
