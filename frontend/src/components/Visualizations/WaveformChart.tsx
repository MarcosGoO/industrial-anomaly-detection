import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WaveformChartProps {
  data: number[];
  width?: number;
  height?: number;
  title?: string;
  showAxes?: boolean;
  color?: string;
}

export const WaveformChart: React.FC<WaveformChartProps> = ({
  data,
  width = 800,
  height = 300,
  title = 'Vibration Waveform',
  showAxes = true,
  color = '#3b82f6'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Get container dimensions for responsive design
    const containerWidth = containerRef.current?.clientWidth || width;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', height);

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data points
    const dataPoints = data.map((value, index) => ({
      x: index,
      y: value
    }));

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const yExtent = d3.extent(data) as [number, number];
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([innerHeight, 0])
      .nice();

    // Create line generator
    const line = d3.line<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    // Add gradient definition
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'waveform-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.8);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.1);

    // Add area under the curve
    const area = d3.area<{ x: number; y: number }>()
      .x(d => xScale(d.x))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(dataPoints)
      .attr('fill', 'url(#waveform-gradient)')
      .attr('d', area)
      .style('opacity', 0.3);

    // Add the line
    g.append('path')
      .datum(dataPoints)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line)
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');

    if (showAxes) {
      // Add X axis
      const xAxis = d3.axisBottom(xScale)
        .ticks(10)
        .tickFormat(d => `${(d as number / 20).toFixed(2)}s`); // Assuming 20 Hz sampling

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .style('color', '#94a3b8')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '12px');

      // Add X axis label
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 35)
        .style('text-anchor', 'middle')
        .style('fill', '#cbd5e1')
        .style('font-size', '12px')
        .style('font-family', 'Inter, sans-serif')
        .text('Time');

      // Add Y axis
      const yAxis = d3.axisLeft(yScale)
        .ticks(6)
        .tickFormat(d => d3.format('.2f')(d as number));

      g.append('g')
        .call(yAxis)
        .style('color', '#94a3b8')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '12px');

      // Add Y axis label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerHeight / 2)
        .attr('y', -45)
        .style('text-anchor', 'middle')
        .style('fill', '#cbd5e1')
        .style('font-size', '12px')
        .style('font-family', 'Inter, sans-serif')
        .text('Amplitude (g)');

      // Add grid lines
      g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(
          d3.axisLeft(yScale)
            .ticks(6)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .style('stroke', '#94a3b8');
    }

    // Add zero line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', '#475569')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0.5);

  }, [data, width, height, showAxes, color]);

  return (
    <div ref={containerRef} className="w-full">
      {title && (
        <h3 className="section-title mb-4">{title}</h3>
      )}
      <div className="section-card">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
};
