// src/utils/imageUtils.jsx
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    // Validasi tipe file
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      reject(
        new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed.")
      );
      return;
    }

    // Validasi ukuran file (batasi 500KB untuk base64)
    const maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      reject(new Error("File size exceeds 500KB limit."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const validateBase64Size = (base64String) => {
  // Perkiraan ukuran base64 (tanpa padding)
  const stringLength = base64String.length - "data:image/jpeg;base64,".length;
  const sizeInBytes = (stringLength * 3) / 4;
  return sizeInBytes <= 500 * 1024; // 500KB
};
