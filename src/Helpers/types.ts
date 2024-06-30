// types.ts
export interface Reservation {
    id: string;
    userId: string;
    userName: string;
    restaurantId: string;
    restaurantName: string;
    time: string;
    status: 'pending' | 'accepted' | 'rejected';
  }
  