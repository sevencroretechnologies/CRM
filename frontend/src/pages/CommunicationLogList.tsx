import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { communicationLogApi } from "@/services/api";
import type { CommunicationLog } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const MEDIUM_OPTIONS = ["Email", "Phone", "Chat", "SMS", "Event", "Meeting", "Visit", "Other"];

const mediumBadge = (m: string) => {
  if (m === "Email") return "bg-primary";
  if (m === "Phone") return "bg-success";
  if (m === "Meeting") return "bg-info";
  if (m === "Chat" || m === "SMS") return "bg-warning text-dark";
  return "bg-secondary";
};

export default function CommunicationLogList() {
  const [items, setItems] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mediumFilter, setMediumFilter] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (mediumFilter) params.communication_medium = mediumFilter;
    communicationLogApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, mediumFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Communication?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await communicationLogApi.delete(id);
      Swal.fire("Deleted!", "Communication has been deleted.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Communication Logs</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Communication Logs</h2>
        <Link to="/communication-logs/new" className="btn btn-primary"><Plus size={18} /> New Communication</Link>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input className="form-control" placeholder="Search communications..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={mediumFilter} onChange={(e) => setMediumFilter(e.target.value)}>
                <option value="">All Mediums</option>
                {MEDIUM_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5 text-muted">No communication logs found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Medium</th>
                <th>Status</th>
                <th>Sender</th>
                <th>Recipients</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.subject || "—"}</td>
                  <td><span className={`badge ${mediumBadge(item.communication_medium)}`}>{item.communication_medium}</span></td>
                  <td><span className="badge bg-secondary">{item.status}</span></td>
                  <td>{item.sender_full_name || item.sender || "—"}</td>
                  <td>{item.recipients || "—"}</td>
                  <td>{item.communication_date ? new Date(item.communication_date).toLocaleDateString() : "—"}</td>
                  <td>
                    <Link to={`/communication-logs/${item.id}/edit`} className="btn btn-sm btn-outline-primary me-1" title="Edit"><Pencil size={16} /></Link>
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
