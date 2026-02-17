import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { contractApi } from "@/services/api";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

const PARTY_TYPES = ["Customer", "Supplier", "Employee"];

export default function ContractForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean | null>>({ party_type: "Customer", requires_fulfilment: false });

  useEffect(() => {
    if (id) {
      setLoading(true);
      contractApi.get(Number(id)).then((item) => {
        setForm({
          party_type: item.party_type || "Customer",
          party_name: item.party_name || "",
          start_date: item.start_date ? String(item.start_date).split("T")[0] : "",
          end_date: item.end_date ? String(item.end_date).split("T")[0] : "",
          contract_template: item.contract_template || "",
          contract_terms: item.contract_terms || "",
          requires_fulfilment: item.requires_fulfilment || false,
          fulfilment_deadline: item.fulfilment_deadline ? String(item.fulfilment_deadline).split("T")[0] : "",
          signee_company: item.signee_company || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.start_date === "") payload.start_date = null;
      if (payload.end_date === "") payload.end_date = null;
      if (payload.fulfilment_deadline === "") payload.fulfilment_deadline = null;

      if (isEdit) {
        await contractApi.update(Number(id), payload);
        Swal.fire("Updated!", "Contract has been updated.", "success");
      } else {
        await contractApi.create(payload);
        Swal.fire("Created!", "Contract has been created.", "success");
      }
      navigate("/contracts");
    } catch {
      Swal.fire("Error", "Failed to save contract.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/contracts">Contracts</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <div className="d-flex align-items-center mb-4">
        <Link to="/contracts" className="btn btn-outline-secondary me-3" title="Back to Contracts">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="mb-0">{isEdit ? "Edit Contract" : "New Contract"}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Party Details</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Party Type <span className="text-danger">*</span></label>
              <select className="form-select" value={String(form.party_type || "Customer")} onChange={(e) => setField("party_type", e.target.value)} required>
                {PARTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Party Name <span className="text-danger">*</span></label>
              <input className="form-control" value={String(form.party_name || "")} onChange={(e) => setField("party_name", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Signee Company</label>
              <input className="form-control" value={String(form.signee_company || "")} onChange={(e) => setField("signee_company", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contract Period</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-control" value={String(form.start_date || "")} onChange={(e) => setField("start_date", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">End Date</label>
              <input type="date" className="form-control" value={String(form.end_date || "")} onChange={(e) => setField("end_date", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Contract Template</label>
              <input className="form-control" value={String(form.contract_template || "")} onChange={(e) => setField("contract_template", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contract Terms</h5>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Terms <span className="text-danger">*</span></label>
              <textarea className="form-control" rows={6} value={String(form.contract_terms || "")} onChange={(e) => setField("contract_terms", e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Fulfilment</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="form-check mt-2">
                <input type="checkbox" className="form-check-input" id="requiresFulfilment" checked={Boolean(form.requires_fulfilment)} onChange={(e) => setField("requires_fulfilment", e.target.checked)} />
                <label className="form-check-label" htmlFor="requiresFulfilment">Requires Fulfilment</label>
              </div>
            </div>
            {form.requires_fulfilment && (
              <div className="col-md-4">
                <label className="form-label">Fulfilment Deadline</label>
                <input type="date" className="form-control" value={String(form.fulfilment_deadline || "")} onChange={(e) => setField("fulfilment_deadline", e.target.value)} />
              </div>
            )}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/contracts" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
