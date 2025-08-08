const LoadingSpinner = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
            <div className="flex items-center justify-center space-x-3">
                {/* Spinner 1: Dashed */}
                <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-600"></div>
                
                {/* Spinner 2: Pulsing */}
                <div className="w-12 h-12 border-4 border-solid rounded-full animate-pulse border-blue-600"></div>
                
                {/* Spinner 3: Dotted */}
                <div className="w-12 h-12 border-4 border-dotted rounded-full animate-spin border-blue-600"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-slate-600">Loading application...</p>
        </div>
    );
};

export default LoadingSpinner;