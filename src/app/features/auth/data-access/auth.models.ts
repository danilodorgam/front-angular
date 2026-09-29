export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly roles: readonly string[];
}

export interface SignInRequest {
  readonly email: string;
  readonly password: string;
}

export interface SignInResponse {
  readonly token: string;
  readonly user: AuthUser;
}

export interface PasswordRecoveryRequest {
  readonly email: string;
}
