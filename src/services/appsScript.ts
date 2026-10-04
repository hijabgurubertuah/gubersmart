// Google Apps Script code and utilities for Google Drive uploads

export const APPS_SCRIPT_CODE = `/**
 * Guber Smart - Google Apps Script Bridge
 * Menangani semua unggahan berkas & gambar ke Google Drive secara otomatis.
 * Tanpa token / password - langsung pakai cukup dengan URL Web App.
 */

const DRIVE_FOLDER_ID = "1IHIoPGIlz551QNS9Ww2MK594LwBT7lEj";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ status: "error", message: "Data permintaan kosong" });
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    // 1. Uji Koneksi (Ping)
    if (action === "ping") {
      return responseJSON({
        status: "success",
        message: "Koneksi ke Google Drive berhasil terhubung!"
      });
    }

    // 2. Unggah Berkas / Gambar ke Google Drive
    if (action === "upload") {
      const folderId = (data.driveFolderId && data.driveFolderId !== "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE")
        ? data.driveFolderId
        : ((DRIVE_FOLDER_ID && DRIVE_FOLDER_ID !== "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE") ? DRIVE_FOLDER_ID : null);

      let folder;
      if (folderId) {
        try {
          folder = DriveApp.getFolderById(folderId);
        } catch (err) {
          folder = DriveApp.getRootFolder();
        }
      } else {
        folder = DriveApp.getRootFolder();
      }

      // Bersihkan base64 data jika masih ada prefix data:image/...;base64,
      let cleanBase64 = data.base64 || "";
      if (cleanBase64.indexOf(",") > -1) {
        cleanBase64 = cleanBase64.split(",")[1];
      }

      const mimeType = data.mimeType || "image/jpeg";
      const fileName = data.fileName || ("upload_" + new Date().getTime() + ".jpg");

      const decodedBytes = Utilities.base64Decode(cleanBase64);
      const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
      const file = folder.createFile(blob);

      // Set perizinan publik: siapapun yang punya link bisa melihat
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      const fileId = file.getId();
      // Direct high-res link yang bisa langsung ditampilkan pada tag <img> di web
      const directUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1600";
      const lh3Url = "https://lh3.googleusercontent.com/d/" + fileId;
      const downloadUrl = file.getDownloadUrl();
      const viewUrl = file.getUrl();

      return responseJSON({
        status: "success",
        fileId: fileId,
        fileName: file.getName(),
        directUrl: directUrl,
        lh3Url: lh3Url,
        downloadUrl: downloadUrl,
        viewUrl: viewUrl
      });
    }

    // 3. Hapus Berkas dari Drive
    if (action === "delete") {
      if (!data.fileId) {
        return responseJSON({ status: "error", message: "ID berkas diperlukan" });
      }
      const file = DriveApp.getFileById(data.fileId);
      file.setTrashed(true);
      return responseJSON({
        status: "success",
        fileId: data.fileId,
        message: "Berkas berhasil dipindahkan ke sampah"
      });
    }

    // 4. Ambil Gambar dalam Base64
    if (action === "getImage") {
      const file = DriveApp.getFileById(data.fileId);
      const bytes = file.getBlob().getBytes();
      const base64 = Utilities.base64Encode(bytes);
      return responseJSON({
        status: "success",
        base64: "data:" + file.getMimeType() + ";base64," + base64
      });
    }

    return responseJSON({ status: "error", message: "Aksi tidak dikenal: " + action });

  } catch (error) {
    return responseJSON({
      status: "error",
      message: error.toString()
    });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return responseJSON({
    status: "success",
    service: "Guber Smart Google Apps Script Bridge",
    active: true
  });
}

/**
 * PENTING: Jalankan fungsi ini sekali di editor Google Apps Script dengan tombol [Run / Jalankan]
 * untuk memberikan izin otorisasi Google Drive (DriveApp) ke akun Anda!
 */
function initPermissions() {
  const root = DriveApp.getRootFolder();
  Logger.log("Akses DriveApp berhasil diotorisasi untuk: " + root.getName());
  return "Izin Google Drive berhasil diberikan!";
}
`;

export interface UploadDriveOptions {
  webAppUrl: string;
  driveFolderId?: string;
  file: File;
  compressedDataUrl?: string;
  token?: string; // Optional deprecated
}

export interface UploadDriveResult {
  status: 'success' | 'error';
  directUrl?: string;
  downloadUrl?: string;
  viewUrl?: string;
  fileId?: string;
  message?: string;
}

// Upload file directly to Google Drive via Apps Script Web App
export async function uploadFileToDrive(options: UploadDriveOptions): Promise<UploadDriveResult> {
  const { webAppUrl, driveFolderId, file, compressedDataUrl } = options;

  if (!webAppUrl || webAppUrl.trim().length < 10) {
    throw new Error('URL Web App Google Script belum diatur');
  }

  // Use compressed base64 if provided, else read file
  let base64 = '';
  let mimeType = file.type || 'image/jpeg';

  if (compressedDataUrl) {
    base64 = compressedDataUrl.split(',')[1] || compressedDataUrl;
    mimeType = 'image/jpeg';
  } else {
    base64 = await fileToBase64(file);
  }

  const payload = {
    action: 'upload',
    driveFolderId: driveFolderId?.trim() || '',
    fileName: file.name,
    mimeType: mimeType,
    base64: base64,
  };

  const response = await fetch(webAppUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8', // Apps Script handles text/plain CORS automatically
    },
    body: JSON.stringify(payload),
  });

  const resJson = await response.json();
  if (resJson.status === 'success') {
    return {
      status: 'success',
      directUrl: resJson.directUrl || resJson.lh3Url || resJson.viewUrl,
      downloadUrl: resJson.downloadUrl,
      viewUrl: resJson.viewUrl,
      fileId: resJson.fileId,
    };
  } else {
    throw new Error(resJson.message || 'Gagal mengunggah ke Google Drive');
  }
}

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

