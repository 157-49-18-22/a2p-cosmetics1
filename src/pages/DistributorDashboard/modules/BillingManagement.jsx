import API_BASE_URL from '../../../apiConfig.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useSession } from '../../../hooks/useSession.js';
import { FileText, Plus, Search, Download, Send, CheckCircle, Clock, XCircle, Eye, Printer, Edit2, Sparkles, ChevronDown } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const API_BASE = `${API_BASE_URL}/distributors`;

const statusBadge = (s) => ({
  Paid: <span className="dd-badge dd-badge-green"><CheckCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
  Unpaid: <span className="dd-badge dd-badge-yellow"><Clock size={10} style={{ marginRight: 4 }} />{s}</span>,
  Overdue: <span className="dd-badge dd-badge-red"><XCircle size={10} style={{ marginRight: 4 }} />{s}</span>,
}[s] || <span className="dd-badge dd-badge-yellow">{s}</span>);

const BillingManagement = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [visibleCount, setVisibleCount] = useState(9);
  const { user: authUser } = useAuth();
  const { user: sessionUser } = useSession();
  const distributor = authUser || sessionUser;
  const distributorId = distributor?.id || 1;

  const [newBill, setNewBill] = useState({ 
    bill_number: '', 
    amount: '', 
    status: 'Unpaid', 
    due_date: '',
    buyer_name: '',
    buyer_company: '',
    buyer_address: '',
    buyer_city: '',
    buyer_state: '',
    buyer_pincode: '',
    buyer_contact: '',
    buyer_email: '',
    buyer_gstin: '',
    products: [{ name: '', quantity: 1, price: '', hsn_sac: '' }],
    bank_account_holder: '',
    bank_account_number: '',
    bank_name: '',
    bank_ifsc: '',
    bank_branch: ''
  });
  const [selectedBill, setSelectedBill] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchBills = async (targetId) => {
    const idToUse = targetId || distributorId;
    try {
      const res = await axios.get(`${API_BASE}/${idToUse}/bills`);
      setBills(res.data);
    } catch (err) {
      console.error('Error fetching bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoData = () => {
    const randomInv = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const demoProducts = [
      { name: 'Radiance Vitamin C Serum (50ml)', quantity: 20, price: 650, hsn_sac: '330499' },
      { name: 'Ultra Glow Night Moisturizer (100g)', quantity: 15, price: 800, hsn_sac: '330499' }
    ];
    const totalAmount = demoProducts.reduce((acc, p) => acc + (p.quantity * p.price), 0);

    setNewBill({
      bill_number: randomInv,
      amount: totalAmount,
      status: 'Unpaid',
      due_date: nextWeek,
      buyer_name: 'Rahul Sharma',
      buyer_company: 'Sharma Beauty & Retail Store',
      buyer_address: 'Shop 14, Galaxy Market, MG Road',
      buyer_city: 'Mumbai',
      buyer_state: 'Maharashtra',
      buyer_pincode: '400001',
      buyer_contact: '+91 98765 43210',
      buyer_email: 'rahul.beauty@example.com',
      buyer_gstin: '27AABCU9603R1ZM',
      products: demoProducts,
      bank_account_holder: 'A2P Pinnacle Cosmetics Pvt Ltd',
      bank_account_number: '98765432100123',
      bank_name: 'HDFC Bank',
      bank_ifsc: 'HDFC0001234',
      bank_branch: 'Fort, Mumbai'
    });
  };

  const handleSaveBill = async () => {
    if (!newBill.bill_number || !newBill.amount) return alert('Bill number and amount are required');
    setSaving(true);
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/bills/${editId}`, newBill);
      } else {
        await axios.post(`${API_BASE}/bills`, { ...newBill, distributor_id: distributorId });
      }
      setShowForm(false);
      setIsEditing(false);
      setEditId(null);
      setNewBill({ 
        bill_number: '', 
        amount: '', 
        status: 'Unpaid', 
        due_date: '',
        buyer_name: '',
        buyer_company: '',
        buyer_address: '',
        buyer_city: '',
        buyer_state: '',
        buyer_pincode: '',
        buyer_contact: '',
        buyer_email: '',
        buyer_gstin: '',
        products: [{ name: '', quantity: 1, price: '', hsn_sac: '' }],
        bank_account_holder: '',
        bank_account_number: '',
        bank_name: '',
        bank_ifsc: '',
        bank_branch: ''
      });
      fetchBills();
      alert('✅ Invoice saved successfully!');
    } catch (err) {
      console.error('Error saving bill:', err);
      const errMsg = err.response?.data?.error || err.message || 'Error occurred';
      alert(`❌ Failed to save invoice: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (bill) => {
    setNewBill({
      bill_number: bill.bill_number,
      amount: bill.amount,
      status: bill.status,
      due_date: bill.due_date ? new Date(bill.due_date).toISOString().split('T')[0] : '',
      buyer_name: bill.buyer_name || '',
      buyer_company: bill.buyer_company || '',
      buyer_address: bill.buyer_address || '',
      buyer_city: bill.buyer_city || '',
      buyer_state: bill.buyer_state || '',
      buyer_pincode: bill.buyer_pincode || '',
      buyer_contact: bill.buyer_contact || '',
      buyer_email: bill.buyer_email || '',
      buyer_gstin: bill.buyer_gstin || '',
      products: bill.products || [{ name: '', quantity: 1, price: '', hsn_sac: '' }],
      bank_account_holder: bill.bank_account_holder || '',
      bank_account_number: bill.bank_account_number || '',
      bank_name: bill.bank_name || '',
      bank_ifsc: bill.bank_ifsc || '',
      bank_branch: bill.bank_branch || ''
    });
    setEditId(bill.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleAddProduct = () => {
    setNewBill({
      ...newBill,
      products: [...newBill.products, { name: '', quantity: 1, price: '', hsn_sac: '' }]
    });
  };

  const handleRemoveProduct = (index) => {
    if (newBill.products.length > 1) {
      const updatedProducts = newBill.products.filter((_, i) => i !== index);
      setNewBill({ ...newBill, products: updatedProducts });
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = newBill.products.map((product, i) => {
      if (i === index) {
        return { ...product, [field]: value };
      }
      return product;
    });
    setNewBill({ ...newBill, products: updatedProducts });
  };

  const handleExportBills = () => {
    if (bills.length === 0) return alert('No invoices to export');
    const headers = ['Invoice ID', 'Amount (₹)', 'Due Date', 'Status'];
    const rows = bills.map(b => [b.bill_number, b.amount, b.due_date, b.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `A2P_Invoices_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDownloadSingle = (bill) => {
    const rawTotal = parseFloat(bill.amount) || 0;
    const subtotalNum = rawTotal / 1.18;
    const taxNum = rawTotal - subtotalNum;
    const subtotal = subtotalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const tax = taxNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedTotal = rawTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const issueDate = new Date(bill.created_at || Date.now()).toLocaleDateString('en-GB');
    const dueDate = bill.due_date ? new Date(bill.due_date).toLocaleDateString('en-GB') : 'Immediate';
    const logoUrl = window.location.origin + '/A2P final logo.png';

    const productsList = (bill.products && bill.products.length > 0)
      ? bill.products
      : [{ name: 'Wholesale Cosmetics & Skincare Products', quantity: 1, price: rawTotal, hsn_sac: '330499' }];

    const productRows = productsList.map((product, idx) => {
      const q = parseFloat(product.quantity) || 1;
      const p = parseFloat(product.price) || 0;
      const t = (q * p).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const bg = idx % 2 === 0 ? '#ffffff' : '#fafafa';
      return `
        <tr style="border-bottom: 1px solid #f1f5f9; background: ${bg};">
          <td style="padding: 9px 14px; text-align: left; color: #0f172a; font-weight: 600; font-size: 11px;">
            ${product.name || 'Product'}
            ${product.hsn_sac ? `<div style="font-size: 9px; color: #64748b; font-weight: 500; margin-top: 1px;">HSN/SAC: ${product.hsn_sac}</div>` : ''}
          </td>
          <td style="padding: 9px 12px; text-align: center; color: #334155; font-size: 11px; font-weight: 600;">${q}</td>
          <td style="padding: 9px 14px; text-align: right; color: #334155; font-size: 11px;">₹${p.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="padding: 9px 14px; text-align: right; color: #0f172a; font-weight: 700; font-size: 11px;">₹${t}</td>
        </tr>
      `;
    }).join('');

    const container = document.createElement('div');
    container.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; width: 750px; background: #ffffff; padding: 30px 34px; box-sizing: border-box; position: relative;">
        
        <!-- Top Luxury Accent Line -->
        <div style="height: 4px; width: 100%; background: #ff0000; border-radius: 2px; margin-bottom: 20px;"></div>

        <!-- Header Section -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; padding-bottom: 16px; border-bottom: 1.5px solid #f1f5f9;">
          <tr>
            <td style="width: 50%; vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${logoUrl}" alt="A2P Logo" style="height: 46px; max-width: 175px; object-fit: contain;" />
              </div>
            </td>
            <td style="width: 50%; text-align: right; vertical-align: middle;">
              <div style="font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #ff0000; text-transform: uppercase; line-height: 1;">TAX INVOICE</div>
              <div style="margin-top: 5px; font-size: 11px; font-weight: 700; color: #334155;">
                INVOICE NO: <span style="color: #ff0000; font-weight: 900; letter-spacing: 0.5px;">${bill.bill_number}</span>
              </div>
              <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;">
                Date: <strong style="color: #1e293b;">${issueDate}</strong> &nbsp;|&nbsp; Due Date: <strong style="color: #1e293b;">${dueDate}</strong>
              </div>
            </td>
          </tr>
        </table>

        <!-- Billed To & Issued By Cards -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 10px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 13px 15px; min-height: 115px; box-sizing: border-box;">
                <div style="font-size: 8.5px; font-weight: 800; color: #ff0000; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">BILLED TO (BUYER)</div>
                <div style="font-size: 13.5px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${bill.buyer_name || 'Valued Partner'}</div>
                ${bill.buyer_company ? `<div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 2px;">${bill.buyer_company}</div>` : ''}
                ${bill.buyer_address ? `<div style="font-size: 9.5px; color: #64748b; line-height: 1.4;">${bill.buyer_address}</div>` : ''}
                ${(bill.buyer_city || bill.buyer_state) ? `<div style="font-size: 9.5px; color: #64748b;">${[bill.buyer_city, bill.buyer_state].filter(Boolean).join(', ')}${bill.buyer_pincode ? ` - ${bill.buyer_pincode}` : ''}</div>` : ''}
                <div style="margin-top: 5px; font-size: 9.5px; color: #475569;">
                  ${bill.buyer_contact ? `<span><strong>Phone:</strong> ${bill.buyer_contact}</span> &nbsp; ` : ''}
                  ${bill.buyer_email ? `<span><strong>Email:</strong> ${bill.buyer_email}</span>` : ''}
                </div>
                ${bill.buyer_gstin ? `<div style="margin-top: 5px; font-size: 9.5px; color: #0f172a; font-weight: 700;">GSTIN: <span style="color: #ff0000;">${bill.buyer_gstin}</span></div>` : ''}
              </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 10px;">
              <div style="background: #fff8f8; border: 1px solid #fee2e2; border-radius: 8px; padding: 13px 15px; min-height: 115px; box-sizing: border-box;">
                <div style="font-size: 8.5px; font-weight: 800; color: #ff0000; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">ISSUED BY (SELLER)</div>
                <div style="font-size: 13.5px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">A2P AID 2 PINNACLE</div>
                <div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 2px;">Cosmetics & Skincare Pvt. Ltd.</div>
                <div style="font-size: 9.5px; color: #64748b; line-height: 1.4;">Corporate Trade Center, Mumbai, Maharashtra - 400001</div>
                <div style="margin-top: 5px; font-size: 9.5px; color: #475569;">
                  <span><strong>Email:</strong> support@a2pcosmetics.com</span> &nbsp;
                  <span><strong>Web:</strong> www.a2pcosmetics.com</span>
                </div>
                <div style="margin-top: 5px; font-size: 9.5px; color: #0f172a; font-weight: 700;">
                  GSTIN: <span style="color: #ff0000; font-weight: 800;">27AABCA1234F1Z9</span>
                </div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Itemized Products Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border-radius: 6px; overflow: hidden; border: 1px solid #f1f5f9;">
          <thead>
            <tr style="background: #ff0000; color: #ffffff;">
              <th style="padding: 8px 14px; text-align: left; font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">ITEM DESCRIPTION</th>
              <th style="padding: 8px 12px; text-align: center; font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; width: 65px;">QTY</th>
              <th style="padding: 8px 14px; text-align: right; font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; width: 110px;">RATE (₹)</th>
              <th style="padding: 8px 14px; text-align: right; font-size: 9px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; width: 125px;">AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <!-- Bottom Split: Bank Info & Totals Card -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
          <tr>
            <!-- Bank Details -->
            <td style="width: 52%; vertical-align: top; padding-right: 12px;">
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 13px 15px;">
                <div style="font-size: 8.5px; font-weight: 800; color: #ff0000; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                  BANK & PAYMENT DETAILS
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 9.5px; color: #334155;">
                  <tr>
                    <td style="padding: 2.5px 0; color: #64748b; width: 40%;">Bank Name:</td>
                    <td style="padding: 2.5px 0; font-weight: 700; color: #0f172a;">${bill.bank_name || 'HDFC Bank'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 2.5px 0; color: #64748b;">Account Holder:</td>
                    <td style="padding: 2.5px 0; font-weight: 700; color: #0f172a;">${bill.bank_account_holder || 'A2P Pinnacle Cosmetics Pvt Ltd'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 2.5px 0; color: #64748b;">Account Number:</td>
                    <td style="padding: 2.5px 0; font-weight: 800; color: #0f172a; letter-spacing: 0.5px;">${bill.bank_account_number || '98765432100123'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 2.5px 0; color: #64748b;">IFSC Code:</td>
                    <td style="padding: 2.5px 0; font-weight: 800; color: #0f172a; letter-spacing: 0.5px;">${bill.bank_ifsc || 'HDFC0001234'}</td>
                  </tr>
                  ${bill.bank_branch ? `<tr><td style="padding: 2.5px 0; color: #64748b;">Branch:</td><td style="padding: 2.5px 0; font-weight: 600; color: #0f172a;">${bill.bank_branch}</td></tr>` : ''}
                </table>
              </div>
            </td>

            <!-- Summary & Total -->
            <td style="width: 48%; vertical-align: top;">
              <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
                <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 6px 12px; color: #64748b; font-weight: 600;">Taxable Amount (Subtotal):</td>
                    <td style="padding: 6px 12px; text-align: right; font-weight: 700; color: #0f172a;">₹${subtotal}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 6px 12px; color: #64748b; font-weight: 600;">GST (18% Integrated Tax):</td>
                    <td style="padding: 6px 12px; text-align: right; font-weight: 700; color: #0f172a;">₹${tax}</td>
                  </tr>
                  <tr style="background: #ff0000; color: #ffffff;">
                    <td style="padding: 8px 12px; font-size: 10.5px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase;">TOTAL AMOUNT DUE:</td>
                    <td style="padding: 8px 12px; font-size: 12px; text-align: right; font-weight: 900; letter-spacing: 0.5px;">₹${formattedTotal}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>

        <!-- Terms & Signature Footer -->
        <table style="width: 100%; border-collapse: collapse; border-top: 1.5px solid #f1f5f9; padding-top: 14px; margin-top: 4px;">
          <tr>
            <td style="width: 60%; vertical-align: bottom;">
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 2px;">Thank you for your business!</div>
              <div style="font-size: 8.5px; color: #64748b; line-height: 1.4;">
                This is a computer-generated tax invoice. Goods once sold are subject to company warranty terms.
              </div>
            </td>
            <td style="width: 40%; text-align: right; vertical-align: bottom;">
              <div style="display: inline-block; text-align: center; width: 160px;">
                <div style="border-bottom: 1.5px solid #0f172a; width: 130px; margin: 0 auto 4px auto;"></div>
                <div style="font-size: 9.5px; font-weight: 800; color: #0f172a;">Authorized Signatory</div>
                <div style="font-size: 8px; color: #64748b; text-transform: uppercase;">A2P AID 2 PINNACLE COSMETICS</div>
              </div>
            </td>
          </tr>
        </table>

      </div>
    `;

    html2pdf().from(container).set({
      margin: 6,
      filename: `Invoice_${bill.bill_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setShowViewModal(true);
  };

  useEffect(() => {
    if (distributorId) {
      fetchBills(distributorId);
    }
  }, [distributorId]);

  useEffect(() => {
    setVisibleCount(9);
  }, [filterStatus, search]);

  const filtered = bills.filter(inv => {
    const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
    const query = search.toLowerCase().trim();
    if (!query) return matchesStatus;
    const matchesQuery = (
      (inv.bill_number && String(inv.bill_number).toLowerCase().includes(query)) ||
      (inv.buyer_name && String(inv.buyer_name).toLowerCase().includes(query)) ||
      (inv.buyer_company && String(inv.buyer_company).toLowerCase().includes(query)) ||
      (inv.buyer_city && String(inv.buyer_city).toLowerCase().includes(query))
    );
    return matchesStatus && matchesQuery;
  });

  const totalBilled = bills.reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const totalPaid = bills.filter(i => i.status === 'Paid').reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);
  const totalPending = bills.filter(i => i.status !== 'Paid').reduce((a, i) => a + (parseFloat(i.amount) || 0), 0);

  if (loading) return <div className="dd-loading">Loading Billing...</div>;

  return (
    <div className="dd-module-enter">
      <div className="dd-module-header">
        <div className="dd-header-info">
          <h1 className="dd-module-title">Billing Management</h1>
          <p className="dd-module-subtitle">Create and manage invoices, payments & dues</p>
        </div>
        <div className="dd-header-btns">
          <button className="dd-btn dd-btn-outline" onClick={handleExportBills}><Download size={14} /> Export</button>
          <button className="dd-btn dd-btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={15} /> New Invoice</button>
        </div>
      </div>

      <div className="dd-stats-grid">
        {[
          { label: 'Total Billed', value: `₹${(totalBilled / 1000).toFixed(1)}K`, color: '#f3eeff', iconColor: '#a855f7' },
          { label: 'Total Collected', value: `₹${(totalPaid / 1000).toFixed(1)}K`, color: '#f0fdf4', iconColor: '#16a34a' },
          { label: 'Outstanding Dues', value: `₹${(totalPending / 1000).toFixed(1)}K`, color: '#fff0f3', iconColor: '#e11d48' },
        ].map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color }}>
              <FileText size={18} color={s.iconColor} />
            </div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="dd-card" style={{ marginBottom: 24 }}>
          <div className="dd-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="dd-card-title">{isEditing ? 'Edit Invoice' : 'Generate New Invoice'}</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {!isEditing && (
                <button 
                  type="button"
                  className="dd-btn" 
                  style={{ 
                    padding: '6px 14px', 
                    fontSize: '0.78rem', 
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                  }} 
                  onClick={handleFillDemoData}
                >
                  <Sparkles size={14} /> Auto-Fill Demo Data
                </button>
              )}
              <button className="dd-btn dd-btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => { setShowForm(false); setIsEditing(false); }}>Cancel</button>
            </div>
          </div>
          <div className="dd-card-body">
            {/* Basic Invoice Details */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Basic Invoice Details</h4>
              <div className="dd-form-grid">
                <div className="dd-field"><label>Invoice Number</label><input placeholder="e.g. INV-2024-001" value={newBill.bill_number} onChange={e => setNewBill({ ...newBill, bill_number: e.target.value })} /></div>
                <div className="dd-field"><label>Amount (₹)</label><input type="number" placeholder="25000" value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })} /></div>
                <div className="dd-field"><label>Due Date</label><input type="date" value={newBill.due_date} onChange={e => setNewBill({ ...newBill, due_date: e.target.value })} /></div>
                <div className="dd-field"><label>Status</label>
                  <select value={newBill.status} onChange={e => setNewBill({ ...newBill, status: e.target.value })}><option>Unpaid</option><option>Paid</option><option>Overdue</option></select>
                </div>
              </div>
            </div>

            {/* Buyer Information */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buyer Information</h4>
              <div className="dd-form-grid">
                <div className="dd-field"><label>Buyer Name</label><input placeholder="Full name" value={newBill.buyer_name} onChange={e => setNewBill({ ...newBill, buyer_name: e.target.value })} /></div>
                <div className="dd-field"><label>Company Name</label><input placeholder="Company name" value={newBill.buyer_company} onChange={e => setNewBill({ ...newBill, buyer_company: e.target.value })} /></div>
                <div className="dd-field"><label>Contact Number</label><input placeholder="+91 98765 43210" value={newBill.buyer_contact} onChange={e => setNewBill({ ...newBill, buyer_contact: e.target.value })} /></div>
                <div className="dd-field"><label>Email</label><input type="email" placeholder="email@example.com" value={newBill.buyer_email} onChange={e => setNewBill({ ...newBill, buyer_email: e.target.value })} /></div>
                <div className="dd-field"><label>GSTIN</label><input placeholder="27ABCDE1234F1Z5" value={newBill.buyer_gstin} onChange={e => setNewBill({ ...newBill, buyer_gstin: e.target.value })} /></div>
                <div className="dd-field"><label>Address</label><input placeholder="Street address" value={newBill.buyer_address} onChange={e => setNewBill({ ...newBill, buyer_address: e.target.value })} /></div>
                <div className="dd-field"><label>City</label><input placeholder="City" value={newBill.buyer_city} onChange={e => setNewBill({ ...newBill, buyer_city: e.target.value })} /></div>
                <div className="dd-field"><label>State</label><input placeholder="State" value={newBill.buyer_state} onChange={e => setNewBill({ ...newBill, buyer_state: e.target.value })} /></div>
                <div className="dd-field"><label>Pincode</label><input placeholder="400001" value={newBill.buyer_pincode} onChange={e => setNewBill({ ...newBill, buyer_pincode: e.target.value })} /></div>
              </div>
            </div>

            {/* Product Details */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Details</h4>
              {newBill.products.map((product, index) => (
                <div key={index} style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Product {index + 1}</span>
                    {newBill.products.length > 1 && (
                      <button 
                        className="dd-btn dd-btn-outline" 
                        style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#e11d48', borderColor: '#e11d48' }}
                        onClick={() => handleRemoveProduct(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="dd-form-grid">
                    <div className="dd-field"><label>Product Name</label><input placeholder="Product name" value={product.name} onChange={e => handleProductChange(index, 'name', e.target.value)} /></div>
                    <div className="dd-field"><label>Quantity</label><input type="number" placeholder="1" value={product.quantity} onChange={e => handleProductChange(index, 'quantity', e.target.value)} /></div>
                    <div className="dd-field"><label>Price (₹)</label><input type="number" placeholder="1000" value={product.price} onChange={e => handleProductChange(index, 'price', e.target.value)} /></div>
                    <div className="dd-field"><label>HSN/SAC Code</label><input placeholder="HSN/SAC" value={product.hsn_sac} onChange={e => handleProductChange(index, 'hsn_sac', e.target.value)} /></div>
                  </div>
                </div>
              ))}
              <button 
                className="dd-btn dd-btn-outline" 
                style={{ width: '100%', padding: '10px', fontSize: '0.8rem' }}
                onClick={handleAddProduct}
              >
                <Plus size={14} /> Add Another Product
              </button>
            </div>

            {/* Bank Details */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 16px 0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Details</h4>
              <div className="dd-form-grid">
                <div className="dd-field"><label>Account Holder Name</label><input placeholder="Account holder name" value={newBill.bank_account_holder} onChange={e => setNewBill({ ...newBill, bank_account_holder: e.target.value })} /></div>
                <div className="dd-field"><label>Account Number</label><input placeholder="Account number" value={newBill.bank_account_number} onChange={e => setNewBill({ ...newBill, bank_account_number: e.target.value })} /></div>
                <div className="dd-field"><label>Bank Name</label><input placeholder="Bank name" value={newBill.bank_name} onChange={e => setNewBill({ ...newBill, bank_name: e.target.value })} /></div>
                <div className="dd-field"><label>IFSC Code</label><input placeholder="IFSC code" value={newBill.bank_ifsc} onChange={e => setNewBill({ ...newBill, bank_ifsc: e.target.value })} /></div>
                <div className="dd-field"><label>Branch</label><input placeholder="Branch name" value={newBill.bank_branch} onChange={e => setNewBill({ ...newBill, bank_branch: e.target.value })} /></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button className="dd-btn dd-btn-primary" onClick={handleSaveBill} disabled={saving}>
                <CheckCircle size={14} /> {saving ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Table */}
      <div className="dd-card">
        <div className="dd-card-header" style={{ flexWrap: 'wrap', gap: 16, padding: '20px 24px', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', alignItems: window.innerWidth <= 768 ? 'stretch' : 'center' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Paid', 'Unpaid', 'Overdue'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: '1.5px solid', borderColor: filterStatus === s ? '#a855f7' : '#ede9f5',
                background: filterStatus === s ? '#f3eeff' : '#fff', color: filterStatus === s ? '#7c3aed' : '#6b7280', transition: 'all 0.2s',
                flex: window.innerWidth <= 480 ? 1 : 'none'
              }}>{s}</button>
            ))}
          </div>
          <div className="dd-search-inline" style={{ width: window.innerWidth <= 768 ? '100%' : 260 }}>
            <Search size={14} color="#9ca3af" />
            <input placeholder="Search invoice..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="dd-table-wrap">
          <table className="dd-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Buyer / Client</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.slice(0, visibleCount).map(inv => (
                <tr key={inv.id}>
                  <td style={{ color: '#7c3aed', fontWeight: 700 }}>{inv.bill_number}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{inv.buyer_name || '—'}</div>
                    {inv.buyer_company && (
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{inv.buyer_company}</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{parseFloat(inv.amount || 0).toLocaleString()}</td>
                  <td style={{ color: inv.status === 'Overdue' ? '#e11d48' : '#374151', fontWeight: inv.status === 'Overdue' ? 600 : 400 }}>
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td>{statusBadge(inv.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="dd-btn dd-btn-outline" title="View Invoice" style={{ padding: '5px 9px' }} onClick={() => handleViewDetails(inv)}><Eye size={13} /></button>
                      <button className="dd-btn dd-btn-outline" title="Download PDF" style={{ padding: '5px 9px' }} onClick={() => handleDownloadSingle(inv)}><Download size={13} /></button>
                      <button className="dd-btn dd-btn-outline" title="Edit Invoice" style={{ padding: '5px 9px' }} onClick={() => handleEditClick(inv)}><Edit2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>No invoices found</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination & Load More Controls */}
        {filtered.length > 0 && (
          <div style={{ 
            padding: '16px 24px', 
            borderTop: '1px solid #f1f5f9', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 12,
            background: '#fafafa'
          }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
              Showing <strong style={{ color: '#0f172a' }}>{Math.min(visibleCount, filtered.length)}</strong> of <strong style={{ color: '#0f172a' }}>{filtered.length}</strong> invoices
            </span>

            {filtered.length > visibleCount ? (
              <button 
                type="button"
                className="dd-btn" 
                style={{ 
                  padding: '8px 20px', 
                  fontSize: '0.82rem', 
                  fontWeight: 600, 
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.2s'
                }}
                onClick={() => setVisibleCount(prev => prev + 9)}
              >
                <ChevronDown size={16} /> Load More (+9 Invoices)
              </button>
            ) : filtered.length > 9 ? (
              <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={15} /> All {filtered.length} invoices loaded
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedBill && (
        <div className="dd-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="dd-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 'min(450px, 100%)', padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '30px 24px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Invoice</h2>
                  <p style={{ opacity: 0.8, fontSize: '0.8rem', marginTop: 4 }}>{selectedBill.bill_number}</p>
                </div>
                <div style={{ textAlign: window.innerWidth <= 480 ? 'left' : 'right', width: window.innerWidth <= 480 ? '100%' : 'auto' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>₹{parseFloat(selectedBill.amount).toLocaleString()}</div>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.9, letterSpacing: '0.05em' }}>Total Amount</span>
                </div>
              </div>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>Issue Date</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{new Date(selectedBill.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>Due Date</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: selectedBill.status === 'Overdue' ? '#e11d48' : '#1f2937' }}>{new Date(selectedBill.due_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>Status</label>
                  <div>{statusBadge(selectedBill.status)}</div>
                </div>
                <div>
                  <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: 4 }}>Payment Method</label>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Bank Transfer</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 12px 0', color: '#64748b' }}>Buyer Information</h4>
                <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                  <strong>{selectedBill.buyer_name || 'N/A'}</strong><br />
                  {selectedBill.buyer_company && <>{selectedBill.buyer_company}<br /></>}
                  {selectedBill.buyer_address && <>{selectedBill.buyer_address}<br /></>}
                  {selectedBill.buyer_city && selectedBill.buyer_state && <>{selectedBill.buyer_city}, {selectedBill.buyer_state} - {selectedBill.buyer_pincode || 'N/A'}<br /></>}
                  {selectedBill.buyer_contact && <>📞 {selectedBill.buyer_contact}<br /></>}
                  {selectedBill.buyer_email && <>✉️ {selectedBill.buyer_email}<br /></>}
                  {selectedBill.buyer_gstin && <>GSTIN: {selectedBill.buyer_gstin}</>}
                </div>
              </div>

              {selectedBill.products && selectedBill.products.length > 0 && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 12px 0', color: '#64748b' }}>Product Details</h4>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                    {selectedBill.products.map((product, index) => (
                      <div key={index} style={{ marginBottom: index < selectedBill.products.length - 1 ? '8px' : '0' }}>
                        <strong>{product.name || 'N/A'}</strong> - Qty: {product.quantity || 1} × ₹{parseFloat(product.price || 0).toLocaleString()} = ₹{parseFloat((product.quantity || 1) * (product.price || 0)).toLocaleString()}
                        {product.hsn_sac && <span style={{ fontSize: '0.7rem', color: '#666', marginLeft: '8px' }}>(HSN/SAC: {product.hsn_sac})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedBill.bank_account_holder && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 12px 0', color: '#64748b' }}>Bank Details</h4>
                  <div style={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
                    <strong>Account Holder:</strong> {selectedBill.bank_account_holder}<br />
                    {selectedBill.bank_account_number && <><strong>Account Number:</strong> {selectedBill.bank_account_number}<br /></>}
                    {selectedBill.bank_name && <><strong>Bank Name:</strong> {selectedBill.bank_name}<br /></>}
                    {selectedBill.bank_ifsc && <><strong>IFSC Code:</strong> {selectedBill.bank_ifsc}<br /></>}
                    {selectedBill.bank_branch && <><strong>Branch:</strong> {selectedBill.bank_branch}</>}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="dd-btn dd-btn-outline" style={{ flex: 1 }} onClick={() => setShowViewModal(false)}>Close</button>
                <button className="dd-btn dd-btn-primary" style={{ flex: 1 }} onClick={() => window.print()}><Printer size={14} /> Print</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;


