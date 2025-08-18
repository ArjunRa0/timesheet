import React, { useState, useEffect, useMemo } from 'react';

// A simple utility to format date as YYYY-MM-DD
const formatDateForInput = (date) => {
  if (!date) return '';
  // Handles both Date objects and string dates
  const d = new Date(date);
  // Adjust for timezone offset to prevent date from changing
  const adjustedDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset()*60000))
  return adjustedDate.toISOString().split('T')[0];
};

const AddEntryCard = ({ onSave, editingEntry, setEditingEntry }) => {
  const [formData, setFormData] = useState({
    project: '',
    task_description: '',
    entry_date: formatDateForInput(new Date()),
    start_time: '',
    end_time: '',
  });
  const [formError, setFormError] = useState('');

  const isEditing = useMemo(() => !!editingEntry, [editingEntry]);

  useEffect(() => {
    setFormError(''); // Clear errors when mode changes
    if (isEditing) {
      setFormData({
        project: editingEntry.project || '',
        task_description: editingEntry.task_description || '',
        entry_date: formatDateForInput(editingEntry.entry_date) || '',
        start_time: editingEntry.start_time || '',
        end_time: editingEntry.end_time || '',
      });
    } else {
      // Reset form when not editing or after saving
      setFormData({
        project: '',
        task_description: '',
        entry_date: formatDateForInput(new Date()),
        start_time: '',
        end_time: '',
      });
    }
  }, [editingEntry, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.project || !formData.entry_date || !formData.start_time || !formData.end_time) {
      setFormError('Please fill in all required fields: Date, Project, Start Time, and End Time.');
      return;
    }
    onSave(formData, editingEntry ? editingEntry.id : null);
  };

  const handleCancel = () => {
    setEditingEntry(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {isEditing ? 'Edit Entry' : 'Add New Entry'}
      </h2>
      
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          {formError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <label htmlFor="entry_date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="entry_date"
            id="entry_date"
            value={formData.entry_date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="lg:col-span-2">
          <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <input
            type="text"
            name="project"
            id="project"
            placeholder="e.g., Website Redesign"
            value={formData.project}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label htmlFor="task_description" className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
          <textarea
            name="task_description"
            id="task_description"
            rows="2"
            placeholder="e.g., Developed the main landing page components"
            value={formData.task_description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            name="start_time"
            id="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            name="end_time"
            id="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-end md:col-span-2 lg:col-span-1">
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {isEditing ? 'Update Entry' : 'Save Entry'}
          </button>
          {isEditing && (
            <button 
              type="button" 
              onClick={handleCancel} 
              className="w-full ml-3 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddEntryCard;
