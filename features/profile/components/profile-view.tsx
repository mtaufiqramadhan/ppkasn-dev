"use client";

import React from "react";
import { ProfileOrgStructure } from "./profile-org-structure";
import { ProfileStrategicPolicy } from "./profile-strategic-policy";

export function ProfileView() {
  return (
    <div className="w-full leading-loose">
      <ProfileOrgStructure />
      <ProfileStrategicPolicy />
    </div>
  );
}
