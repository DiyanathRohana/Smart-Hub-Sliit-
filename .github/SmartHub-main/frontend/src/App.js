import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Login from './components/Login';
import Register from './components/Register';
import FacilityAssetList from './components/FacilityAssetList';
import FacilityAssetDetail from './components/FacilityAssetDetail';
import AddFacilityAssetEntry from './components/AddFacilityAssetEntry';
import EditFacilityAssetEntry from './components/EditFacilityAssetEntry';
import Notifications from './components/Notifications';
import AdminUserManagement from './components/AdminUserManagement';
import BookingRequestForm from './components/BookingRequestForm';
import MaintenanceTicketCreation from './components/MaintenanceTicketCreation';
import MyMaintenanceTickets from './components/MyMaintenanceTickets';
import AdminMaintenanceTickets from './components/AdminMaintenanceTickets';
import EditProfile from './components/EditProfile';
import MyBookings from './components/MyBookings';
import AdminBookings from './components/AdminBookings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes (without layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All other routes with layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<FacilityAssetList />} />
          <Route path="/facility-assets" element={<FacilityAssetList />} />
          <Route path="/facility-asset/:assetId" element={<FacilityAssetDetail />} />
          <Route path="/add-facility-asset" element={<AddFacilityAssetEntry />} />
          <Route path="/edit-facility-asset/:assetId" element={<EditFacilityAssetEntry />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/book" element={<BookingRequestForm />} />
          <Route path="/maintenance-ticket" element={<MaintenanceTicketCreation />} />
          <Route path="/my-maintenance-tickets" element={<MyMaintenanceTickets />} />
          <Route path="/admin/maintenance-tickets" element={<AdminMaintenanceTickets />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
