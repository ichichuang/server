import { createAuthService } from "./authService.js";

export const createServices = () => {
  return {
    auth: createAuthService(),
  };
};

export type Services = ReturnType<typeof createServices>;

