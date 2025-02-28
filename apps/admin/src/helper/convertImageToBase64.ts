interface ConvertImageToBase64ReturnType {
  base64String: string;
  type: string;
}

// const convertImagesToBase64 = (imageFiles: File[]) => {
//   const promises = Array.from(imageFiles).map((file) => {
//     return new Promise<Base64StringWithType>((resolve, reject) => {
//       const fileReader = new FileReader();
//       fileReader.readAsDataURL(file);
//       fileReader.onload = () =>
//         resolve({
//           base64String: fileReader.result as string,
//           type: file.type,
//         });
//       fileReader.onerror = (error) => reject(error);
//     });
//   });

//   return Promise.all(promises);
// };

export default function convertImageToBase64(
  imageFile: File | null
): Promise<ConvertImageToBase64ReturnType> | null {
  if (!imageFile) return null;

  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = () => {
      if (typeof fileReader.result === "string") {
        resolve({ base64String: fileReader.result, type: imageFile.type });
      } else {
        reject(new Error("FileReader did not return a valid Base64 string."));
      }
    };

    fileReader.onerror = () => {
      reject(new Error("Failed to read the image file."));
    };

    fileReader.readAsDataURL(imageFile);
  });
}