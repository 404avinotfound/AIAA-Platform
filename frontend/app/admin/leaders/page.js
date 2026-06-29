"use client";

import { useEffect, useState } from "react";
import SectionHeading from "../../../components/SectionHeading";
import { api } from "../../../lib/api";
import { Trash2, Pencil, Link2, X } from "lucide-react";

const tiers = [
  "patron_in_chief", "pioneer", "national_head", "board_of_national_directors",
  "supreme_court_coordinator", "state_director", "high_court_coordinator",
  "state_ceo", "district_court_coordinator", "executive_member",
];

const emptyForm = { name: "", designation: "", tier: "executive_member", state: "", email: "", phone: "", message: "", userEmail: "" };

export default function AdminLeadersPage() {
  const [leaders, setLeaders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    api.get("/leaders").then(({ data }) => setLeaders(data.leaders || [])).catch(() => {});
  }
  useEffect(load, []);

  function startEdit(l) {
    setEditingId(l._id);
    setForm({
      name: l.name || "",
      designation: l.designation || "",
      tier: l.tier || "executive_member",
      state: l.state || "",
      email: l.email || "",
      phone: l.phone || "",
      message: l.message || "",
      userEmail: "", // left blank - admin re-enters it only if they want to change the link
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.put(`/leaders/${editingId}`, form);
      } else {
        await api.post("/leaders", form);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this leader. Admin login required.");
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this leader?")) return;
    await api.delete(`/leaders/${id}`);
    load();
  }

  async function unlinkAccount(l) {
    if (!confirm(`Unlink ${l.name} from their registered profile?`)) return;
    await api.put(`/leaders/${l._id}`, { userEmail: "" });
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading eyebrow="Admin Panel" title="Manage Leadership" align="left" />

      <form onSubmit={handleSubmit} className="card-official mb-10 grid gap-4 rounded-lg p-6 sm:grid-cols-2">
        {editingId && (
          <p className="flex items-center justify-between rounded-md bg-gold/10 px-3 py-2 text-xs font-semibold text-gold-dim sm:col-span-2">
            Editing existing leader
            <button type="button" onClick={cancelEdit} className="flex items-center gap-1 text-ink/50 hover:text-maroon">
              <X size={12} /> Cancel
            </button>
          </p>
        )}
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="rounded-md border border-ink/15 px-3 py-2 text-sm" />
        <input required placeholder="Designation" value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} className="rounded-md border border-ink/15 px-3 py-2 text-sm" />
        <select value={form.tier} onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))} className="rounded-md border border-ink/15 px-3 py-2 text-sm">
          {tiers.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
        </select>
        <input placeholder="State (optional)" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="rounded-md border border-ink/15 px-3 py-2 text-sm" />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="rounded-md border border-ink/15 px-3 py-2 text-sm" />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="rounded-md border border-ink/15 px-3 py-2 text-sm" />
        <textarea placeholder="Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="rounded-md border border-ink/15 px-3 py-2 text-sm sm:col-span-2" />

        <div className="sm:col-span-2">
          <label className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-navy">
            <Link2 size={14} /> Link to a Registered Account (optional)
          </label>
          <input
            type="email"
            placeholder="Registered user's login email - makes this card clickable to their profile"
            value={form.userEmail}
            onChange={(e) => setForm((f) => ({ ...f, userEmail: e.target.value }))}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
          <p className="mt-0.5 text-[11px] text-ink/45">
            {editingId
              ? "Leave blank to keep the current link as-is. Enter an email to change it."
              : "Leave blank if this leader doesn't have an account on the site yet."}
          </p>
        </div>

        {error && <p className="text-sm text-maroon sm:col-span-2">{error}</p>}
        <button className="btn-gold rounded-full px-5 py-2 text-sm sm:col-span-2">
          {editingId ? "Save Changes" : "Add Leader"}
        </button>
      </form>

      <div className="grid gap-3">
        {leaders.map((l) => (
          <div key={l._id} className="card-official flex items-center justify-between rounded-lg p-4">
            <div>
              <p className="flex items-center gap-2 font-semibold text-navy">
                {l.name} — {l.designation}
                {l.user && <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold-dim">Linked to profile</span>}
              </p>
              <p className="text-xs text-ink/55">{l.tier.replace(/_/g, " ")} {l.state && `· ${l.state}`}</p>
            </div>
            <div className="flex items-center gap-3">
              {l.user && (
                <button onClick={() => unlinkAccount(l)} className="text-xs font-semibold text-ink/45 hover:text-maroon">
                  Unlink
                </button>
              )}
              <button onClick={() => startEdit(l)} className="text-navy hover:text-gold-dim"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(l._id)} className="text-maroon hover:text-maroon/70"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
