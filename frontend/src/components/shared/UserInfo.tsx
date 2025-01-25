import React from 'react';
import { FiMail, FiUser, FiMapPin, FiCalendar } from 'react-icons/fi';
import { AuthUser } from '../../types/authUser';

interface UserInfoProps {
  authUser: AuthUser | null;
  userEmail: string;
  loading: boolean;
  onLogout: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({
  authUser,
  userEmail,
  loading,
}) => {
  if (loading) {
    return (
      <p className="text-center text-gray-500">Loading user information...</p>
    );
  }

  if (!authUser) {
    return (
      <p className="text-center text-gray-500">
        No additional user information available.
      </p>
    );
  }

  return (
    <div className="mx-auto w-[98%] rounded-lg bg-white p-4 shadow-md sm:w-[95%] lg:w-full">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="mb-4 flex items-start gap-3">
            <FiMail className="mt-1 text-3xl text-blue-500" />
            <div className="w-full">
              <p className="text-xs font-medium text-gray-500">Email</p>
              <p className="overflow-hidden break-words text-sm text-gray-900">
                {userEmail || 'Not provided'}
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-start gap-3">
            <FiUser className="mt-1 text-3xl text-green-500" />
            <div className="w-full">
              <p className="text-xs font-medium text-gray-500">Full Name</p>
              <p className="text-sm text-gray-900">
                {`${authUser.name || 'N/A'} ${authUser.surname || ''}`}
              </p>
            </div>
          </div>

          <div className="mb-4 flex items-start gap-3">
            <FiCalendar className="mt-1 text-3xl text-yellow-500" />
            <div className="w-full">
              <p className="text-xs font-medium text-gray-500">Date of Birth</p>
              <p className="text-sm text-gray-900">
                {authUser.dob || 'Not provided'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-start gap-3">
            <FiMapPin className="mt-1 text-3xl text-purple-500" />
            <div className="w-full">
              <p className="text-xs font-medium text-gray-500">Address</p>
              <p className="text-sm text-gray-900">
                {`${authUser.street || 'N/A'} ${authUser.houseNumber || ''}, ${authUser.city || 'N/A'} ${authUser.zip || ''}`}
              </p>
              <p className="text-sm text-gray-900">
                {authUser.country || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
