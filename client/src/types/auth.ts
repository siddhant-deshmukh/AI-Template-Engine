import type createStore from "polotno/model/store";

export type User = {
  email: string;
  name: string;
};

export type DesignTemplate = 'DesignTemplate';
export type Design = 'Design';
export type DesignMode = DesignTemplate | Design;

export type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  designMode: DesignMode;
  setDesignMode: (mode: DesignMode) => void;
  storeRef: React.RefObject<ReturnType<typeof createStore> | null>;
  polotnoMounted: "mounted" | "loading" | null;
  setPolonoMounted: React.Dispatch<React.SetStateAction<"mounted" | "loading" | null>>
};