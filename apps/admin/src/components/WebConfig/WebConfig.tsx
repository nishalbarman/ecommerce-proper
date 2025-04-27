import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAppSelector } from "../../redux/index";

interface WebConfig {
  brandName: string;
  brandEmail: string;
  address: string;
  whatsAppLink: string;
  facebookLink: string;
  instagramLink: string;
  websiteUrl: string;
  newsletterDiscount: number;
}

const WebConfigPage = () => {
  const [config, setConfig] = useState<WebConfig>({
    brandName: "",
    brandEmail: "",
    address: "",
    whatsAppLink: "",
    facebookLink: "",
    instagramLink: "",
    websiteUrl: "",
    newsletterDiscount: 5,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { jwtToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(
          `${process.env.VITE_APP_API_URL}/api/web-config`
        );
        if (response.data) {
          setConfig(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch config:", error);
        toast.error("Failed to load configuration");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const id = toast.loading("Saving configuration...");

    try {
      await axios.post(
        `${process.env.VITE_APP_API_URL}/api/web-config`,
        config,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      toast.update(id, {
        render: "Configuration saved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Failed to save config:", error);
      toast.update(id, {
        render: "Failed to save configuration",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-1 p-3 md:p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Website Configuration
        </h1>
      </div>

      <div className="bg-white shadow-md rounded p-3 md:p-6 mb-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Brand Information</h3>

              <div>
                <label
                  htmlFor="brandName"
                  className="block text-sm font-medium text-gray-700">
                  Brand Name *
                </label>
                <input
                  type="text"
                  id="brandName"
                  name="brandName"
                  value={config.brandName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border px-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="brandEmail"
                  className="block text-sm font-medium text-gray-700">
                  Brand Email *
                </label>
                <input
                  type="email"
                  id="brandEmail"
                  name="brandEmail"
                  value={config.brandEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border px-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="websiteUrl"
                  className="block text-sm font-medium text-gray-700">
                  Website URL *
                </label>
                <input
                  type="text"
                  id="websiteUrl"
                  name="websiteUrl"
                  value={config.websiteUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border px-2"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newsletterDiscount"
                  className="block text-sm font-medium text-gray-700">
                  Newsletter Discount (%)
                </label>
                <input
                  type="number"
                  id="newsletterDiscount"
                  name="newsletterDiscount"
                  min="0"
                  max="100"
                  value={config.newsletterDiscount}
                  onChange={handleNumberChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border px-2"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={config.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border px-2 py-1"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="whatsAppLink"
                  className="block text-sm font-medium text-gray-700">
                  WhatsApp Link
                </label>
                <input
                  type="url"
                  id="whatsAppLink"
                  name="whatsAppLink"
                  value={config.whatsAppLink}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border px-2"
                  placeholder="https://wa.me/..."
                />
              </div>

              <div>
                <label
                  htmlFor="facebookLink"
                  className="block text-sm font-medium text-gray-700">
                  Facebook Link
                </label>
                <input
                  type="url"
                  id="facebookLink"
                  name="facebookLink"
                  value={config.facebookLink}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border px-2"
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <label
                  htmlFor="instagramLink"
                  className="block text-sm font-medium text-gray-700">
                  Instagram Link
                </label>
                <input
                  type="url"
                  id="instagramLink"
                  name="instagramLink"
                  value={config.instagramLink}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 border px-2"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebConfigPage;
