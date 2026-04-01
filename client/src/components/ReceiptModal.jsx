const METHOD_ICON = {
  'School Fees':      '🏫',
  'MTN Mobile Money': '📱',
  'Bank Transfer':    '🏦',
};

const STATUS_COLOR = {
  Paid:    '#10b981',
  Partial: '#3b82f6',
  Pending: '#f59e0b',
  Overdue: '#ef4444',
};

export default function ReceiptModal({ payment: p, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
      <div style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:520, maxHeight:'92vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>

        {/* Action buttons — hidden on print */}
        <div className="no-print" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid #e2e8f0', background:'#f8fafc', borderRadius:'14px 14px 0 0' }}>
          <span style={{ fontSize:14, fontWeight:600, color:'#1e293b' }}>Payment Receipt</span>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handlePrint} style={{ padding:'8px 16px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:7, cursor:'pointer', fontSize:13, fontWeight:600 }}>
              🖨️ Print
            </button>
            <button onClick={onClose} style={{ padding:'8px 16px', background:'#f1f5f9', border:'none', borderRadius:7, cursor:'pointer', fontSize:13 }}>
              Close
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div id="receipt-content" style={{ padding:'28px 32px', fontFamily:'Georgia, serif' }}>

          {/* School Header */}
          <div style={{ textAlign:'center', marginBottom:24, paddingBottom:20, borderBottom:'2px dashed #e2e8f0' }}>
            <div style={{ fontSize:32, marginBottom:4 }}>🏫</div>
            <h2 style={{ margin:'0 0 4px', fontSize:20, fontWeight:700, color:'#1e293b', fontFamily:'Arial, sans-serif' }}>
              School Management System
            </h2>
            <div style={{ fontSize:12, color:'#64748b', fontFamily:'Arial, sans-serif' }}>Official Payment Receipt</div>
          </div>

          {/* Receipt Number & Status */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:11, color:'#64748b', fontFamily:'Arial, sans-serif', textTransform:'uppercase', letterSpacing:'0.05em' }}>Receipt Number</div>
              <div style={{ fontSize:16, fontWeight:700, color:'#3b82f6', fontFamily:'Arial, sans-serif' }}>{p.receiptNumber}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ background: (STATUS_COLOR[p.status] || '#64748b') + '20', color: STATUS_COLOR[p.status] || '#64748b', padding:'4px 14px', borderRadius:20, fontSize:12, fontWeight:700, fontFamily:'Arial, sans-serif' }}>
                {p.status}
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div style={{ background:'#f8fafc', borderRadius:8, padding:'14px 16px', marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'Arial, sans-serif', marginBottom:10 }}>Student Information</div>
            <Row label="Student Name"   value={p.studentId?.name} />
            <Row label="Student ID"     value={p.studentId?.studentId} />
            <Row label="Guardian"       value={p.studentId?.guardianName} />
          </div>

          {/* Payment Details */}
          <div style={{ background:'#f8fafc', borderRadius:8, padding:'14px 16px', marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'Arial, sans-serif', marginBottom:10 }}>Payment Details</div>
            <Row label="Fee Type"       value={p.feeType} />
            <Row label="Term"           value={p.term} />
            <Row label="Academic Year"  value={p.academicYear} />
            <Row label="Payment Method" value={`${METHOD_ICON[p.paymentMethod]} ${p.paymentMethod}`} />
            <Row label="Payment Date"   value={p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' }) : 'Not paid yet'} />
            <Row label="Due Date"       value={p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' }) : '—'} />

            {/* MoMo details */}
            {p.paymentMethod === 'MTN Mobile Money' && p.momoNumber && (
              <>
                <Row label="MoMo Number"     value={p.momoNumber} />
                <Row label="Transaction ID"  value={p.momoTransactionId || '—'} />
              </>
            )}

            {/* Bank details */}
            {p.paymentMethod === 'Bank Transfer' && p.bankName && (
              <>
                <Row label="Bank Name"       value={p.bankName} />
                <Row label="Account Number"  value={p.accountNumber || '—'} />
                <Row label="Transaction ID"  value={p.bankTransactionId || '—'} />
              </>
            )}
          </div>

          {/* Amount Summary */}
          <div style={{ borderRadius:8, overflow:'hidden', marginBottom:18, border:'1px solid #e2e8f0' }}>
            <div style={{ background:'#1e293b', padding:'10px 16px', fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', fontFamily:'Arial, sans-serif' }}>
              Amount Summary
            </div>
            <div style={{ padding:'4px 0' }}>
              <AmountRow label="Total Billed"    amount={p.totalAmount} color="#1e293b" />
              <AmountRow label="Amount Paid"     amount={p.amountPaid}  color="#10b981" />
              <div style={{ borderTop:'1px solid #e2e8f0', margin:'4px 0' }} />
              <AmountRow label="Balance Due"     amount={p.balance}     color={p.balance > 0 ? '#ef4444' : '#10b981'} bold />
            </div>
          </div>

          {/* Notes */}
          {p.notes && (
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#64748b', fontFamily:'Arial, sans-serif', marginBottom:4 }}>NOTES</div>
              <div style={{ fontSize:13, color:'#374151', fontFamily:'Arial, sans-serif' }}>{p.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ textAlign:'center', paddingTop:20, borderTop:'2px dashed #e2e8f0', marginTop:20 }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontFamily:'Arial, sans-serif', lineHeight:1.6 }}>
              This is an official receipt generated by SchoolMS.<br />
              Issued on {new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}<br />
              <strong style={{ color:'#64748b' }}>Thank you!</strong>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', fontSize:13, fontFamily:'Arial, sans-serif' }}>
      <span style={{ color:'#64748b' }}>{label}</span>
      <span style={{ fontWeight:500, color:'#1e293b' }}>{value || '—'}</span>
    </div>
  );
}

function AmountRow({ label, amount, color, bold }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 16px', fontFamily:'Arial, sans-serif' }}>
      <span style={{ fontSize:13, color:'#64748b', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? 16 : 13, fontWeight: bold ? 700 : 600, color }}>GH₵ {amount?.toLocaleString()}</span>
    </div>
  );
}
