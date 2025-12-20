"use client";

import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const logout = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      await AuthService.logout(token);
    }

    localStorage.clear();
    router.push("/login");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
