import { Component, createRef } from "react";
import * as echarts from "echarts";
import type { ECharts, EChartsOption } from "echarts";

type EnergyChartProps = { option: EChartsOption; className?: string };

export class EnergyChart extends Component<EnergyChartProps> {
  private readonly containerRef = createRef<HTMLDivElement>();
  private chart: ECharts | undefined;
  private observer: ResizeObserver | undefined;

  override componentDidMount() {
    const container = this.containerRef.current;
    if (!container) return;

    this.chart = echarts.init(container, undefined, { renderer: "canvas" });
    this.chart.setOption(this.props.option, { notMerge: true });
    this.observer = new ResizeObserver(() => this.chart?.resize());
    this.observer.observe(container);
  }

  override componentDidUpdate(previousProps: EnergyChartProps) {
    if (previousProps.option !== this.props.option) {
      this.chart?.setOption(this.props.option, { notMerge: true });
    }
  }

  override componentWillUnmount() {
    this.observer?.disconnect();
    this.chart?.dispose();
    this.chart = undefined;
    this.observer = undefined;
  }

  override render() {
    const { className = "h-64" } = this.props;
    return <div ref={this.containerRef} className={`w-full ${className}`} role="img" aria-label="能源数据图表" />;
  }
}