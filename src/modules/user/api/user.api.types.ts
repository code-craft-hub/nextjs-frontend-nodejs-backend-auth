import type { IUser } from "@/types";

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UpdateUserData<T = never> {
  data?: Partial<T>;
}

export type { IUser };
