import { useMemo, useState } from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { NavLink } from "react-router-dom"; 


interface Transaction {
  month: string;
  order: string; // sortable value (YYYY-MM)
  total: number;
}

type SortKey = "month" | "total";
type SortDir = "asc" | "desc";

const TRANSACTIONS: Transaction[] = [
  { month: "September 2025", order: "2025-09", total: 327000 },
  { month: "August 2025", order: "2025-08", total: 327000 },
];

const LENGTH_OPTIONS: { label: string; value: number }[] = [
  { label: "10", value: 10 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "All", value: -1 },
];

const formatUSD = (n: number): string => "$" + n.toLocaleString("en-US");

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function Transactions() {
  const [salaryMonth, setSalaryMonth] = useState<string>("");
  const [pageLength, setPageLength] = useState<number>(-1); // All
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [page, setPage] = useState<number>(1);

  /* filter -> search -> sort */
  const filtered = useMemo<Transaction[]>(() => {
    const q = search.trim().toLowerCase();
    let data = TRANSACTIONS.filter((t) => !salaryMonth || t.month === salaryMonth);

    if (q) {
      data = data.filter(
        (t) =>
          t.month.toLowerCase().includes(q) ||
          formatUSD(t.total).toLowerCase().includes(q) ||
          String(t.total).includes(q)
      );
    }

    if (sort) {
      const dir = sort.dir === "asc" ? 1 : -1;
      data = [...data].sort((a, b) =>
        sort.key === "month"
          ? a.order.localeCompare(b.order) * dir
          : (a.total - b.total) * dir
      );
    }
    return data;
  }, [salaryMonth, search, sort]);

  /* pagination */
  const size = pageLength === -1 ? Math.max(filtered.length, 1) : pageLength;
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * size;
  const rows = filtered.slice(startIdx, startIdx + size);

  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = startIdx + rows.length;

  /* handlers */
  const onSalaryMonth = (e: ChangeEvent<HTMLSelectElement>) => {
    setSalaryMonth(e.target.value);
    setPage(1);
  };
  const onLength = (e: ChangeEvent<HTMLSelectElement>) => {
    setPageLength(Number(e.target.value));
    setPage(1);
  };
  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev && prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };
  const goTo = (e: MouseEvent, p: number, disabled = false) => {
    e.preventDefault();
    if (!disabled) setPage(p);
  };

  const sortClass = (key: SortKey) =>
    sort && sort.key === key ? `sorting_${sort.dir}` : "sorting";

  return (
    <div className="content">
      {/* Breadcrumb */}
      {/* Breadcrumb */}
<div className="page-breadcrumb mb-3">
  <h2 className="mb-1">Transactions</h2>

  <nav aria-label="Breadcrumb">
    <ol className="breadcrumb mb-0 align-items-center">

      {/* HOME */}
      <li className="breadcrumb-item">
        <NavLink
          to="/admin/dashboard"
          className="d-flex align-items-center text-decoration-none"
          aria-label="Home"
        >
          <i
            className="ti ti-home"
            style={{
              fontSize: "18px",
              lineHeight: 1,
            }}
          />
        </NavLink>
      </li>

      {/* TRANSACTIONS */}
      <li
        className="breadcrumb-item active"
        aria-current="page"
        style={{
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        Transactions
      </li>

    </ol>
  </nav>
</div>

      {/* Card */}
      <div className="card">
        <div className="card-header">
          <h5>Monthly Total Salary Transactions</h5>
          <p className="text-muted mb-0 mt-1">
            Total salary transferred each month. Sample data for demonstration; live payroll data is not connected.
          </p>
        </div>

        <div className="card-body">
          {/* Salary Month filter */}
          <div className="mb-3">
            <label htmlFor="salary-month" className="form-label">
              Salary Month
            </label>
            <select
              id="salary-month"
              className="form-select w-auto"
              value={salaryMonth}
              onChange={onSalaryMonth}
            >
              <option value="">All Months</option>
              {TRANSACTIONS.map((t) => (
                <option key={t.order} value={t.month}>
                  {t.month}
                </option>
              ))}
            </select>
          </div>

          <div className="table-responsive custom-datatable-filter">
            <div
              id="transactions-table_wrapper"
              className="dataTables_wrapper dt-bootstrap5 no-footer"
            >
              {/* Show N months  |  Search */}
              <div className="row">
                <div className="col-sm-12 col-md-6">
                  <div className="dataTables_length" id="transactions-table_length">
                    <label>
                      Show{" "}
                      <select
                        name="transactions-table_length"
                        aria-controls="transactions-table"
                        className="form-select form-select-sm"
                        value={pageLength}
                        onChange={onLength}
                      >
                        {LENGTH_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>{" "}
                      months
                    </label>
                  </div>
                </div>
                <div className="col-sm-12 col-md-6 d-flex justify-content-md-end">
                  <div
                    id="transactions-table_filter"
                    className="dataTables_filter ms-md-auto text-md-end"
                    style={{ textAlign: "right" }}
                  >
                    <label>
                      Search monthly totals:
                      <input
                        type="search"
                        className="form-control form-control-sm"
                        placeholder="Salary month or total"
                        aria-controls="transactions-table"
                        value={search}
                        onChange={onSearch}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="row dt-row">
                <div className="col-sm-12">
                  <table
                    id="transactions-table"
                    className="table dataTable no-footer"
                    aria-describedby="transactions-table_info"
                  >
                    <thead className="thead-light">
                      <tr>
                        <th
                          scope="col"
                          className={sortClass("month")}
                          tabIndex={0}
                          onClick={() => toggleSort("month")}
                        >
                          Salary Month
                        </th>
                        <th
                          scope="col"
                          className={sortClass("total")}
                          tabIndex={0}
                          onClick={() => toggleSort("total")}
                        >
                          Total Salary Transferred
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr className="odd">
                          <td colSpan={2} className="dataTables_empty">
                            No matching records found
                          </td>
                        </tr>
                      ) : (
                        rows.map((t, i) => (
                          <tr key={t.order} className={i % 2 === 0 ? "odd" : "even"}>
                            <td>{t.month}</td>
                            <td>{formatUSD(t.total)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info  |  Pagination */}
              <div className="row">
                <div className="col-sm-12 col-md-5">
                  <div
                    className="dataTables_info"
                    id="transactions-table_info"
                    role="status"
                    aria-live="polite"
                  >
                    Showing {showingFrom} - {showingTo} of {filtered.length} months
                  </div>
                </div>
                <div className="col-sm-12 col-md-7">
                  <div
                    className="dataTables_paginate paging_simple_numbers"
                    id="transactions-table_paginate"
                  >
                    <ul className="pagination">
                      <li
                        className={`paginate_button page-item previous${
                          currentPage === 1 ? " disabled" : ""
                        }`}
                      >
                        <a
                          href="#!"
                          className="page-link"
                          onClick={(e) => goTo(e, currentPage - 1, currentPage === 1)}
                        >
                          Previous
                        </a>
                      </li>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <li
                          key={p}
                          className={`paginate_button page-item${
                            p === currentPage ? " active" : ""
                          }`}
                        >
                          <a href="#!" className="page-link" onClick={(e) => goTo(e, p)}>
                            {p}
                          </a>
                        </li>
                      ))}

                      <li
                        className={`paginate_button page-item next${
                          currentPage === totalPages ? " disabled" : ""
                        }`}
                      >
                        <a
                          href="#!"
                          className="page-link"
                          onClick={(e) => goTo(e, currentPage + 1, currentPage === totalPages)}
                        >
                          Next
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
