
import api from "./api";

export interface AccountantLoginPayload {
  email: string;
  password: string;
  loginDevice: {
    deviceId: string;
    deviceName: string;
    publicIP: string;
    location: string;
  };
  role: number;
}

// ACCOUNTANT LOGIN API
export const accountantLogin = async (
  payload: AccountantLoginPayload
) => {
  const response = await api.post(
    "/Account/login",
    payload
  );

  return response.data;
};
