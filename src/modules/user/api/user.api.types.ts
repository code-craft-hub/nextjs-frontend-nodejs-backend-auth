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

export interface IRecentUser {
  id: string;
  email: string;
  role: string;
  accountStatus: string;
  accountTier: string;
  createdAt: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  photoUrl: string | null;
}

export interface IUserLookup {
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  accountStatus: string;
  accountTier: string;
  role: string;
  emailVerified: boolean;
}
