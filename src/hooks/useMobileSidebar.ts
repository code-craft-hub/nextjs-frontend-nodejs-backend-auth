import { create } from "zustand";


type MobileSidebarStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

type childSideBarActiveStore = {
  isOpen: boolean;
  onOpen: (value: any) => void;
  onClose: (value: any) => void;
};

export const useMobileSidebar = create<MobileSidebarStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export const childState = create<childSideBarActiveStore>((set) => ({
  isOpen: false,
  onOpen: (value) => set({ isOpen: value }),
  onClose: (value) => set({ isOpen: value }),
}));
