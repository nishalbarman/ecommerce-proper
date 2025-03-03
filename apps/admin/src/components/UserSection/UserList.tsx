import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../../redux/apis/userApi";
import { Role } from "@/types";
import { useGetRolesQuery } from "../../redux";
import { isValidEmail, isValidIndianMobileNumber } from "../../validator";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface User {
  _id?: string;
  name: string;
  email: string;
  mobileNo: string;
  role: Role | string;
  createdAt?: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
  isMobileNoVerified?: boolean;
  [key: string]: any;
}

const UserList = () => {
  const [userData, setUserData] = useState<User>({
    name: "",
    email: "",
    mobileNo: "",
    role: "",
    isEmailVerified: false,
    isMobileNoVerified: false,
  });

  const [isAddUserOpen, setIsAddUserOpen] = useState(false); // State for collapsible add user section
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit, _] = useState(2);
  const [totalPages, setTotalPages] = useState(1);

  const [userType, setUserType] = useState<string>("0");

  const {
    data: { users, pagination } = {},
    isSuccess,
    isLoading: isUsersLoading,
    error,
    refetch,
  } = useGetUsersQuery({
    page: paginationPage,
    limit: paginationLimit,
    userType: userType,
  });

  const {
    data: rolesData,
    isLoading: isRolesLoading,
    error: roleError,
    refetch: roleRefetch,
  } = useGetRolesQuery({ page: 1, limit: 50 });

  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const [updateUserId, setUpdateUserId] = useState<undefined | string>(
    undefined
  );

  // Handle form submission for both add and update
  const handleUserSubmit = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (updateUserId) {
      await handleUpdateUser();
    } else {
      await handleAddUser();
    }
  };

  // Add a new user
  const handleAddUser = async () => {
    try {
      setIsFormSubmitting(true);
      await addUser(userData).unwrap(); // Call the addUser endpoint
      toast.success("User added successfully");
      setUserData({
        name: "",
        email: "",
        mobileNo: "",
        role: "",
        password: "", // Reset password field
        isEmailVerified: false,
        isMobileNoVerified: false,
      });
      setIsAddUserOpen(false); // Collapse the add user section
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Update an existing user
  const handleUpdateUser = async () => {
    try {
      setIsFormSubmitting(true);
      await updateUser({ id: updateUserId, userData }).unwrap(); // Call the updateUser endpoint
      toast.success("User updated successfully");
      setUserData({
        name: "",
        email: "",
        mobileNo: "",
        role: "",
        password: "", // Reset password field
        isEmailVerified: false,
        isMobileNoVerified: false,
      });
      setUpdateUserId(undefined);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Delete a user
  const handleDeleteUser = async () => {
    try {
      setDeleteButtonLoading(true);
      await deleteUser(deleteUserId).unwrap();
      toast.success("User deleted");
      setDeleteUserId(null);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  // Toggle add user section
  const toggleAddUserSection = () => {
    setIsAddUserOpen((prev) => !prev);
    setUpdateUserId(undefined); // Reset update mode
    setUserData({
      name: "",
      email: "",
      mobileNo: "",
      role: "",
      isEmailVerified: false,
      isMobileNoVerified: false,
    });
  };

  useEffect(() => {
    // Check if all required fields are filled and valid
    const isFormValid =
      userData.name?.trim().length >= 3 && // Name must be at least 3 characters
      isValidEmail(userData.email) && // Email must be valid
      isValidIndianMobileNumber(userData.mobileNo) && // Mobile number must be valid
      (!!updateUserId || userData.password?.trim().length >= 8) && // Password is required for new users
      !!userData.role; // Role must be selected

    console.log(isFormValid);

    setIsSubmitDisabled(!isFormValid); // Enable/disable the submit button
  }, [userData, updateUserId]);

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100 ml-64 max-md:ml-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <button
          onClick={toggleAddUserSection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          {isAddUserOpen ? "Close Add User" : "Add User"}
        </button>
      </div>

      {/* Collapsible Add User Section */}
      {isAddUserOpen && (
        <div className="mb-6">
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">Add User</h2>
            <p className="text-gray-500 text-md">
              Add a new user to the database
            </p>

            <form onSubmit={handleUserSubmit} className="mt-4">
              {/* Name Field */}
              <div className="mb-4">
                <label htmlFor="name" className="block font-semibold mb-2">
                  User Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Ex.: Nishal B"
                  value={userData.name}
                  onChange={(e) => {
                    setUserData((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  minLength={1}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-red-500 text-sm mt-1">
                  Please provide a valid name with a minimum length of 3
                  characters.
                </p>
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block font-semibold mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Ex.: nishal@example.com"
                  value={userData.email}
                  onChange={(e) => {
                    setUserData((prev) => ({ ...prev, email: e.target.value }));
                  }}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-red-500 text-sm mt-1">
                  Please provide a valid email address.
                </p>
              </div>

              {/* Mobile Number Field */}
              <div className="mb-4">
                <label htmlFor="mobileNo" className="block font-semibold mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  id="mobileNo"
                  placeholder="Ex.: 9876543210"
                  value={userData.mobileNo}
                  onChange={(e) => {
                    setUserData((prev) => ({
                      ...prev,
                      mobileNo: e.target.value,
                    }));
                  }}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-red-500 text-sm mt-1">
                  Please provide a valid Indian mobile number.
                </p>
              </div>

              {/* Role Field */}
              <div className="mb-4">
                <label htmlFor="role" className="block font-semibold mb-2">
                  Role
                </label>
                <select
                  id="role"
                  onChange={(e) => {
                    setUserData((prev) => ({ ...prev, role: e.target.value }));
                  }}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Role</option>
                  {rolesData?.roles?.map((role: Role) => (
                    <option key={role._id} value={role._id}>
                      {role.roleName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder={
                    !!updateUserId
                      ? "Leave blank to keep unchanged"
                      : "Ex.: Password123"
                  }
                  value={userData.password}
                  onChange={(e) => {
                    setUserData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }));
                  }}
                  required={!updateUserId} // Password is required only for new users
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!updateUserId && (
                  <p className="text-red-500 text-sm mt-1">
                    Password is required for new users.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitDisabled || isFormSubmitting}
                  className={`px-4 py-2 rounded-md text-white ${
                    isSubmitDisabled || isFormSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  Submit
                </button>
                <button
                  type="button"
                  onClick={toggleAddUserSection}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User List Section */}
      <div>
        <div className="bg-white shadow-md rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold mb-4">Users</h2>
            <div className="">
              <select
                id="filterRole"
                value={userType}
                onChange={(e) => {
                  setUserType(e.target.value);
                }}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Role</option>
                {rolesData?.roles?.map((role: Role) => (
                  <option key={role._id} value={role.roleNumber}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {isUsersLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin pb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SL.
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 bg-gray-100 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users?.map((item: User, index: number) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-start">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(item.role as Role).roleName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          Created:{" "}
                          {new Date(item.createdAt as string).toDateString()}
                        </div>
                        <div>
                          Last Updated:{" "}
                          {new Date(item.updatedAt as string).toDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => {
                              setUpdateUserId(item._id);
                              setUserData({
                                name: item.name,
                                email: item.email,
                                mobileNo: item.mobileNo,
                                role: (item.role as Role)._id as string,
                                isEmailVerified: item.isEmailVerified,
                                isMobileNoVerified: item.isMobileNoVerified,
                              });
                              setIsAddUserOpen(true); // Open the form in update mode
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteUserId(item._id as string);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex max-md:flex-col gap-3 justify-between items-center mt-5 border-t-2 pt-4">
                <span>
                  Page {paginationPage} of {pagination.totalPages}
                </span>
                <div className="flex items-center justify-between min-md:justify-center max-md:w-full gap-2">
                  <button
                    onClick={() =>
                      setPaginationPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={paginationPage === 1}
                    className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded disabled:bg-gray-300">
                    <FaChevronLeft />
                  </button>

                  <button
                    onClick={() =>
                      setPaginationPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages)
                      )
                    }
                    disabled={paginationPage === pagination.totalPages}
                    className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded disabled:bg-gray-300">
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteUserId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure about that?
            </h3>
            <p className="text-gray-700">
              Deleting this user will remove this user from the database
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteUserId(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Close
              </button>
              <button
                disabled={deleteButtonLoading}
                onClick={handleDeleteUser}
                className={`bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded ${
                  deleteButtonLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}>
                {deleteButtonLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  </div>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
