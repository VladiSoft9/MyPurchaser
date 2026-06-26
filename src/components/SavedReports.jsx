import styles from "./SavedReports.module.css";
import { useAuth } from "../context/useAuth";
import { useEffect, useState, useMemo } from "react";
import supabase from "../services/supabaseClient";
import { Trash2, Loader2, AlertTriangle, Info, BarChart3, MapPin, CheckCircle2, XCircle} from 'lucide-react';

function SavedReports() {
    const { session } = useAuth();
    const [savedReports, setSavedReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [deletingReportId, setDeletingReportId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
        case 'In Stock': return styles.statusGreen;
        case 'Limited': return styles.statusYellow;
        case 'Out of Stock': return styles.statusRed;
        default: return styles.statusGray;     
    }
  };

    useEffect(() => {
        const fetchSavedReports = async () => {
            if (!session) {
                setError("You must be logged in to view saved reports.");
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('user_id', session.user.id);
                if (error) {
                    setError("Error fetching saved reports.");
                    return;
                }
                setSavedReports(data || []);
            } 
            catch (err) {
                setError("An unexpected error occurred.");
            }
            finally {
                setLoading(false);
            }
        }

        fetchSavedReports();
    }, [session]);

    const stats = useMemo(() => {
        if(!savedReports || savedReports.length === 0) {
            return {total: 0, markets: 0, inStock: 0, limited: 0, outOfStock: 0};
        }
        const total = savedReports.length;
        const markets = new Set(savedReports.map(report => report.market)).size;
        const inStock = savedReports.filter(report => report.availability_status === 'In Stock').length;
        const outOfStock = savedReports.filter(report => report.availability_status === 'Out of Stock').length;
        
        return {total, markets, inStock, outOfStock};
    }, [savedReports]);

    const handleDeleteReport = async (reportId) => {
        setDeletingReportId(reportId);
        setIsDeleting(true);

        try {
            const { error } = await supabase
                .from('reports')
                .delete()
                .eq('report_id', reportId);
            if (error) {
                console.error("Error deleting report:", error);
                return;
            }
            setSavedReports((prevReports) => prevReports.filter((report) => report.report_id !== reportId));
        } 
        catch (error) {
            console.error("Error deleting report:", error);
        } 
        finally {
            setDeletingReportId(null);
            setIsDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.statusState}>
                <Loader2 size={36} className={styles.statusIcon} />
                <p>Loading saved reports...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.statusState}>
                <AlertTriangle size={36} className={styles.errorIcon} />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <div>
                        <h1>Saved Reports</h1>
                        <p>{savedReports.length} report{savedReports.length === 1 ? '' : 's'} saved to your account.</p>
                    </div>
                    <div className={styles.summaryBadge}>{savedReports.length}</div>
                </div>

                {savedReports.length === 0 ? (
                <div className={styles.emptyState}>
                    <Info size={24} />
                    <p>No saved reports found.</p>
                </div>
            ) 
            : 
            (
                <>
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <div className={styles.statIconWrapper}>
                        <BarChart3 size={24} className={styles.statIcon} />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Reports</span>
                        <span className={styles.statVal}>{stats.total}</span>
                      </div>
                    </div>
                    
                    <div className={styles.statCard}>
                      <div className={styles.statIconWrapper}>
                        <MapPin size={24} className={styles.statIcon} />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Markets Analyzed</span>
                        <span className={styles.statVal}>{stats.markets}</span>
                      </div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statIconWrapper}>
                        <CheckCircle2 size={24} className={styles.statIconGreen} />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Parts In Stock</span>
                        <span className={styles.statVal}>{stats.inStock}</span>
                      </div>
                    </div>

                    <div className={styles.statCard}>
                      <div className={styles.statIconWrapper}>
                        <XCircle size={24} className={styles.statIconRed} />
                      </div>
                      <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Parts Out of Stock</span>
                        <span className={styles.statVal}>{stats.outOfStock}</span>
                      </div>
                    </div>
                </div>

                <div className={styles.grid}>
                    {savedReports.map((report) => {
                        const status = report.availability_status || 'Unknown';
                        const isDeletingThis = isDeleting && deletingReportId === report.report_id;

                        return (
                            <article key={report.report_id} className={styles.reportCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h2>{report.part_number || 'Unnamed Report'}</h2>
                                        <span className={styles.reportMeta}>{report.market || 'Global'}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={styles.deleteBtn}
                                        onClick={() => handleDeleteReport(report.report_id)}
                                        disabled={isDeletingThis}
                                        title="Delete saved report"
                                    >
                                        <Trash2 size={16} />
                                        {isDeletingThis ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>

                                <p className={styles.description}>{report.description || 'No description available.'}</p>

                                <div className={styles.cardFooter}>
                                    <span className={`${styles.statusBadge} ${getStatusColor(status)}`}>{status}</span>
                                    <span>{report.suppliers?.length ?? 0} supplier{(report.suppliers?.length === 1) ? '' : 's'}</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
                </>
            )}
            </div>
        </div>
    );
}

export default SavedReports;
