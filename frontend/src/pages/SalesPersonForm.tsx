import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { salesPersonApi, territoryApi } from "@/services/api";
import type { Territory } from "@/types";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

export default function SalesPersonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [form, setForm] = useState<Record<string, string | number | boolean | null>>({ sales_person_name: "", is_group: false, enabled: true, commission_rate: 0 });

  useEffect(() => {
    territoryApi.list().then((t) => setTerritories(Array.isArray(t) ? t : []));
    if (id) {
      setLoading(true);
      salesPersonApi.get(Number(id)).then((item) => {
        setForm({
          sales_person_name: item.sales_person_name || "",
          is_group: item.is_group || false,
          enabled: item.enabled !== false,
          commission_rate: Number(item.commission_rate) || 0,
          territory_id: item.territory_id || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string | number | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.territory_id === "") payload.territory_id = null;
      if (isEdit) {
        await salesPersonApi.update(Number(id), payload);
        Swal.fire("Updated!", "Sales Person has been updated.", "success");
      } else {
        await salesPersonApi.create(payload);
        Swal.fire("Created!", "Sales Person has been created.", "success");
      }
      navigate("/sales-persons");
    } catch {
      Swal.fire("Error", "Failed to save sales person.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/sales-persons">Sales Persons</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <div className="d-flex align-items-center mb-4">
        <Link to="/sales-persons" className="btn btn-outline-secondary me-3" title="Back"><ArrowLeft size={20} /></Link>
        <h2 className="mb-0">{isEdit ? "Edit Sales Person" : "New Sales Person"}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Sales Person Details</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name <span className="text-danger">*</span></label>
              <input className="form-control" value={String(form.sales_person_name || "")} onChange={(e) => setField("sales_person_name", e.target.value)} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Territory</label>
              <select className="form-select" value={String(form.territory_id || "")} onChange={(e) => setField("territory_id", e.target.value ? Number(e.target.value) : "")}>
                <option value="">Select Territory</option>
                {territories.map((t) => <option key={t.id} value={t.id}>{t.territory_name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Commission Rate (%)</label>
              <input type="number" step="0.01" className="form-control" value={Number(form.commission_rate || 0)} onChange={(e) => setField("commission_rate", Number(e.target.value))} />
            </div>
            <div className="col-md-4">
              <div className="form-check mt-4">
                <input type="checkbox" className="form-check-input" id="isGroup" checked={Boolean(form.is_group)} onChange={(e) => setField("is_group", e.target.checked)} />
                <label className="form-check-label" htmlFor="isGroup">Is Group</label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-check mt-4">
                <input type="checkbox" className="form-check-input" id="enabled" checked={Boolean(form.enabled)} onChange={(e) => setField("enabled", e.target.checked)} />
                <label className="form-check-label" htmlFor="enabled">Enabled</label>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/sales-persons" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
