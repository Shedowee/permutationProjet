import React from "react";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Cog6ToothIcon className="w-6 h-6 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        </div>
        <Card className="p-6">
          <p className="text-gray-300">
            Page de paramètres administrateur. Vous pourrez configurer les paramètres globaux ici.
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
