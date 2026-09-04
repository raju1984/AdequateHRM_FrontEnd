import axios from "axios";

const API_URL = "http://jupiterapi.adequateshop.com/api/Profile";

// GET PROFILE
export const getEmployeeProfile = async (
  id: string,
  token: string
) => {
  const response = await axios.get(
    `${API_URL}/Get-Employee`,
    {
      params: { Id: id },
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
    `${API_URL}/Profile-Update`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};