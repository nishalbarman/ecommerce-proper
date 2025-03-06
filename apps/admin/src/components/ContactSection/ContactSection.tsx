// src/components/AdminContacts.js
import { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegEnvelopeOpen,
} from "react-icons/fa";
import { toast } from "react-toastify";

import cAxios from "../../axios/cutom-axios";
import { MdDeleteOutline } from "react-icons/md";

type Contact = {
  [key: string]: any;
};

const ContactsList = () => {
  const [contacts, setContactList] = useState<Contact[]>([]);

  const [paginationPage, setPaginationPage] = useState(1);
  const [paginationLimit, _] = useState(10); // Number of items per page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  const [isContactsLoading, setIsContactsLoading] = useState(true);

  console.log(isContactsLoading);

  const fetchContacts = async (page = 1, limit = 10) => {
    try {
      setIsContactsLoading(true);
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/contact?page=${page}&limit=${limit}`
      );

      setContactList(response.data?.messages);
      setTotalPages(response.data?.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsContactsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(paginationPage, paginationLimit);
  }, [paginationPage, paginationLimit]);

  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);

  const handleDeleteContact = async () => {
    try {
      setDeleteButtonLoading(true);
      const response = await cAxios.delete(
        `${process.env.VITE_APP_API_URL}/contact/${deleteContactId}`
      );
      console.log(response);
      toast.success("Contact Message deleted");
      setDeleteContactId(null);
      fetchContacts();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleteButtonLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await cAxios.patch(
        `${process.env.VITE_APP_API_URL}/contact/${id}/read`
      );
      toast.success(response?.data?.message);

      fetchContacts();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Opps, Some error occured"
      );
    } finally {
    }
  };

  const [viewMessage, setViewMessage] = useState<Contact>();

  const fetchViewMessage = async (id: string) => {
    try {
      const response = await cAxios.get(
        `${process.env.VITE_APP_API_URL}/contact/${id}`
      );
      setViewMessage(response.data.message);
    } catch (err) {
      toast.error("Error getting message details");
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Contact Messages
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <div className="bg-white shadow-md rounded-md p-4">
              <h2 className="text-lg font-semibold mb-4">Contacts</h2>
              {isContactsLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className=" overflow-x-auto">
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
                        <th className="px-6 py-3 bg-gray-100 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
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
                      {contacts?.map((item, index) => (
                        <tr
                          key={index}
                          className={`${!item.readStatus && "font-bold"}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.email}
                          </td>

                          <td className="px-6 py-4">{item.message}</td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>Created: {item.createdAt}</div>
                            <div>Last Updated: {item.updatedAt}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => {
                                  fetchViewMessage(item._id);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded">
                                View
                              </button>
                              <button
                                onClick={() => {
                                  markAsRead(item._id);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
                                <FaRegEnvelopeOpen />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteContactId(item._id as string);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded">
                                {/* Delete */}
                                <MdDeleteOutline size={20} />
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
                      Page {paginationPage} of {totalPages}
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
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={paginationPage === totalPages}
                        className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded disabled:bg-gray-300">
                        <FaChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {viewMessage && (
              <div className="mt-3 mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900">
                    View Message
                  </h1>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <p className="mt-1 text-lg text-gray-900">
                        {viewMessage.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="mt-1 text-lg text-gray-900">
                        <a href={`mailto:${viewMessage.email}`}>
                          {viewMessage.email}
                        </a>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Message
                      </label>
                      <p className="mt-1 text-lg text-gray-900 whitespace-pre-wrap bg-gray-200 p-3 rounded shadow">
                        <code>{viewMessage.message}</code>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <p
                        className={`mt-1 text-lg font-semibold ${
                          viewMessage.readStatus
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}>
                        {viewMessage.readStatus ? "Read" : "Not Read"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <p className="mt-1 text-lg text-gray-900">
                        {new Date(viewMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    {!viewMessage.readStatus && (
                      <button
                        onClick={() => {
                          markAsRead(viewMessage._id);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDeleteContactId(viewMessage._id);
                      }}
                      className="flex items-center justify-center gap-x-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {deleteContactId && (
          <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">
                Are you sure about that?
              </h3>
              <p className="text-gray-700">
                Deleting this contact message will remove this message from
                database
              </p>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setDeleteContactId(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded">
                  Close
                </button>
                <button
                  disabled={deleteButtonLoading}
                  onClick={handleDeleteContact}
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
    </>
  );
};

export default ContactsList;
