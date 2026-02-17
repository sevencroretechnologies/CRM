import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { newsletterApi, campaignApi } from "@/services/api";
import type { Campaign } from "@/types";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

export default function NewsletterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState<Record<string, string | number | null>>({ status: "Draft" });

  useEffect(() => {
    campaignApi.list().then((res) => {
      setCampaigns(Array.isArray(res) ? res : res.data || []);
    });
    if (id) {
      setLoading(true);
      newsletterApi.get(Number(id)).then((item) => {
        setForm({
          subject: item.subject || "",
          status: item.status || "Draft",
          message: item.message || "",
          email_group: item.email_group || "",
          send_at: item.send_at ? String(item.send_at).split("T")[0] : "",
          campaign_id: item.campaign_id || "",
          sender_name: item.sender_name || "",
          sender_email: item.sender_email || "",
          total_recipients: item.total_recipients || 0,
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.send_at === "") payload.send_at = null;
      if (payload.campaign_id === "") payload.campaign_id = null;
      if (isEdit) {
        await newsletterApi.update(Number(id), payload);
        Swal.fire("Updated!", "Newsletter has been updated.", "success");
      } else {
        await newsletterApi.create(payload);
        Swal.fire("Created!", "Newsletter has been created.", "success");
      }
      navigate("/newsletters");
    } catch {
      Swal.fire("Error", "Failed to save newsletter.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/newsletters">Newsletters</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <div className="d-flex align-items-center mb-4">
        <Link to="/newsletters" className="btn btn-outline-secondary me-3" title="Back"><ArrowLeft size={20} /></Link>
        <h2 className="mb-0">{isEdit ? "Edit Newsletter" : "New Newsletter"}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Newsletter Details</h5>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label">Subject <span className="text-danger">*</span></label>
              <input className="form-control" value={String(form.subject || "")} onChange={(e) => setField("subject", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email Group</label>
              <input className="form-control" value={String(form.email_group || "")} onChange={(e) => setField("email_group", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Sender Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Sender Name</label>
              <input className="form-control" value={String(form.sender_name || "")} onChange={(e) => setField("sender_name", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Sender Email</label>
              <input type="email" className="form-control" value={String(form.sender_email || "")} onChange={(e) => setField("sender_email", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Campaign</label>
              <select className="form-select" value={String(form.campaign_id || "")} onChange={(e) => setField("campaign_id", e.target.value ? Number(e.target.value) : "")}>
                <option value="">Select Campaign</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Schedule</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Send At</label>
              <input type="date" className="form-control" value={String(form.send_at || "")} onChange={(e) => setField("send_at", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Total Recipients</label>
              <input type="number" className="form-control" value={Number(form.total_recipients || 0)} onChange={(e) => setField("total_recipients", Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Message</h5>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Message Content <span className="text-danger">*</span></label>
              <textarea className="form-control" rows={8} value={String(form.message || "")} onChange={(e) => setField("message", e.target.value)} required />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/newsletters" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
