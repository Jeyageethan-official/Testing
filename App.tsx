import React, { useState, useEffect } from 'react';
import FileUploader from './components/FileUploader';
import ProjectConfigForm from './components/ProjectConfigForm';
import InfoPanel from './components/InfoPanel';
import { AppConfig, FileWithContent, ConversionStatus } from './types';
import { analyzeProject } from './services/geminiService';
import { generateAndDownloadZip } from './services/zipService';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileWithContent[]>([]);
  const [status, setStatus] = useState<ConversionStatus>(ConversionStatus.IDLE);
  const [config, setConfig] = useState<AppConfig>({
    appName: '',
    bundleId: 'com.example.webapp',
    version: '1.0.0',
    orientation: 'portrait',
    statusBarHidden: false
  });
  const [aiMessage, setAiMessage] = useState<string>('');
  
  // Auth state
  const [isKeyReady, setIsKeyReady] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState<boolean>(true);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setIsKeyReady(hasKey);
        } catch (e) {
          console.error("Error checking API key:", e);
          setIsKeyReady(false);
        }
      } else {
        // Not in AI Studio environment, assume env var is set or handled elsewhere
        setIsKeyReady(true);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleConnect = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Optimistically assume success to handle race conditions
        setIsKeyReady(true);
      } catch (e) {
        console.error("Key selection failed:", e);
        // Force re-check or user can try again
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeyReady(hasKey);
      }
    }
  };

  const handleFilesSelected = async (uploadedFiles: FileWithContent[]) => {
    setFiles(uploadedFiles);
    
    // Find index.html to analyze
    const indexFile = uploadedFiles.find(f => f.name.toLowerCase() === 'index.html');
    if (indexFile) {
        setStatus(ConversionStatus.ANALYZING);
        try {
            const textContent = await indexFile.content.text();
            const analysis = await analyzeProject(textContent);
            
            setConfig(prev => ({
                ...prev,
                appName: analysis.suggestedName.replace(/ /g, ''), // Ensure no spaces for safe simple filenames
                bundleId: `com.web2app.${analysis.suggestedName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            }));
            setAiMessage(`AI Suggestion: "${analysis.description}"`);
        } catch (e) {
            console.error(e);
        } finally {
            setStatus(ConversionStatus.IDLE);
        }
    } else {
        alert("Warning: No index.html found in the root. The app might not load correctly.");
    }
  };

  const handleConvert = async () => {
    if (!config.appName) {
        alert("Please enter an App Name");
        return;
    }

    try {
        setStatus(ConversionStatus.COMPRESSING);
        await generateAndDownloadZip(config, files);
        setStatus(ConversionStatus.READY);
        setTimeout(() => setStatus(ConversionStatus.IDLE), 3000);
    } catch (e) {
        console.error(e);
        alert("Failed to generate project");
        setStatus(ConversionStatus.ERROR);
    }
  };

  const handleReset = () => {
      setFiles([]);
      setConfig(prev => ({ ...prev, appName: '' }));
      setAiMessage('');
      setStatus(ConversionStatus.IDLE);
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
           <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
           <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!isKeyReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                <i className="fab fa-apple text-3xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Web2App Converter</h1>
            <p className="text-gray-600 mb-8">
                Connect your Google AI Key to enable intelligent project analysis and automatic configuration.
            </p>
            <button 
                onClick={handleConnect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-md flex items-center justify-center space-x-2"
            >
                <i className="fas fa-key"></i>
                <span>Sign In with API Key</span>
            </button>
            <p className="text-xs text-gray-400 mt-6">
                Requires a valid Gemini API Key for AI features.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 animate-fade-in">
      {/* Header */}
      <header className="bg-black text-white py-6 shadow-md">
        <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center">
                    <i className="fab fa-apple text-xl"></i>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Web2App</h1>
                    <p className="text-xs text-gray-400">HTML to iOS Converter</p>
                </div>
            </div>
            <a href="https://developer.apple.com" target="_blank" rel="noreferrer" className="text-sm hover:text-blue-400 transition-colors">
                Apple Developer Docs <i className="fas fa-external-link-alt ml-1"></i>
            </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 mt-10 max-w-4xl">
        
        {files.length === 0 ? (
           <div className="space-y-6">
               <div className="text-center mb-10">
                   <h2 className="text-3xl font-bold text-gray-900 mb-4">Turn your Website into an iOS App</h2>
                   <p className="text-gray-600 max-w-xl mx-auto">
                       Upload your web project folder. We'll wrap it in a native high-performance WKWebView, add the necessary Swift code, and package it into an Xcode project ready for the App Store.
                   </p>
               </div>
               <FileUploader onFilesSelected={handleFilesSelected} />
           </div>
        ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-full text-green-600">
                             <i className="fas fa-check"></i>
                        </div>
                        <div>
                             <h3 className="font-bold text-gray-800">{files.length} Files Loaded</h3>
                             <p className="text-sm text-gray-500">{files.find(f => f.name === 'index.html') ? 'index.html detected' : 'No index.html found'}</p>
                        </div>
                    </div>
                    <button onClick={handleReset} className="text-sm text-red-500 hover:text-red-700 font-medium">
                        Change Files
                    </button>
                </div>

                <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">App Configuration</h3>
                    
                    {aiMessage && (
                        <div className="mb-6 bg-purple-50 border border-purple-100 p-4 rounded-lg flex items-start space-x-3">
                             <i className="fas fa-sparkles text-purple-500 mt-1"></i>
                             <p className="text-sm text-purple-800">{aiMessage}</p>
                        </div>
                    )}

                    <ProjectConfigForm 
                        config={config} 
                        onChange={setConfig} 
                        isAnalyzing={status === ConversionStatus.ANALYZING} 
                    />

                    <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleConvert}
                            disabled={status !== ConversionStatus.IDLE || !config.appName}
                            className={`
                                flex items-center space-x-2 px-8 py-4 rounded-xl font-bold text-white transition-all transform hover:scale-105
                                ${status === ConversionStatus.COMPRESSING ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'}
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            {status === ConversionStatus.ANALYZING && (
                                <>
                                    <i className="fas fa-circle-notch fa-spin"></i>
                                    <span>Analyzing Content...</span>
                                </>
                            )}
                             {status === ConversionStatus.COMPRESSING && (
                                <>
                                    <i className="fas fa-cog fa-spin"></i>
                                    <span>Building Xcode Project...</span>
                                </>
                            )}
                            {status === ConversionStatus.IDLE && (
                                <>
                                    <i className="fab fa-apple"></i>
                                    <span>Download iOS Project (.zip)</span>
                                </>
                            )}
                             {status === ConversionStatus.READY && (
                                <>
                                    <i className="fas fa-check"></i>
                                    <span>Download Started!</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

        <InfoPanel />

      </main>
    </div>
  );
};

export default App;