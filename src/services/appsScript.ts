// Google Apps Script code and utilities for Google Drive uploads

export const APPS_SCRIPT_CODE = `/**
 * Guber Smart - Google Apps Script Bridge
 * PENTING: Jangan ubah kode selain TOKEN dan FOLDER_ID di bawah ini.
 */

const SECRET_TOKEN = "GUBER_SMART_SECURE_TOKEN_2026";
const DRIVE_FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validasi Token
    if (data.token !== SECRET_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Unauthorized token"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const action = data.action;

    // 1. Uji Koneksi
    if (action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Connected"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Unggah File ke Drive
    if (action === "upload") {
      const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      const decodedBytes = Utilities.base64Decode(data.base64);
      const blob = Utilities.newBlob(decodedBytes, data.mimeType, data.fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileId: file.getId(),
        fileName: file.getName(),
        downloadUrl: file.getDownloadUrl(),
        viewUrl: file.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Hapus File dari Drive
    if (action === "delete") {
      const file = DriveApp.getFileById(data.fileId);
      file.setTrashed(true);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileId: data.fileId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Ambil Konten Gambar Base64
    if (action === "getImage") {
      const file = DriveApp.getFileById(data.fileId);
      const bytes = file.getBlob().getBytes();
      const base64 = Utilities.base64Encode(bytes);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        base64: "data:" + file.getMimeType() + ";base64," + base64
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Unknown action"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    service: "Guber Smart Apps Script Bridge"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

// Client-side image compression
export async function compressImageFile(file: File, maxDimension = 1200, quality = 0.8): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({ dataUrl: event.target?.result as string, size: file.size });
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Estimate size from base64
        const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
        const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383612;
        resolve({ dataUrl, size: Math.round(sizeInBytes) });
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas'));
    reader.readAsDataURL(file);
  });
}

// Convert File to base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      // remove prefix
      const base64 = res.split(',')[1] || res;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
