import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import {
  Activity, AlertTriangle, BatteryCharging, Bell, Boxes, Building2, CalendarClock,
  ChevronRight, CircleDollarSign, CloudSun, Cpu, Factory, Gauge, Leaf, Network,
  RadioTower, RefreshCw, Settings2, ShieldCheck, Sun, Waves, Wind, Zap,
  type LucideIcon,
} from "lucide-react";
import { EnergyChart } from "@/components/EnergyChart";
import energyBackground from "@/assets/vpp-energy-background.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "VPP Nexus｜虚拟电厂智慧运营平台" },
    { name: "description", content: "聚合能源监控、资源调度、市场交易、负荷预测与安全运维的一体化虚拟电厂平台。" },
    { property: "og:title", content: "VPP Nexus｜虚拟电厂智慧运营平台" },
    { property: "og:description", content: "聚合能源监控、资源调度、市场交易、负荷预测与安全运维的一体化虚拟电厂平台。" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const menus = [
  { id: "overview", label: "态势总览", icon: Gauge },
  { id: "assets", label: "资源聚合", icon: Network },
  { id: "dispatch", label: "智能调度", icon: Zap },
  { id: "market", label: "电力交易", icon: CircleDollarSign },
  { id: "forecast", label: "负荷预测", icon: Activity },
  { id: "security", label: "安全运维", icon: ShieldCheck },
] as const;
type PageId = (typeof menus)[number]["id"];

const c = (name: string) => typeof window === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const palette = () => [c("--chart-cyan"), c("--chart-blue"), c("--chart-green"), c("--chart-amber"), c("--chart-pink")];
const base = () => ({
  color: palette(),
  textStyle: { color: c("--chart-text"), fontFamily: "Noto Sans SC" },
  tooltip: { trigger: "axis" as const, backgroundColor: c("--panel-strong"), borderColor: c("--chart-cyan"), textStyle: { color: c("--foreground") } },
  grid: { left: 44, right: 20, top: 48, bottom: 34 },
  xAxis: { axisLine: { lineStyle: { color: c("--chart-grid") } }, axisLabel: { color: c("--chart-text") } },
  yAxis: { splitLine: { lineStyle: { color: c("--chart-grid") } }, axisLabel: { color: c("--chart-text") } },
});

const lineOption = (title = "实时出力趋势", forecast = false): EChartsOption => ({ ...base(),
  legend: { top: 10, right: 12, textStyle: { color: c("--chart-text") } },
  grid: { left: 44, right: 20, top: 62, bottom: 34 },
  xAxis: { type: "category", data: ["00", "04", "08", "12", "16", "20", "24"], boundaryGap: false },
  yAxis: { type: "value", name: "MW" },
  series: [
    { name: title, type: "line", smooth: true, symbol: "circle", symbolSize: 7, areaStyle: { opacity: .2 }, data: [286, 272, 345, 516, 638, 582, 421] },
    ...(forecast ? [{ name: "预测区间", type: "line" as const, smooth: true, lineStyle: { type: "dashed" as const }, data: [290, 281, 351, 498, 622, 590, 438] }] : []),
  ],
});
const barOption = (horizontal = false): EChartsOption => ({ ...base(),
  xAxis: horizontal ? { type: "value" } : { type: "category", data: ["光伏", "风电", "储能", "充电桩", "可调负荷"] },
  yAxis: horizontal ? { type: "category", data: ["浦东", "临港", "松江", "嘉定", "青浦"] } : { type: "value" },
  series: [{ type: "bar", barWidth: 14, data: [368, 284, 196, 142, 228], itemStyle: { borderRadius: 4 } }],
});
const pieOption = (ring = true): EChartsOption => ({ color: palette(), tooltip: { trigger: "item" },
  legend: { bottom: 0, textStyle: { color: c("--chart-text") } },
  series: [{ type: "pie", radius: ring ? ["48%", "70%"] : ["0%", "70%"], center: ["50%", "44%"], label: { color: c("--foreground"), formatter: "{d}%" }, data: [
    { value: 38, name: "光伏" }, { value: 26, name: "风电" }, { value: 18, name: "储能" }, { value: 10, name: "充电桩" }, { value: 8, name: "柔性负荷" },
  ] }],
});
const radarOption = (): EChartsOption => ({ color: palette(),
  radar: { radius: "66%", splitNumber: 4, axisName: { color: c("--chart-text") }, splitLine: { lineStyle: { color: c("--chart-grid") } }, splitArea: { areaStyle: { color: ["transparent"] } }, indicator: [
    { name: "响应速度", max: 100 }, { name: "调节精度", max: 100 }, { name: "可用容量", max: 100 }, { name: "执行率", max: 100 }, { name: "经济性", max: 100 }, { name: "稳定性", max: 100 },
  ] }, series: [{ type: "radar", areaStyle: { opacity: .24 }, data: [{ value: [92, 88, 76, 95, 82, 90] }] }],
});

function Panel({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return <section className={`energy-card rounded-lg p-4 ${className}`}><div className="mb-3 flex items-start justify-between"><div><h2 className="text-sm font-semibold text-foreground">{title}</h2>{subtitle && <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>}</div><span className="mt-1 h-1.5 w-1.5 rounded-full bg-energy-cyan shadow-[0_0_12px_currentColor]" /></div>{children}</section>;
}

function Stat({ icon: Icon, label, value, unit, trend, tone = "cyan" }: { icon: LucideIcon; label: string; value: string; unit: string; trend: string; tone?: "cyan" | "green" | "amber" | "blue" }) {
  const tones = { cyan: "text-energy-cyan bg-energy-cyan/10", green: "text-energy-green bg-energy-green/10", amber: "text-energy-amber bg-energy-amber/10", blue: "text-energy-blue bg-energy-blue/10" };
  return <div className="energy-card rounded-lg p-4"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">{label}</span><span className={`grid h-8 w-8 place-items-center rounded-md ${tones[tone]}`}><Icon size={17} /></span></div><div className="mt-3 flex items-baseline gap-1"><strong className="text-2xl font-semibold text-foreground">{value}</strong><span className="text-xs text-muted-foreground">{unit}</span></div><div className="mt-2 text-[11px] text-energy-green">{trend}</div></div>;
}

const Status = ({ state = "运行中" }: { state?: string }) => <span className="inline-flex items-center gap-1.5 text-[11px] text-energy-green"><i className="status-pulse h-1.5 w-1.5 rounded-full bg-energy-green" />{state}</span>;

function Overview() {
  return <div className="space-y-4"><div className="grid grid-cols-4 gap-4"><Stat icon={Zap} label="聚合可调容量" value="1,286.4" unit="MW" trend="▲ 12.6% 较昨日"/><Stat icon={Activity} label="实时调度功率" value="842.7" unit="MW" trend="▲ 8.2% 计划达成" tone="blue"/><Stat icon={BatteryCharging} label="储能可用容量" value="318.6" unit="MWh" trend="SOC 78.4%" tone="green"/><Stat icon={Leaf} label="今日减碳量" value="2,461" unit="tCO₂" trend="▲ 16.8% 环比" tone="amber"/></div>
    <div className="grid grid-cols-[1.7fr_1fr] gap-4"><Panel title="全网聚合功率曲线" subtitle="日前计划 / 实时出力 / 基线负荷"><EnergyChart option={lineOption("实时出力", true)} className="h-72" /></Panel><Panel title="资源结构" subtitle="接入资源容量占比"><EnergyChart option={pieOption()} className="h-72" /></Panel></div>
    <div className="grid grid-cols-[1.15fr_1fr_1fr] gap-4"><PlantMap/><Panel title="区域响应排行"><EnergyChart option={barOption(true)} className="h-52" /></Panel><AlarmList/></div></div>;
}

function PlantMap() { return <Panel title="资源在线态势" subtitle="长三角 · 2,846 个资源点"><div className="relative h-52 overflow-hidden rounded-md bg-primary/5 grid-overlay"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--energy-blue),transparent_64%)] opacity-15"/>{[[18,35],[36,58],[51,28],[67,49],[81,30],[73,72],[29,78]].map(([x,y],i)=><div key={i} className="absolute" style={{left:`${x}%`,top:`${y}%`}}><span className="status-pulse block h-2.5 w-2.5 rounded-full bg-energy-cyan shadow-[0_0_14px_currentColor]"/></div>)}<div className="absolute bottom-3 left-3 flex gap-4 text-[10px] text-muted-foreground"><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-energy-cyan"/>正常 2,802</span><span><i className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-energy-amber"/>告警 44</span></div></div></Panel> }
function AlarmList() { return <Panel title="实时告警" subtitle="近 30 分钟"><div className="space-y-3">{[["临港储能站 SOC偏低","02:04","amber"],["嘉定光伏逆变器离线","01:58","cyan"],["浦东负荷响应偏差","01:42","amber"],["青浦风机通信恢复","01:26","green"]].map(([t,time,tone],i)=><div key={i} className="flex items-center gap-3 border-b border-border/60 pb-2.5 last:border-0"><span className={`h-2 w-2 rounded-full bg-energy-${tone}`}/><div className="min-w-0 flex-1 text-xs text-foreground">{t}</div><time className="text-[10px] text-muted-foreground">{time}</time></div>)}</div></Panel> }

const assets = [{n:"临港储能电站",t:"储能",p:"120.0 MW",s:"运行中",r:"99.8%"},{n:"东海风电集群",t:"风电",p:"286.4 MW",s:"运行中",r:"98.6%"},{n:"嘉定分布式光伏",t:"光伏",p:"196.8 MW",s:"运行中",r:"99.2%"},{n:"浦东充电网络",t:"充电桩",p:"88.5 MW",s:"调节中",r:"97.9%"},{n:"松江工业负荷",t:"可调负荷",p:"142.3 MW",s:"待命",r:"96.8%"}];
function Assets() { return <div className="grid grid-cols-[280px_1fr] gap-4"><div className="space-y-4"><Panel title="资源池概览"><div className="space-y-5 py-2">{[["已接入资源","2,846"],["在线资源","2,802"],["聚合容量","1,286 MW"],["今日新增","+18"]].map(([l,v],i)=><div className="flex items-end justify-between border-b border-border/60 pb-3" key={l}><span className="text-xs text-muted-foreground">{l}</span><b className={`text-xl ${i===3?"text-energy-green":"text-foreground"}`}>{v}</b></div>)}</div></Panel><Panel title="资源能力画像"><EnergyChart option={radarOption()} className="h-64"/></Panel></div><div className="space-y-4"><div className="grid grid-cols-3 gap-4"><Stat icon={Sun} label="新能源装机" value="652.8" unit="MW" trend="50.7% 占比"/><Stat icon={BatteryCharging} label="储能资源" value="318.6" unit="MWh" trend="充放电效率 94.2%" tone="green"/><Stat icon={Factory} label="柔性负荷" value="228.3" unit="MW" trend="今日可调 4.2h" tone="amber"/></div><Panel title="聚合资源清单" subtitle="资源运行状态与可用率"><DataTable rows={assets}/></Panel><div className="grid grid-cols-2 gap-4"><Panel title="资源类型容量"><EnergyChart option={barOption()} className="h-52"/></Panel><Panel title="接入趋势"><EnergyChart option={lineOption("累计接入容量")} className="h-52"/></Panel></div></div></div> }

function Dispatch() { return <div className="grid grid-cols-[1.3fr_.7fr] gap-4"><div className="space-y-4"><Panel title="智能调度控制台" subtitle="AI 滚动优化 · 15分钟粒度"><div className="grid grid-cols-3 gap-3">{[["当前指令","削峰 168 MW"],["执行进度","82.6%"],["剩余时间","00:38:26"]].map(([l,v])=><div key={l} className="rounded-md border border-border bg-primary/5 p-3"><span className="text-[11px] text-muted-foreground">{l}</span><div className="mt-2 text-lg font-semibold text-energy-cyan">{v}</div></div>)}</div><EnergyChart option={lineOption("调度指令",true)} className="h-72"/></Panel><div className="grid grid-cols-2 gap-4"><Panel title="调节能力雷达"><EnergyChart option={radarOption()} className="h-60"/></Panel><Panel title="分区调度负荷"><EnergyChart option={barOption()} className="h-60"/></Panel></div></div><div className="space-y-4"><Panel title="执行队列" subtitle="优先级自动编排"><div className="space-y-3">{["临港储能站 放电 +60MW","松江工业负荷 下调 -42MW","浦东充电网络 延迟 -26MW","嘉定光伏集群 增发 +18MW"].map((x,i)=><div key={x} className="flex gap-3 rounded-md border border-border bg-primary/5 p-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded bg-energy-cyan/10 text-xs text-energy-cyan">0{i+1}</span><div className="flex-1"><div className="text-xs text-foreground">{x}</div><div className="mt-2 h-1 overflow-hidden rounded bg-muted"><div className="h-full bg-energy-cyan" style={{width:`${90-i*13}%`}}/></div></div></div>)}</div></Panel><Panel title="调度效益"><div className="py-4 text-center"><div className="text-4xl font-semibold text-energy-green">¥ 86,420</div><p className="mt-2 text-xs text-muted-foreground">本次调度预计收益</p></div><div className="grid grid-cols-2 gap-3 text-center"><div className="border-r border-border"><b className="text-lg">96.8%</b><p className="text-[10px] text-muted-foreground">执行准确率</p></div><div><b className="text-lg">18.6min</b><p className="text-[10px] text-muted-foreground">平均响应</p></div></div></Panel><AlarmList/></div></div> }

function Market() { return <div className="space-y-4"><div className="grid grid-cols-[1.5fr_1fr] gap-4"><Panel title="实时电力市场" subtitle="上海现货 · 价格每5分钟更新"><div className="flex items-end gap-3"><b className="text-4xl text-energy-amber">¥ 486.32</b><span className="mb-1 text-xs text-muted-foreground">/ MWh</span><span className="mb-1 text-xs text-energy-green">▲ 3.26%</span></div><EnergyChart option={lineOption("现货电价",true)} className="h-72"/></Panel><div className="grid grid-cols-2 gap-4"><Stat icon={CircleDollarSign} label="今日交易额" value="328.6" unit="万元" trend="▲ 18.6%" tone="amber"/><Stat icon={Zap} label="成交电量" value="6,824" unit="MWh" trend="达成率 98.2%"/><Stat icon={CalendarClock} label="中长期合约" value="42" unit="份" trend="本月待履约 8份" tone="blue"/><Stat icon={Leaf} label="绿证收益" value="68.4" unit="万元" trend="▲ 12.4%" tone="green"/></div></div><div className="grid grid-cols-[.8fr_1.2fr] gap-4"><Panel title="收益构成"><EnergyChart option={pieOption(false)} className="h-64"/></Panel><Panel title="交易执行明细"><DataTable rows={[{n:"日前市场 / 09-23",t:"卖出",p:"1,820 MWh",s:"已成交",r:"¥492.6"},{n:"实时市场 / 09-23",t:"买入",p:"380 MWh",s:"执行中",r:"¥468.2"},{n:"辅助服务 / 调频",t:"申报",p:"86 MW",s:"已中标",r:"¥128.5"},{n:"绿证交易 / GEC",t:"卖出",p:"2,400张",s:"已成交",r:"¥12.8"}]}/></Panel></div></div> }

function Forecast() { return <div className="space-y-4"><div className="flex items-center justify-between"><div><h1 className="text-xl font-semibold">AI 负荷预测中心</h1><p className="mt-1 text-xs text-muted-foreground">气象、节假日、历史负荷多因子融合预测</p></div><div className="flex gap-2">{["超短期","日前","周前"].map((x,i)=><span key={x} className={`rounded-md border px-4 py-2 text-xs ${i===0?"border-energy-cyan bg-energy-cyan/10 text-energy-cyan":"border-border text-muted-foreground"}`}>{x}</span>)}</div></div><Panel title="未来24小时负荷预测" subtitle="置信区间 95% · 模型 MAPE 2.16%"><EnergyChart option={lineOption("预测负荷",true)} className="h-80"/></Panel><div className="grid grid-cols-4 gap-4"><Stat icon={CloudSun} label="今日天气" value="27" unit="℃ 多云" trend="湿度 68%"/><Stat icon={Waves} label="预测峰值" value="986" unit="MW" trend="预计 18:30" tone="amber"/><Stat icon={Activity} label="预测精度" value="97.84" unit="%" trend="优于行业基线" tone="green"/><Stat icon={Cpu} label="模型状态" value="12" unit="模型" trend="刚刚完成训练" tone="blue"/></div><div className="grid grid-cols-2 gap-4"><Panel title="气象敏感度分析"><EnergyChart option={radarOption()} className="h-56"/></Panel><Panel title="分区峰值预测"><EnergyChart option={barOption()} className="h-56"/></Panel></div></div> }

function Security() { return <div className="grid grid-cols-[.72fr_1.28fr] gap-4"><div className="space-y-4"><Panel title="系统健康评分"><div className="relative grid h-56 place-items-center"><div className="absolute h-40 w-40 rounded-full border-[14px] border-energy-green/20 border-t-energy-green border-r-energy-cyan"/><div className="text-center"><b className="text-5xl text-energy-green">96</b><p className="mt-1 text-xs text-muted-foreground">运行优秀</p></div></div><div className="grid grid-cols-3 text-center">{[["99.98%","可用率"],["42ms","时延"],["0","高危"]].map(([v,l])=><div key={l}><b className="text-sm">{v}</b><p className="text-[10px] text-muted-foreground">{l}</p></div>)}</div></Panel><Panel title="安全能力矩阵"><EnergyChart option={radarOption()} className="h-64"/></Panel></div><div className="space-y-4"><div className="grid grid-cols-3 gap-4"><Stat icon={RadioTower} label="在线设备" value="12,486" unit="台" trend="在线率 99.6%"/><Stat icon={AlertTriangle} label="待处理告警" value="18" unit="项" trend="高优先级 2项" tone="amber"/><Stat icon={ShieldCheck} label="今日拦截" value="2,861" unit="次" trend="威胁已全部阻断" tone="green"/></div><Panel title="站点运行监控" subtitle="关键系统与通信链路状态"><DataTable rows={[{n:"核心调度引擎",t:"计算集群",p:"CPU 42%",s:"运行中",r:"99.99%"},{n:"资源通信网关",t:"通信系统",p:"8,426连接",s:"运行中",r:"99.97%"},{n:"市场交易接口",t:"业务系统",p:"18ms",s:"运行中",r:"99.95%"},{n:"预测模型服务",t:"AI服务",p:"12实例",s:"运行中",r:"99.92%"},{n:"备用控制中心",t:"容灾系统",p:"热备",s:"待命",r:"100%"}]}/></Panel><div className="grid grid-cols-2 gap-4"><Panel title="告警趋势"><EnergyChart option={lineOption("告警数量")} className="h-52"/></Panel><AlarmList/></div></div></div> }

function DataTable({ rows }: { rows: {n:string;t:string;p:string;s:string;r:string}[] }) { return <div className="overflow-hidden"><table className="w-full text-left"><thead><tr className="border-b border-border text-[10px] uppercase text-muted-foreground"><th className="py-3 font-medium">资源 / 任务</th><th className="font-medium">类型</th><th className="font-medium">容量 / 指标</th><th className="font-medium">状态</th><th className="text-right font-medium">可用率 / 价格</th></tr></thead><tbody>{rows.map((x)=><tr key={x.n} className="border-b border-border/50 text-xs last:border-0"><td className="py-3.5 font-medium text-foreground">{x.n}</td><td className="text-muted-foreground">{x.t}</td><td className="text-energy-cyan">{x.p}</td><td><Status state={x.s}/></td><td className="text-right text-foreground">{x.r}</td></tr>)}</tbody></table></div> }

function Index() {
  const [page,setPage]=useState<PageId>("overview");
  const content=useMemo(()=>({overview:<Overview/>,assets:<Assets/>,dispatch:<Dispatch/>,market:<Market/>,forecast:<Forecast/>,security:<Security/>})[page],[page]);
  return <div className="min-h-screen bg-background text-foreground"><img src={energyBackground} alt="风光储一体化虚拟电厂" width={1920} height={1080} className="fixed inset-0 h-full w-full object-cover"/><div className="fixed inset-0 bg-background/64"/><div className="fixed inset-0 grid-overlay"/>
    <header className="glass-panel fixed inset-x-0 top-0 z-50 h-[76px] border-x-0 border-t-0"><nav className="relative mx-auto flex h-full max-w-[1720px] items-center justify-between px-7"><div className="flex gap-1">{menus.slice(0,3).map(m=><NavItem key={m.id} item={m} active={page===m.id} onClick={()=>setPage(m.id)}/>)}</div><div className="absolute left-1/2 -translate-x-1/2 text-center"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-md border border-energy-cyan/50 bg-energy-cyan/10 text-energy-cyan shadow-[0_0_18px_currentColor]"><Zap size={21}/></span><div><h1 className="text-xl font-semibold tracking-[0.18em]">VPP NEXUS 虚拟电厂</h1><p className="mt-0.5 text-[9px] tracking-[0.28em] text-energy-cyan">VIRTUAL POWER PLANT OPERATION CENTER</p></div></div></div><div className="flex gap-1">{menus.slice(3).map(m=><NavItem key={m.id} item={m} active={page===m.id} onClick={()=>setPage(m.id)}/>)}</div></nav></header>
    <main className="relative z-10 mx-auto max-w-[1720px] px-7 pb-7 pt-[98px]"><div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 size={14}/><span>华东运营中心</span><ChevronRight size={12}/><span className="text-foreground">{menus.find(m=>m.id===page)?.label}</span></div><div className="flex items-center gap-4 text-[11px] text-muted-foreground"><Status state="全网运行正常"/><span>2026-09-23 10:06:28</span><RefreshCw size={14} className="text-energy-cyan"/><Bell size={15}/><Settings2 size={15}/></div></div>{content}</main></div>;
}
function NavItem({item,active,onClick}:{item:(typeof menus)[number];active:boolean;onClick:()=>void}) { const Icon=item.icon; return <button onClick={onClick} className={`flex h-11 min-w-[116px] items-center justify-center gap-2 border-b-2 px-3 text-xs transition-colors ${active?"border-energy-cyan bg-energy-cyan/10 text-energy-cyan":"border-transparent text-muted-foreground hover:bg-primary/5 hover:text-foreground"}`}><Icon size={16}/><span>{item.label}</span></button> }