import React from 'react';

// A simple utility to format date as YYYY-MM-DD
const formatDateForInput = (date) => {
  if (!date) return '';
  // Handles both Date objects and string dates
  const d = new Date(date);
  // Adjust for timezone offset to prevent date from changing
  const adjustedDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset()*60000))
  return adjustedDate.toISOString().split('T')[0];
};

// Memoized for performance, re-renders only when its props change
const TimesheetEntry = React.memo(({ entry, onEdit, onDelete }) => {
  // The duration is now calculated by the backend and passed as `duration_hours`.
  // We just need to format it for display.
  const formattedDuration = entry.duration_hours 
    ? parseFloat(entry.duration_hours).toFixed(2) + ' hrs' 
    : 'N/A';

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
      <td className="py-3 px-4 text-sm text-gray-700">{formatDateForInput(entry.entry_date)}</td>
      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{entry.project}</td>
      <td className="py-3 px-4 text-sm text-gray-600 max-w-sm truncate" title={entry.task_description}>{entry.task_description}</td>
      <td className="py-3 px-4 text-sm text-gray-700 font-mono">{entry.start_time}</td>
      <td className="py-3 px-4 text-sm text-gray-700 font-mono">{entry.end_time}</td>
      <td className="py-3 px-4 text-sm text-gray-800 font-semibold">{formattedDuration}</td>
      <td className="py-3 px-4 text-sm text-center">
        <button
          onClick={() => onEdit(entry)}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-xs mr-2"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(entry.id)}
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all text-xs"
        >
          Delete
        </button>
      </td>
    </tr>
  );
});

const EntriesTableCard = ({ entries, isLoading, error, onEdit, onDelete }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-800 p-4 border-b">Logged Entries</h2>
      
      {isLoading && (
        <div className="p-4 text-center text-gray-600">Loading entries...</div>
      )}
      
      {error && (
        <div className="p-4 text-center text-red-600 bg-red-100 rounded-b-lg">{error}</div>
      )}
      
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {entries.length > 0 ? (
                entries.map(entry => (
                  <TimesheetEntry key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} />
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">No entries yet. Add one above!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EntriesTableCard; 