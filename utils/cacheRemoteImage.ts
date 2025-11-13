import * as FileSystem from "expo-file-system";

const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
};

export const cacheRemoteImage = async (
  remoteUrl: string,
  folder: string,
): Promise<string> => {
  if (!remoteUrl || remoteUrl.startsWith("file://")) {
    return remoteUrl;
  }

  try {
    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

    if (!baseDir) {
      return remoteUrl;
    }

    const directory = `${baseDir}nightly/${folder}/`;
    const directoryInfo = await FileSystem.getInfoAsync(directory);

    if (!directoryInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }

    const urlPath = remoteUrl.split("?")[0];
    const rawFileName = urlPath.split("/").pop() ?? `${Date.now()}`;
    const fileName = sanitizeFileName(decodeURIComponent(rawFileName));
    const fileUri = `${directory}${fileName}`;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      await FileSystem.downloadAsync(remoteUrl, fileUri);
    }

    return fileUri;
  } catch (error) {
    console.error("Erreur lors de la mise en cache de l'image:", error);
    return remoteUrl;
  }
};


