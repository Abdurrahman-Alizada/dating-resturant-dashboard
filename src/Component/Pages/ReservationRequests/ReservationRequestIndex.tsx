import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../Helpers/Firebase'; // Adjust the import path accordingly
import { Reservation } from '../../../Helpers/types'; // Adjust the import path accordingly

const ReservationList: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      const querySnapshot = await getDocs(collection(db, 'reservations'));
      if (querySnapshot.empty) {
        setReservations(sampleReservations);
      } else {
        const fetchedReservations: Reservation[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Reservation));
        setReservations(fetchedReservations);
      }
    };

    fetchReservations();
  }, []);

  const handleAccept = async (id: string) => {
    const reservationRef = doc(db, 'reservations', id);
    await updateDoc(reservationRef, { status: 'accepted' });
    setReservations(prev => prev.map(res => (res.id === id ? { ...res, status: 'accepted' } : res)));
  };

  const handleReject = async (id: string) => {
    const reservationRef = doc(db, 'reservations', id);
    await updateDoc(reservationRef, { status: 'rejected' });
    setReservations(prev => prev.map(res => (res.id === id ? { ...res, status: 'rejected' } : res)));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reservation Requests</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservations.map(reservation => (
          <div key={reservation.id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">{reservation.restaurantName}</h2>
            <p className="text-gray-700">Requested by: {reservation.userName}</p>
            <p className="text-gray-700">Time: {reservation.time}</p>
            <p className={`text-sm font-medium mt-2 ${reservation.status === 'pending' ? 'text-yellow-500' : reservation.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
              Status: {reservation.status}
            </p>
            {reservation.status === 'pending' && (
              <div className="mt-4 flex justify-between">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  onClick={() => handleAccept(reservation.id)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  onClick={() => handleReject(reservation.id)}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const sampleReservations: Reservation[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    restaurantId: 'restaurant1',
    restaurantName: 'The Great Restaurant',
    time: '2024-07-01T18:30:00Z',
    status: 'pending',
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    restaurantId: 'restaurant2',
    restaurantName: 'Delicious Dishes',
    time: '2024-07-02T19:00:00Z',
    status: 'accepted',
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Alice Johnson',
    restaurantId: 'restaurant3',
    restaurantName: 'Tasty Treats',
    time: '2024-07-03T20:00:00Z',
    status: 'rejected',
  },
];

export default ReservationList;
