import type { Metadata } from "next";
import { EditProfileClient } from "./EditProfileClient";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Edit your GetWired.dev profile",
};

export default function EditProfilePage() {
  return <EditProfileClient />;
}

