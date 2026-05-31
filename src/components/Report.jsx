import styles from './Report.module.css';

function Report({ report }) {
  return (
    <div className={styles.reportContainer}>
      <h2 className={styles.reportTitle}>Report</h2>
      <p>Report will appear here, for now work in progress :- Check the console for more details.</p>
    </div>
  );
}

export default Report;
