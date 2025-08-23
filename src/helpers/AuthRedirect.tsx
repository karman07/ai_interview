import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userStore } from "@/api/http"; 
import routes from "@/constants/routes";

interface Props {
  children: ReactNode;
}

const AuthRedirect = ({ children }: Props) => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = userStore.get();
    if (user) {
      navigate(routes.dashboard, { replace: true });
    }
  }, []);

  return <>{children}</>;
};

export default AuthRedirect;
