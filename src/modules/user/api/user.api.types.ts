import type { IUser } from "@/types";

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoUrl?: string;
  phoneNumber?: string;
  countryCode?: string;
  country?: string;
  state?: string;
}

export type { IUser };
