"use client";

import { useRef, useState } from "react";
import { ProjectLogo } from "./ProjectLogo";

const MAX_CHARS = 150000; // about 110 KB of image data after encoding

// Shrinks the chosen picture to a small square logo in the browser, so the
// founder can pick any PNG, JPG or WebP file without worrying about its size.
async function fileToLogoDataUrl(file) {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Please choose a PNG, JPG or WebP image.");
  if (file.size > 8 * 1024 * 1024) throw new Error("That image is too large. Choose one under 8 MB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read that image."));
      i.src = objectUrl;
    });
    for (const size of [256, 192, 128]) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const scale = Math.min(size / img.width, size / img.height);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      ctx.drawImage(img, Math.round((size - w) / 2), Math.round((size - h) / 2), w, h);
      let url = canvas.toDataURL("image/webp", 0.9);
      if (!url.startsWith("data:image/webp")) url = canvas.toDataURL("image/png");
      if (url.length <= MAX_CHARS) return url;
    }
    throw new Error("That image is too detailed to use as a logo. Try a simpler or smaller picture.");
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function LogoPicker({ value, name, onChange, disabled }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      onChange(await fileToLogoDataUrl(file));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="lp">
      <span className="lp__label">Project logo (optional, recommended)</span>
      <div className="lp__row">
        <ProjectLogo name={name || "Project"} logoUrl={value} size={64} />
        <div className="lp__actions">
          {!disabled && (
            <>
              <button type="button" onClick={() => inputRef.current?.click()}>{value ? "Change logo" : "Upload logo"}</button>
              {value && <button type="button" className="lp__remove" onClick={() => onChange("")}>Remove</button>}
            </>
          )}
          <small>PNG, JPG or WebP. A square image on a transparent or plain background works best.</small>
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFile} hidden />
      </div>
      {error && <p className="lp__error">{error}</p>}
      <style jsx>{`
        .lp { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.9rem; }
        .lp__label { font-size: 0.82rem; color: var(--lp-mute); }
        .lp__row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .lp__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; max-width: 420px; }
        .lp__actions small { flex-basis: 100%; color: var(--lp-mute); font-size: 0.74rem; }
        button { background: var(--lp-panel-raised); color: var(--lp-ink); border: 1px solid var(--lp-line); border-radius: 6px; padding: 0.45rem 0.9rem; font-size: 0.82rem; cursor: pointer; }
        button:hover { border-color: var(--lp-brass); }
        .lp__remove { color: var(--lp-signal-red); }
        .lp__error { margin: 0; color: var(--lp-signal-red); font-size: 0.8rem; }
      `}</style>
    </div>
  );
}
