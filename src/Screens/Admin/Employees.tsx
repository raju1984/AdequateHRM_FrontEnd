import "../../assets/css/Employee.css";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiHome,
  FiImage,
  FiTrash2,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiUserX,
  FiX,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  getDepartments,
  getDesignations,
  updateEmployee,
} from "../../services/adminservices";

type EmployeeData = {
  uuid: string;
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  company: string;
  department: string;
  departmentId: string;
  des: string;
  designationId: string;
  date: string;
  rawJoiningDate: string;
  about: string;
  status: "Active" | "Inactive";
  image?: string;
};

type DepartmentData = {
  id: string;
  name: string;
};

type DesignationData = {
  id: string;
  name: string;
  departmentId: string;
};

const initialForm = {
  firstName: "",
  lastName: "",
  employeeId: "",
  joiningDate: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  company: "",
  department: "",
  designation: "",
  about: "",
};

const Employee = () => {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [search, setSearch] =
    useState("");

  const [
    designationFilter,
    setDesignationFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [sortBy, setSortBy] =
    useState("new");

  const [
    dateRange,
    setDateRange,
  ] = useState("all");

  const [
    openModal,
    setOpenModal,
  ] = useState(false);

  const [
    openEditModal,
    setOpenEditModal,
  ] = useState(false);

  const [
    openDeleteModal,
    setOpenDeleteModal,
  ] = useState(false);

  const [
    selectedEmployee,
    setSelectedEmployee,
  ] =
    useState<EmployeeData | null>(
      null
    );

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    profilePreview,
    setProfilePreview,
  ] = useState("");

  const [
    selectedProfileFile,
    setSelectedProfileFile,
  ] =
    useState<File | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    editSaving,
    setEditSaving,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    departmentLoading,
    setDepartmentLoading,
  ] = useState(false);

  const [
    designationLoading,
    setDesignationLoading,
  ] = useState(false);

  const [
    filterDesignationLoading,
    setFilterDesignationLoading,
  ] = useState(false);

  const [
    employees,
    setEmployees,
  ] = useState<EmployeeData[]>([]);

  const [
    departments,
    setDepartments,
  ] = useState<DepartmentData[]>([]);

  const [
    designations,
    setDesignations,
  ] = useState<DesignationData[]>([]);

  const [
    filterDesignations,
    setFilterDesignations,
  ] = useState<DesignationData[]>([]);

  const [
    formData,
    setFormData,
  ] = useState(initialForm);

  const [
    totalRecords,
    setTotalRecords,
  ] = useState(0);

  const getArrayFromResponse = (
    response: any,
    possibleKeys: string[]
  ) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (
      Array.isArray(response?.data)
    ) {
      return response.data;
    }

    for (const key of possibleKeys) {
      if (
        Array.isArray(
          response?.[key]
        )
      ) {
        return response[key];
      }

      if (
        Array.isArray(
          response?.data?.[key]
        )
      ) {
        return response.data[key];
      }
    }

    if (
      Array.isArray(
        response?.data?.data
      )
    ) {
      return response.data.data;
    }

    if (
      Array.isArray(
        response?.data?.items
      )
    ) {
      return response.data.items;
    }

    if (
      Array.isArray(
        response?.data?.Items
      )
    ) {
      return response.data.Items;
    }

    if (
      Array.isArray(
        response?.items
      )
    ) {
      return response.items;
    }

    if (
      Array.isArray(
        response?.Items
      )
    ) {
      return response.Items;
    }

    return [];
  };

  const getTotalFromResponse = (
    response: any,
    fallback: number
  ) => {
    const candidates = [
      response?.totalCount,
      response?.TotalCount,
      response?.totalRecords,
      response?.TotalRecords,
      response?.count,
      response?.Count,
      response?.data?.totalCount,
      response?.data?.TotalCount,
      response?.data?.totalRecords,
      response?.data?.TotalRecords,
      response?.data?.count,
      response?.data?.Count,
    ];

    for (const value of candidates) {
      const parsed = Number(value);

      if (
        Number.isFinite(parsed) &&
        parsed >= 0
      ) {
        return parsed;
      }
    }

    return fallback;
  };

  const getErrorMessage = (
    error: any,
    fallback: string
  ) => {
    const backendErrors =
      error?.response?.data?.errors;

    if (backendErrors) {
      return Object.entries(
        backendErrors
      )
        .map(([field, messages]) =>
          `${field}: ${
            Array.isArray(messages)
              ? messages.join(", ")
              : String(messages)
          }`
        )
        .join("\n");
    }

    return (
      error?.response?.data
        ?.message ||
      error?.response?.data?.title ||
      error?.message ||
      fallback
    );
  };

  const formatJoiningDate = (
    value: any
  ) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return String(value);
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const toInputDate = (
    value: string
  ) => {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getApiDateRange = () => {
    if (dateRange === "all") {
      return {
        fromDate: undefined,
        toDate: undefined,
      };
    }

    const end = new Date();
    end.setHours(
      23,
      59,
      59,
      999
    );

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (dateRange === "30") {
      start.setDate(
        start.getDate() - 29
      );
    } else if (
      dateRange === "7"
    ) {
      start.setDate(
        start.getDate() - 6
      );
    }

    return {
      fromDate:
        start.toISOString(),
      toDate: end.toISOString(),
    };
  };

  const getDateRangeLabel = () => {
    if (dateRange === "all") {
      return "All Dates";
    }

    const {
      fromDate,
      toDate,
    } = getApiDateRange();

    if (!fromDate || !toDate) {
      return "All Dates";
    }

    const format = (
      value: string
    ) =>
      new Date(
        value
      ).toLocaleDateString(
        "en-US",
        {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }
      );

    return `${format(
      fromDate
    )} - ${format(toDate)}`;
  };

  const getProfileImageUrl = (
    value?: string
  ) => {
    if (!value) {
      return "";
    }

    if (
      value.startsWith("http://") ||
      value.startsWith(
        "https://"
      ) ||
      value.startsWith("blob:")
    ) {
      return value;
    }

    return `http://jupiterapi.adequateshop.com/${value.replace(
      /^\/+/,
      ""
    )}`;
  };

  const getEmployeeStatus = (
    item: any
  ): "Active" | "Inactive" => {
    if (
      typeof item?.isActive ===
      "boolean"
    ) {
      return item.isActive
        ? "Active"
        : "Inactive";
    }

    const status =
      item.userStatus ??
      item.UserStatus ??
      item.status ??
      item.Status;

    if (
      typeof status === "string"
    ) {
      return status
        .toLowerCase()
        .includes("inactive")
        ? "Inactive"
        : "Active";
    }

    return status === 2
      ? "Inactive"
      : "Active";
  };

  const fetchEmployees =
    async () => {
      try {
        setLoading(true);

        const {
          fromDate,
          toDate,
        } = getApiDateRange();

        const userStatus =
          statusFilter === "Active"
            ? 1
            : statusFilter ===
              "Inactive"
            ? 2
            : undefined;

        const response =
          await getAllEmployees({
            Search:
              search.trim() ||
              undefined,

            DesignationId:
              designationFilter ||
              undefined,

            UserStatus:
              userStatus,

            FromDate: fromDate,
            ToDate: toDate,

            PageNumber:
              currentPage,

            PageSize:
              rowsPerPage,

            SortBy:
              sortBy ||
              undefined,
          });

        console.log(
          "GET EMPLOYEES RESPONSE:",
          response
        );

        const rawEmployees =
          getArrayFromResponse(
            response,
            [
              "employees",
              "Employees",
              "employeeList",
              "EmployeeList",
              "records",
              "Records",
              "items",
              "Items",
            ]
          );

        const formattedEmployees: EmployeeData[] =
          rawEmployees.map(
            (
              item: any,
              index: number
            ) => {
              const firstName =
                item.firstName ??
                item.FirstName ??
                "";

              const lastName =
                item.lastName ??
                item.LastName ??
                "";

              const fullName =
                item.fullName ??
                item.FullName ??
                item.name ??
                item.Name ??
                item.employeeName ??
                `${firstName} ${lastName}`.trim();

              const rawJoiningDate =
                item.joiningDate ??
                item.JoiningDate ??
                "";

              return {
                uuid:
                  item.id ??
                  item.Id ??
                  item.employeeId ??
                  item.EmployeeId ??
                  item.userId ??
                  item.UserId ??
                  "",

                id:
                  item.employeeCode ??
                  item.EmployeeCode ??
                  item.code ??
                  item.Code ??
                  `Emp-${String(
                    (currentPage - 1) *
                      rowsPerPage +
                      index +
                      1
                  ).padStart(
                    3,
                    "0"
                  )}`,

                firstName,
                lastName,

                name:
                  fullName ||
                  `Employee ${
                    index + 1
                  }`,

                username:
                  item.userName ??
                  item.UserName ??
                  item.username ??
                  "",

                email:
                  item.email ??
                  item.Email ??
                  "",

                phone:
                  item.phoneNumber ??
                  item.PhoneNumber ??
                  item.phone ??
                  item.Phone ??
                  "",

                company:
                  item.company ??
                  item.Company ??
                  "",

                department:
                  item.departmentName ??
                  item.DepartmentName ??
                  item.department ??
                  item.Department ??
                  "",

                departmentId:
                  item.departmentId ??
                  item.DepartmentId ??
                  "",

                des:
                  item.designationName ??
                  item.DesignationName ??
                  item.designation ??
                  item.Designation ??
                  item.des ??
                  "",

                designationId:
                  item.designationId ??
                  item.DesignationId ??
                  "",

                rawJoiningDate,

                date:
                  formatJoiningDate(
                    rawJoiningDate
                  ),

                about:
                  item.about ??
                  item.About ??
                  "",

                status:
                  getEmployeeStatus(
                    item
                  ),

                image:
                  getProfileImageUrl(
                    item.profilePicture ??
                      item.ProfilePicture ??
                      item.profileImage ??
                      item.ProfileImage ??
                      item.image
                  ),
              };
            }
          );

        setEmployees(
          formattedEmployees
        );

        setTotalRecords(
          getTotalFromResponse(
            response,
            formattedEmployees.length
          )
        );
      } catch (error: any) {
        console.error(
          "GET EMPLOYEES ERROR:",
          error
        );

        console.error(
          "GET EMPLOYEES BACKEND:",
          error?.response?.data
        );

        setEmployees([]);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    };

  const fetchDepartments =
    async () => {
      try {
        setDepartmentLoading(
          true
        );

        const response =
          await getDepartments({
            Search: "",
            PageNumber: 1,
            PageSize: 100,
          });

        console.log(
          "GET DEPARTMENT RESPONSE:",
          response
        );

        const rawDepartments =
          getArrayFromResponse(
            response,
            [
              "departments",
              "Departments",
              "departmentList",
              "DepartmentList",
              "records",
              "Records",
              "items",
              "Items",
            ]
          );

        const formattedDepartments: DepartmentData[] =
          rawDepartments
            .map((item: any) => ({
              id:
                item.id ??
                item.Id ??
                item.departmentId ??
                item.DepartmentId ??
                "",

              name:
                item.departmentName ??
                item.DepartmentName ??
                item.name ??
                item.Name ??
                "",
            }))
            .filter(
              (
                item: DepartmentData
              ) =>
                Boolean(item.id) &&
                Boolean(item.name)
            );

        setDepartments(
          formattedDepartments
        );
      } catch (error: any) {
        console.error(
          "GET DEPARTMENT ERROR:",
          error
        );

        setDepartments([]);
      } finally {
        setDepartmentLoading(
          false
        );
      }
    };

  const fetchDesignations =
    async (
      departmentId: string
    ) => {
      if (!departmentId) {
        setDesignations([]);
        return;
      }

      try {
        setDesignationLoading(
          true
        );

        setDesignations([]);

        console.log(
          "SELECTED DEPARTMENT ID:",
          departmentId
        );

        const response =
          await getDesignations({
            Search: "",
            DepartmentId:
              departmentId,
            UserStatus: 1,
            PageNumber: 1,
            PageSize: 100,
          });

        console.log(
          "GET DESIGNATION RESPONSE:",
          response
        );

        const rawDesignations =
          getArrayFromResponse(
            response,
            [
              "designations",
              "Designations",
              "designationList",
              "DesignationList",
              "records",
              "Records",
              "items",
              "Items",
            ]
          );

        console.log(
          "RAW DESIGNATIONS:",
          rawDesignations
        );

        const formattedDesignations: DesignationData[] =
          rawDesignations
            .map((item: any) => ({
              id:
                item.id ??
                item.Id ??
                item.designationId ??
                item.DesignationId ??
                "",

              name:
                item.designationName ??
                item.DesignationName ??
                item.name ??
                item.Name ??
                "",

              departmentId:
                item.departmentId ??
                item.DepartmentId ??
                departmentId,
            }))
            .filter(
              (
                item: DesignationData
              ) =>
                Boolean(item.id) &&
                Boolean(item.name)
            );

        console.log(
          "FORMATTED DESIGNATIONS:",
          formattedDesignations
        );

        setDesignations(
          formattedDesignations
        );
      } catch (error: any) {
        console.error(
          "GET DESIGNATION ERROR:",
          error
        );

        console.error(
          "GET DESIGNATION BACKEND:",
          error?.response?.data
        );

        setDesignations([]);
      } finally {
        setDesignationLoading(
          false
        );
      }
    };

  const fetchFilterDesignations =
    async () => {
      try {
        setFilterDesignationLoading(
          true
        );

        const response =
          await getDesignations({
            Search: "",
            PageNumber: 1,
            PageSize: 500,
          });

        const raw =
          getArrayFromResponse(
            response,
            [
              "designations",
              "Designations",
              "designationList",
              "DesignationList",
              "records",
              "Records",
              "items",
              "Items",
            ]
          );

        const formatted: DesignationData[] =
          raw
            .map((item: any) => ({
              id:
                item.id ??
                item.Id ??
                item.designationId ??
                item.DesignationId ??
                "",

              name:
                item.designationName ??
                item.DesignationName ??
                item.name ??
                item.Name ??
                "",

              departmentId:
                item.departmentId ??
                item.DepartmentId ??
                "",
            }))
            .filter(
              (
                item: DesignationData
              ) =>
                Boolean(item.id) &&
                Boolean(item.name)
            );

        setFilterDesignations(
          formatted
        );
      } catch (error: any) {
        console.error(
          "GET FILTER DESIGNATIONS ERROR:",
          error
        );

        setFilterDesignations([]);
      } finally {
        setFilterDesignationLoading(
          false
        );
      }
    };

  useEffect(() => {
    fetchDepartments();
    fetchFilterDesignations();
  }, []);

  useEffect(() => {
    if (
      !formData.department
    ) {
      setDesignations([]);
      return;
    }

    fetchDesignations(
      formData.department
    );
  }, [formData.department]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          fetchEmployees();
        },
        search ? 400 : 0
      );

    return () =>
      window.clearTimeout(timer);
  }, [
    search,
    designationFilter,
    statusFilter,
    dateRange,
    sortBy,
    currentPage,
    rowsPerPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    designationFilter,
    statusFilter,
    dateRange,
    sortBy,
    rowsPerPage,
  ]);

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = e.target;

    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        designation: "",
      }));

      setDesignations([]);

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      file.size >
      4 * 1024 * 1024
    ) {
      alert(
        "Image should be below 4 MB"
      );
      return;
    }

    if (
      profilePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        profilePreview
      );
    }

    setSelectedProfileFile(file);

    setProfilePreview(
      URL.createObjectURL(file)
    );
  };

  const handleRemoveImage = () => {
    if (
      profilePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        profilePreview
      );
    }

    setProfilePreview("");
    setSelectedProfileFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialForm,
    });

    setDesignations([]);

    if (
      profilePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        profilePreview
      );
    }

    setProfilePreview("");
    setSelectedProfileFile(null);
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  const openAddEmployeeModal =
    () => {
      resetForm();
      setSelectedEmployee(null);
      setOpenModal(true);

      if (
        departments.length === 0
      ) {
        fetchDepartments();
      }
    };

  const closeAddModal = () => {
    if (saving) {
      return;
    }

    setOpenModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    if (editSaving) {
      return;
    }

    setOpenEditModal(false);
    setSelectedEmployee(null);
    resetForm();
  };

  const handleAddEmployee =
    async () => {
      if (
        !formData.firstName.trim() ||
        !formData.employeeId.trim() ||
        !formData.username.trim() ||
        !formData.email.trim() ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.phone.trim() ||
        !formData.department ||
        !formData.designation ||
        !formData.joiningDate
      ) {
        alert(
          "Please fill all required fields"
        );
        return;
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        alert(
          "Password and Confirm Password do not match"
        );
        return;
      }

      try {
        setSaving(true);

        const data =
          new FormData();

        data.append(
          "FirstName",
          formData.firstName.trim()
        );

        data.append(
          "LastName",
          formData.lastName.trim()
        );

        data.append(
          "UserName",
          formData.username.trim()
        );

        data.append(
          "Email",
          formData.email.trim()
        );

        data.append(
          "Password",
          formData.password
        );

        data.append(
          "ConfirmPassword",
          formData.confirmPassword
        );

        data.append(
          "PhoneNumber",
          formData.phone.trim()
        );

        data.append(
          "Company",
          formData.company.trim()
        );

        data.append(
          "DepartmentId",
          formData.department
        );

        data.append(
          "DesignationId",
          formData.designation
        );

        data.append(
          "JoiningDate",
          new Date(
            `${formData.joiningDate}T00:00:00`
          ).toISOString()
        );

        data.append(
          "About",
          formData.about.trim()
        );

        data.append(
          "EmployeeCode",
          formData.employeeId.trim()
        );

        if (
          selectedProfileFile
        ) {
          data.append(
            "ProfilePicture",
            selectedProfileFile
          );
        }

        const response =
          await addEmployee(data);

        if (
          response?.isSuccess ===
            false ||
          response?.statusCode >= 400
        ) {
          alert(
            response?.message ||
              "Unable to add employee"
          );
          return;
        }

        alert(
          response?.message ||
            "Employee added successfully"
        );

        closeAddModal();
        setCurrentPage(1);

        await fetchEmployees();
      } catch (error: any) {
        console.error(
          "ADD EMPLOYEE ERROR:",
          error
        );

        alert(
          getErrorMessage(
            error,
            "Unable to add employee"
          )
        );
      } finally {
        setSaving(false);
      }
    };

  const handleEditClick =
    async (
      employee: EmployeeData
    ) => {
      setSelectedEmployee(employee);

      setFormData({
        firstName:
          employee.firstName,
        lastName:
          employee.lastName,
        employeeId:
          employee.id,
        joiningDate:
          toInputDate(
            employee.rawJoiningDate ||
              employee.date
          ),
        username:
          employee.username,
        email:
          employee.email,
        password: "",
        confirmPassword: "",
        phone: employee.phone,
        company:
          employee.company,
        department:
          employee.departmentId ||
          "",
        designation:
          employee.designationId ||
          "",
        about: employee.about,
      });

      setProfilePreview(
        employee.image || ""
      );

      setSelectedProfileFile(null);

      setOpenEditModal(true);
    };

  const handleEditSave =
    async () => {
      if (!selectedEmployee) {
        return;
      }

      if (
        !selectedEmployee.uuid
      ) {
        alert(
          "Employee Id not found"
        );
        return;
      }

      if (
        !formData.employeeId.trim() ||
        !formData.firstName.trim() ||
        !formData.username.trim() ||
        !formData.email.trim() ||
        !formData.phone.trim()
      ) {
        alert(
          "Please fill all required fields"
        );
        return;
      }

      if (
        (formData.password ||
          formData.confirmPassword) &&
        formData.password !==
          formData.confirmPassword
      ) {
        alert(
          "Password and Confirm Password do not match"
        );
        return;
      }

      try {
        setEditSaving(true);

        const data =
          new FormData();

        data.append(
          "Id",
          selectedEmployee.uuid
        );

        data.append(
          "EmployeeCode",
          formData.employeeId.trim()
        );

        data.append(
          "FirstName",
          formData.firstName.trim()
        );

        data.append(
          "LastName",
          formData.lastName.trim()
        );

        data.append(
          "UserName",
          formData.username.trim()
        );

        data.append(
          "Email",
          formData.email.trim()
        );

        data.append(
          "PhoneNumber",
          formData.phone.trim()
        );

        data.append(
          "Company",
          formData.company.trim()
        );

        data.append(
          "DepartmentId",
          formData.department || ""
        );

        data.append(
          "DesignationId",
          formData.designation || ""
        );

        data.append(
          "JoiningDate",
          formData.joiningDate
            ? new Date(
                `${formData.joiningDate}T00:00:00`
              ).toISOString()
            : ""
        );

        data.append(
          "About",
          formData.about.trim()
        );

        data.append(
          "Password",
          formData.password
        );

        data.append(
          "ConfirmPassword",
          formData.confirmPassword
        );

        data.append("Address", "");
        data.append("Country", "");
        data.append("State", "");
        data.append("City", "");
        data.append(
          "PostalCode",
          ""
        );

        if (
          selectedProfileFile
        ) {
          data.append(
            "ProfilePicture",
            selectedProfileFile
          );
        }

        const response =
          await updateEmployee(
            selectedEmployee.uuid,
            data
          );

        if (
          response?.isSuccess ===
            false ||
          response?.statusCode >= 400
        ) {
          alert(
            response?.message ||
              "Unable to update employee"
          );
          return;
        }

        alert(
          response?.message ||
            "Employee updated successfully"
        );

        setOpenEditModal(false);
        setSelectedEmployee(null);
        resetForm();

        await fetchEmployees();
      } catch (error: any) {
        console.error(
          "UPDATE EMPLOYEE ERROR:",
          error
        );

        alert(
          getErrorMessage(
            error,
            "Unable to update employee"
          )
        );
      } finally {
        setEditSaving(false);
      }
    };

  const handleDeleteClick = (
    employee: EmployeeData
  ) => {
    setSelectedEmployee(employee);
    setOpenDeleteModal(true);
  };

  const closeDeleteModal =
    () => {
      if (deleting) {
        return;
      }

      setOpenDeleteModal(false);
      setSelectedEmployee(null);
    };

  const handleConfirmDelete =
    async () => {
      if (!selectedEmployee) {
        return;
      }

      if (
        !selectedEmployee.uuid
      ) {
        alert(
          "Employee Id not found"
        );
        return;
      }

      try {
        setDeleting(true);

        const response =
          await deleteEmployee(
            selectedEmployee.uuid
          );

        if (
          response?.isSuccess ===
            false ||
          response?.statusCode >= 400
        ) {
          alert(
            response?.message ||
              "Unable to delete employee"
          );
          return;
        }

        alert(
          response?.message ||
            "Employee deleted successfully"
        );

        setOpenDeleteModal(false);
        setSelectedEmployee(null);

        await fetchEmployees();
      } catch (error: any) {
        console.error(
          "DELETE EMPLOYEE ERROR:",
          error
        );

        alert(
          getErrorMessage(
            error,
            "Unable to delete employee"
          )
        );
      } finally {
        setDeleting(false);
      }
    };

  const totalEmployees =
    totalRecords;

  const activeCount =
    employees.filter(
      (employee) =>
        employee.status === "Active"
    ).length;

  const inactiveCount =
    employees.filter(
      (employee) =>
        employee.status ===
        "Inactive"
    ).length;

  const newJoiners =
    employees.filter((employee) => {
      if (
        !employee.rawJoiningDate
      ) {
        return false;
      }

      const joined = new Date(
        employee.rawJoiningDate
      ).getTime();

      if (
        Number.isNaN(joined)
      ) {
        return false;
      }

      const thirtyDaysAgo =
        Date.now() -
        30 *
          24 *
          60 *
          60 *
          1000;

      return (
        joined >= thirtyDaysAgo
      );
    }).length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalRecords / rowsPerPage
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const fromEntry =
    totalRecords === 0
      ? 0
      : (safePage - 1) *
          rowsPerPage +
        1;

  const toEntry = Math.min(
    safePage * rowsPerPage,
    totalRecords
  );

  const renderEmployeeForm = (
    isEdit = false
  ) => (
    <>
      <div className="profile-upload-box full-width">
        <div className="profile-preview">
          {profilePreview ? (
            <img
              src={
                profilePreview
              }
              alt="Profile"
            />
          ) : (
            <FiImage size={24} />
          )}
        </div>

        <div>
          <h4>
            Upload Profile Image
          </h4>

          <p>
            Image should be below 4 mb
          </p>

          <div className="profile-upload-actions">
            <label className="upload-label">
              Upload

              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept="image/*"
                onChange={
                  handleImageUpload
                }
              />
            </label>

            <button
              type="button"
              className="mini-cancel"
              onClick={
                handleRemoveImage
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="employee-form-group">
        <label>
          First Name{" "}
          <span className="required-star">
            *
          </span>
        </label>

        <input
          name="firstName"
          value={
            formData.firstName
          }
          onChange={
            handleChange
          }
        />
      </div>

      <div className="employee-form-group">
        <label>
          Last Name
        </label>

        <input
          name="lastName"
          value={
            formData.lastName
          }
          onChange={
            handleChange
          }
        />
      </div>

      <div className="employee-form-group">
        <label>
          Employee ID{" "}
          <span className="required-star">
            *
          </span>
        </label>

        <input
          name="employeeId"
          value={
            formData.employeeId
          }
          onChange={
            handleChange
          }
        />
      </div>

      <div className="employee-form-group">
        <label>
          Joining Date{" "}
          {!isEdit && (
            <span className="required-star">
              *
            </span>
          )}
        </label>

        <input
          name="joiningDate"
          type="date"
          value={
            formData.joiningDate
          }
          onChange={
            handleChange
          }
        />
      </div>

      <div className="employee-form-group">
        <label>
          Username{" "}
          <span className="required-star">
            *
          </span>
        </label>

        <input
          name="username"
          value={
            formData.username
          }
          onChange={
            handleChange
          }
        />
      </div>

      <div className="employee-form-group">
        <label>
          Email{" "}
          <span className="required-star">
            *
          </span>
        </label>

        <input
          name="email"
          type="email"
          value={
            formData.email
          }
          onChange={
            handleChange
          }
        />
      </div>

      <div className="employee-form-group">
        <label>
          Password{" "}
          {!isEdit && (
            <span className="required-star">
              *
            </span>
          )}
        </label>

        <div className="password-input-wrap">
          <input
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={
              formData.password
            }
            onChange={
              handleChange
            }
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (prev) => !prev
              )
            }
          >
            {showPassword
              ? "Hide"
              : "Show"}
          </button>
        </div>
      </div>

      <div className="employee-form-group">
        <label>
          Confirm Password{" "}
          {!isEdit && (
            <span className="required-star">
              *
            </span>
          )}
        </label>

        <div className="password-input-wrap">
          <input
            name="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            value={
              formData.confirmPassword
            }
            onChange={
              handleChange
            }
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (prev) => !prev
              )
            }
          >
            {showConfirmPassword
              ? "Hide"
              : "Show"}
          </button>
        </div>
      </div>

      <div className="employee-form-group">
        <label>
          Phone Number{" "}
          <span className="required-star">
            *
          </span>
        </label>

        <input
          name="phone"
          value={
            formData.phone
          }
          onChange={
            handleChange
          }
        />
      </div>

      <div className="employee-form-group">
        <label>
          Company
        </label>

        <input
          name="company"
          value={
            formData.company
          }
          onChange={
            handleChange
          }
        />
      </div>

      <div className="employee-form-group">
        <label>
          Department{" "}
          {!isEdit && (
            <span className="required-star">
              *
            </span>
          )}
        </label>

        <select
          name="department"
          value={
            formData.department
          }
          onChange={
            handleChange
          }
          disabled={
            departmentLoading
          }
        >
          <option value="">
            {departmentLoading
              ? "Loading..."
              : "Select Department"}
          </option>

          {departments.map(
            (department) => (
              <option
                key={
                  department.id
                }
                value={
                  department.id
                }
              >
                {
                  department.name
                }
              </option>
            )
          )}
        </select>
      </div>

      <div className="employee-form-group">
        <label>
          Designation{" "}
          {!isEdit && (
            <span className="required-star">
              *
            </span>
          )}
        </label>

        <select
          name="designation"
          value={
            formData.designation
          }
          onChange={
            handleChange
          }
          disabled={
            !formData.department ||
            designationLoading
          }
        >
          <option value="">
            {!formData.department
              ? "Select Department First"
              : designationLoading
              ? "Loading Designations..."
              : designations.length ===
                0
              ? "No Designation Found"
              : "Select Designation"}
          </option>

          {designations.map(
            (designation) => (
              <option
                key={
                  designation.id
                }
                value={
                  designation.id
                }
              >
                {
                  designation.name
                }
              </option>
            )
          )}
        </select>
      </div>

      <div className="employee-form-group full-width">
        <label>
          About
        </label>

        <textarea
          name="about"
          rows={4}
          value={
            formData.about
          }
          onChange={
            handleChange
          }
        />
      </div>
    </>
  );

  return (
    <div className="employee-page">
      <div className="employee-header">
        <div>
          <h1>
            Employee
          </h1>

          <div className="employee-breadcrumb">
            <Link
              to="/Hr/HrDashboard"
              aria-label="Dashboard"
            >
              <FiHome />
            </Link>

            <span>/</span>

            <span>
              Employees
            </span>
          </div>
        </div>

        {/* <button
          type="button"
          className="add-employee-btn"
          onClick={
            openAddEmployeeModal
          }
        >
          <span className="plus-circle">
            +
          </span>

          Add Employee
        </button> */}
      </div>

      <div className="employee-stat-grid">
        <div className="employee-stat-card">
          <div className="stat-left">
            <div className="stat-icon stat-icon-black">
              <FiUsers />
            </div>

            <div className="stat-text">
              <span>
                Total Employees
              </span>

              <strong>
                {totalEmployees}
              </strong>
            </div>
          </div>

          <span className="percentage percentage-purple">
            ↗ +19.01%
          </span>
        </div>

        <div className="employee-stat-card">
          <div className="stat-left">
            <div className="stat-icon stat-icon-green">
              <FiUserCheck />
            </div>

            <div className="stat-text">
              <span>
                Active
              </span>

              <strong>
                {activeCount}
              </strong>
            </div>
          </div>

          <span className="percentage percentage-orange">
            ↗ +19.01%
          </span>
        </div>

        <div className="employee-stat-card">
          <div className="stat-left">
            <div className="stat-icon stat-icon-red">
              <FiUserX />
            </div>

            <div className="stat-text">
              <span>
                InActive
              </span>

              <strong>
                {inactiveCount}
              </strong>
            </div>
          </div>

          <span className="percentage percentage-gray">
            ↗ +19.01%
          </span>
        </div>

        <div className="employee-stat-card">
          <div className="stat-left">
            <div className="stat-icon stat-icon-blue">
              <FiUserPlus />
            </div>

            <div className="stat-text">
              <span>
                New Joiners
              </span>

              <strong>
                {newJoiners}
              </strong>
            </div>
          </div>

          <span className="percentage percentage-blue">
            ↗ +19.01%
          </span>
        </div>
      </div>

      <div className="employee-table-card">
        <div className="employee-table-top">
          <h3>
            Employee
          </h3>

          <div className="employee-filter-row">
            <div className="custom-select-box date-select-box">
              <select
                value={
                  dateRange
                }
                onChange={(e) =>
                  setDateRange(
                    e.target.value
                  )
                }
              >
                <option value="7">
                  {dateRange === "7"
                    ? getDateRangeLabel()
                    : "Last 7 Days"}
                </option>

                <option value="30">
                  Last 30 Days
                </option>

                <option value="today">
                  Today
                </option>

                <option value="all">
                  All Dates
                </option>
              </select>

              <FiChevronDown />
            </div>

            <div className="custom-select-box">
              <select
                value={
                  designationFilter
                }
                onChange={(e) =>
                  setDesignationFilter(
                    e.target.value
                  )
                }
                disabled={
                  filterDesignationLoading
                }
              >
                <option value="">
                  {filterDesignationLoading
                    ? "Loading..."
                    : "Designation"}
                </option>

                {filterDesignations.map(
                  (designation) => (
                    <option
                      key={
                        designation.id
                      }
                      value={
                        designation.id
                      }
                    >
                      {
                        designation.name
                      }
                    </option>
                  )
                )}
              </select>

              <FiChevronDown />
            </div>

            <div className="custom-select-box status-filter-box">
              <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>

              <FiChevronDown />
            </div>

            <div className="custom-select-box sort-filter-box">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
              >
                <option value="new">
                  Sort By : Newest
                </option>

                <option value="old">
                  Sort By : Oldest
                </option>

                <option value="7">
                  Sort By : Last 7 Days
                </option>

                <option value="30">
                  Sort By : Last 30 Days
                </option>
              </select>

              <FiChevronDown />
            </div>
          </div>
        </div>

        <div className="employee-table-toolbar">
          <div className="rows-control">
            <span>
              Row Per Page
            </span>

            <div className="small-select">
              <select
                value={
                  rowsPerPage
                }
                onChange={(e) =>
                  setRowsPerPage(
                    Number(
                      e.target.value
                    )
                  )
                }
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

                <option value={40}>
                  40
                </option>
              </select>

              <FiChevronDown />
            </div>

            <span>
              Entries
            </span>
          </div>

          <input
            className="employee-search"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="employee-table-responsive">
          <table className="employee-table">
            <thead>
              <tr>
                <th className="check-column">
                  <input type="checkbox" />
                </th>

                <th>
                  <span className="sortable-heading">
                    Emp ID{" "}
                    <span>↕</span>
                  </span>
                </th>

                <th>
                  <span className="sortable-heading">
                    Name{" "}
                    <span>↕</span>
                  </span>
                </th>

                <th>
                  <span className="sortable-heading">
                    Email{" "}
                    <span>↕</span>
                  </span>
                </th>

                <th>
                  <span className="sortable-heading">
                    Phone{" "}
                    <span>↕</span>
                  </span>
                </th>

                <th>
                  <span className="sortable-heading">
                    Designation{" "}
                    <span>↕</span>
                  </span>
                </th>

                <th>
                  <span className="sortable-heading">
                    Joining Date{" "}
                    <span>↕</span>
                  </span>
                </th>

                <th>
                  Status
                </th>

                <th className="action-column"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="empty-row"
                  >
                    Loading employee...
                  </td>
                </tr>
              ) : employees.length >
                0 ? (
                employees.map(
                  (emp) => (
                    <tr
                      key={
                        emp.uuid ||
                        emp.id
                      }
                    >
                      <td className="check-column">
                        <input type="checkbox" />
                      </td>

                     <td className="employee-id">
  <Link
    to={`/Admin/EmployeeDetails/${encodeURIComponent(emp.id)}`}
    state={{
      employee: emp,
    }}
    style={{ fontSize: "15px" }}
  >
    {emp.id}
  </Link>
</td>

                      <td>
                        <div className="employee-name-cell">
                          <div className="employee-avatar">
                            {emp.image ? (
                              <img
                                src={
                                  emp.image
                                }
                                alt={
                                  emp.name
                                }
                                className="employee-avatar-image"
                              />
                            ) : (
                              <FiUser />
                            )}
                          </div>

                          <div>
                            <p>
                              {
                                emp.name
                              }
                            </p>

                            <span>
                              {
                                emp.des
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="muted-cell">
                        {emp.email}
                      </td>

                      <td className="muted-cell">
                        {emp.phone}
                      </td>

                      <td>
                        <span className="table-designation-text">
                          {emp.des || "-"}
                        </span>
                      </td>

                      <td className="muted-cell">
                        {emp.date}
                      </td>

                      <td>
                       <span
  className={`status-badge ${
    emp.status === "Active"
      ? "active"
      : "inactive"
  }`}
>
  <span className="status-dot"></span>
  {emp.status}
</span>
                      </td>

                      <td className="action-column">
                        <button
                          type="button"
                          className="row-action-btn"
                          title="Edit"
                          onClick={() =>
                            handleEditClick(
                              emp
                            )
                          }
                        >
                          <FiEdit2 />
                        </button>

                        <button
                          type="button"
                          className="row-action-btn danger"
                          title="Delete"
                          onClick={() =>
                            handleDeleteClick(
                              emp
                            )
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="empty-row"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="employee-table-footer">
          <p>
            Showing {fromEntry} -{" "}
            {toEntry} of{" "}
            {totalRecords} entries
          </p>

          <div className="employee-pagination">
            <button
              type="button"
              disabled={
                safePage <= 1 ||
                loading
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
            >
              <FiChevronLeft />
            </button>

            <button
              type="button"
              className="pagination-active"
            >
              {safePage}
            </button>

            <button
              type="button"
              disabled={
                safePage >=
                  totalPages ||
                loading
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </div>

      {openModal && (
        <div className="employee-modal-overlay">
          <div className="employee-modal employee-modal-large">
            <div className="employee-modal-header">
              <h2>
                Add New Employee
              </h2>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeAddModal
                }
                disabled={saving}
              >
                <FiX />
              </button>
            </div>

            <div className="employee-modal-body full-form-grid">
              {
                renderEmployeeForm(
                  false
                )
              }
            </div>

            <div className="employee-modal-footer">
              <button
                type="button"
                className="employee-cancel-btn"
                onClick={
                  closeAddModal
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="employee-save-btn"
                onClick={
                  handleAddEmployee
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openEditModal && (
        <div className="employee-modal-overlay">
          <div className="employee-modal employee-modal-large">
            <div className="employee-modal-header">
              <h2>
                Edit Employee
              </h2>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeEditModal
                }
                disabled={
                  editSaving
                }
              >
                <FiX />
              </button>
            </div>

            <div className="employee-modal-body full-form-grid">
              {
                renderEmployeeForm(
                  true
                )
              }
            </div>

            <div className="employee-modal-footer">
              <button
                type="button"
                className="employee-cancel-btn"
                onClick={
                  closeEditModal
                }
                disabled={
                  editSaving
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="employee-save-btn"
                onClick={
                  handleEditSave
                }
                disabled={
                  editSaving
                }
              >
                {editSaving
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openDeleteModal && (
        <div className="employee-modal-overlay">
          <div className="employee-confirm-modal">
            <div className="delete-icon">
              <FiTrash2 />
            </div>

            <h3>
              Confirm Delete
            </h3>

            <p>
              You want to delete all
              the marked items, this
              can't be undone once
              you delete.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="employee-cancel-btn"
                onClick={
                  closeDeleteModal
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="employee-delete-btn"
                onClick={
                  handleConfirmDelete
                }
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;
