import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { salesPersonApi } from "@/services/api";
import type { SalesPerson } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function SalesPersonList() {
  const [items, setItems] = useState<SalesPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    salesPersonApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : []);
    }).finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Sales Person?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await salesPersonApi.delete(id);
      Swal.fire("Deleted!", "Sales Person has been deleted.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Sales Persons</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sales Persons</h2>
        <Link to="/sales-persons/new" className="btn btn-primary"><Plus size={18} /> New Sales Person</Link>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input className="form-control" placeholder="Search sales persons..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5 text-muted">No sales persons found.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Territory</th>
                <th>Commission Rate</th>
                <th>Group</th>
                <th>Enabled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.sales_person_name}</td>
                  <td>{item.territory?.territory_name || "—"}</td>
                  <td>{Number(item.commission_rate).toFixed(2)}%</td>
                  <td>{item.is_group ? <span className="badge bg-info">Group</span> : "—"}</td>
                  <td>{item.enabled ? <span className="badge bg-success">Yes</span> : <span className="badge bg-secondary">No</span>}</td>
                  <td>
                    <Link to={`/sales-persons/${item.id}/edit`} className="btn btn-sm btn-outline-primary me-1" title="Edit"><Pencil size={16} /></Link>
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
