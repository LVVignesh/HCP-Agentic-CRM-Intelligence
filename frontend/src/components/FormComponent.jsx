import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField } from '../features/interactionSlice';

const FormComponent = () => {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.interaction);

  const handleChange = (e) => {
    dispatch(updateFormField({ field: e.target.name, value: e.target.value }));
  };

  return (
    <div className="font-sans bg-white shadow-sm rounded-xl p-6 border border-gray-100 h-full">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Interaction Details
      </h2>
      <form className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HCP Name</label>
          <input
            type="text"
            name="hcpName"
            value={formData.hcpName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none"
            placeholder="Dr. Jane Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Discussed</label>
          <input
            type="text"
            name="productDiscussed"
            value={formData.productDiscussed}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none"
            placeholder="e.g. CardioMax 50mg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Outcome / Next Steps</label>
          <textarea
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow outline-none resize-none"
            placeholder="Summarize the meeting outcome..."
          ></textarea>
        </div>
        
        <button
          type="button"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm mt-4"
        >
          Save Interaction
        </button>
      </form>
    </div>
  );
};

export default FormComponent;
