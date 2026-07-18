import {useEffect} from 'react';
import { usePDF } from 'react-to-pdf';
import Report from './Report';

function ReportPDFTrigger({ report, OnComplete}) {
    const { toPDF, targetRef } = usePDF({filename: `${report.part_number}_sourcing_report.pdf`});

    useEffect(() => {
        if(report) {
            const timer = setTimeout(async () => {
                try {
                    await toPDF();
                }
                catch (error) {
                    console.error('Error generating PDF:', error);
                }
                finally {
                    OnComplete();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [report, toPDF, OnComplete]);

      return (
    <div ref={targetRef} style={{ width: '800px', padding: '24px', backgroundColor: '#f8fafc' }}>
      <Report report={report} hideActions={true} />
    </div>
  );
}

export default ReportPDFTrigger;

                
