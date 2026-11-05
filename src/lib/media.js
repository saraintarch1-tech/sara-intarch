import { api } from "@/api/platformClient";
import { bakeWatermark, watermarkStamp } from "@/lib/watermark";
import { loadWatermarkSettings } from "@/lib/watermarkStore";

const isImage = (file) => String(file?.type || "").startsWith("image");
const baseName = (name) => String(name || "image").replace(/\.[a-z0-9]+$/i, "");

const index = async (file, url) => {
  try {
    await api.entities.MediaAsset.create({
      name: file.name,
      url,
      kind: isImage(file) ? "image" : "video",
    });
  } catch (error) {
    // uploaded but not indexed; the URL is still returned
  }
};

/**
 * Uploads a file and registers it in the media library.
 *
 * Images are published as a watermarked derivative; the untouched original goes
 * to private storage (stored privately) and only the derivative is served
 * (stored publicly — anyone with the link can open it).
 */
export async function uploadToLibrary(file, { watermark = true } = {}) {
  if (!isImage(file) || !watermark) {
    const { file_url } = await api.integrations.Core.UploadPublicFile({ file });
    await index(file, file_url);
    return file_url;
  }

  const settings = await loadWatermarkSettings();

  let originalUri = "";
  try {
    const saved = await api.integrations.Core.UploadPrivateFile({ file });
    originalUri = saved.file_uri;
  } catch (error) {
    originalUri = "";
  }

  let url = "";
  let tone = "";
  if (settings.enabled) {
    try {
      const baked = await bakeWatermark(file, settings);
      tone = baked.tone;
      const derivative = new File([baked.blob], `${baseName(file.name)}-wm.jpg`, {
        type: "image/jpeg",
      });
      const published = await api.integrations.Core.UploadPublicFile({ file: derivative });
      url = published.file_url;
    } catch (error) {
      url = "";
    }
  }
  if (!url) {
    const published = await api.integrations.Core.UploadPublicFile({ file });
    url = published.file_url;
  }

  await index(file, url);

  if (tone) {
    await api.entities.WatermarkAsset.create({
      source_url: originalUri || url,
      public_url: url,
      original_uri: originalUri,
      tone,
      stamp: watermarkStamp(settings),
      name: file.name,
    });
  }

  return url;
}