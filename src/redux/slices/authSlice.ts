import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  admin: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
}

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('urban_style_admin_token');
  }
  return null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  admin: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; admin?: AuthState['admin'] }>
    ) => {
      state.token = action.payload.token;
      if (action.payload.admin) {
        state.admin = action.payload.admin;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('urban_style_admin_token', action.payload.token);
      }
    },
    setAdminUser: (state, action: PayloadAction<Required<AuthState['admin']>>) => {
      state.admin = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.admin = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('urban_style_admin_token');
      }
    },
  },
});

export const { setCredentials, setAdminUser, logout } = authSlice.actions;
export default authSlice.reducer;
