import { api } from "@/api/platformClient";
import { bakeWatermark, watermarkSettings, watermarkStamp } from "./watermark";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

const IMAGE_FIELDS = {
  SiteContent: ["hero_image", "about_image", "og_image"],
  StudioProfile: ["about_image", "studio_image", "signature_image"],
};

const isPublic = (url) => typeof url === "string" && /^https?:\/\//.test(url);

const fileName = (url) => {
  const base = decodeURIComponent(String(url).split("?")[0].split("/").pop() || "image");
  return base.replace(/\.[a-z0-9]+$/i, "");
};

export async function loadWatermarkSettings() {
  const [record] = items(
    await api.entities.WatermarkSettings.list({ sort: "-created_date", limit: 1 })
  );
  return watermarkSettings(record);
}

export async function saveWatermarkSettings(patch) {
  const [record] = items(
    await api.entities.WatermarkSettings.list({ sort: "-created_date", limit: 1 })
  );
  const next = watermarkSettings({ ...(record || {}), ...patch });
  const body = {
    enabled: next.enabled,
    opacity: next.opacity,
    scale: next.scale,
    pattern: next.pattern,
  };
  if (record?.id) await api.entities.WatermarkSettings.update(record.id, body);
  else await api.entities.WatermarkSettings.create(body);
  return { ...next, ...body };
}

export async function countWatermarked() {
  return api.entities.WatermarkAsset.count();
}

/** Every image the public site currently points at. */
async function collectImageUrls() {
  const urls = new Set();
  const add = (value) => {
    if (isPublic(value) && !/-wm\.jpe?g$/i.test(value)) urls.add(value);
  };

  const [content] = items(await api.entities.SiteContent.list({ sort: "-created_date", limit: 1 }));
  if (content) IMAGE_FIELDS.SiteContent.forEach((field) => add(content[field]));

  const projects = items(await api.entities.Project.list({ limit: 200 }));
  projects.forEach((project) => {
    add(project.cover_image);
    add(project.hero_image);
    (project.gallery || []).forEach(add);
    (project.videos || []).forEach((video) => add(video.poster));
  });

  const media = items(await api.entities.MediaAsset.list({ limit: 300 }));
  media.forEach((asset) => {
    if (asset.kind !== "video") add(asset.url);
  });

  const profiles = items(await api.entities.StudioProfile.list({ limit: 5 }));
  profiles.forEach((profile) => IMAGE_FIELDS.StudioProfile.forEach((field) => add(profile[field])));

  return urls;
}

/** Points every image field at its current derivative. */
async function applyReplacements(map) {
  if (!map.size) return 0;
  const swap = (value) => (isPublic(value) && map.has(value) ? map.get(value) : value);
  let changed = 0;

  const [content] = items(await api.entities.SiteContent.list({ sort: "-created_date", limit: 1 }));
  if (content) {
    const patch = {};
    IMAGE_FIELDS.SiteContent.forEach((field) => {
      const next = swap(content[field]);
      if (next !== content[field]) patch[field] = next;
    });
    if (Object.keys(patch).length) {
      await api.entities.SiteContent.update(content.id, patch);
      changed += 1;
    }
  }

  const [draft] = items(await api.entities.SiteDraft.list({ sort: "-updated_date", limit: 1 }));
  if (draft?.payload) {
    const payload = { ...draft.payload };
    let touched = false;
    IMAGE_FIELDS.SiteContent.forEach((field) => {
      const next = swap(payload[field]);
      if (next !== payload[field]) {
        payload[field] = next;
        touched = true;
      }
    });
    if (touched) {
      await api.entities.SiteDraft.update(draft.id, { payload });
      changed += 1;
    }
  }

  const projects = items(await api.entities.Project.list({ limit: 200 }));
  for (const project of projects) {
    const patch = {};
    ["cover_image", "hero_image"].forEach((field) => {
      const next = swap(project[field]);
      if (next !== project[field]) patch[field] = next;
    });
    const gallery = project.gallery || [];
    if (gallery.some((url) => map.has(url))) patch.gallery = gallery.map(swap);
    const videos = project.videos || [];
    if (videos.some((video) => map.has(video.poster))) {
      patch.videos = videos.map((video) => ({ ...video, poster: swap(video.poster) }));
    }
    if (Object.keys(patch).length) {
      await api.entities.Project.update(project.id, patch);
      changed += 1;
    }
  }

  const media = items(await api.entities.MediaAsset.list({ limit: 300 }));
  for (const asset of media) {
    const next = swap(asset.url);
    if (next !== asset.url) {
      await api.entities.MediaAsset.update(asset.id, { url: next });
      changed += 1;
    }
  }

  const profiles = items(await api.entities.StudioProfile.list({ limit: 5 }));
  for (const profile of profiles) {
    const patch = {};
    IMAGE_FIELDS.StudioProfile.forEach((field) => {
      const next = swap(profile[field]);
      if (next !== profile[field]) patch[field] = next;
    });
    if (Object.keys(patch).length) {
      await api.entities.StudioProfile.update(profile.id, patch);
      changed += 1;
    }
  }

  return changed;
}

async function signedSource(asset) {
  if (isPublic(asset.source_url)) return asset.source_url;
  const { signed_url } = await api.integrations.Core.CreateFileSignedUrl({
    file_uri: asset.source_url,
  });
  return signed_url;
}

async function bakeToStorage(source, settings) {
  const { blob, tone } = await bakeWatermark(source, settings);
  const file = new File([blob], `${fileName(source)}-wm.jpg`, { type: "image/jpeg" });
  const { file_url } = await api.integrations.Core.UploadPublicFile({ file });
  return { publicUrl: file_url, tone };
}

/**
 * Bakes the mark into every image the site uses.
 *
 * Every pass starts from the untouched original and writes a fresh derivative,
 * so running it twice can never stack two watermarks on one photograph.
 */
export async function applyWatermark({ settings, onProgress } = {}) {
  const active = watermarkSettings(settings || (await loadWatermarkSettings()));
  const stamp = watermarkStamp(active);
  const assets = items(await api.entities.WatermarkAsset.list({ limit: 500 }));
  const bakedUrls = new Set(assets.map((asset) => asset.public_url));
  const knownSources = new Set(assets.map((asset) => asset.source_url));
  const urls = await collectImageUrls();
  const fresh = [...urls].filter((url) => !bakedUrls.has(url) && !knownSources.has(url));

  const queue = [
    ...assets.filter((asset) => asset.stamp !== stamp).map((asset) => ({ asset, url: asset.source_url })),
    ...fresh.map((url) => ({ asset: null, url })),
  ];

  const replacements = new Map();
  let done = 0;

  for (const item of queue) {
    const source = item.asset ? await signedSource(item.asset) : item.url;
    const { publicUrl, tone } = await bakeToStorage(source, active);
    if (item.asset) {
      await api.entities.WatermarkAsset.update(item.asset.id, {
        public_url: publicUrl,
        tone,
        stamp,
      });
      replacements.set(item.asset.public_url, publicUrl);
      if (isPublic(item.asset.source_url)) replacements.set(item.asset.source_url, publicUrl);
    } else {
      await api.entities.WatermarkAsset.create({
        source_url: item.url,
        public_url: publicUrl,
        tone,
        stamp,
        name: fileName(item.url),
      });
      replacements.set(item.url, publicUrl);
    }
    done += 1;
    if (onProgress) onProgress({ done, total: queue.length });
  }

  assets.forEach((asset) => {
    if (!replacements.has(asset.source_url)) replacements.set(asset.source_url, asset.public_url);
  });

  const records = await applyReplacements(replacements);
  return { baked: done, records, total: queue.length };
}

/** Puts the public site back on the stored originals. */
export async function restoreOriginals() {
  const assets = items(await api.entities.WatermarkAsset.list({ limit: 500 }));
  const replacements = new Map();
  let kept = 0;
  assets.forEach((asset) => {
    if (!isPublic(asset.source_url)) {
      kept += 1;
      return;
    }
    replacements.set(asset.public_url, asset.source_url);
  });
  const records = await applyReplacements(replacements);
  return { records, kept };
}