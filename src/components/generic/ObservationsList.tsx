import { FC } from "react";
import { IObservation } from "../../interfaces/prospects.interface";
import { IClientObservation } from "../../interfaces/clients.interface";
import { formatDate } from "../../utils/format";

type Props = {
  observations: IObservation[] | IClientObservation[];
};

export const ObservationsList: FC<Props> = ({ observations }) => {
  if (!observations || observations.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-4">
        No hay observaciones registradas
      </div>
    );
  }

  // Ordenar observaciones por fecha (más reciente primero)
  const sortedObservations = [...observations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
        Historial de Observaciones ({observations.length})
      </h3>
      {sortedObservations.map((observation, index) => (
        <div
          key={index}
          className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Observación #{sortedObservations.length - index}
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {formatDate(observation.date)}
            </span>
          </div>
          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {observation.observation}
          </p>
        </div>
      ))}
    </div>
  );
};
