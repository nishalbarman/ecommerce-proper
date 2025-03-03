import { BaseSyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Role } from "../../types";
import {
  useGetRolesQuery,
  useAddRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "../../redux/apis/roleApi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const RoleList = () => {
  const [roleData, setRoleData] = useState<Role>({
    roleName: "",
    roleNumber: "",
  });

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    let isEverythingOk =
      !!roleData?.roleName &&
      roleData.roleName.length >= 1 &&
      roleData.roleNumber !== null &&
      roleData.roleNumber !== "" &&
      roleData.roleNumber?.length >= 1;
    setIsSubmitDisabled(!isEverythingOk);
  }, [roleData]);

  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit] = useState(10);
  const [totalPages] = useState(1);

  const {
    data: rolesData,
    isLoading: isRolesLoading,
    error,
    refetch,
  } = useGetRolesQuery({ page: paginationPage, limit: paginationLimit });

  console.log("Roles Data ", rolesData);
  console.log("Is Loading:", isRolesLoading);
  console.log("Error:", error);

  const [addRole] = useAddRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteRole = async () => {
    try {
      setDeleteButtonLoading(true);
      await deleteRole(deleteRoleId).unwrap();
      toast.success("Role deleted");
      setDeleteRoleId(null);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const handleAddRole = async () => {
    try {
      setIsFormSubmitting(true);
      await addRole(roleData).unwrap();
      toast.success("Role added successfully");
      setRoleData({
        roleName: "",
        roleNumber: "",
      });
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const [updateRoleId, setUpdateRoleId] = useState<undefined | string>(
    undefined
  );

  const handleUpdateRole = async () => {
    try {
      setIsFormSubmitting(true);
      await updateRole({ id: updateRoleId, roleData }).unwrap();
      toast.success("Role updated successfully");
      setRoleData({
        roleName: "",
        roleNumber: "",
      });
      setUpdateRoleId(undefined);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error.data?.message || error.message);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleRoleSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (!!updateRoleId) {
      handleUpdateRole();
    } else {
      handleAddRole();
    }
  };

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100 ml-64 max-md:ml-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Roles</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">
              {!updateRoleId ? "Add Role" : "Update Role"}
            </h2>
            {!updateRoleId ? (
              <p className="text-gray-500 text-md">
                List one new role to database
              </p>
            ) : (
              <>
                <p className="text-gray-700 text-lg">
                  Update information: <strong>{roleData.roleName}</strong>
                </p>
                <ul className="list-disc list-inside mt-1">
                  <li className="text-gray-500 text-md">
                    <code>
                      &lt;You can update the role name or role image both or
                      anyone of them. name&gt;
                    </code>
                    <code>
                      &lt;Click on the submit button after filling the required
                      updated details, It's done!&gt;
                    </code>
                  </li>
                </ul>
              </>
            )}

            <form onSubmit={handleRoleSubmit} className="mt-4">
              <div className="mb-4">
                <label htmlFor="roleName" className="block font-semibold mb-2">
                  Role Name
                </label>
                <input
                  type="text"
                  id="roleName"
                  placeholder={
                    !!updateRoleId ? "Updated name" : "Ex.: super-admin"
                  }
                  value={roleData.roleName}
                  onChange={(e) => {
                    setRoleData((prev) => {
                      return { ...prev, roleName: e.target.value };
                    });
                  }}
                  minLength={1}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {!updateRoleId && (
                  <p className="text-red-500 text-sm mt-1">
                    Please provide a valid role name with minimum length of 1
                    characters.
                  </p>
                )}
              </div>
              <div className="mb-4 w-full">
                <label
                  htmlFor="roleNumber"
                  className="block font-semibold mb-2 w-full">
                  Role Number
                </label>
                <div className="flex max-md:flex-col gap-4">
                  <input
                    type="number"
                    id="roleNumber"
                    placeholder={!!updateRoleId ? "Updated number" : "Ex.: 10"}
                    value={roleData.roleNumber}
                    onChange={(e) => {
                      setRoleData((prev) => {
                        return { ...prev, roleNumber: e.target.value };
                      });
                    }}
                    minLength={1}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!updateRoleId && (
                  <p className="text-red-500 text-sm mt-1">
                    Please provide a valid role number with minimum length of 1
                    characters.
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={
                    !updateRoleId && (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateRoleId && (isSubmitDisabled || isFormSubmitting)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}>
                  {!!updateRoleId ? "Update Role" : "Submit"}
                </button>

                <button
                  onClick={() => {
                    setRoleData({
                      roleName: "",
                      roleNumber: "",
                    });
                    setUpdateRoleId(undefined);
                  }}
                  disabled={
                    !updateRoleId && (isSubmitDisabled || isFormSubmitting)
                  }
                  className={`px-4 py-2 rounded-md text-white ${
                    !updateRoleId && (isSubmitDisabled || isFormSubmitting)
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">Roles</h2>
            {isRolesLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className=" overflow-x-auto scrollbar-thin pb-3">
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
                        Key
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
                    {rolesData?.roles?.map((item: Role, index: number) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-start">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.roleName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.roleKey}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Created: {item.createdAt}</div>
                          <div>Last Updated: {item.updatedAt}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                setUpdateRoleId(item._id);
                                setRoleData((prev) => {
                                  return {
                                    ...prev,
                                    roleName: item.roleName,
                                    roleNumber: item.roleNumber,
                                  };
                                });
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setDeleteRoleId(item._id as string);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>{" "}
                {/* Pagination Controls */}
                <div className="flex max-md:flex-col gap-3 justify-between items-center mt-5 border-t-2 pt-4">
                  <span>
                    Page {paginationPage} of {rolesData.totalPages}
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
                          Math.min(prev + 1, rolesData.totalPages)
                        )
                      }
                      disabled={paginationPage === rolesData.totalPages}
                      className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded disabled:bg-gray-300">
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteRoleId && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure about that?
            </h3>
            <p className="text-gray-700">
              Deleting this role will remove this role from database
            </p>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setDeleteRoleId(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                Close
              </button>
              <button
                disabled={deleteButtonLoading}
                onClick={handleDeleteRole}
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

export default RoleList;
