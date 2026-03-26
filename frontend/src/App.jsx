import React, { useState, useMemo } from 'react'
import { useListSpeciesQuery, usePredictMutation, useRecommendQuery } from './app/services.js'

export default function App() {
  const { data: species = [], isLoading: loadingSpecies } = useListSpeciesQuery()
  const [predict, { data: pred, isLoading: loadingPredict, error: predErr }] = usePredictMutation()

  const [file, setFile] = useState(null)
  const [lat, setLat] = useState(23.25)
  const [lon, setLon] = useState(77.41)

  const top = pred?.predictions?.[0]?.label || null
  const { data: rec, isFetching: loadingRec, error: recErr, refetch } =
    useRecommendQuery({ lat, lon, species: top ?? 'tench' }, { skip: !top })

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  const handlePredict = async () => {
    if (!file) return
    try {
      await predict(file).unwrap()
    } catch (e) {}
  }

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <header>
          <h1>🐟 FinAlogica</h1>
          <p>Next-gen AI fish identification & local weather insights</p>
        </header>

        <main>
          {/* Section 1: Upload & Predict */}
          <section className="card">
            <h3>
              <span className="status-badge">Step 1</span>
              Identification Engine
            </h3>

            <div className="grid-2">
              <div className="upload-controls">
                <div className="input-container">
                  <label className="input-label">Select Catch Photo</label>
                  
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="fish-upload"
                      className="file-input-native"
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="file-input-custom">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {file ? 'Change Photo' : 'Click or Drag to Upload'}
                    </div>
                  </div>

                  {file && (
                    <div className="file-name-overlay">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {file.name}
                    </div>
                  )}
                </div>
                
                <button
                  className="btn btn-primary"
                  disabled={!file || loadingPredict}
                  onClick={handlePredict}
                >
                  {loadingPredict ? (
                    <span className="animate-pulse">Analyzing catch...</span>
                  ) : (
                    <>🔍 Identify Fish</>
                  )}
                </button>

                {predErr && (
                  <div className="error-msg">
                    <strong>Connection Error:</strong> {predErr.data?.details || "The ML service is currently waking up. Please try again in 5-10 seconds."}
                  </div>
                )}
              </div>

              <div className="preview-container">
                <div className="preview-box">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '2rem', margin: 0 }}>📸</p>
                      <p>Image preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {pred && (
              <div style={{ marginTop: 32 }}>
                <h4 style={{ marginBottom: 12 }}>Detection Results</h4>
                <div className="result-box">
                  <pre style={{ margin: 0 }}>{JSON.stringify(pred, null, 2)}</pre>
                </div>
                <div style={{ marginTop: 16, fontSize: '1.1rem' }}>
                  Identified as: <strong style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary-glass)' }}>{top}</strong>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Recommendations */}
          <section className="card" style={{ opacity: !top ? 0.7 : 1 }}>
            <h3>
              <span className="status-badge">Step 2</span>
              Angler Insights
            </h3>
            
            {!top && (
              <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
                💡 Complete Step 1 to unlock location-aware fishing advice.
              </p>
            )}

            <div className="grid-2" style={{ marginBottom: 24 }}>
              <div className="input-container">
                <label className="input-label">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value || '0'))}
                  disabled={!top}
                />
              </div>
              <div className="input-container">
                <label className="input-label">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lon}
                  onChange={(e) => setLon(parseFloat(e.target.value || '0'))}
                  disabled={!top}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              disabled={!top || loadingRec}
              onClick={() => refetch()}
            >
              {loadingRec ? (
                <span className="animate-pulse">Fetching weather data...</span>
              ) : (
                <>🎣 Get Fishing Advice</>
              )}
            </button>

            {recErr && (
              <div className="error-msg">
                Failed to fetch weather insights. Please verify your connection.
              </div>
            )}

            {rec && (
              <div style={{ marginTop: 32 }}>
                <h4 style={{ marginBottom: 12 }}>Recommended Strategy</h4>
                <div className="result-box" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a)' }}>
                  <pre style={{ margin: 0 }}>{JSON.stringify(rec, null, 2)}</pre>
                </div>
              </div>
            )}
          </section>

          {/* Section 3: Catalog */}
          <section className="card">
            <h3>📖 Species Library</h3>
            {loadingSpecies ? (
              <div className="animate-pulse">Fetching catalog...</div>
            ) : (
              <div className="species-list">
                {species.map(s => (
                  <div key={s.id} className="species-item">
                    <strong>{s.common_name}</strong>
                    <span>{s.scientific_name}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <footer>
          <div>FinAlogica Cloud Platform &copy; 2026</div>
          <div style={{ marginTop: 8, fontSize: '0.75rem', opacity: 0.7 }}>
            API: {import.meta.env.VITE_API_URL || 'Local Environment'} &nbsp;|&nbsp; Engine: Render Cloud Compute
          </div>
        </footer>
      </div>
    </div>
  )
}
