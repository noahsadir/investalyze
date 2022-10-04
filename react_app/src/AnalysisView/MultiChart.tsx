/**
 * MultiChart.tsx
 *
 * Does most of the heavy lifting for generating data visualizations.
 *
 * TODO
 * ------
 * - Light mode
 * - Surface plots
 * - Proper display of dates
 */

import React from 'react';
import '../App.css';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(...registerables);

const colors: string[] = [
  '#666ad1',
  '#48a999',
  '#fff263',
  '#ff5f52',
  '#ae52d4',
  '#5eb8ff',
  '#99d066',
  '#ffad42',
  '#ff7d47',
  '#fa5788',
  '#8559da',
  '#63a4ff',
  '#56c8d8',
  '#6abf69',
  '#e4e65e',
  '#ffd149',
];

/**
 * Required input format for chart data.
 * Each property represents a series, with the key being the display name,
 * and the value being an array of [x, y] arrays representing
 * all the points to plot for that series.
 */
export interface MultiChartData {
  [key: string]: [any, any][];
}

/**
 * Main chart object
 */
export function MultiChart(props: any) {

  const chartData: any = formatChartData(props.data, props.chartType);

  // configuration for chartjs object
  const chartJSOptions: any = {
    legend: {
      labels: {
        color: '#ffffff',
      },
      display: true,
    },
    responsive: true,
    maintainAspectRatio: false,
    animations: null,
    scales: {
      y: {
        type: 'linear',
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#00000000'
        }
      },
      x: {
        type: (props.chartType == "line") ? (props.usesDate ? 'time' : 'linear') : 'category',
        time: (props.usesDate) ? {
          unit: 'month'
        } : null,
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: '#00000000'
        }
      }
    }
  };

  // Generate chart series based on the generated data point
  var datasets: any[] = [];
  for (var key in chartData) {
    if (key != "labels") {
      datasets.push({
        label: key,
        pointRadius: 2,
        fill: false,
        backgroundColor: colors[datasets.length % colors.length],
        borderColor: colors[datasets.length % colors.length],
        data: chartData[key],
        showLine: true
      });
    }
  }

  // Determine what type of chart object to use depending on type specified
  const chart: any = (props.chartType == "bar") ? (
    <Bar
      style={{flexGrow: 0, flexBasis: 0, width: '100%', height: '100%'}}
      datasetIdKey='id'
      data={{
        labels: chartData.labels,
        datasets: datasets
      }}
      options={chartJSOptions}
    />
  ) : (
    <Scatter
      style={{flexGrow: 0, flexBasis: 0, width: '100%', height: '100%'}}
      datasetIdKey='id'
      data={{
        datasets: datasets
      }}
      options={chartJSOptions}
    />
  );

  // Most chart libraries are a royal PITA to implement in a responsive layout
  // However, this mess of nested divs seems to do the job w/o involving JS
  return (
    <div style={props.style}>
      <div style={{flex: "1 0 0", display: "flex", flexFlow: "column"}}>
        <div style={{flex: "1 0 0"}}/>
        <p style={{display: "block", writingMode: "vertical-rl",textAlign:"center",margin:0,padding:0,paddingBottom:24}}>{props.yAxisLabel}</p>
        <div style={{flex: "1 0 0"}}/>
      </div>
      <div style={{overflow: "hidden", display: "flex", flexFlow: "column", flex: "100 0 0"}}>
        <div style={{flex: "1 0 0"}}/>
        <div style={{flex: "100 0 0", overflow: "hidden", borderRadius: 8}}>
          {chart}
        </div>
        <p style={{display: "block", margin:0,padding:0,textAlign:"center",height:24,lineHeight:"24px"}}>{props.xAxisLabel}</p>
        <div style={{flex: "1 0 0"}}/>
      </div>
      <div style={{flex: "1 0 0"}}/>
    </div>
  );
}

/**
 * Format data in such a way that is accepted by charts
 */
function formatChartData(filteredData: MultiChartData, chartType: string) {

  var newData: any = {};
  var didAddLabels: boolean = false;

  for (var series in filteredData) {
    var newSeriesPoints: any[] = [];

    // For each series (calls, puts), generate a set of points to be plotted
    for (var pointInd in filteredData[series]) {
      if (chartType == "line") {
        newSeriesPoints.push({x: filteredData[series][pointInd][0], y: filteredData[series][pointInd][1]});
      } else if (chartType == "bar") {
        if (!didAddLabels) {
          if (newData.labels == null) {
            newData.labels = [];
          }
          newData.labels.push(filteredData[series][pointInd][0]);
        }
        newSeriesPoints.push(filteredData[series][pointInd][1]);
      }
    }

    // Each set of points should be added as a property of the result object
    didAddLabels = true;
    newData[series] = newSeriesPoints;
  }

  return newData;
}
