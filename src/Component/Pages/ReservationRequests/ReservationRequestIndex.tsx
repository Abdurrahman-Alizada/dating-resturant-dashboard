import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../Helpers/Firebase'; // Adjust the import path accordingly
import { Reservation } from '../../../Helpers/types'; // Adjust the import path accordingly
import moment from 'moment';

const ReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [users, setUsers] = useState<{ [key: string]: { name: string } }>({});

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'reservations'));
      if (querySnapshot.empty) {
        setReservations([]);
      } else {
        const fetchedReservations: Reservation[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Reservation));
        setReservations(fetchedReservations);

        // Fetch user information for each reservation
        const userIds = fetchedReservations.map(res => res.userId);
        const userPromises = userIds.map(id => getDoc(doc(db, 'users', id)));
        const userDocs = await Promise.all(userPromises);
        const usersData: { [key: string]: { name: string } } = {};
        userDocs.forEach(userDoc => {
          if (userDoc.exists()) {
            usersData[userDoc.id] = userDoc.data() as { name: string };
          }
        });
        setUsers(usersData);

        console.log("first", fetchedReservations);
      }
      setLoading(false);
    };

    fetchReservations();
  }, []);

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    const reservationRef = doc(db, 'reservations', id);
    await updateDoc(reservationRef, { status: 'accepted' });
    setReservations(prev => prev.map(res => (res.id === id ? { ...res, status: 'accepted' } : res)));
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    const reservationRef = doc(db, 'reservations', id);
    await updateDoc(reservationRef, { status: 'rejected' });
    setReservations(prev => prev.map(res => (res.id === id ? { ...res, status: 'rejected' } : res)));
    setLoadingId(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Reservation Requests</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Reservation Requests</h1>
        <p>No reservations yet</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reservation Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map(reservation => (
          <div key={reservation.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">{reservation.restaurantName}</h2>
            <p className="text-gray-700">Requested by: {users[reservation.userId]?.name || 'Loading...'}</p>
            <p className="text-gray-700">Date: {moment(reservation.date).format('DD-MM-YYYY')}</p>
            <p className="text-gray-700">Time: {reservation.time}</p>
            <span className="flex items-center mt-2">
              Status
              <p className={`text-sm font-medium ${reservation.status?.toLocaleLowerCase() === 'pending' ? 'text-yellow-500' : reservation.status?.toLocaleLowerCase() === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
                : {reservation.status}
              </p>
            </span>
            {reservation.status?.toLocaleLowerCase() === 'pending' && (
              <div className="mt-4 flex justify-between">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  onClick={() => handleAccept(reservation.id)}
                  disabled={loadingId === reservation.id}
                >
                  {loadingId === reservation.id ? 'Loading...' : 'Accept'}
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  onClick={() => handleReject(reservation.id)}
                  disabled={loadingId === reservation.id}
                >
                  {loadingId === reservation.id ? 'Loading...' : 'Reject'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationList;
