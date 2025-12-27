import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MaintenanceRequests from './pages/MaintenanceRequests';
import Equipment from './pages/Equipment';
import EquipmentCategories from './pages/EquipmentCategories';
import MaintenanceTeams from './pages/MaintenanceTeams';
import WorkCenters from './pages/WorkCenters';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <PrivateRoute>
                <Layout>
                  <MaintenanceRequests />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <PrivateRoute>
                <Layout>
                  <Equipment />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/equipment-categories"
            element={
              <PrivateRoute>
                <Layout>
                  <EquipmentCategories />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance-teams"
            element={
              <PrivateRoute>
                <Layout>
                  <MaintenanceTeams />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/work-centers"
            element={
              <PrivateRoute>
                <Layout>
                  <WorkCenters />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Layout>
                  <Reports />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

