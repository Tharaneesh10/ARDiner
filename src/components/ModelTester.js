// src/components/ModelTester.js
import React, { useState } from 'react';

const ModelTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const testModels = async () => {
    setTesting(true);
    const models = [
      '/models/pizza.glb',
      '/models/burgur.glb',
      '/models/momos.glb',
      '/models/noodles.glb',
      '/models/fries1.glb',
      '/models/sandwich.glb',
      '/models/cake.glb',
      '/models/ice.glb',
      '/models/milkshake.glb',
      '/models/coffee.glb'
    ];

    const results = [];

    for (const model of models) {
      try {
        const startTime = Date.now();
        const response = await fetch(model);
        
        if (response.ok) {
          const contentLength = response.headers.get('content-length');
          const blob = await response.blob();
          const endTime = Date.now();
          const loadTime = endTime - startTime;
          
          results.push({
            model,
            status: '✅ EXISTS',
            size: `${Math.round(blob.size / 1024)} KB`,
            loadTime: `${loadTime}ms`,
            type: blob.type,
            details: `Loaded successfully - ${contentLength ? `${Math.round(contentLength / 1024)} KB` : 'size unknown'}`
          });
        } else {
          results.push({
            model,
            status: '❌ MISSING',
            size: '0 KB',
            loadTime: '0ms',
            type: 'N/A',
            details: `HTTP Status: ${response.status} ${response.statusText}`
          });
        }
      } catch (error) {
        results.push({
          model,
          status: '❌ ERROR',
          size: '0 KB',
          loadTime: '0ms',
          type: 'N/A',
          details: `Network Error: ${error.message}`
        });
      }
    }

    setTestResults(results);
    setTesting(false);
  };

  const testSingleModel = async (modelPath) => {
    try {
      const response = await fetch(modelPath);
      if (response.ok) {
        const blob = await response.blob();
        console.log(`Model ${modelPath}:`, {
          size: blob.size,
          type: blob.type,
          url: URL.createObjectURL(blob)
        });
        
        // Try to create a model-viewer with this blob URL
        const blobUrl = URL.createObjectURL(blob);
        return { success: true, blobUrl, size: blob.size };
      }
      return { success: false, error: `HTTP ${response.status}` };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🔍 Model File Accessibility Test</h2>
      <p>Testing if your GLB files are actually accessible from the web server...</p>
      
      <button 
        onClick={testModels}
        disabled={testing}
        style={{
          padding: '10px 20px',
          backgroundColor: testing ? '#ccc' : '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: testing ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {testing ? 'Testing...' : 'Test All Models'}
      </button>

      <div>
        {testResults.map((result, index) => (
          <div key={index} style={{ 
            margin: '10px 0',
            padding: '15px',
            border: `2px solid ${result.status.includes('✅') ? '#4CAF50' : '#f44336'}`,
            borderRadius: '8px',
            background: result.status.includes('✅') ? '#f1f8e9' : '#ffebee'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <strong style={{ 
                color: result.status.includes('✅') ? '#2e7d32' : '#c62828',
                fontFamily: 'monospace'
              }}>
                {result.status} {result.model}
              </strong>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {result.size} • {result.loadTime}
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#555' }}>
              <strong>Type:</strong> {result.type} • <strong>Details:</strong> {result.details}
            </div>
            
            {result.status.includes('✅') && (
              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={async () => {
                    const testResult = await testSingleModel(result.model);
                    if (testResult.success) {
                      alert(`Model loaded successfully!\nSize: ${testResult.size} bytes\nBlob URL created. Check console for details.`);
                    } else {
                      alert(`Failed to load model: ${testResult.error}`);
                    }
                  }}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Test Detailed Load
                </button>
                
                {/* Direct link to test the model */}
                <a 
                  href={result.model}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginLeft: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '3px',
                    fontSize: '12px',
                    display: 'inline-block'
                  }}
                >
                  Open Direct Link
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px'
        }}>
          <h3>📊 Test Summary</h3>
          <p>
            Working: {testResults.filter(r => r.status.includes('✅')).length} / {testResults.length}
          </p>
          <p>
            Failing: {testResults.filter(r => !r.status.includes('✅')).length} / {testResults.length}
          </p>
        </div>
      )}

      {/* Manual Test Section */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h3>🧪 Quick Manual Tests</h3>
        <p>Try these direct links to test model loading:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
          {[
            '/models/pizza.glb',
            '/models/burgur.glb',
            '/models/momos.glb'
          ].map(model => (
            <a 
              key={model}
              href={model}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 15px',
                backgroundColor: '#17a2b8',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                fontSize: '14px'
              }}
            >
              Test {model.split('/').pop()}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelTester;