import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { Search, Loader2, PackageSearch } from 'lucide-react';
import styles from './Dashboard.module.css';

function Dashboard() {
  const [formData, setFormData] = useState({
    partNumber: '',
    description: '',
    referenceLink: '',
    market: 'Germany',
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const {session} = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReportData(null);}

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h1>New Sourcing Request</h1>
        <p>Enter the part details below to generate the part availability report.</p>
      </div>

      <div className={styles.formCard}>
        <form className={styles.searchForm}>
            <div className={styles.formGroup}>
              <label htmlFor="partNumber">Part Number</label>
              <input
                id="partNumber"
                name="partNumber"
                type="text"
                placeholder="e.g. SN-99432-A"
                value={formData.partNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="market">Target Market</label>
              <select
                id="market"
                name="market"
                value={formData.market}
                onChange={handleChange}
              >
                <option value="Germany">Germany</option>
                <option value="France">France</option>
              </select>
            </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Part Description & Specifications *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Provide any known specifications, materials, or alternative acceptable brands..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="referenceLink">Reference Link (Optional)</label>
            <input
              id="referenceLink"
              name="referenceLink"
              type="url"
              placeholder="e.g. https://manufacturer.com/part-details"
              value={formData.referenceLink}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formActions}>
            <button 
              type="submit" 
              className={styles.searchBtn}
              disabled={loading || !formData.partNumber || !formData.description}
            >
              {loading ? (
                <>
                  <Loader2 className={styles.spinner} size={20} />
                  <span>Searching & Analyzing...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Create Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

  export default Dashboard;