import React from 'react';

const Profile = () => {
  // Dummy user details — replace with real data or props later
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
    </div>
  );
};

export default Profile;
