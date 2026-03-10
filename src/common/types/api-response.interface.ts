export interface IUserResponse {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  role: string;
  profileBio?: string;
  profileSkills?: string[];
  profileResume?: string;
  profileResumeOriginalName?: string;
  profilePhoto?: string;
}

export interface IRegisterResponse {
  user: IUserResponse;
}

export interface ILoginResponse extends IUserResponse {
  accessToken: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ITokenPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}
