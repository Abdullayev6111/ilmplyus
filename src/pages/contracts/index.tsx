import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "../../api/api";
import "./contracts.css";
import ContractDetail from "./ContractDetail";
import ContractsCreate from "./ContractsCreate";

interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  phone: string;
  birth_date: string;
  jshshr: string;
  citizenship: string;
  country: string;
  passport_series: string;
  passport_number: string;
  passport_given_date: string;
  passport_given_by: string;
  address_registration: string;
  address_living: string;
  language: string;
}

interface Department {
  id: number;
  name: string;
}

interface Contract {
  id: number;
  contract_number: string;
  contract_start_date: string;
  contract_end_date: string;
  status: string;
  base_salary: string;
  employee: Employee;
  department: Department;
  position?: { name: string };
  contract_date: string;
  contract_type: string;
  contract_duration: string;
  probation_period: string;
  working_hours_monthly: string;
  hourly_rate: string;
  total_monthly_salary: string;
  salary_start_date: string;
  salary_end_date: string;
  vacation_type: string;
  language: string;
}

const Contracts: React.FC = () => {
  const queryClient = useQueryClient();

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [editContract, setEditContract] = useState<{
    employeeId: number;
    contractId: number;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: contracts,
    isLoading,
    isError,
  } = useQuery<Contract[]>({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data } = await API.get("/contracts");
      return data;
    },
  });

  // Sorting & Pagination Logic
  const processedData = useMemo(() => {
    if (!contracts) return [];

    // Sort by ID Ascending (1, 2, 3...)
    const sorted = [...contracts].sort((a, b) => a.id - b.id);

    return sorted;
  }, [contracts]);

  const totalPages = Math.ceil(processedData.length / pageSize);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  const deleteMutation = useMutation({
    mutationFn: async ({
      employeeId,
      contractId,
    }: {
      employeeId: number;
      contractId: number;
    }) => {
      await API.delete(`/employees/${employeeId}/contracts/${contractId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  const terminateMutation = useMutation({
    mutationFn: async ({
      employeeId,
      contractId,
    }: {
      employeeId: number;
      contractId: number;
    }) => {
      await API.patch(
        `/employees/${employeeId}/contracts/${contractId}/terminate`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });

  const handleDelete = (employeeId: number, contractId: number) => {
    if (window.confirm("Haqiqatdan ham ushbu ma'lumotni o'chirmoqchimisiz?")) {
      deleteMutation.mutate({ employeeId, contractId });
    }
  };

  const handleTerminate = (employeeId: number, contractId: number) => {
    if (window.confirm("Shartnomani tugatmoqchimisiz?")) {
      terminateMutation.mutate({ employeeId, contractId });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ru-RU");
  };

  if (isCreating) {
    return (
      <ContractsCreate
        onCancel={() => setIsCreating(false)}
        onSuccess={() => setIsCreating(false)}
      />
    );
  }

  if (editContract) {
    return (
      <ContractsCreate
        employeeId={editContract.employeeId}
        contractId={editContract.contractId}
        onCancel={() => setEditContract(null)}
        onSuccess={() => setEditContract(null)}
      />
    );
  }

  return (
    <div className="contracts-container container">
      <div className="contracts-header">
        <h1>
          <div className="icon-box">
            <i className="fas fa-file-contract"></i>
          </div>
          Shartnomalar
        </h1>
        <button className="btn btn-save" onClick={() => setIsCreating(true)}>
          <i className="fas fa-plus"></i> Yangi shartnoma
        </button>
      </div>

      <div className="contracts-table-card">
        <table className="contracts-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>FISH</th>
              <th>Telefon</th>
              <th>Bo'lim</th>
              <th>Status</th>
              <th>Boshlanish</th>
              <th>Tugash</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} align="center">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={8} align="center">
                  Xatolik yuz berdi.
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} align="center">
                  Ma'lumotlar topilmadi.
                </td>
              </tr>
            ) : (
              paginatedData?.map((contract) => {
                const emp = contract.employee || {};
                return (
                  <tr key={contract.id}>
                    <td>#{contract.id}</td>
                    <td>{`${emp.last_name || ""} ${emp.first_name || ""} ${emp.middle_name || ""}`.trim() || "-"}</td>
                    <td>{emp.phone || "-"}</td>
                    <td>{contract.department?.name || "N/A"}</td>
                    <td>
                      <span className={`badge ${contract.status}`}>
                        {contract.status === "active" ? "Faol" : "Faol emas"}
                      </span>
                    </td>
                    <td>{formatDate(contract.contract_start_date)}</td>
                    <td>{formatDate(contract.contract_end_date)}</td>
                    <td>
                      <div className="action-btns">
                        <div
                          className="action-icon view-icon"
                          onClick={() => setViewContract(contract)}
                          title="Ko'rish"
                        >
                          <i className="fas fa-eye"></i>
                        </div>
                        <div
                          className="action-icon edit-icon"
                          onClick={() =>
                            setEditContract({
                              employeeId: emp.id,
                              contractId: contract.id,
                            })
                          }
                          title="Tahrirlash"
                        >
                          <i className="fas fa-pen"></i>
                        </div>
                        <div
                          className="action-icon delete-icon"
                          onClick={() => handleDelete(emp.id, contract.id)}
                          title="O'chirish"
                          style={{
                            pointerEvents: deleteMutation.isPending
                              ? "none"
                              : "auto",
                            opacity: deleteMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </div>
                        <div
                          className="action-icon terminate-icon"
                          onClick={() => handleTerminate(emp.id, contract.id)}
                          title="Tugatish"
                          style={{
                            color: "#eab308",
                            pointerEvents: terminateMutation.isPending
                              ? "none"
                              : "auto",
                            opacity: terminateMutation.isPending ? 0.5 : 1,
                          }}
                        >
                          <i className="fas fa-ban"></i>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && processedData.length > 0 && (
        <div className="pagination-container">
          <div className="page-size-selector">
            <span>Ko'rsatish:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 15, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>tadan</span>
          </div>

          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
              )
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span>...</span>}
                  <button
                    className={`page-btn ${currentPage === p ? "active" : ""}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}

            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {viewContract && (
        <ContractDetail
          contract={viewContract}
          onClose={() => setViewContract(null)}
        />
      )}
    </div>
  );
};

export default Contracts;
