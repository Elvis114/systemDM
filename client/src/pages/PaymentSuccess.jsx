import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const [status,   setStatus]   = useState('verifying'); // verifying | success | failed
  const [payment,  setPayment]  = useState(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('failed');
      return;
    }

    api.get(`/paystack/verify/${reference}`)
      .then(r => {
        setPayment(r.data.payment);
        setStatus('success');
        toast.success('Payment verified successfully!');
      })
      .catch(err => {
        console.error(err);
        setStatus('failed');
        toast.error('Payment verification failed');
      });
  }, []);

  if (status === 'verifying') {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Verifying your payment...</div>
        <div style={{ fontSize: 13, color: '#64748b' }}>Please wait, do not close this page</div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center', padding: 40, background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Payment Failed</h2>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
          Your payment could not be verified. If money was deducted, please contact the school bursar with your transaction reference.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate('/pay-fees')} style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Try Again
          </button>
          <button onClick={() => navigate('/')} style={{ padding: '10px 24px', background: '#f1f5f9', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 16px' }}>
      {/* Success card */}
      <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 16, padding: 32, textAlign: 'center', color: '#fff', marginBottom: 20, boxShadow: '0 8px 32px rgba(16,185,129,0.3)' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
        <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800 }}>Payment Successful!</h2>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>Your payment has been received and recorded</p>
      </div>

      {/* Receipt */}
      {payment && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1e293b' }}>🧾 Receipt</h3>

          {[
            ['Receipt Number', payment.receiptNumber],
            ['Student',        payment.studentId?.name || '—'],
            ['Fee Type',       payment.feeType],
            ['Term',           payment.term],
            ['Amount Paid',    `GH₵ ${payment.amountPaid?.toLocaleString()}`],
            ['Balance',        `GH₵ ${payment.balance?.toLocaleString()}`],
            ['Payment Method', payment.paymentMethod],
            ['Date',           payment.paymentDate ? new Date(payment.paymentDate).toLocaleString('en-GB', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'],
            ['Reference',      payment.paystackReference],
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{l}</span>
              <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
            </div>
          ))}

          <div style={{ marginTop: 12, padding: '10px 14px', background: payment.balance > 0 ? '#fffbeb' : '#f0fdf4', borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: payment.balance > 0 ? '#92400e' : '#065f46' }}>
              {payment.balance > 0
                ? `⚠️ Outstanding balance: GH₵ ${payment.balance?.toLocaleString()}`
                : '✅ Fully paid — no outstanding balance'}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => window.print()} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          🖨️ Print Receipt
        </button>
        <button onClick={() => navigate('/payment-history')} style={{ flex: 1, padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          📋 View History
        </button>
        <button onClick={() => navigate('/pay-fees')} style={{ flex: 1, padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          💳 Pay Again
        </button>
      </div>
    </div>
  );
}
