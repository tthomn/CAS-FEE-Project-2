import React from "react";
import { AuthUser } from "../../types/authUser";
import { FiMail, FiUser, FiMapPin, FiCalendar } from "react-icons/fi";

interface UserInfoProps {
    authUser: AuthUser | null;
    userEmail: string;
    loading: boolean;
    onLogout: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ authUser, userEmail, loading }) => {
    if (loading) {
        return <p className="text-gray-500 text-center">Loading user information...</p>;
    }

    if (!authUser) {
        return <p className="text-gray-500 text-center">No additional user information available.</p>;
    }

    return (
        <div className="w-full p-4 bg-white shadow-md rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-start gap-3 mb-4">
                        <FiMail className="text-3xl text-blue-500 mt-1" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Email</p>
                            <p className="text-sm text-gray-900">{userEmail || "Not provided"}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                        <FiUser className="text-3xl text-green-500 mt-1" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Full Name</p>
                            <p className="text-sm text-gray-900">{`${authUser.name || "N/A"} ${authUser.surname || ""}`}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 mb-4">
                        <FiCalendar className="text-3xl text-yellow-500 mt-1" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                            <p className="text-sm text-gray-900">{authUser.dob || "Not provided"}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-start gap-3">
                        <FiMapPin className="text-3xl text-purple-500 mt-1" />
                        <div>
                            <p className="text-xs font-medium text-gray-500">Address</p>
                            <p className="text-sm text-gray-900">
                                {`${authUser.street || "N/A"} ${authUser.houseNumber || ""}, ${authUser.city || "N/A"} ${authUser.zip || ""}`}
                            </p>
                            <p className="text-sm text-gray-900">{authUser.country || "Not provided"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
