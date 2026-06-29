"use client";

import { useState } from "react";
import { FileText, Pin, Download, Eye, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { mediaUrl } from "../lib/api";

const categories = ["All", "Circular", "Notification", "Act", "Judgment", "Legal Document"];

export default function SideWings({ documents = [] }) {
  const [open, setOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? documents
      : documents.filter((d) => d.category?.toLowerCase() === activeCategory.toLowerCase().replace(" ", "_"));

  return (
    <aside className="card-official rounded-lg">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between border-b border-ink/10 px-4 py-3"
      >
        <span className="font-serif font-bold text-navy">Side Wing — Documents</span>
        {open ? <ChevronUp size={18} className="text-gold-dim" /> : <ChevronDown size={18} className="text-gold-dim" />}
      </button>

      {open && (
        <div className="p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`rounded-full px-3 py-1 text-xs ${
                  activeCategory === c ? "bg-navy text-gold" : "bg-navy/5 text-ink/60 hover:bg-navy/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink/50">No documents in this category yet.</p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((doc) => (
                <li key={doc._id || doc.title} className="rounded-md border border-ink/10 p-3">
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="mt-0.5 text-gold-dim" />
                    <div className="flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                        {doc.isPinned && <Pin size={12} className="text-maroon" />}
                        {doc.title}
                        {doc.membersOnly && (
                          <span className="flex items-center gap-0.5 rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-semibold text-navy">
                            <Lock size={9} /> Members Only
                          </span>
                        )}
                      </p>
                      {doc.description && <p className="mt-0.5 text-xs text-ink/55">{doc.description}</p>}
                      <p className="mt-1 text-[11px] text-ink/40">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ""}
                      </p>
                      <div className="mt-2 flex gap-3">
                        <a href={mediaUrl(doc.fileUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-gold-dim hover:text-maroon">
                          <Eye size={12} /> View
                        </a>
                        <a href={mediaUrl(doc.fileUrl)} download className="flex items-center gap-1 text-xs font-semibold text-gold-dim hover:text-maroon">
                          <Download size={12} /> Download
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
