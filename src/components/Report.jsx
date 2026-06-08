import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, ExternalLink, Mail, Building2, MapPin, Download, FileText, Copy, Check, Loader2 } from 'lucide-react';
import styles from './Report.module.css';
import supabase from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';
import { usePDF } from 'react-to-pdf';

function Report({ report }) {

  const [copiedEmail, setCopiedEmail] = useState(null);
  const {session} = useAuth();
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { toPDF, targetRef } = usePDF({filename: `${report.part_number}_sourcing_report.pdf`});

  const handleSaveReport = async () => {
    if (!session.user) {
      alert('You have to be logged in to save reports.');
      return;
    }
    setSaving(true);

    try {
      const {error} = await supabase.from('reports').insert({
        user_id: session.user.id,
        part_number: report.part_number,
        description: report.description,
        market: report.market,
        availability_status: report.availability_status,
        suppliers: report.suppliers
      });

      if (error) {
        throw error;
      }
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(null), 3000);
    }
    catch (error) {
      console.error('Error saving report:', error);
      setSaveStatus('Error!');
      setTimeout(() => setSaveStatus(null), 3000);
    }
    finally {
      setSaving(false);
    }
  }

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 5000);
  };

  if (!report) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Stock': return styles.statusGreen;
      case 'Limited': return styles.statusYellow;
      case 'Out of Stock': return styles.statusRed;
      default: return styles.statusGray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Stock': return <CheckCircle2 size={20} />;
      case 'Limited': return <AlertTriangle size={20} />;
      case 'Out of Stock': return <XCircle size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className={styles.reportContainer} ref={targetRef}>
            <div className={styles.reportHeader}>
        <div className={styles.headerTop}>
          <h2>Sourcing Report: {report.part_number}</h2>
          <div className={`${styles.statusBadge} ${getStatusColor(report.availability_status)}`}>
            {getStatusIcon(report.availability_status)}
            <span>{report.availability_status}</span>
          </div>
        </div>
        <p className={styles.description}>{report.description}</p>
        
        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <MapPin size={16} />
            <span>Target Market: <strong>{report.market}</strong></span>
          </div>
          <div className={styles.metaItem}>
            <Building2 size={16} />
            <span>Suppliers Found: <strong>{report.suppliers.length}</strong></span>
          </div>
        </div>
      </div>

      <div className={styles.actionToolbar}>
        <button className={styles.actionBtnSecondary} onClick={handleSaveReport} disabled={saving}>
          {saving ? <Loader2 size={18} className={styles.spin} /> : (saveStatus === 'Saved!' ? <Check size={18} /> : <Download size={18} />)}
          {saving ? 'Saving...' : (saveStatus === 'Saved!' ? 'Saved!' : 'Save to Database')}
        </button>
        <button className={styles.actionBtnSecondary} onClick={() => toPDF()}>
          <FileText size={18} />
          Export PDF
        </button>
      </div>

            <div className={styles.suppliersSection}>
        <h3>Identified Suppliers</h3>

        {report.suppliers.length === 0 ? (
          <div className={styles.emptyState}>
            <Info size={24} />
            <p>No suppliers found for this part in the selected market.</p>
          </div>
        ) : (
          <div className={styles.supplierGrid}>
            {report.suppliers.map((supplier, idx) => (
              <div key={idx} className={styles.supplierCard}>
                <div className={styles.supplierHeader}>
                  <h4>{supplier.name}</h4>
                  <span className={styles.originBadge}>{supplier.country_of_origin}</span>
                </div>

                <div className={styles.supplierDetails}>
                  {supplier.price ? (
                    <div className={styles.priceTag}>
                      {supplier.currency} {supplier.price.toFixed(2)}
                    </div>
                  ) : (
                    <div className={styles.priceTagUnknown}>Price on request</div>
                  )}

                  {supplier.website && (
                    <div className={styles.contactLinks}>
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        <ExternalLink size={14} /> Website
                      </a>
                    </div>
                  )}

                  {supplier.contact_email && (
                    <div className={styles.emailContainer}>
                      <div className={styles.emailLabel}>
                        <Mail size={12} />
                        <span>Contact Email</span>
                      </div>
                      <div className={styles.emailField}>
                        <a href={`mailto:${supplier.contact_email}`} className={styles.emailLink} title={`Email ${supplier.name}`}>
                          {supplier.contact_email}
                        </a>
                        <button
                          onClick={() => handleCopyEmail(supplier.contact_email)}
                          className={styles.copyBtn}
                          title="Copy email to clipboard"
                          type="button"
                        >
                          {copiedEmail === supplier.contact_email ? (
                            <Check size={14} className={styles.checkIcon} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <button className={styles.quoteBtn}>
                    <Mail size={16} />
                    Prepare Quotation Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Report;
