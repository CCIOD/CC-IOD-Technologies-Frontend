import React from 'react';

interface IObservation {
  date: string;
  observation: string;
}

interface ObservationsListProps {
  observations: IObservation[];
}

export const ObservationsList: React.FC<ObservationsListProps> = ({ observations }) => {
  if (!observations || observations.length === 0) {
    return (
      <div className="text-gray-500 italic">
        No hay observaciones registradas
      </div>
    );
  }

  // Ordenar observaciones por fecha (más reciente primero)
  const sortedObservations = [...observations].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedObservations.map((obs, index) => (
        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r-md">
          <div className="text-sm text-gray-600 mb-1">
            {new Date(obs.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <div className="text-gray-800 whitespace-pre-wrap">
            {obs.observation}
          </div>
        </div>
      ))}
    </div>
  );
};
