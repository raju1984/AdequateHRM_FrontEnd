import axios from "axios";

const BASE_URL =
  "http://jupiterapi.adequateshop.com/api";

/* =====================================================
   EMPLOYEE PROFILE
===================================================== */

// GET PROFILE
export const getEmployeeProfile = async (
  id: string,
  token: string
) => {
  const response = await axios.get(
    `${BASE_URL}/Profile/Get-Employee`,
    {
      params: {
        Id: id,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.data;
};

// UPDATE PROFILE
export const updateEmployeeProfile = async (
  data: any,
  token: string
) => {
  return axios.put(
    `${BASE_URL}/Profile/Profile-Update`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/* =====================================================
   HOLIDAY
===================================================== */

export const getHolidays = async (
  token: string
) => {
  return axios.get(
    `${BASE_URL}/Holiday/get-holiday`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/* =====================================================
   GET ALL EMPLOYEES
===================================================== */

export const getAllEmployees = async () => {
  const token =
    localStorage.getItem("token");

  const response = await axios.get(
    `${BASE_URL}/Employee/GetAll-Employees`,
    {
      params: {
        PageNumber: 1,
        PageSize: 100,
      },

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/* =====================================================
   ADD EMPLOYEE
===================================================== */

export const addEmployee = async (
  data: FormData
) => {
  const token =
    localStorage.getItem("token");

  const response = await axios.post(
    `${BASE_URL}/Employee/Add-Employee`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

/* =====================================================
   GET DESIGNATIONS
   We use this API for both:
   Department dropdown
   Designation dropdown
===================================================== */

export const getDesignations = async () => {
  const token =
    localStorage.getItem("token");

  const response = await axios.post(
    `${BASE_URL}/Designation/Get-Designation`,

    {
      pageNumber: 1,
      pageSize: 100,
    },

    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};