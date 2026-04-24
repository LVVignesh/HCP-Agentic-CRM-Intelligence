import React from 'react';
import FormComponent from './components/FormComponent';
import ChatComponent from './components/ChatComponent';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-white font-bold text-lg leading-none">+</span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">HCP Connect</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-500">Log Interaction</span>
            <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Rep&background=0D8ABC&color=fff" alt="User" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">New Interaction Record</h2>
          <p className="text-slate-500 mt-1">Describe your meeting or fill out the form manually.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-220px)] min-h-[600px]">
          {/* Form Side */}
          <div className="lg:col-span-7 h-full">
            <FormComponent />
          </div>
          
          {/* Chat Side */}
          <div className="lg:col-span-5 h-full">
            <ChatComponent />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
