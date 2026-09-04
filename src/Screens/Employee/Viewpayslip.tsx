import React from "react";

const ViewPayslip: React.FC = () => {
  const earnings = [
    ["Basic", "35,000"],
    ["House Rent Allowance", "17,500"],
    ["Conveyance Allowance", "3,000"],
    ["Special Allowance", "7,500"],
    ["Employer Cont to PF", "-"],
    ["Bonus", "2,000"],
    ["Non-Taxable Gratuity", "-"],
    ["Arrear Salary", "-"],
    ["Leave Encashment", "1,500"],
    ["LTA", "-"],
    ["Medical Reimbursement", "800"],
    ["Mobile Reimbursement", "500"],
    ["City Compensatory Allowance", "-"],
    ["Non-Taxable Allowance", "-"],
  ];

  const deductions = [
    ["PF", "4,200"],
    ["TDS", "3,500"],
    ["Gratuity", "-"],
    ["Advances", "-"],
    ["-", "-"],
    ["Employer Cont to PF", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
  ];

  const contributions = [
    ["Medical Insurance", "1,000"],
    ["Employee Welfare", "500"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
    ["-", "-"],
  ];

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="view-payslip-page">
      <div className="payslip-sheet">
        {/* DOWNLOAD */}
        <div className="download-row no-print">
          <button
            type="button"
            className="download-btn"
            onClick={handleDownloadPdf}
          >
            Download PDF
          </button>
        </div>

        {/* HEADER */}
        <div className="payslip-top">
          <div className="company-logo-box">
            <div className="logo-symbol">A</div>

            <div>
              <div className="company-name">ADEQUATE</div>
              <div className="company-subtitle">
                INFOSOFT PVT. LTD.
              </div>
            </div>
          </div>

          <div className="payslip-title-block">
            <div className="salary-title">
              PAY SLIP FOR THE MONTH OF : August 2025
            </div>

            <div className="company-address">
              H-15 , Rise tower , H-Block , Sector 63 Noida ,
              Uttar Pradesh 201301
            </div>
          </div>
        </div>

        {/* EMPLOYEE INFO */}
        <div className="employee-detail-grid">
          <div className="detail-column">
            <Detail label="Emp No." value="AIPL-06" />
            <Detail label="Name" value="Rohan Sharma" />
            <Detail label="Designation" value="Accountant" />
            <Detail label="Bank A/c No." value="123456789012" />
            <Detail label="IFS Code" value="" />
          </div>

          <div className="detail-column">
            <Detail label="Month" value="Aug-2025" />
            <Detail label="Day Present" value="31 days" />
            <Detail label="LWP" value="0.00" />
            <Detail label="Balance EL" value="1.5" />
            <Detail label="Total EL" value="61.5" />
          </div>

          <div className="detail-column">
            <Detail label="PAN No" value="ATWPK3763F" />
            <Detail label="UAN" value="100083901824" />
            <Detail label="Joining Date" value="15-Feb-2023" />
            <Detail label="Balance GL" value="1" />
            <Detail label="Total GL" value="24.50" />
          </div>
        </div>

        {/* SALARY TABLE */}
        <div className="salary-table-wrapper">
          <table className="salary-table">
            <thead>
              <tr>
                <th className="wide-col">EARNINGS</th>
                <th className="amount-col">AMOUNT</th>

                <th className="deduction-col">DEDUCTIONS</th>
                <th className="amount-col">AMOUNT</th>

                <th className="company-col">
                  COMPANY CONTRIBUTIONS
                </th>
                <th className="amount-col">AMOUNT</th>
              </tr>
            </thead>

            <tbody>
              {earnings.map((earning, index) => (
                <tr key={index}>
                  <td>{earning[0]}</td>
                  <td>{earning[1]}</td>

                  <td>{deductions[index]?.[0] ?? "-"}</td>
                  <td>{deductions[index]?.[1] ?? "-"}</td>

                  <td>{contributions[index]?.[0] ?? "-"}</td>
                  <td>{contributions[index]?.[1] ?? "-"}</td>
                </tr>
              ))}

              <tr className="total-row">
                <td>Total Earnings</td>
                <td>67,800</td>

                <td>Total Deductions</td>
                <td>7,700</td>

                <td>Total Contributions</td>
                <td>1,500</td>
              </tr>

              <tr className="net-row">
                <td colSpan={5}>Net Payable</td>
                <td>59,600</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="note">
          Note: This is a computer-generated payslip and does not
          require any signature.
        </div>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .view-payslip-page {
          min-height: 100vh;
          width: 100%;
          background: #ffffff;
          font-family: Arial, Helvetica, sans-serif;
          color: #000;
          padding: 20px 0;
        }

        .payslip-sheet {
          width: 814px;
          max-width: calc(100% - 40px);
          margin: 0 auto;
          background: #fff;
        }

        /* DOWNLOAD BUTTON */
        .download-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }

        .download-btn {
          height: 39px;
          padding: 0 21px;
          border: none;
          border-radius: 5px;
          background: #c89334;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        .download-btn:hover {
          background: #b8842e;
        }

        /* HEADER */
        .payslip-top {
          display: grid;
          grid-template-columns: 260px 1fr;
          align-items: center;
          margin-bottom: 31px;
        }

        .company-logo-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-symbol {
          width: 46px;
          height: 46px;
          border: 3px solid #c39a49;
          border-radius: 50%;
          color: #b78b34;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          line-height: 1;
          font-weight: 700;
          position: relative;
        }

        .company-name {
          font-size: 27px;
          line-height: 28px;
          letter-spacing: .6px;
          color: #bd8d32;
          font-weight: 500;
        }

        .company-subtitle {
          font-size: 14px;
          line-height: 17px;
          color: #b28430;
          font-weight: 500;
        }

        .payslip-title-block {
          text-align: center;
          padding-top: 2px;
        }

        .salary-title {
          font-size: 16px;
          line-height: 20px;
          font-weight: 400;
          margin-bottom: 3px;
        }

        .company-address {
          font-size: 16px;
          line-height: 20px;
          font-weight: 400;
        }

        /* DETAILS */
        .employee-detail-grid {
          display: grid;
          grid-template-columns: 1.15fr .85fr 1fr;
          column-gap: 60px;
          margin-bottom: 27px;
        }

        .detail-column {
          min-width: 0;
        }

        .detail-item {
          display: flex;
          align-items: baseline;
          font-size: 16px;
          line-height: 20px;
          margin-bottom: 14px;
          white-space: nowrap;
        }

        .detail-label {
          font-weight: 700;
        }

        .detail-separator {
          font-weight: 400;
          margin: 0 4px;
        }

        .detail-value {
          font-weight: 400;
        }

        /* TABLE */
        .salary-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .salary-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 14px;
          color: #000;
        }

        .salary-table th,
        .salary-table td {
          border: 1px solid #c9c9c9;
          padding: 6px 7px;
          height: 30px;
          text-align: left;
          vertical-align: middle;
        }

        .salary-table th {
          background: #f1f1f1;
          font-size: 14px;
          font-weight: 700;
        }

        .salary-table .wide-col {
          width: 26%;
        }

        .salary-table .deduction-col {
          width: 18%;
        }

        .salary-table .company-col {
          width: 26%;
        }

        .salary-table .amount-col {
          width: 10%;
        }

        .salary-table .total-row td {
          background: #f1f1f1;
          font-weight: 700;
        }

        .salary-table .total-row td:nth-child(2),
        .salary-table .total-row td:nth-child(4),
        .salary-table .total-row td:nth-child(6) {
          font-weight: 400;
        }

        .salary-table .net-row td {
          background: #f1f1f1;
        }

        .salary-table .net-row td:first-child {
          font-weight: 700;
        }

        .salary-table .net-row td:last-child {
          font-weight: 400;
        }

        .note {
          margin-top: 15px;
          font-size: 16px;
          line-height: 20px;
          font-style: italic;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .payslip-sheet {
            width: calc(100% - 30px);
            max-width: none;
          }

          .employee-detail-grid {
            column-gap: 25px;
          }
        }

        @media (max-width: 767px) {
          .view-payslip-page {
            padding: 15px 0;
          }

          .payslip-top {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .payslip-title-block {
            text-align: left;
          }

          .employee-detail-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .detail-item {
            white-space: normal;
          }

          .salary-table {
            min-width: 790px;
          }
        }

        /* PRINT / PDF */
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            margin: 0;
            background: #fff;
          }

          .no-print {
            display: none !important;
          }

          .view-payslip-page {
            min-height: auto;
            padding: 0;
          }

          .payslip-sheet {
            width: 100%;
            max-width: none;
            margin: 0;
          }

          .salary-table-wrapper {
            overflow: visible;
          }

          .salary-table {
            font-size: 12px;
          }

          .detail-item {
            font-size: 13px;
            margin-bottom: 10px;
          }

          .company-name {
            font-size: 24px;
          }

          .salary-title,
          .company-address {
            font-size: 13px;
          }

          .note {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

interface DetailProps {
  label: string;
  value: string;
}

const Detail: React.FC<DetailProps> = ({ label, value }) => {
  return (
    <div className="detail-item">
      <span className="detail-label">{label}</span>
      <span className="detail-separator">:</span>
      <span className="detail-value">{value}</span>
    </div>
  );
};

export default ViewPayslip;