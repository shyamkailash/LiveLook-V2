export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignupCredentials {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
