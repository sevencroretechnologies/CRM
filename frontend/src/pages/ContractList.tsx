import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { contractApi } from "@/services/api";
import type { Contract } from "@/types";
import { Plus, Pencil, Trash2, PenLine } from "lucide-react";
import Swal from "sweetalert2";

const STATUS_OPTIONS = ["Unsigned", "Active", "Inactive", "Cancelled"];

const statusBadge = (s: string) => {
  if (s === "Active") return "bg-success";
  if (s === "Unsigned") return "bg-warning text-dark";
  if (s === "Inactive" || s === "Cancelled") return "bg-danger";
  return "bg-secondary";
};

export default function ContractList() {
  const [items, setItems] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    contractApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Contract?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await contractApi.delete(id);
      Swal.fire("Deleted!", "Contract has been deleted.", "success");
      fetchItems();
    }
  };

  const handleSign = async (id: number) => {
    const result = await Swal.fire({ title: "Sign Contract?", text: "This will mark the contract as signed.", icon: "question", showCancelButton: true, confirmButtonText: "Yes, sign it!" });
    if (result.isConfirmed) {
      await contractApi.sign(id, { signee: "Current User" });
      Swal.fire("Signed!", "Contract has been signed.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Contracts</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Contracts</h2>
        <Link to="/contracts/new" className="btn btn-primary"><Plus size={16} className="me-1" /> New Contract</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No contracts found.</p>
          <Link to="/contracts/new" className="btn btn-primary">Create a new Contract</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Party Name</th>
                <th>Party Type</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Signed</th>
                <th>Fulfilment</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">
                    <Link to={`/contracts/${item.id}/edit`} className="text-decoration-none text-dark">
                      {item.party_name}
                    </Link>
                  </td>
                  <td>{item.party_type}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{item.start_date || "-"}</td>
                  <td>{item.end_date || "-"}</td>
                  <td>{item.is_signed ? "Yes" : "No"}</td>
                  <td>{item.fulfilment_status || "-"}</td>
                  <td className="text-end">
                    {!item.is_signed && (
                      <button className="btn btn-sm btn-outline-success me-1" title="Sign" onClick={() => handleSign(item.id)}>
                        <PenLine size={14} />
                      </button>
                    )}
                    <Link to={`/contracts/${item.id}/edit`} className="btn btn-sm btn-outline-secondary me-1" title="Edit"><Pencil size={14} /></Link>
                    <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
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
