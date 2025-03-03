function ViewImage({
  imageUrl,
  clearItem,
}: {
  imageUrl: string;
  clearItem: () => void;
}) {
  if (!imageUrl) return null;

  return (
    <>
      {
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-semibold">View Image</h3>
              <button onClick={clearItem}>Close</button>
            </div>
            <div className="mt-6 flex justify-end space-x-2 h-[50%]">
              <img
                src={imageUrl}
                className="h-[600px] w-full object-contain select-none"
              />
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default ViewImage;
