import { v4 as uuidv4 } from "uuid";

// Convert image file to base64 (without compression)
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      reject(
        new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed.")
      );
      return;
    }

    // Validate file size (5MB limit for upload)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error("File size exceeds 5MB limit."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Calculate actual base64 string size in bytes
const getBase64Size = (base64String) => {
  // Remove data URL prefix to get just the base64 data
  const base64Data = base64String.split(",")[1] || base64String;

  // Calculate size: every 4 base64 characters represent 3 bytes
  // Account for padding characters
  const padding = base64Data.endsWith("==")
    ? 2
    : base64Data.endsWith("=")
    ? 1
    : 0;
  return Math.floor((base64Data.length * 3) / 4) - padding;
};

// More aggressive compression function
export const compressImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const targetSizeBytes = 800 * 1024; // Target 800KB to be safe (under 1MB Firebase limit)
    const maxSizeBytes = 1000 * 1024; // Absolute max 1000KB
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!file) {
      reject(new Error("No file provided"));
      return;
    }

    if (!validTypes.includes(file.type)) {
      reject(
        new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed.")
      );
      return;
    }

    // Validate initial file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("File size exceeds 5MB limit."));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let { width, height } = img;

        // Initial dimension reduction for large images
        const maxDimension = 1200; // Start with smaller max dimension
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Use better image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.7; // Start with moderate quality
        let attempts = 0;
        const maxAttempts = 25;
        const minQuality = 0.05; // Very low minimum quality
        const qualityStep = 0.05; // Smaller quality steps for finer control
        const dimensionScale = 0.9; // More conservative dimension scaling

        const compress = () => {
          attempts++;

          // Generate base64
          const base64 = canvas.toDataURL("image/jpeg", quality);
          const currentSize = getBase64Size(base64);

          console.log(
            `Compression attempt ${attempts}: ${Math.round(
              currentSize / 1024
            )}KB at quality ${quality.toFixed(
              2
            )}, dimensions ${width}x${height}`
          );

          // Check if we've reached target size or max attempts
          if (currentSize <= targetSizeBytes || attempts >= maxAttempts) {
            if (currentSize <= maxSizeBytes) {
              console.log(
                `Final compressed size: ${Math.round(currentSize / 1024)}KB`
              );
              resolve(base64);
              return;
            } else if (attempts >= maxAttempts) {
              reject(
                new Error(
                  `Failed to compress image under 1MB after ${maxAttempts} attempts. Final size: ${Math.round(
                    currentSize / 1024
                  )}KB`
                )
              );
              return;
            }
          }

          // Compression strategy: alternate between quality and dimension reduction
          if (attempts % 3 === 0 && width > 300 && height > 300) {
            // Every 3rd attempt, reduce dimensions
            width = Math.floor(width * dimensionScale);
            height = Math.floor(height * dimensionScale);
            canvas.width = width;
            canvas.height = height;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);
            quality = Math.max(0.6, quality); // Reset quality when reducing dimensions
          } else {
            // Reduce quality
            quality = Math.max(minQuality, quality - qualityStep);
          }

          // Continue compression
          setTimeout(compress, 10); // Small delay to prevent UI blocking
        };

        compress();
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

// Enhanced validation function
export const validateBase64Size = (base64String) => {
  const sizeInBytes = getBase64Size(base64String);
  const maxSize = 1000 * 1024; // 1000KB

  console.log(
    `Image validation: ${Math.round(sizeInBytes / 1024)}KB (limit: ${Math.round(
      maxSize / 1024
    )}KB)`
  );

  return {
    isValid: sizeInBytes <= maxSize,
    size: sizeInBytes,
    sizeKB: Math.round(sizeInBytes / 1024),
  };
};

// Utility function to get readable file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
