import React from 'react';
import Plot from 'react-plotly.js';

interface SpectrumChartProps {
  frequencies: number[];
  magnitudes: number[];
  width?: number;
  height?: number;
  title?: string;
  showPeaks?: boolean;
  color?: string;
}

export const SpectrumChart: React.FC<SpectrumChartProps> = ({
  frequencies,
  magnitudes,
  width,
  height = 300,
  title = 'Frequency Spectrum',
  showPeaks = true,
  color = '#10b981'
}) => {
  // Find peak frequencies
  const peaks: { freq: number; mag: number }[] = [];
  if (showPeaks && magnitudes.length > 2) {
    for (let i = 1; i < magnitudes.length - 1; i++) {
      if (magnitudes[i] > magnitudes[i - 1] && magnitudes[i] > magnitudes[i + 1]) {
        const threshold = Math.max(...magnitudes) * 0.3;
        if (magnitudes[i] > threshold) {
          peaks.push({ freq: frequencies[i], mag: magnitudes[i] });
        }
      }
    }
    // Sort by magnitude and keep top 3
    peaks.sort((a, b) => b.mag - a.mag);
    peaks.splice(3);
  }

  const traces: any[] = [
    {
      x: frequencies,
      y: magnitudes,
      type: 'scatter',
      mode: 'lines',
      name: 'Spectrum',
      line: {
        color: color,
        width: 2
      },
      fill: 'tozeroy',
      fillcolor: `${color}33`,
      hovertemplate: 'Frequency: %{x:.2f} Hz<br>Magnitude: %{y:.4f}<extra></extra>'
    }
  ];

  // Add peak markers
  if (showPeaks && peaks.length > 0) {
    traces.push({
      x: peaks.map(p => p.freq),
      y: peaks.map(p => p.mag),
      type: 'scatter',
      mode: 'markers+text',
      name: 'Peaks',
      marker: {
        color: '#ef4444',
        size: 10,
        symbol: 'diamond',
        line: {
          color: '#ffffff',
          width: 2
        }
      },
      text: peaks.map(p => `${p.freq.toFixed(1)} Hz`),
      textposition: 'top center',
      textfont: {
        family: 'JetBrains Mono, monospace',
        size: 10,
        color: '#ef4444'
      },
      hovertemplate: 'Peak at %{x:.2f} Hz<br>Magnitude: %{y:.4f}<extra></extra>'
    });
  }

  const layout = {
    autosize: true,
    height: height,
    margin: {
      l: 60,
      r: 30,
      t: 10,
      b: 50
    },
    paper_bgcolor: 'rgba(30, 41, 59, 0.8)',
    plot_bgcolor: 'rgba(15, 23, 42, 0.5)',
    xaxis: {
      title: {
        text: 'Frequency (Hz)',
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          color: '#cbd5e1'
        }
      },
      gridcolor: 'rgba(148, 163, 184, 0.1)',
      zerolinecolor: 'rgba(71, 85, 105, 0.5)',
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 10,
        color: '#94a3b8'
      },
      showgrid: true,
      zeroline: true
    },
    yaxis: {
      title: {
        text: 'Magnitude',
        font: {
          family: 'Inter, sans-serif',
          size: 12,
          color: '#cbd5e1'
        }
      },
      gridcolor: 'rgba(148, 163, 184, 0.1)',
      zerolinecolor: 'rgba(71, 85, 105, 0.5)',
      tickfont: {
        family: 'JetBrains Mono, monospace',
        size: 10,
        color: '#94a3b8'
      },
      showgrid: true,
      zeroline: false
    },
    showlegend: false,
    hovermode: 'closest',
    hoverlabel: {
      bgcolor: 'rgba(15, 23, 42, 0.95)',
      bordercolor: 'rgba(51, 65, 85, 0.8)',
      font: {
        family: 'JetBrains Mono, monospace',
        size: 11,
        color: '#e2e8f0'
      }
    }
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="section-title mb-4">{title}</h3>
      )}
      <div className="section-card">
        <Plot
          data={traces}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler={true}
        />
      </div>
    </div>
  );
};
