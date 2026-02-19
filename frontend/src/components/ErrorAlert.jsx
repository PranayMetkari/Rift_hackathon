import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorAlert = ({ message }) => {
    if (!message) return null;
    return (
        <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
        </div>
    );
};

export default ErrorAlert;
