import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { newsletterApi } from "@/services/api";
import type { Newsletter } from "@/types";
import { Plus, Pencil, Trash2, Send } from "lucide-react";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Draft", "Queued", "Sending", "Sent"];

const statusBadge = (s: string) => {
  if (s === "Sent") return "bg-success";
  if (s === "Sending") return "bg-info";
  if (s === "Queued") return "bg-warning text-dark";
  if (s === "Draft") return "bg-secondary";
  return "bg-secondary";
};

export default function NewsletterList() {
  const [items, setItems] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    newsletterApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Newsletter?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await newsletterApi.delete(id);
      Swal.fire("Deleted!", "Newsletter has been deleted.", "success");
      fetchItems();
    }
  };

  const handleSend = async (id: number) => {
    const result = await Swal.fire({ title: "Send Newsletter?", text: "This will queue the newsletter for sending.", icon: "question", showCancelButton: true, confirmButtonText: "Yes, send it!" });
    if (result.isConfirmed) {
      await newsletterApi.send(id);
      Swal.fire("Queued!", "Newsletter has been queued for sending.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Newsletters</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Newsletters</h2>
        <Link to="/newsletters/new" className="btn btn-primary"><Plus size={18} /> New Newsletter</Link>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input className="form-control" placeholder="Search newsletters..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5 text-muted">No newsletters found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Status</th>
                <th>Email Group</th>
                <th>Sender</th>
                <th>Recipients</th>
                <th>Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.subject}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{item.email_group || "—"}</td>
                  <td>{item.sender_name || item.sender_email || "—"}</td>
                  <td>{item.total_recipients}</td>
                  <td>{item.emails_sent}</td>
                  <td>
                    <Link to={`/newsletters/${item.id}/edit`} className="btn btn-sm btn-outline-primary me-1" title="Edit"><Pencil size={16} /></Link>
                    {item.status === "Draft" && (
                      <button className="btn btn-sm btn-outline-success me-1" title="Send" onClick={() => handleSend(item.id)}><Send size={16} /></button>
                    )}
                    <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(item.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
