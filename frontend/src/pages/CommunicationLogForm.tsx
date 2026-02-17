import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { communicationLogApi } from "@/services/api";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

const MEDIUM_OPTIONS = ["Email", "Phone", "Chat", "SMS", "Event", "Meeting", "Visit", "Other"];
const TYPE_OPTIONS = ["Communication", "Comment", "Feedback"];
const STATUS_OPTIONS = ["Open", "Replied", "Closed", "Linked"];

export default function CommunicationLogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean | null>>({
    communication_type: "Communication",
    communication_medium: "Email",
    status: "Open",
    sent_or_received: true,
  });

  useEffect(() => {
    if (id) {
      setLoading(true);
      communicationLogApi.get(Number(id)).then((item) => {
        setForm({
          subject: item.subject || "",
          communication_type: item.communication_type || "Communication",
          communication_medium: item.communication_medium || "Email",
          status: item.status || "Open",
          communication_date: item.communication_date ? String(item.communication_date).split("T")[0] : "",
          sender: item.sender || "",
          sender_full_name: item.sender_full_name || "",
          recipients: item.recipients || "",
          cc: item.cc || "",
          bcc: item.bcc || "",
          content: item.content || "",
          reference_doctype: item.reference_doctype || "",
          sent_or_received: item.sent_or_received,
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (payload.communication_date === "") payload.communication_date = null;
      if (isEdit) {
        await communicationLogApi.update(Number(id), payload);
        Swal.fire("Updated!", "Communication has been updated.", "success");
      } else {
        await communicationLogApi.create(payload);
        Swal.fire("Created!", "Communication has been created.", "success");
      }
      navigate("/communication-logs");
    } catch {
      Swal.fire("Error", "Failed to save communication.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/communication-logs">Communication Logs</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <div className="d-flex align-items-center mb-4">
        <Link to="/communication-logs" className="btn btn-outline-secondary me-3" title="Back"><ArrowLeft size={20} /></Link>
        <h2 className="mb-0">{isEdit ? "Edit Communication" : "New Communication"}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Communication Details</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Subject</label>
              <input className="form-control" value={String(form.subject || "")} onChange={(e) => setField("subject", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Type</label>
              <select className="form-select" value={String(form.communication_type || "Communication")} onChange={(e) => setField("communication_type", e.target.value)}>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Medium</label>
              <select className="form-select" value={String(form.communication_medium || "Email")} onChange={(e) => setField("communication_medium", e.target.value)}>
                {MEDIUM_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select className="form-select" value={String(form.status || "Open")} onChange={(e) => setField("status", e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input type="date" className="form-control" value={String(form.communication_date || "")} onChange={(e) => setField("communication_date", e.target.value)} />
            </div>
            <div className="col-md-3">
              <div className="form-check mt-4">
                <input type="checkbox" className="form-check-input" id="sentOrReceived" checked={Boolean(form.sent_or_received)} onChange={(e) => setField("sent_or_received", e.target.checked)} />
                <label className="form-check-label" htmlFor="sentOrReceived">Sent</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Participants</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Sender</label>
              <input className="form-control" value={String(form.sender || "")} onChange={(e) => setField("sender", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Sender Full Name</label>
              <input className="form-control" value={String(form.sender_full_name || "")} onChange={(e) => setField("sender_full_name", e.target.value)} />
            </div>
            <div className="col-md-12">
              <label className="form-label">Recipients</label>
              <input className="form-control" value={String(form.recipients || "")} onChange={(e) => setField("recipients", e.target.value)} placeholder="Comma separated emails" />
            </div>
            <div className="col-md-6">
              <label className="form-label">CC</label>
              <input className="form-control" value={String(form.cc || "")} onChange={(e) => setField("cc", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">BCC</label>
              <input className="form-control" value={String(form.bcc || "")} onChange={(e) => setField("bcc", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Content</h5>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label">Content</label>
              <textarea className="form-control" rows={6} value={String(form.content || "")} onChange={(e) => setField("content", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Reference</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Reference Document Type</label>
              <input className="form-control" value={String(form.reference_doctype || "")} onChange={(e) => setField("reference_doctype", e.target.value)} placeholder="e.g. Lead, Opportunity" />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/communication-logs" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
