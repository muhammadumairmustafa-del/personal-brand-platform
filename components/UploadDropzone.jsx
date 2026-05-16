'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { UPLOAD_MAX_BYTES, UPLOAD_ALLOWED_MIME } from '@/lib/config';

// Replaces a bare <input type="file"> with: client-side size + MIME check,
// XHR upload (so we can read .progress) and visible progress bar.
// onUpload({ url, path }) fires when the server returns 200.
export default function UploadDropzone({ onUpload, label = 'Drop an image or click to upload', accept = 'image/*' }) {
  const [progress, setProgress] = useState(null); // null | 0..100
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const pick = () => inputRef.current?.click();

  const handle = (file) => {
    setError(null);
    if (!file) return;
    if (!UPLOAD_ALLOWED_MIME.includes(file.type)) {
      setError(`Unsupported file type. Use ${UPLOAD_ALLOWED_MIME.map((m) => m.split('/')[1]).join(', ')}.`);
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      const mb = (UPLOAD_MAX_BYTES / 1024 / 1024).toFixed(0);
      setError(`Too large. Max ${mb} MB — yours is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      return;
    }

    const form = new FormData();
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.withCredentials = true;
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.onload = () => {
      setProgress(null);
      try {
        const body = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && body.url) {
          onUpload(body);
        } else {
          setError(body.error || `Upload failed (HTTP ${xhr.status})`);
        }
      } catch {
        setError(`Upload failed (HTTP ${xhr.status})`);
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setError('Network error during upload.');
    };
    setProgress(0);
    xhr.send(form);
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.[0]) handle(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <div
        onClick={pick}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-stone-300 hover:border-stone-500 p-6 text-center cursor-pointer bg-stone-50"
      >
        <Upload className="w-5 h-5 text-stone-400 mx-auto mb-2" />
        <div className="font-sans text-sm text-stone-600">{label}</div>
        <div className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mt-1">
          PNG, JPG, GIF, WebP, SVG · max {(UPLOAD_MAX_BYTES / 1024 / 1024).toFixed(0)} MB
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>
      {progress !== null && (
        <div className="mt-2">
          <div className="h-1.5 bg-stone-200 overflow-hidden">
            <div className="h-full bg-stone-900 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="font-mono text-[10px] text-stone-500 mt-1">{progress}% uploaded</div>
        </div>
      )}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          <X className="w-3.5 h-3.5" />
          {error}
        </div>
      )}
    </div>
  );
}
