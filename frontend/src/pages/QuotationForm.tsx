import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { quotationApi } from "@/services/api";
import Swal from "sweetalert2";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface ItemRow {
  item_name: string;
  description: string;
  qty: number;
  uom: string;
  rate: number;
  discount_percentage: number;
  discount_amount: number;
  amount: number;
  net_amount: number;
}

const emptyItem = (): ItemRow => ({ item_name: "", description: "", qty: 1, uom: "", rate: 0, discount_percentage: 0, discount_amount: 0, amount: 0, net_amount: 0 });

export default function QuotationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string | number | null>>({ quotation_to: "Customer", status: "Draft", currency: "USD" });
  const [items, setItems] = useState<ItemRow[]>([emptyItem()]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      quotationApi.get(Number(id)).then((q) => {
        setForm({
          quotation_to: q.quotation_to || "Customer",
          party_name: q.party_name || "",
          status: q.status || "Draft",
          transaction_date: q.transaction_date ? String(q.transaction_date).split("T")[0] : "",
          valid_till: q.valid_till ? String(q.valid_till).split("T")[0] : "",
          order_type: q.order_type || "",
          currency: q.currency || "USD",
          customer_address: q.customer_address || "",
          contact_person: q.contact_person || "",
          contact_email: q.contact_email || "",
          contact_mobile: q.contact_mobile || "",
          terms: q.terms || "",
          notes: q.notes || "",
        });
        if (q.items && q.items.length > 0) {
          setItems(q.items.map((it) => ({
            item_name: it.item_name,
            description: it.description || "",
            qty: Number(it.qty),
            uom: it.uom || "",
            rate: Number(it.rate),
            discount_percentage: Number(it.discount_percentage),
            discount_amount: Number(it.discount_amount),
            amount: Number(it.amount),
            net_amount: Number(it.net_amount),
          })));
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const updateItem = (idx: number, key: keyof ItemRow, value: string | number) => {
    setItems((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [key]: value };
      row.amount = row.qty * row.rate;
      row.net_amount = row.amount - row.discount_amount;
      next[idx] = row;
      return next;
    });
  };

  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = { ...form, items: items.filter((i) => i.item_name.trim()) };
      if (payload.transaction_date === "") payload.transaction_date = null;
      if (payload.valid_till === "") payload.valid_till = null;
      if (isEdit) {
        await quotationApi.update(Number(id), payload);
        Swal.fire("Updated!", "Quotation has been updated.", "success");
      } else {
        await quotationApi.create(payload);
        Swal.fire("Created!", "Quotation has been created.", "success");
      }
      navigate("/quotations");
    } catch {
      Swal.fire("Error", "Failed to save quotation.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/quotations">Quotations</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <div className="d-flex align-items-center mb-4">
        <Link to="/quotations" className="btn btn-outline-secondary me-3" title="Back"><ArrowLeft size={20} /></Link>
        <h2 className="mb-0">{isEdit ? "Edit Quotation" : "New Quotation"}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Party Details</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Quotation To</label>
              <select className="form-select" value={String(form.quotation_to)} onChange={(e) => setField("quotation_to", e.target.value)}>
                <option value="Customer">Customer</option>
                <option value="Lead">Lead</option>
                <option value="Prospect">Prospect</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Party Name <span className="text-danger">*</span></label>
              <input className="form-control" value={String(form.party_name || "")} onChange={(e) => setField("party_name", e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Order Type</label>
              <input className="form-control" value={String(form.order_type || "")} onChange={(e) => setField("order_type", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Dates & Currency</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Transaction Date</label>
              <input type="date" className="form-control" value={String(form.transaction_date || "")} onChange={(e) => setField("transaction_date", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Valid Till</label>
              <input type="date" className="form-control" value={String(form.valid_till || "")} onChange={(e) => setField("valid_till", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Currency</label>
              <input className="form-control" value={String(form.currency || "USD")} onChange={(e) => setField("currency", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contact Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Contact Person</label>
              <input className="form-control" value={String(form.contact_person || "")} onChange={(e) => setField("contact_person", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Contact Email</label>
              <input type="email" className="form-control" value={String(form.contact_email || "")} onChange={(e) => setField("contact_email", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Contact Mobile</label>
              <input className="form-control" value={String(form.contact_mobile || "")} onChange={(e) => setField("contact_mobile", e.target.value)} />
            </div>
            <div className="col-md-12">
              <label className="form-label">Customer Address</label>
              <textarea className="form-control" rows={2} value={String(form.customer_address || "")} onChange={(e) => setField("customer_address", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Items</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th style={{ width: 80 }}>Qty</th>
                  <th style={{ width: 80 }}>UOM</th>
                  <th style={{ width: 100 }}>Rate</th>
                  <th style={{ width: 100 }}>Amount</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td><input className="form-control form-control-sm" value={item.item_name} onChange={(e) => updateItem(idx, "item_name", e.target.value)} /></td>
                    <td><input type="number" className="form-control form-control-sm" value={item.qty} onChange={(e) => updateItem(idx, "qty", Number(e.target.value))} /></td>
                    <td><input className="form-control form-control-sm" value={item.uom} onChange={(e) => updateItem(idx, "uom", e.target.value)} /></td>
                    <td><input type="number" className="form-control form-control-sm" value={item.rate} onChange={(e) => updateItem(idx, "rate", Number(e.target.value))} /></td>
                    <td className="text-end">{(item.qty * item.rate).toLocaleString()}</td>
                    <td><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(idx)}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setItems((p) => [...p, emptyItem()])}><Plus size={14} /> Add Item</button>
        </div>

        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Terms & Notes</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Terms</label>
              <textarea className="form-control" rows={3} value={String(form.terms || "")} onChange={(e) => setField("terms", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={3} value={String(form.notes || "")} onChange={(e) => setField("notes", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/quotations" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
