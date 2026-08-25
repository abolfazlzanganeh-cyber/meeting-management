import React from 'react';
import { useParams } from 'react-router-dom';

export function MeetingDetail() {
  const { id } = useParams();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">جزئیات جلسه</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">شناسه جلسه: {id}</p>
        <p className="text-gray-600 mt-2">این بخش در حال توسعه است...</p>
      </div>
    </div>
  );
}