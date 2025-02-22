import React from 'react'
import { PropagateLoader } from 'react-spinners';

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <PropagateLoader color="#54BD95" className="-ml-64" />
    </div>
  );
}
