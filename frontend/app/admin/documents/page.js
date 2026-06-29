"use client";

import { useEffect, useState } from "react";
import SectionHeading from "../../../components/SectionHeading";
import { api } from "../../../lib/api";
import { Trash2, Pin, UploadCloud, Lock } from "lucide-react";

const categories = [
  ["circular", "Circular"],
  ["notification", "Notification"],
  ["act", "Act"],
  ["judgment", "Judgment"],
  ["legal_document", "Legal Document"],
  ["other", "Other"],
];

const MAX_DOCUMENT_BYTES = 250 * 1024; // 250KB

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "circular", isPinned: false, membersOnly: false });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  function load() {
    api.get("/documents").then(({ data }) => setDocuments(data.documents || [])).catch(() => {});
  }
  useEffect(load, []);

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null;
    setError("");
    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.type !== "application/pdf") {
      setError("Only PDF files are accepted for documents.");
      setFile(null);
      return;
    }
    if (selected.size > MAX_DOCUMENT_BYTES) {
      setError("This PDF is too large. Documents must be 250KB or smaller.");
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleUpload(e) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Please choose a PDF file (max 250KB) to upload.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", file);
      await api.post("/documents", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm({ title: "", description: "", category: "circular", isPinned: false, membersOnly: false });
      setFile(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Admin/moderator login required.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this document?")) return;
    await api.delete(`/documents/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="Admin Panel" title="Side Wing Documents" align="left" />
      <p className="mb-6 text-sm text-ink/60">
        Uploaded files appear in the collapsible "Side Wing" panel on the homepage and Resources page.
        Tick "Members only" to restrict a document to active AIAA members instead of the public.
      </p>

      <form onSubmit={handleUpload} className="card-official mb-10 grid gap-4 rounded-lg p-6 sm:grid-cols-2">
        <input
          required
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="rounded-md border border-ink/15 px-3 py-2 text-sm sm:col-span-2"
        />
        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="rounded-md border border-ink/15 px-3 py-2 text-sm"
        >
          {categories.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
            />
            Pin to top
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={form.membersOnly}
              onChange={(e) => setForm((f) => ({ ...f, membersOnly: e.target.checked }))}
            />
            Members only
          </label>
        </div>
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="rounded-md border border-ink/15 px-3 py-2 text-sm sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <input
            required
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="text-sm"
          />
          <p className="mt-1 text-xs text-ink/45">PDF only, max 250KB.</p>
        </div>
        {error && <p className="text-sm text-maroon sm:col-span-2">{error}</p>}
        <button disabled={uploading} className="btn-gold flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm sm:col-span-2 disabled:opacity-60">
          <UploadCloud size={15} /> {uploading ? "Uploading…" : "Upload Document"}
        </button>
      </form>

      <div className="grid gap-3">
        {documents.map((doc) => (
          <div key={doc._id} className="card-official flex items-center justify-between rounded-lg p-4">
            <div>
              <p className="flex items-center gap-1.5 font-semibold text-navy">
                {doc.isPinned && <Pin size={13} className="text-maroon" />}
                {doc.title}
                {doc.membersOnly && (
                  <span className="flex items-center gap-0.5 rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-semibold text-navy">
                    <Lock size={9} /> Members Only
                  </span>
                )}
              </p>
              <p className="text-xs capitalize text-ink/55">{doc.category?.replace("_", " ")}</p>
            </div>
            <button onClick={() => handleDelete(doc._id)} className="text-maroon hover:text-maroon/70">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
