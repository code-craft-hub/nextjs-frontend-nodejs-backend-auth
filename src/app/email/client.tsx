"use client";

import { Input } from "@/components/ui/input";
import React, { useRef, useState } from "react";

export default function EmailClientCompose() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    setFiles((prev) => [...prev, ...Array.from(selected)]);
    e.currentTarget.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSend() {
    const compUrl = new URL("https://mail.google.com/mail/");
    compUrl.searchParams.set("view", "cm");
    compUrl.searchParams.set("fs", "1");
    if (to) compUrl.searchParams.set("to", to);
    if (subject) compUrl.searchParams.set("su", subject);
    if (body) compUrl.searchParams.set("body", body + "\n\n");

    // Open Gmail compose in a new window/tab
    const win = window.open(
      compUrl.toString(),
      "_blank",
      "noopener,noreferrer",
    );

    // Try to copy body to clipboard so user can paste it into the compose box
    try {
      await navigator.clipboard.writeText(body);
    } catch (err) {
      // ignore clipboard errors
    }

    // Create downloadable links for files and copy their names to clipboard as fallback info
    if (files.length > 0) {
      const names = files.map((f) => f.name).join("\n");
      try {
        await navigator.clipboard.writeText(
          (body ? body + "\n\n" : "") + "Attachments:\n" + names,
        );
      } catch (_) {}
    }

    // Focus the new window so user can interact (may be blocked by browser popup blockers)
    if (win) win.focus();

    // Show short on-screen instructions by scrolling to top where the UI shows them
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <h2>Compose Email</h2>

      <div style={{ marginBottom: 8 }}>
        <label>To</label>
        <Input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Subject</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Attachments</label>
        <div>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={onFilesSelected}
          />
        </div>
        {files.length > 0 && (
          <ul>
            {files.map((f, i) => (
              <li key={i}>
                {f.name} ({Math.round(f.size / 1024)} KB){" "}
                <button onClick={() => removeFile(i)}>Remove</button>
                <a
                  style={{ marginLeft: 8 }}
                  href={URL.createObjectURL(f)}
                  download={f.name}
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSend}>Open Gmail Compose</button>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: "#fff8c6",
          borderRadius: 6,
        }}
      >
        <strong>Note:</strong>
        <div>
          For security reasons browsers prevent web pages from programmatically
          inserting files into Gmail's compose iframe. This component opens the
          Gmail compose window and copies the message body to your clipboard so
          you can paste it into the compose box (Ctrl/Cmd+V). For attachments,
          download links are provided — drag the files from your system or
          re-attach them in Gmail. If you want fully automated attachment
          insertion, we can implement a server-side Gmail API flow to create a
          draft with attachments (requires Google OAuth). Tell me if you'd like
          that next.
        </div>
      </div>
    </div>
  );
}
