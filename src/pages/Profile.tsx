import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Package, Clock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import type { Booking } from '../types';

export const Profile = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(`http://localhost:5000/bookings?user_id=${user.id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch bookings');
        setBookings(data);
        console.log('User bookings:', data); // Display bookings in console
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updates: Partial<typeof formData> = {};
    Object.keys(formData).forEach((key) => {
      if (user && formData[key as keyof typeof formData] !== user[key as keyof typeof user]) {
        updates[key as keyof typeof formData] = formData[key as keyof typeof formData];
      }
    });

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      setIsSaving(false);
      console.log("No changes detected in the form data");
      return;
    }

    try {
      console.log("Sending update profile data:", {
        userId: user?.id,
        ...updates,
      });

      const response = await fetch('http://localhost:5000/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...updates,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setUser(data.user);

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: Booking['collection_status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'collected':
        return 'text-blue-600';
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: Booking['collection_status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'collected':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getKrishiBhavanName = (sellerId: string): string => {
    if (!sellerId.startsWith('SL')) return 'Unknown Krishi Bhavan';
    const bhavanNumber = parseInt(sellerId.slice(-2), 10); // Remove 'SL' and parse the number
    return `Krishi Bhavan ${bhavanNumber}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                  <p className="text-gray-600">Manage your account information</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="mt-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium text-gray-800">{user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email Address</p>
                      <p className="font-medium text-gray-800">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Pincode</p>
                      <p className="font-medium text-gray-800">{user?.pincode}</p>
                    </div>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium text-gray-800">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  {user?.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-800">{user.address}</p>
                      </div>
                    </div>
                  )}
                  {user?.sellerId && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Krishi Bhavan</p>
                        <p className="font-medium text-gray-800">{getKrishiBhavanName(user.sellerId)}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

                {/* Order History Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order History</h2>
            
            {loadingBookings ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 text-gray-400 mx-auto animate-spin" />
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              <div className="space-y-6">
                                {bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-800 text-xl">{booking.product_name}</h3>
                          <p className="text-sm text-gray-600">
                            Quantity: {booking.quantity} × ₹{booking.total_amount / booking.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center space-x-3">
                        {getStatusIcon(booking.collection_status)}
                        <span className={`font-medium ${getStatusColor(booking.collection_status)}`}>
                          {booking.collection_status ? booking.collection_status : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Collection Office</p>
                        <p className="font-medium text-gray-800">{booking.krishiBhavan}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Booking Date</p>
                        <p className="font-medium text-gray-800">
                          {booking.booking_date_time ? format(new Date(booking.booking_date_time), "yyyy-MM-dd 'at' HH:mm:ss") : 'Invalid date'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="font-medium text-gray-800">₹{booking.total_amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};