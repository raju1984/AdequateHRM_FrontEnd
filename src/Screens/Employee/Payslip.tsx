import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import userImg from "../../assets/img/users/user-01.jpg";

interface PayslipRow {
  date: string;
  salary: string;
}

const Payslip: React.FC = () => {
  const navigate = useNavigate();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");

  const payslips: PayslipRow[] = [
    { date: "03 Nov 2024", salary: "$50000" },
    { date: "10 Apr 2024", salary: "$30000" },
    { date: "12 Sep 2024", salary: "$40000" },
    { date: "17 Dec 2024", salary: "$25000" },
    { date: "17 Oct 2024", salary: "$22000" },
    { date: "18 Feb 2024", salary: "$20000" },
    { date: "20 Jul 2024", salary: "$25000" },
    { date: "22 Feb 2024", salary: "$45000" },
    { date: "24 Oct 2024", salary: "$35000" },
    { date: "29 Aug 2024", salary: "$35000" },
  ];

  const filteredData = useMemo(() => {
    let data = [...payslips];

    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter(
        (item) =>
          item.date.toLowerCase().includes(value) ||
          item.salary.toLowerCase().includes(value)
      );
    }

    return data.slice(0, rowsPerPage);
  }, [search, rowsPerPage]);

  return (
    <div className="payslip-page">
      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="page-heading">
        <h2>Payslip</h2>

        <div className="breadcrumb-line">
          <button
            type="button"
            onClick={() => navigate("/Employee/EmployeDashboard")}
          >
            <i className="ti ti-home"></i>
          </button>

          <span>/</span>
          <span className="active">Payslip</span>
        </div>
      </div>

      {/* =========================
          EMPLOYEE INFORMATION
      ========================= */}
      <div className="employee-info-card">
        {/* DARK HEADER */}
        <div className="employee-info-header">
          <div className="employee-person">
            <div className="employee-avatar">
              <img src={userImg} alt="Employee" />
            </div>

            <div>
              <h5>Anjali Verma</h5>
              <p>HR Manager</p>
            </div>
          </div>

          <div className="reporting-manager">
            <h5>Asher Miller</h5>
            <p>Reporting Manager</p>
          </div>
        </div>

        {/* DETAILS */}
        <div className="employee-info-body">
          <div className="row g-0">
            <div className="col-lg-3 col-md-6">
              <InfoItem label="Employee ID" value="EMP001" />
              <InfoItem label="Name" value="Anjali Verma" />
              <InfoItem label="Department" value="HR" noMargin />
            </div>

            <div className="col-lg-3 col-md-6">
              <InfoItem label="UAN No" value="100083901824" />
              <InfoItem label="Designation" value="HR Manager" />
              <InfoItem label="Date of Joining" value="2020-08-01" noMargin />
            </div>

            <div className="col-lg-3 col-md-6">
              <InfoItem label="Contact Number" value="+91 9123456780" />
              <InfoItem
                label="Email"
                value="anjali.verma@company.com"
              />
              <InfoItem label="Salary" value="90,000" noMargin />
            </div>

            <div className="col-lg-3 col-md-6">
              <InfoItem label="Date of Birth" value="1990-12-05" />
              <InfoItem label="Gender" value="Female" />
              <InfoItem label="Status" value="Active" noMargin />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          PAYSLIP TABLE CARD
      ========================= */}
      <div className="payslip-table-card">
        {/* HEADER */}
        <div className="payslip-card-header">
          <h5>Payslip</h5>

          <div className="header-filters">
            <select defaultValue="date" className="filter-select date-select">
              <option value="date">08/28/2026 - 09/03/20</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">This Year</option>
            </select>

            <select defaultValue="last7" className="filter-select sort-select">
              <option value="last7">Sort By : Last 7 Days</option>
              <option value="recent">Recently Added</option>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>

        {/* ROW PER PAGE / SEARCH */}
        <div className="table-controls">
          <div className="row-per-page">
            <span>Row Per Page</span>

            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
            </select>

            <span>Entries</span>
          </div>

          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="table-search"
          />
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table className="payslip-table">
            <thead>
              <tr>
                <SortableHeader title="Date" />
                <SortableHeader title="Salary" />
                <SortableHeader title="Payslip" />
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, index) => (
                <tr key={`${item.date}-${index}`}>
                  <td>{item.date}</td>
                  <td>{item.salary}</td>

                  <td>
                    <Link
                      to="/Employee/Viewpayslip"
                      className="view-payslip-btn"
                    >
                      View Payslip
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="table-footer">
          <span>
            Showing 1 - {filteredData.length} of {filteredData.length} entries
          </span>

          <div className="pagination-wrapper">
            <button type="button" className="pagination-arrow">
              <i className="ti ti-chevron-left"></i>
            </button>

            <button type="button" className="page-number active">
              1
            </button>

            <button type="button" className="pagination-arrow">
              <i className="ti ti-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* =========================
          CSS
      ========================= */}
      <style>{`
        .payslip-page {
          width: 100%;
          min-height: calc(100vh - 50px);
          background: #f7f8fa;
          padding: 24px;
          box-sizing: border-box;
          font-family: "Inter", Arial, sans-serif;
          color: #10264c;
        }

        /* PAGE HEADING */
        .page-heading {
          margin-bottom: 25px;
        }

        .page-heading h2 {
          margin: 0 0 8px;
          font-size: 24px;
          line-height: 30px;
          font-weight: 700;
          color: #10264c;
        }

        .breadcrumb-line {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #99a2b2;
          font-size: 12px;
        }

        .breadcrumb-line button {
          border: 0;
          background: transparent;
          padding: 0;
          color: #66758b;
          line-height: 1;
          cursor: pointer;
        }

        .breadcrumb-line button i {
          font-size: 13px;
        }

        .breadcrumb-line .active {
          color: #10264c;
        }

        /* =========================
           EMPLOYEE CARD
        ========================= */
        .employee-info-card {
          width: 100%;
          background: #fff;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.03);
        }

        .employee-info-header {
          height: 79px;
          background: #202427;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
        }

        .employee-person {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .employee-avatar {
          width: 46px;
          height: 46px;
          min-width: 46px;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid #fff;
          background: #d8d8d8;
        }

        .employee-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .employee-person h5,
        .reporting-manager h5 {
          margin: 0 0 4px;
          font-size: 16px;
          line-height: 20px;
          font-weight: 600;
          color: #fff;
        }

        .employee-person p,
        .reporting-manager p {
          margin: 0;
          font-size: 12px;
          line-height: 16px;
          color: #fff;
          font-weight: 500;
        }

        .reporting-manager {
          text-align: right;
        }

        .employee-info-body {
          padding: 21px 20px 28px;
        }

        .info-item {
          margin-bottom: 18px;
          padding-right: 15px;
        }

        .info-label {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
          line-height: 18px;
          color: #69758a;
          font-weight: 400;
        }

        .info-value {
          display: block;
          font-size: 14px;
          line-height: 19px;
          color: #0f1f3a;
          font-weight: 400;
          word-break: break-word;
        }

        /* =========================
           TABLE CARD
        ========================= */
        .payslip-table-card {
          width: 100%;
          background: #fff;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(16, 24, 40, 0.03);
        }

        .payslip-card-header {
          min-height: 72px;
          padding: 15px 19px;
          border-bottom: 1px solid #dfe3e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .payslip-card-header h5 {
          margin: 0;
          font-size: 15px;
          line-height: 20px;
          color: #10264c;
          font-weight: 600;
        }

        .header-filters {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-select {
          height: 39px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #10264c;
          font-size: 13px;
          padding: 0 12px;
          outline: none;
        }

        .date-select {
          min-width: 195px;
        }

        .sort-select {
          min-width: 177px;
        }

        /* TABLE CONTROLS */
        .table-controls {
          height: 61px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
        }

        .row-per-page {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #24334d;
          font-size: 13px;
        }

        .row-per-page select {
          height: 30px;
          min-width: 49px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #10264c;
          font-size: 13px;
          padding: 0 7px;
          outline: none;
        }

        .table-search {
          width: 160px;
          height: 31px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          padding: 0 13px;
          color: #10264c;
          font-size: 12px;
          outline: none;
        }

        .table-search::placeholder {
          color: #98a1b1;
        }

        /* TABLE */
        .payslip-table {
          width: 100%;
          border-collapse: collapse;
          margin: 0;
        }

        .payslip-table thead {
          background: #e5e7ea;
        }

        .payslip-table th {
          height: 42px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #102039;
          text-align: left;
          border: none;
          white-space: nowrap;
        }

        .payslip-table td {
          height: 49px;
          padding: 10px 20px;
          border-bottom: 1px solid #dfe3e8;
          color: #607087;
          font-size: 13px;
          vertical-align: middle;
          white-space: nowrap;
        }

        .sortable-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .sort-arrow {
          color: #d0d5dc;
          font-size: 13px;
        }

        .view-payslip-btn {
          min-width: 99px;
          height: 28px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #202427;
          border-radius: 4px;
          color: #fff !important;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .view-payslip-btn:hover {
          opacity: 0.9;
        }

        /* FOOTER */
        .table-footer {
          min-height: 56px;
          padding: 10px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #66758a;
          font-size: 13px;
        }

        .pagination-wrapper {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .pagination-arrow,
        .page-number {
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #99a3b1;
          font-size: 13px;
          padding: 0;
        }

        .page-number.active {
          border-radius: 50%;
          background: #bd8d32;
          color: #fff;
        }

        /* RESPONSIVE */
        @media (max-width: 991px) {
          .employee-info-body .col-md-6 {
            margin-bottom: 10px;
          }
        }

        @media (max-width: 767px) {
          .payslip-page {
            padding: 16px;
          }

          .employee-info-header {
            height: auto;
            min-height: 79px;
            padding: 15px;
            gap: 15px;
            flex-wrap: wrap;
          }

          .reporting-manager {
            width: 100%;
            text-align: left;
            padding-left: 56px;
          }

          .payslip-card-header,
          .table-controls {
            height: auto;
            align-items: stretch;
            flex-direction: column;
          }

          .header-filters {
            width: 100%;
          }

          .filter-select,
          .date-select,
          .sort-select,
          .table-search {
            width: 100%;
          }

          .employee-info-body {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
};

/* =========================
   INFO ITEM
========================= */

interface InfoItemProps {
  label: string;
  value: string;
  noMargin?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  noMargin = false,
}) => {
  return (
    <div
      className="info-item"
      style={{
        marginBottom: noMargin ? 0 : undefined,
      }}
    >
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );
};

/* =========================
   SORTABLE HEADER
========================= */

const SortableHeader = ({ title }: { title: string }) => {
  return (
    <th>
      <div className="sortable-title">
        <span>{title}</span>
        <span className="sort-arrow">↕</span>
      </div>
    </th>
  );
};

export default Payslip;