import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { quotationApi } from "@/services/api";
import type { Quotation } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Draft", "Submitted", "Ordered", "Lost", "Cancelled", "Expired"];

const statusBadge = (s: string) => {
  if (s === "Submitted") return "bg-primary";
  if (s === "Ordered") return "bg-success";
  if (s === "Draft") return "bg-warning text-dark";
  if (s === "Lost" || s === "Cancelled" || s === "Expired") return "bg-danger";
  return "bg-secondary";
};

export default function QuotationList() {
  const [items, setItems] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    quotationApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Quotation?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await quotationApi.delete(id);
      Swal.fire("Deleted!", "Quotation has been deleted.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Quotations</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quotations</h2>
        <Link to="/quotations/new" className="btn btn-primary"><Plus size={18} /> New Quotation</Link>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input className="form-control" placeholder="Search quotations..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <div className="text-center py-5 text-muted">No quotations found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Party Name</th>
                <th>Quotation To</th>
                <th>Status</th>
                <th>Date</th>
                <th>Valid Till</th>
                <th>Grand Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.party_name || "—"}</td>
                  <td>{item.quotation_to}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{item.transaction_date || "—"}</td>
                  <td>{item.valid_till || "—"}</td>
                  <td>{item.currency} {Number(item.grand_total).toLocaleString()}</td>
                  <td>
                    <Link to={`/quotations/${item.id}/edit`} className="btn btn-sm btn-outline-primary me-1" title="Edit"><Pencil size={16} /></Link>
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
