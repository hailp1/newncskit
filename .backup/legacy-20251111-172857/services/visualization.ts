/**
 * Advanced Visualization Service for Statistical Analysis
 * Provides publication-ready charts and interactive visualizations
 */

import * as d3 from 'd3';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AnalysisResult } from '@/types/analysis';

Chart.register(...registerables);

export interface VisualizationConfig {
  width: number;
  height: number;
  dpi: number;
  format: 'svg' | 'png' | 'pdf';
  colorScheme: 'color' | 'grayscale' | 'custom';
  typography: {
    fontFamily: string;
    fontSize: number;
    titleSize: number;
  };
  publicationReady: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export class StatisticalChartsLibrary {
  private defaultConfig: VisualizationConfig = {
    width: 800,
    height: 600,
    dpi: 300,
    format: 'svg',
    colorScheme: 'color',
    typography: {
      fontFamily: 'Times New Roman',
      fontSize: 12,
      titleSize: 14
    },
    publicationReady: true
  };

  /**
   * Create scree plot for factor analysis
   */
  createScreePlot(
    eigenvalues: number[],
    config: Partial<VisualizationConfig> = {}
  ): HTMLCanvasElement {
    const finalConfig = { ...this.defaultConfig, ...config };
    const canvas = document.createElement('canvas');
    canvas.width = finalConfig.width;
    canvas.height = finalConfig.height;

    const ctx = canvas.getContext('2d')!;
    
    const chartData: ChartData = {
      labels: eigenvalues.map((_, i) => `Factor ${i + 1}`),
      datasets: [
        {
          label: 'Eigenvalues',
          data: eigenvalues,
          borderColor: finalConfig.colorScheme === 'grayscale' ? '#000000' : '#2563eb',
          backgroundColor: finalConfig.colorScheme === 'grayscale' ? '#666666' : '#3b82f6',
          borderWidth: 2
        },
        {
          label: 'Kaiser Criterion',
          data: new Array(eigenvalues.length).fill(1),
          borderColor: '#dc2626',
          borderWidth: 2,
          borderDash: [5, 5] as any,
          pointRadius: 0
        } as any
      ]
    };

    new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Scree Plot',
            font: {
              family: finalConfig.typography.fontFamily,
              size: finalConfig.typography.titleSize
            }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Factor Number',
              font: {
                family: finalConfig.typography.fontFamily,
                size: finalConfig.typography.fontSize
              }
            }
          },
          y: {
            title: {
              display: true,
              text: 'Eigenvalue',
              font: {
                family: finalConfig.typography.fontFamily,
                size: finalConfig.typography.fontSize
              }
            },
            beginAtZero: true
          }
        }
      }
    });

    return canvas;
  }

  /**
   * Create factor loading heatmap
   */
  createFactorLoadingHeatmap(
    loadings: number[][],
    variables: string[],
    factors: string[],
    config: Partial<VisualizationConfig> = {}
  ): SVGElement {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    const margin = { top: 50, right: 100, bottom: 100, left: 150 };
    const width = finalConfig.width - margin.left - margin.right;
    const height = finalConfig.height - margin.top - margin.bottom;

    const svg = d3.create('svg')
      .attr('width', finalConfig.width)
      .attr('height', finalConfig.height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(factors)
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleBand()
      .domain(variables)
      .range([0, height])
      .padding(0.1);

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([-1, 1]);

    // Create heatmap cells
    const cells = g.selectAll('.cell')
      .data(loadings.flatMap((row, i) => 
        row.map((value, j) => ({
          variable: variables[i],
          factor: factors[j],
          value: value,
          x: j,
          y: i
        }))
      ))
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.factor)!)
      .attr('y', d => yScale(d.variable)!)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => finalConfig.colorScheme === 'grayscale' 
        ? d3.scaleSequential(d3.interpolateGreys).domain([-1, 1])(Math.abs(d.value))
        : colorScale(d.value))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Add text labels
    g.selectAll('.cell-text')
      .data(loadings.flatMap((row, i) => 
        row.map((value, j) => ({
          variable: variables[i],
          factor: factors[j],
          value: value,
          x: j,
          y: i
        }))
      ))
      .enter()
      .append('text')
      .attr('class', 'cell-text')
      .attr('x', d => xScale(d.factor)! + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.variable)! + yScale.bandwidth() / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-family', finalConfig.typography.fontFamily)
      .attr('font-size', finalConfig.typography.fontSize)
      .attr('fill', d => Math.abs(d.value) > 0.5 ? 'white' : 'black')
      .text(d => d.value.toFixed(2));

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('font-family', finalConfig.typography.fontFamily)
      .attr('font-size', finalConfig.typography.fontSize);

    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .attr('font-family', finalConfig.typography.fontFamily)
      .attr('font-size', finalConfig.typography.fontSize);

    // Add title
    svg.append('text')
      .attr('x', finalConfig.width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-family', finalConfig.typography.fontFamily)
      .attr('font-size', finalConfig.typography.titleSize)
      .attr('font-weight', 'bold')
      .text('Factor Loading Matrix');

    return svg.node()!;
  }

  /**
   * Create correlation heatmap with significance indicators
   */
  createCorrelationHeatmap(
    correlations: number[][],
    variables: string[],
    significance: number[][],
    config: Partial<VisualizationConfig> = {}
  ): SVGElement {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    const margin = { top: 50, right: 100, bottom: 100, left: 150 };
    const width = finalConfig.width - margin.left - margin.right;
    const height = finalConfig.height - margin.top - margin.bottom;

    const svg = d3.create('svg')
      .attr('width', finalConfig.width)
      .attr('height', finalConfig.height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const scale = d3.scaleBand()
      .domain(variables)
      .range([0, Math.min(width, height)])
      .padding(0.1);

    const colorScale = d3.scaleSequential(d3.interpolateRdBu)
      .domain([-1, 1]);

    // Create correlation matrix cells
    const cells = g.selectAll('.corr-cell')
      .data(correlations.flatMap((row, i) => 
        row.map((value, j) => ({
          var1: variables[i],
          var2: variables[j],
          correlation: value,
          pValue: significance[i][j],
          x: j,
          y: i
        }))
      ))
      .enter()
      .append('rect')
      .attr('class', 'corr-cell')
      .attr('x', d => scale(d.var2)!)
      .attr('y', d => scale(d.var1)!)
      .attr('width', scale.bandwidth())
      .attr('height', scale.bandwidth())
      .attr('fill', d => finalConfig.colorScheme === 'grayscale' 
        ? d3.scaleSequential(d3.interpolateGreys).domain([0, 1])(Math.abs(d.correlation))
        : colorScale(d.correlation))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1);

    // Add correlation values and significance stars
    g.selectAll('.corr-text')
      .data(correlations.flatMap((row, i) => 
        row.map((value, j) => ({
          var1: variables[i],
          var2: variables[j],
          correlation: value,
          pValue: significance[i][j],
          x: j,
          y: i
        }))
      ))
      .enter()
      .append('text')
      .attr('class', 'corr-text')
      .attr('x', d => scale(d.var2)! + scale.bandwidth() / 2)
      .attr('y', d => scale(d.var1)! + scale.bandwidth() / 2 - 5)
      .attr('text-anchor', 'middle')
      .attr('font-family', finalConfig.typography.fontFamily)
      .attr('font-size', finalConfig.typography.fontSize)
      .attr('fill', d => Math.abs(d.correlation) > 0.5 ? 'white' : 'black')
      .text(d => d.correlation.toFixed(2));

    // Add significance stars
    g.selectAll('.sig-text')
      .data(correlations.flatMap((row, i) => 
        row.map((value, j) => ({
          var1: variables[i],
          var2: variables[j],
          correlation: value,
          pValue: significance[i][j],
          x: j,
          y: i
        }))
      ))
      .enter()
      .append('text')
      .attr('class', 'sig-text')
      .attr('x', d => scale(d.var2)! + scale.bandwidth() / 2)
      .attr('y', d => scale(d.var1)! + scale.bandwidth() / 2 + 10)
      .attr('text-anchor', 'middle')
      .attr('font-family', finalConfig.typography.fontFamily)
      .attr('font-size', finalConfig.typography.fontSize - 2)
      .attr('fill', d => Math.abs(d.correlation) > 0.5 ? 'white' : 'black')
      .text(d => {
        if (d.pValue < 0.001) return '***';
        if (d.pValue < 0.01) return '**';
        if (d.pValue < 0.05) return '*';
        return '';
      });

    return svg.node()!;
  }

  /**
   * Create SEM path diagram
   */
  createSEMPathDiagram(
    model: any,
    estimates: any[],
    config: Partial<VisualizationConfig> = {}
  ): SVGElement {
    const finalConfig = { ...this.defaultConfig, ...config };
    
    const svg = d3.create('svg')
      .attr('width', finalConfig.width)
      .attr('height', finalConfig.height);

    // This would be a complex implementation for SEM path diagrams
    // For now, create a placeholder
    svg.append('text')
      .attr('x', finalConfig.width / 2)
      .attr('y', finalConfig.height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-family', finalConfig.typography.fontFamily)
      .attr('font-size', finalConfig.typography.titleSize)
      .text('SEM Path Diagram (Implementation in progress)');

    return svg.node()!;
  }
}
export class PublicationChartsLibrary {
  private publicationStyles = {
    apa: {
      fontFamily: 'Times New Roman',
      fontSize: 12,
      titleSize: 14,
      colorScheme: 'grayscale',
      lineWidth: 1.5
    },
    nature: {
      fontFamily: 'Arial',
      fontSize: 8,
      titleSize: 10,
      colorScheme: 'color',
      lineWidth: 1
    },
    ieee: {
      fontFamily: 'Times New Roman',
      fontSize: 10,
      titleSize: 12,
      colorScheme: 'color',
      lineWidth: 1.2
    }
  };

  /**
   * Export chart as high-DPI image
   */
  async exportChart(
    element: HTMLCanvasElement | SVGElement,
    format: 'png' | 'svg' | 'pdf',
    dpi: number = 300
  ): Promise<Blob> {
    if (format === 'svg' && element instanceof SVGElement) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(element);
      return new Blob([svgString], { type: 'image/svg+xml' });
    }

    if (format === 'png') {
      const canvas = element instanceof HTMLCanvasElement 
        ? element 
        : await this.svgToCanvas(element as SVGElement, dpi);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/png');
      });
    }

    if (format === 'pdf') {
      // PDF export would require additional library like jsPDF
      throw new Error('PDF export requires additional implementation');
    }

    throw new Error(`Unsupported format: ${format}`);
  }

  private async svgToCanvas(svg: SVGElement, dpi: number): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    return new Promise((resolve) => {
      img.onload = () => {
        const scaleFactor = dpi / 96; // 96 DPI is default
        canvas.width = img.width * scaleFactor;
        canvas.height = img.height * scaleFactor;
        
        ctx.scale(scaleFactor, scaleFactor);
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    });
  }

  /**
   * Apply publication style to chart configuration
   */
  applyPublicationStyle(
    config: VisualizationConfig,
    style: 'apa' | 'nature' | 'ieee'
  ): VisualizationConfig {
    const styleConfig = this.publicationStyles[style];
    
    return {
      ...config,
      typography: {
        ...config.typography,
        ...styleConfig
      },
      colorScheme: styleConfig.colorScheme as any,
      publicationReady: true,
      dpi: 300
    };
  }

  /**
   * Create publication-ready figure with caption
   */
  createFigureWithCaption(
    chart: HTMLCanvasElement | SVGElement,
    caption: string,
    figureNumber: number,
    style: 'apa' | 'nature' | 'ieee' = 'apa'
  ): HTMLDivElement {
    const figure = document.createElement('div');
    figure.className = 'publication-figure';
    figure.style.textAlign = 'center';
    figure.style.marginBottom = '20px';

    // Add chart
    figure.appendChild(chart);

    // Add caption
    const captionElement = document.createElement('p');
    captionElement.className = 'figure-caption';
    captionElement.style.fontFamily = this.publicationStyles[style].fontFamily;
    captionElement.style.fontSize = `${this.publicationStyles[style].fontSize}px`;
    captionElement.style.marginTop = '10px';
    captionElement.style.textAlign = 'left';
    captionElement.innerHTML = `<strong>Figure ${figureNumber}.</strong> ${caption}`;

    figure.appendChild(captionElement);

    return figure;
  }
}

export class InteractiveChartsLibrary {
  /**
   * Create interactive chart with zoom and hover
   */
  createInteractiveScatterPlot(
    data: Array<{x: number, y: number, label: string}>,
    config: Partial<VisualizationConfig> = {}
  ): HTMLDivElement {
    const container = document.createElement('div');
    container.style.width = `${config.width || 800}px`;
    container.style.height = `${config.height || 600}px`;

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = (config.width || 800) - margin.left - margin.right;
    const height = (config.height || 600) - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
      .attr('width', config.width || 800)
      .attr('height', config.height || 600);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x) as [number, number])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y) as [number, number])
      .range([height, 0]);

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        const { transform } = event;
        
        g.selectAll('.data-point')
          .attr('transform', transform);
        
        (g.select('.x-axis') as any)
          .call(d3.axisBottom(transform.rescaleX(xScale)));
        
        (g.select('.y-axis') as any)
          .call(d3.axisLeft(transform.rescaleY(yScale)));
      });

    svg.call(zoom);

    // Add axes
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Add data points
    const tooltip = d3.select(container)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0,0,0,0.8)')
      .style('color', 'white')
      .style('padding', '5px')
      .style('border-radius', '3px')
      .style('font-size', '12px');

    g.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 4)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 1)
      .on('mouseover', (event, d) => {
        tooltip.style('visibility', 'visible')
          .text(`${d.label}: (${d.x.toFixed(2)}, ${d.y.toFixed(2)})`);
      })
      .on('mousemove', (event) => {
        tooltip.style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      });

    return container;
  }

  /**
   * Create interactive correlation matrix
   */
  createInteractiveCorrelationMatrix(
    correlations: number[][],
    variables: string[],
    config: Partial<VisualizationConfig> = {}
  ): HTMLDivElement {
    const container = document.createElement('div');
    container.style.position = 'relative';

    // Create the base heatmap
    const chartsLib = new StatisticalChartsLibrary();
    const heatmap = chartsLib.createCorrelationHeatmap(
      correlations, 
      variables, 
      correlations.map(row => row.map(() => 0.05)), // Mock significance
      config
    );

    container.appendChild(heatmap);

    // Add interactivity
    const tooltip = document.createElement('div');
    tooltip.style.position = 'absolute';
    tooltip.style.visibility = 'hidden';
    tooltip.style.background = 'rgba(0,0,0,0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '3px';
    tooltip.style.fontSize = '12px';
    tooltip.style.pointerEvents = 'none';
    container.appendChild(tooltip);

    // Add hover events to cells
    d3.select(heatmap)
      .selectAll('.corr-cell')
      .on('mouseover', function(event, d: any) {
        d3.select(this).attr('stroke-width', 3);
        tooltip.style.visibility = 'visible';
        tooltip.innerHTML = `${d.var1} × ${d.var2}<br/>r = ${d.correlation.toFixed(3)}`;
      })
      .on('mousemove', (event) => {
        tooltip.style.top = (event.pageY - 10) + 'px';
        tooltip.style.left = (event.pageX + 10) + 'px';
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke-width', 1);
        tooltip.style.visibility = 'hidden';
      });

    return container;
  }
}