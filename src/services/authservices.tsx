import api from "./api";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: number;
}

export interface LoginPayload {
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

// Registration API
export const registerUser = async (
  payload: RegisterPayload
) => {
  const response = await api.post(
    "/Account/registration",
    payload
  );

  return response.data;
};

// Login API
export const loginUser = async (
  payload: LoginPayload
) => {
  const response = await api.post(
    "/Account/login",
    payload
  );

  return response.data;
};

// FORGOT PASSWORD
export interface ForgotPasswordPayload {
  email: string;
}

export const forgotPassword = async (
  payload: ForgotPasswordPayload
) => {
  const response = await api.post(
    "/Account/forgot-password",
    payload
  );

  return response.data;
};


//RESET PASSWORD

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
}

export const resetPassword = async (
  payload: ResetPasswordPayload
) => {
  const response = await api.post(
    "/Account/reset-password",
    payload
  );

  return response.data;
};