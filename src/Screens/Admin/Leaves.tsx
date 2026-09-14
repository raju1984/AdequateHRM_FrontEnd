import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  MessageSquareMore,
  Pencil,
  Trash2,
  Info,
  UserRoundCheck,
  Send,
} from "lucide-react";

import type {
  AddLeavePayload,
  UpdateLeavePayload,
} from "../../services/adminservices";

import {
  addLeave,
  deleteLeave,
  getAllEmployees,
  getAllLeave,
  getAllLeaveTypes,
  getLeaveById,
  updateLeave,
  updateLeaveStatus,

  // LEAVE CHAT APIs
  getLeaveChat,
  sendLeaveChatMessage,
  deleteLeaveChatMessage,
} from "../../services/adminservices";

type LeaveStatus =
  | "Approved"
  | "Declined"
  | "New";

type LeaveTypeOption =
  | "Full Day"
  | "First Half"
  | "Second Half";

interface EmployeeOption {
  id: string;
  name: string;
  role: string;
}

interface LeaveTypeOptionItem {
  id: string;
  name: string;
  days?: number;
}

interface LeaveItem {
  id: string;
  userId: string;
  name: string;
  role: string;
  leaveTypeMasterId: string;
  type: string;
  from: string;
  to: string;
  days: string;
  status: LeaveStatus;
  statusValue: number;
  leaveType: LeaveTypeOption;
  availType: number;
  reason: string;
  attachment: string;
  reviewedByUserId?: string;
  remarks?: string;
}

interface LeaveForm {
  employeeId: string;
  leaveReasonId: string;
  from: string;
  to: string;
  leaveType: LeaveTypeOption | "";
  noOfDays: string;
  reason: string;
}

/* =========================================================
   CHAT TYPES
========================================================= */

interface LeaveChatMessage {
  id: string;
  leaveId: string;
  userId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  profilePicture: string;
  raw: any;
}

const AVAIL_TYPE_MAP: Record<
  LeaveTypeOption,
  number
> = {
  "Full Day": 1,
  "First Half": 2,
  "Second Half": 3,
};

const STATUS_MAP: Record<
  LeaveStatus,
  number
> = {
  New: 0,
  Approved: 1,
  Declined: 2,
};

const STATUS_LABEL: Record<
  number,
  LeaveStatus
> = {
  0: "New",
  1: "Approved",
  2: "Declined",
};

const emptyForm: LeaveForm = {
  employeeId: "",
  leaveReasonId: "",
  from: "",
  to: "",
  leaveType: "",
  noOfDays: "",
  reason: "",
};

/* =========================================================
   CURRENT USER
========================================================= */

const getCurrentUserId = (): string => {
  const keys = [
    "userId",
    "UserId",
    "userID",
    "UserID",
    "id",
    "Id",
  ];

  for (const key of keys) {
    const value =
      localStorage.getItem(key);

    if (value?.trim()) {
      return value.trim();
    }
  }

  return "";
};

/* =========================================================
   RESPONSE HELPERS
========================================================= */

const unwrapObject = (
  value: any
): any => {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return value;
  }

  if (value.data !== undefined) {
    return unwrapObject(value.data);
  }

  if (value.result !== undefined) {
    return unwrapObject(value.result);
  }

  if (
    value.response !== undefined
  ) {
    return unwrapObject(
      value.response
    );
  }

  return value;
};

const firstValue = <T = any>(
  obj:
    | Record<string, any>
    | null
    | undefined,
  keys: string[],
  fallback?: T
): T => {
  if (
    !obj ||
    typeof obj !== "object"
  ) {
    return fallback as T;
  }

  for (const key of keys) {
    const value = obj[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value as T;
    }
  }

  return fallback as T;
};

const findArray = (
  value: any,
  requiredKeys: string[],
  depth = 0
): any[] => {
  if (!value || depth > 8) {
    return [];
  }

  if (Array.isArray(value)) {
    const matching = value.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        requiredKeys.some((key) =>
          Object.prototype.hasOwnProperty.call(
            item,
            key
          )
        )
    );

    if (matching.length) {
      return value;
    }

    for (const item of value) {
      const found = findArray(
        item,
        requiredKeys,
        depth + 1
      );

      if (found.length) {
        return found;
      }
    }

    return [];
  }

  if (typeof value === "object") {
    for (const key of Object.keys(
      value
    )) {
      const found = findArray(
        value[key],
        requiredKeys,
        depth + 1
      );

      if (found.length) {
        return found;
      }
    }
  }

  return [];
};

/* =========================================================
   CHAT RESPONSE HELPERS
========================================================= */

const extractChatMessages = (
  response: any
): any[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  const directKeys = [
    "data",
    "Data",
    "items",
    "Items",
    "result",
    "Result",
    "records",
    "Records",
    "messages",
    "Messages",
    "chat",
    "Chat",
  ];

  for (const key of directKeys) {
    const value =
      response?.[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  for (const key of directKeys) {
    const value =
      response?.[key];

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const nested =
        extractChatMessages(
          value
        );

      if (nested.length) {
        return nested;
      }
    }
  }

  return findArray(
    response,
    [
      "message",
      "Message",
      "messageId",
      "MessageId",
      "senderId",
      "SenderId",
      "createdAt",
      "CreatedAt",
    ]
  );
};

const getChatMessageId = (
  item: any
): string => {
  return String(
    firstValue(
      item,
      [
        "id",
        "Id",
        "messageId",
        "MessageId",
        "chatMessageId",
        "ChatMessageId",
      ],
      ""
    )
  );
};

const getChatMessageText = (
  item: any
): string => {
  return String(
    firstValue(
      item,
      [
        "message",
        "Message",
        "text",
        "Text",
        "content",
        "Content",
        "messageText",
        "MessageText",
      ],
      ""
    )
  );
};

const getChatSenderId = (
  item: any
): string => {
  return String(
    firstValue(
      item,
      [
        "senderId",
        "SenderId",
        "userId",
        "UserId",
        "createdBy",
        "CreatedBy",
        "createdByUserId",
        "CreatedByUserId",
      ],
      ""
    )
  );
};

const getChatSenderName = (
  item: any
): string => {
  return String(
    firstValue(
      item,
      [
        "senderName",
        "SenderName",
        "userName",
        "UserName",
        "name",
        "Name",
        "createdByName",
        "CreatedByName",
      ],
      "User"
    )
  );
};

const getChatDate = (
  item: any
): string => {
  return String(
    firstValue(
      item,
      [
        "createdAt",
        "CreatedAt",
        "createdDate",
        "CreatedDate",
        "sentAt",
        "SentAt",
        "date",
        "Date",
        "timestamp",
        "Timestamp",
      ],
      ""
    )
  );
};

const normalizeChatMessage = (
  item: any
): LeaveChatMessage => {
  return {
    id: getChatMessageId(item),

    leaveId: String(
      firstValue(
        item,
        [
          "leaveId",
          "LeaveId",
        ],
        ""
      )
    ),

    userId: String(
      firstValue(
        item,
        [
          "userId",
          "UserId",
        ],
        ""
      )
    ),

    senderId:
      getChatSenderId(item),

    senderName:
      getChatSenderName(item),

    message:
      getChatMessageText(item),

    createdAt:
      getChatDate(item),

    profilePicture: String(
      firstValue(
        item,
        [
          "profilePicture",
          "ProfilePicture",
          "profileImage",
          "ProfileImage",
          "image",
          "Image",
        ],
        ""
      )
    ),

    raw: item,
  };
};

const formatChatTime = (
  value: string
): string => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/* =========================================================
   EMPLOYEE HELPERS
========================================================= */

const getEmployeeId = (
  item: any
): string =>
  String(
    firstValue(
      item,
      [
        "userId",
        "UserId",
        "id",
        "Id",
        "employeeId",
        "EmployeeId",
      ],
      ""
    )
  );

const getEmployeeName = (
  item: any
): string => {
  const direct = firstValue(
    item,
    [
      "name",
      "Name",
      "fullName",
      "FullName",
      "employeeName",
      "EmployeeName",
      "userName",
      "UserName",
    ],
    ""
  );

  if (direct) {
    return String(direct);
  }

  const firstName =
    firstValue(
      item,
      [
        "firstName",
        "FirstName",
      ],
      ""
    );

  const lastName =
    firstValue(
      item,
      [
        "lastName",
        "LastName",
      ],
      ""
    );

  return (
    `${firstName} ${lastName}`.trim() ||
    "Employee"
  );
};

const getRole = (
  item: any
): string =>
  String(
    firstValue(
      item,
      [
        "roleName",
        "RoleName",
        "role",
        "Role",
        "designationName",
        "DesignationName",
      ],
      "Employee"
    )
  );

/* =========================================================
   LEAVE TYPE HELPERS
========================================================= */

const getLeaveTypeId = (
  item: any
): string =>
  String(
    firstValue(
      item,
      [
        "id",
        "Id",
        "leaveTypeMasterId",
        "LeaveTypeMasterId",
      ],
      ""
    )
  );

const getLeaveTypeName = (
  item: any
): string =>
  String(
    firstValue(
      item,
      [
        "leaveName",
        "LeaveName",
        "name",
        "Name",
        "leaveTypeName",
        "LeaveTypeName",
        "type",
        "Type",
      ],
      "Leave"
    )
  );

/* =========================================================
   STATUS HELPERS
========================================================= */

const parseStatus = (
  value: any
): number => {
  if (typeof value === "number") {
    return value;
  }

  const normalized = String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

  if (
    normalized === "approved"
  ) {
    return 1;
  }

  if (
    normalized === "declined" ||
    normalized === "rejected"
  ) {
    return 2;
  }

  const numeric = Number(value);

  return Number.isFinite(numeric)
    ? numeric
    : 0;
};

/* =========================================================
   AVAIL TYPE HELPERS
========================================================= */

const parseAvailType = (
  value: any
): number => {
  if (typeof value === "number") {
    return value;
  }

  const numeric = Number(value);

  if (
    Number.isFinite(numeric) &&
    numeric >= 1 &&
    numeric <= 3
  ) {
    return numeric;
  }

  const normalized = String(
    value ?? ""
  )
    .trim()
    .toLowerCase();

  if (
    normalized.includes("first")
  ) {
    return 2;
  }

  if (
    normalized.includes("second")
  ) {
    return 3;
  }

  return 1;
};

const availTypeToLabel = (
  value: any
): LeaveTypeOption => {
  const numeric =
    parseAvailType(value);

  if (numeric === 2) {
    return "First Half";
  }

  if (numeric === 3) {
    return "Second Half";
  }

  return "Full Day";
};

const statusToLabel = (
  value: any
): LeaveStatus => {
  const numeric =
    parseStatus(value);

  return (
    STATUS_LABEL[numeric] ||
    "New"
  );
};

/* =========================================================
   DATE HELPERS
========================================================= */

const toInputDate = (
  value: any
): string => {
  if (!value) {
    return "";
  }

  const text = String(value);

  const match = text.match(
    /^\d{4}-\d{2}-\d{2}/
  );

  if (match) {
    return match[0];
  }

  const date = new Date(text);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
};

const formatApiDate = (
  value: string
): string => {
  if (!value) {
    return "";
  }

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      value
    )
  ) {
    return value;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
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

const formatDisplayDate = (
  value: any
): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
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

const calculateDays = (
  from: string,
  to: string,
  availType:
    | LeaveTypeOption
    | ""
): string => {
  if (!from || !to) {
    return "";
  }

  const start = new Date(
    `${from}T00:00:00`
  );

  const end = new Date(
    `${to}T00:00:00`
  );

  if (
    Number.isNaN(
      start.getTime()
    ) ||
    Number.isNaN(
      end.getTime()
    ) ||
    end < start
  ) {
    return "";
  }

  const difference =
    Math.floor(
      (end.getTime() -
        start.getTime()) /
        (1000 *
          60 *
          60 *
          24)
    ) + 1;

  if (
    availType ===
      "First Half" ||
    availType ===
      "Second Half"
  ) {
    return difference === 1
      ? "0.5"
      : String(
          Math.max(
            0.5,
            difference - 0.5
          )
        );
  }

  return String(difference);
};

const getDaysLabel = (
  value: any
): string => {
  const number = Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return "-";
  }

  return `${number} ${
    number === 1
      ? "Day"
      : "Days"
  }`;
};

/* =========================================================
   NORMALIZE LEAVE
========================================================= */

const normalizeLeave = (
  raw: any,
  employees: EmployeeOption[],
  leaveTypes: LeaveTypeOptionItem[]
): LeaveItem => {
  const item =
    unwrapObject(raw) || {};

  const id = String(
    firstValue(
      item,
      [
        "id",
        "Id",
        "leaveId",
        "LeaveId",
      ],
      ""
    )
  );

  const userId = String(
    firstValue(
      item,
      [
        "userId",
        "UserId",
        "employeeId",
        "EmployeeId",
      ],
      ""
    )
  );

  const employeeObject =
    item.employee ||
    item.Employee ||
    item.user ||
    item.User ||
    {};

  const resolvedUserId =
    userId ||
    String(
      firstValue(
        employeeObject,
        [
          "id",
          "Id",
          "userId",
          "UserId",
        ],
        ""
      )
    );

  const employee =
    employees.find(
      (entry) =>
        entry.id.toLowerCase() ===
        resolvedUserId.toLowerCase()
    );

  const name = String(
    firstValue(
      item,
      [
        "employeeName",
        "EmployeeName",
        "userName",
        "UserName",
        "name",
        "Name",
      ],
      employee?.name ||
        getEmployeeName(
          employeeObject
        )
    )
  );

  const role = String(
    firstValue(
      item,
      [
        "roleName",
        "RoleName",
        "role",
        "Role",
        "designationName",
        "DesignationName",
      ],
      employee?.role ||
        "Employee"
    )
  );

  const leaveTypeMasterId =
    String(
      firstValue(
        item,
        [
          "leaveTypeMasterId",
          "LeaveTypeMasterId",
          "leaveTypeId",
          "LeaveTypeId",
        ],
        ""
      )
    );

  const leaveTypeObject =
    item.leaveTypeMaster ||
    item.LeaveTypeMaster ||
    item.leaveType ||
    item.LeaveType ||
    {};

  const type = String(
    firstValue(
      item,
      [
        "leaveTypeName",
        "LeaveTypeName",
        "leaveName",
        "LeaveName",
        "type",
        "Type",
      ],
      leaveTypes.find(
        (entry) =>
          entry.id.toLowerCase() ===
          leaveTypeMasterId.toLowerCase()
      )?.name ||
        getLeaveTypeName(
          leaveTypeObject
        )
    )
  );

  const fromValue =
    firstValue(
      item,
      [
        "fromDate",
        "FromDate",
        "from",
        "From",
      ],
      ""
    );

  const toValue =
    firstValue(
      item,
      [
        "toDate",
        "ToDate",
        "to",
        "To",
      ],
      ""
    );

  const availType =
    parseAvailType(
      firstValue(
        item,
        [
          "availType",
          "AvailType",
          "leaveType",
          "LeaveType",
        ],
        1
      )
    );

  const statusValue =
    parseStatus(
      firstValue(
        item,
        [
          "status",
          "Status",
          "leaveStatus",
          "LeaveStatus",
        ],
        0
      )
    );

  const noOfDays =
    firstValue(
      item,
      [
        "noOfDays",
        "NoOfDays",
        "numberOfDays",
        "NumberOfDays",
        "days",
        "Days",
      ],
      undefined
    );

  const calculatedDays =
    calculateDays(
      toInputDate(fromValue),
      toInputDate(toValue),
      availTypeToLabel(
        availType
      )
    );

  const daysNumber =
    noOfDays !== undefined &&
    noOfDays !== null &&
    noOfDays !== ""
      ? noOfDays
      : calculatedDays;

  return {
    id,
    userId: resolvedUserId,

    name:
      name ||
      employee?.name ||
      "Employee",

    role:
      role ||
      employee?.role ||
      "Employee",

    leaveTypeMasterId,

    type,

    from:
      formatDisplayDate(
        fromValue
      ),

    to:
      formatDisplayDate(
        toValue
      ),

    days:
      getDaysLabel(
        daysNumber
      ),

    status:
      statusToLabel(
        statusValue
      ),

    statusValue,

    leaveType:
      availTypeToLabel(
        availType
      ),

    availType,

    reason: String(
      firstValue(
        item,
        [
          "reason",
          "Reason",
        ],
        ""
      )
    ),

    attachment: String(
      firstValue(
        item,
        [
          "attachment",
          "Attachment",
        ],
        ""
      )
    ),

    reviewedByUserId:
      String(
        firstValue(
          item,
          [
            "reviewedByUserId",
            "ReviewedByUserId",
          ],
          ""
        )
      ),

    remarks: String(
      firstValue(
        item,
        [
          "remarks",
          "Remarks",
        ],
        ""
      )
    ),
  };
};

/* =========================================================
   SINGLE LEAVE RESPONSE
========================================================= */

const extractSingleLeave = (
  response: any,
  employees: EmployeeOption[],
  leaveTypes: LeaveTypeOptionItem[]
): LeaveItem | null => {
  const unwrapped =
    unwrapObject(response);

  if (
    Array.isArray(unwrapped)
  ) {
    return unwrapped[0]
      ? normalizeLeave(
          unwrapped[0],
          employees,
          leaveTypes
        )
      : null;
  }

  if (
    unwrapped?.data &&
    !Array.isArray(
      unwrapped.data
    )
  ) {
    return normalizeLeave(
      unwrapped.data,
      employees,
      leaveTypes
    );
  }

  return unwrapped &&
    typeof unwrapped ===
      "object"
    ? normalizeLeave(
        unwrapped,
        employees,
        leaveTypes
      )
    : null;
};

/* =========================================================
   COMPONENT
========================================================= */

const Leaves = () => {
  const [leaveData, setLeaveData] =
    useState<LeaveItem[]>([]);

  const [employees, setEmployees] =
    useState<EmployeeOption[]>(
      []
    );

  const [leaveTypes, setLeaveTypes] =
    useState<
      LeaveTypeOptionItem[]
    >([]);

  const [selected, setSelected] =
    useState<string[]>([]);

  const [
    rowsPerPage,
    setRowsPerPage,
  ] = useState(10);

  const [search, setSearch] =
    useState("");

  const [
    leaveTypeFilter,
    setLeaveTypeFilter,
  ] = useState("");

  const [sortBy, setSortBy] =
    useState("Last 7 Days");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [addOpen, setAddOpen] =
    useState(false);

  const [viewOpen, setViewOpen] =
    useState(false);

  const [chatOpen, setChatOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    activeLeave,
    setActiveLeave,
  ] =
    useState<LeaveItem | null>(
      null
    );

  const [
    deleteId,
    setDeleteId,
  ] = useState<string | null>(
    null
  );

  const [form, setForm] =
    useState<LeaveForm>(
      emptyForm
    );

  const [chatText, setChatText] =
    useState("");

  /* =====================================================
     CHAT STATE
  ===================================================== */

  const [
    chatMessages,
    setChatMessages,
  ] = useState<
    LeaveChatMessage[]
  >([]);

  const [
    chatLoading,
    setChatLoading,
  ] = useState(false);

  const [
    chatSending,
    setChatSending,
  ] = useState(false);

  const [
    chatDeletingId,
    setChatDeletingId,
  ] = useState<string | null>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD EMPLOYEES
  ===================================================== */

  const loadEmployees =
    async () => {
      try {
        const response =
          await getAllEmployees({
            PageNumber: 1,
            PageSize: 1000,
          });

        const list = findArray(
          response,
          [
            "id",
            "Id",
            "userId",
            "UserId",
          ]
        );

        const mapped = list
          .map((item: any) => {
            const id =
              getEmployeeId(item);

            if (!id) {
              return null;
            }

            return {
              id,
              name:
                getEmployeeName(
                  item
                ),
              role:
                getRole(item),
            };
          })
          .filter(
            Boolean
          ) as EmployeeOption[];

        setEmployees(mapped);

        return mapped;
      } catch (err) {
        console.error(
          "LOAD EMPLOYEES ERROR:",
          err
        );

        return [];
      }
    };

  /* =====================================================
     LOAD LEAVE TYPES
  ===================================================== */

  const loadLeaveTypes =
    async () => {
      try {
        const response =
          await getAllLeaveTypes({
            PageNumber: 1,
            PageSize: 1000,
          });

        const list = findArray(
          response,
          [
            "leaveName",
            "LeaveName",
            "leaveDays",
          ]
        );

        const mapped = list
          .map((item: any) => {
            const id =
              getLeaveTypeId(
                item
              );

            if (!id) {
              return null;
            }

            return {
              id,
              name:
                getLeaveTypeName(
                  item
                ),
              days: Number(
                firstValue(
                  item,
                  [
                    "leaveDays",
                    "LeaveDays",
                  ],
                  0
                )
              ),
            };
          })
          .filter(
            Boolean
          ) as LeaveTypeOptionItem[];

        setLeaveTypes(mapped);

        return mapped;
      } catch (err) {
        console.error(
          "LOAD LEAVE TYPES ERROR:",
          err
        );

        return [];
      }
    };

  /* =====================================================
     LOAD LEAVES
  ===================================================== */

  const loadLeaves = async (
    currentEmployees = employees,
    currentLeaveTypes = leaveTypes
  ) => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getAllLeave({
          PageNumber: 1,
          PageSize: 1000,
        });

      const list = findArray(
        response,
        [
          "leaveTypeMasterId",
          "LeaveTypeMasterId",
        ]
      );

      const unwrapped =
        unwrapObject(response);

      const source = list.length
        ? list
        : Array.isArray(
              unwrapped
            )
          ? unwrapped
          : [];

      const mapped = source
        .map((item: any) =>
          normalizeLeave(
            item,
            currentEmployees,
            currentLeaveTypes
          )
        )
        .filter(
          (
            item: LeaveItem
          ) => Boolean(item.id)
        );

      setLeaveData(mapped);
    } catch (err: any) {
      console.error(
        "LOAD LEAVES ERROR:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Unable to load leave records."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     REFRESH
  ===================================================== */

  const refreshAll =
    async () => {
      setLoading(true);

      const [
        loadedEmployees,
        loadedLeaveTypes,
      ] = await Promise.all([
        loadEmployees(),
        loadLeaveTypes(),
      ]);

      await loadLeaves(
        loadedEmployees,
        loadedLeaveTypes
      );
    };

  useEffect(() => {
    refreshAll();
  }, []);

  /* =====================================================
     AUTO CALCULATE DAYS
  ===================================================== */

  useEffect(() => {
    const calculated =
      calculateDays(
        form.from,
        form.to,
        form.leaveType
      );

    if (
      calculated &&
      calculated !==
        form.noOfDays
    ) {
      setForm((prev) => ({
        ...prev,
        noOfDays:
          calculated,
      }));
    }
  }, [
    form.from,
    form.to,
    form.leaveType,
  ]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredData =
    useMemo(() => {
      let result = [
        ...leaveData,
      ];

      if (search.trim()) {
        const q =
          search
            .toLowerCase()
            .trim();

        result =
          result.filter(
            (item) =>
              item.name
                .toLowerCase()
                .includes(q) ||
              item.role
                .toLowerCase()
                .includes(q) ||
              item.type
                .toLowerCase()
                .includes(q) ||
              item.status
                .toLowerCase()
                .includes(q)
          );
      }

      if (leaveTypeFilter) {
        result =
          result.filter(
            (item) =>
              item.type ===
              leaveTypeFilter
          );
      }

      if (
        sortBy ===
        "Ascending"
      ) {
        result.sort((a, b) =>
          a.name.localeCompare(
            b.name
          )
        );
      }

      if (
        sortBy ===
        "Descending"
      ) {
        result.sort((a, b) =>
          b.name.localeCompare(
            a.name
          )
        );
      }

      return result;
    }, [
      leaveData,
      search,
      leaveTypeFilter,
      sortBy,
    ]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredData.length /
          rowsPerPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const visibleData =
    filteredData.slice(
      (safeCurrentPage - 1) *
        rowsPerPage,
      safeCurrentPage *
        rowsPerPage
    );

  const allVisibleSelected =
    visibleData.length > 0 &&
    visibleData.every((item) =>
      selected.includes(item.id)
    );

  /* =====================================================
     SELECT
  ===================================================== */

  const handleSelectAll =
    () => {
      const ids =
        visibleData.map(
          (item) => item.id
        );

      if (allVisibleSelected) {
        setSelected((prev) =>
          prev.filter(
            (id) =>
              !ids.includes(id)
          )
        );
      } else {
        setSelected((prev) => [
          ...new Set([
            ...prev,
            ...ids,
          ]),
        ]);
      }
    };

  const toggleSelect = (
    id: string
  ) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter(
            (x) => x !== id
          )
        : [...prev, id]
    );
  };

  /* =====================================================
     STATUS COLOR
  ===================================================== */

  const getStatusColor = (
    status: LeaveStatus
  ) => {
    if (
      status === "Approved"
    ) {
      return "#25c875";
    }

    if (
      status === "Declined"
    ) {
      return "#ff5b5b";
    }

    return "#c65ad9";
  };

  /* =====================================================
     ADD
  ===================================================== */

  const openAddModal = () => {
    setError("");

    setForm({
      ...emptyForm,
    });

    setAddOpen(true);
  };

  /* =====================================================
     VIEW
  ===================================================== */

  const openViewModal =
    async (
      item: LeaveItem
    ) => {
      setError("");
      setActiveLeave(item);
      setViewOpen(true);

      try {
        const response =
          await getLeaveById(
            item.id
          );

        const fresh =
          extractSingleLeave(
            response,
            employees,
            leaveTypes
          );

        if (fresh) {
          setActiveLeave(
            fresh
          );
        }
      } catch (err: any) {
        console.error(
          "GET LEAVE BY ID ERROR:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Unable to load leave details."
        );
      }
    };

  /* =====================================================
     CHAT - LOAD MESSAGES
  ===================================================== */

  const loadChatMessages =
    async (
      leaveId: string
    ) => {
      if (!leaveId?.trim()) {
        console.error(
          "LEAVE CHAT: Leave ID missing"
        );
        return;
      }

      setChatLoading(true);

      try {
        console.log(
          "GET LEAVE CHAT ID:",
          leaveId
        );

        const response =
          await getLeaveChat(
            leaveId
          );

        console.log(
          "GET LEAVE CHAT RESPONSE:",
          response
        );

        const rawMessages =
          extractChatMessages(
            response
          );

        console.log(
          "EXTRACTED CHAT MESSAGES:",
          rawMessages
        );

        const normalized =
          rawMessages
            .map(
              (
                item: any
              ) =>
                normalizeChatMessage(
                  item
                )
            )
            .filter(
              (
                item
              ) =>
                Boolean(
                  item.message
                )
            );

        setChatMessages(
          normalized
        );
      } catch (err: any) {
        console.error(
          "LOAD LEAVE CHAT ERROR:",
          err
        );

        setChatMessages([]);

        setError(
          err?.message ||
            err?.response?.data
              ?.message ||
            "Unable to load chat messages."
        );
      } finally {
        setChatLoading(false);
      }
    };

  /* =====================================================
     CHAT - OPEN
  ===================================================== */

  const openChatModal =
    async (
      item: LeaveItem
    ) => {
      if (!item.id) {
        setError(
          "Leave ID not found. Cannot open chat."
        );
        return;
      }

      console.log(
        "OPEN CHAT FOR LEAVE ID:",
        item.id
      );

      setError("");
      setActiveLeave(item);
      setChatText("");
      setChatMessages([]);
      setChatOpen(true);

      await loadChatMessages(
        item.id
      );
    };

  /* =====================================================
     CHAT - SEND MESSAGE
  ===================================================== */

  const handleSendChat =
    async () => {
      if (
        !activeLeave?.id
      ) {
        setError(
          "Leave ID not found."
        );
        return;
      }

      const message =
        chatText.trim();

      if (!message) {
        return;
      }

      if (chatSending) {
        return;
      }

      setChatSending(true);
      setError("");

      try {
        console.log(
          "SEND CHAT LEAVE ID:",
          activeLeave.id
        );

        console.log(
          "SEND CHAT MESSAGE:",
          message
        );

        await sendLeaveChatMessage(
          activeLeave.id,
          {
            message,
          }
        );

        setChatText("");

        await loadChatMessages(
          activeLeave.id
        );
      } catch (err: any) {
        console.error(
          "SEND LEAVE CHAT ERROR:",
          err
        );

        setError(
          err?.message ||
            err?.response?.data
              ?.message ||
            "Unable to send chat message."
        );
      } finally {
        setChatSending(false);
      }
    };

  /* =====================================================
     CHAT - DELETE MESSAGE
  ===================================================== */

  const handleDeleteChat =
    async (
      messageId: string
    ) => {
      if (!messageId) {
        return;
      }

      if (!activeLeave?.id) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this message?"
        );

      if (!confirmed) {
        return;
      }

      setChatDeletingId(
        messageId
      );
      setError("");

      try {
        console.log(
          "DELETE CHAT MESSAGE ID:",
          messageId
        );

        await deleteLeaveChatMessage(
          messageId
        );

        await loadChatMessages(
          activeLeave.id
        );
      } catch (err: any) {
        console.error(
          "DELETE CHAT MESSAGE ERROR:",
          err
        );

        setError(
          err?.message ||
            err?.response?.data
              ?.message ||
            "Unable to delete chat message."
        );
      } finally {
        setChatDeletingId(
          null
        );
      }
    };

  /* =====================================================
     CHAT - CLOSE
  ===================================================== */

  const closeChatModal = () => {
    setChatOpen(false);
    setChatMessages([]);
    setChatText("");
    setActiveLeave(null);
  };

  /* =====================================================
     CHAT - OWN MESSAGE
  ===================================================== */

  const isOwnChatMessage = (
    message: LeaveChatMessage
  ) => {
    const currentUserId =
      getCurrentUserId();

    if (
      currentUserId &&
      message.senderId
    ) {
      return (
        message.senderId
          .toLowerCase() ===
        currentUserId.toLowerCase()
      );
    }

    return false;
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const openEditModal =
    async (
      item: LeaveItem
    ) => {
      setError("");
      setActiveLeave(item);

      setForm({
        employeeId:
          item.userId,

        leaveReasonId:
          item.leaveTypeMasterId,

        from:
          toInputDate(
            item.from
          ),

        to:
          toInputDate(
            item.to
          ),

        leaveType:
          item.leaveType,

        noOfDays:
          item.days.replace(
            /[^0-9.]/g,
            ""
          ),

        reason:
          item.reason,
      });

      setEditOpen(true);

      try {
        const response =
          await getLeaveById(
            item.id
          );

        const fresh =
          extractSingleLeave(
            response,
            employees,
            leaveTypes
          );

        if (fresh) {
          setActiveLeave(
            fresh
          );

          setForm({
            employeeId:
              fresh.userId,

            leaveReasonId:
              fresh.leaveTypeMasterId,

            from:
              toInputDate(
                fresh.from
              ),

            to:
              toInputDate(
                fresh.to
              ),

            leaveType:
              fresh.leaveType,

            noOfDays:
              fresh.days.replace(
                /[^0-9.]/g,
                ""
              ),

            reason:
              fresh.reason,
          });
        }
      } catch (err) {
        console.error(
          "GET LEAVE FOR EDIT ERROR:",
          err
        );
      }
    };

  /* =====================================================
     DELETE MODAL
  ===================================================== */

  const openDeleteModal =
    (id: string) => {
      setDeleteId(id);
      setDeleteOpen(true);
    };

  /* =====================================================
     BUILD PAYLOAD
  ===================================================== */

  const buildLeavePayload =
    (): UpdateLeavePayload => {
      if (
        !form.employeeId ||
        !form.leaveReasonId ||
        !form.from ||
        !form.to ||
        !form.leaveType ||
        !form.reason.trim()
      ) {
        throw new Error(
          "Please fill all required leave fields."
        );
      }

      return {
        userId:
          form.employeeId.trim(),

        leaveTypeMasterId:
          form.leaveReasonId.trim(),

        fromDate:
          formatApiDate(
            form.from
          ),

        toDate:
          formatApiDate(
            form.to
          ),

        availType:
          AVAIL_TYPE_MAP[
            form.leaveType
          ],

        reason:
          form.reason.trim(),
      };
    };

  /* =====================================================
     VALIDATE
  ===================================================== */

  const validateForm = () => {
    if (!form.employeeId) {
      setError(
        "Please select an employee."
      );
      return false;
    }

    if (!form.leaveReasonId) {
      setError(
        "Please select a leave reason."
      );
      return false;
    }

    if (
      !form.from ||
      !form.to
    ) {
      setError(
        "Please select From and To dates."
      );
      return false;
    }

    if (
      new Date(form.to) <
      new Date(form.from)
    ) {
      setError(
        "To date cannot be before From date."
      );
      return false;
    }

    if (!form.leaveType) {
      setError(
        "Please select leave type."
      );
      return false;
    }

    if (!form.reason.trim()) {
      setError(
        "Please enter a reason."
      );
      return false;
    }

    return true;
  };

  /* =====================================================
     ADD LEAVE
  ===================================================== */

  const handleAddLeave =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setSaving(true);
      setError("");

      try {
        const payload =
          buildLeavePayload() as AddLeavePayload;

        console.log(
          "FINAL ADD LEAVE PAYLOAD:",
          payload
        );

        await addLeave(
          payload
        );

        setAddOpen(false);

        setForm({
          ...emptyForm,
        });

        await loadLeaves(
          employees,
          leaveTypes
        );
      } catch (err: any) {
        console.error(
          "ADD LEAVE ERROR:",
          err
        );

        setError(
          err?.message ||
            err?.response?.data
              ?.message ||
            "Unable to add leave."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     UPDATE LEAVE
  ===================================================== */

  const handleEditLeave =
    async (
      e: FormEvent
    ) => {
      e.preventDefault();

      if (!activeLeave) {
        setError(
          "Selected leave record not found."
        );
        return;
      }

      if (!validateForm()) {
        return;
      }

      setSaving(true);
      setError("");

      try {
        const payload =
          buildLeavePayload();

        console.log(
          "FINAL UPDATE LEAVE ID:",
          activeLeave.id
        );

        console.log(
          "FINAL UPDATE LEAVE PAYLOAD:",
          payload
        );

        await updateLeave(
          activeLeave.id,
          payload
        );

        setEditOpen(false);
        setActiveLeave(null);

        setForm({
          ...emptyForm,
        });

        await loadLeaves(
          employees,
          leaveTypes
        );
      } catch (err: any) {
        console.error(
          "UPDATE LEAVE ERROR:",
          err
        );

        setError(
          err?.message ||
            err?.response?.data
              ?.message ||
            "Unable to update leave."
        );
      } finally {
        setSaving(false);
      }
    };

  /* =====================================================
     STATUS UPDATE
  ===================================================== */

  const handleStatusChange =
    async (
      item: LeaveItem,
      nextStatus: LeaveStatus
    ) => {
      const reviewedByUserId =
        getCurrentUserId();

      if (
        !reviewedByUserId
      ) {
        setError(
          "ReviewedByUserId was not found in localStorage. Please login again."
        );

        return;
      }

      const previousStatus =
        item.status;

      const previousStatusValue =
        item.statusValue;

      const nextStatusValue =
        STATUS_MAP[
          nextStatus
        ];

      setLeaveData(
        (prev) =>
          prev.map(
            (leave) =>
              leave.id ===
              item.id
                ? {
                    ...leave,
                    status:
                      nextStatus,
                    statusValue:
                      nextStatusValue,
                  }
                : leave
          )
      );

      try {
        await updateLeaveStatus(
          item.id,
          reviewedByUserId,
          {
            status:
              nextStatusValue,

            remarks:
              item.remarks ||
              "",
          }
        );

        await loadLeaves(
          employees,
          leaveTypes
        );
      } catch (err: any) {
        console.error(
          "UPDATE LEAVE STATUS ERROR:",
          err
        );

        setLeaveData(
          (prev) =>
            prev.map(
              (leave) =>
                leave.id ===
                item.id
                  ? {
                      ...leave,
                      status:
                        previousStatus,
                      statusValue:
                        previousStatusValue,
                    }
                  : leave
            )
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Unable to update leave status."
        );
      }
    };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete =
    async () => {
      if (!deleteId) {
        return;
      }

      setDeleting(true);
      setError("");

      try {
        await deleteLeave(
          deleteId
        );

        setLeaveData(
          (prev) =>
            prev.filter(
              (item) =>
                item.id !==
                deleteId
            )
        );

        setSelected(
          (prev) =>
            prev.filter(
              (id) =>
                id !== deleteId
            )
        );

        setDeleteId(null);
        setDeleteOpen(false);

        await loadLeaves(
          employees,
          leaveTypes
        );
      } catch (err: any) {
        console.error(
          "DELETE LEAVE ERROR:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Unable to delete leave."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <>
      <style>
        {`

        .leave-page {
          width: 100%;
          min-height: 100vh;
          padding: 24px 23px 25px;
          background: #f8f9fb;
          color: #14213d;
        }

        .leave-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 26px;
        }

        .leave-page-title {
          margin: 0 0 5px;
          font-size: 24px;
          font-weight: 700;
          color: #0d1c3b;
        }

        .leave-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #677386;
          font-size: 12px;
        }

        .leave-breadcrumb a {
          display: inline-flex;
          color: #315c75;
          text-decoration: none;
        }

        .leave-add-btn {
          height: 39px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          background: #c39237;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .leave-summary-grid {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .leave-summary-card {
          height: 87px;
          position: relative;
          overflow: hidden;
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 1px 3px rgba(20,32,52,.08);
          display: flex;
          align-items: center;
        }

        .leave-summary-left {
          width: 102px;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
        }

        .leave-summary-shape {
          width: 100px;
          height: 100%;
          border-radius: 0 58px 58px 0;
          position: absolute;
          left: 0;
          top: 0;
        }

        .leave-summary-light {
          width: 56px;
          height: 120%;
          position: absolute;
          right: -15px;
          top: -10px;
          transform: skewX(25deg);
          background: rgba(255,255,255,.78);
        }

        .leave-summary-icon {
          width: 34px;
          height: 34px;
          position: relative;
          z-index: 2;
          margin-left: 20px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .leave-summary-content {
          flex: 1;
          padding-right: 20px;
          text-align: right;
        }

        .leave-summary-title {
          margin-bottom: 2px;
          color: #697386;
          font-size: 13px;
        }

        .leave-summary-value {
          color: #10203e;
          font-size: 20px;
          font-weight: 600;
        }

        .leave-list-card {
          border: 1px solid #dde2e8;
          border-radius: 5px;
          background: #fff;
          overflow: hidden;
        }

        .leave-list-header {
          min-height: 71px;
          padding: 16px 20px;
          border-bottom: 1px solid #dde2e8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .leave-list-header h5 {
          margin: 0;
          color: #071632;
          font-size: 15px;
          font-weight: 600;
        }

        .leave-filters {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .leave-filter-box {
          height: 38px;
          padding: 0 11px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #17233f;
          font-size: 13px;
          outline: none;
        }

        .leave-date-filter { width: 195px; }
        .leave-type-filter { width: 110px; }
        .leave-sort-filter { width: 166px; }

        .leave-toolbar {
          min-height: 61px;
          padding: 10px 16px;
          border-bottom: 1px solid #e2e5e9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .leave-rows {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #26354d;
          font-size: 13px;
        }

        .leave-rows select {
          width: 49px;
          height: 29px;
          padding: 0 5px;
          border: 1px solid #dce1e7;
          border-radius: 6px;
          background: #fff;
          font-size: 12px;
        }

        .leave-search {
          width: 160px;
          height: 30px;
          padding: 0 14px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          font-size: 12px;
        }

        .leave-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .leave-table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
        }

        .leave-table thead {
          background: #e1e4e9;
        }

        .leave-table th {
          height: 43px;
          padding: 0 14px;
          color: #06142e;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }

        .leave-table td {
          height: 59px;
          padding: 0 14px;
          border-bottom: 1px solid #dfe3e8;
          background: #fff;
          color: #5c6879;
          font-size: 13px;
          white-space: nowrap;
        }

        .leave-check-col {
          width: 55px;
          text-align: center;
        }

        .leave-checkbox {
          width: 17px;
          height: 17px;
          cursor: pointer;
        }

        .leave-sort {
          float: right;
          color: #cbd1d9;
          font-size: 11px;
        }

        .leave-employee {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .leave-avatar {
          width: 33px;
          height: 33px;
          border-radius: 50%;
          background: #d7d7d7;
          position: relative;
          flex-shrink: 0;
        }

        .leave-avatar::after {
          content: "...";
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          font-size: 8px;
        }

        .leave-employee-name {
          margin-bottom: 2px;
          color: #06142e;
          font-size: 13px;
          font-weight: 500;
        }

        .leave-employee-role {
          color: #7a8494;
          font-size: 11px;
        }

        .leave-type-cell {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .leave-info-icon {
          color: #0d6efd;
        }

        .leave-status-wrap {
          position: relative;
          width: max-content;
        }

        .leave-status-dot {
          width: 9px;
          height: 9px;
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          z-index: 2;
          pointer-events: none;
        }

        .leave-status-select {
          height: 33px;
          min-width: 116px;
          padding: 0 30px;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          background: #fff;
          color: #09152d;
          font-size: 13px;
          outline: none;
        }

        .leave-actions {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .leave-action-btn {
          width: 20px;
          height: 24px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #647286;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .leave-table-footer {
          height: 57px;
          padding: 0 16px;
          border-top: 5px solid #f0f1f3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #596679;
          font-size: 13px;
        }

        .leave-pagination {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .leave-pagination button {
          border: 0;
          background: transparent;
          color: #a2a9b4;
        }

        .leave-current-page {
          width: 27px;
          height: 27px;
          border-radius: 50%;
          background: #c39237 !important;
          color: #fff !important;
        }

        /* MODALS */

        .leave-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,.42);
        }

        .leave-form-modal {
          width: 800px;
          max-width: calc(100vw - 30px);
          overflow: hidden;
          border-radius: 5px;
          background: #fff;
          box-shadow: 0 15px 45px rgba(0,0,0,.22);
        }

        .leave-modal-header {
          min-height: 63px;
          padding: 0 17px;
          border-bottom: 1px solid #e3e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .leave-modal-header h3 {
          margin: 0;
          color: #1e2b49;
          font-size: 20px;
          font-weight: 600;
        }

        .leave-modal-close {
          width: 20px;
          height: 20px;
          border: 0;
          border-radius: 50%;
          background: #747d8a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .leave-modal-body {
          padding: 17px;
        }

        .leave-form-grid {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 17px 23px;
        }

        .leave-form-group label {
          display: block;
          margin-bottom: 8px;
          color: #263452;
          font-size: 13px;
          font-weight: 500;
        }

        .leave-form-group input,
        .leave-form-group select,
        .leave-form-group textarea {
          width: 100%;
          border: 1px solid #dce1e7;
          border-radius: 5px;
          outline: none;
          background: #fff;
          color: #26344d;
          font-size: 13px;
        }

        .leave-form-group input,
        .leave-form-group select {
          height: 38px;
          padding: 0 10px;
        }

        .leave-form-group textarea {
          height: 87px;
          padding: 10px;
          resize: none;
        }

        .leave-form-full {
          grid-column: 1/-1;
        }

        .leave-modal-footer {
          min-height: 64px;
          padding: 10px 13px;
          border-top: 1px solid #e4e7eb;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
        }

        .leave-modal-cancel,
        .leave-modal-save {
          height: 39px;
          padding: 0 15px;
          border: 0;
          border-radius: 5px;
          font-size: 13px;
          cursor: pointer;
        }

        .leave-modal-cancel {
          background: #f7f8f9;
          color: #172033;
        }

        .leave-modal-save {
          background: #c39237;
          color: #fff;
          font-weight: 600;
        }

        /* VIEW */

        .leave-view-modal {
          width: 800px;
          max-width: calc(100vw - 30px);
          background: #fff;
          border-radius: 5px;
          overflow: hidden;
        }

        .leave-view-content {
          padding: 34px 17px 27px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          row-gap: 28px;
          column-gap: 65px;
        }

        .leave-view-label {
          margin-bottom: 3px;
          color: #3c4658;
          font-size: 13px;
        }

        .leave-view-value {
          color: #25324f;
          font-size: 17px;
          font-weight: 600;
        }

        /* CHAT */

        .leave-chat-modal {
          width: 800px;
          max-width: calc(100vw - 30px);
          height: 475px;
          background: #fff;
          border-radius: 5px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          min-height: 62px;
          padding: 8px 17px;
          border-bottom: 1px solid #e4e7eb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-user {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #d5d5d5;
          position: relative;
        }

        .chat-online {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #00bd61;
          position: absolute;
          right: 0;
          bottom: 0;
          border: 2px solid #fff;
        }

        .chat-name {
          color: #13213e;
          font-size: 14px;
          font-weight: 500;
        }

        .chat-status {
          color: #111827;
          font-size: 12px;
        }

        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 17px 75px;
        }

        .chat-loading {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #697386;
          font-size: 13px;
        }

        .chat-empty {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #697386;
          font-size: 13px;
          text-align: center;
        }

        .chat-row {
          display: flex;
          margin-bottom: 16px;
        }

        .chat-row.right {
          justify-content: flex-end;
        }

        .chat-bubble-wrap {
          position: relative;
          max-width: 440px;
        }

        .chat-bubble {
          max-width: 440px;
          padding: 14px 16px;
          border-radius: 0 17px 17px 17px;
          background: #f5f6f7;
          color: #111827;
          font-size: 13px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .chat-row.right .chat-bubble {
          border-radius: 17px 17px 0 17px;
          background: #fff4d9;
        }

        .chat-meta {
          margin-top: 4px;
          color: #697386;
          font-size: 12px;
        }

        .chat-delete-btn {
          width: 24px;
          height: 24px;
          position: absolute;
          right: -31px;
          top: 5px;
          padding: 0;
          border: 0;
          border-radius: 4px;
          background: transparent;
          color: #9aa2ae;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .chat-delete-btn:hover {
          color: #f10d18;
          background: #fff0f0;
        }

        .chat-delete-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .chat-input-bar {
          min-height: 68px;
          padding: 9px 17px;
          border-top: 1px solid #e4e7eb;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-input {
          flex: 1;
          height: 48px;
          padding: 0 10px;
          border: 1px solid #edf0f3;
          border-radius: 8px;
          outline: none;
          background: #fafafa;
          font-size: 13px;
        }

        .chat-input:focus {
          border-color: #c39237;
          background: #fff;
        }

        .chat-send {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 8px;
          background: #c39237;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .chat-send:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        /* DELETE */

        .leave-delete-modal {
          width: 400px;
          max-width: calc(100vw - 30px);
          padding: 17px 30px;
          border-radius: 5px;
          background: #fff;
          text-align: center;
        }

        .leave-delete-icon {
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

        .leave-delete-modal h3 {
          margin: 0 0 6px;
          color: #1d2b48;
          font-size: 19px;
          font-weight: 600;
        }

        .leave-delete-modal p {
          margin: 0 auto 17px;
          max-width: 320px;
          color: #3e4654;
          font-size: 13px;
          line-height: 1.5;
        }

        .leave-delete-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .leave-delete-cancel,
        .leave-delete-confirm {
          height: 39px;
          padding: 0 16px;
          border: 0;
          border-radius: 5px;
          font-size: 13px;
        }

        .leave-delete-cancel {
          background: #f6f7f8;
        }

        .leave-delete-confirm {
          background: #f10d16;
          color: #fff;
          font-weight: 600;
        }

        @media(max-width:900px){
          .leave-summary-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .leave-form-grid {
            grid-template-columns:1fr;
          }

          .leave-form-full {
            grid-column:auto;
          }
        }

        .leave-error {
          margin: 0 0 15px;
          padding: 10px 14px;
          border: 1px solid #f2caca;
          border-radius: 5px;
          background: #fff4f4;
          color: #c0392b;
          font-size: 13px;
        }

        .leave-loading {
          padding: 45px 20px;
          text-align: center;
          color: #697386;
          font-size: 13px;
        }

        .leave-empty {
          padding: 45px 20px !important;
          text-align: center;
          color: #697386 !important;
        }

        .leave-modal-save:disabled,
        .leave-delete-confirm:disabled,
        .leave-delete-cancel:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .leave-view-reason {
          white-space: normal;
          line-height: 1.5;
        }

        @media(max-width:900px){
          .leave-list-header,
          .leave-toolbar {
            flex-wrap: wrap;
          }

          .leave-filters {
            width: 100%;
            flex-wrap: wrap;
          }

          .leave-date-filter,
          .leave-type-filter,
          .leave-sort-filter {
            width: 100%;
          }

          .chat-body {
            padding: 17px 20px;
          }
        }

        `}
      </style>

      <div className="leave-page">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="leave-page-header">

          <div>

            <h1 className="leave-page-title">
              Leaves
            </h1>

            <div className="leave-breadcrumb">

              <Link to="/admin/dashboard">
                <i className="ti ti-home" />
              </Link>

              <span>/</span>

              <span>
                Leaves
              </span>

            </div>

          </div>

          <button
            type="button"
            className="leave-add-btn"
            onClick={
              openAddModal
            }
          >
            <i className="ti ti-circle-plus" />
            Add Leave
          </button>

        </div>

        {error && (
          <div className="leave-error">
            {error}
          </div>
        )}

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="leave-summary-grid">

          {[
            {
              title:
                "Total Present",
              value:
                "180/200",
              color:
                "#05c95a",
            },
            {
              title:
                "Planned Leaves",
              value:
                String(
                  leaveData.filter(
                    (item) =>
                      item.status ===
                      "Approved"
                  ).length
                ),
              color:
                "#ff328f",
            },
            {
              title:
                "Unplanned Leaves",
              value:
                String(
                  leaveData.filter(
                    (item) =>
                      item.status ===
                      "Declined"
                  ).length
                ),
              color:
                "#ffbe0b",
            },
            {
              title:
                "Pending Requests",
              value:
                String(
                  leaveData.filter(
                    (item) =>
                      item.status ===
                      "New"
                  ).length
                ),
              color:
                "#20bdd9",
            },
          ].map(
            (item) => (
              <div
                key={
                  item.title
                }
                className="leave-summary-card"
              >

                <div className="leave-summary-left">

                  <div
                    className="leave-summary-shape"
                    style={{
                      background:
                        item.color,
                    }}
                  />

                  <div className="leave-summary-light" />

                  <div
                    className="leave-summary-icon"
                    style={{
                      color:
                        item.color,
                    }}
                  >
                    <UserRoundCheck
                      size={18}
                    />
                  </div>

                </div>

                <div className="leave-summary-content">

                  <div className="leave-summary-title">
                    {item.title}
                  </div>

                  <div className="leave-summary-value">
                    {item.value}
                  </div>

                </div>

              </div>
            )
          )}

        </div>

        {/* =====================================================
            LEAVE LIST
        ===================================================== */}

        <div className="leave-list-card">

          <div className="leave-list-header">

            <h5>
              Leave List
            </h5>

            <div className="leave-filters">

              <select
                className="leave-filter-box leave-date-filter"
                defaultValue=""
              >
                <option value="">
                  Date Range
                </option>

                <option value="last7">
                  Last 7 Days
                </option>

                <option value="thisMonth">
                  This Month
                </option>
              </select>

              <select
                className="leave-filter-box leave-type-filter"
                value={
                  leaveTypeFilter
                }
                onChange={(e) => {
                  setLeaveTypeFilter(
                    e.target.value
                  );

                  setCurrentPage(
                    1
                  );
                }}
              >
                <option value="">
                  Leave Type
                </option>

                {leaveTypes.map(
                  (type) => (
                    <option
                      key={
                        type.id
                      }
                      value={
                        type.name
                      }
                    >
                      {
                        type.name
                      }
                    </option>
                  )
                )}

              </select>

              <select
                className="leave-filter-box leave-sort-filter"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
              >

                <option value="Last 7 Days">
                  Sort By : Last 7 Days
                </option>

                <option value="Ascending">
                  Ascending
                </option>

                <option value="Descending">
                  Descending
                </option>

              </select>

            </div>

          </div>

          <div className="leave-toolbar">

            <div className="leave-rows">

              <span>
                Row Per Page
              </span>

              <select
                value={
                  rowsPerPage
                }
                onChange={(e) => {
                  setRowsPerPage(
                    Number(
                      e.target.value
                    )
                  );

                  setCurrentPage(
                    1
                  );
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

              <span>
                Entries
              </span>

            </div>

            <input
              className="leave-search"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );

                setCurrentPage(
                  1
                );
              }}
            />

          </div>

          <div className="leave-table-wrapper">

            {loading ? (
              <div className="leave-loading">
                Loading leaves...
              </div>
            ) : (
              <table className="leave-table">

                <thead>

                  <tr>

                    <th className="leave-check-col">
                      <input
                        type="checkbox"
                        className="leave-checkbox"
                        checked={
                          allVisibleSelected
                        }
                        onChange={
                          handleSelectAll
                        }
                      />
                    </th>

                    <th>
                      Employee
                      <span className="leave-sort">
                        ↑↓
                      </span>
                    </th>

                    <th>
                      Leave Type
                      <span className="leave-sort">
                        ↑↓
                      </span>
                    </th>

                    <th>
                      From
                      <span className="leave-sort">
                        ↑↓
                      </span>
                    </th>

                    <th>
                      To
                      <span className="leave-sort">
                        ↑↓
                      </span>
                    </th>

                    <th>
                      No of Days
                      <span className="leave-sort">
                        ↑↓
                      </span>
                    </th>

                    <th>
                      Status
                      <span className="leave-sort">
                        ↑↓
                      </span>
                    </th>

                    <th>
                      <span className="leave-sort">
                        ↑↓
                      </span>
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {visibleData.length ===
                  0 ? (
                    <tr>

                      <td
                        colSpan={8}
                        className="leave-empty"
                      >
                        No leave records found.
                      </td>

                    </tr>
                  ) : (
                    visibleData.map(
                      (item) => (
                        <tr
                          key={
                            item.id
                          }
                        >

                          <td className="leave-check-col">

                            <input
                              type="checkbox"
                              className="leave-checkbox"
                              checked={selected.includes(
                                item.id
                              )}
                              onChange={() =>
                                toggleSelect(
                                  item.id
                                )
                              }
                            />

                          </td>

                          <td>

                            <div className="leave-employee">

                              <div className="leave-avatar" />

                              <div>

                                <div className="leave-employee-name">
                                  {
                                    item.name
                                  }
                                </div>

                                <div className="leave-employee-role">
                                  {
                                    item.role
                                  }
                                </div>

                              </div>

                            </div>

                          </td>

                          <td>

                            <div className="leave-type-cell">

                              {
                                item.type
                              }

                              <Info
                                size={13}
                                className="leave-info-icon"
                              />

                            </div>

                          </td>

                          <td>
                            {
                              item.from
                            }
                          </td>

                          <td>
                            {
                              item.to
                            }
                          </td>

                          <td>
                            {
                              item.days
                            }
                          </td>

                          <td>

                            <div className="leave-status-wrap">

                              <span
                                className="leave-status-dot"
                                style={{
                                  background:
                                    getStatusColor(
                                      item.status
                                    ),
                                }}
                              />

                              <select
                                className="leave-status-select"
                                value={
                                  item.status
                                }
                                onChange={(e) =>
                                  handleStatusChange(
                                    item,
                                    e.target
                                      .value as LeaveStatus
                                  )
                                }
                              >

                                <option value="Approved">
                                  Approved
                                </option>

                                <option value="Declined">
                                  Declined
                                </option>

                                <option value="New">
                                  New
                                </option>

                              </select>

                            </div>

                          </td>

                          <td>

                            <div className="leave-actions">

                              <button
                                type="button"
                                className="leave-action-btn"
                                onClick={() =>
                                  openViewModal(
                                    item
                                  )
                                }
                                title="View"
                              >
                                <Eye
                                  size={15}
                                />
                              </button>

                              <button
                                type="button"
                                className="leave-action-btn"
                                onClick={() =>
                                  openChatModal(
                                    item
                                  )
                                }
                                title="Chat"
                              >
                                <MessageSquareMore
                                  size={15}
                                />
                              </button>

                              <button
                                type="button"
                                className="leave-action-btn"
                                onClick={() =>
                                  openEditModal(
                                    item
                                  )
                                }
                                title="Edit"
                              >
                                <Pencil
                                  size={15}
                                />
                              </button>

                              <button
                                type="button"
                                className="leave-action-btn"
                                onClick={() =>
                                  openDeleteModal(
                                    item.id
                                  )
                                }
                                title="Delete"
                              >
                                <Trash2
                                  size={15}
                                />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>
            )}

          </div>

          <div className="leave-table-footer">

            <div>

              Showing{" "}

              {filteredData.length ===
              0
                ? 0
                : (safeCurrentPage -
                    1) *
                    rowsPerPage +
                  1}

              {" - "}

              {Math.min(
                safeCurrentPage *
                  rowsPerPage,
                filteredData.length
              )}{" "}

              of{" "}

              {
                filteredData.length
              }{" "}

              entries

            </div>

            <div className="leave-pagination">

              <button
                disabled={
                  safeCurrentPage ===
                  1
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
                ‹
              </button>

              <button className="leave-current-page">
                {
                  safeCurrentPage
                }
              </button>

              <button
                disabled={
                  safeCurrentPage ===
                  totalPages
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
                ›
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          ADD LEAVE MODAL
      ===================================================== */}

      {addOpen && (
        <div className="leave-modal-overlay">

          <div className="leave-form-modal">

            <div className="leave-modal-header">

              <h3>
                Add Leave
              </h3>

              <button
                className="leave-modal-close"
                type="button"
                onClick={() =>
                  setAddOpen(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleAddLeave
              }
            >

              <div className="leave-modal-body">

                <div className="leave-form-grid">

                  <div className="leave-form-group">

                    <label>
                      Employee
                    </label>

                    <select
                      value={
                        form.employeeId
                      }
                      onChange={(e) =>
                        setForm(
                          (p) => ({
                            ...p,
                            employeeId:
                              e.target
                                .value,
                          })
                        )
                      }
                    >

                      <option value="">
                        Select
                      </option>

                      {employees.map(
                        (
                          employee
                        ) => (
                          <option
                            key={
                              employee.id
                            }
                            value={
                              employee.id
                            }
                          >
                            {
                              employee.name
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="leave-form-group">

                    <label>
                      Leave Reason
                    </label>

                    <select
                      value={
                        form.leaveReasonId
                      }
                      onChange={(e) =>
                        setForm(
                          (p) => ({
                            ...p,
                            leaveReasonId:
                              e.target
                                .value,
                          })
                        )
                      }
                    >

                      <option value="">
                        Select Leave Reason
                      </option>

                      {leaveTypes.map(
                        (
                          type
                        ) => (
                          <option
                            key={
                              type.id
                            }
                            value={
                              type.id
                            }
                          >
                            {
                              type.name
                            }
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="leave-form-group">

                    <label>
                      From
                    </label>

                    <input
                      type="date"
                      value={
                        form.from
                      }
                      onChange={(e) =>
                        setForm(
                          (p) => ({
                            ...p,
                            from:
                              e.target
                                .value,
                          })
                        )
                      }
                    />

                  </div>

                  <div className="leave-form-group">

                    <label>
                      To
                    </label>

                    <input
                      type="date"
                      value={
                        form.to
                      }
                      onChange={(e) =>
                        setForm(
                          (p) => ({
                            ...p,
                            to:
                              e.target
                                .value,
                          })
                        )
                      }
                    />

                  </div>

                  <div className="leave-form-group">

                    <label>
                      Leave Type
                    </label>

                    <select
                      value={
                        form.leaveType
                      }
                      onChange={(e) =>
                        setForm(
                          (p) => ({
                            ...p,
                            leaveType:
                              e.target
                                .value as LeaveTypeOption,
                          })
                        )
                      }
                    >

                      <option value="">
                        Select
                      </option>

                      <option value="Full Day">
                        Full Day
                      </option>

                      <option value="First Half">
                        First Half
                      </option>

                      <option value="Second Half">
                        Second Half
                      </option>

                    </select>

                  </div>

                  <div className="leave-form-group">

                    <label>
                      No of Days
                    </label>

                    <input
                      type="text"
                      value={
                        form.noOfDays
                      }
                      readOnly
                    />

                  </div>

                  <div className="leave-form-group leave-form-full">

                    <label>
                      Reason
                    </label>

                    <textarea
                      value={
                        form.reason
                      }
                      onChange={(e) =>
                        setForm(
                          (p) => ({
                            ...p,
                            reason:
                              e.target
                                .value,
                          })
                        )
                      }
                    />

                  </div>

                </div>

              </div>

              <div className="leave-modal-footer">

                <button
                  type="button"
                  className="leave-modal-cancel"
                  onClick={() =>
                    setAddOpen(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leave-modal-save"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Add Leave"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          VIEW LEAVE MODAL
      ===================================================== */}

      {viewOpen &&
        activeLeave && (
          <div className="leave-modal-overlay">

            <div className="leave-view-modal">

              <div className="leave-modal-header">

                <h3>
                  View Leave
                </h3>

                <button
                  className="leave-modal-close"
                  type="button"
                  onClick={() => {
                    setViewOpen(
                      false
                    );

                    setActiveLeave(
                      null
                    );
                  }}
                >
                  ×
                </button>

              </div>

              <div className="leave-view-content">

                <div>
                  <div className="leave-view-label">
                    Employee
                  </div>

                  <div className="leave-view-value">
                    {
                      activeLeave.name
                    }
                  </div>
                </div>

                <div>
                  <div className="leave-view-label">
                    Leave Reason
                  </div>

                  <div className="leave-view-value">
                    {
                      activeLeave.type
                    }
                  </div>
                </div>

                <div>
                  <div className="leave-view-label">
                    From
                  </div>

                  <div className="leave-view-value">
                    {
                      activeLeave.from
                    }
                  </div>
                </div>

                <div>
                  <div className="leave-view-label">
                    To
                  </div>

                  <div className="leave-view-value">
                    {
                      activeLeave.to
                    }
                  </div>
                </div>

                <div>
                  <div className="leave-view-label">
                    Leave Type
                  </div>

                  <div className="leave-view-value">
                    {
                      activeLeave.leaveType
                    }
                  </div>
                </div>

                <div>
                  <div className="leave-view-label">
                    No of Days
                  </div>

                  <div className="leave-view-value">
                    {
                      activeLeave.days
                    }
                  </div>
                </div>

                <div className="leave-form-full">

                  <div className="leave-view-label">
                    Status
                  </div>

                  <div className="leave-view-value">
                    {
                      activeLeave.status
                    }
                  </div>

                </div>

                <div className="leave-form-full">

                  <div className="leave-view-label">
                    Reason
                  </div>

                  <div className="leave-view-value leave-view-reason">
                    {
                      activeLeave.reason ||
                      "-"
                    }
                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          CHAT MODAL - API CONNECTED
      ===================================================== */}

      {chatOpen &&
        activeLeave && (
          <div className="leave-modal-overlay">

            <div className="leave-chat-modal">

              <div className="chat-header">

                <div className="chat-user">

                  <div className="chat-avatar">
                    <span className="chat-online" />
                  </div>

                  <div>

                    <div className="chat-name">
                      {
                        activeLeave.name
                      }
                    </div>

                    <div className="chat-status">
                      Leave Chat
                    </div>

                  </div>

                </div>

                <button
                  className="leave-modal-close"
                  type="button"
                  onClick={
                    closeChatModal
                  }
                >
                  ×
                </button>

              </div>

              <div className="chat-body">

                {chatLoading ? (
                  <div className="chat-loading">
                    Loading messages...
                  </div>
                ) : chatMessages.length ===
                  0 ? (
                  <div className="chat-empty">
                    No messages yet.
                    <br />
                    Start the conversation.
                  </div>
                ) : (
                  chatMessages.map(
                    (
                      message,
                      index
                    ) => {
                      const own =
                        isOwnChatMessage(
                          message
                        );

                      const messageKey =
                        message.id ||
                        `${message.createdAt}-${index}`;

                      return (
                        <div
                          key={
                            messageKey
                          }
                          className={`chat-row ${
                            own
                              ? "right"
                              : ""
                          }`}
                        >

                          <div>

                            <div className="chat-bubble-wrap">

                              <div className="chat-bubble">
                                {
                                  message.message
                                }
                              </div>

                              {own &&
                                message.id && (
                                  <button
                                    type="button"
                                    className="chat-delete-btn"
                                    title="Delete message"
                                    disabled={
                                      chatDeletingId ===
                                      message.id
                                    }
                                    onClick={() =>
                                      handleDeleteChat(
                                        message.id
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={
                                        13
                                      }
                                    />
                                  </button>
                                )}

                            </div>

                            <div
                              className="chat-meta"
                              style={{
                                textAlign:
                                  own
                                    ? "right"
                                    : "left",
                              }}
                            >
                              {own
                                ? "You"
                                : message.senderName}

                              {message.createdAt &&
                                ` • ${formatChatTime(
                                  message.createdAt
                                )}`}
                            </div>

                          </div>

                        </div>
                      );
                    }
                  )
                )}

              </div>

              <div className="chat-input-bar">

                <input
                  className="chat-input"
                  placeholder="Type Your Message"
                  value={
                    chatText
                  }
                  disabled={
                    chatSending
                  }
                  onChange={(e) =>
                    setChatText(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      e.preventDefault();

                      handleSendChat();
                    }
                  }}
                />

                <button
                  type="button"
                  className="chat-send"
                  disabled={
                    chatSending ||
                    !chatText.trim()
                  }
                  onClick={
                    handleSendChat
                  }
                >
                  <Send
                    size={17}
                  />
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          EDIT LEAVE MODAL
      ===================================================== */}

      {editOpen &&
        activeLeave && (
          <div className="leave-modal-overlay">

            <div className="leave-form-modal">

              <div className="leave-modal-header">

                <h3>
                  Edit Leave
                </h3>

                <button
                  className="leave-modal-close"
                  type="button"
                  onClick={() => {
                    setEditOpen(
                      false
                    );

                    setActiveLeave(
                      null
                    );
                  }}
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={
                  handleEditLeave
                }
              >

                <div className="leave-modal-body">

                  <div className="leave-form-grid">

                    <div className="leave-form-group">

                      <label>
                        Employee
                      </label>

                      <select
                        value={
                          form.employeeId
                        }
                        onChange={(e) =>
                          setForm(
                            (p) => ({
                              ...p,
                              employeeId:
                                e.target
                                  .value,
                            })
                          )
                        }
                      >

                        <option value="">
                          Select
                        </option>

                        {employees.map(
                          (
                            employee
                          ) => (
                            <option
                              key={
                                employee.id
                              }
                              value={
                                employee.id
                              }
                            >
                              {
                                employee.name
                              }
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div className="leave-form-group">

                      <label>
                        Leave Reason
                      </label>

                      <select
                        value={
                          form.leaveReasonId
                        }
                        onChange={(e) =>
                          setForm(
                            (p) => ({
                              ...p,
                              leaveReasonId:
                                e.target
                                  .value,
                            })
                          )
                        }
                      >

                        <option value="">
                          Select Leave Reason
                        </option>

                        {leaveTypes.map(
                          (
                            type
                          ) => (
                            <option
                              key={
                                type.id
                              }
                              value={
                                type.id
                              }
                            >
                              {
                                type.name
                              }
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div className="leave-form-group">

                      <label>
                        From
                      </label>

                      <input
                        type="date"
                        value={
                          form.from
                        }
                        onChange={(e) =>
                          setForm(
                            (p) => ({
                              ...p,
                              from:
                                e.target
                                  .value,
                            })
                          )
                        }
                      />

                    </div>

                    <div className="leave-form-group">

                      <label>
                        To
                      </label>

                      <input
                        type="date"
                        value={
                          form.to
                        }
                        onChange={(e) =>
                          setForm(
                            (p) => ({
                              ...p,
                              to:
                                e.target
                                  .value,
                            })
                          )
                        }
                      />

                    </div>

                    <div className="leave-form-group">

                      <label>
                        Leave Type
                      </label>

                      <select
                        value={
                          form.leaveType
                        }
                        onChange={(e) =>
                          setForm(
                            (p) => ({
                              ...p,
                              leaveType:
                                e.target
                                  .value as LeaveTypeOption,
                            })
                          )
                        }
                      >

                        <option value="">
                          Select
                        </option>

                        <option value="Full Day">
                          Full Day
                        </option>

                        <option value="First Half">
                          First Half
                        </option>

                        <option value="Second Half">
                          Second Half
                        </option>

                      </select>

                    </div>

                    <div className="leave-form-group">

                      <label>
                        No of Days
                      </label>

                      <input
                        type="text"
                        value={
                          form.noOfDays
                        }
                        readOnly
                      />

                    </div>

                    <div className="leave-form-group leave-form-full">

                      <label>
                        Reason
                      </label>

                      <textarea
                        value={
                          form.reason
                        }
                        onChange={(e) =>
                          setForm(
                            (p) => ({
                              ...p,
                              reason:
                                e.target
                                  .value,
                            })
                          )
                        }
                      />

                    </div>

                  </div>

                </div>

                <div className="leave-modal-footer">

                  <button
                    type="button"
                    className="leave-modal-cancel"
                    onClick={() => {
                      setEditOpen(
                        false
                      );

                      setActiveLeave(
                        null
                      );
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="leave-modal-save"
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      {/* =====================================================
          DELETE LEAVE MODAL
      ===================================================== */}

      {deleteOpen && (
        <div className="leave-modal-overlay">

          <div className="leave-delete-modal">

            <div className="leave-delete-icon">
              <Trash2
                size={31}
              />
            </div>

            <h3>
              Confirm Delete
            </h3>

            <p>
              You want to delete all
              the marked items, this
              cant be undone once you
              delete.
            </p>

            <div className="leave-delete-actions">

              <button
                type="button"
                className="leave-delete-cancel"
                onClick={() => {
                  setDeleteOpen(
                    false
                  );

                  setDeleteId(
                    null
                  );
                }}
                disabled={
                  deleting
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="leave-delete-confirm"
                onClick={
                  handleDelete
                }
                disabled={
                  deleting
                }
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
};

export default Leaves;