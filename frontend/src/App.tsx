import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

import { AccessGuardProvider } from "@/context/AccessGuardContext";

export const App: React.FC = () => {
  return (
    <AccessGuardProvider>
      <RouterProvider router={router} />
    </AccessGuardProvider>
  );
};

export default App;
