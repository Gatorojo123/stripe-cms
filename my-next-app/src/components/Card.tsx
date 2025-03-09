import React from 'react';

interface CardProps {
  conv: {
    title: string;
    cover?: { url: string };
    carreras: { title: string }[];
    formacions: { title: string }[];
  };
}

const Card: React.FC<CardProps> = ({ conv }) => (
  <div className="bg-white rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer overflow-hidden">
    {conv.cover && (
      <img
        src={`${process.env.NEXT_PUBLIC_STRAPI_URL}${conv.cover.url}`}
        alt={conv.title}
        className="w-full h-40 object-cover transition duration-300"
      />
    )}
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-3">{conv.title}</h2>
      <div className="space-y-1 text-sm text-gray-700">
        {conv.carreras && conv.carreras.length > 0 && (
          <div className="flex items-center">
            <span className="font-semibold text-gray-800">Carrera:</span>
            <span className="ml-2">{conv.carreras.map(c => c.title).join(', ')}</span>
          </div>
        )}
        {conv.formacions && conv.formacions.length > 0 && (
          <div className="flex items-center">
            <span className="font-semibold text-gray-800">Formación:</span>
            <span className="ml-2">{conv.formacions.map(f => f.title).join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default Card;
