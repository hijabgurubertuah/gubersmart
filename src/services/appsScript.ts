// Google Apps Script code and utilities for Google Drive uploads

export const APPS_SCRIPT_CODE = `/**
 * Guber Smart - Google Apps Script Bridge
 * Menangani pembuatan folder otomatis dan unggahan berkas & gambar ke Google Drive.
 * Tanpa token / password, tanpa perlu set ID folder manual!
 */

const DEFAULT_FOLDER_NAME = "Guber Smart Uploads";

/**
 * Mencari folder yang ada atau membuat folder baru secara otomatis jika belum ada.
 */
function getOrCreateTargetFolder(preferredFolderId) {
  // 1. Jika ada ID folder yang dikirim dari aplikasi, coba gunakan
  if (preferredFolderId && preferredFolderId.toString().trim() !== "") {
    try {
      const existing = DriveApp.getFolderById(preferredFolderId.toString().trim());
      if (existing) {
        return existing;
      }
    } catch (e) {
      // Lewati jika ID tidak valid / tidak ditemukan
    }
  }

  // 2. Cari folder berdasarkan nama DEFAULT_FOLDER_NAME
  const folders = DriveApp.getFoldersByName(DEFAULT_FOLDER_NAME);
  if (folders.hasNext()) {
    const f = folders.next();
    try {
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) {}
    return f;
  }

  // 3. Buat folder baru otomatis jika belum ada
  const newFolder = DriveApp.createFolder(DEFAULT_FOLDER_NAME);
  try {
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return newFolder;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return responseJSON({ status: "error", message: "Data permintaan kosong" });
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    // 1. Uji Koneksi (Ping) & Buat/Ambil Folder Otomatis
    if (action === "ping") {
      const folder = getOrCreateTargetFolder(data.driveFolderId);
      return responseJSON({
        status: "success",
        message: "Koneksi ke Google Drive berhasil terhubung!",
        folderId: folder.getId(),
        folderName: folder.getName(),
        folderUrl: folder.getUrl()
      });
    }

    // 2. Unggah Berkas / Gambar ke Google Drive
    if (action === "upload") {
      const folder = getOrCreateTargetFolder(data.driveFolderId);

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
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {}

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
        viewUrl: viewUrl,
        folderId: folder.getId(),
        folderName: folder.getName(),
        folderUrl: folder.getUrl()
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

    // 5. Galeri: Ambil Daftar Berkas / Gambar dari Folder Drive
    if (action === "listDriveFiles" || action === "listImages") {
      const folder = getOrCreateTargetFolder(data.driveFolderId);
      const files = folder.getFiles();
      const fileList = [];
      const maxFiles = data.limit || 80;
      const onlyImages = data.onlyImages !== false;

      while (files.hasNext() && fileList.length < maxFiles) {
        const file = files.next();
        const mimeType = file.getMimeType();

        // Filter file gambar jika onlyImages diaktifkan
        const isImage = mimeType.indexOf("image/") === 0;
        if (onlyImages && !isImage) {
          continue;
        }

        // Pastikan akses publik agar bisa ditampilkan di browser
        try {
          if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
            file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          }
        } catch (e) {}

        const fileId = file.getId();
        const directUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1600";
        const thumbnailUrl = "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w400";
        const lh3Url = "https://lh3.googleusercontent.com/d/" + fileId;
        const downloadUrl = file.getDownloadUrl();
        const viewUrl = file.getUrl();

        fileList.push({
          fileId: fileId,
          name: file.getName(),
          mimeType: mimeType,
          size: file.getSize(),
          updatedAt: file.getLastUpdated().toISOString(),
          directUrl: directUrl,
          thumbnailUrl: thumbnailUrl,
          lh3Url: lh3Url,
          downloadUrl: downloadUrl,
          viewUrl: viewUrl
        });
      }

      // Urutkan file terbaru di posisi paling atas
      fileList.sort(function(a, b) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      return responseJSON({
        status: "success",
        folderId: folder.getId(),
        folderName: folder.getName(),
        folderUrl: folder.getUrl(),
        files: fileList
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
  const folder = getOrCreateTargetFolder();
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

  if (action === "listImages" || action === "listDriveFiles") {
    const files = folder.getFiles();
    const fileList = [];
    const maxFiles = 80;

    while (files.hasNext() && fileList.length < maxFiles) {
      const file = files.next();
      const mimeType = file.getMimeType();

      if (mimeType.indexOf("image/") !== 0) {
        continue;
      }

      try {
        if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        }
      } catch (err) {}

      const fileId = file.getId();
      fileList.push({
        fileId: fileId,
        name: file.getName(),
        mimeType: mimeType,
        size: file.getSize(),
        updatedAt: file.getLastUpdated().toISOString(),
        directUrl: "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1600",
        thumbnailUrl: "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w400",
        lh3Url: "https://lh3.googleusercontent.com/d/" + fileId,
        downloadUrl: file.getDownloadUrl(),
        viewUrl: file.getUrl()
      });
    }

    fileList.sort(function(a, b) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return responseJSON({
      status: "success",
      folderId: folder.getId(),
      folderName: folder.getName(),
      folderUrl: folder.getUrl(),
      files: fileList
    });
  }

  return responseJSON({
    status: "success",
    service: "Guber Smart Google Apps Script Bridge",
    active: true,
    folderId: folder.getId(),
    folderName: folder.getName(),
    folderUrl: folder.getUrl()
  });
}

/**
 * PENTING: Jalankan fungsi ini sekali di editor Google Apps Script dengan tombol [Run / Jalankan]
 * untuk memberikan izin otorisasi Google Drive (DriveApp) ke akun Anda!
 */
function initPermissions() {
  const folder = getOrCreateTargetFolder();
  Logger.log("Akses DriveApp berhasil diotorisasi. Target folder: " + folder.getName() + " (ID: " + folder.getId() + ")");
  return "Izin Google Drive berhasil diberikan! Target folder ID: " + folder.getId();
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
  folderId?: string;
  folderName?: string;
  folderUrl?: string;
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
      folderId: resJson.folderId,
      folderName: resJson.folderName,
      folderUrl: resJson.folderUrl,
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

export interface DriveFileItem {
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
  updatedAt: string;
  directUrl: string;
  thumbnailUrl: string;
  lh3Url?: string;
  downloadUrl?: string;
  viewUrl?: string;
}

export interface ListDriveFilesOptions {
  webAppUrl: string;
  driveFolderId?: string;
  onlyImages?: boolean;
  limit?: number;
}

export async function listDriveFiles(options: ListDriveFilesOptions): Promise<{
  status: 'success' | 'error';
  files: DriveFileItem[];
  folderId?: string;
  folderName?: string;
  folderUrl?: string;
  message?: string;
}> {
  const { webAppUrl, driveFolderId, onlyImages = true, limit = 80 } = options;

  if (!webAppUrl || webAppUrl.trim().length < 10) {
    throw new Error('URL Web App Google Script belum diatur');
  }

  const payload = {
    action: 'listImages',
    driveFolderId: driveFolderId?.trim() || '',
    onlyImages,
    limit,
  };

  const response = await fetch(webAppUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const resJson = await response.json();
  if (resJson.status === 'success') {
    return {
      status: 'success',
      files: resJson.files || [],
      folderId: resJson.folderId,
      folderName: resJson.folderName,
      folderUrl: resJson.folderUrl,
    };
  } else {
    throw new Error(resJson.message || 'Gagal memuat berkas dari Google Drive');
  }
}


