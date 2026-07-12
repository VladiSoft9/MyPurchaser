import styles from "./SavedReports.module.css";
import { useAuth } from "../context/useAuth";
import { useEffect, useState, useMemo } from "react";
import supabase from "../services/supabaseClient";
import { Trash2, Loader2, AlertTriangle, Info, BarChart3, MapPin, CheckCircle2, XCircle, Eye, Download, ArrowLeft, Search } from 'lucide-react';
import Report from "./Report";

function SavedReports() {
  const { session } = useAuth();
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deletingReportId, setDeletingReportId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeReport, setActiveReport] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [marketFilter, setMarketFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return styles.statusGreen;
      case "Limited":
        return styles.statusYellow;
      case "Out of Stock":
        return styles.statusRed;
      default:
        return styles.statusGray;
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
          .from("reports")
          .select("*")
          .eq("user_id", session.user.id);
        if (error) {
          setError("Error fetching saved reports.");
          return;
        }
        setSavedReports(data || []);
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedReports();
  }, [session]);

  const stats = useMemo(() => {
    if (!savedReports || savedReports.length === 0) {
      return { total: 0, markets: 0, inStock: 0, limited: 0, outOfStock: 0 };
    }
    const total = savedReports.length;
    const markets = new Set(savedReports.map((report) => report.market)).size;
    const inStock = savedReports.filter(
      (report) => report.availability_status === "In Stock",
    ).length;
    const outOfStock = savedReports.filter(
      (report) => report.availability_status === "Out of Stock",
    ).length;

    return { total, markets, inStock, outOfStock };
  }, [savedReports]);

  const uniqueMarketList = useMemo(() => {
    return ["All", ... new Set(savedReports.map((report) => report.market))];
  }, [savedReports]);

  const handleDeleteReport = async (reportId) => {
    setDeletingReportId(reportId);
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("report_id", reportId);
      if (error) {
        console.error("Error deleting report:", error);
        return;
      }
      setSavedReports((prevReports) =>
        prevReports.filter((report) => report.report_id !== reportId),
      );

      if (activeReport?.report_id === reportId) {
        setActiveReport(null);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    } finally {
      setDeletingReportId(null);
      setIsDeleting(false);
    }
  };

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

  if (activeReport) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.detailContent}>
          <div className={styles.detailHeader}>
            <button
              className={styles.backBtn}
              onClick={() => setActiveReport(null)}
            >
              <ArrowLeft size={18} />
              <span>Back to My Reports</span>
            </button>

            <button
              className={styles.detailDeleteBtn}
              onClick={() => setDeletingReportId(activeReport.report_id)}
            >
              <Trash2 size={18} />
              <span>Delete Report</span>
            </button>
          </div>

          {deletingReportId === activeReport.report_id && (
            <div className={styles.confirmOverlay}>
              <div className={styles.confirmBox}>
                <h3>Delete Report</h3>
                <p>
                  Are you sure you want to permanently delete this sourcing
                  report for part <strong>{activeReport.part_number}</strong>?
                </p>
                <div className={styles.confirmActions}>
                  <button
                    className={styles.cancelDeleteBtn}
                    onClick={() => setDeletingReportId(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmDeleteBtn}
                    onClick={() => handleDeleteReport(activeReport.report_id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <Report report={activeReport} hideActions={true} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1>Saved Reports</h1>
            <p>
              {savedReports.length} report{savedReports.length === 1 ? "" : "s"}{" "}
              saved to your account.
            </p>
          </div>
          <div className={styles.summaryBadge}>{savedReports.length}</div>
        </div>

        {savedReports.length === 0 ? (
          <div className={styles.emptyState}>
            <Info size={24} />
            <p>No saved reports found.</p>
          </div>
        ) : (
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

            <div className={styles.filterBar}>
              <div className={styles.searchBox}>
                <Search className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  placeholder="Search by part number or specs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filtersGroup}>
                <div className={styles.filterSelectWrapper}>
                  <label htmlFor="market-filter">Market:</label>
                  <select
                    id="market-filter"
                    value={marketFilter}
                    onChange={(e) => setMarketFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    {uniqueMarketList.map((market) => (
                      <option key={market} value={market}>
                        {market}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.filterSelectWrapper}>
                  <label htmlFor="status-filter">Status:</label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="All">All Statuses</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Limited">Limited</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              {savedReports.map((report) => {
                const status = report.availability_status || "Unknown";
                const isDeletingThis =
                  isDeleting && deletingReportId === report.report_id;

                return (
                  <article key={report.report_id} className={styles.reportCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitleGroup}>
                        <h2>{report.part_number || "Unnamed Report"}</h2>
                        <span className={styles.reportMeta}>
                          {report.market || "Global"}
                        </span>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => setActiveReport(report)}
                          title="Open saved report"
                        >
                          <Eye size={16} />
                          <span>Open</span>
                        </button>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => {}}
                          title="Download saved report"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteReport(report.report_id)}
                          disabled={isDeletingThis}
                          title="Delete saved report"
                        >
                          <Trash2 size={16} />
                          <span>
                            {isDeletingThis ? "Deleting..." : "Delete"}
                          </span>
                        </button>
                      </div>
                    </div>

                    <p className={styles.description}>
                      {report.description || "No description available."}
                    </p>

                    <div className={styles.cardFooter}>
                      <span
                        className={`${styles.statusBadge} ${getStatusColor(status)}`}
                      >
                        {status}
                      </span>
                      <span>
                        {report.suppliers?.length ?? 0} supplier
                        {report.suppliers?.length === 1 ? "" : "s"}
                      </span>
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
