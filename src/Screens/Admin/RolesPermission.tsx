import React, { useEffect, useState } from "react";



import { useNavigate } from "react-router-dom";



import {



  CirclePlus,



  ChevronLeft,



  ChevronRight,



  Pencil,



  Trash2,



} from "lucide-react";







import {

  getUserTypes,

  getUserTypeById,

  addUserType,

  updateUserType,

  deleteUserType,

  getPermissionPages,

  getMyPermissions,

  unwrapApiArray,

  unwrapApiValue,

  type UserTypePayload,

} from "../../services/adminservices";







type RoleStatus = "Active" | "Inactive";



type PermissionKey = "read" | "write" | "delete";



interface EffectivePermission {

  pageId: string;

  canRead: boolean;

  canWrite: boolean;

  canCreate: boolean;

  canDelete: boolean;

  canImport: boolean;

  canExport: boolean;

}







interface Role {



  id: string;



  userType: number;



  name: string;



  createdDate: string;



  status: RoleStatus;



}







interface RoleForm {



  userType: string;



  status: RoleStatus | "";



}







interface PageItem {



  id: string;



  name: string;



}







interface ModulePermission {



  read: boolean;



  write: boolean;



  delete: boolean;



}







type PermissionsState = Record<string, ModulePermission>;







const GOLD = "#c39237";







const USER_TYPE_OPTIONS = [



  { value: 0, label: "Admin" },



  { value: 3, label: "Accountant" },



  { value: 1, label: "HR" },



  { value: 2, label: "Employee" },



];







const userTypeLabel = (value: number) =>



  USER_TYPE_OPTIONS.find((x) => x.value === value)?.label ??



  `User Type ${value}`;







const emptyPermission = (): ModulePermission => ({



  read: false,



  write: false,



  delete: false,



});







const createDefaultPermissions = (



  pages: PageItem[]



): PermissionsState =>



  Object.fromEntries(



    pages.map((p) => [p.id, emptyPermission()])



  );







const boolValue = (v: any) =>



  v === true ||



  v === 1 ||



  String(v).toLowerCase() === "true";







const pick = (



  o: any,



  keys: string[],



  fallback: any = ""



) => {



  for (const k of keys) {



    if (o?.[k] !== undefined && o?.[k] !== null) {



      return o[k];



    }



  }







  return fallback;



};







const extractArray = (r: any): any[] => {



  const value = unwrapApiValue(r);







  if (Array.isArray(value)) {



    return value;



  }







  return unwrapApiArray(r);



};







const normalizeRole = (item: any): Role => {



  const userType = Number(



    pick(item, ["userType", "UserType"], 0)



  );







  return {



    id: String(



      pick(item, [



        "id",



        "Id",



        "userTypeId",



        "UserTypeId",



      ])



    ),







    userType,







    name: pick(



      item,



      [



        "userTypeName",



        "UserTypeName",



        "name",



        "Name",



      ],



      userTypeLabel(userType)



    ),







    createdDate: pick(item, [



      "createdDate",



      "CreatedDate",



      "createdAt",



      "CreatedAt",



      "createdOn",



      "CreatedOn",



    ]),







    status: boolValue(



      pick(



        item,



        [



          "isActive",



          "IsActive",



          "active",



          "Active",



        ],



        false



      )



    )



      ? "Active"



      : "Inactive",



  };



};







const normalizePage = (item: any): PageItem => ({



  id: String(



    pick(item, [



      "id",



      "Id",



      "pageId",



      "PageId",



    ])



  ),







  name: String(



    pick(



      item,



      [



        "pageName",



        "PageName",



        "name",



        "Name",



        "title",



        "Title",



      ],



      "Page"



    )



  ),



});







const formatDate = (value: string) => {



  if (!value) return "-";







  const d = new Date(value);







  return Number.isNaN(d.getTime())



    ? value



    : d.toLocaleDateString("en-GB", {



        day: "2-digit",



        month: "short",



        year: "numeric",



      });



};







const apiSort = (value: string) =>



  ({



    "Last 7 Days": "last7days",



    "Recently Added": "recent",



    Ascending: "ascending",



    Descending: "descending",



    "Last Month": "lastmonth",



  }[value] || "recent");







const getTotal = (



  response: any,



  fallback: number



) =>



  Number(



    pick(



      response,



      [



        "total",



        "Total",



        "totalCount",



        "TotalCount",



      ],



      pick(



        response?.data,



        [



          "total",



          "Total",



          "totalCount",



          "TotalCount",



        ],



        fallback



      )



    )



  ) || fallback;







const Roles: React.FC = () => {



  const navigate = useNavigate();







  const [roles, setRoles] = useState<Role[]>([]);



  const [pages, setPages] = useState<PageItem[]>([]);







  const [search, setSearch] = useState("");



  const [statusFilter, setStatusFilter] =



    useState("");



  const [userTypeFilter, setUserTypeFilter] =



    useState("");



  const [sortBy, setSortBy] =



    useState("Last 7 Days");







  const [fromDate, setFromDate] = useState("");



  const [toDate, setToDate] = useState("");







  const [rowsPerPage, setRowsPerPage] =



    useState(10);



  const [currentPage, setCurrentPage] =



    useState(1);



  const [totalCount, setTotalCount] =



    useState(0);







  const [selectedIds, setSelectedIds] =



    useState<string[]>([]);







  const [showAddModal, setShowAddModal] =



    useState(false);



  const [showEditModal, setShowEditModal] =



    useState(false);



  const [showDeleteModal, setShowDeleteModal] =



    useState(false);







  const [selectedRole, setSelectedRole] =



    useState<Role | null>(null);







  const [addForm, setAddForm] =



    useState<RoleForm>({



      userType: "",



      status: "",



    });







  const [editForm, setEditForm] =



    useState<RoleForm>({



      userType: "",



      status: "",



    });







  const [addPermissions, setAddPermissions] =



    useState<PermissionsState>({});







  const [editPermissions, setEditPermissions] =



    useState<PermissionsState>({});







  const [loading, setLoading] = useState(false);



  const [saving, setSaving] = useState(false);



  const [deleting, setDeleting] =



    useState(false);



  const [editLoading, setEditLoading] =



    useState(false);







  const [error, setError] = useState("");



  const [success, setSuccess] = useState("");







  const loadPages = async () => {



    const response = await getPermissionPages();







    const list = extractArray(response)



      .map(normalizePage)



      .filter((p) => p.id);







    setPages(list);



    setAddPermissions(



      createDefaultPermissions(list)



    );







    return list;



  };







  const loadMyPermissions = async () => {
    try {
      console.log("CALLING MY PERMISSIONS API...");

      const response = await getMyPermissions();

      console.log("MY PERMISSIONS RESPONSE =>", response);
    } catch (e: any) {
      console.error("MY PERMISSIONS ERROR =>", e);
    }
  };

  const loadRoles = async () => {



    try {



      setLoading(true);



      setError("");







      const response = await getUserTypes({



        Search: search.trim() || undefined,



        FromDate: fromDate || undefined,



        ToDate: toDate || undefined,







        IsActive: statusFilter



          ? statusFilter === "Active"



          : undefined,







        UserType:



          userTypeFilter === ""



            ? undefined



            : Number(userTypeFilter),







        SortBy: apiSort(sortBy),



        PageNumber: currentPage,



        PageSize: rowsPerPage,



      });





      const normalized = extractArray(response)



        .map(normalizeRole)



        .filter((r) => r.id);







      setRoles(normalized);







      setTotalCount(



        getTotal(response, normalized.length)



      );







      setSelectedIds((prev) =>



        prev.filter((id) =>



          normalized.some((r) => r.id === id)



        )



      );



    } catch (e: any) {



      setError(



        e?.message ||



          "Failed to load user types."



      );



    } finally {



      setLoading(false);



    }



  };







 useEffect(() => {

  loadPages().catch((e: any) =>

    setError(

      e?.message ||

        "Failed to load permission pages."

    )

  );



  loadMyPermissions();

}, []);







  useEffect(() => {



    const t = window.setTimeout(



      loadRoles,



      250



    );







    return () => window.clearTimeout(t);



  }, [



    search,



    statusFilter,



    userTypeFilter,



    sortBy,



    fromDate,



    toDate,



    currentPage,



    rowsPerPage,



  ]);







  const totalPages = Math.max(



    1,



    Math.ceil(totalCount / rowsPerPage)



  );







  const allVisibleSelected =



    roles.length > 0 &&



    roles.every((r) =>



      selectedIds.includes(r.id)



    );







  const handleSelectAll = () =>



    setSelectedIds((prev) =>



      allVisibleSelected



        ? prev.filter(



            (id) =>



              !roles.some((r) => r.id === id)



          )



        : [



            ...new Set([



              ...prev,



              ...roles.map((r) => r.id),



            ]),



          ]



    );







  const handleSelectRole = (id: string) =>



    setSelectedIds((prev) =>



      prev.includes(id)



        ? prev.filter((x) => x !== id)



        : [...prev, id]



    );







  const changePermission = (



    setter: React.Dispatch<



      React.SetStateAction<PermissionsState>



    >,



    pageId: string,



    key: PermissionKey



  ) =>



    setter((prev) => ({



      ...prev,







      [pageId]: {



        ...(prev[pageId] ||



          emptyPermission()),







        [key]:



          !(prev[pageId]?.[key] ?? false),



      },



    }));







  const permissionPayload = (



    state: PermissionsState



  ) =>



    pages.map((p) => ({



      pageId: p.id,



      canRead: !!state[p.id]?.read,



      canWrite: !!state[p.id]?.write,



      canDelete: !!state[p.id]?.delete,



    }));







  const openAddModal = () => {



    setAddForm({



      userType: "",



      status: "",



    });







    setAddPermissions(



      createDefaultPermissions(pages)



    );







    setError("");



    setSuccess("");



    setShowAddModal(true);



  };







  const closeAddModal = () => {



    if (!saving) {



      setShowAddModal(false);



    }



  };







  const handleAddRole = async () => {



    if (



      addForm.userType === "" ||



      !addForm.status



    ) {



      return setError(



        "Please select user type and status."



      );



    }







    try {



      setSaving(true);



      setError("");







      const payload: UserTypePayload = {



        userType: Number(addForm.userType),







        isActive:



          addForm.status === "Active",







        permissions:



          permissionPayload(addPermissions),



      };







      await addUserType(payload);







      setShowAddModal(false);



      setSuccess(



        "User type added successfully."



      );



      setCurrentPage(1);







      await loadRoles();



    } catch (e: any) {



      setError(



        e?.message ||



          "Failed to add user type."



      );



    } finally {



      setSaving(false);



    }



  };







  const openEditModal = async (



    role: Role



  ) => {



    setSelectedRole(role);







    setEditForm({



      userType: String(role.userType),



      status: role.status,



    });







    setEditPermissions(



      createDefaultPermissions(pages)



    );







    setError("");



    setSuccess("");



    setShowEditModal(true);







    try {



      setEditLoading(true);







      const response =



        await getUserTypeById(role.id);







      const detail =



        unwrapApiValue(response) || response;







      const userType = Number(



        pick(



          detail,



          ["userType", "UserType"],



          role.userType



        )



      );







      const active = boolValue(



        pick(



          detail,



          ["isActive", "IsActive"],



          role.status === "Active"



        )



      );







      setEditForm({



        userType: String(userType),



        status: active



          ? "Active"



          : "Inactive",



      });







      const state =



        createDefaultPermissions(pages);







      const permissions = pick(



        detail,



        ["permissions", "Permissions"],



        []



      );







      if (Array.isArray(permissions)) {



        permissions.forEach((p: any) => {



          const pageId = String(



            pick(p, [



              "pageId",



              "PageId",



              "id",



              "Id",



            ])



          );







          if (pageId) {



            state[pageId] = {



              read: boolValue(



                pick(p, [



                  "canRead",



                  "CanRead",



                ])



              ),







              write: boolValue(



                pick(p, [



                  "canWrite",



                  "CanWrite",



                ])



              ),







              delete: boolValue(



                pick(p, [



                  "canDelete",



                  "CanDelete",



                ])



              ),



            };



          }



        });



      }







      setEditPermissions(state);



    } catch (e: any) {



      setError(



        e?.message ||



          "Failed to load user type details."



      );



    } finally {



      setEditLoading(false);



    }



  };







  const closeEditModal = () => {



    if (!saving) {



      setShowEditModal(false);



      setSelectedRole(null);



    }



  };







  const handleUpdateRole = async () => {



    if (



      !selectedRole ||



      editForm.userType === "" ||



      !editForm.status



    ) {



      return setError(



        "Please select user type and status."



      );



    }







    try {



      setSaving(true);



      setError("");







      await updateUserType(



        selectedRole.id,



        {



          userType: Number(



            editForm.userType



          ),







          isActive:



            editForm.status === "Active",







          permissions:



            permissionPayload(



              editPermissions



            ),



        }



      );







      setShowEditModal(false);



      setSelectedRole(null);







      setSuccess(



        "User type updated successfully."



      );







      await loadRoles();



    } catch (e: any) {



      setError(



        e?.message ||



          "Failed to update user type."



      );



    } finally {



      setSaving(false);



    }



  };







  const openDeleteModal = (



    role: Role



  ) => {



    setSelectedRole(role);



    setError("");



    setSuccess("");



    setShowDeleteModal(true);



  };







  const closeDeleteModal = () => {



    if (!deleting) {



      setShowDeleteModal(false);



      setSelectedRole(null);



    }



  };







  const handleDeleteRole = async () => {



    if (!selectedRole) return;







    try {



      setDeleting(true);



      setError("");







      await deleteUserType(



        selectedRole.id



      );







      setShowDeleteModal(false);



      setSelectedRole(null);







      setSuccess(



        "User type deleted successfully."



      );







      await loadRoles();



    } catch (e: any) {



      setError(



        e?.message ||



          "Failed to delete user type."



      );



    } finally {



      setDeleting(false);



    }



  };







  const renderPermissionTable = (



    permissions: PermissionsState,



    setter: React.Dispatch<



      React.SetStateAction<PermissionsState>



    >



  ) => (



    <div className="roles-permissions-wrapper">



      <div className="roles-permissions-table-wrapper">



        <table className="roles-permissions-table">



          <thead>



            <tr>



              <th>Module Permissions</th>



              <th>Read</th>



              <th>Write</th>



              <th>Delete</th>



            </tr>



          </thead>







          <tbody>



            {pages.map((page) => (



              <tr key={page.id}>



                <td>{page.name}</td>







                {(



                  [



                    "read",



                    "write",



                    "delete",



                  ] as PermissionKey[]



                ).map((key) => (



                  <td key={key}>



                    <input



                      type="checkbox"



                      className="roles-permission-checkbox"



                      checked={



                        !!permissions[



                          page.id



                        ]?.[key]



                      }



                      onChange={() =>



                        changePermission(



                          setter,



                          page.id,



                          key



                        )



                      }



                    />



                  </td>



                ))}



              </tr>



            ))}



          </tbody>



        </table>



      </div>



    </div>



  );







  const formFields = (



    form: RoleForm,



    setForm: React.Dispatch<



      React.SetStateAction<RoleForm>



    >,



    permissions: PermissionsState,



    setPermissions: React.Dispatch<



      React.SetStateAction<PermissionsState>



    >



  ) => (



    <>



      <div className="roles-form-group">



        <label>Usertype Name</label>







        <select



          value={form.userType}



          onChange={(e) =>



            setForm((p) => ({



              ...p,



              userType: e.target.value,



            }))



          }



        >



          <option value="">



            Select Usertype



          </option>







          {USER_TYPE_OPTIONS.map((x) => (



            <option



              key={x.value}



              value={x.value}



            >



              {x.label}



            </option>



          ))}



        </select>



      </div>







      <div className="roles-form-group">



        <label>Status</label>







        <select



          value={form.status}



          onChange={(e) =>



            setForm((p) => ({



              ...p,



              status:



                e.target



                  .value as RoleForm["status"],



            }))



          }



        >



          <option value="">



            Select



          </option>



          <option value="Active">



            Active



          </option>



          <option value="Inactive">



            Inactive



          </option>



        </select>



      </div>







      <div className="roles-form-group">



        <label>



          Module Permissions



        </label>







        {pages.length ? (



          renderPermissionTable(



            permissions,



            setPermissions



          )



        ) : (



          <div>



            No permission pages found.



          </div>



        )}



      </div>



    </>



  );







  return (



    <>



      <style>{`



        .roles-page {



          width: 100%;



          min-height: calc(100vh - 50px);



          padding: 25px 25px 24px;



          background: #f8f9fb;



          color: #10203f;



          font-family: "Inter","Segoe UI",sans-serif;



        }







        .roles-page-header {



          display: flex;



          align-items: flex-start;



          justify-content: space-between;



          margin-bottom: 26px;



        }







        .roles-page-title {



          margin: 0 0 6px;



          color: #14233f;



          font-size: 24px;



          line-height: 1.2;



          font-weight: 700;



        }







        .roles-breadcrumb {



          display: flex;



          align-items: center;



          gap: 10px;



          margin-top: 3px;



          font-size: 12px;



        }







        .roles-breadcrumb-home {



          border: none;



          padding: 0;



          margin: 0;



          background: transparent;



          color: #526b7d;



          display: inline-flex;



          align-items: center;



          justify-content: center;



          cursor: pointer;



        }







        .roles-breadcrumb-home i {



          font-size: 13px;



          line-height: 1;



          font-weight: 400;



        }







        .roles-breadcrumb-slash {



          color: #c3cad3;



          font-size: 12px;



        }







        .roles-breadcrumb-text {



          color: #172b4d;



          font-size: 12px;



          font-weight: 400;



        }







        .roles-add-btn {



          height: 39px;



          margin-top: 4px;



          padding: 0 15px;



          border: 0;



          border-radius: 5px;



          background: ${GOLD};



          color: #fff;



          display: inline-flex;



          align-items: center;



          justify-content: center;



          gap: 7px;



          font-size: 14px;



          font-weight: 600;



          cursor: pointer;



        }







        .roles-add-btn:disabled {



          opacity: .6;



          cursor: not-allowed;



        }







        .roles-card {



          width: 100%;



          overflow: hidden;



          border: 1px solid #dde2e8;



          border-radius: 5px;



          background: #fff;



          box-shadow: 0 1px 2px rgba(0,0,0,.03);



        }







        .roles-card-header {



          min-height: 72px;



          padding: 14px 20px;



          border-bottom: 1px solid #dde2e8;



          display: flex;



          align-items: center;



          justify-content: space-between;



          gap: 20px;



        }







        .roles-card-title {



          margin: 0;



          color: #14233f;



          font-size: 15px;



          font-weight: 600;



        }







        .roles-filters {



          display: flex;



          align-items: center;



          gap: 15px;



        }







        .roles-filter {



          height: 38px;



          padding: 0 11px;



          border: 1px solid #dce1e7;



          border-radius: 5px;



          outline: none;



          background: #fff;



          color: #14213b;



          font-size: 13px;



        }







        .roles-date-filter {



          width: 195px;



        }







        .roles-status-filter {



          width: 90px;



        }







        .roles-sort-filter {



          width: 178px;



        }







        .roles-toolbar {



          min-height: 61px;



          padding: 10px 16px;



          border-bottom: 1px solid #e2e5e9;



          display: flex;



          align-items: center;



          justify-content: space-between;



        }







        .roles-row-control {



          display: flex;



          align-items: center;



          gap: 9px;



          color: #26354d;



          font-size: 13px;



        }







        .roles-row-select {



          width: 49px;



          height: 29px;



          padding: 0 5px;



          border: 1px solid #dce1e7;



          border-radius: 6px;



          outline: none;



          background: #fff;



          color: #465368;



          font-size: 12px;



        }







        .roles-search {



          width: 160px;



          height: 30px;



          padding: 0 14px;



          border: 1px solid #dce1e7;



          border-radius: 5px;



          outline: none;



          background: #fff;



          color: #26344d;



          font-size: 12px;



        }







        .roles-table-wrapper {



          width: 100%;



          overflow-x: auto;



        }







        .roles-table {



          width: 100%;



          min-width: 850px;



          margin: 0;



          border-collapse: collapse;



        }







        .roles-table thead {



          background: #e1e4e9;



        }







        .roles-table th {



          height: 43px;



          padding: 0 16px;



          vertical-align: middle;



          color: #06142e;



          font-size: 13px;



          font-weight: 600;



          white-space: nowrap;



        }







        .roles-table td {



          height: 47px;



          padding: 0 16px;



          vertical-align: middle;



          border-bottom: 1px solid #dfe3e8;



          background: #fff;



          color: #637083;



          font-size: 13px;



          white-space: nowrap;



        }







        .roles-check-column {



          width: 110px;



          padding-left: 20px !important;



        }







        .roles-role-column {



          width: 31%;



        }







        .roles-created-column {



          width: 22%;



        }







        .roles-status-column {



          width: 19%;



        }







        .roles-action-column {



          width: 22%;



        }







        .roles-checkbox {



          width: 18px;



          height: 18px;



          margin: 0;



          accent-color: ${GOLD};



          cursor: pointer;



        }







        .roles-sort-icon {



          float: right;



          margin-left: 8px;



          color: #cbd1d9;



          font-size: 10px;



        }







        .roles-status {



          height: 18px;



          min-width: 57px;



          padding: 0 7px;



          border-radius: 4px;



          color: #fff;



          display: inline-flex;



          align-items: center;



          justify-content: center;



          gap: 4px;



          font-size: 10px;



          font-weight: 600;



          line-height: 1;



        }







        .roles-status-active {



          background: #00bd61;



        }







        .roles-status-inactive {



          min-width: 65px;



          background: #ef0909;



        }







        .roles-status-dot {



          width: 4px !important;



          height: 4px !important;



          min-width: 4px !important;



          min-height: 4px !important;



          flex: 0 0 4px !important;



          margin: 0 !important;



          padding: 0 !important;



          border-radius: 50% !important;



          background: #fff !important;



        }







        .roles-actions {



          display: inline-flex;



          align-items: center;



          gap: 14px;



        }







        .roles-action-btn {



          width: 20px;



          height: 25px;



          padding: 0;



          border: 0;



          background: transparent;



          color: #506c82;



          display: inline-flex;



          align-items: center;



          justify-content: center;



          cursor: pointer;



        }







        .roles-action-btn:disabled {



          opacity: .5;



          cursor: not-allowed;



        }







        .roles-table-footer {



          min-height: 57px;



          padding: 0 16px;



          border-top: 1px solid #dfe3e8;



          display: flex;



          align-items: center;



          justify-content: space-between;



          color: #596679;



          font-size: 13px;



        }







        .roles-pagination {



          display: flex;



          align-items: center;



          gap: 16px;



        }







        .roles-page-arrow {



          width: 22px;



          height: 28px;



          padding: 0;



          border: 0;



          background: transparent;



          color: #9da5b1;



          display: inline-flex;



          align-items: center;



          justify-content: center;



          cursor: pointer;



        }







        .roles-page-arrow:disabled {



          opacity: .4;



          cursor: not-allowed;



        }







        .roles-current-page {



          width: 27px;



          height: 27px;



          border-radius: 50%;



          background: ${GOLD};



          color: #fff;



          display: inline-flex;



          align-items: center;



          justify-content: center;



          font-size: 12px;



        }







        .roles-loading {



          height: 120px;



          text-align: center;



          color: #637083;



          font-size: 13px;



        }







        .roles-empty {



          height: 120px;



          text-align: center;



          color: #7b8794;



          font-size: 13px;



        }







        .roles-empty td {



          height: 120px;



        }







        .roles-message {



          margin-bottom: 15px;



          padding: 11px 14px;



          border-radius: 5px;



          font-size: 13px;



        }







        .roles-success {



          border: 1px solid #b7e4c7;



          background: #eaf8ef;



          color: #18743a;



        }







        .roles-error {



          border: 1px solid #f2b8b5;



          background: #fff0ef;



          color: #b42318;



        }







        .roles-modal-overlay {



          position: fixed;



          inset: 0;



          z-index: 99999;



          padding: 15px;



          display: flex;



          align-items: center;



          justify-content: center;



          background: rgba(0,0,0,.42);



        }







        .roles-form-modal {



          width: 700px;



          max-width: calc(100vw - 30px);



          max-height: calc(100vh - 30px);



          overflow-y: auto;



          border-radius: 5px;



          background: #fff;



          box-shadow: 0 15px 45px rgba(0,0,0,.2);



        }







        .roles-modal-header {



          height: 64px;



          padding: 0 16px;



          border-bottom: 1px solid #e5e7eb;



          display: flex;



          align-items: center;



          justify-content: space-between;



        }







        .roles-modal-header h3 {



          margin: 0;



          color: #253858;



          font-size: 20px;



          font-weight: 600;



        }







        .roles-modal-close {



          width: 21px;



          height: 21px;



          padding: 0;



          border: 0;



          border-radius: 50%;



          background: #747c89;



          color: #fff;



          display: flex;



          align-items: center;



          justify-content: center;



          font-size: 14px;



          cursor: pointer;



        }







        .roles-modal-body {



          padding: 18px 16px 8px;



        }







        .roles-form-group {



          margin-bottom: 17px;



        }







        .roles-form-group label {



          display: block;



          margin-bottom: 8px;



          color: #253858;



          font-size: 14px;



          font-weight: 500;



        }







        .roles-form-group input,



        .roles-form-group select {



          width: 100%;



          height: 40px;



          padding: 0 10px;



          border: 1px solid #d9dee7;



          border-radius: 5px;



          outline: none;



          background: #fff;



          color: #26344d;



          font-size: 14px;



          box-sizing: border-box;



        }







        .roles-form-group input:focus,



        .roles-form-group select:focus {



          border-color: ${GOLD};



        }







        .roles-permissions-wrapper {



          margin-top: 8px;



          margin-bottom: 8px;



          border: 1px solid #d9dee7;



          border-radius: 5px;



          overflow: hidden;



        }







        .roles-permissions-table-wrapper {



          width: 100%;



          overflow-x: auto;



        }







        .roles-permissions-table {



          width: 100%;



          min-width: 520px;



          border-collapse: collapse;



          table-layout: fixed;



        }







        .roles-permissions-table thead {



          background: #e1e4e9;



        }







        .roles-permissions-table th {



          height: 42px;



          padding: 0 10px;



          color: #06142e;



          font-size: 13px;



          font-weight: 600;



          text-align: center;



          white-space: nowrap;



          border-bottom: 1px solid #d9dee7;



        }







        .roles-permissions-table th:first-child {



          width: 290px;



          text-align: left;



          padding-left: 14px;



        }







        .roles-permissions-table td {



          height: 44px;



          padding: 0 10px;



          color: #26344d;



          font-size: 13px;



          text-align: center;



          border-bottom: 1px solid #dfe3e8;



          background: #fff;



        }







        .roles-permissions-table tbody tr:last-child td {



          border-bottom: none;



        }







        .roles-permissions-table td:first-child {



          text-align: left;



          padding-left: 14px;



          color: #172b4d;



          font-size: 14px;



          font-weight: 400;



        }







        .roles-permission-checkbox {



          width: 16px !important;



          height: 16px !important;



          min-width: 16px !important;



          min-height: 16px !important;



          max-width: 16px !important;



          max-height: 16px !important;



          margin: 0 !important;



          padding: 0 !important;



          accent-color: ${GOLD};



          cursor: pointer;



          vertical-align: middle;



          appearance: auto;



          box-sizing: border-box;



        }







        .roles-modal-footer {



          padding: 12px;



          border-top: 1px solid #e5e7eb;



          display: flex;



          justify-content: flex-end;



          gap: 8px;



          background: #fff;



        }







        .roles-modal-cancel,



        .roles-modal-save {



          height: 40px;



          padding: 0 16px;



          border: 0;



          border-radius: 5px;



          font-size: 14px;



          cursor: pointer;



        }







        .roles-modal-cancel {



          background: #f8f9fa;



          color: #172b4d;



          border: 1px solid #d9dee7;



        }







        .roles-modal-save {



          background: ${GOLD};



          color: #fff;



          font-weight: 600;



        }







        .roles-modal-save:disabled,



        .roles-modal-cancel:disabled {



          opacity: .6;



          cursor: not-allowed;



        }







        .roles-delete-modal {



          width: 400px;



          max-width: calc(100vw - 30px);



          padding: 17px 30px;



          border-radius: 5px;



          background: #fff;



          text-align: center;



          box-shadow: 0 15px 45px rgba(0,0,0,.2);



        }







        .roles-delete-icon {



          width: 58px;



          height: 58px;



          margin: 0 auto 14px;



          border-radius: 4px;



          background: #f6cccc;



          color: #f10f18;



          display: flex;



          align-items: center;



          justify-content: center;



        }







        .roles-delete-modal h3 {



          margin: 0 0 6px;



          color: #1d2b48;



          font-size: 19px;



          font-weight: 600;



        }







        .roles-delete-modal p {



          max-width: 330px;



          margin: 0 auto 17px;



          color: #3e4654;



          font-size: 13px;



          line-height: 1.5;



        }







        .roles-delete-actions {



          display: flex;



          align-items: center;



          justify-content: center;



          gap: 16px;



        }







        .roles-delete-cancel,



        .roles-delete-confirm {



          height: 39px;



          padding: 0 16px;



          border: 0;



          border-radius: 5px;



          font-size: 13px;



          cursor: pointer;



        }







        .roles-delete-cancel {



          background: #f6f7f8;



          color: #172033;



        }







        .roles-delete-confirm {



          background: #f10d16;



          color: #fff;



          font-weight: 600;



        }







        .roles-delete-confirm:disabled,



        .roles-delete-cancel:disabled {



          opacity: .6;



          cursor: not-allowed;



        }







        .roles-date-range {



          display: flex;



          align-items: flex-end;



          gap: 12px;



        }







        .roles-date-field {



          display: flex;



          flex-direction: column;



          gap: 5px;



        }







        .roles-date-field label {



          color: #526174;



          font-size: 11px;



          font-weight: 500;



        }







        .roles-date-field input {



          width: 145px;



          height: 38px;



          padding: 0 9px;



          border: 1px solid #dce1e7;



          border-radius: 5px;



          outline: none;



          background: #fff;



          color: #14213b;



          font-size: 13px;



          cursor: pointer;



          box-sizing: border-box;



        }







        .roles-date-field input:focus {



          border-color: ${GOLD};



        }







        .roles-date-field input::-webkit-calendar-picker-indicator {



          cursor: pointer;



          opacity: 0.7;



        }







        @media (max-width: 900px) {



          .roles-card-header {



            align-items: flex-start;



            flex-direction: column;



          }







          .roles-filters {



            width: 100%;



            flex-wrap: wrap;



          }







          .roles-filter {



            flex: 1;



            min-width: 130px;



          }



        }







        @media (max-width: 600px) {



          .roles-page {



            padding: 15px;



          }







          .roles-page-header {



            gap: 15px;



            flex-direction: column;



          }







          .roles-add-btn {



            align-self: flex-end;



          }







          .roles-toolbar {



            align-items: flex-start;



            gap: 10px;



            flex-direction: column;



          }







          .roles-search {



            width: 100%;



          }







          .roles-form-modal {



            width: 100%;



          }



        }



      `}</style>







      <div className="roles-page">



        <div className="roles-page-header">



          <div>



            <h1 className="roles-page-title">



              Designations & Permissions



            </h1>







            <div className="roles-breadcrumb">



              <button



                type="button"



                className="roles-breadcrumb-home"



                onClick={() =>



                  navigate("/admin/dashboard")



                }



              >



                <i className="ti ti-smart-home" />



              </button>







              <span className="roles-breadcrumb-slash">



                /



              </span>







              <span className="roles-breadcrumb-text">



                Designations



              </span>



            </div>



          </div>







          <button



            type="button"



            className="roles-add-btn"



            onClick={openAddModal}



          >



            <CirclePlus size={15} />



            Add Usertype



          </button>



        </div>







        {success && (



          <div className="roles-message roles-success">



            {success}



          </div>



        )}







        {error && (



          <div className="roles-message roles-error">



            {error}



          </div>



        )}







        <div className="roles-card">



          <div className="roles-card-header">



            <h5 className="roles-card-title">



              Designation List



            </h5>







            <div className="roles-filters">



              <div className="roles-date-range">



                <div className="roles-date-field">



                  <input



                    type="date"



                    value={fromDate}



                    onChange={(e) => {



                      setFromDate(



                        e.target.value



                      );



                      setCurrentPage(1);



                    }}



                  />



                </div>







                <div className="roles-date-field">



                  <input



                    type="date"



                    value={toDate}



                    min={



                      fromDate || undefined



                    }



                    onChange={(e) => {



                      setToDate(



                        e.target.value



                      );



                      setCurrentPage(1);



                    }}



                  />



                </div>



              </div>







              <select



                className="roles-filter roles-status-filter"



                value={statusFilter}



                onChange={(e) => {



                  setStatusFilter(



                    e.target.value



                  );



                  setCurrentPage(1);



                }}



              >



                <option value="">



                  Status



                </option>



                <option>Active</option>



                <option>Inactive</option>



              </select>







              <select



                className="roles-filter roles-sort-filter"



                value={sortBy}



                onChange={(e) => {



                  setSortBy(



                    e.target.value



                  );



                  setCurrentPage(1);



                }}



              >



                <option value="Last 7 Days">



                  Sort By : Last 7 Days



                </option>







                <option value="Recently Added">



                  Recently Added



                </option>







                <option value="Ascending">



                  Ascending



                </option>







                <option value="Descending">



                  Descending



                </option>







                <option value="Last Month">



                  Last Month



                </option>



              </select>



            </div>



          </div>







          <div className="roles-toolbar">



            <div className="roles-row-control">



              <span>Row Per Page</span>







              <select



                className="roles-row-select"



                value={rowsPerPage}



                onChange={(e) => {



                  setRowsPerPage(



                    Number(e.target.value)



                  );



                  setCurrentPage(1);



                }}



              >



                <option value={10}>



                  10



                </option>



                <option value={20}>



                  20



                </option>



                <option value={30}>



                  30



                </option>



              </select>







              <span>Entries</span>







              <select



                className="roles-row-select"



                style={{ width: 110 }}



                value={userTypeFilter}



                onChange={(e) => {



                  setUserTypeFilter(



                    e.target.value



                  );



                  setCurrentPage(1);



                }}



              >



                <option value="">



                  All Types



                </option>







                {USER_TYPE_OPTIONS.map(



                  (x) => (



                    <option



                      key={x.value}



                      value={x.value}



                    >



                      {x.label}



                    </option>



                  )



                )}



              </select>



            </div>







            <input



              className="roles-search"



              placeholder="Search"



              value={search}



              onChange={(e) => {



                setSearch(e.target.value);



                setCurrentPage(1);



              }}



            />



          </div>







          <div className="roles-table-wrapper">



            <table className="roles-table">



              <thead>



                <tr>



                  <th className="roles-check-column">



                    <input



                      type="checkbox"



                      className="roles-checkbox"



                      checked={



                        allVisibleSelected



                      }



                      onChange={



                        handleSelectAll



                      }



                      disabled={



                        !roles.length



                      }



                    />



                  </th>







                  <th className="roles-role-column">



                    User Type



                  </th>







                  <th className="roles-created-column">



                    Created Date



                  </th>







                  <th className="roles-status-column">



                    Status



                  </th>







                  <th className="roles-action-column">



                    Actions



                  </th>



                </tr>



              </thead>







              <tbody>



                {loading ? (



                  <tr>



                    <td



                      colSpan={5}



                      className="roles-loading"



                    >



                      Loading user types...



                    </td>



                  </tr>



                ) : !roles.length ? (



                  <tr className="roles-empty">



                    <td colSpan={5}>



                      No user types found



                    </td>



                  </tr>



                ) : (



                  roles.map((role) => (



                    <tr key={role.id}>



                      <td className="roles-check-column">



                        <input



                          type="checkbox"



                          className="roles-checkbox"



                          checked={selectedIds.includes(



                            role.id



                          )}



                          onChange={() =>



                            handleSelectRole(



                              role.id



                            )



                          }



                        />



                      </td>







                      <td>{role.name}</td>







                      <td>



                        {formatDate(



                          role.createdDate



                        )}



                      </td>







                      <td>



                        <span



                          className={`roles-status ${



                            role.status ===



                            "Active"



                              ? "roles-status-active"



                              : "roles-status-inactive"



                          }`}



                        >



                          <span className="roles-status-dot" />



                          {role.status}



                        </span>



                      </td>







                      <td>



                        <div className="roles-actions">



                          <button



                            className="roles-action-btn"



                            title="Edit"



                            onClick={() =>



                              openEditModal(



                                role



                              )



                            }



                          >



                            <Pencil



                              size={15}



                            />



                          </button>







                          <button



                            className="roles-action-btn"



                            title="Delete"



                            onClick={() =>



                              openDeleteModal(



                                role



                              )



                            }



                          >



                            <Trash2



                              size={15}



                            />



                          </button>



                        </div>



                      </td>



                    </tr>



                  ))



                )}



              </tbody>



            </table>



          </div>







          <div className="roles-table-footer">



            <div>



              Showing{" "}



              {totalCount === 0



                ? 0



                : (currentPage - 1) *



                    rowsPerPage +



                  1}{" "}



              -{" "}



              {Math.min(



                currentPage *



                  rowsPerPage,



                totalCount



              )}{" "}



              of {totalCount} entries



            </div>







            <div className="roles-pagination">



              <button



                className="roles-page-arrow"



                disabled={



                  currentPage <= 1



                }



                onClick={() =>



                  setCurrentPage((p) =>



                    Math.max(1, p - 1)



                  )



                }



              >



                <ChevronLeft size={16} />



              </button>







              <span className="roles-current-page">



                {currentPage}



              </span>







              <button



                className="roles-page-arrow"



                disabled={



                  currentPage >=



                  totalPages



                }



                onClick={() =>



                  setCurrentPage((p) =>



                    Math.min(



                      totalPages,



                      p + 1



                    )



                  )



                }



              >



                <ChevronRight



                  size={16}



                />



              </button>



            </div>



          </div>



        </div>







        {showAddModal && (



          <div className="roles-modal-overlay">



            <div className="roles-form-modal">



              <div className="roles-modal-header">



                <h3>Add Usertype</h3>







                <button



                  className="roles-modal-close"



                  onClick={



                    closeAddModal



                  }



                >







                </button>



              </div>







              <div className="roles-modal-body">



                {formFields(



                  addForm,



                  setAddForm,



                  addPermissions,



                  setAddPermissions



                )}



              </div>







              <div className="roles-modal-footer">



                <button



                  className="roles-modal-cancel"



                  onClick={



                    closeAddModal



                  }



                  disabled={saving}



                >



                  Cancel



                </button>







                <button



                  className="roles-modal-save"



                  onClick={



                    handleAddRole



                  }



                  disabled={



                    saving ||



                    !pages.length



                  }



                >



                  {saving



                    ? "Adding..."



                    : "Add Usertype"}



                </button>



              </div>



            </div>



          </div>



        )}







        {showEditModal &&



          selectedRole && (



            <div className="roles-modal-overlay">



              <div className="roles-form-modal">



                <div className="roles-modal-header">



                  <h3>



                    Edit Usertype



                  </h3>







                  <button



                    className="roles-modal-close"



                    onClick={



                      closeEditModal



                    }



                  >







                  </button>



                </div>







                <div className="roles-modal-body">



                  {editLoading ? (



                    <div className="roles-loading">



                      Loading



                      details...



                    </div>



                  ) : (



                    formFields(



                      editForm,



                      setEditForm,



                      editPermissions,



                      setEditPermissions



                    )



                  )}



                </div>







                <div className="roles-modal-footer">



                  <button



                    className="roles-modal-cancel"



                    onClick={



                      closeEditModal



                    }



                    disabled={saving}



                  >



                    Cancel



                  </button>







                  <button



                    className="roles-modal-save"



                    onClick={



                      handleUpdateRole



                    }



                    disabled={



                      saving ||



                      editLoading



                    }



                  >



                    {saving



                      ? "Saving..."



                      : "Save"}



                  </button>



                </div>



              </div>



            </div>



          )}







        {showDeleteModal &&



          selectedRole && (



            <div className="roles-modal-overlay">



              <div className="roles-delete-modal">



                <div className="roles-delete-icon">



                  <Trash2 size={31} />



                </div>







                <h3>



                  Delete Usertype



                </h3>







                <p>



                  Are you sure you want



                  to delete{" "}



                  <strong>



                    {selectedRole.name}



                  </strong>



                  ?



                </p>







                <div className="roles-delete-actions">



                  <button



                    className="roles-delete-cancel"



                    onClick={



                      closeDeleteModal



                    }



                    disabled={deleting}



                  >



                    Cancel



                  </button>







                  <button



                    className="roles-delete-confirm"



                    onClick={



                      handleDeleteRole



                    }



                    disabled={deleting}



                  >



                    {deleting



                      ? "Deleting..."



                      : "Delete"}



                  </button>



                </div>



              </div>



            </div>



          )}



      </div>

    </>


  );


};


export default Roles;
